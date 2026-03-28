import { useEffect, useMemo, useRef, useState } from "react";
import {
  GoogleMap,
  MarkerF,
  OverlayViewF,
  PolylineF,
  useJsApiLoader,
} from "@react-google-maps/api";
import {
  AlertTriangle,
  Bike,
  Clock3,
  Loader2,
  MapPin,
  Navigation,
  Search,
  UserRound,
} from "lucide-react";
import defaultProfile from "@/assets/image/default-profile.png";
import { resolveUploadUrl } from "@/lib/assets";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const libraries = [];
const DEFAULT_CAMBODIA_CENTER = { lat: 11.5564, lng: 104.9282 };
const CAMBODIA_BOUNDS = {
  north: 14.6900,
  south: 10.3400,
  west: 102.3330,
  east: 107.6277,
};
const OSM_TILE_SIZE = 256;
const MIN_OSM_ZOOM = 12;
const MAX_OSM_ZOOM = 19;

function isValidCoordinate(value) {
  return Number.isFinite(Number(value));
}

function toPoint(latitude, longitude) {
  if (!isValidCoordinate(latitude) || !isValidCoordinate(longitude)) {
    return null;
  }

  return {
    lat: Number(latitude),
    lng: Number(longitude),
  };
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

function normalizeRouteCoordinates(coordinates = []) {
  return coordinates
    .filter(
      (coordinate) =>
        Array.isArray(coordinate) &&
        coordinate.length >= 2 &&
        Number.isFinite(Number(coordinate[0])) &&
        Number.isFinite(Number(coordinate[1]))
    )
    .map((coordinate) => ({
      lat: Number(coordinate[1]),
      lng: Number(coordinate[0]),
    }));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getFallbackCenter(fixerPoint, customerPoint) {
  return {
    lat: (fixerPoint.lat + customerPoint.lat) / 2,
    lng: (fixerPoint.lng + customerPoint.lng) / 2,
  };
}

function latLngToWorldPixel(point, zoom) {
  const scale = OSM_TILE_SIZE * 2 ** zoom;
  const sinLatitude = Math.sin((point.lat * Math.PI) / 180);

  return {
    x: ((point.lng + 180) / 360) * scale,
    y:
      (0.5 -
        Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI)) *
      scale,
  };
}

function getPrimaryLocationLabel(locationText, fallback) {
  if (!locationText) {
    return fallback;
  }

  const primaryPart = String(locationText)
    .split(",")
    .map((part) => part.trim())
    .find(Boolean);

  return primaryPart || fallback;
}

function formatDistance(distanceKm) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }

  return `${distanceKm.toFixed(1)} km`;
}

function createMarkerIcon(color) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg width="44" height="60" viewBox="0 0 44 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 59C21.2 59 20.5 58.6 20 57.9C16.2 52.7 4 36.1 4 23C4 11.4 12.8 2 22 2C31.2 2 40 11.4 40 23C40 36.1 27.8 52.7 24 57.9C23.5 58.6 22.8 59 22 59Z" fill="${color}" stroke="white" stroke-width="3"/>
      <circle cx="22" cy="22" r="8" fill="white"/>
    </svg>
  `)}`;
}

function getFixerAvatarSource(image) {
  return image ? resolveUploadUrl(image) : defaultProfile;
}

function AvatarMarker({ src, alt, active = false }) {
  return (
    <div className="pointer-events-none -translate-x-1/2 -translate-y-full">
      <div
        className={`overflow-hidden rounded-full border-4 border-white bg-cyan-100 shadow-[0_12px_25px_rgba(6,182,212,0.38)] transition ${
          active ? "scale-110 ring-4 ring-cyan-200" : ""
        }`}
      >
        <img
          src={src}
          alt={alt}
          className="h-11 w-11 object-cover"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = defaultProfile;
          }}
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}

