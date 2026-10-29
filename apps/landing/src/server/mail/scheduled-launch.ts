import "server-only";

import { mailLaunchScheduleSchema } from "./config";
import { deliverMail } from "./deliver";
import { neonMailOutbox } from "./neon-outbox";
import { enqueueLaunchMail } from "./operations";

const deliverLaunchMail = (limit: number) => deliverMail({
  kind: "launch", limit, timeBudgetMs: 240_000, outbox: neonMailOutbox,
});

interface LaunchDependencies {
  enqueue?: typeof enqueueLaunchMail;
  deliver?: typeof deliverLaunchMail;
  now?: () => number;
}

export const processScheduledLaunchMail = async (
  environment: Record<string, string | undefined> = process.env,
  { enqueue = enqueueLaunchMail, deliver = deliverLaunchMail, now = Date.now }: LaunchDependencies = {},
) => {
  const { MAIL_LAUNCH_AT: launchAt, MAIL_LAUNCH_BATCH_SIZE: batchSize } = mailLaunchScheduleSchema.parse(environment);
  if (!launchAt || now() < Date.parse(launchAt)) {
    return { sent: 0, not_sent: 0, uncertain: 0 };
  }
  // 예약 시각을 대상 마감으로 고정한다. 재실행해도 수신자별 오픈 알림은 하나만 생성된다.
  await enqueue(launchAt);
  return deliver(batchSize);
};
