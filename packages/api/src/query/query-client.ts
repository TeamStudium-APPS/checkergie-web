import { QueryClient } from "@tanstack/react-query";

const FIVE_MINUTES = 60 * 1000 * 5;

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: FIVE_MINUTES,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });

let browserQueryClient: QueryClient | undefined;

export const getQueryClient = () => {
  if (typeof window === "undefined") return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
};
