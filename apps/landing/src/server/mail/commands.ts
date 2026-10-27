import { parseArgs } from "node:util";
import { z } from "zod";
import { mailKindSchema } from "@checkergie/api";
import { MailOperationError } from "./errors";
import { mailCutoffSchema, mailIdSchema, mailLimitSchema, mailRecipientSchema, mailResolutionStatusSchema } from "./schemas";

const commonCommand = { send: z.boolean().default(false) };
const queueSelection = { kind: mailKindSchema.default("welcome"), before: mailCutoffSchema.optional() };
const mailCommandSchema = z.discriminatedUnion("command", [
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
const mailTestCommandSchema = z.strictObject({
  to: mailRecipientSchema,
  kind: mailKindSchema.default("launch"),
  send: z.boolean().default(false),
});

export const parseQueueCommand = (args: string[]) => {
  let parsed: ReturnType<typeof parseArgs>;
  try {
    parsed = parseArgs({
      args,
      options: {
        kind: { type: "string" }, before: { type: "string" }, limit: { type: "string" },
        send: { type: "boolean" }, id: { type: "string" }, status: { type: "string" }, email: { type: "string" },
      },
      allowPositionals: true,
      strict: true,
    });
  } catch {
    throw new MailOperationError("INPUT_INVALID");
  }
  if (parsed.positionals.length > 1) throw new MailOperationError("INPUT_INVALID");
  return mailCommandSchema.parse({ command: parsed.positionals[0] ?? "status", ...parsed.values });
};

export const parseTestCommand = (args: string[]) => {
  let parsed: ReturnType<typeof parseArgs>;
  try {
    parsed = parseArgs({
      args,
      options: { to: { type: "string" }, kind: { type: "string" }, send: { type: "boolean" } },
      allowPositionals: false,
      strict: true,
    });
  } catch {
    throw new MailOperationError("INPUT_INVALID");
  }
  return mailTestCommandSchema.parse(parsed.values);
};
