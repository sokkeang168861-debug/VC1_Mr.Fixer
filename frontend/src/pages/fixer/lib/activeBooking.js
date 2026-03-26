const ACTIVE_FIXER_BOOKING_KEY = "fixer_active_booking_id";

export function setActiveFixerBookingId(bookingId) {
  if (typeof window === "undefined" || bookingId === undefined || bookingId === null) {
    return;
  }

  window.sessionStorage.setItem(ACTIVE_FIXER_BOOKING_KEY, String(bookingId));
}

export function getActiveFixerBookingId() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage.getItem(ACTIVE_FIXER_BOOKING_KEY);
}

export function clearActiveFixerBookingId() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(ACTIVE_FIXER_BOOKING_KEY);
}
