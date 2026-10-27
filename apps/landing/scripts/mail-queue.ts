import { parseQueueCommand } from "../src/server/mail/commands";
import { deliverMail } from "../src/server/mail/deliver";
import { neonMailOutbox } from "../src/server/mail/neon-outbox";
import { enqueueLaunchMail, getMailSummary, resolveUncertainMail, retryFailedMail, suppressMail } from "../src/server/mail/operations";
import { runMailCommand } from "./mail-cli";

const main = async () => {
  const input = parseQueueCommand(process.argv.slice(2));
  if (!input.send || input.command === "status") {
    console.log("조회 모드: 메일 발송·DB 변경 없음. 변경 명령은 --send를 명시해야 실행됩니다.");
    if (input.command === "resolve" || input.command === "suppress") {
      console.log(`명령 검증 완료: ${input.command}`);
      return;
    }
    const kind = input.command === "launch" ? "launch" : input.kind;
    const before = "before" in input ? input.before : undefined;
    console.log(JSON.stringify(await getMailSummary(kind, before ?? new Date().toISOString()), null, 2));
    return;
  }
  switch (input.command) {
    case "suppress":
      await suppressMail(input.email);
      console.log("수신 거부 처리 완료. 이후 대기열 선점에서 제외됩니다.");
      return;
    case "resolve":
      await resolveUncertainMail(input.id, input.status);
      console.log("미확인 결과를 수동 확정했습니다.");
      return;
    case "retry":
      console.log(`다시 처리할 미접수 작업: ${await retryFailedMail(input.kind)}건`);
      return;
    case "launch":
      console.log(`오픈 알림 대기열 추가: ${await enqueueLaunchMail(input.before)}건. process --kind launch --send로 발송하세요.`);
      return;
    case "process": {
      const summary = await deliverMail({ kind: input.kind, limit: input.limit, outbox: neonMailOutbox });
      console.log(JSON.stringify(summary));
      if (summary.not_sent > 0 || summary.uncertain > 0) process.exitCode = 1;
      return;
    }
  }
};

void runMailCommand(main);
