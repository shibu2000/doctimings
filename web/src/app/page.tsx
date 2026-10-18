"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  Search, 
  MapPin, 
  SlidersHorizontal, 
  RotateCcw, 
  CalendarDays, 
  CheckCircle2, 
  AlertCircle,
  Building,
  Users
} from "lucide-react";
import type { Doctor, SearchApiResponse, Town } from "@/types";
import { fetchDoctors } from "@/lib/api";
import { distanceKm, locationFromTown } from "@/lib/location";
import { useSearchLocation } from "@/hooks/useSearchLocation";
import { Header } from "@/components/Header";
import { LocationModal } from "@/components/LocationModal";
import { SpecialtyFilter } from "@/components/SpecialtyFilter";
import { DoctorCard } from "@/components/DoctorCard";
import { DoctorDetailsModal } from "@/components/DoctorDetailsModal";
import { SmartAppBanner } from "@/components/SmartAppBanner";
import { AppDownloadModal } from "@/components/AppDownloadModal";
import { Footer } from "@/components/Footer";

const RADIUS_OPTIONS = [15, 25, 50, 100];

export default function HomePage() {
  const { towns, location, locating, locationDenied, setLocation } = useSearchLocation();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [radiusKm, setRadiusKm] = useState(25);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [meta, setMeta] = useState<{ total: number; radiusKm: number; expanded: boolean } | null>(null);
  const requestId = useRef(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSelectTown = (town: Town) => setLocation(locationFromTown(town));

  const placeName = location?.name ?? "your area";

  const loadDoctors = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const response: SearchApiResponse = await fetchDoctors({
        q: searchQuery.trim() || undefined,
        latitude: location?.latitude,
        longitude: location?.longitude,
        radiusKm,
        specialty: selectedSpecialty !== "All" ? selectedSpecialty : undefined,
        availableOnly,
        limit: 50,
      });
      if (id !== requestId.current) return;
      setDoctors(response.data || []);
      setMeta({
        total: response.pagination?.total ?? response.data.length,
        radiusKm: response.searchMeta?.appliedRadiusKm ?? radiusKm,
        expanded: Boolean(response.searchMeta?.autoExpandedRadius),
      });
    } catch (err: unknown) {
      if (id !== requestId.current) return;
      setError(err instanceof Error ? err.message : "Failed to load doctors");
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [location, searchQuery, selectedSpecialty, availableOnly, radiusKm]);

  useEffect(() => {
    if (locating) return;
    const timer = setTimeout(loadDoctors, 250);
    return () => clearTimeout(timer);
  }, [loadDoctors, locating]);

  const nearbyTowns = location
    ? towns
        .filter((t) => t.doctorCount > 0 && t.id !== location.townId)
        .map((t) => ({ town: t, km: distanceKm(location.latitude, location.longitude, t.latitude, t.longitude) }))
        .sort((a, b) => a.km - b.km)
        .slice(0, 3)
    : [];

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedSpecialty("All");
    setAvailableOnly(false);
    setRadiusKm(25);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header
        location={location}
        locating={locating}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onOpenAppModal={() => setIsAppModalOpen(true)}
      />

      <main className="flex-1 flex flex-col pb-28 sm:pb-20">
        <section className="bg-gradient-to-b from-teal-900 via-teal-800 to-teal-900 text-white pt-8 pb-10 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800/80 border border-teal-700/80 text-teal-200 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-teal-300 animate-pulse" />
              <span>Real-Time Chamber Availability</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight max-w-2xl leading-tight">
              Find Doctors &amp; Chamber Timings Near You
            </h1>

            <p className="text-xs sm:text-sm text-teal-100 max-w-lg leading-relaxed">
              {locating ? (
                "Finding doctors near you…"
              ) : (
                <>
                  Doctors and chamber timings around <span className="font-semibold text-white">{placeName}{location?.district ? ` (${location.district})` : ""}</span>
                </>
              )}
            </p>

            <div className="w-full max-w-2xl mt-2 flex flex-col gap-2">
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search doctor, specialty, or clinic name (e.g. Skin, Dr. Amit Das)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-13 pl-12 pr-4 bg-white text-slate-900 rounded-2xl shadow-lg border border-teal-600/30 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-teal-400/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-1 rounded-md"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-teal-200/90 px-1 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-300" />
                  <span>{locating ? "Detecting your location…" : locationDenied && location?.source !== "gps" ? `Location is off · showing ${placeName}` : `Searching around ${placeName}`}</span>
                </span>
                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  className="text-teal-200 hover:text-white underline font-semibold cursor-pointer"
                >
                  Change Town
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-6 flex flex-col gap-5">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col gap-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-teal-700" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Filter by Specialty
                </span>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => setAvailableOnly(!availableOnly)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    availableOnly
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>Available Today Only</span>
                  {availableOnly && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>

                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="text-slate-400">Radius:</span>
                  <select
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                    aria-label="Search radius in kilometers"
                    className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-700 cursor-pointer"
                  >
                    {RADIUS_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        Within {r} km
                      </option>
                    ))}
                  </select>
                </div>

                {(searchQuery || selectedSpecialty !== "All" || availableOnly || radiusKm !== 25) && (
                  <button
                    onClick={handleResetFilters}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            <SpecialtyFilter
              selectedSpecialty={selectedSpecialty}
              onSelectSpecialty={setSelectedSpecialty}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-baseline gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Verified Doctor Chambers
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                {!loading && meta && `(${meta.total} ${meta.total === 1 ? "doctor" : "doctors"} within ${meta.radiusKm} km)`}
              </span>
            </div>

            <span className="text-xs text-teal-800 font-semibold bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200 hidden sm:inline-block">
              {meta?.expanded ? `Nothing within ${radiusKm} km · widened to ${meta.radiusKm} km` : `Radius: ${radiusKm} km`}
            </span>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
              <button
                onClick={loadDoctors}
                className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-900 rounded-md font-semibold text-xs cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {loading || locating ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-4.5 flex flex-col gap-3 animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-13 h-13 rounded-xl bg-slate-200 shrink-0" />
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                      <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                    </div>
                  </div>
                  <div className="h-9 bg-slate-100 rounded-lg" />
                  <div className="h-8 bg-slate-200 rounded-lg" />
                </div>
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-700">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                No doctors found near {placeName}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md">
                {nearbyTowns.length
                  ? "Try a wider radius, clear the filters, or look in a nearby town:"
                  : "Try a wider radius or clear the filters."}
              </p>
              {nearbyTowns.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {nearbyTowns.map(({ town, km }) => (
                    <button
                      key={town.id}
                      onClick={() => handleSelectTown(town)}
                      className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 text-xs font-semibold cursor-pointer"
                    >
                      {town.name} · {town.doctorCount} doctors · {Math.round(km)} km
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => setRadiusKm(50)}
                  className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Expand Radius to 50 km
                </button>
                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Change Location
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5">
              {doctors.map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  onSelect={setSelectedDoctor}
                />
              ))}
            </div>
          )}

          <div className="mt-4 p-5 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-teal-950">Are you a Clinic, Chamber, or Pharmacy?</h4>
                <p className="text-xs text-teal-800">
                  Update your daily visiting doctors, chamber timings, and availability on the DocTimings Partner Portal.
                </p>
              </div>
            </div>

            <a
              href={process.env.NEXT_PUBLIC_ADMIN_URL || "https://admin-doctimings.vercel.app"}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-white border border-teal-300 hover:bg-teal-100 text-teal-900 font-bold text-xs shrink-0 text-center transition-colors shadow-xs"
            >
              Partner / Admin Login &rarr;
            </a>
          </div>
        </div>
      </main>

      <Footer towns={towns} onSelectTown={handleSelectTown} />

      <SmartAppBanner onOpenAppModal={() => setIsAppModalOpen(true)} />

      <LocationModal
        isOpen={isLocationModalOpen}
        towns={towns}
        current={location}
        onClose={() => setIsLocationModalOpen(false)}
        onSelect={setLocation}
      />

      <DoctorDetailsModal
        doctor={selectedDoctor}
        onClose={() => setSelectedDoctor(null)}
        onOpenAppModal={() => {
          setSelectedDoctor(null);
          setIsAppModalOpen(true);
        }}
      />

      <AppDownloadModal
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
      />
    </div>
  );
}
