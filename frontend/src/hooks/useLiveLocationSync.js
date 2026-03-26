import { useEffect, useRef, useState } from "react";

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function calculateDistanceMeters(start, end) {
  const earthRadiusMeters = 6371000;
  const latitudeDelta = toRadians(end.latitude - start.latitude);
  const longitudeDelta = toRadians(end.longitude - start.longitude);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(start.latitude)) *
      Math.cos(toRadians(end.latitude)) *
      Math.sin(longitudeDelta / 2) ** 2;

  return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getGeolocationErrorMessage(error) {
  if (!error) {
    return "Unable to detect your current location.";
  }

  if (error.code === 1) {
    return "Location permission was denied.";
  }

  if (error.code === 2) {
    return "Location is unavailable right now.";
  }

  if (error.code === 3) {
    return "Location request timed out.";
  }

  return error.message || "Unable to detect your current location.";
}

export default function useLiveLocationSync({
  enabled = true,
  minimumDistance = 15,
  debounceMs = 4000,
  onLocationChange,
}) {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [locationError, setLocationError] = useState("");
  const onLocationChangeRef = useRef(onLocationChange);
  const lastSentLocationRef = useRef(null);
  const lastSentAtRef = useRef(0);
  const hasGeolocationSupport =
    typeof navigator !== "undefined" && Boolean(navigator.geolocation);

  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
  }, [onLocationChange]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    if (!hasGeolocationSupport) {
      return undefined;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const nextPoint = {
          latitude: Number(position.coords.latitude),
          longitude: Number(position.coords.longitude),
          accuracy:
            position.coords.accuracy !== null &&
            position.coords.accuracy !== undefined
              ? Number(position.coords.accuracy)
              : null,
        };

        setCurrentPosition(nextPoint);
        setLocationError("");

        const previousPoint = lastSentLocationRef.current;
        const hasMovedEnough =
          !previousPoint ||
          calculateDistanceMeters(previousPoint, nextPoint) >= minimumDistance;
        const now = Date.now();
        const hasWaitedEnough = now - lastSentAtRef.current >= debounceMs;

        if (!hasMovedEnough || !hasWaitedEnough) {
          return;
        }

        lastSentLocationRef.current = nextPoint;
        lastSentAtRef.current = now;

        void Promise.resolve(onLocationChangeRef.current?.(nextPoint)).catch(() => {
          lastSentAtRef.current = 0;
        });
      },
      (error) => {
        setLocationError(getGeolocationErrorMessage(error));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [debounceMs, enabled, hasGeolocationSupport, minimumDistance]);

  return {
    currentPosition: enabled ? currentPosition : null,
    locationError: !enabled
      ? ""
      : !hasGeolocationSupport
        ? "Geolocation is not supported in this browser."
        : locationError,
  };
}
