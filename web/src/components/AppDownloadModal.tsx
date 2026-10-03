"use client";

import React from "react";
import { 
  X, 
  Smartphone, 
  CheckCircle2, 
  Download, 
  BellRing, 
  WifiOff, 
  Clock 
} from "lucide-react";

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppDownloadModal: React.FC<AppDownloadModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-teal-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-teal-200 hover:text-white hover:bg-teal-600 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-3">
            <Smartphone className="w-6 h-6 text-white" />
          </div>

          <h3 className="text-xl font-bold text-white">DocTimings Patient App</h3>
          <p className="text-xs text-teal-100 mt-1">
            Verified doctor chamber timings and schedules on your phone.
          </p>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Chamber Token Policy &amp; Visit Planner</h4>
                <p className="text-[11px] text-slate-500">Know token rules (First-come vs Desk) and organize upcoming visits.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700 shrink-0">
                <BellRing className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Delay &amp; Cancellation Alerts</h4>
                <p className="text-[11px] text-slate-500">Get notified instantly before leaving your house if the doctor is late.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
                <WifiOff className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Offline Chamber Access</h4>
                <p className="text-[11px] text-slate-500">Check chamber timings and doctor contact numbers even without internet.</p>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert("DocTimings Mobile App (Android APK) download will be available on Google Play Store.");
              }}
              className="w-full py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-98 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Android APK (Free)</span>
            </a>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              <span>No registration needed for doctor discovery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
