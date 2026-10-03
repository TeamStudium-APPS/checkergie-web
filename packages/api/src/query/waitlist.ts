import { useMutation } from "@tanstack/react-query";

import { saveWaitlistProfile, subscribeWaitlist } from "../endpoints/waitlist";

export const useSubscribeWaitlist = () => useMutation({ mutationFn: subscribeWaitlist });

export const useSaveWaitlistProfile = () => useMutation({ mutationFn: saveWaitlistProfile });
