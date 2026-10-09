import axios from "axios";

const REQUEST_TIMEOUT = 10 * 1000;
const DEFAULT_BASE_URL = "/api";

const getBaseURL = () => process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_BASE_URL;

export const apiClient = axios.create({
  timeout: REQUEST_TIMEOUT,
});

apiClient.interceptors.request.use((config) => {
  config.baseURL ??= getBaseURL();
  return config;
});
