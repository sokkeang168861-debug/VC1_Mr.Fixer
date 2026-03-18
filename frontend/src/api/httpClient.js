import axios from "axios";
import { getToken, clearSession } from "@/lib/auth";

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

// Use an interceptor to ensure the latest token is always included
httpClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle 401 responses by clearing session
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const errorCode = error.response?.data?.code;
      // Clear session on token-related errors
      if (errorCode === "NO_TOKEN" || errorCode === "TOKEN_EXPIRED" || errorCode === "INVALID_TOKEN") {
        clearSession();
      }
    }
    return Promise.reject(error);
  }
);

export default httpClient;
