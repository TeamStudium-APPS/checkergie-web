import "server-only";

import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { z } from "zod";
import { mailDeliveryStatusSchema } from "@checkergie/api";
import { getMailConfig, type MailEnvironment } from "./config";
import { renderLaunchEmail } from "./launch-email";
import { MailDeliveryError } from "./errors";
import { mailIdSchema, mailRecipientSchema } from "./schemas";
import type { MailKind } from "./outbox";
import { renderWelcomeEmail } from "./welcome-email";

const MAIL_DELIVERY_STATUS = mailDeliveryStatusSchema.enum;

const smtpErrorSchema = z.object({
  code: z.string().optional(),
  responseCode: z.number().int().optional(),
});
const configurationErrorCodes = new Set(["EAUTH", "ENOAUTH", "EDNS", "ETLS", "EREQUIRETLS", "ECONFIG", "EENVELOPE", "EMESSAGE"]);

const classifySendFailure = (error: unknown) => {
  const parsed = smtpErrorSchema.safeParse(error);
  if (!parsed.success) return new MailDeliveryError("uncertain");
  const { code, responseCode } = parsed.data;
  if (responseCode && responseCode >= 400 && responseCode < 500) {
    return new MailDeliveryError("not_sent", true, "SMTP_TRANSIENT");
  }
  if (responseCode && responseCode >= 500 && responseCode < 600) {
    return new MailDeliveryError("not_sent", false, "SMTP_REJECTED");
  }
  if (code && configurationErrorCodes.has(code)) {
    return new MailDeliveryError("not_sent", false, "SMTP_CONFIGURATION");
  }
  return new MailDeliveryError("uncertain");
};

export const createMailer = (kind: MailKind, env: MailEnvironment = process.env) => {
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
  const message = kind === "welcome" ? renderWelcomeEmail(config) : renderLaunchEmail(config);

  return {
    verify: async () => {
      try {
        await transport.verify();
      } catch {
        // verify는 본문을 전송하지 않으므로 실패해도 재발송에 따른 중복 위험이 없다.
        throw new MailDeliveryError(MAIL_DELIVERY_STATUS.not_sent, false, "SMTP_CONFIGURATION");
      }
    },
    send: async (recipient: string, deliveryId?: string) => {
      const to = mailRecipientSchema.parse(recipient);
      if (deliveryId !== undefined) mailIdSchema.parse(deliveryId);
      let result: SMTPTransport.SentMessageInfo;
      try {
        result = await transport.sendMail({
          messageId: deliveryId ? `<${deliveryId}@${config.from.address.split("@")[1]}>` : undefined,
          from: config.from,
          to: { address: to, name: "" },
          replyTo: config.contactEmail,
          ...message,
        });
      } catch (error) {
        throw classifySendFailure(error);
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
