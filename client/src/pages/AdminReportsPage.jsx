import React, { useState, useEffect } from 'react';
import { reportsApi } from '../api/reports';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  BarChart3,
  Calendar,
  Filter,
  Trophy,
  Activity,
  CheckCircle2,
  PieChart as PieIcon,
  RefreshCw,
} from 'lucide-react';

const CHART_COLORS = [
  '#10b981', // emerald
  '#0ea5e9', // sky
  '#a855f7', // purple
  '#f59e0b', // amber
  '#ec4899', // pink
  '#3b82f6', // blue
  '#14b8a6', // teal
  '#f43f5e', // rose
];

export default function AdminReportsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Set default initial range: beginning of current month to today
  useEffect(() => {
    const now = new Date();
    const endStr = now.toISOString().split('T')[0];
    
    // 30 days ago
    const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startStr = past.toISOString().split('T')[0];

    setStartDate(startStr);
    setEndDate(endStr);

    fetchReport(startStr, endStr);
  }, []);

  const fetchReport = async (start, end) => {
    try {
      setLoading(true);
      setError('');
      const data = await reportsApi.getSessionsReport(start, end);
      setReport(data);
    } catch (err) {
      setError(err.message || 'Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = (e) => {
    e.preventDefault();
    if (startDate && endDate && startDate > endDate) {
      setError('Start date cannot be after end date.');
      return;
    }
    fetchReport(startDate, endDate);
  };

  const popularityData = report?.sportPopularity || [];
  const totalPlayed = report?.totalSessionsPlayed || 0;
  const sessionsList = report?.sessions || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            Executive Analytics
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Admin Reports
          </h1>
          <p className="text-slate-400 text-sm">
            Analyze match volume and relative sport popularity for played sessions during a configurable timeframe.
          </p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Date Range Configurator Form */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <form onSubmit={handleGenerateReport} className="flex flex-col sm:flex-row items-end gap-4">
          <div className="w-full sm:w-auto flex-1">
            <label htmlFor="startDate" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="startDate"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <div className="w-full sm:w-auto flex-1">
            <label htmlFor="endDate" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              End Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="endDate"
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all shadow-lg shadow-purple-600/25 disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Filter className="w-4 h-4" />
            )}
            Generate Report
          </button>
        </form>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Sessions Played
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-extrabold text-white tracking-tight">{totalPlayed}</div>
          <p className="text-xs text-slate-400">
            Past completed matches (cancelled sessions excluded)
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Most Popular Sport
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-300 truncate">
            {popularityData[0]?.sportName || 'N/A'}
          </div>
          <p className="text-xs text-slate-400">
            {popularityData[0]
              ? `${popularityData[0].count} matches played (${popularityData[0].percentage}%)`
              : 'No matches in range'}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Distinct Sports Played
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-extrabold text-white tracking-tight">
            {popularityData.length}
          </div>
          <p className="text-xs text-slate-400">Different sporting categories active</p>
        </div>
      </div>

      {/* Sport Popularity Breakdown & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popularity Bar Chart */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              Sport Popularity (Match Count)
            </h2>
          </div>

          {popularityData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm italic">
              No sessions played in this date range.
            </div>
          ) : (
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularityData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="sportName" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Popularity Share Donut Chart */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-purple-400" />
              Relative Sport Share (%)
            </h2>
          </div>

          {popularityData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm italic">
              No sessions played in this date range.
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={popularityData}
                    dataKey="count"
                    nameKey="sportName"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                  >
                    {popularityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Sport Popularity Table Breakdown */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">
          Sport Popularity Breakdown
        </h2>

        {popularityData.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No played matches within the selected period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 text-xs font-bold uppercase text-slate-400">
                <tr>
                  <th className="pb-3">Rank</th>
                  <th className="pb-3">Sport Name</th>
                  <th className="pb-3 text-right">Sessions Played</th>
                  <th className="pb-3 text-right">Relative Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {popularityData.map((item, index) => (
                  <tr key={item.sportId} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 font-bold text-slate-500 text-xs">#{index + 1}</td>
                    <td className="py-3 font-semibold text-white">{item.sportName}</td>
                    <td className="py-3 text-right font-bold text-emerald-400">{item.count}</td>
                    <td className="py-3 text-right text-slate-300 font-medium">{item.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Played Sessions Included in Report */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">
          Sessions List in Report Range ({sessionsList.length})
        </h2>

        {sessionsList.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No sessions played during this period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 font-bold uppercase text-slate-400">
                <tr>
                  <th className="pb-3">Match ID</th>
                  <th className="pb-3">Sport</th>
                  <th className="pb-3">Date & Time</th>
                  <th className="pb-3">Venue</th>
                  <th className="pb-3">Organizer</th>
                  <th className="pb-3 text-right">Joined Players</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {sessionsList.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 text-slate-400 font-mono">#{s.id}</td>
                    <td className="py-3 font-semibold text-white">{s.sportName}</td>
                    <td className="py-3 text-slate-300">
                      {s.sessionDate} at {s.sessionTime}
                    </td>
                    <td className="py-3 text-slate-300">{s.venue}</td>
                    <td className="py-3 text-slate-300">{s.creatorName}</td>
                    <td className="py-3 text-right font-bold text-sky-400">{s.playersCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
