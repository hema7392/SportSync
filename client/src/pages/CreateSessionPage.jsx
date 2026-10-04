import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sportsApi } from '../api/sports';
import { sessionsApi } from '../api/sessions';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  PlusCircle,
  X,
  Plus,
  ArrowRight,
} from 'lucide-react';

export default function CreateSessionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sports, setSports] = useState([]);
  const [sportId, setSportId] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('18:00');
  const [venue, setVenue] = useState('');
  const [additionalPlayersRequired, setAdditionalPlayersRequired] = useState(2);

  // Dynamic team player name tags
  const [teamAPlayers, setTeamAPlayers] = useState([user?.name || '']);
  const [teamBPlayers, setTeamBPlayers] = useState([]);
  const [teamAInput, setTeamAInput] = useState('');
  const [teamBInput, setTeamBInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetchingSports, setFetchingSports] = useState(true);
  const [error, setError] = useState('');

  // Minimum date is today (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    async function loadSports() {
      try {
        setFetchingSports(true);
        const data = await sportsApi.getAllSports();
        setSports(data.sports || []);
        if (data.sports?.length > 0) {
          setSportId(data.sports[0].id.toString());
        }
      } catch (err) {
        setError('Failed to load available sports. Please try again.');
      } finally {
        setFetchingSports(false);
      }
    }
    loadSports();
  }, []);

  const addPlayerToTeamA = (e) => {
    e.preventDefault();
    if (teamAInput.trim() && !teamAPlayers.includes(teamAInput.trim())) {
      setTeamAPlayers([...teamAPlayers, teamAInput.trim()]);
      setTeamAInput('');
    }
  };

  const removePlayerFromTeamA = (indexToRemove) => {
    setTeamAPlayers(teamAPlayers.filter((_, i) => i !== indexToRemove));
  };

  const addPlayerToTeamB = (e) => {
    e.preventDefault();
    if (teamBInput.trim() && !teamBPlayers.includes(teamBInput.trim())) {
      setTeamBPlayers([...teamBPlayers, teamBInput.trim()]);
      setTeamBInput('');
    }
  };

  const removePlayerFromTeamB = (indexToRemove) => {
    setTeamBPlayers(teamBPlayers.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!sportId) {
      setError('Please select a sport.');
      return;
    }
    if (!sessionDate) {
      setError('Please select a session date.');
      return;
    }
    if (!sessionTime) {
      setError('Please select a session time.');
      return;
    }
    if (!venue.trim()) {
      setError('Please enter a venue.');
      return;
    }
    if (additionalPlayersRequired < 1) {
      setError('Additional players needed must be at least 1.');
      return;
    }

    // Verify date/time is in the future
    const selectedDateTime = new Date(`${sessionDate}T${sessionTime}:00`);
    if (selectedDateTime <= new Date()) {
      setError('Session date and time must be set in the future.');
      return;
    }

    try {
      setLoading(true);
      await sessionsApi.createSession({
        sportId: parseInt(sportId, 10),
        sessionDate,
        sessionTime,
        venue: venue.trim(),
        additionalPlayersRequired: parseInt(additionalPlayersRequired, 10),
        teamA: teamAPlayers,
        teamB: teamBPlayers,
      });

      navigate('/sessions/created');
    } catch (err) {
      setError(err.message || 'Failed to create sport session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2 pb-6 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <PlusCircle className="w-3.5 h-3.5" />
          Schedule a Match
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Create Sport Session
        </h1>
        <p className="text-slate-400 text-sm">
          Set up a new match, configure initial team rosters, and invite fellow players to join.
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
        {/* Sport Selection */}
        <div>
          <label htmlFor="sport" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Select Sport <span className="text-rose-400">*</span>
          </label>
          {fetchingSports ? (
            <div className="text-sm text-slate-500">Loading sports list...</div>
          ) : sports.length === 0 ? (
            <div className="text-sm text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
              No sports currently available. Please ask an admin to add a sport first.
            </div>
          ) : (
            <div className="relative">
              <Trophy className="w-5 h-5 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                id="sport"
                required
                value={sportId}
                onChange={(e) => setSportId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
              >
                {sports.map((sport) => (
                  <option key={sport.id} value={sport.id} className="bg-slate-900 text-slate-100">
                    {sport.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Date and Time Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Match Date <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="date"
                type="date"
                required
                min={todayStr}
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="time" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Match Time <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="time"
                type="time"
                required
                value={sessionTime}
                onChange={(e) => setSessionTime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Venue Field */}
        <div>
          <label htmlFor="venue" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Match Venue <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-rose-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="venue"
              type="text"
              required
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. College Football Ground, Turf Arena B, Court 1"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Additional Players Required */}
        <div>
          <label htmlFor="additionalPlayers" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Additional Players Needed <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <Users className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="additionalPlayers"
              type="number"
              min="1"
              max="50"
              required
              value={additionalPlayersRequired}
              onChange={(e) => setAdditionalPlayersRequired(parseInt(e.target.value, 10) || 1)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
            />
          </div>
          <p className="text-xs text-slate-400 mt-1.5">
            The number of open slots that other players can join into.
          </p>
        </div>

        {/* Initial Teams Player List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
          {/* Team A */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Team A Players
              </span>
              <span className="text-xs text-slate-500">{teamAPlayers.length} confirmed</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={teamAInput}
                onChange={(e) => setTeamAInput(e.target.value)}
                placeholder="Add player name..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addPlayerToTeamA(e);
                  }
                }}
                className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={addPlayerToTeamA}
                className="p-1.5 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {teamAPlayers.map((p, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-medium"
                >
                  {p}
                  <button
                    type="button"
                    onClick={() => removePlayerFromTeamA(idx)}
                    className="hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Team B */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                Team B Players
              </span>
              <span className="text-xs text-slate-500">{teamBPlayers.length} confirmed</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={teamBInput}
                onChange={(e) => setTeamBInput(e.target.value)}
                placeholder="Add player name..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addPlayerToTeamB(e);
                  }
                }}
                className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <button
                type="button"
                onClick={addPlayerToTeamB}
                className="p-1.5 rounded-xl bg-sky-600/20 text-sky-400 hover:bg-sky-600/30 border border-sky-500/30"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {teamBPlayers.map((p, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300 font-medium"
                >
                  {p}
                  <button
                    type="button"
                    onClick={() => removePlayerFromTeamB(idx)}
                    className="hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/25 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Creating Match...' : 'Create Match Session'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
