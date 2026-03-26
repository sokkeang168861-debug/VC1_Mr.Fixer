import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import httpClient from "@/api/httpClient";
import {
  getActiveFixerBookingId,
  setActiveFixerBookingId,
} from "@/pages/fixer/lib/activeBooking";

export default function useActiveFixerBooking() {
  const location = useLocation();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const bookingId = useMemo(() => {
    const stateBookingId = location.state?.bookingId;
    return stateBookingId || getActiveFixerBookingId() || "";
  }, [location.state]);

  useEffect(() => {
    if (bookingId) {
      setActiveFixerBookingId(bookingId);
    }
  }, [bookingId]);

  useEffect(() => {
    let isMounted = true;
    let intervalId;

    const loadBooking = async ({ silent = false } = {}) => {
      if (!bookingId) {
        if (isMounted) {
          setJob(null);
          setError("No active booking selected.");
          setLoading(false);
        }
        return;
      }

      try {
        if (!silent) {
          setLoading(true);
        }
        setError("");

        const response = await httpClient.get(`/fixer/provider/requests/${bookingId}`);
        const payload = response?.data?.data;

        if (!isMounted) {
          return;
        }

        if (!payload) {
          setJob(null);
          setError("Unable to load booking details.");
          return;
        }

        setJob(payload);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setJob(null);
        setError(
          requestError?.response?.data?.message ||
            "Failed to load booking details."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadBooking();

    if (bookingId) {
      intervalId = window.setInterval(() => {
        loadBooking({ silent: true });
      }, 10000);
    }

    return () => {
      isMounted = false;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [bookingId]);

  return {
    bookingId: bookingId ? Number(bookingId) : null,
    job,
    loading,
    error,
  };
}
