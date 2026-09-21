import axios from "axios";

const REQUEST_TIMEOUT = 10 * 1000;

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});
