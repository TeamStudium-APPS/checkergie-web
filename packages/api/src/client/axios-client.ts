import axios from "axios";

const REQUEST_TIMEOUT = 10 * 1000;

const getBaseURL = () => {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseURL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL 환경 변수가 필요합니다.");
  }

  return baseURL;
};

export const apiClient = axios.create({
  timeout: REQUEST_TIMEOUT,
});

apiClient.interceptors.request.use((config) => {
  config.baseURL ??= getBaseURL();
  return config;
});
