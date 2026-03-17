import httpClient from "@/api/httpClient";
import { clearSession } from "@/lib/auth";

export async function logoutUser({ navigate, redirectTo } = {}) {
  try {
    await httpClient.post("/auth/logout");
  } catch (error) {
    console.error("Logout error:", error);
  }

  clearSession();

  if (httpClient?.defaults?.headers?.common) {
    delete httpClient.defaults.headers.common.Authorization;
  }

  if (typeof navigate === "function" && redirectTo) {
    navigate(redirectTo);
  }
}