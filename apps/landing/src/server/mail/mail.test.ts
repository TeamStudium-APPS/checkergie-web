import assert from "node:assert/strict";
import { test } from "node:test";
import nodemailer, { type SendMailOptions } from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

import { renderLaunchEmail, validateEmailAddress } from "./launch-email";
import { createLaunchMailer, getMailConfig } from "./smtp";

const environment = {
  SMTP_HOST: "smtp.example.com",
  SMTP_PORT: "465",
  SMTP_USER: "smtp-login-id",
  SMTP_PASS: "test-password",
  MAIL_FROM_ADDRESS: "sender@example.com",
  MAIL_SERVICE_URL: "https://example.com/open?source=email&campaign=launch",
};

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
  for (const recipient of ["a@example.com,b@example.com", "a@example.com\r\nBcc: b@example.com", "Name <a@example.com>", "invalid"]) {
    assert.throws(() => validateEmailAddress(recipient));
  }
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

test("단일 수신자에게 HTML·텍스트를 함께 보내고 SMTP 거절을 실패로 처리한다", async (context) => {
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
    assert.deepEqual(await mailer.send("recipient@example.com"), { messageId: "test-message" });
    const options = createTransport.mock.calls[0].arguments[0] as SMTPTransport.Options;
    assert.equal(options.secure, true);
    assert.equal(options.requireTLS, true);
    const message = sentMessages[0];
    assert.deepEqual(message.to, { address: "recipient@example.com", name: "" });
    assert.equal(typeof message.html, "string");
    assert.equal(typeof message.text, "string");
    shouldReject = true;
    await assert.rejects(mailer.send("recipient@example.com"), /승인하지/);
    await assert.rejects(mailer.send("a@example.com,b@example.com"));
    assert.equal(sendMail.mock.callCount(), 2);
  } finally {
    mailer.close();
    context.mock.restoreAll();
  }
  assert.equal(close.mock.callCount(), 1);
});
