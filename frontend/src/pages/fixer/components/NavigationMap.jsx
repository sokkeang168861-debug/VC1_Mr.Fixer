import { useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, Loader2, MapPin, Navigation, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import httpClient from "@/api/httpClient";
import RouteMapPanel from "@/pages/fixer/components/RouteMapPanel";
import useActiveFixerBooking from "@/pages/fixer/hooks/useActiveFixerBooking";
import useLiveLocationSync from "@/hooks/useLiveLocationSync";

export default function NavigationMap() {
  const navigate = useNavigate();
  const [markingArrived, setMarkingArrived] = useState(false);
  const { bookingId, job, loading, error } = useActiveFixerBooking();
  const { currentPosition, locationError } = useLiveLocationSync({
    enabled: Boolean(bookingId),
    onLocationChange: async (nextPoint) => {
      if (!bookingId) {
        return;
      }

      await httpClient.put("/fixer/settings/location", {
        location: job?.provider_location || job?.fixer_company_name || "Fixer live location",
        latitude: nextPoint.latitude,
        longitude: nextPoint.longitude,
      });
    },
  });

  const displayJob = useMemo(() => {
    if (!job || !currentPosition) {
      return job;
    }

    return {
      ...job,
      provider_latitude: currentPosition.latitude,
      provider_longitude: currentPosition.longitude,
    };
  }, [currentPosition, job]);

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
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-slate-950">
        <Loader2 className="animate-spin text-white" size={36} />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-slate-950 p-8">
        <div className="rounded-3xl border border-rose-300 bg-rose-50 p-8 text-center">
          <p className="text-sm font-semibold text-rose-700">
            {error || "Unable to load navigation details."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-64px)] overflow-hidden bg-slate-950 p-6">
      <RouteMapPanel
        job={displayJob}
        heightClass="h-full"
        showCoordinateCards={false}
        uiMode="explorer"
      />

      <div className="pointer-events-none absolute inset-0 p-6">
        <div className="flex items-start justify-between gap-4">
          <button
            type="button"
            onClick={() =>
              navigate("/dashboard/fixer/jobs/heading-to-customer", {
                state: { bookingId },
              })
            }
            className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="pointer-events-auto rounded-2xl bg-white/95 px-5 py-4 shadow-xl backdrop-blur">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#FF7A1F]">
              Customer
            </p>
            <p className="mt-1 text-sm font-bold text-slate-900">{displayJob.customer_name}</p>
            <p className="text-xs text-slate-500">{displayJob.service_address}</p>
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between gap-4">
          <div className="pointer-events-auto max-w-sm rounded-3xl bg-white/95 p-5 shadow-xl backdrop-blur">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF7ED] text-[#FF7A1F]">
                <MapPin size={22} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                  Destination
                </p>
                <p className="mt-1 text-base font-bold text-slate-900">
                  {displayJob.service_address}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {locationError
                    ? locationError
                    : currentPosition
                      ? "Live GPS tracking is active."
                      : "Waiting for device GPS permission."}
                </p>
              </div>
            </div>
          </div>

          <div className="pointer-events-auto flex gap-3">
            <a
              href={displayJob.customer_phone ? `tel:${displayJob.customer_phone}` : undefined}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-4 text-sm font-bold text-[#7C3AED] shadow-xl"
            >
              <Phone size={18} />
              {displayJob.customer_phone || "Call"}
            </a>
            <button
              type="button"
              onClick={handleArrived}
              disabled={markingArrived}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#FF7A1F] px-5 py-4 text-sm font-bold text-white shadow-xl"
            >
              <Navigation size={18} className="rotate-45" />
              {markingArrived ? "Updating..." : "Fixer Arrived"}
            </button>
          </div>
        </div>

        {locationError ? (
          <div className="pointer-events-auto absolute bottom-28 left-6 max-w-sm rounded-2xl border border-amber-200 bg-amber-50/95 p-4 text-sm text-amber-800 shadow-xl backdrop-blur">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{locationError}</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
