import axios from "axios";
import { apiBaseUrl } from "./runtimeConfig";

const httpClient = axios.create({
  baseURL: apiBaseUrl,
});

// Use an interceptor to ensure the latest token is always included
httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default httpClient;
