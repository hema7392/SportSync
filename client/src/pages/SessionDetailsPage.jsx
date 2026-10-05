import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { sessionsApi } from '../api/sessions';
import { useAuth } from '../context/AuthContext';
import SlotVisualizer from '../components/SlotVisualizer';
import CancelModal from '../components/CancelModal';
import Badge from '../components/Badge';
import Alert from '../components/Alert';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Trophy,
  ArrowLeft,
  Ban,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function SessionDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState('Team A');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const loadSession = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await sessionsApi.getSessionById(id);
      setSession(data.session);
    } catch (err) {
      setError(err.message || 'Failed to load session details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, [id]);

  const handleJoin = async () => {
    try {
      setJoining(true);
      setError('');
      const data = await sessionsApi.joinSession(id, { team: selectedTeam });
      setSuccess('You have successfully reserved your slot for this match!');
      setSession(data.session);
    } catch (err) {
      setError(err.message || 'Failed to join session.');
    } finally {
      setJoining(false);
    }
  };

  const handleCancelConfirm = async (sessionId, reason) => {
    const data = await sessionsApi.cancelSession(sessionId, reason);
    setSuccess('This session has been cancelled.');
    setSession(data.session);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading match details...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Session Not Found</h2>
        <p className="text-slate-400 text-sm">The match session you requested does not exist or has been removed.</p>
        <Link
          to="/sessions"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sessions
        </Link>
      </div>
    );
  }

  const isCancelled = session.status === 'CANCELLED';
  const isCompleted = session.status === 'COMPLETED';
  const isUpcoming = session.status === 'UPCOMING';
  const isCreator = session.creatorId === user?.id;
  const hasJoined = session.participants?.some((p) => p.userId === user?.id);
  const slotsFilled = session.participants?.length || 0;
  const totalSlots = session.additionalPlayersRequired || 1;
  const slotsAvailable = Math.max(0, totalSlots - slotsFilled);

  // Check if session date is in the past
  const isPast = new Date(session.startDateTime) <= new Date();

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sessions
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Cancellation Notice Banner */}
      {isCancelled && (
        <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-2">
          <div className="flex items-center gap-2.5 font-bold text-rose-400 text-lg">
            <Ban className="w-6 h-6" />
            MATCH CANCELLED
          </div>
          <p className="text-sm">
            <span className="font-semibold text-white">Cancellation Reason:</span>{' '}
            <span className="italic">"{session.cancellationReason || 'No specific reason given.'}"</span>
          </p>
          {session.cancelledAt && (
            <p className="text-xs text-rose-400/80">
              Cancelled on: {new Date(session.cancelledAt).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* Main Details Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
        {/* Title & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {session.sport?.name} Match
              </h1>
              <span className="text-xs text-slate-400">Session ID #{session.id}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge size="lg">{session.status}</Badge>
            {isCreator && isUpcoming && (
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
              >
                Cancel Session
              </button>
            )}
          </div>
        </div>

        {/* Schedule & Venue Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase text-slate-400 block">Date</span>
              <span className="text-sm font-bold text-white">{session.sessionDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase text-slate-400 block">Time</span>
              <span className="text-sm font-bold text-white">{session.sessionTime}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase text-slate-400 block">Venue</span>
              <span className="text-sm font-bold text-white truncate max-w-[180px] block">
                {session.venue}
              </span>
            </div>
          </div>
        </div>

        {/* Host / Creator Information */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/20 border border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 font-bold">
              {session.creator?.name?.[0]?.toUpperCase() || 'H'}
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Session Organized By</span>
              <span className="text-sm font-bold text-white">{session.creator?.name}</span>
            </div>
          </div>
          {isCreator ? (
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
              You are the Host
            </span>
          ) : hasJoined ? (
            <span className="text-xs px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold uppercase">
              You are Joined ✓
            </span>
          ) : null}
        </div>

        {/* Team Rosters Overview */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-white tracking-tight">Team Lineup</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase text-emerald-400 border-b border-slate-700/60 pb-2">
                <span>Team A</span>
                <span>{teamAList.length} Players</span>
              </div>
              <div className="space-y-1 pt-1">
                {teamAList.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">No assigned players</span>
                ) : (
                  teamAList.map((p, idx) => (
                    <div key={idx} className="text-xs text-slate-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {p}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase text-sky-400 border-b border-slate-700/60 pb-2">
                <span>Team B</span>
                <span>{teamBList.length} Players</span>
              </div>
              <div className="space-y-1 pt-1">
                {teamBList.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">No assigned players</span>
                ) : (
                  teamBList.map((p, idx) => (
                    <div key={idx} className="text-xs text-slate-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                      {p}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Player Slots Visualizer (Section 8 Requirement) */}
        <div>
          <h3 className="text-base font-bold text-white tracking-tight mb-3">
            Open Player Slots & Joined Roster
          </h3>
          <SlotVisualizer
            participants={session.participants || []}
            totalSlots={totalSlots}
          />
        </div>

        {/* Join Match Form (if joinable) */}
        {!isCreator && !hasJoined && isUpcoming && !isPast && slotsAvailable > 0 && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/30 to-slate-900 border border-emerald-500/30 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Ready to play? Join this match!
              </h3>
              <p className="text-xs text-slate-400">
                Pick your preferred team and confirm your slot reservation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-300">Choose Team:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTeam('Team A')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedTeam === 'Team A'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Team A
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTeam('Team B')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedTeam === 'Team B'
                        ? 'bg-sky-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Team B
                  </button>
                </div>
              </div>

              <button
                type="button"
                disabled={joining}
                onClick={handleJoin}
                className="w-full sm:w-auto ml-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
              >
                {joining ? 'Reserving Slot...' : `Confirm & Join Match (${slotsAvailable} slots left)`}
              </button>
            </div>
          </div>
        )}

        {/* Notices when cannot join */}
        {isPast && isUpcoming && (
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            This session's scheduled time has passed and it can no longer be joined.
          </div>
        )}

        {slotsAvailable <= 0 && isUpcoming && !hasJoined && (
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            All player slots for this match are currently filled.
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <CancelModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        session={session}
        onConfirm={handleCancelConfirm}
      />
    </div>
  );
}
