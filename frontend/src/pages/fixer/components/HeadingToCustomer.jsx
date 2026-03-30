import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import httpClient from "@/api/httpClient";
import RouteMapPanel from "@/pages/fixer/components/RouteMapPanel";
import useActiveFixerBooking from "@/pages/fixer/hooks/useActiveFixerBooking";
import { getFixerJobOverview } from "@/pages/fixer/lib/jobOverview";

function isValidCoordinate(value) {
  return Number.isFinite(Number(value));
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function calculateDistanceKm(start, end) {
  const earthRadiusKm = 6371;
  const latDelta = toRadians(end.lat - start.lat);
  const lngDelta = toRadians(end.lng - start.lng);
  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(toRadians(start.lat)) *
      Math.cos(toRadians(end.lat)) *
      Math.sin(lngDelta / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(distanceKm) {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
    return "0 km";
  }

  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }

  return `${distanceKm.toFixed(1)} km`;
}

export default function HeadingToCustomer() {
  const navigate = useNavigate();
  const [focusedTarget, setFocusedTarget] = useState("route");
  const [markingArrived, setMarkingArrived] = useState(false);
  const { bookingId, job, loading, error } = useActiveFixerBooking();
  const normalizedStatus = String(job?.status || "").toLowerCase();
  const canOpenHeadingPage =
    normalizedStatus === "customer_accept" || normalizedStatus === "arrived";
  const displayJob = job;

  const jobOverview = useMemo(() => {
    return getFixerJobOverview(displayJob, bookingId);
  }, [bookingId, displayJob]);

  const routeMetrics = useMemo(() => {
    const fixerPoint =
      isValidCoordinate(displayJob?.provider_latitude) &&
      isValidCoordinate(displayJob?.provider_longitude)
        ? {
            lat: Number(displayJob.provider_latitude),
            lng: Number(displayJob.provider_longitude),
          }
        : null;

    const customerPoint =
      isValidCoordinate(displayJob?.latitude) &&
      isValidCoordinate(displayJob?.longitude)
        ? {
            lat: Number(displayJob.latitude),
            lng: Number(displayJob.longitude),
          }
        : null;

    if (!fixerPoint || !customerPoint) {
      return {
        distanceLabel: "Live GPS",
        etaLabel: "Waiting for route",
      };
    }

    const distanceKm = calculateDistanceKm(fixerPoint, customerPoint);
    const etaMinutes = Math.max(3, Math.round((distanceKm / 28) * 60));

    return {
      distanceLabel: formatDistance(distanceKm),
      etaLabel: `${etaMinutes} min`,
    };
  }, [displayJob]);

  useEffect(() => {
    if (loading || !bookingId || !job || canOpenHeadingPage) {
      return;
    }

    navigate("/dashboard/fixer/jobs/proposal-status", {
      replace: true,
      state: { bookingId },
    });
  }, [bookingId, canOpenHeadingPage, job, loading, navigate]);

  const handleArrived = async () => {
    if (!bookingId || markingArrived) {
      return;
    }

    try {
      setMarkingArrived(true);
      await httpClient.post(`/fixer/provider/requests/${bookingId}/arrived`);
      navigate("/dashboard/fixer/jobs/arrived-status", {
        state: { bookingId },
      });
    } catch (requestError) {
      console.error(requestError);
      window.alert(
        requestError?.response?.data?.message ||
          "Failed to mark this booking as arrived."
      );
    } finally {
      setMarkingArrived(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="animate-spin text-[#FF7A1F]" size={36} />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="mx-auto max-w-4xl rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center">
        <p className="text-sm font-semibold text-rose-700">
          {error || "Unable to load active booking."}
        </p>
      </div>
    );
  }

  if (!canOpenHeadingPage) {
    return (
      <div className="mx-auto max-w-4xl rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
        <p className="text-sm font-semibold text-amber-800">
          Waiting for customer acceptance. Redirecting to the proposal status page now.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="rounded-[1.55rem] border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                Heading To Customer
              </p>
              <h2 className="mt-2.5 text-[1.8rem] font-black tracking-[-0.03em] text-slate-950">
                Customer User
              </h2>
              <p className="mt-2 max-w-2xl text-[13px] leading-6 text-slate-500">
                Keep tracking the live route, focus either marker, and stay in contact until you arrive.
              </p>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-sm">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
            <button
              type="button"
              onClick={() => setFocusedTarget("customer")}
              className={`flex items-start gap-3 p-3.5 text-left transition lg:min-h-[5.25rem] ${
                focusedTarget === "customer"
                  ? "bg-orange-50"
                  : "bg-[#FFF7ED] hover:bg-orange-50"
              }`}
            >
              <div className="rounded-xl bg-white p-2 text-[#FF7A1F] shadow-sm">
                <MapPin className="mt-0.5 text-[#FF7A1F]" size={15} />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-slate-900">Customer Live Location</p>
                <p className="mt-1 text-[12px] text-slate-500">
                  {displayJob.service_address || "Customer GPS location is active"}
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFocusedTarget("fixer")}
              className={`flex items-start gap-3 border-t border-slate-200 p-3.5 text-left transition lg:min-h-[5.25rem] lg:border-l lg:border-t-0 ${
                focusedTarget === "fixer"
                  ? "bg-cyan-50"
                  : "bg-slate-50 hover:bg-slate-100"
              }`}
            >
              <div className="rounded-xl bg-white p-2 text-cyan-600 shadow-sm">
                <Navigation className="mt-0.5 rotate-45 text-cyan-600" size={15} />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-slate-900">Fixer Live GPS</p>
                <p className="mt-1 text-[12px] text-slate-500">
                  {displayJob?.provider_location
                    ? "Showing the saved fixer location."
                    : "Saved fixer location unavailable."}
                </p>
              </div>
            </button>

            <a
              href={displayJob.customer_phone ? `tel:${displayJob.customer_phone}` : undefined}
              className={`inline-flex min-h-[3.75rem] items-center justify-center gap-2 border-t border-slate-200 px-4 py-3 text-[12px] font-bold transition lg:min-h-[5.25rem] lg:border-l lg:border-t-0 ${
                displayJob.customer_phone
                  ? "bg-white text-[#FF8A1F] hover:bg-orange-50"
                  : "cursor-not-allowed bg-slate-100 text-slate-400"
              }`}
            >
              <Phone size={14} />
              Call Customer
            </a>
          </div>
          </div>

          <div className="mt-4 rounded-[1.35rem] border border-slate-200 bg-slate-50 p-3.5">
            <div className="mb-3">
              <p className="text-[11px] font-bold text-slate-900">Job Overview</p>
            </div>

            <div className="grid gap-3 lg:grid-cols-[0.9fr_1.4fr]">
              <div className="rounded-[1.1rem] bg-white p-3 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Total Estimated Price
                    </p>
                    <p className="mt-1.5 text-[1.55rem] font-black tracking-[-0.04em] text-[#FF8A1F]">
                      ${Number(jobOverview?.total_estimated_price || 0).toFixed(2)}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold text-slate-400">
                      Est. Earnings
                    </p>
                  </div>
                  <div className="rounded-xl bg-orange-50 p-2 text-[#FF8A1F]">
                    <Wallet size={14} />
                  </div>
                </div>
              </div>

              <div className="rounded-[1.1rem] bg-white p-3 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Issue Description
                </p>
                <p className="mt-2 text-[12px] leading-5 text-slate-600">
                  "{jobOverview?.issue_description || "No issue description available."}"
                </p>
              </div>

              <div className="rounded-[1.1rem] bg-white p-3 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Order ID
                </p>
                <p className="mt-2 text-[14px] font-black tracking-[-0.03em] text-slate-950">
                  #{jobOverview?.booking_reference || bookingId}
                </p>

                <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Category
                  </p>
                  <p className="mt-2 text-[14px] font-black text-slate-950">
                    {jobOverview?.category || "Service Request"}
                  </p>
                </div>
              </div>
            </div>
          </div>

      </div>

      <div>
        <RouteMapPanel
          job={displayJob}
          heightClass="h-[520px]"
          focusedTarget={focusedTarget}
        />
      </div>

      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-3.5 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[0.8fr_1.4fr_auto] lg:items-center">
          <div className="flex items-center gap-3 rounded-[1.25rem] bg-[#FFF7ED] px-3.5 py-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#FF7A1F] shadow-sm">
              <Navigation size={16} className="rotate-45" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Current Status
              </p>
              <p className="mt-1 text-[15px] font-bold text-slate-900">On My Way</p>
            </div>
          </div>

          <div className="rounded-[1.25rem] border border-slate-100 bg-slate-50 px-3.5 py-2.5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Distance Remaining
                </p>
                <p className="mt-1 text-[15px] font-bold text-slate-900">
                  {routeMetrics.distanceLabel}
                </p>
              </div>
              <div className="min-w-[7rem] md:text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Estimated Arrival
                </p>
                <p className="mt-1 text-[15px] font-bold text-[#FF7A1F]">
                  {routeMetrics.etaLabel}
                </p>
              </div>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-orange-100">
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#FFB15C] via-[#FF8A1F] to-[#FF7A1F]" />
            </div>
          </div>

          <button
            type="button"
            onClick={handleArrived}
            disabled={markingArrived}
            className="inline-flex min-h-[3rem] items-center justify-center rounded-xl bg-[#111827] px-6 py-3 text-[13px] font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {markingArrived ? "Updating..." : "I Have Arrived"}
          </button>
        </div>
      </div>
    </div>
  );
}
