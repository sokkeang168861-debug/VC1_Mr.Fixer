import { useMemo, useState } from "react";
import { AlertTriangle, Loader2, MapPin, Navigation, Phone, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import httpClient from "@/api/httpClient";
import RouteMapPanel from "@/pages/fixer/components/RouteMapPanel";
import useActiveFixerBooking from "@/pages/fixer/hooks/useActiveFixerBooking";
import useLiveLocationSync from "@/hooks/useLiveLocationSync";

export default function HeadingToCustomer() {
  const navigate = useNavigate();
  const [focusedTarget, setFocusedTarget] = useState("route");
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

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#FF7A1F]">
            Heading To Customer
          </p>
          <h1 className="mt-3 text-3xl font-black text-slate-900">
            {displayJob.customer_name}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {displayJob.service_address || "Customer location"}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Assigned Fixer
              </p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                {displayJob.fixer_name || displayJob.fixer_company_name || "Fixer"}
              </p>
              <p className="text-sm text-slate-500">
                {displayJob.fixer_company_name || displayJob.provider_location || "On route"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Customer Contact
              </p>
              <a
                href={displayJob.customer_phone ? `tel:${displayJob.customer_phone}` : undefined}
                className="mt-2 inline-flex items-center gap-2 text-lg font-bold text-[#7C3AED]"
              >
                <Phone size={18} />
                {displayJob.customer_phone || "No phone"}
              </a>
              <p className="text-sm text-slate-500">{displayJob.customer_email || ""}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
            Job Snapshot
          </p>
          <div className="mt-5 space-y-4">
            <button
              type="button"
              onClick={() => setFocusedTarget("customer")}
              className={`flex w-full items-start gap-3 rounded-2xl p-4 text-left transition ${
                focusedTarget === "customer"
                  ? "bg-orange-100 ring-1 ring-orange-300"
                  : "bg-[#FFF7ED] hover:bg-orange-50"
              }`}
            >
              <MapPin className="mt-0.5 text-[#FF7A1F]" size={18} />
              <div>
                <p className="text-sm font-semibold text-slate-900">Customer Live Location</p>
                <p className="text-xs text-slate-500">
                  {displayJob.service_address || "Customer GPS location is active"}
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFocusedTarget("fixer")}
              className={`flex w-full items-start gap-3 rounded-2xl p-4 text-left transition ${
                focusedTarget === "fixer"
                  ? "bg-cyan-50 ring-1 ring-cyan-300"
                  : "bg-slate-50 hover:bg-slate-100"
              }`}
            >
              <Navigation className="mt-0.5 rotate-45 text-slate-700" size={18} />
              <div>
                <p className="text-sm font-semibold text-slate-900">Fixer Live GPS</p>
                <p className="text-xs text-slate-500">
                  {currentPosition
                    ? "Sharing your current location in real time."
                    : "Waiting for your device location."}
                </p>
              </div>
            </button>

            <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
              <Wallet className="mt-0.5 text-emerald-600" size={18} />
              <div>
                <p className="text-sm font-semibold text-slate-900">Current Estimate</p>
                <p className="text-xs text-slate-500">
                  ${Number(displayJob.service_fee || 0).toFixed(2)} for booking #{bookingId}
                </p>
              </div>
            </div>
          </div>

          {locationError ? (
            <div className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{locationError}</span>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() =>
              navigate("/dashboard/fixer/jobs/navigation-map", {
                state: { bookingId },
              })
            }
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF7A1F] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-[#E66D1C]"
          >
            <Navigation size={18} className="rotate-45" />
            Open Navigation Map
          </button>
        </div>
      </div>

      <RouteMapPanel
        job={displayJob}
        heightClass="h-[520px]"
        focusedTarget={focusedTarget}
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleArrived}
          disabled={markingArrived}
          className="rounded-2xl bg-slate-900 px-8 py-4 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          {markingArrived ? "Updating..." : "I Have Arrived"}
        </button>
      </div>
    </div>
  );
}
