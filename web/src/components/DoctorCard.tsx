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
  User,
  Stethoscope,
  Calendar
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

  const otherEstablishments = (doctor.affiliatedEstablishments || []).filter(
    (e) => e.id !== primaryEst?.id
  );

  const getScheduleDaysSummary = (): string => {
    if (!doctor.schedules || doctor.schedules.length === 0) {
      return "Visiting slots scheduled by appointment";
    }
    const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const uniqueDays = Array.from(new Set(doctor.schedules.map((s) => s.dayOfWeek))).sort(
      (a, b) => daysOrder.indexOf(a) - daysOrder.indexOf(b)
    );
    if (uniqueDays.length <= 4) {
      return uniqueDays.map((d) => d.slice(0, 3)).join(", ");
    }
    return `${uniqueDays.slice(0, 3).map((d) => d.slice(0, 3)).join(", ")} +${uniqueDays.length - 3} more days`;
  };

  return (
    <article className="bg-white rounded-2xl border border-slate-200/90 hover:border-teal-400/80 shadow-xs hover:shadow-lg transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between gap-5 group">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200/70">
            <Stethoscope className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>{doctor.specialty}</span>
          </span>

          <div>
            {isAvailableToday ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Available Today
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200/80">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Not Scheduled Today
              </span>
            )}
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-gradient-to-br from-teal-50 to-teal-100/70 border border-teal-200/80 shrink-0 shadow-2xs flex items-center justify-center">
            {doctor.photoUrl ? (
              <Image
                src={doctor.photoUrl}
                alt={doctor.fullName}
                fill
                className="object-cover"
                sizes="72px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-teal-700">
                <User className="w-8 h-8" />
              </div>
            )}
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-snug group-hover:text-teal-900 transition-colors">
              {doctor.fullName}
            </h3>

            <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-1 leading-normal">
              {doctor.qualifications}
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-500 mt-2 flex-wrap">
              <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                {doctor.experienceYears} Years Exp
              </span>
              <span className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-teal-800 bg-teal-50/80 border border-teal-100 px-2 py-0.5 rounded-md">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                {doctor.registrationNumber}
              </span>
            </div>
          </div>
        </div>

        {availabilityNote && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">{formatShiftString(availabilityNote)}</span>
          </div>
        )}

        <div className="bg-slate-50/90 rounded-xl p-3.5 border border-slate-200/80 flex flex-col gap-3">
          {primaryEst && (
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <div className="w-7 h-7 rounded-lg bg-teal-100/70 text-teal-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 block leading-tight">
                    {primaryEst.name}
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5 leading-normal">
                    {primaryEst.address} ({primaryEst.subDistrict})
                  </span>
                </div>
              </div>

              {doctor.distanceKm !== undefined && (
                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1 border border-teal-200">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  {doctor.distanceKm} km
                </span>
              )}
            </div>
          )}

          {isAvailableToday && shifts.length > 0 ? (
            <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-emerald-950 text-xs flex items-start gap-2">
              <Clock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="font-bold">Today&apos;s Visiting Shift:</span>
                <span className="font-semibold text-emerald-900 mt-0.5">
                  {shifts.map(formatShiftString).join("  •  ")}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-white border border-slate-200/70 text-slate-700 text-xs flex items-start gap-2">
              <Calendar className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="font-bold text-slate-800">Weekly Sitting Days:</span>
                <span className="text-slate-600 font-medium mt-0.5">
                  {getScheduleDaysSummary()}
                </span>
              </div>
            </div>
          )}

          {otherEstablishments.length > 0 && (
            <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 flex items-baseline gap-1.5 flex-wrap">
              <span className="font-medium text-slate-600">Also holds chamber at:</span>
              <span className="font-semibold text-teal-800">
                {otherEstablishments.map((e) => e.name).slice(0, 2).join(", ")}
                {otherEstablishments.length > 2 ? ` (+${otherEstablishments.length - 2} more)` : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
        {primaryEst?.phone ? (
          <a
            href={`tel:${primaryEst.phone}`}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
          >
            <Phone className="w-4 h-4 text-slate-600" />
            <span>Call Chamber</span>
          </a>
        ) : null}

        <button
          onClick={() => onSelect(doctor)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer"
        >
          <span>View Timings</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
};
