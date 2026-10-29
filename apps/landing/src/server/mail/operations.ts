import "server-only";

import { z } from "zod";
import { mailKindSchema } from "@checkergie/api";
import { getDatabase } from "../database";
import { getMailPolicy } from "./config";
import { mailDatabase, parseMailRows } from "./database";
import { MailOperationError } from "./errors";
import type { MailKind } from "./outbox";
import {
  mailCountRowsSchema, mailCutoffSchema, mailIdRowsSchema, mailIdSchema, mailRecipientSchema,
  mailStatusRowsSchema, mailResolutionStatusSchema, type MailResolutionStatus, mailFailureCodeSchema,
} from "./schemas";

export const enqueueLaunchMail = async (before: string, connect = getDatabase) => {
  const cutoff = mailCutoffSchema.parse(before);
  const rows = await mailDatabase(connect)`
    INSERT INTO mail_outbox (email, kind)
    SELECT email, 'launch' FROM waitlist w
    WHERE created_at <= ${cutoff}::timestamptz
      AND NOT EXISTS (SELECT 1 FROM mail_suppressions s WHERE s.email = w.email)
    ON CONFLICT (email, kind) DO NOTHING
    RETURNING id
  `;
  return parseMailRows(mailIdRowsSchema, rows).length;
};

export const getMailSummary = async (kind: MailKind, before: string, connect = getDatabase) => {
  mailKindSchema.parse(kind);
  const cutoff = mailCutoffSchema.parse(before);
  const sql = mailDatabase(connect);
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
    failures: parseMailRows(z.array(z.object({ code: mailFailureCodeSchema, count: z.number().int().nonnegative() })), failures),
    notQueued: parseMailRows(mailCountRowsSchema, eligible)[0].count,
    statuses: parseMailRows(mailStatusRowsSchema, statuses),
    uncertainIds: parseMailRows(mailIdRowsSchema, uncertain).map((row) => row.id),
  };
};

export const suppressMail = async (email: string, connect = getDatabase) => {
  const recipient = mailRecipientSchema.parse(email);
  await mailDatabase(connect)`INSERT INTO mail_suppressions (email) VALUES (${recipient}) ON CONFLICT DO NOTHING`;
};

export const retryFailedMail = async (kind: MailKind, connect = getDatabase) => {
  mailKindSchema.parse(kind);
  const policy = getMailPolicy();
  const rows = await mailDatabase(connect)`
    UPDATE mail_outbox SET attempts = 0, retryable = true, available_at = now(), updated_at = now()
    WHERE kind = ${kind} AND status = 'not_sent'
      AND (attempts >= ${policy.MAIL_MAX_ATTEMPTS} OR NOT retryable) RETURNING id
  `;
  return parseMailRows(mailIdRowsSchema, rows).length;
};

export const resolveUncertainMail = async (id: string, status: MailResolutionStatus, connect = getDatabase) => {
  mailIdSchema.parse(id);
  mailResolutionStatusSchema.parse(status);
  const rows = await mailDatabase(connect)`
    UPDATE mail_outbox SET status = ${status}, attempts = 0, retryable = ${status === 'not_sent'},
      failure_code = NULL, available_at = now(), updated_at = now()
    WHERE id = ${id}::uuid AND status = 'uncertain' RETURNING id
  `;
  if (parseMailRows(mailIdRowsSchema, rows).length !== 1) throw new MailOperationError("JOB_NOT_UNCERTAIN");
};
