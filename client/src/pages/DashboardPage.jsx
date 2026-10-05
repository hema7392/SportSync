import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { issuesApi } from '../api/issues';
import { reportsApi } from '../api/reports';
import { StatCard } from '../components/StatCard';
import { StatusBadge, PriorityBadge } from '../components/Badge';
import {
  ClipboardList,
  AlertTriangle,
  Clock,
  CheckCircle2,
  PlusCircle,
  Wrench,
  Users,
  Building2,
  FolderTree,
  BarChart3,
  ArrowRight,
  TrendingUp,
  HardHat,
  ShieldCheck,
  ChevronRight,
  Flame,
} from 'lucide-react';

export function DashboardPage() {
  const { user, isAdmin, isReporter, isTechnician } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentIssues, setRecentIssues] = useState([]);
  const [urgentIssues, setUrgentIssues] = useState([]);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        if (isAdmin) {
          // Fetch Admin Overview and Recent Issues
          const [overview, issuesRes] = await Promise.all([
            reportsApi.getOverview(),
            issuesApi.getIssues({ limit: 10 }),
          ]);
          setStats(overview);
          setRecentIssues(issuesRes.issues || []);
          setUrgentIssues(
            (issuesRes.issues || []).filter(
              (i) => (i.priority === 'CRITICAL' || i.priority === 'HIGH') && i.status !== 'RESOLVED' && i.status !== 'CLOSED'
            )
          );
        } else if (isReporter) {
          // Fetch Reporter issues
          const issuesRes = await issuesApi.getIssues({ reporterId: user.id });
          const myIssues = issuesRes.issues || [];
          setRecentIssues(myIssues);

          const total = myIssues.length;
          const open = myIssues.filter((i) => ['REPORTED', 'ASSIGNED', 'REOPENED'].includes(i.status)).length;
          const inProgress = myIssues.filter((i) => i.status === 'IN_PROGRESS').length;
          const resolved = myIssues.filter((i) => ['RESOLVED', 'CLOSED'].includes(i.status)).length;
          const highPriority = myIssues.filter((i) => i.priority === 'HIGH' || i.priority === 'CRITICAL').length;

          setStats({
            totalReports: total,
            openReports: open,
            inProgressReports: inProgress,
            resolvedReports: resolved,
            highPriorityReports: highPriority,
          });
        } else if (isTechnician) {
          // Fetch Technician assigned issues
          const issuesRes = await issuesApi.getIssues({ technicianId: user.id });
          const assigned = issuesRes.issues || [];
          setRecentIssues(assigned);

          const total = assigned.length;
          const inProgress = assigned.filter((i) => i.status === 'IN_PROGRESS').length;
          const activeAssigned = assigned.filter((i) => i.status === 'ASSIGNED').length;
          const resolved = assigned.filter((i) => ['RESOLVED', 'CLOSED'].includes(i.status)).length;
          const critical = assigned.filter((i) => i.priority === 'CRITICAL' || i.priority === 'HIGH').length;

          setStats({
            totalAssigned: total,
            activeAssigned,
            inProgress,
            resolved,
            critical,
          });
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadDashboardData();
    }
  }, [user, isAdmin, isReporter, isTechnician]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isAdmin && 'Campus Facilities Central Command & Operations Control'}
            {isReporter && 'Track and manage your campus service requests and reports'}
            {isTechnician && 'Your active maintenance assignments and task queue'}
          </p>
        </div>

        {isReporter && (
          <Link
            to="/issues/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30 transition"
          >
            <PlusCircle className="w-4 h-4" />
            Report New Issue
          </Link>
        )}

        {isAdmin && (
          <Link
            to="/admin/reports"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 transition"
          >
            <BarChart3 className="w-4 h-4" />
            View Analytics
          </Link>
        )}
      </div>

      {/* ADMIN DASHBOARD VIEW */}
      {isAdmin && (
        <div className="space-y-8">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Issues"
              value={stats?.totalIssues ?? 0}
              icon={ClipboardList}
              color="sky"
              subtitle="All historical reports"
            />
            <StatCard
              title="Open Issues"
              value={stats?.openIssues ?? 0}
              icon={Clock}
              color="amber"
              subtitle="Pending resolution"
            />
            <StatCard
              title="Resolved"
              value={stats?.resolvedIssues ?? 0}
              icon={CheckCircle2}
              color="emerald"
              subtitle={`${stats?.resolutionRate ?? 0}% resolution rate`}
            />
            <StatCard
              title="Critical Priority"
              value={stats?.criticalIssues ?? 0}
              icon={Flame}
              color="rose"
              subtitle="Requires immediate action"
            />
          </div>

          {/* Secondary Admin KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Active Technicians</p>
                <p className="text-xl font-bold text-white mt-1">{stats?.activeTechnicians ?? 0}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <HardHat className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Avg Resolution Time</p>
                <p className="text-xl font-bold text-white mt-1">
                  {stats?.avgResolutionHours ? `${stats.avgResolutionHours} hrs` : 'N/A'}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">In Progress</p>
                <p className="text-xl font-bold text-white mt-1">{stats?.inProgressIssues ?? 0}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Wrench className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Admin Navigation Quick-Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
              Management Modules
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link
                to="/issues"
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 hover:bg-slate-900 transition group"
              >
                <ClipboardList className="w-5 h-5 text-sky-400 mb-2 group-hover:scale-110 transition" />
                <p className="font-bold text-sm text-white">All Issues</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Filter, assign & resolve</p>
              </Link>

              <Link
                to="/admin/users"
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 hover:bg-slate-900 transition group"
              >
                <Users className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition" />
                <p className="font-bold text-sm text-white">Users Directory</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Roles & activations</p>
              </Link>

              <Link
                to="/admin/categories"
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 hover:bg-slate-900 transition group"
              >
                <FolderTree className="w-5 h-5 text-teal-400 mb-2 group-hover:scale-110 transition" />
                <p className="font-bold text-sm text-white">Categories</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Service classifications</p>
              </Link>

              <Link
                to="/admin/locations"
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900 transition group"
              >
                <Building2 className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition" />
                <p className="font-bold text-sm text-white">Campus Locations</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Buildings & rooms</p>
              </Link>
            </div>
          </div>

          {/* Urgent Issues Alert Table */}
          {urgentIssues.length > 0 && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-950/10 p-5 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                High & Critical Priority Issues Requiring Attention ({urgentIssues.length})
              </div>
              <div className="divide-y divide-slate-800/60">
                {urgentIssues.slice(0, 5).map((iss) => (
                  <div
                    key={iss.id}
                    onClick={() => navigate(`/issues/${iss.id}`)}
                    className="py-3 flex items-center justify-between hover:bg-slate-800/40 px-2 rounded-xl cursor-pointer transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">#{iss.id}</span>
                        <p className="text-sm font-semibold text-white">{iss.title}</p>
                      </div>
                      <p className="text-xs text-slate-400">
                        {iss.location?.building?.name} • {iss.location?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <PriorityBadge priority={iss.priority} size="sm" />
                      <StatusBadge status={iss.status} size="sm" />
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Issues Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Recent Issues Activity</h3>
              <Link to="/issues" className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1">
                View All
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-slate-800/60">
              {recentIssues.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">No issues reported yet.</div>
              ) : (
                recentIssues.slice(0, 6).map((iss) => (
                  <div
                    key={iss.id}
                    onClick={() => navigate(`/issues/${iss.id}`)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-800/40 cursor-pointer transition"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400 font-bold">#{iss.id}</span>
                        <h4 className="text-sm font-semibold text-white truncate">{iss.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400">
                        {iss.category?.name} • {iss.location?.building?.name || 'Campus'} (
                        {iss.location?.name || 'General'}) • Reported by {iss.reporter?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <PriorityBadge priority={iss.priority} size="sm" />
                      <StatusBadge status={iss.status} size="sm" />
                      <span className="text-[11px] text-slate-500 ml-2">
                        {new Date(iss.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* REPORTER DASHBOARD VIEW */}
      {isReporter && (
        <div className="space-y-8">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <StatCard
              title="Total Submitted"
              value={stats?.totalReports ?? 0}
              icon={ClipboardList}
              color="sky"
            />
            <StatCard
              title="Open Reports"
              value={stats?.openReports ?? 0}
              icon={Clock}
              color="amber"
            />
            <StatCard
              title="In Progress"
              value={stats?.inProgressReports ?? 0}
              icon={Wrench}
              color="teal"
            />
            <StatCard
              title="Resolved"
              value={stats?.resolvedReports ?? 0}
              icon={CheckCircle2}
              color="emerald"
            />
            <StatCard
              title="High Priority"
              value={stats?.highPriorityReports ?? 0}
              icon={Flame}
              color="rose"
            />
          </div>

          {/* Quick Actions Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              onClick={() => navigate('/issues/new')}
              className="p-5 rounded-2xl bg-gradient-to-br from-sky-900/40 to-slate-900 border border-sky-500/30 hover:border-sky-500/60 cursor-pointer transition shadow-md group"
            >
              <PlusCircle className="w-7 h-7 text-sky-400 mb-2 group-hover:scale-110 transition" />
              <h3 className="font-bold text-white text-base">Report New Issue</h3>
              <p className="text-xs text-slate-400 mt-1">Submit a problem with photo and room location</p>
            </div>

            <div
              onClick={() => navigate('/my-issues')}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition group"
            >
              <ClipboardList className="w-7 h-7 text-teal-400 mb-2 group-hover:scale-110 transition" />
              <h3 className="font-bold text-white text-base">My Reports</h3>
              <p className="text-xs text-slate-400 mt-1">View the status of complaints you have logged</p>
            </div>

            <div
              onClick={() => navigate('/issues')}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition group"
            >
              <Building2 className="w-7 h-7 text-purple-400 mb-2 group-hover:scale-110 transition" />
              <h3 className="font-bold text-white text-base">Campus Feed</h3>
              <p className="text-xs text-slate-400 mt-1">Browse all reported issues across campus</p>
            </div>
          </div>

          {/* My Recent Reports */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">My Reported Issues</h3>
              <Link to="/my-issues" className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1">
                View All
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-800/60">
              {recentIssues.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <p className="text-sm text-slate-400">You haven't reported any issues yet.</p>
                  <Link
                    to="/issues/new"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Report your first issue
                  </Link>
                </div>
              ) : (
                recentIssues.slice(0, 5).map((iss) => (
                  <div
                    key={iss.id}
                    onClick={() => navigate(`/issues/${iss.id}`)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-800/40 cursor-pointer transition"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">#{iss.id}</span>
                        <h4 className="text-sm font-semibold text-white truncate">{iss.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400">
                        {iss.category?.name} • {iss.location?.building?.name} ({iss.location?.name})
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={iss.priority} size="sm" />
                      <StatusBadge status={iss.status} size="sm" />
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TECHNICIAN DASHBOARD VIEW */}
      {isTechnician && (
        <div className="space-y-8">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              title="Assigned to Me"
              value={stats?.totalAssigned ?? 0}
              icon={ClipboardList}
              color="sky"
            />
            <StatCard
              title="Pending Start"
              value={stats?.activeAssigned ?? 0}
              icon={Clock}
              color="amber"
              subtitle="Ready to accept"
            />
            <StatCard
              title="Currently In Progress"
              value={stats?.inProgress ?? 0}
              icon={Wrench}
              color="teal"
              subtitle="Active repair work"
            />
            <StatCard
              title="Resolved by Me"
              value={stats?.resolved ?? 0}
              icon={CheckCircle2}
              color="emerald"
            />
          </div>

          {/* Assigned Work Items Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">My Maintenance Queue</h3>
              <Link to="/technician/issues" className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1">
                Technician Workspace
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-800/60">
              {recentIssues.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  You have no issues currently assigned. Check back later or notify the facility administrator.
                </div>
              ) : (
                recentIssues.map((iss) => (
                  <div
                    key={iss.id}
                    onClick={() => navigate(`/issues/${iss.id}`)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-800/40 cursor-pointer transition"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">#{iss.id}</span>
                        <h4 className="text-sm font-semibold text-white truncate">{iss.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400">
                        {iss.location?.building?.name} • {iss.location?.name} (
                        {iss.specificArea || 'No specific room area note'})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={iss.priority} size="sm" />
                      <StatusBadge status={iss.status} size="sm" />
                      <span className="text-xs font-bold text-sky-400 ml-2">Open Task &rarr;</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
