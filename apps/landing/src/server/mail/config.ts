import "server-only";

import { z } from "zod";
import { emailSchema } from "@checkergie/api";
import { mailLimitSchema, mailServiceUrlSchema, mailTemplateOptionsSchema } from "./schemas";

export type MailEnvironment = Record<string, string | undefined>;

const setting = z.string().trim().min(1).regex(/^[^\r\n]+$/);
const optionalEmailSetting = z.string().trim()
  .pipe(emailSchema.or(z.literal("").transform(() => undefined))).optional();
export const mailEnvironmentSchema = z.object({
  SMTP_HOST: setting,
  SMTP_PORT: z.coerce.number().pipe(z.union([z.literal(465), z.literal(587)])).default(465),
  SMTP_USER: setting,
  // 비밀번호는 공백도 유효한 값일 수 있어 trim하지 않는다.
  SMTP_PASS: z.string().min(1),
  MAIL_FROM_ADDRESS: optionalEmailSetting,
  MAIL_CONTACT_EMAIL: optionalEmailSetting,
  MAIL_SERVICE_URL: mailServiceUrlSchema,
}).superRefine((env, context) => {
  if (!env.MAIL_FROM_ADDRESS && !emailSchema.safeParse(env.SMTP_USER).success) {
    context.addIssue({ code: "custom", path: ["MAIL_FROM_ADDRESS"], message: "발신 이메일 주소가 필요합니다." });
  }
}).transform((env) => {
  const fromAddress = env.MAIL_FROM_ADDRESS ?? env.SMTP_USER;
  return {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    password: env.SMTP_PASS,
    from: { name: "체커기", address: fromAddress },
    contactEmail: env.MAIL_CONTACT_EMAIL ?? fromAddress,
    serviceUrl: env.MAIL_SERVICE_URL,
  };
});

// 예약 시각은 미래도 허용하고, 실제 실행 시 현재 시각과 비교한다.
export const mailLaunchScheduleSchema = z.object({
  MAIL_LAUNCH_AT: z.iso.datetime({ offset: true }).or(z.literal("").transform(() => undefined)).optional(),
  MAIL_LAUNCH_BATCH_SIZE: mailLimitSchema.default(10),
});

export const mailWorkerSecretSchema = z.string().min(32).regex(/^[\x21-\x7e]+$/);
export const mailPolicySchema = z.object({
  MAIL_MAX_ATTEMPTS: z.coerce.number().int().min(1).max(10).default(3),
  MAIL_RETRY_DELAY_SECONDS: z.coerce.number().int().min(60).max(86_400).default(600),
  MAIL_LEASE_SECONDS: z.coerce.number().int().min(120).max(3600).default(300),
});
export const getMailPolicy = () => mailPolicySchema.parse(process.env);

export const getMailConfig = (env: MailEnvironment = process.env) => mailEnvironmentSchema.parse(env);

export const getMailPreviewConfig = (env: MailEnvironment = process.env) => mailTemplateOptionsSchema.parse({
  serviceUrl: env.MAIL_SERVICE_URL?.trim() || "https://example.com/checkergie",
  contactEmail: env.MAIL_CONTACT_EMAIL?.trim() || env.MAIL_FROM_ADDRESS?.trim() || "hello@example.com",
});
