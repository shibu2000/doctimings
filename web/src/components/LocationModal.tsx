"use client";

import React, { useState } from "react";
import { X, Navigation, Search, Check, AlertCircle } from "lucide-react";
import { BengalCity } from "@/types";
import { BENGAL_CITIES, POPULAR_DISTRICTS, findNearestBengalCity } from "@/data/bengalLocations";

interface LocationModalProps {
  isOpen: boolean;
  currentCity: BengalCity;
  onClose: () => void;
  onSelectCity: (city: BengalCity) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  currentCity,
  onClose,
  onSelectCity,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [detectedNote, setDetectedNote] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setLocationError(null);
    setDetectedNote(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const nearest = findNearestBengalCity(latitude, longitude);
        setIsLocating(false);
        setDetectedNote(`Detected your location near ${nearest.name} (${nearest.district})`);
        setTimeout(() => {
          onSelectCity({
            ...nearest,
            latitude,
            longitude,
          });
          onClose();
        }, 600);
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError("Location permission denied. Please select your town or district manually below.");
        } else {
          setLocationError("Unable to retrieve your location. Please pick your town from the list.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const filteredCities = BENGAL_CITIES.filter((city) => {
    const q = searchTerm.toLowerCase().trim();
    return (
      city.name.toLowerCase().includes(q) ||
      city.district.toLowerCase().includes(q)
    );
  });

  const popularCities = BENGAL_CITIES.filter((c) => c.isPopular);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Select Your Location</h2>
            <p className="text-xs text-slate-500">Find doctors and chambers closest to your town</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-3">
          <button
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-semibold text-sm transition-all shadow-xs disabled:opacity-70 cursor-pointer"
          >
            <Navigation className={`w-4 h-4 text-teal-200 ${isLocating ? "animate-spin" : ""}`} />
            <span>{isLocating ? "Detecting GPS location..." : "Use My Current Location"}</span>
          </button>

          {detectedNote && (
            <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{detectedNote}</span>
            </div>
          )}

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
              placeholder="Search town, block, or district (e.g. Kalna, Gopiballavpur)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-5">
          {!searchTerm && (
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 block">
                Popular Hubs in Bengal
              </span>
              <div className="flex flex-wrap gap-2">
                {popularCities.map((city) => {
                  const isSelected = city.id === currentCity.id;
                  return (
                    <button
                      key={city.id}
                      onClick={() => {
                        onSelectCity(city);
                        onClose();
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? "bg-teal-700 text-white"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      {city.name}
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 block">
              {searchTerm ? "Search Results" : "Browse by District"}
            </span>

            {filteredCities.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No location found matching &ldquo;{searchTerm}&rdquo;. Try another town or district.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {POPULAR_DISTRICTS.map((dist) => {
                  const distCities = filteredCities.filter((c) => c.district === dist);
                  if (distCities.length === 0) return null;

                  return (
                    <div key={dist} className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-teal-900 bg-teal-50/70 px-2.5 py-1 rounded-md">
                        {dist}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
                        {distCities.map((city) => {
                          const isSelected = city.id === currentCity.id;
                          return (
                            <button
                              key={city.id}
                              onClick={() => {
                                onSelectCity(city);
                                onClose();
                              }}
                              className={`flex items-center justify-between p-2 rounded-lg text-left text-xs font-medium transition-colors cursor-pointer ${
                                isSelected
                                  ? "bg-teal-100/70 text-teal-900 font-bold"
                                  : "hover:bg-slate-100 text-slate-700"
                              }`}
                            >
                              <span>{city.name}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-teal-700" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
