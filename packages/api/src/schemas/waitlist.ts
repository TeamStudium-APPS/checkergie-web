import { z } from "zod";

export const waitlistSubscribeRequestSchema = z.object({
  email: z.email("올바른 이메일 형식이 아닙니다."),
});


export const waitlistSubscribeResponseSchema = z.object({
  success: z.literal(true),
});

export const ageGroupSchema = z.enum(["10대", "20대", "30대", "40대", "50대 이상"]);

export const genderSchema = z.enum(["여성", "남성", "기타"]);

export const waitlistProfileRequestSchema = z.object({
  ageGroup: ageGroupSchema.optional(),
  gender: genderSchema.optional(),
});
