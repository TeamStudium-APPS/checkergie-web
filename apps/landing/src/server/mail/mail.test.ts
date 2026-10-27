import assert from "node:assert/strict";
import { test } from "node:test";
import { mailDeliveryStatusSchema } from "@checkergie/api";
import nodemailer, { type SendMailOptions } from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

import { renderLaunchEmail, validateEmailAddress } from "./launch-email";
import { createLaunchMailer, createMailer, getMailConfig, getMailPreviewConfig, MailDeliveryError } from "./smtp";

const environment = {
  SMTP_HOST: "smtp.example.com",
  SMTP_PORT: "465",
  SMTP_USER: "smtp-login-id",
  SMTP_PASS: "test-password",
  MAIL_FROM_ADDRESS: "sender@example.com",
  MAIL_SERVICE_URL: "https://example.com/open?source=email&campaign=launch",
};

test("신청 확인 발송은 전용 본문과 발신 도메인의 추적 ID를 사용한다", async (context) => {
  const messages: SendMailOptions[] = [];
  context.mock.method(nodemailer, "createTransport", () => ({
    verify: async () => true,
    sendMail: async (message: SendMailOptions) => {
      messages.push(message);
      return { messageId: message.messageId, accepted: ["recipient@example.com"], rejected: [] };
    },
    close: () => {},
  }));
  const mailer = createMailer("welcome", environment);
  const jobId = "11111111-1111-4111-8111-111111111111";
  try {
    await mailer.send("recipient@example.com", jobId);
    assert.equal(messages[0].messageId, `<${jobId}@example.com>`);
    assert.match(String(messages[0].subject), /신청이 완료/);
    assert.match(String(messages[0].text), /오픈하면/);
    await assert.rejects(mailer.send("recipient@example.com", "bad\r\nBcc: x@example.com"));
    assert.equal(messages.length, 1);
  } finally {
    mailer.close();
    context.mock.restoreAll();
  }
});

