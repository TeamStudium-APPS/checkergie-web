import assert from "node:assert/strict";
import { test } from "node:test";
import { POST } from "../../app/api/internal/mail/launch/route";
import { processScheduledLaunchMail } from "./scheduled-launch";

const launchAt = "2026-01-02T12:00:00+09:00";
const launchTime = Date.parse(launchAt);

test("오픈 시각 미설정·빈 값·오픈 전에는 DB·SMTP에 접근하지 않는다", async () => {
  let calls = 0;
  const dependencies = {
    now: () => launchTime - 1,
    enqueue: async () => { calls += 1; return 1; },
    deliver: async () => { calls += 1; return { sent: 1, not_sent: 0, uncertain: 0 }; },
  };
  for (const environment of [{}, { MAIL_LAUNCH_AT: "" }, { MAIL_LAUNCH_AT: launchAt }]) {
    assert.deepEqual(await processScheduledLaunchMail(environment, dependencies), { sent: 0, not_sent: 0, uncertain: 0 });
  }
  assert.equal(calls, 0);
});

test("오픈 시각과 이후 실행은 같은 예약 시각을 대상 마감으로 사용한다", async () => {
  const cutoffs: string[] = [];
  let sent = 0;
  for (const now of [launchTime, launchTime + 86_400_000]) {
    assert.deepEqual(await processScheduledLaunchMail({ MAIL_LAUNCH_AT: launchAt }, {
      now: () => now,
      enqueue: async (before) => { cutoffs.push(before); return 1; },
      deliver: async () => { sent += 1; return { sent: 1, not_sent: 0, uncertain: 0 }; },
    }), { sent: 1, not_sent: 0, uncertain: 0 });
  }
  assert.deepEqual(cutoffs, [launchAt, launchAt]);
  assert.equal(sent, 2);
});

test("잘못된 예약 날짜·시간대 누락은 발송 전에 거부한다", async () => {
  let sent = false;
  for (const value of ["2026-02-31T12:00:00+09:00", "2026-01-02T12:00:00", "invalid"]) {
    await assert.rejects(processScheduledLaunchMail({ MAIL_LAUNCH_AT: value }, {
      deliver: async () => { sent = true; return { sent: 1, not_sent: 0, uncertain: 0 }; },
    }));
  }
  assert.equal(sent, false);
});

test("대상 저장이 실패하면 발송하지 않는다", async () => {
  let sent = false;
  await assert.rejects(processScheduledLaunchMail({ MAIL_LAUNCH_AT: launchAt }, {
    now: () => launchTime,
    enqueue: async () => { throw new Error("DB unavailable"); },
    deliver: async () => { sent = true; return { sent: 1, not_sent: 0, uncertain: 0 }; },
  }));
  assert.equal(sent, false);
});

test("예약 발송 경로도 인증 없이는 실행하지 않는다", async () => {
  const previous = process.env.MAIL_WORKER_SECRET;
  try {
    process.env.MAIL_WORKER_SECRET = "s".repeat(32);
    assert.equal((await POST(new Request("https://example.com/api/internal/mail/launch", { method: "POST" }))).status, 401);
  } finally {
    if (previous === undefined) delete process.env.MAIL_WORKER_SECRET;
    else process.env.MAIL_WORKER_SECRET = previous;
  }
});
