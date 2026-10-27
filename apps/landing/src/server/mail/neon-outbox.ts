import "server-only";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { mailKindSchema } from "@checkergie/api";
import { getDatabase } from "../database";
import { MailOperationError } from "./errors";
import type { MailKind, MailOutbox } from "./outbox";
import {
  getMailPolicy, mailCountRowsSchema, mailCutoffSchema, mailIdRowsSchema, mailIdSchema,
  mailJobRowsSchema, mailJobSchema, mailOutcomeSchema, mailRecipientSchema, mailStatusRowsSchema,
  mailResolutionStatusSchema, type MailResolutionStatus, mailFailureCodeSchema,
} from "./schemas";

const databaseErrorSchema = z.object({ code: z.string().optional() });
const database = (connect: typeof getDatabase) => async (strings: TemplateStringsArray, ...parameters: unknown[]) => {
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
const parseRows = <Schema extends z.ZodType>(schema: Schema, rows: unknown): z.infer<Schema> => {
  const result = schema.safeParse(rows);
  if (!result.success) throw new MailOperationError("DB_RESULT_INVALID");
  return result.data;
};

export const createMailOutbox = (connect = getDatabase): MailOutbox => ({
  claim: async (kind, recipient) => {
    mailKindSchema.parse(kind);
    const email = recipient === undefined ? null : mailRecipientSchema.parse(recipient);
    const policy = getMailPolicy();
    const sql = database(connect);
    // 종료된 작업이 SMTP에 접수됐을 수 있으므로 만료된 작업을 자동 재발송하지 않는다.
    await sql`
      UPDATE mail_outbox SET status = 'uncertain', failure_code = 'SMTP_UNCERTAIN',
        retryable = false, claim_token = NULL, updated_at = now()
      WHERE status = 'processing' AND locked_at < now() - ${policy.MAIL_LEASE_SECONDS} * interval '1 second'
    `;
    const claimToken = randomUUID();
    const rows = await sql`
      UPDATE mail_outbox SET status = 'processing', attempts = attempts + 1,
        locked_at = now(), claim_token = ${claimToken}, updated_at = now()
      WHERE id = (
        SELECT id FROM mail_outbox
        WHERE kind = ${kind} AND (status = 'pending' OR (status = 'not_sent' AND retryable))
          AND attempts < ${policy.MAIL_MAX_ATTEMPTS} AND available_at <= now()
          AND (${email}::text IS NULL OR email = ${email})
          AND NOT EXISTS (SELECT 1 FROM mail_suppressions s WHERE s.email = mail_outbox.email)
        ORDER BY created_at, id FOR UPDATE SKIP LOCKED LIMIT 1
      )
      RETURNING id, email, kind, claim_token AS "claimToken"
    `;
    return parseRows(mailJobRowsSchema, rows)[0] ?? null;
  },

  complete: async (job, outcome) => {
    mailJobSchema.parse(job);
    const result = mailOutcomeSchema.parse(outcome);
    const policy = getMailPolicy();
    const rows = await database(connect)`
      UPDATE mail_outbox SET status = ${result.status},
        message_id = ${result.status === 'sent' ? result.messageId : null},
        retryable = ${result.status === 'not_sent' && result.retryable},
        failure_code = ${result.status === 'sent' ? null : result.code},
        available_at = now() + ${policy.MAIL_RETRY_DELAY_SECONDS} * interval '1 second',
        claim_token = NULL, updated_at = now()
      WHERE id = ${job.id} AND status = 'processing' AND claim_token = ${job.claimToken}
      RETURNING id
    `;
    if (parseRows(mailIdRowsSchema, rows).length !== 1) throw new MailOperationError("CLAIM_LOST");
  },
});

export const neonMailOutbox = createMailOutbox();

export const enqueueLaunchMail = async (before: string, connect = getDatabase) => {
  const cutoff = mailCutoffSchema.parse(before);
  const rows = await database(connect)`
    INSERT INTO mail_outbox (email, kind)
    SELECT email, 'launch' FROM waitlist w
    WHERE created_at <= ${cutoff}::timestamptz
      AND NOT EXISTS (SELECT 1 FROM mail_suppressions s WHERE s.email = w.email)
    ON CONFLICT (email, kind) DO NOTHING
    RETURNING id
  `;
  return parseRows(mailIdRowsSchema, rows).length;
};

export const getMailSummary = async (kind: MailKind, before: string, connect = getDatabase) => {
  mailKindSchema.parse(kind);
  const cutoff = mailCutoffSchema.parse(before);
  const sql = database(connect);
  const [eligible, statuses, uncertain, failures] = await Promise.all([
    sql`SELECT count(*)::int AS count FROM waitlist w WHERE created_at <= ${cutoff}::timestamptz
      AND NOT EXISTS (SELECT 1 FROM mail_suppressions s WHERE s.email = w.email)
      AND NOT EXISTS (SELECT 1 FROM mail_outbox m WHERE m.email = w.email AND m.kind = ${kind})`,
    sql`SELECT status, count(*)::int AS count FROM mail_outbox m WHERE kind = ${kind}
      AND NOT EXISTS (SELECT 1 FROM mail_suppressions s WHERE s.email = m.email)
      GROUP BY status ORDER BY status`,
    sql`SELECT id FROM mail_outbox WHERE kind = ${kind} AND status = 'uncertain' ORDER BY created_at`,
    sql`SELECT failure_code AS code, count(*)::int AS count FROM mail_outbox
      WHERE kind = ${kind} AND failure_code IS NOT NULL AND status IN ('not_sent', 'uncertain')
      GROUP BY failure_code`,
  ]);
  return {
    failures: parseRows(z.array(z.object({ code: mailFailureCodeSchema, count: z.number().int().nonnegative() })), failures),
    notQueued: parseRows(mailCountRowsSchema, eligible)[0].count,
    statuses: parseRows(mailStatusRowsSchema, statuses),
    uncertainIds: parseRows(mailIdRowsSchema, uncertain).map((row) => row.id),
  };
};

export const suppressMail = async (email: string, connect = getDatabase) => {
  const recipient = mailRecipientSchema.parse(email);
  await database(connect)`INSERT INTO mail_suppressions (email) VALUES (${recipient}) ON CONFLICT DO NOTHING`;
};

export const retryFailedMail = async (kind: MailKind, connect = getDatabase) => {
  mailKindSchema.parse(kind);
  const policy = getMailPolicy();
  const rows = await database(connect)`
    UPDATE mail_outbox SET attempts = 0, retryable = true, available_at = now(), updated_at = now()
    WHERE kind = ${kind} AND status = 'not_sent'
      AND (attempts >= ${policy.MAIL_MAX_ATTEMPTS} OR NOT retryable) RETURNING id
  `;
  return parseRows(mailIdRowsSchema, rows).length;
};

export const resolveUncertainMail = async (id: string, status: MailResolutionStatus, connect = getDatabase) => {
  mailIdSchema.parse(id);
  mailResolutionStatusSchema.parse(status);
  const rows = await database(connect)`
    UPDATE mail_outbox SET status = ${status}, attempts = 0, retryable = ${status === 'not_sent'},
      failure_code = NULL, available_at = now(), updated_at = now()
    WHERE id = ${id}::uuid AND status = 'uncertain' RETURNING id
  `;
  if (parseRows(mailIdRowsSchema, rows).length !== 1) throw new MailOperationError("JOB_NOT_UNCERTAIN");
};
