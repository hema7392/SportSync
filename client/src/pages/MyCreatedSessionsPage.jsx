import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sessionsApi } from '../api/sessions';
import SessionCard from '../components/SessionCard';
import CancelModal from '../components/CancelModal';
import Alert from '../components/Alert';
import { FolderPlus, PlusCircle, Calendar } from 'lucide-react';

export default function MyCreatedSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cancelModalSession, setCancelModalSession] = useState(null);

  const loadCreatedSessions = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await sessionsApi.getCreatedSessions();
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch your created sessions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCreatedSessions();
  }, []);

  const handleCancelSession = async (sessionId, reason) => {
    await sessionsApi.cancelSession(sessionId, reason);
    setSuccess('Session has been cancelled successfully.');
    loadCreatedSessions();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-2">
            <FolderPlus className="w-3.5 h-3.5" />
            Host Management
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            My Created Sessions
          </h1>
          <p className="text-slate-400 text-sm">
            All sports matches you organized. Review slot bookings or cancel upcoming sessions if plans change.
          </p>
        </div>

        <Link
          to="/create-session"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Match
        </Link>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {loading ? (
        <div className="p-16 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
          Loading your created matches...
        </div>
      ) : sessions.length === 0 ? (
        <div className="p-16 text-center bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 space-y-3">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-xl font-bold text-slate-200">You haven't created any matches yet</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Ready to host a game? Choose a sport, set the venue and time, and invite other players.
          </p>
          <Link
            to="/create-session"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            Create Your First Session
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onCancel={(s) => setCancelModalSession(s)}
            />
          ))}
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <CancelModal
        isOpen={!!cancelModalSession}
        onClose={() => setCancelModalSession(null)}
        session={cancelModalSession}
        onConfirm={handleCancelSession}
      />
    </div>
  );
}
