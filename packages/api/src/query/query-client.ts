import { QueryClient } from "@tanstack/react-query";

const FIVE_MINUTES = 60 * 1000 * 5;

function makeQueryClient() {
  return new QueryClient({
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
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  // 서버에서는 요청마다 새로 만들어 캐시가 섞이지 않게 하고, 브라우저에서는 하나를 재사용한다.
  if (typeof window === "undefined") return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
