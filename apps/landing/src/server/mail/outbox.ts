import type { z } from "zod";
import type { MailKind } from "@checkergie/api";
import type { mailJobSchema, MailOutcome } from "./schemas";

export type { MailKind } from "@checkergie/api";
export type MailJob = z.infer<typeof mailJobSchema>;

export interface MailOutbox {
  claim(kind: MailKind, recipient?: string): Promise<MailJob | null>;
  complete(job: MailJob, outcome: MailOutcome): Promise<void>;
}
