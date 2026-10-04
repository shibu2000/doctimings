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
  ChevronRight,
  User,
  Calendar
} from "lucide-react";

interface DoctorCardProps {
  doctor: Doctor;
  onSelect: (doctor: Doctor) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onSelect }) => {
  const isAvailableToday = doctor.todayAvailability?.isAvailable;
  const shifts = doctor.todayAvailability?.shifts || [];
  const primaryEst = doctor.primaryEstablishment;

  const otherEstablishments = (doctor.affiliatedEstablishments || []).filter(
    (e) => e.id !== primaryEst?.id
  );

  const getScheduleDaysSummary = (): string => {
    if (!doctor.schedules || doctor.schedules.length === 0) {
      return "Visiting by appointment";
    }
    const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const uniqueDays = Array.from(new Set(doctor.schedules.map((s) => s.dayOfWeek))).sort(
      (a, b) => daysOrder.indexOf(a) - daysOrder.indexOf(b)
    );
    if (uniqueDays.length <= 3) {
      return uniqueDays.map((d) => d.slice(0, 3)).join(", ");
    }
    return `${uniqueDays.slice(0, 3).map((d) => d.slice(0, 3)).join(", ")} +${uniqueDays.length - 3} more`;
  };

  return (
    <article className="bg-white rounded-xl border border-slate-200/80 hover:border-teal-400/80 shadow-2xs hover:shadow-md transition-all duration-200 p-4 sm:p-4.5 flex flex-col justify-between group">
      <div>
        <div className="flex items-start gap-3">
          <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-gradient-to-br from-teal-50 to-teal-100/60 border border-teal-200/70 shrink-0 flex items-center justify-center">
            {doctor.photoUrl ? (
              <Image
                src={doctor.photoUrl}
                alt={doctor.fullName}
                fill
                className="object-cover"
                sizes="56px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-teal-700">
                <User className="w-7 h-7" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1.5">
              <h3 className="text-base sm:text-[17px] font-bold text-slate-900 tracking-tight leading-snug group-hover:text-teal-900 transition-colors">
                {doctor.fullName}
              </h3>

              {isAvailableToday ? (
                <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Available
                </span>
              ) : (
                <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  Not Today
                </span>
              )}
            </div>

            <div className="text-xs font-semibold text-teal-800 leading-tight mt-0.5">
              <span>{doctor.specialty}</span>
              <span className="text-slate-300 font-normal mx-1">·</span>
              <span className="text-slate-600 font-medium">{doctor.qualifications}</span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
              <span>{doctor.experienceYears} yrs exp</span>
              <span className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-0.5 font-mono text-slate-600">
                <ShieldCheck className="w-3 h-3 text-teal-600 shrink-0" />
                {doctor.registrationNumber}
              </span>
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-100 my-3" />

        <div className="space-y-1.5 text-xs">
          {primaryEst && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <Building2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                <span className="font-semibold text-slate-800 truncate">{primaryEst.name}</span>
                {primaryEst.subDistrict && (
                  <span className="text-slate-400 text-[11px] shrink-0">({primaryEst.subDistrict})</span>
                )}
              </div>

              {doctor.distanceKm !== undefined && (
                <span className="shrink-0 text-[11px] font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100 flex items-center gap-0.5">
                  <MapPin className="w-3 h-3 text-teal-600" />
                  {doctor.distanceKm} km
                </span>
              )}
            </div>
          )}

          {isAvailableToday && shifts.length > 0 ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-900 font-semibold pt-0.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-emerald-700 font-bold shrink-0">Today:</span>
              <span className="truncate">{shifts.map(formatShiftString).join(" · ")}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium pt-0.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-400 shrink-0">Weekly:</span>
              <span className="truncate text-slate-700">{getScheduleDaysSummary()}</span>
            </div>
          )}

          {otherEstablishments.length > 0 && (
            <div className="text-[11px] text-slate-400 pt-0.5 truncate">
              <span className="text-slate-500 font-medium">Also at: </span>
              <span className="text-teal-700 font-medium">
                {otherEstablishments.map((e) => e.name).slice(0, 2).join(", ")}
                {otherEstablishments.length > 2 ? ` (+${otherEstablishments.length - 2})` : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-100">
        {primaryEst?.phone ? (
          <a
            href={`tel:${primaryEst.phone}`}
            className="py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-slate-600" />
            <span>Call</span>
          </a>
        ) : null}

        <button
          onClick={() => onSelect(doctor)}
          className="flex-1 py-2 px-3 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs flex items-center justify-center gap-1 shadow-2xs transition-colors cursor-pointer"
        >
          <span>View Timings</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
};
