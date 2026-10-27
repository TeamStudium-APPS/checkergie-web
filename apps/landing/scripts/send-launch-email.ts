import { parseTestCommand } from "../src/server/mail/commands";
import { renderLaunchEmail } from "../src/server/mail/launch-email";
import { createMailer } from "../src/server/mail/smtp";
import { getMailPreviewConfig } from "../src/server/mail/config";
import { renderWelcomeEmail } from "../src/server/mail/welcome-email";
import { runMailCommand } from "./mail-cli";

const main = async () => {
  const input = parseTestCommand(process.argv.slice(2));
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

void runMailCommand(main);
