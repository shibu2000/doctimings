"use client";

import React, { useState } from "react";
import { Smartphone, X, Zap, Download } from "lucide-react";

interface SmartAppBannerProps {
  onOpenAppModal: () => void;
}

export const SmartAppBanner: React.FC<SmartAppBannerProps> = ({ onOpenAppModal }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 p-2 sm:p-3 pointer-events-none">
      <div className="max-w-4xl mx-auto bg-slate-900/95 text-white rounded-2xl p-3 sm:px-5 sm:py-3.5 shadow-2xl backdrop-blur-md border border-slate-700 pointer-events-auto flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white truncate">
                <span className="sm:hidden">Get the app</span>
                <span className="hidden sm:inline">Get DocTimings Mobile App</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-teal-300 bg-teal-950 px-2 py-0.5 rounded-full border border-teal-800">
                <Zap className="w-2.5 h-2.5" />
                Offline Mode
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-300 truncate">
              Doctor chamber timings, delay notices &amp; visit reminders in Paschim Medinipur.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenAppModal}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-slate-950 font-bold text-xs sm:text-sm transition-transform active:scale-95 shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span className="sm:hidden">Install</span>
            <span className="hidden sm:inline">Install App</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
