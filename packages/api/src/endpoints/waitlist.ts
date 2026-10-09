import { isAxiosError } from "axios";
import { apiClient } from "../client";
import {
  waitlistErrorResponseSchema,
  waitlistProfileRequestSchema,
  waitlistProfileResponseSchema,
  waitlistSubscribeRequestSchema,
  waitlistSubscribeResponseSchema,
  type WaitlistProfileRequest,
  type WaitlistProfileResponse,
  type WaitlistSubscribeRequest,
  type WaitlistSubscribeResponse,
} from "../schemas/waitlist";
import { parseWithSchema } from "../validate";

const WAITLIST_PATH = "/waitlist";
const WAITLIST_PROFILE_PATH = "/waitlist/profile";

export const warmUpWaitlist = async () => {
  await apiClient.get(WAITLIST_PATH);
};

export const subscribeWaitlist = async (body: WaitlistSubscribeRequest): Promise<WaitlistSubscribeResponse> => {
  const request = parseWithSchema(waitlistSubscribeRequestSchema, body, "request");
  const { data } = await apiClient.post(WAITLIST_PATH, request);
  return parseWithSchema(waitlistSubscribeResponseSchema, data, "response");
};

export const saveWaitlistProfile = async (body: WaitlistProfileRequest): Promise<WaitlistProfileResponse> => {
  const request = parseWithSchema(waitlistProfileRequestSchema, body, "request");
  const { data } = await apiClient.patch(WAITLIST_PROFILE_PATH, request);
  return parseWithSchema(waitlistProfileResponseSchema, data, "response");
};

export const isWaitlistAlreadyRegisteredError = (error: unknown) =>
  isAxiosError(error)
  && error.response?.status === 409
  && waitlistErrorResponseSchema.safeParse(error.response.data).success;
