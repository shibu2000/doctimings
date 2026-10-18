"use client";

import { useCallback, useEffect, useState } from "react";
import type { SearchLocation, Town } from "@/types";
import { fetchTowns } from "@/lib/api";
import { detectPosition, locationFromCoords, readSavedLocation, saveLocation, type DetectResult } from "@/lib/location";

const MEDINIPUR: SearchLocation = {
  name: "Medinipur",
  district: "Paschim Medinipur",
  latitude: 22.4257,
  longitude: 87.3199,
  townId: "medinipur-sadar",
  source: "town",
};

export const useSearchLocation = () => {
  const [towns, setTowns] = useState<Town[]>([]);
  const [location, setLocationState] = useState<SearchLocation | null>(null);
  const [locating, setLocating] = useState(true);
  const [lastDetect, setLastDetect] = useState<DetectResult | null>(null);

  const setLocation = useCallback((next: SearchLocation) => {
    setLocationState(next);
    saveLocation(next);
    setLastDetect(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const resolve = async () => {
      const [townResult, position] = await Promise.all([
        fetchTowns().catch(() => ({ data: [] as Town[], defaultLocation: null })),
        detectPosition(10000),
      ]);
      if (cancelled) return;
      setTowns(townResult.data);
      if (position.ok) {
        setLocation(locationFromCoords(townResult.data, position.latitude, position.longitude));
        setLastDetect(position);
      } else {
        const fallback = townResult.defaultLocation
          ? { ...townResult.defaultLocation, townId: townResult.defaultLocation.id, source: "town" as const }
          : MEDINIPUR;
        setLocationState(readSavedLocation() ?? fallback);
        setLastDetect(position);
      }
      setLocating(false);
    };
    resolve();
    return () => {
      cancelled = true;
    };
  }, [setLocation]);

  return { towns, location, locating, locationDenied: lastDetect?.ok === false && lastDetect.reason === "denied", setLocation };
};
