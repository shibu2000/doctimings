"use client";

import React from "react";
import Image from "next/image";
import { MapPin, Smartphone, ChevronDown } from "lucide-react";
import { BengalCity } from "@/types";

interface HeaderProps {
  currentCity: BengalCity;
  onOpenLocationModal: () => void;
  onOpenAppModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCity,
  onOpenLocationModal,
  onOpenAppModal,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-xs shrink-0 bg-teal-50 border border-teal-100">
              <Image
                src="/icon.svg"
                alt="DocTimings Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-900 font-bold text-lg tracking-tight leading-tight">DocTimings</span>
                <span className="hidden sm:inline-block text-[11px] font-semibold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  Bengal
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium hidden sm:block">Doctor Chamber Schedules &amp; Timings</span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block" />

          <button
            onClick={onOpenLocationModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200/80 text-teal-900 transition-colors text-xs sm:text-sm font-semibold group cursor-pointer"
            aria-label="Change location"
          >
            <MapPin className="w-3.5 h-3.5 text-teal-700 group-hover:scale-110 transition-transform" />
            <span className="truncate max-w-[120px] sm:max-w-[160px]">{currentCity.name}</span>
            <ChevronDown className="w-3 h-3 text-teal-600 opacity-70" />
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenAppModal}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Smartphone className="w-4 h-4 text-teal-100" />
            <span className="hidden sm:inline">Download App</span>
            <span className="sm:hidden">Get App</span>
          </button>
        </div>
      </div>
    </header>
  );
};
