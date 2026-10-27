import { z } from "zod";
import { emailSchema, mailDeliveryStatusSchema, mailKindSchema } from "@checkergie/api";

export const mailRecipientSchema = z.string().trim().pipe(emailSchema).transform((email) => email.toLowerCase());
export const mailIdSchema = z.uuid();
export const mailLimitSchema = z.coerce.number().int().min(1).max(100);
export const mailTimeBudgetSchema = z.number().int().min(0).max(240_000);
export const mailCutoffSchema = z.iso.datetime({ offset: true })
  .refine((value) => Date.parse(value) <= Date.now(), "대상 마감 시각은 현재보다 미래일 수 없습니다.");
export const mailServiceUrlSchema = z.url().refine((value) => {
  const url = new URL(value);
  return url.protocol === "https:" && !url.username && !url.password;
}, "서비스 주소는 인증 정보가 없는 HTTPS 주소여야 합니다.").transform((value) => new URL(value).href);

export const mailTemplateOptionsSchema = z.object({
  serviceUrl: mailServiceUrlSchema,
  contactEmail: z.string().trim().pipe(emailSchema),
});
export type MailTemplateOptions = z.infer<typeof mailTemplateOptionsSchema>;

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

export const mailQueueStatusSchema = z.enum(["pending", "processing", ...mailDeliveryStatusSchema.options]);
export const mailJobSchema = z.object({
  id: mailIdSchema,
  email: mailRecipientSchema,
  kind: mailKindSchema,
  claimToken: mailIdSchema,
});
export const mailJobRowsSchema = z.array(mailJobSchema).max(1);
export const mailIdRowsSchema = z.array(z.object({ id: mailIdSchema }));
export const mailCountRowsSchema = z.array(z.object({ count: z.number().int().nonnegative() })).length(1);
export const mailStatusRowsSchema = z.array(z.object({
  status: mailQueueStatusSchema,
  count: z.number().int().nonnegative(),
}));

export const mailFailureCodeSchema = z.enum([
  "SMTP_TRANSIENT", "SMTP_REJECTED", "SMTP_CONFIGURATION", "SMTP_UNCERTAIN", "UNEXPECTED_FAILURE",
]);
export const mailOutcomeSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("sent"), messageId: z.string().min(1) }),
  z.object({ status: z.literal("not_sent"), code: mailFailureCodeSchema, retryable: z.boolean() }),
  z.object({ status: z.literal("uncertain"), code: mailFailureCodeSchema }),
]);
export type MailOutcome = z.infer<typeof mailOutcomeSchema>;
export const mailSummarySchema = z.object({
  sent: z.number().int().nonnegative(),
  not_sent: z.number().int().nonnegative(),
  uncertain: z.number().int().nonnegative(),
});

const commonCommand = { send: z.boolean().default(false) };
const queueSelection = { kind: mailKindSchema.default("welcome"), before: mailCutoffSchema.optional() };
export const mailResolutionStatusSchema = mailDeliveryStatusSchema.extract(["sent", "not_sent"]);
export type MailResolutionStatus = z.infer<typeof mailResolutionStatusSchema>;

export const mailCommandSchema = z.discriminatedUnion("command", [
  z.strictObject({ command: z.literal("status"), ...commonCommand, ...queueSelection }),
  z.strictObject({
    command: z.literal("process"), ...commonCommand,
    kind: mailKindSchema.default("welcome"), limit: mailLimitSchema.default(25),
  }),
  z.strictObject({ command: z.literal("launch"), ...commonCommand, before: mailCutoffSchema }),
  z.strictObject({ command: z.literal("retry"), ...commonCommand, kind: mailKindSchema.default("welcome") }),
  z.strictObject({ command: z.literal("resolve"), ...commonCommand, id: mailIdSchema, status: mailResolutionStatusSchema }),
  z.strictObject({ command: z.literal("suppress"), ...commonCommand, email: mailRecipientSchema }),
]);
export const mailTestCommandSchema = z.strictObject({
  to: mailRecipientSchema,
  kind: mailKindSchema.default("launch"),
  send: z.boolean().default(false),
});
