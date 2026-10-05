import React from 'react';
import { Wrench } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/60 py-6 px-4 sm:px-6 text-center text-xs text-slate-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-sky-600 flex items-center justify-center text-white">
            <Wrench className="w-3 h-3" />
          </div>
          <span className="font-bold text-slate-400">CampusFix</span>
          <span className="text-slate-600">|</span>
          <span>WD501 Advanced Backend Capstone</span>
        </div>
        <p className="text-[11px] text-slate-600">
          Role-Based Access Control • Full Audit History • Real-Time Campus Operations
        </p>
      </div>
    </footer>
  );
}
