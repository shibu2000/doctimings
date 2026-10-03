"use client";

import React from "react";
import Image from "next/image";
import { Doctor } from "@/types";
import { formatShiftString } from "@/lib/formatTime";
import { 
  Building2, 
  Clock, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  AlertTriangle,
  ChevronRight,
  User
} from "lucide-react";

interface DoctorCardProps {
  doctor: Doctor;
  onSelect: (doctor: Doctor) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onSelect }) => {
  const isAvailableToday = doctor.todayAvailability?.isAvailable;
  const shifts = doctor.todayAvailability?.shifts || [];
  const availabilityNote = doctor.todayAvailability?.note;
  const primaryEst = doctor.primaryEstablishment;

  return (
    <article className="bg-white rounded-2xl border border-slate-200/90 hover:border-teal-300 shadow-xs hover:shadow-md transition-all p-4 sm:p-5 flex flex-col justify-between gap-4">
      <div className="flex flex-col gap-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-teal-50 border border-teal-100 shrink-0">
              {doctor.photoUrl ? (
                <Image
                  src={doctor.photoUrl}
                  alt={doctor.fullName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 56px, 64px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-teal-700">
                  <User className="w-7 h-7" />
                </div>
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug truncate">
                  {doctor.fullName}
                </h3>
              </div>

              <span className="text-xs sm:text-sm font-semibold text-teal-800">
                {doctor.specialty}
              </span>

              <p className="text-[11px] sm:text-xs text-slate-500 truncate mt-0.5">
                {doctor.qualifications} · {doctor.experienceYears} yrs exp
              </p>

              <div className="flex items-center gap-1 text-[11px] text-teal-700 font-medium mt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>{doctor.registrationNumber}</span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-500">{doctor.council}</span>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            {isAvailableToday ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Available Today
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Not Today
              </span>
            )}
          </div>
        </div>

        {availabilityNote && (
          <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="font-medium">{formatShiftString(availabilityNote)}</span>
          </div>
        )}

        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 flex flex-col gap-2">
          {primaryEst && (
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 min-w-0">
                <Building2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-800 block truncate">
                    {primaryEst.name}
                  </span>
                  <span className="text-[11px] text-slate-500 block truncate">
                    {primaryEst.address}
                  </span>
                </div>
              </div>

              {doctor.distanceKm !== undefined && (
                <span className="text-[11px] font-bold text-teal-800 bg-teal-100/60 px-2 py-0.5 rounded-md shrink-0 flex items-center gap-0.5">
                  <MapPin className="w-3 h-3 text-teal-600" />
                  {doctor.distanceKm} km
                </span>
              )}
            </div>
          )}

          {shifts.length > 0 ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-700 pt-1 border-t border-slate-200/60">
              <Clock className="w-3.5 h-3.5 text-teal-700 shrink-0" />
              <span className="font-medium text-slate-900">Today:</span>
              <span className="truncate">{shifts.map(formatShiftString).join(", ")}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1 border-t border-slate-200/60">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Next visits scheduled later this week</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        {primaryEst?.phone ? (
          <a
            href={`tel:${primaryEst.phone}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-slate-600" />
            <span>Call Chamber</span>
          </a>
        ) : null}

        <button
          onClick={() => onSelect(doctor)}
          className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <span>View Timings</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
};
