"use client";

import { useCallback, useEffect, useState } from "react";
import type { SearchLocation, Town } from "@/types";
import { fetchApproxLocation, fetchTowns } from "@/lib/api";
import { detectPosition, locationFromCoords, readSavedLocation, saveLocation, type DetectResult } from "@/lib/location";

const GPS_TIMEOUT_MS = 20000;

const MEDINIPUR: SearchLocation = {
  name: "Medinipur",
  district: "Paschim Medinipur",
  latitude: 22.4257,
  longitude: 87.3199,
  townId: "medinipur-sadar",
  source: "town",
};

type Status = "detecting" | "ready" | "approximate" | "failed";

const toApproxLocation = (town: Omit<Town, "doctorCount" | "establishmentCount">): SearchLocation => ({
  name: town.name,
  district: town.district,
  latitude: town.latitude,
  longitude: town.longitude,
  townId: town.id,
  source: "approx",
});

export const useSearchLocation = () => {
  const [towns, setTowns] = useState<Town[]>([]);
  const [location, setLocationState] = useState<SearchLocation>(MEDINIPUR);
  const [status, setStatus] = useState<Status>("detecting");
  const [lastDetect, setLastDetect] = useState<DetectResult | null>(null);

  const setLocation = useCallback((next: SearchLocation) => {
    setLocationState(next);
    saveLocation(next);
    setStatus("ready");
    setLastDetect(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let settled = false;
    const saved = readSavedLocation();
    const manual = saved?.source === "town" ? saved : null;

    const approxPromise = fetchApproxLocation().then((town) => (town ? toApproxLocation(town) : null));
    if (!manual) {
      approxPromise.then((approx) => {
        if (approx && !settled && !cancelled) setLocationState(approx);
      });
    }

    const resolve = async () => {
      if (saved) setLocationState(saved);
      const [townResult, position] = await Promise.all([
        fetchTowns().catch(() => ({ data: [] as Town[], defaultLocation: null })),
        detectPosition(GPS_TIMEOUT_MS),
      ]);
      settled = true;
      if (cancelled) return;
      setTowns(townResult.data);
      setLastDetect(position);
      if (position.ok) {
        setLocation(locationFromCoords(townResult.data, position.latitude, position.longitude));
        return;
      }
      if (manual) {
        setLocationState(manual);
        setStatus("failed");
        return;
      }
      const approx = await approxPromise;
      if (cancelled) return;
      const fallback = townResult.defaultLocation
        ? { ...townResult.defaultLocation, townId: townResult.defaultLocation.id, source: "town" as const }
        : MEDINIPUR;
      setLocationState(approx ?? saved ?? fallback);
      setStatus(approx ? "approximate" : "failed");
    };
    resolve();
    return () => {
      cancelled = true;
    };
  }, [setLocation]);

  const retryLocation = useCallback(async () => {
    const previous = status;
    setStatus("detecting");
    const position = await detectPosition(GPS_TIMEOUT_MS);
    setLastDetect(position);
    if (position.ok) setLocation(locationFromCoords(towns, position.latitude, position.longitude));
    else setStatus(previous === "approximate" ? "approximate" : "failed");
  }, [setLocation, status, towns]);

  return {
    towns,
    location,
    locating: status === "detecting",
    approximate: status === "approximate",
    locationFailed: status === "failed",
    locationDenied: status === "failed" && lastDetect?.ok === false && lastDetect.reason === "denied",
    retryLocation,
    setLocation,
  };
};
