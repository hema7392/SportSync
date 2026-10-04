import React from 'react';
import { Link } from 'react-router-dom';
import Badge from './Badge';
import { Calendar, Clock, MapPin, User, Users, AlertCircle, Ban } from 'lucide-react';

export default function SessionCard({
  session,
  onJoin,
  onCancel,
  isJoining = false,
  showActions = true,
}) {
  const isCancelled = session.status === 'CANCELLED';
  const isCompleted = session.status === 'COMPLETED';
  const isUpcoming = session.status === 'UPCOMING';

  const filledCount = session.slotsFilled ?? (session.participants?.length || 0);
  const totalSlots = session.slotsTotal ?? session.additionalPlayersRequired;
  const availableSlots = session.slotsAvailable ?? Math.max(0, totalSlots - filledCount);

  // Parse team rosters
  let teamAList = [];
  let teamBList = [];
  try {
    teamAList = typeof session.teamA === 'string' ? JSON.parse(session.teamA) : (session.teamA || []);
  } catch (e) {
    teamAList = session.teamA ? [session.teamA] : [];
  }
  try {
    teamBList = typeof session.teamB === 'string' ? JSON.parse(session.teamB) : (session.teamB || []);
  } catch (e) {
    teamBList = session.teamB ? [session.teamB] : [];
  }

  return (
    <div
      className={`rounded-2xl border bg-slate-900/80 p-5 sm:p-6 transition-all shadow-xl hover:border-slate-700/80 flex flex-col justify-between ${
        isCancelled
          ? 'border-rose-900/40 bg-rose-950/10'
          : isCompleted
          ? 'border-slate-800 opacity-80'
          : 'border-slate-800 hover:shadow-emerald-500/5'
      }`}
    >
      <div>
        {/* Header: Sport & Status */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-white tracking-tight">
              {session.sport?.name || 'Sport'}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
              ID #{session.id}
            </span>
          </div>
          <Badge>{session.status}</Badge>
        </div>

        {/* Cancellation Reason Alert if Cancelled */}
        {isCancelled && (
          <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-start gap-2.5">
            <Ban className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold uppercase tracking-wider text-[11px] text-rose-400 mb-0.5">
                Session Cancelled
              </p>
              <p className="italic">
                "{session.cancellationReason || 'No specific cancellation reason provided.'}"
              </p>
            </div>
          </div>
        )}

        {/* Details Grid */}
        <div className="space-y-2 text-sm text-slate-300 mb-4">
          <div className="flex items-center gap-2 text-slate-300">
            <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-slate-200">{session.sessionDate}</span>
            <span className="text-slate-500">•</span>
            <Clock className="w-4 h-4 text-sky-400 shrink-0" />
            <span>{session.sessionTime}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="truncate">{session.venue}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <User className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Host: <span className="text-slate-200 font-medium">{session.creator?.name || 'Host'}</span>
              {session.isCreator && (
                <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                  You
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Team Rosters Preview */}
        {(teamAList.length > 0 || teamBList.length > 0) && (
          <div className="grid grid-cols-2 gap-2 mb-4 p-2.5 rounded-xl bg-slate-800/50 text-xs border border-slate-800">
            <div>
              <span className="text-slate-400 font-semibold block mb-1">Team A</span>
              <span className="text-slate-300">
                {teamAList.length > 0 ? teamAList.join(', ') : 'Open'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block mb-1">Team B</span>
              <span className="text-slate-300">
                {teamBList.length > 0 ? teamBList.join(', ') : 'Open'}
              </span>
            </div>
          </div>
        )}

        {/* Slots Information */}
        <div className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-slate-800/80 mb-4 border border-slate-700/50">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            Player Slots:
          </span>
          <div className="flex items-center gap-2 font-semibold">
            <span className="text-emerald-400">{filledCount} filled</span>
            <span className="text-slate-600">/</span>
            <span className={availableSlots > 0 ? 'text-sky-400' : 'text-slate-500'}>
              {availableSlots} available
            </span>
            <span className="text-slate-500 font-normal">({totalSlots} req)</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      {showActions && (
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <Link
            to={`/sessions/${session.id}`}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            View Details
          </Link>

          <div className="flex items-center gap-2">
            {session.isCreator && isUpcoming && onCancel && (
              <button
                type="button"
                onClick={() => onCancel(session)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
              >
                Cancel Match
              </button>
            )}

            {session.hasJoined && (
              <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Joined ✓
              </span>
            )}

            {!session.isCreator && !session.hasJoined && isUpcoming && availableSlots > 0 && onJoin && (
              <button
                type="button"
                disabled={isJoining}
                onClick={() => onJoin(session)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                {isJoining ? 'Joining...' : 'Join Session'}
              </button>
            )}

            {!session.isCreator && !session.hasJoined && isUpcoming && availableSlots <= 0 && (
              <span className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 bg-slate-800/60 border border-slate-700">
                Match Full
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
