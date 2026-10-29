import "server-only";

import { failedMailOutcome } from "./errors";
import { mailLimitSchema, mailTimeBudgetSchema, mailOutcomeSchema, type MailOutcome } from "./schemas";
import type { MailKind, MailOutbox } from "./outbox";
import { createMailer } from "./smtp";

type Mailer = ReturnType<typeof createMailer>;
interface DeliveryOptions {
  kind: MailKind;
  limit: number;
  recipient?: string;
  timeBudgetMs?: number;
  outbox: MailOutbox;
  createTransport?: (kind: MailKind) => Mailer;
}

export const deliverMail = async ({ kind, limit, recipient, timeBudgetMs, outbox, createTransport = createMailer }: DeliveryOptions) => {
  mailLimitSchema.parse(limit);
  if (timeBudgetMs !== undefined) mailTimeBudgetSchema.parse(timeBudgetMs);
  const startedAt = Date.now();
  // 설정·인증 실패는 작업을 선점하기 전에 확인한다.
  const mailer = createTransport(kind);
  const summary = { sent: 0, not_sent: 0, uncertain: 0 };
  try {
    await mailer.verify();
    for (let index = 0; index < limit; index += 1) {
      // 실행 제한에 가까워지면 새 작업을 가져오지 않는다. 남은 작업은 다음 실행이 처리한다.
      if (timeBudgetMs !== undefined && Date.now() - startedAt >= timeBudgetMs) break;
      const job = await outbox.claim(kind, recipient);
      if (!job) break;
      let outcome: MailOutcome;
      try {
        // 추적용으로만 사용한다. SMTP 서버가 Message-ID 중복을 제거한다고 가정하지 않는다.
        const result = await mailer.send(job.email, job.id);
        outcome = mailOutcomeSchema.parse(result);
      } catch (error) {
        outcome = failedMailOutcome(error);
      }
      // SMTP 성공 뒤 DB 기록이 실패하면 중단한다. 만료 후 uncertain으로 격리된다.
      await outbox.complete(job, outcome);
      summary[outcome.status] += 1;
    }
    return summary;
  } finally {
    mailer.close();
  }
};
