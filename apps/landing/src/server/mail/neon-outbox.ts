import "server-only";

import { randomUUID } from "node:crypto";
import { mailKindSchema } from "@checkergie/api";
import { getDatabase } from "../database";
import { getMailPolicy } from "./config";
import { mailDatabase, parseMailRows } from "./database";
import { MailOperationError } from "./errors";
import type { MailOutbox } from "./outbox";
import { mailIdRowsSchema, mailJobRowsSchema, mailJobSchema, mailOutcomeSchema, mailRecipientSchema } from "./schemas";

export const createMailOutbox = (connect = getDatabase): MailOutbox => ({
  claim: async (kind, recipient) => {
    mailKindSchema.parse(kind);
    const email = recipient === undefined ? null : mailRecipientSchema.parse(recipient);
    const policy = getMailPolicy();
    const sql = mailDatabase(connect);
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
    return parseMailRows(mailJobRowsSchema, rows)[0] ?? null;
  },

  complete: async (job, outcome) => {
    mailJobSchema.parse(job);
    const result = mailOutcomeSchema.parse(outcome);
    const policy = getMailPolicy();
    const rows = await mailDatabase(connect)`
      UPDATE mail_outbox SET status = ${result.status},
        message_id = ${result.status === 'sent' ? result.messageId : null},
        retryable = ${result.status === 'not_sent' && result.retryable},
        failure_code = ${result.status === 'sent' ? null : result.code},
        available_at = now() + ${policy.MAIL_RETRY_DELAY_SECONDS} * interval '1 second',
        claim_token = NULL, updated_at = now()
      WHERE id = ${job.id} AND status = 'processing' AND claim_token = ${job.claimToken}
      RETURNING id
    `;
    if (parseMailRows(mailIdRowsSchema, rows).length !== 1) throw new MailOperationError("CLAIM_LOST");
  },
});

export const neonMailOutbox = createMailOutbox();
