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
  Users,
  Navigation,
  MapPinOff
} from "lucide-react";
import type { Doctor, SearchApiResponse, SearchTown, Town } from "@/types";
import { fetchDoctors } from "@/lib/api";
import { locationFromTown } from "@/lib/location";
import { useSearchLocation } from "@/hooks/useSearchLocation";
import { Header } from "@/components/Header";
import { LocationModal } from "@/components/LocationModal";
import { SpecialtyFilter } from "@/components/SpecialtyFilter";
import { DoctorCard } from "@/components/DoctorCard";
import { DoctorDetailsModal } from "@/components/DoctorDetailsModal";
import { SmartAppBanner } from "@/components/SmartAppBanner";
import { AppDownloadModal } from "@/components/AppDownloadModal";
import { Footer } from "@/components/Footer";

const PAGE_SIZE = 20;

export default function HomePage() {
  const { towns, location, locating, approximate, locationFailed, locationDenied, retryLocation, setLocation } = useSearchLocation();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [availableOnly, setAvailableOnly] = useState(false);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [meta, setMeta] = useState<{ total: number; town: SearchTown | null; page: number; totalPages: number } | null>(null);
  const requestId = useRef(0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectTown = (town: Town) => setLocation(locationFromTown(town));

  const placeName = location.name;

  const fetchPage = useCallback(
    (page: number): Promise<SearchApiResponse> =>
      fetchDoctors({
        q: searchQuery.trim() || undefined,
        latitude: location.latitude,
        longitude: location.longitude,
        townId: location.source !== "gps" ? location.townId : undefined,
        specialty: selectedSpecialty !== "All" ? selectedSpecialty : undefined,
        availableOnly,
        page,
        limit: PAGE_SIZE,
      }),
    [location, searchQuery, selectedSpecialty, availableOnly]
  );

  const toMeta = (response: SearchApiResponse) => ({
    total: response.pagination?.total ?? response.data.length,
    town: response.searchMeta?.town ?? null,
    page: response.pagination?.page ?? 1,
    totalPages: response.pagination?.totalPages ?? 1,
  });

  const loadDoctors = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setLoadingMore(false);
    setError(null);
    try {
      const response = await fetchPage(1);
      if (id !== requestId.current) return;
      setDoctors(response.data || []);
      setMeta(toMeta(response));
    } catch (err: unknown) {
      if (id !== requestId.current) return;
      setError(err instanceof Error ? err.message : "Failed to load doctors");
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [fetchPage]);

  const hasMore = Boolean(meta && meta.page < meta.totalPages);

  const loadMore = useCallback(async () => {
    if (!meta || loading || loadingMore || meta.page >= meta.totalPages) return;
    const id = requestId.current;
    setLoadingMore(true);
    try {
      const response = await fetchPage(meta.page + 1);
      if (id !== requestId.current) return;
      setDoctors((current) => {
        const seen = new Set(current.map((d) => d.id));
        return [...current, ...(response.data || []).filter((d) => !seen.has(d.id))];
      });
      setMeta(toMeta(response));
    } catch (err: unknown) {
      if (id === requestId.current) setError(err instanceof Error ? err.message : "Failed to load more doctors");
    } finally {
      if (id === requestId.current) setLoadingMore(false);
    }
  }, [meta, loading, loadingMore, fetchPage]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) loadMore();
    }, { rootMargin: "600px 0px" });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  useEffect(() => {
    const timer = setTimeout(loadDoctors, 250);
    return () => clearTimeout(timer);
  }, [loadDoctors]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedSpecialty("All");
    setAvailableOnly(false);
  };

  const town = meta?.town ?? null;
  const inTown = town ? doctors.filter((d) => d.inTown) : [];
  const outside = town ? doctors.filter((d) => !d.inTown) : doctors;

  const renderGrid = (list: Doctor[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5">
      {list.map((doctor) => (
        <DoctorCard key={doctor.id} doctor={doctor} onSelect={setSelectedDoctor} />
      ))}
    </div>
  );

  const renderSectionLabel = (label: string, inside: boolean) => (
    <h3 className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${inside ? "text-teal-800" : "text-slate-500"}`}>
      {inside ? <MapPin className="w-3.5 h-3.5" /> : <Navigation className="w-3.5 h-3.5" />}
      {label}
    </h3>
  );

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
              Doctors and chamber timings around{" "}
              <span className="font-semibold text-white">{placeName}{location.district ? ` (${location.district})` : ""}</span>
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
                  <span>{locating ? `Finding your exact location… showing ${placeName}` : `Searching around ${placeName}`}</span>
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

                {(searchQuery || selectedSpecialty !== "All" || availableOnly) && (
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
                {!loading && meta && `(${meta.total} ${meta.total === 1 ? "doctor" : "doctors"})`}
              </span>
            </div>

            <span className="text-xs text-teal-800 font-semibold bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200 hidden sm:inline-block">
              {town && town.doctorCount > 0 ? `${town.name} first · then nearest` : "Nearest first"}
            </span>
          </div>

          {(locationFailed || approximate) && (
            <div
              className={`p-4 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                approximate ? "bg-teal-50 border-teal-200 text-teal-900" : "bg-amber-50 border-amber-200 text-amber-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <MapPinOff className={`w-4 h-4 shrink-0 ${approximate ? "text-teal-600" : "text-amber-600"}`} />
                <span>
                  {approximate
                    ? `Showing doctors near ${placeName} based on your internet connection. Turn on location for exact results.`
                    : `${locationDenied ? "Location access is blocked" : "Couldn't get your location"} · showing doctors for ${placeName}.`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={retryLocation}
                  className="px-3 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-md font-semibold text-xs cursor-pointer"
                >
                  Try again
                </button>
                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  className="px-3 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded-md font-semibold text-xs cursor-pointer"
                >
                  Choose town
                </button>
              </div>
            </div>
          )}

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

          {loading ? (
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
                No matching doctors found
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md">
                Try a different name or specialty, or clear the filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-2 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          ) : town ? (
            <div className="flex flex-col gap-4">
              {town.doctorCount === 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  No doctors listed in {town.name} yet. Showing the nearest doctors.
                </div>
              )}
              {inTown.length > 0 && renderSectionLabel(`Doctors in ${town.name}`, true)}
              {inTown.length > 0 && renderGrid(inTown)}
              {outside.length > 0 &&
                renderSectionLabel(town.doctorCount === 0 ? "Nearest doctors first" : `Outside ${town.name} · nearest first`, false)}
              {outside.length > 0 && renderGrid(outside)}
            </div>
          ) : (
            renderGrid(doctors)
          )}

          {!loading && hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-4">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-5 py-2.5 rounded-xl bg-white border border-teal-300 hover:bg-teal-50 text-teal-900 font-semibold text-sm transition-colors cursor-pointer disabled:cursor-wait disabled:opacity-70"
              >
                {loadingMore ? "Loading more doctors…" : "Load more doctors"}
              </button>
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
