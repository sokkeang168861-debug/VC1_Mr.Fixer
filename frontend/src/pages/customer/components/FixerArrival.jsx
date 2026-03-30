import React, { useMemo, useState } from "react";
import { Phone, MapPin, Bike, User, Wrench } from "lucide-react";
import LocationTrackingMap from "@/components/LocationTrackingMap";

const FixerArrival = ({ booking }) => {
  const [focusedTarget, setFocusedTarget] = useState("route");
  const displayBooking = useMemo(() => booking, [booking]);
  const categoryName = booking?.category_name || "Assigned Service";
  const categoryImage = booking?.category_image || "";
  const bookingId = booking?.id || "N/A";
  const fixerName =
    displayBooking?.fixer_name ||
    displayBooking?.fixer_company_name ||
    "Assigned Fixer";
  const fixerPhone = displayBooking?.fixer_phone || "No phone available";
  const fixerAvatar = displayBooking?.fixer_avatar || "";

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">My Bookings</h1>
        <p className="text-slate-500">Manage and track your service requests.</p>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden bg-violet-100 text-violet-600 ring-1 ring-slate-200">
              {categoryImage ? (
                <img
                  src={categoryImage}
                  alt={categoryName}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Wrench className="w-8 h-8" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{categoryName}</h2>
              <p className="text-sm text-slate-400 font-medium">
                Service ID: #HF-{String(bookingId).padStart(5, "0")}
              </p>
            </div>
          </div>
          <span className="px-4 py-1.5 bg-orange-50 text-orange-600 text-xs font-bold rounded-full border border-orange-100">
            Fixer En Route
          </span>
        </div>

        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center overflow-hidden ring-1 ring-orange-200">
              {fixerAvatar ? (
                <img
                  src={fixerAvatar}
                  alt={fixerName}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="h-6 w-6 text-orange-500" />
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                Assigned Expert
              </p>
              <h4 className="font-bold text-slate-800">{fixerName}</h4>
              <p className="text-xs text-slate-500">
                {booking?.fixer_company_name || booking?.provider_location || ""}
              </p>
            </div>
          </div>
          <a
            href={displayBooking?.fixer_phone ? `tel:${displayBooking.fixer_phone}` : undefined}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 text-violet-600"
          >
            <Phone className="w-4 h-4 fill-violet-600" />
            <span className="text-sm font-bold">{fixerPhone}</span>
          </a>
        </div>

        <div className="relative h-[400px] rounded-[24px] overflow-hidden border border-slate-100">
          <LocationTrackingMap
            fixerLatitude={displayBooking?.provider_latitude}
            fixerLongitude={displayBooking?.provider_longitude}
            customerLatitude={displayBooking?.latitude}
            customerLongitude={displayBooking?.longitude}
            fixerLabel={fixerName}
            fixerLocation={displayBooking?.provider_location || ""}
            customerLabel="You"
            customerLocation={displayBooking?.service_address || ""}
            showCoordinateCard={false}
            focusedTarget={focusedTarget}
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setFocusedTarget("customer")}
            className={`rounded-2xl border p-4 text-left transition ${
              focusedTarget === "customer"
                ? "border-violet-300 bg-violet-50 shadow-sm"
                : "border-slate-100 bg-slate-50 hover:border-violet-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 text-violet-600" size={18} />
              <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Booking Address
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {displayBooking?.service_address || "No address available"}
              </p>
              <p className="text-xs text-slate-500">
                Displaying the booked service address on the map.
              </p>
            </div>
          </div>
          </button>

          <button
            type="button"
            onClick={() => setFocusedTarget("fixer")}
            className={`rounded-2xl border p-4 text-left transition ${
              focusedTarget === "fixer"
                ? "border-orange-300 bg-orange-50 shadow-sm"
                : "border-slate-100 bg-slate-50 hover:border-orange-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <Bike className="mt-0.5 text-orange-500" size={18} />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Fixer Live Location
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {displayBooking?.provider_location || "No fixer location available"}
                </p>
                <p className="text-xs text-slate-500">
                  {displayBooking?.provider_latitude !== null &&
                  displayBooking?.provider_latitude !== undefined
                    ? "Receiving the fixer's live GPS on the map."
                    : "Waiting for fixer GPS updates."}
                </p>
              </div>
            </div>
          </button>
        </div>

      </div>

    </div>
  );
};

export default FixerArrival;
