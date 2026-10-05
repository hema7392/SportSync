import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { issuesApi } from '../api/issues';
import {
  Wrench,
  ShieldCheck,
  Zap,
  Droplets,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Users,
  Building,
} from 'lucide-react';

export function LandingPage() {
  const { isAuthenticated, user, login } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 16,
    resolved: 10,
    open: 6,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await issuesApi.getIssues();
        if (res?.issues) {
          const total = res.issues.length;
          const resolved = res.issues.filter((i) => ['RESOLVED', 'CLOSED'].includes(i.status)).length;
          setStats({ total, resolved, open: total - resolved });
        }
      } catch (err) {
        // Fallback to initial realistic stats
      }
    }
    fetchStats();
  }, []);

  const handleQuickLogin = async (email, password) => {
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 px-4 sm:px-6 border-b border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))]" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Centralized Campus Facility & Maintenance Operations
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white font-display">
            Campus<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-teal-400">Fix</span>
          </h1>

          <p className="text-xl sm:text-2xl font-medium text-slate-300">
            "Report. Resolve. Improve."
          </p>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Eliminate informal complaints and delayed repairs. CampusFix provides an end-to-end,
            audited workflow connecting students, faculty, administrators, and maintenance staff
            for rapid infrastructure resolution.
          </p>

          {/* Call to action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-6 py-3 rounded-xl font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30 flex items-center gap-2 transition"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="px-6 py-3 rounded-xl font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30 flex items-center gap-2 transition"
                >
                  Report a Campus Problem
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-3 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition"
                >
                  Sign In to Portal
                </Link>
              </>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto pt-8">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <p className="text-2xl sm:text-3xl font-extrabold text-white">{stats.total}</p>
              <p className="text-xs text-slate-400 mt-1">Total Reported</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{stats.resolved}</p>
              <p className="text-xs text-slate-400 mt-1">Successfully Resolved</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-400">{stats.open}</p>
              <p className="text-xs text-slate-400 mt-1">Active / In Progress</p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Demonstration Showcase Section */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
            Built for the Entire Campus Community
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Click any role below to instantly demo the platform with pre-configured accounts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Admin Card */}
          <div className="rounded-2xl border border-purple-500/20 bg-slate-900/60 p-6 flex flex-col justify-between hover:border-purple-500/40 transition">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Facility Administrators</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Assign issues to active technicians, manage campus categories, view workload analytics,
                monitor SLA metrics, and maintain campus buildings and rooms.
              </p>
              <ul className="text-xs text-slate-300 space-y-1.5 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  Technician dispatch & SLA tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  Interactive Recharts analytics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  Building & user administration
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleQuickLogin('admin@campusfix.edu', 'Admin@CampusFix2026')}
              className="mt-6 w-full py-2.5 rounded-xl font-bold text-xs bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 transition flex items-center justify-center gap-1.5"
            >
              Demo as Facility Admin
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Reporter Card */}
          <div className="rounded-2xl border border-sky-500/20 bg-slate-900/60 p-6 flex flex-col justify-between hover:border-sky-500/40 transition">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Students & Faculty</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Report broken equipment with cascading room selection, priority ratings, live progress
                tracking, notifications, and reopen requests if repairs are incomplete.
              </p>
              <ul className="text-xs text-slate-300 space-y-1.5 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  Fast photo & detail reporting
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  Live chronological timeline
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  In-app status notifications
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleQuickLogin('rahul.sharma@campusfix.edu', 'Password123!')}
              className="mt-6 w-full py-2.5 rounded-xl font-bold text-xs bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/30 transition flex items-center justify-center gap-1.5"
            >
              Demo as Student Reporter
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Technician Card */}
          <div className="rounded-2xl border border-teal-500/20 bg-slate-900/60 p-6 flex flex-col justify-between hover:border-teal-500/40 transition">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Maintenance Staff</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Focused task queue of assigned jobs, accept assignment, start work timestamps, add
                internal notes, and submit detailed resolution summaries.
              </p>
              <ul className="text-xs text-slate-300 space-y-1.5 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  Scoped assigned issues queue
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  Work notes & progress logging
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  Mandatory resolution notes
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleQuickLogin('vikram.electrician@campusfix.edu', 'Password123!')}
              className="mt-6 w-full py-2.5 rounded-xl font-bold text-xs bg-teal-600/20 hover:bg-teal-600 text-teal-300 hover:text-white border border-teal-500/30 transition flex items-center justify-center gap-1.5"
            >
              Demo as Maintenance Tech
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-16 px-4 sm:px-6 bg-slate-900/40 border-t border-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
              Enterprise Facility Management Features
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Engineered with strict backend validation, state machines, and relational integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <Zap className="w-6 h-6 text-sky-400 mb-3" />
              <h4 className="font-bold text-white text-sm">State Machine Lifecycle</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Prevents arbitrary status jumps. Strictly validates REPORTED → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <Droplets className="w-6 h-6 text-teal-400 mb-3" />
              <h4 className="font-bold text-white text-sm">Cascading Location Data</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Relational schema connecting Buildings to specific Floors and Rooms, preventing ambiguous reports.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <Clock className="w-6 h-6 text-amber-400 mb-3" />
              <h4 className="font-bold text-white text-sm">Complete Audit History</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Every state transition, assignment, work note, and resolution timestamp is permanently logged in IssueHistory.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <Building className="w-6 h-6 text-purple-400 mb-3" />
              <h4 className="font-bold text-white text-sm">Real-Time Reports</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Live Recharts analytics showing resolution speed, technician workload, and category distribution.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
