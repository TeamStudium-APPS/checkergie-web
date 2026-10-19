import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { parseArgs } from "node:util";

import { renderLaunchEmail, validateEmailAddress } from "../src/server/mail/launch-email";
import { createLaunchMailer, getMailPreviewConfig, MailDeliveryError } from "../src/server/mail/smtp";

const NOT_SENT_ERROR_MESSAGE = "메일을 보내지 않았습니다. --to 주소와 SMTP 설정을 확인한 뒤 다시 시도해 주세요.";
const DELIVERY_ERROR_MESSAGE = "발송하지 못했거나 결과를 확인하지 못했습니다. 수신함을 먼저 확인한 뒤 --to, SMTP 설정, MAIL_SERVICE_URL을 점검해 주세요. 자세한 설정은 docs/email.md를 참고하세요.";

const main = async () => {
  const { values } = parseArgs({
    options: {
      to: { type: "string" },
      send: { type: "boolean", default: false },
    },
    allowPositionals: false,
    strict: true,
  });

  // pnpm 패키지 명령은 apps/landing에서 실행된다. 이미 설정된 환경변수는 유지한다.
  for (const path of [".env.local", ".env"]) {
    if (existsSync(path)) loadEnvFile(path);
  }

  if (!values.to) throw new Error("--to 옵션으로 테스트 수신자 한 명을 지정해 주세요.");
  const recipient = validateEmailAddress(values.to);

  if (!values.send) {
    const email = renderLaunchEmail(getMailPreviewConfig());
    console.log(`미리보기 모드: 메일을 보내지 않았습니다.\n제목: ${email.subject}\n\n${email.text}`);
    console.log("\n실제 발송하려면 SMTP 설정 후 mail:send 명령을 사용하세요.");
    return;
  }

  const mailer = createLaunchMailer();
  try {
    await mailer.verify();
    await mailer.send(recipient);
    console.log("SMTP 서버에 메일 1건을 접수했습니다. 수신함과 스팸함을 확인해 주세요.");
  } finally {
    mailer.close();
  }
};

main().catch((error: unknown) => {
  // SMTP 오류 원문에는 계정·수신자 등 개인정보가 포함될 수 있다.
  const isUncertain = error instanceof MailDeliveryError && error.deliveryStatus === "uncertain";
  console.error(isUncertain ? DELIVERY_ERROR_MESSAGE : NOT_SENT_ERROR_MESSAGE);
  process.exitCode = 1;
});
