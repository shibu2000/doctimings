import type { SearchLocation, Town } from "@/types";

const STORAGE_KEY = "doctimings_location";
const NEAR_TOWN_KM = 15;

export const distanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const rad = (d: number) => (d * Math.PI) / 180;
  const a =
    Math.sin(rad(lat2 - lat1) / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const nearestTown = (towns: Town[], latitude: number, longitude: number) => {
  let best: { town: Town; km: number } | null = null;
  for (const town of towns) {
    const km = distanceKm(latitude, longitude, town.latitude, town.longitude);
    if (!best || km < best.km) best = { town, km };
  }
  return best;
};

export const locationFromTown = (town: Town): SearchLocation => ({
  name: town.name,
  district: town.district,
  latitude: town.latitude,
  longitude: town.longitude,
  townId: town.id,
  source: "town",
});

export const locationFromCoords = (towns: Town[], latitude: number, longitude: number): SearchLocation => {
  const near = nearestTown(towns, latitude, longitude);
  const close = near && near.km <= NEAR_TOWN_KM;
  return {
    name: close ? `Near ${near.town.name}` : "Your location",
    district: close ? near.town.district : "",
    latitude,
    longitude,
    townId: close ? near.town.id : undefined,
    source: "gps",
  };
};

export const readSavedLocation = (): SearchLocation | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SearchLocation;
    return typeof parsed?.latitude === "number" && typeof parsed?.longitude === "number" ? parsed : null;
  } catch {
    return null;
  }
};

export const saveLocation = (location: SearchLocation) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
    localStorage.removeItem("doctimings_selected_city");
    localStorage.removeItem("docnear_selected_city");
  } catch {
  }
};

export type DetectResult =
  | { ok: true; latitude: number; longitude: number }
  | { ok: false; reason: "unsupported" | "denied" | "unavailable" };

const NETWORK_FIX_TIMEOUT_MS = 8000;

const getPosition = (options: PositionOptions) =>
  new Promise<GeolocationPosition>((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, options));

const toResult = (position: GeolocationPosition): DetectResult => ({
  ok: true,
  latitude: position.coords.latitude,
  longitude: position.coords.longitude,
});

const toFailure = (error: GeolocationPositionError): DetectResult => ({
  ok: false,
  reason: error.code === error.PERMISSION_DENIED ? "denied" : "unavailable",
});

export const detectPosition = async (timeoutMs = 20000): Promise<DetectResult> => {
  if (typeof navigator === "undefined" || !navigator.geolocation) return { ok: false, reason: "unsupported" };
  try {
    return toResult(await getPosition({ enableHighAccuracy: false, timeout: NETWORK_FIX_TIMEOUT_MS, maximumAge: 10 * 60 * 1000 }));
  } catch (error) {
    const networkError = error as GeolocationPositionError;
    if (networkError.code === networkError.PERMISSION_DENIED) return toFailure(networkError);
  }
  try {
    return toResult(await getPosition({ enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 0 }));
  } catch (error) {
    return toFailure(error as GeolocationPositionError);
  }
};
