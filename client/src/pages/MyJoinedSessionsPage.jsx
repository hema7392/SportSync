import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sessionsApi } from '../api/sessions';
import SessionCard from '../components/SessionCard';
import Alert from '../components/Alert';
import { CheckSquare, Compass, Calendar, Ban } from 'lucide-react';

export default function MyJoinedSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadJoinedSessions = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await sessionsApi.getJoinedSessions();
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch your joined sessions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJoinedSessions();
  }, []);

  // Count cancelled joined sessions to highlight
  const cancelledCount = sessions.filter((s) => s.status === 'CANCELLED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-2">
            <CheckSquare className="w-3.5 h-3.5" />
            Confirmed Registrations
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            My Joined Sessions
          </h1>
          <p className="text-slate-400 text-sm">
            All matches you have reserved a player slot for. Review venue times, team rosters, and cancellation alerts.
          </p>
        </div>

        <Link
          to="/sessions"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors self-start sm:self-auto"
        >
          <Compass className="w-4 h-4" />
          Find More Matches
        </Link>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Cancellation Notice Banner */}
      {cancelledCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-300 text-sm">
          <Ban className="w-5 h-5 text-rose-400 shrink-0" />
          <p>
            <span className="font-bold">{cancelledCount} match{cancelledCount > 1 ? 'es have' : ' has'} been cancelled</span> by the organizers. The specific cancellation reason is displayed on the cards below.
          </p>
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
          Loading your joined matches...
        </div>
      ) : sessions.length === 0 ? (
        <div className="p-16 text-center bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 space-y-3">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-xl font-bold text-slate-200">You haven't joined any matches yet</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Browse available matches organized by other players and secure your slot!
          </p>
          <Link
            to="/sessions"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20"
          >
            <Compass className="w-4 h-4" />
            Browse Available Matches
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
            />
          ))}
        </div>
      )}
    </div>
  );
}
