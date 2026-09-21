"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => undefined;

export const useMounted = (): boolean => {
  return useSyncExternalStore(subscribe, () => true, () => false);
};