test("HTML과 텍스트에 서비스 주소·문의·수신 거부 안내를 포함한다", () => {
  const email = renderLaunchEmail({ serviceUrl: environment.MAIL_SERVICE_URL, contactEmail: "help@example.com" });
  assert.match(email.html, /source=email&amp;campaign=launch/);
  assert.ok(email.text.includes(environment.MAIL_SERVICE_URL));
  assert.match(email.html, /lang="ko"/);
  assert.match(email.html, /수신 거부/);
  assert.match(email.text, /개인정보 삭제/);
  assert.doesNotMatch(email.html, /<script|<form|<iframe|var\(--/);
});

test("HTML 속성에 들어가는 외부 값을 이스케이프한다", () => {
  const email = renderLaunchEmail({ serviceUrl: "https://example.com/?q='hello'", contactEmail: "o'connor@example.com" });
  assert.match(email.html, /o&#39;connor/);
  assert.doesNotMatch(email.html, /mailto:o'connor/);
});

test("실행 가능한 URL·HTTP 주소·인증 정보가 들어간 URL을 거부한다", () => {
  for (const serviceUrl of ["javascript:alert(1)", "http://example.com", "https://user:pass@example.com"]) {
    assert.throws(() => renderLaunchEmail({ serviceUrl, contactEmail: "help@example.com" }));
  }
});

test("수신자 여러 명과 헤더 삽입을 거부한다", () => {
  for (const recipient of ["a@example.com,b@example.com", "a@example.com\r\nBcc: b@example.com", "Name <a@example.com>", "a?b@example.com", "a#b@example.com", "invalid"]) {
    assert.throws(() => validateEmailAddress(recipient));
  }
});

test("미리보기 문의 주소는 실제 발송과 같이 발신 주소를 기본값으로 사용한다", () => {
  const preview = getMailPreviewConfig(environment);
  const config = getMailConfig(environment);
  assert.equal(preview.contactEmail, config.contactEmail);
  assert.equal(preview.serviceUrl, config.serviceUrl);
});

test("SMTP 설정은 런타임에 검증하고 TLS 포트만 허용한다", () => {
  assert.throws(() => getMailConfig({}), /SMTP_USER/);
  assert.throws(() => getMailConfig({ ...environment, SMTP_PORT: "25" }), /SMTP_PORT/);
  const config = getMailConfig(environment);
  assert.equal(config.user, environment.SMTP_USER);
  assert.equal(config.from.address, environment.MAIL_FROM_ADDRESS);
  assert.equal(config.contactEmail, environment.MAIL_FROM_ADDRESS);
  assert.equal(getMailConfig({ ...environment, SMTP_PORT: "587" }).port, 587);
});

test("단일 수신자에게 HTML·텍스트를 함께 보내고 SMTP 거절을 not_sent로 처리한다", async (context) => {
  let shouldReject = false;
  const sentMessages: SendMailOptions[] = [];
  const sendMail = context.mock.fn(async (message: SendMailOptions) => {
    sentMessages.push(message);
    return {
      messageId: "test-message",
      accepted: shouldReject ? [] : ["recipient@example.com"],
      rejected: shouldReject ? ["recipient@example.com"] : [],
    };
  });
  const close = context.mock.fn();
  const createTransport = context.mock.method(nodemailer, "createTransport", () => ({
    verify: async () => true,
    sendMail,
    close,
  }));
  const mailer = createLaunchMailer(environment);
  try {
    await mailer.verify();
    assert.deepEqual(await mailer.send("recipient@example.com"), {
      status: mailDeliveryStatusSchema.enum.sent,
      messageId: "test-message",
    });
    const options = createTransport.mock.calls[0].arguments[0] as SMTPTransport.Options;
    assert.equal(options.secure, true);
    assert.equal(options.requireTLS, true);
    const message = sentMessages[0];
    assert.deepEqual(message.to, { address: "recipient@example.com", name: "" });
    assert.equal(typeof message.html, "string");
    assert.equal(typeof message.text, "string");
    shouldReject = true;
    await assert.rejects(
      mailer.send("recipient@example.com"),
      (error: unknown) => error instanceof MailDeliveryError
        && error.deliveryStatus === mailDeliveryStatusSchema.enum.not_sent,
    );
    await assert.rejects(mailer.send("a@example.com,b@example.com"));
    assert.equal(sendMail.mock.callCount(), 2);
  } finally {
    mailer.close();
    context.mock.restoreAll();
  }
  assert.equal(close.mock.callCount(), 1);
});

test("SMTP 실패를 not_sent와 uncertain으로 구분한다", async (context) => {
  let verifyError: Error | undefined;
  let sendError: Error | undefined;
  const createTransport = context.mock.method(nodemailer, "createTransport", () => ({
    verify: async () => {
      if (verifyError) throw verifyError;
      return true;
    },
    sendMail: async () => {
      if (sendError) throw sendError;
      return { messageId: "test-message", accepted: ["recipient@example.com"], rejected: [] };
    },
    close: context.mock.fn(),
  }));
  const mailer = createLaunchMailer(environment);

  verifyError = Object.assign(new Error("authentication failed"), { code: "EAUTH" });
  await assert.rejects(
    mailer.verify(),
    (error: unknown) => error instanceof MailDeliveryError
      && error.deliveryStatus === mailDeliveryStatusSchema.enum.not_sent,
  );

  verifyError = undefined;
  await mailer.verify();
  sendError = Object.assign(new Error("recipient rejected"), { code: "EENVELOPE", responseCode: 550 });
  await assert.rejects(
    mailer.send("recipient@example.com"),
    (error: unknown) => error instanceof MailDeliveryError
      && error.deliveryStatus === mailDeliveryStatusSchema.enum.not_sent,
  );

  sendError = Object.assign(new Error("socket timeout"), { code: "ETIMEDOUT" });
  await assert.rejects(
    mailer.send("recipient@example.com"),
    (error: unknown) => error instanceof MailDeliveryError
      && error.deliveryStatus === mailDeliveryStatusSchema.enum.uncertain,
  );

  context.mock.restoreAll();
  assert.equal(createTransport.mock.callCount(), 1);
});

test("일시적 4xx만 재시도하고 5xx·설정 오류·결과 불명을 구분한다", async (context) => {
  let failure: unknown;
  context.mock.method(nodemailer, "createTransport", () => ({
    verify: async () => true,
    sendMail: async () => { throw failure; },
    close: () => {},
  }));
  const mailer = createMailer("welcome", environment);
  try {
    for (const scenario of [
      { error: { responseCode: 451 }, status: "not_sent", retryable: true, code: "SMTP_TRANSIENT" },
      { error: { responseCode: 550 }, status: "not_sent", retryable: false, code: "SMTP_REJECTED" },
      { error: { code: "EAUTH" }, status: "not_sent", retryable: false, code: "SMTP_CONFIGURATION" },
      { error: { code: "ETIMEDOUT" }, status: "uncertain", retryable: false, code: "SMTP_UNCERTAIN" },
      { error: null, status: "uncertain", retryable: false, code: "SMTP_UNCERTAIN" },
    ]) {
      failure = scenario.error;
      await assert.rejects(mailer.send("recipient@example.com"), (error: unknown) => {
        assert.ok(error instanceof MailDeliveryError);
        assert.equal(error.deliveryStatus, scenario.status);
        assert.equal(error.retryable, scenario.retryable);
        assert.equal(error.code, scenario.code);
        return true;
      });
    }
  } finally {
    mailer.close();
    context.mock.restoreAll();
  }
});
