"use client";

import React from "react";
import Image from "next/image";
import { PhoneCall, ShieldAlert, Heart } from "lucide-react";
import type { Town } from "@/types";

interface FooterProps {
  towns: Town[];
  onSelectTown: (town: Town) => void;
}

export const Footer: React.FC<FooterProps> = ({ towns, onSelectTown }) => {
  const popularTowns = towns.filter((t) => t.doctorCount > 0).slice(0, 6);
  const districts = [...new Set(towns.map((t) => t.district))];

  return (
    <footer className="w-full bg-slate-900 text-slate-300 pt-12 pb-24 sm:pb-16 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col gap-10">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Emergency Helplines (West Bengal)</h4>
              <p className="text-xs text-slate-400">Available 24x7 across all districts</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <a
              href="tel:108"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-red-400" />
              <span>Ambulance: 108</span>
            </a>
            <a
              href="tel:112"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              <span>National: 112</span>
            </a>
            <a
              href="tel:18003453261"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-teal-400" />
              <span>Health Helpline: 1800-345-3261</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-teal-900 border border-teal-800">
                <Image
                  src="/icon.svg"
                  alt="DocTimings Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">DocTimings</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              DocTimings makes verified doctor chamber timings and today&apos;s real-time availability accessible to every patient and family across India.
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Popular Towns
            </span>
            <div className="flex flex-col gap-1.5">
              {popularTowns.map((city) => (
                <button
                  key={city.id}
                  onClick={() => {
                    onSelectTown(city);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-left text-xs text-slate-400 hover:text-teal-400 transition-colors cursor-pointer"
                >
                  Doctors in {city.name} ({city.district})
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Coverage Districts
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">
              {districts.length ? districts.join(", ") : "Paschim Medinipur"}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-teal-400 mt-2">
              <Heart className="w-3.5 h-3.5 fill-teal-400 text-teal-400" />
              <span>Dedicated to accessible healthcare timings</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <span>&copy; {new Date().getFullYear()} DocTimings. All verified medical data sourced directly from local partner clinics.</span>
          <span>Information portal for public medical availability.</span>
        </div>
      </div>
    </footer>
  );
};
