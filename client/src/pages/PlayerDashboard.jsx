import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sessionsApi } from '../api/sessions';
import { sportsApi } from '../api/sports';
import SessionCard from '../components/SessionCard';
import CancelModal from '../components/CancelModal';
import Alert from '../components/Alert';
import {
  Calendar,
  CheckSquare,
  FolderPlus,
  Trophy,
  PlusCircle,
  Compass,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function PlayerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    available: 0,
    created: 0,
    joined: 0,
    sports: 0,
  });
  const [availableSessions, setAvailableSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cancelModalSession, setCancelModalSession] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [availRes, createdRes, joinedRes, sportsRes] = await Promise.all([
        sessionsApi.getAvailableSessions(),
        sessionsApi.getCreatedSessions(),
        sessionsApi.getJoinedSessions(),
        sportsApi.getAllSports(),
      ]);

      setAvailableSessions(availRes.sessions.slice(0, 4));
      setStats({
        available: availRes.sessions.length,
        created: createdRes.sessions.length,
        joined: joinedRes.sessions.length,
        sports: sportsRes.sports.length,
      });
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleJoin = async (session) => {
    try {
      await sessionsApi.joinSession(session.id);
      setSuccess(`Successfully joined ${session.sport?.name} match!`);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to join session.');
    }
  };

  const handleCancel = async (sessionId, reason) => {
    await sessionsApi.cancelSession(sessionId, reason);
    setSuccess('Match has been cancelled.');
    loadData();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Player Dashboard
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Check out open sports matches near you, manage your scheduled games, or organize a new session with your friends.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/create-session"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            Create Match
          </Link>
          <Link
            to="/sessions"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-colors"
          >
            <Compass className="w-4 h-4" />
            Browse Matches
          </Link>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* 4 Dashboard Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link
          to="/sessions"
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Available Matches
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mb-1">{stats.available}</div>
          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
            Open for joining <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <Link
          to="/sessions/joined"
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/40 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Joined Matches
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mb-1">{stats.joined}</div>
          <span className="text-xs text-sky-400 font-medium flex items-center gap-1">
            View joined games <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <Link
          to="/sessions/created"
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              My Created Matches
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <FolderPlus className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mb-1">{stats.created}</div>
          <span className="text-xs text-purple-400 font-medium flex items-center gap-1">
            Manage your matches <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Available Sports
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mb-1">{stats.sports}</div>
          <span className="text-xs text-slate-500">Football, Cricket, etc.</span>
        </div>
      </div>

      {/* Available Sessions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Featured Available Matches
            </h2>
            <p className="text-xs text-slate-400">Upcoming games seeking additional players</p>
          </div>
          <Link
            to="/sessions"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            View All Matches <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
            Loading matches...
          </div>
        ) : availableSessions.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 space-y-3">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-200">No available matches right now</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              Be the first to create a sports match and invite other players to join!
            </p>
            <Link
              to="/create-session"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
            >
              <PlusCircle className="w-4 h-4" />
              Create a Match
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onJoin={handleJoin}
                onCancel={(s) => setCancelModalSession(s)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <CancelModal
        isOpen={!!cancelModalSession}
        onClose={() => setCancelModalSession(null)}
        session={cancelModalSession}
        onConfirm={handleCancel}
      />
    </div>
  );
}
