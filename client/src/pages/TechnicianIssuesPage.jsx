import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { issuesApi } from '../api/issues';
import { StatusBadge, PriorityBadge } from '../components/Badge';
import {
  Wrench,
  Play,
  CheckCircle,
  Clock,
  HardHat,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

export function TechnicianIssuesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabFilter, setTabFilter] = useState('ALL');

  const fetchAssignedIssues = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await issuesApi.getIssues({ technicianId: user.id });
      setIssues(res.issues || []);
    } catch (err) {
      console.error('Failed to load technician issues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedIssues();
  }, [user]);

  const filteredIssues = issues.filter((iss) => {
    if (tabFilter === 'PENDING') return ['ASSIGNED', 'REOPENED'].includes(iss.status);
    if (tabFilter === 'IN_PROGRESS') return iss.status === 'IN_PROGRESS';
    if (tabFilter === 'RESOLVED') return ['RESOLVED', 'CLOSED'].includes(iss.status);
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">
            Technician Maintenance Queue
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Accept tasks, start repair work, and document resolution notes
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs font-semibold">
        {[
          { key: 'ALL', label: `All Tasks (${issues.length})` },
          {
            key: 'PENDING',
            label: `Ready to Start (${issues.filter((i) => ['ASSIGNED', 'REOPENED'].includes(i.status)).length})`,
          },
          {
            key: 'IN_PROGRESS',
            label: `In Progress (${issues.filter((i) => i.status === 'IN_PROGRESS').length})`,
          },
          {
            key: 'RESOLVED',
            label: `Completed (${issues.filter((i) => ['RESOLVED', 'CLOSED'].includes(i.status)).length})`,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setTabFilter(tab.key)}
            className={`px-3 py-1.5 rounded-xl transition ${
              tabFilter === tab.key
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Issues Queue Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Loading maintenance queue...</p>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <HardHat className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">No tasks in this view</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You do not have any maintenance tickets matching this status.
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
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-teal-300 transition truncate">
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
                    {iss.specificArea && (
                      <span className="text-slate-500 italic">({iss.specificArea})</span>
                    )}
                    <span>
                      <strong className="text-slate-300">Reporter:</strong> {iss.reporter?.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <PriorityBadge priority={iss.priority} size="sm" />
                  <StatusBadge status={iss.status} size="sm" />
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-teal-400 transition" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
