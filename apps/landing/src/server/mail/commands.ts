import { parseArgs } from "node:util";
import { MailOperationError } from "./errors";
import { mailCommandSchema, mailTestCommandSchema } from "./schemas";

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
