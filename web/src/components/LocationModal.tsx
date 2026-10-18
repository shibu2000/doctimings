"use client";

import React, { useEffect, useState } from "react";
import { X, Navigation, Search, Check, AlertCircle } from "lucide-react";
import type { SearchLocation, Town } from "@/types";
import { detectPosition, locationFromCoords, locationFromTown } from "@/lib/location";

interface LocationModalProps {
  isOpen: boolean;
  towns: Town[];
  current: SearchLocation | null;
  onClose: () => void;
  onSelect: (location: SearchLocation) => void;
}

const DENIED_MESSAGE = "Location permission is blocked. Allow location for this site in your browser settings, or pick your town below.";

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, towns, current, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const close = () => {
    setSearchTerm("");
    setLocationError(null);
    onClose();
  };

  const choose = (location: SearchLocation) => {
    onSelect(location);
    close();
  };

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setLocationError(null);
    const result = await detectPosition(10000);
    setIsLocating(false);
    if (result.ok) {
      choose(locationFromCoords(towns, result.latitude, result.longitude));
    } else if (result.reason === "denied") {
      setLocationError(DENIED_MESSAGE);
    } else if (result.reason === "unsupported") {
      setLocationError("This browser cannot share your location. Please pick your town below.");
    } else {
      setLocationError("Could not find your location. Check that location is on, or pick your town below.");
    }
  };

  const q = searchTerm.toLowerCase().trim();
  const filtered = towns.filter((t) => !q || t.name.toLowerCase().includes(q) || t.district.toLowerCase().includes(q));
  const districts = [...new Set(filtered.map((t) => t.district))];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/60" onClick={close} />
      <div className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden" role="dialog" aria-modal="true" aria-label="Choose your location">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Where are you?</h2>
            <p className="text-xs text-slate-500">We show doctors closest to you first</p>
          </div>
          <button onClick={close} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-3">
          <button
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm shadow-xs disabled:opacity-70 cursor-pointer"
          >
            <Navigation className={`w-4 h-4 text-teal-200 ${isLocating ? "animate-pulse" : ""}`} />
            <span>{isLocating ? "Finding your location…" : "Use my current location"}</span>
          </button>

          {locationError && (
            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{locationError}</span>
            </div>
          )}

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search your town or district"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
              aria-label="Search town"
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-4">
          {towns.length === 0 ? (
            <p className="text-center py-8 text-slate-500 text-sm">Town list could not be loaded. Use your current location instead.</p>
          ) : filtered.length === 0 ? (
            <p className="text-center py-8 text-slate-500 text-sm">
              No doctors listed in &ldquo;{searchTerm}&rdquo; yet. Try a nearby town or use your current location.
            </p>
          ) : (
            districts.map((district) => (
              <div key={district} className="flex flex-col gap-1">
                <span className="text-xs font-bold text-teal-900 bg-teal-50/70 px-2.5 py-1 rounded-md">{district}</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
                  {filtered
                    .filter((t) => t.district === district)
                    .map((town) => {
                      const selected = current?.townId === town.id && current.source === "town";
                      return (
                        <button
                          key={town.id}
                          onClick={() => choose(locationFromTown(town))}
                          className={`flex items-center justify-between p-2 rounded-lg text-left text-sm transition-colors cursor-pointer ${
                            selected ? "bg-teal-100/70 text-teal-900 font-bold" : "hover:bg-slate-100 text-slate-700"
                          }`}
                        >
                          <span>
                            {town.name}
                            <span className="block text-xs font-normal text-slate-500">
                              {town.doctorCount} doctor{town.doctorCount === 1 ? "" : "s"}
                            </span>
                          </span>
                          {selected && <Check className="w-4 h-4 text-teal-700" />}
                        </button>
                      );
                    })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
