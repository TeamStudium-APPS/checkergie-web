import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { parseTestCommand } from "../src/server/mail/commands";
import { formatMailError } from "../src/server/mail/errors";
import { renderLaunchEmail } from "../src/server/mail/launch-email";
import { createMailer, getMailPreviewConfig } from "../src/server/mail/smtp";
import { renderWelcomeEmail } from "../src/server/mail/welcome-email";

const main = async () => {
  const input = parseTestCommand(process.argv.slice(2));
  for (const path of [".env.local", ".env"]) {
    if (existsSync(path)) loadEnvFile(path);
  }
  if (!input.send) {
    const render = input.kind === "welcome" ? renderWelcomeEmail : renderLaunchEmail;
    const email = render(getMailPreviewConfig());
    console.log(`미리보기 모드: 메일을 보내지 않았습니다.\n제목: ${email.subject}\n\n${email.text}`);
    return;
  }
  const mailer = createMailer(input.kind);
  try {
    await mailer.verify();
    await mailer.send(input.to);
    console.log("SMTP 서버에 메일 1건을 접수했습니다. 수신함과 스팸함을 확인해 주세요.");
  } finally {
    mailer.close();
  }
};

main().catch((error: unknown) => {
  console.error(formatMailError(error));
  process.exitCode = 1;
});
