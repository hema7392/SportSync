import React, { useState, useEffect } from 'react';
import { sessionsApi } from '../api/sessions';
import { sportsApi } from '../api/sports';
import SessionCard from '../components/SessionCard';
import CancelModal from '../components/CancelModal';
import Alert from '../components/Alert';
import { Calendar, Filter, Search, Trophy } from 'lucide-react';

export default function AvailableSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [sports, setSports] = useState([]);
  const [selectedSportId, setSelectedSportId] = useState('');
  const [searchVenue, setSearchVenue] = useState('');
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cancelModalSession, setCancelModalSession] = useState(null);

  const loadData = async (sportId = '') => {
    try {
      setLoading(true);
      setError('');
      const [sessionsRes, sportsRes] = await Promise.all([
        sessionsApi.getAvailableSessions(sportId),
        sportsApi.getAllSports(),
      ]);
      setSessions(sessionsRes.sessions || []);
      setSports(sportsRes.sports || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch available sessions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedSportId);
  }, [selectedSportId]);

  const handleJoin = async (session) => {
    try {
      setJoiningId(session.id);
      setError('');
      await sessionsApi.joinSession(session.id);
      setSuccess(`You have successfully joined the ${session.sport?.name} match!`);
      loadData(selectedSportId);
    } catch (err) {
      setError(err.message || 'Failed to join match.');
    } finally {
      setJoiningId(null);
    }
  };

  const handleCancel = async (sessionId, reason) => {
    await sessionsApi.cancelSession(sessionId, reason);
    setSuccess('Match has been cancelled.');
    loadData(selectedSportId);
  };

  // Filter sessions by venue or creator search text
  const filteredSessions = sessions.filter((s) => {
    if (!searchVenue.trim()) return true;
    const query = searchVenue.toLowerCase();
    const venueMatch = s.venue?.toLowerCase().includes(query);
    const creatorMatch = s.creator?.name?.toLowerCase().includes(query);
    return venueMatch || creatorMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <Calendar className="w-3.5 h-3.5" />
            Live Game Matchmaking
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Available Sessions
          </h1>
          <p className="text-slate-400 text-sm">
            Browse upcoming matches organized by players and reserve your slot on the field.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Sport Filter */}
          <div className="relative w-full sm:w-48">
            <Trophy className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedSportId}
              onChange={(e) => setSelectedSportId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Sports</option>
              {sports.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Venue / Creator */}
          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchVenue}
              onChange={(e) => setSearchVenue(e.target.value)}
              placeholder="Search venue or host..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Sessions Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
          Loading available matches...
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="p-16 text-center bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 space-y-3">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-xl font-bold text-slate-200">No open sessions found</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            {selectedSportId || searchVenue
              ? 'Try changing your sport filter or search terms.'
              : 'There are no open upcoming sessions with vacant slots at the moment.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onJoin={handleJoin}
              onCancel={(s) => setCancelModalSession(s)}
              isJoining={joiningId === session.id}
            />
          ))}
        </div>
      )}

      {/* Cancel Modal */}
      <CancelModal
        isOpen={!!cancelModalSession}
        onClose={() => setCancelModalSession(null)}
        session={cancelModalSession}
        onConfirm={handleCancel}
      />
    </div>
  );
}
