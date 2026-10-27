import { processScheduledLaunchMail } from "src/server/mail/scheduled-launch";
import { createMailWorkerHandler } from "src/server/mail/worker";

export const runtime = "nodejs";
export const maxDuration = 300;

export const POST = createMailWorkerHandler(() => processScheduledLaunchMail());
