import assert from "node:assert/strict";
import { test } from "node:test";
import { parseQueueCommand, parseTestCommand } from "./commands";
import { formatMailError, MailDeliveryError, MailOperationError } from "./errors";
import {
  mailCutoffSchema, mailEnvironmentSchema, mailIdSchema, mailJobSchema, mailPolicySchema,
} from "./schemas";
import { createMailOutbox, enqueueLaunchMail } from "./neon-outbox";
import { createMailWorkerHandler } from "./worker";

const environment = {
  SMTP_HOST: "smtp.example.com", SMTP_USER: "smtp-user", SMTP_PASS: " keep spaces ",
  MAIL_FROM_ADDRESS: "sender@example.com", MAIL_SERVICE_URL: "https://example.com",
};

test("명령 스키마는 관련 옵션만 허용하고 종류별 필수 입력을 검증한다", () => {
  assert.deepEqual(parseQueueCommand([]), { command: "status", kind: "welcome", send: false });
  assert.deepEqual(parseQueueCommand(["process", "--limit", "2", "--kind", "launch", "--send"]), {
    command: "process", kind: "launch", send: true, limit: 2,
  });
  assert.deepEqual(parseTestCommand(["--to", " A@EXAMPLE.COM "]), { to: "a@example.com", kind: "launch", send: false });
  for (const args of [
    ["launch"], ["process", "--limit", "0"], ["process", "--limit", "101"],
    ["process", "--limit", "1.5"], ["process", "--kind", "other"], ["process", "--id", "bad"],
    ["resolve", "--status", "sent"], ["suppress"], ["status", "extra"], ["status", "--unknown"],
    ["resolve", "--id", "11111111-1111-4111-8111-111111111111", "--status", "processing"],
  ]) assert.throws(() => parseQueueCommand(args));
});

test("잘못된 실제 날짜·시간대 없는 마감·미래·UUID를 거부한다", () => {
  for (const date of ["2026-02-31T12:00:00+09:00", "2026-10-01T12:00:00", "2999-01-01T00:00:00Z"]) {
    assert.equal(mailCutoffSchema.safeParse(date).success, false);
  }
  assert.equal(mailCutoffSchema.safeParse("2026-01-01T00:00:00+09:00").success, true);
  assert.equal(mailIdSchema.safeParse("-".repeat(36)).success, false);
});

test("환경변수 검증은 기본값과 발신 주소 fallback을 적용하고 비밀번호 공백을 유지한다", () => {
  const config = mailEnvironmentSchema.parse(environment);
  assert.equal(config.port, 465);
  assert.equal(config.contactEmail, environment.MAIL_FROM_ADDRESS);
  assert.equal(config.password, " keep spaces ");
  assert.equal(mailEnvironmentSchema.parse({ ...environment, MAIL_CONTACT_EMAIL: " " }).contactEmail, environment.MAIL_FROM_ADDRESS);
  for (const patch of [{ SMTP_PORT: "25" }, { SMTP_HOST: "bad\r\nhost" }, { MAIL_SERVICE_URL: "http://example.com" }, { SMTP_PASS: "" }]) {
    assert.equal(mailEnvironmentSchema.safeParse({ ...environment, ...patch }).success, false);
  }
  assert.equal(mailEnvironmentSchema.parse({ ...environment, MAIL_FROM_ADDRESS: undefined, SMTP_USER: "user@example.com" }).from.address, "user@example.com");
  assert.equal(mailPolicySchema.parse({}).MAIL_MAX_ATTEMPTS, 3);
  assert.equal(mailPolicySchema.safeParse({ MAIL_LEASE_SECONDS: "1" }).success, false);
});

test("DB 작업은 타입 단언 대신 스키마로 잘못된 응답을 거부한다", () => {
  assert.equal(mailJobSchema.safeParse({ id: 1, email: "bad", kind: "other", claimToken: null }).success, false);
});

test("오류 설명은 입력 필드·안전한 오류 코드만 출력하고 비밀·원문을 숨긴다", () => {
  const secret = "secret-password-do-not-log";
  const invalid = mailEnvironmentSchema.safeParse({ ...environment, SMTP_PORT: secret });
  assert.equal(invalid.success, false);
  if (invalid.success) return;
  const message = formatMailError(invalid.error);
  assert.match(message, /VALIDATION_FAILED.*SMTP_PORT/);
  assert.ok(!message.includes(secret));
  assert.ok(!formatMailError(new Error(secret)).includes(secret));
  assert.match(formatMailError(new MailDeliveryError("not_sent", true, "SMTP_TRANSIENT")), /SMTP_TRANSIENT/);
  assert.match(formatMailError(new MailOperationError("DB_UNAVAILABLE")), /DB_UNAVAILABLE/);
});

test("인증된 복구 API는 성공·미접수 결과를 구분하고 잘못된 인증에는 실행하지 않는다", async () => {
  const previous = process.env.MAIL_WORKER_SECRET;
  process.env.MAIL_WORKER_SECRET = "s".repeat(32);
  let calls = 0;
  let shouldFail = false;
  const handler = createMailWorkerHandler(async () => {
    calls += 1;
    return { sent: shouldFail ? 0 : 1, not_sent: shouldFail ? 1 : 0, uncertain: 0 };
  });
  const request = () => new Request("https://example.com/api/internal/mail", {
    method: "POST", headers: { authorization: `Bearer ${process.env.MAIL_WORKER_SECRET}` },
  });
  try {
    assert.equal((await handler(new Request("https://example.com"))).status, 401);
    assert.equal(calls, 0);
    const success = await handler(request());
    assert.equal(success.status, 200);
    assert.equal(success.headers.get("cache-control"), "no-store");
    assert.deepEqual(await success.json(), { sent: 1, not_sent: 0, uncertain: 0 });
    shouldFail = true;
    assert.equal((await handler(request())).status, 503);
    assert.equal(calls, 2);
  } finally {
    if (previous === undefined) delete process.env.MAIL_WORKER_SECRET;
    else process.env.MAIL_WORKER_SECRET = previous;
  }
});


test("DB 접근 전 잘못된 마감을 거부하고 DB 장애·스키마 불일치를 구분한다", async () => {
  let calls = 0;
  const connect = () => async () => {
    calls += 1;
    return [{ id: 123, email: "invalid", kind: "other", claimToken: null }];
  };
  await assert.rejects(enqueueLaunchMail("2026-02-31T12:00:00Z", connect));
  assert.equal(calls, 0);
  await assert.rejects(createMailOutbox(connect).claim("welcome"), (error: unknown) => {
    assert.ok(error instanceof MailOperationError);
    assert.equal(error.code, "DB_RESULT_INVALID");
    return true;
  });
  const missingSchema = () => async () => { throw { code: "42P01", message: "private SQL and email" }; };
  await assert.rejects(createMailOutbox(missingSchema).claim("welcome"), (error: unknown) => {
    assert.ok(error instanceof MailOperationError);
    assert.equal(error.code, "DB_SCHEMA_MISMATCH");
    assert.ok(!formatMailError(error).includes("private SQL"));
    return true;
  });
});