function OsmFallbackMap({
  fixerPoint,
  customerPoint,
  routePath,
  focusedTarget,
  routeAnimationOffset,
  avatarTarget,
  avatarPoint,
  avatarProfileImg,
  avatarLabel,
  pinPoint,
  pinTarget,
}) {
  const containerRef = useRef(null);
  const [viewport, setViewport] = useState({ width: 900, height: 520 });
  const [zoom, setZoom] = useState(13);

  const centerPoint = useMemo(
    () => getFallbackCenter(fixerPoint, customerPoint),
    [customerPoint, fixerPoint]
  );

  useEffect(() => {
    if (!containerRef.current || typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const observer = new ResizeObserver(([entry]) => {
      setViewport({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const centerPixel = useMemo(
    () => latLngToWorldPixel(centerPoint, zoom),
    [centerPoint, zoom]
  );
  const startX = centerPixel.x - viewport.width / 2;
  const startY = centerPixel.y - viewport.height / 2;
  const fixerPixel = useMemo(
    () => latLngToWorldPixel(fixerPoint, zoom),
    [fixerPoint, zoom]
  );
  const customerPixel = useMemo(
    () => latLngToWorldPixel(customerPoint, zoom),
    [customerPoint, zoom]
  );
  const routePixels = useMemo(
    () =>
      routePath.map((point) => {
        const routePixel = latLngToWorldPixel(point, zoom);
        return {
          x: routePixel.x - startX,
          y: routePixel.y - startY,
        };
      }),
    [routePath, startX, startY, zoom]
  );
  const routePolylinePoints = routePixels
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  const avatarSourcePixel = avatarPoint === customerPoint ? customerPixel : fixerPixel;
  const pinSourcePixel = pinPoint === customerPoint ? customerPixel : fixerPixel;
  const avatarPosition = {
    left: avatarSourcePixel.x - startX,
    top: avatarSourcePixel.y - startY,
  };
  const pinPosition = {
    left: pinSourcePixel.x - startX,
    top: pinSourcePixel.y - startY,
  };
  const directConnectorPoints = `${avatarPosition.left},${avatarPosition.top} ${pinPosition.left},${pinPosition.top}`;

  const tileColumns = Math.ceil(viewport.width / OSM_TILE_SIZE) + 2;
  const tileRows = Math.ceil(viewport.height / OSM_TILE_SIZE) + 2;
  const startTileX = Math.floor(startX / OSM_TILE_SIZE);
  const startTileY = Math.floor(startY / OSM_TILE_SIZE);
  const tiles = [];
  const tileLimit = 2 ** zoom;

  for (let column = 0; column < tileColumns; column += 1) {
    for (let row = 0; row < tileRows; row += 1) {
      const tileX = startTileX + column;
      const tileY = startTileY + row;

      if (tileY < 0 || tileY >= tileLimit) {
        continue;
      }

      const wrappedTileX = ((tileX % tileLimit) + tileLimit) % tileLimit;

      tiles.push({
        key: `${zoom}-${wrappedTileX}-${tileY}`,
        src: `https://tile.openstreetmap.org/${zoom}/${wrappedTileX}/${tileY}.png`,
        left: tileX * OSM_TILE_SIZE - startX,
        top: tileY * OSM_TILE_SIZE - startY,
      });
    }
  }

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-slate-100">
      <div className="absolute inset-0">
        {tiles.map((tile) => (
          <img
            key={tile.key}
            src={tile.src}
            alt=""
            className="absolute h-64 w-64 max-w-none select-none"
            draggable="false"
            style={{ left: tile.left, top: tile.top }}
          />
        ))}
      </div>

      <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full">
        <polyline
          points={routePolylinePoints}
          fill="none"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points={routePolylinePoints}
          fill="none"
          stroke="#1F2937"
          strokeWidth="3"
          strokeDasharray="9 7"
          strokeDashoffset={-routeAnimationOffset}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="1"
        />
        <polyline
          points={directConnectorPoints}
          fill="none"
          stroke="rgba(255,255,255,0.98)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points={directConnectorPoints}
          fill="none"
          stroke="#1F2937"
          strokeWidth="3"
          strokeDasharray="9 7"
          strokeDashoffset={-routeAnimationOffset}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div
        className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full"
        style={{ left: avatarPosition.left, top: avatarPosition.top }}
      >
        <AvatarMarker
          src={getFixerAvatarSource(avatarProfileImg)}
          alt={avatarLabel}
          active={focusedTarget === avatarTarget}
        />
      </div>

      <div
        className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full"
        style={{ left: pinPosition.left, top: pinPosition.top }}
      >
        <div
          className={`rounded-full p-3 text-white shadow-[0_12px_25px_rgba(249,115,22,0.38)] transition ${
            focusedTarget === pinTarget
              ? "scale-110 ring-4 ring-orange-200 bg-orange-500"
              : "bg-orange-500"
          }`}
        >
          <MapPin size={20} />
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-30 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-xl">
        <button
          type="button"
          onClick={() => setZoom((value) => clamp(value + 1, MIN_OSM_ZOOM, MAX_OSM_ZOOM))}
          className="flex h-11 w-11 items-center justify-center border-b border-slate-200 text-xl font-bold text-slate-700 transition hover:bg-slate-50"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => setZoom((value) => clamp(value - 1, MIN_OSM_ZOOM, MAX_OSM_ZOOM))}
          className="flex h-11 w-11 items-center justify-center text-xl font-bold text-slate-700 transition hover:bg-slate-50"
        >
          -
        </button>
      </div>
    </div>
  );
}

function MapLocationBadge({ label, tone = "customer", active = false }) {
  const toneClasses =
    tone === "fixer"
      ? "border-cyan-200 bg-white text-slate-900"
      : "border-orange-200 bg-white text-slate-900";
  const iconClasses =
    tone === "fixer"
      ? "bg-cyan-100 text-cyan-700"
      : "bg-orange-100 text-orange-600";

  return (
    <div className="pointer-events-none -translate-y-[3.6rem]">
      <div
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 shadow-lg transition ${
          active ? "scale-105 ring-4 ring-violet-200" : ""
        } ${toneClasses}`}
      >
        <div className={`rounded-full p-1.5 ${iconClasses}`}>
          <MapPin size={12} />
        </div>
        <span className="max-w-[11rem] truncate text-xs font-bold">{label}</span>
      </div>
    </div>
  );
}

export default function LocationTrackingMap({
  fixerLatitude,
  fixerLongitude,
  customerLatitude,
  customerLongitude,
  showCoordinateCard = true,
  fixerLabel = "Fixer",
  fixerProfileImg = "",
  fixerLocation = "",
  customerLabel = "Customer",
  customerProfileImg = "",
  customerLocation = "",
  uiMode = "tracking",
  focusedTarget = "route",
  profileTarget = "fixer",
}) {
  const fixerPoint = toPoint(fixerLatitude, fixerLongitude);
  const customerPoint = toPoint(customerLatitude, customerLongitude);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const shouldUseGoogleMaps =
    Boolean(apiKey) && apiKey !== "your_google_maps_key_here";
  const [mapInstance, setMapInstance] = useState(null);
  const [routeAnimationOffset, setRouteAnimationOffset] = useState(0);
  const [routePath, setRoutePath] = useState(() =>
    fixerPoint && customerPoint ? [fixerPoint, customerPoint] : []
  );

  const { isLoaded, loadError } = useJsApiLoader({
    id: "customer-tracking-map",
    googleMapsApiKey: shouldUseGoogleMaps ? apiKey : "",
    libraries,
    language: "en",
    region: "KH",
  });

  const mapCenter = useMemo(() => {
    if (fixerPoint && customerPoint) {
      return {
        lat: (fixerPoint.lat + customerPoint.lat) / 2,
        lng: (fixerPoint.lng + customerPoint.lng) / 2,
      };
    }

    return fixerPoint || customerPoint || DEFAULT_CAMBODIA_CENTER;
  }, [customerPoint, fixerPoint]);

  const distanceKm = useMemo(() => {
    if (!fixerPoint || !customerPoint) {
      return 0;
    }

    return calculateDistanceKm(fixerPoint, customerPoint);
  }, [customerPoint, fixerPoint]);

  const etaMinutes = useMemo(() => {
    if (!distanceKm) {
      return 0;
    }

    return Math.max(0, Math.round((distanceKm / 28) * 60));
  }, [distanceKm]);

  const routeSummary = useMemo(() => {
    const fromLabel = getPrimaryLocationLabel(fixerLocation, fixerLabel);
    const toLabel = getPrimaryLocationLabel(customerLocation, customerLabel);

    return {
      fromLabel,
      toLabel,
      locality:
        getPrimaryLocationLabel(customerLocation, "") ||
        getPrimaryLocationLabel(fixerLocation, "Phnom Penh"),
    };
  }, [customerLabel, customerLocation, fixerLabel, fixerLocation]);

  const fixerBadgeLabel = useMemo(
    () => getPrimaryLocationLabel(fixerLocation, fixerLabel),
    [fixerLabel, fixerLocation]
  );

  const customerBadgeLabel = useMemo(
    () => getPrimaryLocationLabel(customerLocation, customerLabel),
    [customerLabel, customerLocation]
  );
  const fixerAvatarSrc = useMemo(
    () => getFixerAvatarSource(fixerProfileImg),
    [fixerProfileImg]
  );
  const customerAvatarSrc = useMemo(
    () => getFixerAvatarSource(customerProfileImg),
    [customerProfileImg]
  );
  const avatarTarget = profileTarget === "customer" ? "customer" : "fixer";
  const avatarPoint = avatarTarget === "customer" ? customerPoint : fixerPoint;
  const avatarSrc = avatarTarget === "customer" ? customerAvatarSrc : fixerAvatarSrc;
  const avatarLabel = avatarTarget === "customer" ? customerLabel : fixerLabel;
  const pinPoint = avatarTarget === "customer" ? fixerPoint : customerPoint;
  const pinTarget = avatarTarget === "customer" ? "fixer" : "customer";
  const customerMarkerIcon = useMemo(() => {
    if (!shouldUseGoogleMaps || !isLoaded || !window.google?.maps) {
      return undefined;
    }

    return {
      url: createMarkerIcon("#F97316"),
      scaledSize: new window.google.maps.Size(44, 60),
      labelOrigin: new window.google.maps.Point(22, 22),
    };
  }, [isLoaded, shouldUseGoogleMaps]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setRouteAnimationOffset((value) => (value + 2) % 44);
    }, 120);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!fixerPoint || !customerPoint) {
      setRoutePath([]);
      return undefined;
    }

    const abortController = new AbortController();

    const loadRoute = async () => {
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${fixerPoint.lng},${fixerPoint.lat};${customerPoint.lng},${customerPoint.lat}?overview=full&geometries=geojson`,
          {
            signal: abortController.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load route");
        }

        const data = await response.json();
        const coordinates = data?.routes?.[0]?.geometry?.coordinates;
        const nextRoutePath = normalizeRouteCoordinates(coordinates);

        if (nextRoutePath.length >= 2) {
          setRoutePath(nextRoutePath);
          return;
        }
      } catch {
        if (abortController.signal.aborted) {
          return;
        }
      }

      setRoutePath([fixerPoint, customerPoint]);
    };

    void loadRoute();

    return () => {
      abortController.abort();
    };
  }, [customerPoint, fixerPoint]);

  useEffect(() => {
    if (!mapInstance || !window.google?.maps) {
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(fixerPoint);
    bounds.extend(customerPoint);
    mapInstance.fitBounds(bounds, focusedTarget === "route" ? 80 : 120);
  }, [customerPoint, fixerPoint, focusedTarget, mapInstance]);

  if (!fixerPoint || !customerPoint) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-amber-50 p-6 text-center">
        <AlertTriangle className="text-amber-500" size={26} />
        <p className="text-sm font-semibold text-amber-800">
          Missing fixer or customer coordinates.
        </p>
      </div>
    );
  }

  const content = !shouldUseGoogleMaps || loadError ? (
    <OsmFallbackMap
      fixerPoint={fixerPoint}
      customerPoint={customerPoint}
      routePath={routePath.length >= 2 ? routePath : [fixerPoint, customerPoint]}
      focusedTarget={focusedTarget}
      routeAnimationOffset={routeAnimationOffset}
      avatarTarget={avatarTarget}
      avatarPoint={avatarPoint}
      avatarProfileImg={avatarTarget === "customer" ? customerProfileImg : fixerProfileImg}
      avatarLabel={avatarLabel}
      pinPoint={pinPoint}
      pinTarget={pinTarget}
    />
  ) : !isLoaded ? (
    <div className="flex h-full items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-slate-400" size={28} />
    </div>
  ) : (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={mapCenter}
      zoom={13}
      onLoad={(map) => {
        setMapInstance(map);
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(fixerPoint);
        bounds.extend(customerPoint);
        map.fitBounds(bounds, 80);
      }}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        restriction: {
          latLngBounds: CAMBODIA_BOUNDS,
          strictBounds: false,
        },
      }}
    >
      <OverlayViewF position={avatarPoint} mapPaneName="overlayMouseTarget">
        <AvatarMarker
          src={avatarSrc}
          alt={avatarLabel}
          active={focusedTarget === avatarTarget}
        />
      </OverlayViewF>
      <MarkerF
        position={pinPoint}
        icon={customerMarkerIcon}
        label={{
          text: pinTarget === "fixer" ? "F" : "C",
          color: "#0F172A",
          fontWeight: "700",
        }}
      />
      <PolylineF
        path={routePath.length >= 2 ? routePath : [fixerPoint, customerPoint]}
        options={{
          strokeColor: "#FFFFFF",
          strokeOpacity: 0.95,
          strokeWeight: 10,
          zIndex: 90,
        }}
      />
      <PolylineF
        path={routePath.length >= 2 ? routePath : [fixerPoint, customerPoint]}
        options={{
          strokeOpacity: 0,
          strokeWeight: 3,
          zIndex: 91,
          icons: [
            {
              icon: {
                path: "M 0,-1 0,1",
                strokeOpacity: 1,
                strokeColor: "#1F2937",
                scale: 3,
              },
              offset: `${routeAnimationOffset}px`,
              repeat: "16px",
            },
          ],
        }}
      />
      <PolylineF
        path={[avatarPoint, pinPoint]}
        options={{
          strokeColor: "#FFFFFF",
          strokeOpacity: 0.98,
          strokeWeight: 14,
          zIndex: 92,
          geodesic: true,
        }}
      />
      <PolylineF
        path={[avatarPoint, pinPoint]}
        options={{
          strokeOpacity: 0,
          strokeWeight: 3,
          zIndex: 93,
          geodesic: true,
          icons: [
            {
              icon: {
                path: "M 0,-1 0,1",
                strokeOpacity: 1,
                strokeColor: "#1F2937",
                scale: 3,
              },
              offset: `${routeAnimationOffset}px`,
              repeat: "16px",
            },
          ],
        }}
      />
      <OverlayViewF
        position={fixerPoint}
        mapPaneName="floatPane"
      >
        <MapLocationBadge
          label={fixerBadgeLabel}
          tone="fixer"
          active={focusedTarget === "fixer"}
        />
      </OverlayViewF>
      <OverlayViewF
        position={customerPoint}
        mapPaneName="floatPane"
      >
        <MapLocationBadge
          label={customerBadgeLabel}
          tone="customer"
          active={focusedTarget === "customer"}
        />
      </OverlayViewF>
    </GoogleMap>
  );

  return (
    <div className="relative h-full w-full">
      {content}

      <div className="pointer-events-none absolute inset-0">
        {uiMode === "explorer" ? (
          <>
            <div className="absolute left-4 top-4 hidden w-[23rem] max-w-[calc(100%-2rem)] rounded-[1.75rem] border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur md:block">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <Search size={18} className="text-slate-400" />
                <span className="flex-1 text-sm font-medium text-slate-500">
                  Search Google Maps
                </span>
                <Navigation size={18} className="text-[#0B79D0]" />
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-3 rounded-2xl px-3 py-2.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">
                    <Bike size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-base font-bold text-slate-900">
                        {fixerLabel}
                      </p>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
                        Live
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {fixerLocation || "Current fixer location"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl px-3 py-2.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                    <UserRound size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-base font-bold text-slate-900">
                        {customerLabel}
                      </p>
                      <span className="text-sm font-semibold text-[#0B79D0]">
                        Destination
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {customerLocation || "Customer pickup location"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-center text-sm font-semibold text-[#0B79D0]">
                  Live route between fixer and customer
                </p>
              </div>
            </div>

            <div className="absolute left-1/2 top-4 hidden -translate-x-1/2 gap-3 md:flex">
              {["Restaurants", "Hotels", "Things to do", "Museums", "Transit"].map((item) => (
                <div
                  key={item}
                  className="rounded-full border border-slate-200 bg-white/95 px-4 py-2 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="absolute bottom-4 left-4 hidden w-[23rem] max-w-[calc(100%-2rem)] rounded-[1.5rem] border border-slate-200 bg-white/95 p-5 shadow-2xl backdrop-blur md:block">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xl font-bold text-slate-900">
                    {routeSummary.locality}
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-700">
                    Live traffic on this route
                  </p>
                  <p className="text-sm text-slate-500">
                    Fixer and customer positions update from browser GPS.
                  </p>
                </div>
                <div className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">
                  {etaMinutes} min
                </div>
              </div>
            </div>

          </>
        ) : (
          <>
            <div className="absolute left-4 right-4 top-4 md:hidden">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur">
                <Search size={18} className="text-slate-400" />
                <span className="flex-1 text-sm font-medium text-slate-500">
                  Search Google Maps
                </span>
                <Navigation size={18} className="text-[#0B79D0]" />
              </div>
            </div>

            <div className="absolute bottom-4 left-4 max-w-[calc(100%-2rem)] rounded-[1.5rem] border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-[#E8F4FF] p-3 text-[#0B79D0]">
                  <Clock3 size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Arriving In
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {etaMinutes} mins
                  </p>
                  <p className="text-sm font-semibold text-[#0B79D0]">
                    {formatDistance(distanceKm)} left
                  </p>
                </div>
              </div>
            </div>

            {showCoordinateCard ? (
              <div className="absolute bottom-4 right-4 hidden rounded-[1.5rem] border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur md:block">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-orange-100 p-3 text-orange-600">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      GPS Labels
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      Fixer and customer markers are live
                    </p>
                    <p className="text-sm text-slate-500">
                      Route updates without raw coordinate text
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
