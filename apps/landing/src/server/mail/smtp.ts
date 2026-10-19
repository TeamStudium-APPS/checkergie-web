import "server-only";

import { mailDeliveryStatusSchema, type MailDeliveryStatus } from "@checkergie/api";
import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { renderLaunchEmail, validateEmailAddress, validateServiceUrl } from "./launch-email";

type Environment = Record<string, string | undefined>;
type SmtpError = Error & { code?: string; responseCode?: number };

type MailDeliveryFailureStatus = Exclude<MailDeliveryStatus, "sent">;

const MAIL_DELIVERY_STATUS = mailDeliveryStatusSchema.enum;

export class MailDeliveryError extends Error {
  constructor(public readonly deliveryStatus: MailDeliveryFailureStatus) {
    super("오픈 알림 메일 발송에 실패했습니다.");
    this.name = "MailDeliveryError";
  }
}

const PREVIEW_SERVICE_URL = "https://example.com/checkergie";
const PREVIEW_CONTACT_EMAIL = "hello@example.com";
const NOT_SENT_ERROR_CODES = new Set([
  "EAUTH",
  "ENOAUTH",
  "EDNS",
  "ETLS",
  "EREQUIRETLS",
  "ECONFIG",
  "EENVELOPE",
  "EMESSAGE",
]);

const classifySendFailure = (error: unknown): MailDeliveryFailureStatus => {
  if (!(error instanceof Error)) return MAIL_DELIVERY_STATUS.uncertain;
  const smtpError = error as SmtpError;
  if (typeof smtpError.responseCode === "number") return MAIL_DELIVERY_STATUS.not_sent;
  if (smtpError.code && NOT_SENT_ERROR_CODES.has(smtpError.code)) return MAIL_DELIVERY_STATUS.not_sent;
  return MAIL_DELIVERY_STATUS.uncertain;
};

const requireSetting = (env: Environment, name: string) => {
  const value = env[name]?.trim();
  if (!value) throw new Error(`${name} 환경변수가 필요합니다.`);
  if (/[\r\n]/.test(value)) throw new Error(`${name} 환경변수에 줄바꿈을 사용할 수 없습니다.`);
  return value;
};

export const getMailPreviewConfig = (env: Environment = process.env) => ({
  serviceUrl: validateServiceUrl(env.MAIL_SERVICE_URL?.trim() || PREVIEW_SERVICE_URL),
  contactEmail: validateEmailAddress(
    env.MAIL_CONTACT_EMAIL?.trim()
      || env.MAIL_FROM_ADDRESS?.trim()
      || PREVIEW_CONTACT_EMAIL,
  ),
});

export const getMailConfig = (env: Environment = process.env) => {
  const port = Number(env.SMTP_PORT ?? "465");
  if (port !== 465 && port !== 587) throw new Error("SMTP_PORT는 465 또는 587이어야 합니다.");
  const user = requireSetting(env, "SMTP_USER");
  const fromAddress = validateEmailAddress(env.MAIL_FROM_ADDRESS?.trim() || user);
  return {
    host: requireSetting(env, "SMTP_HOST"),
    port,
    user,
    password: requireSetting(env, "SMTP_PASS"),
    from: { name: "체커기", address: fromAddress },
    contactEmail: validateEmailAddress(env.MAIL_CONTACT_EMAIL?.trim() || fromAddress),
    serviceUrl: validateServiceUrl(requireSetting(env, "MAIL_SERVICE_URL")),
  };
};

export const createLaunchMailer = (env: Environment = process.env) => {
  const config = getMailConfig(env);
  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    requireTLS: true,
    auth: { user: config.user, pass: config.password },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 30_000,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
  const message = renderLaunchEmail(config);

  return {
    verify: async () => {
      try {
        await transport.verify();
      } catch {
        // verify는 본문을 전송하지 않으므로 실패해도 재발송에 따른 중복 위험이 없다.
        throw new MailDeliveryError(MAIL_DELIVERY_STATUS.not_sent);
      }
    },
    send: async (recipient: string) => {
      const to = validateEmailAddress(recipient);
      let result: SMTPTransport.SentMessageInfo;
      try {
        result = await transport.sendMail({
          from: config.from,
          to: { address: to, name: "" },
          replyTo: config.contactEmail,
          ...message,
        });
      } catch (error) {
        throw new MailDeliveryError(classifySendFailure(error));
      }
      if (result.accepted.length !== 1 || result.rejected.length > 0) {
        throw new MailDeliveryError(MAIL_DELIVERY_STATUS.not_sent);
      }
      // SMTP 접수 성공이며 최종 수신함 도착 여부를 의미하지 않는다.
      return { status: MAIL_DELIVERY_STATUS.sent, messageId: result.messageId };
    },
    close: () => transport.close(),
  };
};
