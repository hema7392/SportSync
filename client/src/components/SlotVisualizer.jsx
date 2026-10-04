import React from 'react';
import { CheckCircle2, Circle, Users } from 'lucide-react';

export default function SlotVisualizer({ participants = [], totalSlots = 1, className = '' }) {
  const filledCount = participants.length;
  const availableCount = Math.max(0, totalSlots - filledCount);

  // Generate slots array: filled first with participant names, then empty slots
  const slots = [];
  for (let i = 0; i < totalSlots; i++) {
    if (i < filledCount) {
      slots.push({
        filled: true,
        user: participants[i]?.user,
        team: participants[i]?.team,
      });
    } else {
      slots.push({
        filled: false,
        user: null,
      });
    }
  }

  return (
    <div className={`bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 ${className}`}>
      <div className="flex items-center justify-between mb-3 text-sm">
        <span className="font-semibold text-slate-200 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-emerald-400" />
          Player Slots:
        </span>
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span className="text-emerald-400 font-semibold">{filledCount} filled</span>
          <span>•</span>
          <span className="text-sky-400 font-semibold">{availableCount} available</span>
          <span>•</span>
          <span>{totalSlots} total</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {slots.map((slot, index) => (
          <div
            key={index}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
              slot.filled
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-200'
                : 'bg-slate-900/60 border border-dashed border-slate-700 text-slate-500'
            }`}
          >
            {slot.filled ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium text-slate-200 truncate">
                  {slot.user?.name || 'Joined Player'}
                </span>
                {slot.team && (
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    {slot.team}
                  </span>
                )}
              </>
            ) : (
              <>
                <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                <span className="italic text-slate-500">Available Slot</span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
