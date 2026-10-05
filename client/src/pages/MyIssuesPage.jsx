import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { issuesApi } from '../api/issues';
import { StatusBadge, PriorityBadge } from '../components/Badge';
import {
  FileCheck2,
  PlusCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Filter,
} from 'lucide-react';

export function MyIssuesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    async function fetchMyIssues() {
      if (!user) return;
      setLoading(true);
      try {
        const res = await issuesApi.getIssues({ reporterId: user.id });
        setIssues(res.issues || []);
      } catch (err) {
        console.error('Failed to load my issues:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMyIssues();
  }, [user]);

  const filteredIssues = issues.filter((iss) => {
    if (statusFilter === 'OPEN') return ['REPORTED', 'ASSIGNED', 'REOPENED'].includes(iss.status);
    if (statusFilter === 'IN_PROGRESS') return iss.status === 'IN_PROGRESS';
    if (statusFilter === 'RESOLVED') return ['RESOLVED', 'CLOSED'].includes(iss.status);
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">
            My Reported Issues
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track the live progress and resolution history of your campus service requests
          </p>
        </div>

        <Link
          to="/issues/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30 transition"
        >
          <PlusCircle className="w-4 h-4" />
          Report New Issue
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs font-semibold">
        {[
          { key: 'ALL', label: `All Reports (${issues.length})` },
          {
            key: 'OPEN',
            label: `Open (${issues.filter((i) => ['REPORTED', 'ASSIGNED', 'REOPENED'].includes(i.status)).length})`,
          },
          {
            key: 'IN_PROGRESS',
            label: `In Progress (${issues.filter((i) => i.status === 'IN_PROGRESS').length})`,
          },
          {
            key: 'RESOLVED',
            label: `Resolved (${issues.filter((i) => ['RESOLVED', 'CLOSED'].includes(i.status)).length})`,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3 py-1.5 rounded-xl transition ${
              statusFilter === tab.key
                ? 'bg-sky-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Issues List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Loading your reports...</p>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <FileCheck2 className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">No reported issues</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You do not have any issues in this category.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {filteredIssues.map((iss) => (
              <div
                key={iss.id}
                onClick={() => navigate(`/issues/${iss.id}`)}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/40 cursor-pointer transition group"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">
                      #{iss.id}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-sky-300 transition truncate">
                      {iss.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-1">{iss.description}</p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-1">
                    <span>
                      <strong className="text-slate-300">Category:</strong> {iss.category?.name}
                    </span>
                    <span>
                      <strong className="text-slate-300">Location:</strong>{' '}
                      {iss.location?.building?.name} — {iss.location?.name}
                    </span>
                    <span>
                      <strong className="text-slate-300">Date:</strong>{' '}
                      {new Date(iss.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <PriorityBadge priority={iss.priority} size="sm" />
                  <StatusBadge status={iss.status} size="sm" />
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-sky-400 transition" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
