import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { POST as runWorker } from "../../app/api/internal/mail/route";
import type { DatabaseSql } from "../database";
import { createWaitlistStore } from "../waitlist/neon-store";
import { deliverMail } from "./deliver";
import { createMailOutbox } from "./neon-outbox";
import { enqueueLaunchMail, getMailSummary, resolveUncertainMail, retryFailedMail, suppressMail } from "./operations";
import { MailDeliveryError } from "./errors";
import { processScheduledLaunchMail } from "./scheduled-launch";
import { renderWelcomeEmail } from "./welcome-email";

const mailer = (send: (email: string, messageId?: string) => Promise<{ status: "sent"; messageId: string }>) => ({
  verify: async () => {}, send, close: () => {},
});
const accepted = async () => ({ status: "sent" as const, messageId: "smtp-message" });

test("신청 확인 메일에 오픈 전 안내·문의·수신 거부를 HTML과 텍스트로 제공한다", () => {
  const message = renderWelcomeEmail({ serviceUrl: "https://example.com/?a=1&b=2", contactEmail: "o'connor@example.com" });
  assert.match(message.subject, /신청이 완료/);
  assert.match(message.html, /a=1&amp;b=2/);
  assert.match(message.html, /o&#39;connor/);
  assert.match(message.text, /오픈하면/);
  assert.match(message.text, /직접 신청하지/);
  assert.match(message.html, /수신 거부/);
  assert.doesNotMatch(message.html, /<script|<iframe/);
});

test("복구 API는 비밀이 없거나 잘못된 요청을 DB·SMTP 호출 전에 거부한다", async () => {
  const previous = process.env.MAIL_WORKER_SECRET;
  try {
    delete process.env.MAIL_WORKER_SECRET;
    assert.equal((await runWorker(new Request("https://example.com/api/internal/mail", { method: "POST" }))).status, 503);
    process.env.MAIL_WORKER_SECRET = "a".repeat(32);
    for (const authorization of ["", "Bearer wrong", `Bearer ${"b".repeat(32)}`, `Bearer ${"é".repeat(32)}`]) {
      assert.equal((await runWorker(new Request("https://example.com/api/internal/mail", { method: "POST", headers: { authorization } }))).status, 401);
    }
  } finally {
    if (previous === undefined) delete process.env.MAIL_WORKER_SECRET;
    else process.env.MAIL_WORKER_SECRET = previous;
  }
});

test("PostgreSQL에서 등록·발송·복구 흐름을 검증한다", async (context) => {
  const db = new PGlite();
  const sql: DatabaseSql = async (strings, ...parameters) => {
    const query = strings.reduce((text, part, index) => text + (index ? `$${index}` : "") + part, "");
    return (await db.query<Record<string, unknown>>(query, parameters)).rows;
  };
  const connect = () => sql;
  const store = createWaitlistStore(connect);
  const outbox = createMailOutbox(connect);
  const subscribe = (email: string) => store.subscribe(email, "2026-10-01");
  const reset = () => db.exec("TRUNCATE waitlist, mail_outbox, mail_suppressions CASCADE");
  try {
    await db.exec(await readFile(new URL("../waitlist/schema.sql", import.meta.url), "utf8"));
    await db.exec("INSERT INTO waitlist (email, policy_version) VALUES ('old@example.com', 'old')");
    await db.exec(await readFile(new URL("./migrations/001-mail-outbox.sql", import.meta.url), "utf8"));
    assert.equal((await db.query("SELECT * FROM waitlist")).rows.length, 1);
    assert.equal((await db.query("SELECT * FROM mail_outbox")).rows.length, 0);

    await context.test("등록·확인 메일 생성은 원자적이고 중복 등록은 메일을 추가하지 않는다", async () => {
      await reset();
      assert.deepEqual(await subscribe(" A@EXAMPLE.COM "), { created: true });
      assert.deepEqual(await subscribe("a@example.com"), { created: false });
      assert.equal((await db.query("SELECT * FROM mail_outbox")).rows.length, 1);
      await db.exec("ALTER TABLE mail_outbox ADD CONSTRAINT test_failure CHECK (email <> 'fail@example.com')");
      await assert.rejects(subscribe("fail@example.com"));
      assert.equal((await db.query("SELECT * FROM waitlist WHERE email = 'fail@example.com'")).rows.length, 0);
      await db.exec("ALTER TABLE mail_outbox DROP CONSTRAINT test_failure");
    });

    await context.test("동시에 실행한 발송 작업은 같은 메일을 선점하지 않는다", async () => {
      await reset();
      await subscribe("a@example.com");
      await subscribe("b@example.com");
      const jobs = await Promise.all([outbox.claim("welcome"), outbox.claim("welcome"), outbox.claim("welcome")]);
      assert.equal(new Set(jobs.filter(Boolean).map((job) => job?.id)).size, 2);
      assert.equal(jobs.filter(Boolean).length, 2);
    });

    await context.test("특정 신청자에게만 발송하고 SMTP 성공은 재실행해도 재발송하지 않는다", async () => {
      await reset();
      await subscribe("a@example.com");
      await subscribe("b@example.com");
      const recipients: string[] = [];
      const createTransport = () => mailer(async (email, messageId) => {
        recipients.push(email);
        assert.match(messageId ?? "", /^[0-9a-f-]{36}$/);
        return accepted();
      });
      const options = { kind: "welcome" as const, recipient: "a@example.com", limit: 1, outbox, createTransport };
      assert.deepEqual(await deliverMail(options), { sent: 1, not_sent: 0, uncertain: 0 });
      assert.deepEqual(await deliverMail(options), { sent: 0, not_sent: 0, uncertain: 0 });
      assert.deepEqual(recipients, ["a@example.com"]);
    });

    await context.test("거절만 지연 재시도하며 3회 이후 멈춘다", async () => {
      await reset();
      await subscribe("a@example.com");
      const createTransport = () => mailer(async () => { throw new MailDeliveryError("not_sent", true, "SMTP_TRANSIENT"); });
      for (let attempt = 0; attempt < 3; attempt += 1) {
        assert.equal((await deliverMail({ kind: "welcome", limit: 10, outbox, createTransport })).not_sent, 1);
        assert.equal(await outbox.claim("welcome"), null);
        await db.exec("UPDATE mail_outbox SET available_at = now() - interval '1 minute'");
      }
      assert.equal(await outbox.claim("welcome"), null);
      assert.equal(await retryFailedMail("welcome", connect), 1);
      assert.ok(await outbox.claim("welcome"));
    });

    await context.test("영구 거절은 시간이 지나도 자동 재시도하지 않고 운영자 재처리만 허용한다", async () => {
      await reset();
      await subscribe("a@example.com");
      const createTransport = () => mailer(async () => { throw new MailDeliveryError("not_sent", false, "SMTP_REJECTED"); });
      assert.equal((await deliverMail({ kind: "welcome", limit: 3, outbox, createTransport })).not_sent, 1);
      await db.exec("UPDATE mail_outbox SET available_at = now() - interval '1 hour'");
      assert.equal(await outbox.claim("welcome"), null);
      const summary = await getMailSummary("welcome", new Date().toISOString(), connect);
      assert.deepEqual(summary.failures, [{ code: "SMTP_REJECTED", count: 1 }]);
      assert.equal(await retryFailedMail("welcome", connect), 1);
      assert.ok(await outbox.claim("welcome"));
    });

    await context.test("SMTP 결과 불명은 자동 재시도하지 않고 명시적으로 복구한다", async () => {
      await reset();
      await subscribe("a@example.com");
      const createTransport = () => mailer(async () => { throw new Error("unknown SMTP failure"); });
      assert.equal((await deliverMail({ kind: "welcome", limit: 3, outbox, createTransport })).uncertain, 1);
      assert.equal(await outbox.claim("welcome"), null);
      assert.equal(await retryFailedMail("welcome", connect), 0);
      const summary = await getMailSummary("welcome", new Date().toISOString(), connect);
      assert.equal(summary.uncertainIds.length, 1);
      await resolveUncertainMail(summary.uncertainIds[0], "not_sent", connect);
      assert.ok(await outbox.claim("welcome"));
    });

    await context.test("종료된 실행의 작업은 미확인으로 격리하고 오래된 실행의 결과 기록을 거부한다", async () => {
      await reset();
      await subscribe("a@example.com");
      const job = await outbox.claim("welcome");
      assert.ok(job);
      await db.exec("UPDATE mail_outbox SET locked_at = now() - interval '6 minutes'");
      assert.equal(await outbox.claim("welcome"), null);
      await assert.rejects(outbox.complete(job, { status: "sent", messageId: "old-result" }));
      assert.equal((await db.query<{ status: string }>("SELECT status FROM mail_outbox")).rows[0].status, "uncertain");
    });

    await context.test("오픈 알림은 마감 시각·수신 거부를 반영하며 반복 실행해도 중복 생성하지 않는다", async () => {
      await reset();
      for (const email of ["a@example.com", "b@example.com", "new@example.com"]) await subscribe(email);
      await suppressMail("b@example.com", connect);
      await db.exec("UPDATE waitlist SET created_at = now() + interval '1 day' WHERE email = 'new@example.com'");
      const before = new Date().toISOString();
      assert.equal(await enqueueLaunchMail(before, connect), 1);
      assert.equal(await enqueueLaunchMail(before, connect), 0);
      const job = await outbox.claim("launch");
      assert.equal(job?.email, "a@example.com");
      assert.equal(await outbox.claim("launch"), null);
      await suppressMail("a@example.com", connect);
      assert.equal((await outbox.claim("welcome"))?.email, "new@example.com");
      assert.equal(await outbox.claim("welcome"), null);
      await db.exec("DELETE FROM waitlist WHERE email = 'a@example.com'");
      assert.equal((await db.query("SELECT * FROM mail_outbox WHERE email = 'a@example.com'")).rows.length, 0);
    });

    await context.test("예약 시각 이후 대상만 생성하고 반복 실행해도 오픈 알림을 중복 발송하지 않는다", async () => {
      await reset();
      for (const email of ["before@example.com", "after@example.com"]) await subscribe(email);
      const cutoff = new Date(Date.now() - 1000).toISOString();
      await db.exec("UPDATE waitlist SET created_at = now() - interval '1 day' WHERE email = 'before@example.com'");
      const recipients: string[] = [];
      const dependencies = {
        enqueue: (before: string) => enqueueLaunchMail(before, connect),
        deliver: (limit: number) => deliverMail({
          kind: "launch", limit, outbox,
          createTransport: () => mailer(async (email) => { recipients.push(email); return accepted(); }),
        }),
      };
      const environment = { MAIL_LAUNCH_AT: cutoff };
      assert.equal((await processScheduledLaunchMail(environment, dependencies)).sent, 1);
      assert.equal((await processScheduledLaunchMail(environment, dependencies)).sent, 0);
      assert.deepEqual(recipients, ["before@example.com"]);
    });

    await context.test("실행 시간 예산을 소진하면 다음 작업을 선점하지 않는다", async () => {
      await reset();
      await subscribe("a@example.com");
      assert.deepEqual(await deliverMail({
        kind: "welcome", limit: 10, timeBudgetMs: 0, outbox, createTransport: () => mailer(accepted),
      }), { sent: 0, not_sent: 0, uncertain: 0 });
      assert.ok(await outbox.claim("welcome"));
    });

    await context.test("SMTP 검증 실패는 작업을 소모하지 않고 연결을 닫는다", async () => {
      await reset();
      await subscribe("a@example.com");
      let closed = false;
      const createTransport = () => ({
        ...mailer(accepted),
        verify: async () => { throw new MailDeliveryError("not_sent"); },
        close: () => { closed = true; },
      });
      await assert.rejects(deliverMail({ kind: "welcome", limit: 1, outbox, createTransport }));
      assert.ok(closed);
      assert.ok(await outbox.claim("welcome"));
    });

    await context.test("SMTP 성공 후 DB 결과 기록이 실패하면 다음 작업 전송을 중단한다", async () => {
      await reset();
      await subscribe("a@example.com");
      await subscribe("b@example.com");
      let sent = 0;
      const createTransport = () => mailer(async () => { sent += 1; return accepted(); });
      await assert.rejects(deliverMail({
        kind: "welcome", limit: 10, createTransport,
        outbox: { ...outbox, complete: async () => { throw new Error("DB unavailable"); } },
      }));
      assert.equal(sent, 1);
    });
  } finally {
    await db.close();
  }
});
