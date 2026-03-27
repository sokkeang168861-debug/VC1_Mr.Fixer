import httpClient from "@/api/httpClient";
import { clearSession } from "@/lib/auth";
import { clearActiveFixerBookingId } from "@/pages/fixer/lib/activeBooking";

export async function logoutUser({ navigate, redirectTo } = {}) {
  try {
    await httpClient.post("/auth/logout");
  } catch (error) {
    console.error("Logout error:", error);
  }

  clearSession();
  clearActiveFixerBookingId();

  if (httpClient?.defaults?.headers?.common) {
    delete httpClient.defaults.headers.common.Authorization;
  }

  if (typeof navigate === "function" && redirectTo) {
    navigate(redirectTo);
  }
}
