import "server-only";

import { timingSafeEqual } from "node:crypto";
import { mailWorkerSecretSchema } from "./config";
import { deliverMail } from "./deliver";
import { formatMailError } from "./errors";
import { neonMailOutbox } from "./neon-outbox";
import { mailSummarySchema } from "./schemas";

const processWelcomeMail = () => deliverMail({ kind: "welcome", limit: 1, outbox: neonMailOutbox });

export const createMailWorkerHandler = (processMail = processWelcomeMail) => async (request: Request) => {
  const secret = mailWorkerSecretSchema.safeParse(process.env.MAIL_WORKER_SECRET);
  if (!secret.success) return Response.json({ code: "WORKER_CONFIGURATION" }, { status: 503 });
  const actual = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret.data}`);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return Response.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }
  try {
    const summary = mailSummarySchema.parse(await processMail());
    const isIncomplete = summary.not_sent > 0 || summary.uncertain > 0;
    return Response.json(summary, {
      status: isIncomplete ? 503 : 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error(formatMailError(error));
    return Response.json({ code: "MAIL_WORKER_FAILED" }, { status: 503 });
  }
};
