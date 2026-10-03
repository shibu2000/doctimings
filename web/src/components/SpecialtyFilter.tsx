"use client";

import React from "react";

const SPECIALTIES = [
  "All",
  "Dermatology",
  "Pediatrics",
  "General Medicine",
  "Orthopedics",
  "Cardiology",
  "Gynecology",
  "ENT",
  "Ophthalmology",
];

interface SpecialtyFilterProps {
  selectedSpecialty: string;
  onSelectSpecialty: (specialty: string) => void;
}

export const SpecialtyFilter: React.FC<SpecialtyFilterProps> = ({
  selectedSpecialty,
  onSelectSpecialty,
}) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1">
      <div className="flex items-center gap-2 min-w-max">
        {SPECIALTIES.map((spec) => {
          const isSelected = selectedSpecialty === spec;
          return (
            <button
              key={spec}
              onClick={() => onSelectSpecialty(spec)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? "bg-teal-700 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              {spec === "All" ? "All Specialties" : spec}
            </button>
          );
        })}
      </div>
    </div>
  );
};
