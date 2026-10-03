import { z } from "zod";

const INVALID_EMAIL_MESSAGE = "올바른 이메일 형식이 아닙니다.";

const emailSchema = z.email(INVALID_EMAIL_MESSAGE).max(254, INVALID_EMAIL_MESSAGE);

export const waitlistSubscribeRequestSchema = z.object({
  email: emailSchema,
});

export const waitlistSubscribeResponseSchema = z.object({
  success: z.literal(true),
});

export const ageGroupSchema = z.enum(["10대", "20대", "30대", "40대", "50대 이상"]);

export const genderSchema = z.enum(["여성", "남성", "기타"]);

export const waitlistProfileRequestSchema = z.object({
  email: emailSchema,
  ageGroup: ageGroupSchema.nullable(),
  gender: genderSchema.nullable(),
});

export const waitlistProfileResponseSchema = waitlistSubscribeResponseSchema;

export const waitlistErrorResponseSchema = z.object({
  code: z.literal("ALREADY_REGISTERED"),
});

export type WaitlistSubscribeRequest = z.infer<typeof waitlistSubscribeRequestSchema>;
export type WaitlistSubscribeResponse = z.infer<typeof waitlistSubscribeResponseSchema>;
export type AgeGroup = z.infer<typeof ageGroupSchema>;
export type Gender = z.infer<typeof genderSchema>;
export type WaitlistProfileRequest = z.infer<typeof waitlistProfileRequestSchema>;
export type WaitlistProfileResponse = z.infer<typeof waitlistProfileResponseSchema>;
export type WaitlistErrorResponse = z.infer<typeof waitlistErrorResponseSchema>;
