import { after } from "next/server";
import {
  waitlistSubscribeRequestSchema,
  type WaitlistErrorResponse,
  type WaitlistSubscribeResponse,
} from "@checkergie/api";
import { privacyEffectiveDate } from "@checkergie/docs";
import { formatMailError } from "src/server/mail/errors";
import { deliverMail } from "src/server/mail/deliver";
import { neonMailOutbox } from "src/server/mail/neon-outbox";
import { neonWaitlistStore } from "src/server/waitlist/neon-store";
import { normalizeEmail, storeErrorStatus } from "src/server/waitlist/store";

export const runtime = "nodejs";
export const maxDuration = 60;

export const GET = async () => {
  try {
    await neonWaitlistStore.warmUp();
  } catch (error) {
    return new Response(null, { status: storeErrorStatus(error) });
  }

  return new Response(null, { status: 204 });
};

export const POST = async (request: Request) => {
  const body = await request.json().catch(() => null);
  const result = waitlistSubscribeRequestSchema.safeParse(body);
  if (!result.success) {
    return Response.json({ message: result.error.issues[0].message }, { status: 400 });
  }

  try {
    const { created } = await neonWaitlistStore.subscribe(result.data.email, privacyEffectiveDate);
    if (!created) {
      return Response.json({ code: "ALREADY_REGISTERED" } satisfies WaitlistErrorResponse, { status: 409 });
    }
  } catch (error) {
    return Response.json({ message: "잠시 후 다시 시도해 주세요." }, { status: storeErrorStatus(error) });
  }

  after(async () => {
    try {
      await deliverMail({ kind: "welcome", limit: 1, recipient: normalizeEmail(result.data.email), outbox: neonMailOutbox });
    } catch (error) {
      console.error(formatMailError(error));
    }
  });

  return Response.json({ success: true } satisfies WaitlistSubscribeResponse);
};
