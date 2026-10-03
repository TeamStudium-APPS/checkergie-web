import { waitlistProfileRequestSchema, type WaitlistProfileResponse } from "@checkergie/api";
import { neonWaitlistStore } from "src/server/waitlist/neon-store";
import { storeErrorStatus } from "src/server/waitlist/store";

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);
  const result = waitlistProfileRequestSchema.safeParse(body);
  if (!result.success) {
    return Response.json({ message: result.error.issues[0].message }, { status: 400 });
  }

  const { email, ageGroup, gender } = result.data;
  try {
    await neonWaitlistStore.updateProfile(email, { ageGroup, gender });
  } catch (error) {
    return Response.json({ message: "잠시 후 다시 시도해 주세요." }, { status: storeErrorStatus(error) });
  }

  return Response.json({ success: true } satisfies WaitlistProfileResponse);
}
