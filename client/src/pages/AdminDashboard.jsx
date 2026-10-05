import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sportsApi } from '../api/sports';
import { sessionsApi } from '../api/sessions';
import { reportsApi } from '../api/reports';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import {
  Trophy,
  Calendar,
  Clock,
  CheckCircle,
  PlusCircle,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSports: 0,
    totalSessions: 0,
    upcomingSessions: 0,
    completedSessions: 0,
  });
  const [sports, setSports] = useState([]);
  const [recentPlayed, setRecentPlayed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAdminData() {
      try {
        setLoading(true);
        const [sportsRes, createdRes, joinedRes, reportRes] = await Promise.all([
          sportsApi.getAllSports(),
          sessionsApi.getCreatedSessions(),
          sessionsApi.getJoinedSessions(),
          reportsApi.getSessionsReport(),
        ]);

        const allSports = sportsRes.sports || [];
        setSports(allSports.slice(0, 6));

        // Calculate counts
        const totalPlayed = reportRes.totalSessionsPlayed || 0;
        const upcomingCount = (createdRes.sessions || []).filter(
          (s) => s.status === 'UPCOMING'
        ).length;

        setStats({
          totalSports: allSports.length,
          totalSessions: totalPlayed + upcomingCount,
          upcomingSessions: upcomingCount,
          completedSessions: totalPlayed,
        });

        setRecentPlayed((reportRes.sessions || []).slice(0, 5));
      } catch (err) {
        setError(err.message || 'Failed to load administrator dashboard.');
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Admin Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Administrator Control Center
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Administrator Dashboard
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Manage sports catalogs, monitor live session activities, generate engagement reports, and participate in matches.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/sports"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/20 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            Create Sport
          </Link>
          <Link
            to="/create-session"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            Create Match
          </Link>
          <Link
            to="/admin/reports"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            View Reports
          </Link>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link
          to="/admin/sports"
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Sports
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mb-1">{stats.totalSports}</div>
          <span className="text-xs text-purple-400 font-medium flex items-center gap-1">
            Manage sports <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <Link
          to="/sessions"
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Sessions
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mb-1">{stats.totalSessions}</div>
          <span className="text-xs text-emerald-400 font-medium">All organized sessions</span>
        </Link>

        <Link
          to="/sessions"
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/40 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Upcoming Sessions
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mb-1">{stats.upcomingSessions}</div>
          <span className="text-xs text-sky-400 font-medium">Scheduled ahead</span>
        </Link>

        <Link
          to="/admin/reports"
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Completed Sessions
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mb-1">{stats.completedSessions}</div>
          <span className="text-xs text-amber-400 font-medium flex items-center gap-1">
            Analyze analytics <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>

      {/* Two Column Layout: Sports & Reports Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Managed Sports */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Active Sports Catalog</h2>
              <p className="text-xs text-slate-400">Sports created and available for scheduling</p>
            </div>
            <Link
              to="/admin/sports"
              className="px-3.5 py-1.5 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 text-xs font-semibold border border-purple-500/20 transition-colors"
            >
              + Add Sport
            </Link>
          </div>

          <div className="divide-y divide-slate-800">
            {sports.map((sport) => (
              <div key={sport.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-purple-400">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-white text-sm block">{sport.name}</span>
                    <span className="text-xs text-slate-500">
                      Created by {sport.createdBy?.name || 'Administrator'}
                    </span>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-medium">
                  {sport._count?.sessions || 0} matches
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reports Quick Link & Played Sessions Preview */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Engagement Reports</h2>
                <p className="text-xs text-slate-400">Recent completed sessions query</p>
              </div>
              <Link
                to="/admin/reports"
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                Open Analytics <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentPlayed.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4 text-center">
                  No completed sessions in the default report range.
                </p>
              ) : (
                recentPlayed.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-200 block text-sm">
                        {session.sportName}
                      </span>
                      <span className="text-slate-400">
                        {session.sessionDate} at {session.sessionTime} • {session.venue}
                      </span>
                    </div>
                    <Badge variant="default">COMPLETED</Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/20 to-slate-900 border border-purple-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              <div>
                <span className="text-sm font-bold text-white block">Sport Popularity Reports</span>
                <span className="text-xs text-slate-400">
                  Filter by custom date ranges and export insights
                </span>
              </div>
            </div>
            <Link
              to="/admin/reports"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shadow-md"
            >
              Generate
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
