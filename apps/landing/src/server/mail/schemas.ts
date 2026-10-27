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

export const mailResolutionStatusSchema = mailDeliveryStatusSchema.extract(["sent", "not_sent"]);
export type MailResolutionStatus = z.infer<typeof mailResolutionStatusSchema>;
