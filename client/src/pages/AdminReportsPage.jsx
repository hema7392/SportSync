import React, { useState, useEffect } from 'react';
import { reportsApi } from '../api/reports';
import { StatCard } from '../components/StatCard';
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
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  BarChart3,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HardHat,
  RotateCcw,
  TrendingUp,
} from 'lucide-react';

const STATUS_COLORS = {
  Reported: '#38bdf8',
  Assigned: '#a855f7',
  'In Progress': '#f59e0b',
  Resolved: '#10b981',
  Closed: '#64748b',
  Reopened: '#f43f5e',
  Cancelled: '#475569',
};

const PIE_COLORS = ['#38bdf8', '#a855f7', '#f59e0b', '#10b981', '#64748b', '#f43f5e'];

export function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [technicianData, setTechnicianData] = useState([]);
  const [trendData, setTrendData] = useState([]);

  // Date range filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      const [ovRes, catRes, locRes, techRes, trendRes] = await Promise.all([
        reportsApi.getOverview(params),
        reportsApi.getCategories(params),
        reportsApi.getLocations(params),
        reportsApi.getTechnicians(),
        reportsApi.getTrends(),
      ]);

      setOverview(ovRes);
      setCategoryData(catRes.categories || []);
      setLocationData(locRes.buildings || []);
      setTechnicianData(techRes.technicians || []);
      setTrendData(trendRes.trends || []);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate]);

  const handleResetDates = () => {
    setStartDate('');
    setEndDate('');
  };

  // Prepare Pie Chart data from overview
  const statusPieData = overview
    ? [
        { name: 'Reported', value: overview.reportedIssues || 0 },
        { name: 'Assigned', value: overview.assignedIssues || 0 },
        { name: 'In Progress', value: overview.inProgressIssues || 0 },
        { name: 'Resolved', value: overview.resolvedIssues || 0 },
        { name: 'Reopened', value: overview.reopenedIssues || 0 },
      ].filter((item) => item.value > 0)
    : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">
            Facility Analytics & Maintenance Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time aggregated performance metrics, resolution rates, and technician workloads
          </p>
        </div>

        {/* Date Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-slate-300 text-xs focus:outline-none"
            />
            <span className="text-slate-600">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-slate-300 text-xs focus:outline-none"
            />
          </div>

          {(startDate || endDate) && (
            <button
              onClick={handleResetDates}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Reports"
          value={overview?.totalIssues ?? 0}
          icon={BarChart3}
          color="sky"
        />
        <StatCard
          title="Open Complaints"
          value={overview?.openIssues ?? 0}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Resolved"
          value={overview?.resolvedIssues ?? 0}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Resolution Rate"
          value={`${overview?.resolutionRate ?? 0}%`}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="Avg Resolution Time"
          value={overview?.avgResolutionHours ? `${overview.avgResolutionHours}h` : 'N/A'}
          icon={Clock}
          color="teal"
          subtitle={overview?.avgResolutionDays ? `~${overview.avgResolutionDays} days` : ''}
        />
      </div>

      {loading ? (
        <div className="p-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Aggregating database reports...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* CHART 1: Issues by Category (Bar Chart) */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              Issues by Category Breakdown
            </h3>
            <p className="text-xs text-slate-400">
              Distribution of complaints across campus service classifications
            </p>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={10}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="total" name="Total Issues" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CHART 2: Issues by Status (Pie / Donut Chart) */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              Current Status Distribution
            </h3>
            <p className="text-xs text-slate-400">
              Active lifecycle states of all reported campus tickets
            </p>

            <div className="h-72 w-full flex items-center justify-center">
              {statusPieData.length === 0 ? (
                <p className="text-xs text-slate-500">No issue records found for this period</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={4}
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* CHART 3: Issues over time / Monthly Trends (Line Chart) */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
              Resolution & Reporting Velocity
            </h3>
            <p className="text-xs text-slate-400">
              Comparison of new complaints logged vs. completed repairs over time
            </p>

            <div className="h-72 w-full pt-4">
              {trendData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  Not enough historical data points
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="period" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line
                      type="monotone"
                      dataKey="reported"
                      name="Reported"
                      stroke="#38bdf8"
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="resolved"
                      name="Resolved"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* CHART 4: Technician Workload (Bar Chart) */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              Technician Assignment & Workload
            </h3>
            <p className="text-xs text-slate-400">
              Active vs completed assignments per maintenance specialist
            </p>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={technicianData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={10}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                  <Bar
                    dataKey="activeAssignments"
                    name="Active Tasks"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="completedAssignments"
                    name="Completed"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
