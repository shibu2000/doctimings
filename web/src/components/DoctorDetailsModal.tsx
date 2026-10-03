"use client";

import React from "react";
import Image from "next/image";
import { Doctor } from "@/types";
import { formatTo12Hour, formatShiftString } from "@/lib/formatTime";
import { 
  X, 
  Building2, 
  Clock, 
  Phone, 
  ShieldCheck, 
  Calendar,
  Ticket,
  Smartphone,
  Languages,
  User
} from "lucide-react";

interface DoctorDetailsModalProps {
  doctor: Doctor | null;
  onClose: () => void;
  onOpenAppModal: () => void;
}

export const DoctorDetailsModal: React.FC<DoctorDetailsModalProps> = ({
  doctor,
  onClose,
  onOpenAppModal,
}) => {
  if (!doctor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-base sm:text-lg">Doctor Profile & Chambers</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-teal-50 border border-teal-100 shrink-0">
              {doctor.photoUrl ? (
                <Image
                  src={doctor.photoUrl}
                  alt={doctor.fullName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-teal-700">
                  <User className="w-10 h-10" />
                </div>
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                {doctor.fullName}
              </h2>
              <span className="text-sm font-semibold text-teal-800 mt-0.5">
                {doctor.specialty}
              </span>
              <p className="text-xs text-slate-600 mt-1">
                {doctor.qualifications}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-teal-800 font-medium mt-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Registration: {doctor.registrationNumber} ({doctor.council})</span>
              </div>
              {doctor.languages?.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                  <Languages className="w-3.5 h-3.5 shrink-0" />
                  <span>Languages: {doctor.languages.join(", ")}</span>
                </div>
              )}
            </div>
          </div>

          {doctor.todayAvailability && (
            <div className={`p-3.5 rounded-xl border flex flex-col gap-1.5 ${
              doctor.todayAvailability.isAvailable
                ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                : "bg-slate-50 border-slate-200 text-slate-800"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${doctor.todayAvailability.isAvailable ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                  {doctor.todayAvailability.isAvailable ? "Available Today" : "Not Scheduled Today"}
                </span>
                <span className="text-xs font-semibold text-slate-500">{doctor.todayAvailability.day}</span>
              </div>
              {doctor.todayAvailability.shifts.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                  <span className="font-semibold">Today&apos;s Visits:</span>
                  <span>{doctor.todayAvailability.shifts.map(formatShiftString).join(", ")}</span>
                </div>
              )}
              {doctor.todayAvailability.note && (
                <p className="text-xs text-amber-800 font-medium">
                  {formatShiftString(doctor.todayAvailability.note)}
                </p>
              )}
            </div>
          )}

          <div className="p-4 rounded-xl bg-teal-50/80 border border-teal-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-5 h-5 text-teal-700 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-teal-950">Get the DocTimings Mobile App</span>
                <span className="text-[11px] text-teal-800">Save visits, access chamber schedules offline &amp; get doctor updates</span>
              </div>
            </div>
            <button
              onClick={onOpenAppModal}
              className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs shrink-0 cursor-pointer"
            >
              Get App
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Calendar className="w-4 h-4 text-teal-700" />
              <span>Weekly Visiting Schedule</span>
            </div>

            {doctor.schedules.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 text-slate-500 text-xs text-center border border-slate-200">
                No active recurring schedules published currently. Please contact chamber directly.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {doctor.schedules.map((sch) => {
                  const est = doctor.affiliatedEstablishments.find((e) => e.id === sch.establishmentId);
                  return (
                    <div
                      key={sch.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-teal-900 bg-teal-100/70 px-2 py-0.5 rounded-md">
                          {sch.dayOfWeek}
                        </span>
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
                          <Clock className="w-3.5 h-3.5 text-teal-700" />
                          <span>{formatTo12Hour(sch.startTime)} – {formatTo12Hour(sch.endTime)}</span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-700 font-medium">
                        {sch.shiftName}
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200/60">
                        <span className="truncate">{est?.name || "Chamber"} · {sch.roomNumber}</span>
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-700">
                          <Ticket className="w-3 h-3 text-teal-600" />
                          {sch.tokenPolicy}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Building2 className="w-4 h-4 text-teal-700" />
              <span>Affiliated Chambers & Clinics</span>
            </div>

            <div className="flex flex-col gap-2.5">
              {doctor.affiliatedEstablishments.map((est) => (
                <div
                  key={est.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{est.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{est.address}</p>
                      <span className="text-[11px] text-teal-800 font-medium">{est.subDistrict}, {est.district} · PIN {est.pinCode}</span>
                    </div>

                    {est.phone && (
                      <a
                        href={`tel:${est.phone}`}
                        className="p-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 transition-colors shrink-0"
                        aria-label={`Call ${est.name}`}
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
