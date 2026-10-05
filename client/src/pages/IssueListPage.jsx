import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { issuesApi } from '../api/issues';
import { categoriesApi } from '../api/categories';
import { locationsApi } from '../api/locations';
import { StatusBadge, PriorityBadge } from '../components/Badge';
import {
  Search,
  Filter,
  PlusCircle,
  X,
  Building2,
  Calendar,
  Layers,
  ArrowUpDown,
  RotateCcw,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

export function IssueListPage() {
  const { user, isReporter, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [buildings, setBuildings] = useState([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [priority, setPriority] = useState(searchParams.get('priority') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
  const [buildingId, setBuildingId] = useState(searchParams.get('buildingId') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');

  // Load filter options (categories & buildings)
  useEffect(() => {
    async function loadMeta() {
      try {
        const [catRes, buildRes] = await Promise.all([
          categoriesApi.getCategories(),
          locationsApi.getBuildings(),
        ]);
        setCategories(catRes.categories || []);
        setBuildings(buildRes.buildings || []);
      } catch (err) {
        console.warn('Failed to load filter options:', err);
      }
    }
    loadMeta();
  }, []);

  // Fetch filtered issues from backend
  const fetchIssues = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchTerm || undefined,
        status: status || undefined,
        priority: priority || undefined,
        categoryId: categoryId || undefined,
        buildingId: buildingId || undefined,
        sortBy: sortBy || 'newest',
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      const res = await issuesApi.getIssues(params);
      setIssues(res.issues || []);
    } catch (err) {
      console.error('Failed to fetch issues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [status, priority, categoryId, buildingId, sortBy, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchIssues();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatus('');
    setPriority('');
    setCategoryId('');
    setBuildingId('');
    setSortBy('newest');
    setStartDate('');
    setEndDate('');
    setSearchParams({});
  };

  const hasActiveFilters =
    status || priority || categoryId || buildingId || searchTerm || startDate || endDate;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">
            Campus Issues Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search, filter, and track all maintenance complaints across campus facilities
          </p>
        </div>

        {isReporter && (
          <Link
            to="/issues/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30 transition"
          >
            <PlusCircle className="w-4 h-4" />
            Report Issue
          </Link>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-4 shadow-sm">
        {/* Top Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search issues by title, description, area, or #ID..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition"
          >
            Search
          </button>
        </form>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          {/* Status */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="">All Statuses</option>
            <option value="REPORTED">Reported</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="REOPENED">Reopened</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Priority */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Category */}
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Building */}
          <select
            value={buildingId}
            onChange={(e) => setBuildingId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="">All Buildings</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">Highest Priority</option>
            <option value="updated">Recently Updated</option>
          </select>

          {/* Reset button */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Issues Table / List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Matching Issues ({issues.length})
          </span>
          <span className="text-[11px] text-slate-500">
            Click on any issue to view full details and workflow actions
          </span>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Loading issues...</p>
          </div>
        ) : issues.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">No issues found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No reported issues matched your current search filters. Try clearing some criteria.
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {issues.map((iss) => (
              <div
                key={iss.id}
                onClick={() => navigate(`/issues/${iss.id}`)}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/40 cursor-pointer transition group"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
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
                    {iss.specificArea && (
                      <span className="text-slate-500 italic">({iss.specificArea})</span>
                    )}
                    <span>
                      <strong className="text-slate-300">Reporter:</strong> {iss.reporter?.name}
                    </span>
                    <span>
                      <strong className="text-slate-300">Reported:</strong>{' '}
                      {new Date(iss.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Right Badges & Tech */}
                <div className="flex items-center gap-3 flex-shrink-0 self-start md:self-center">
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={iss.priority} size="sm" />
                      <StatusBadge status={iss.status} size="sm" />
                    </div>
                    {iss.assignments && iss.assignments[0] && (
                      <span className="text-[10px] text-teal-400 flex items-center gap-1 font-medium">
                        Tech: {iss.assignments[0].technician?.name}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-sky-400 group-hover:translate-x-0.5 transition" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
