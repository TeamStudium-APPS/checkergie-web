import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { formatMailError } from "../src/server/mail/errors";

export const runMailCommand = async (command: () => Promise<void>) => {
  try {
    // pnpm은 앱 폴더에서 실행하며, 이미 주입된 환경변수가 파일보다 우선한다.
    for (const path of [".env.local", ".env"]) {
      if (existsSync(path)) loadEnvFile(path);
    }
    await command();
  } catch (error) {
    console.error(formatMailError(error));
    process.exitCode = 1;
  }
};
