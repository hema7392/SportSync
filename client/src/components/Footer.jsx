import React from 'react';
import { Trophy, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center">
            <Trophy className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-slate-300">SportSync</span>
          <span>— WD501 Advanced Backend Capstone Project</span>
        </div>
        <p className="flex items-center gap-1">
          Built with Express, PostgreSQL/SQLite, Prisma, React & Tailwind
        </p>
      </div>
    </footer>
  );
}
