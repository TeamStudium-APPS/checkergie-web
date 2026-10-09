import {
  waitlistSubscribeRequestSchema,
  type WaitlistErrorResponse,
  type WaitlistSubscribeResponse,
} from "@checkergie/api";
import { privacyEffectiveDate } from "@checkergie/docs";
import { neonWaitlistStore } from "src/server/waitlist/neon-store";
import { storeErrorStatus } from "src/server/waitlist/store";

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

  return Response.json({ success: true } satisfies WaitlistSubscribeResponse);
};
