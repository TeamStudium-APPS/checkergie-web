import { z } from "zod";

export const mailDeliveryStatusSchema = z.enum([
  "sent",
  "not_sent",
  "uncertain",
]);

export type MailDeliveryStatus = z.infer<typeof mailDeliveryStatusSchema>;
