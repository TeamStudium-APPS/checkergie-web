import "server-only";

import { z } from "zod";
import { getDatabase } from "../database";
import { MailOperationError } from "./errors";

const databaseErrorSchema = z.object({ code: z.string().optional() });
export const mailDatabase = (connect: typeof getDatabase) => async (strings: TemplateStringsArray, ...parameters: unknown[]) => {
  let sql: ReturnType<typeof getDatabase>;
  try {
    sql = connect();
  } catch {
    throw new MailOperationError("DB_CONFIGURATION");
  }
  try {
    return await sql(strings, ...parameters);
  } catch (error) {
    const parsed = databaseErrorSchema.safeParse(error);
    if (parsed.success && ["42P01", "42703"].includes(parsed.data.code ?? "")) {
      throw new MailOperationError("DB_SCHEMA_MISMATCH");
    }
    throw new MailOperationError("DB_UNAVAILABLE");
  }
};
export const parseMailRows = <Schema extends z.ZodType>(schema: Schema, rows: unknown): z.infer<Schema> => {
  const result = schema.safeParse(rows);
  if (!result.success) throw new MailOperationError("DB_RESULT_INVALID");
  return result.data;
};
