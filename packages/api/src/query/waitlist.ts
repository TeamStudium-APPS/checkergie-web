import { useMutation } from "@tanstack/react-query";

import { saveWaitlistProfileApi, subscribeWaitlistApi } from "../endpoints/waitlist";

export const useSubscribeWaitlist = () => useMutation({ mutationFn: subscribeWaitlistApi });

export const useSaveWaitlistProfile = () => useMutation({ mutationFn: saveWaitlistProfileApi });
