import React, { useState, useEffect } from 'react';
import { sportsApi } from '../api/sports';
import Alert from '../components/Alert';
import { Trophy, PlusCircle, Trash2, Calendar, AlertCircle } from 'lucide-react';

export default function AdminSportsPage() {
  const [sports, setSports] = useState([]);
  const [newSportName, setNewSportName] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadSports = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await sportsApi.getAllSports();
      setSports(data.sports || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch sports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSports();
  }, []);

  const handleCreateSport = async (e) => {
    e.preventDefault();
    const trimmed = newSportName.trim();
    if (!trimmed) {
      setError('Please provide a valid sport name.');
      return;
    }

    // Client-side duplicate check before sending to server
    const isDuplicate = sports.some(
      (s) => s.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      setError(`A sport named "${trimmed}" already exists.`);
      return;
    }

    try {
      setCreating(true);
      setError('');
      const res = await sportsApi.createSport({ name: trimmed });
      setSuccess(`Sport "${res.sport?.name || trimmed}" added successfully!`);
      setNewSportName('');
      loadSports();
    } catch (err) {
      setError(err.message || 'Failed to create sport.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSport = async (sportId, sportName) => {
    if (!window.confirm(`Are you sure you want to delete "${sportName}"? Any associated matches will also be deleted.`)) {
      return;
    }

    try {
      setError('');
      await sportsApi.deleteSport(sportId);
      setSuccess(`Sport "${sportName}" deleted.`);
      loadSports();
    } catch (err) {
      setError(err.message || 'Failed to delete sport.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-2">
            <Trophy className="w-3.5 h-3.5" />
            Administrator Panel
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Manage Sports
          </h1>
          <p className="text-slate-400 text-sm">
            Add new sports or manage the sports catalog available for player scheduling.
          </p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Create Sport Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-purple-400" />
          Create New Sport
        </h2>
        <form onSubmit={handleCreateSport} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={newSportName}
            onChange={(e) => setNewSportName(e.target.value)}
            placeholder="e.g. Badminton, Football, Cricket, Pickleball..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors"
          />
          <button
            type="submit"
            disabled={creating}
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all shadow-lg shadow-purple-600/25 disabled:opacity-50 whitespace-nowrap"
          >
            {creating ? 'Adding...' : '+ Create Sport'}
          </button>
        </form>
      </div>

      {/* Existing Sports Table / Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Current Sports ({sports.length})
        </h2>

        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
            Loading sports list...
          </div>
        ) : sports.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 space-y-2">
            <Trophy className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-slate-300 font-semibold">No sports available yet.</p>
            <p className="text-xs text-slate-500">Use the form above to add your first sport.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {sports.map((sport) => (
              <div
                key={sport.id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      ID #{sport.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteSport(sport.id, sport.name)}
                      title="Delete Sport"
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight">
                    {sport.name}
                  </h3>
                  <div className="text-xs text-slate-400 space-y-1 pt-1">
                    <div>
                      Created by:{' '}
                      <span className="text-slate-200 font-medium">
                        {sport.createdBy?.name || 'Administrator'}
                      </span>
                    </div>
                    <div>
                      Matches organized:{' '}
                      <span className="text-emerald-400 font-semibold">
                        {sport._count?.sessions || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
