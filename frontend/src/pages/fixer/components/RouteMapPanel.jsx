import LocationTrackingMap from "@/components/LocationTrackingMap";

export default function RouteMapPanel({
  job,
  heightClass = "h-[420px]",
  showCoordinateCards = false,
  uiMode = "tracking",
  focusedTarget = "route",
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-900 shadow-xl ${heightClass}`}
    >
      <LocationTrackingMap
        fixerLatitude={job?.provider_latitude}
        fixerLongitude={job?.provider_longitude}
        customerLatitude={job?.latitude}
        customerLongitude={job?.longitude}
        fixerLabel={job?.fixer_name || job?.fixer_company_name || "Fixer"}
        fixerLocation={job?.provider_location || ""}
        customerLabel={job?.customer_name || "Customer"}
        customerLocation={job?.service_address || ""}
        showCoordinateCard={showCoordinateCards}
        uiMode={uiMode}
        focusedTarget={focusedTarget}
      />
    </div>
  );
}
