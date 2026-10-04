import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Trophy,
  Calendar,
  Users,
  ShieldCheck,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, isAdmin, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickLogin = async (email, password) => {
    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      alert(`Login failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-24 py-12 sm:py-20">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          The Modern Sports Scheduler
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight">
          Plan. Play. <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Connect.</span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-400 leading-relaxed font-normal">
          SportSync is the full-stack sports coordination platform. Organize sports matches, reserve player slots, prevent scheduling conflicts, and empower admins with real-time analytics.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {isAuthenticated ? (
            <Link
              to={isAdmin ? '/admin/dashboard' : '/dashboard'}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base transition-all shadow-lg shadow-emerald-600/30"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/signup"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base transition-all shadow-lg shadow-emerald-600/30 hover:scale-[1.02]"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-base border border-slate-700 transition-colors"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Quick Demo Logins for Evaluator */}
        {!isAuthenticated && (
          <div className="pt-6 border-t border-slate-800/80 max-w-xl mx-auto">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500 block mb-3">
              One-Click Demo Credentials (Click to Login)
            </span>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@sportsync.local', 'Admin@sportsync2026')}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 transition-colors flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                Demo Admin (admin@sportsync.local)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('rahul@sportsync.local', 'Player@123')}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/20 hover:bg-sky-500/20 transition-colors flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4 text-sky-400" />
                Demo Player (rahul@sportsync.local)
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
            Engineered for Players & Administrators
          </h2>
          <p className="text-slate-400 text-sm">
            Everything required to seamlessly organize matches, manage rosters, and analyze engagement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Dynamic Session Creation</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Create matches for any available sport with custom team rosters, venue details, and precise required player slot limits.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Conflict-Free Joining</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Automatic validation blocks past matches, duplicate entries, full sessions, and prevents overlapping match times for players.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Admin Sports & Analytics</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Create and manage sports catalog. Filter played matches by custom date ranges and visualize sport popularity with interactive charts.
            </p>
          </div>
        </div>
      </section>

      {/* Roster & Cancellation Showcase */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-semibold">
                Transparent Cancellation
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Clear Cancellation Reasons for Every Participant
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                When unavoidable circumstances occur, session creators must provide a concrete reason. Joined players are immediately informed with clear visual notices across their dashboards.
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Mandatory cancellation reasoning enforced by server
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Real-time slot counters and confirmed player tags
                </li>
              </ul>
            </div>

            {/* Visual Card Example */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-rose-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-base">Football</span>
                <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  CANCELLED
                </span>
              </div>
              <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 text-xs text-rose-300">
                <span className="font-bold uppercase tracking-wider block text-[10px] text-rose-400 mb-0.5">
                  Cancellation Reason:
                </span>
                "Ground is unavailable due to heavy rain and maintenance."
              </div>
              <div className="text-xs text-slate-400 space-y-1">
                <div>Venue: College Stadium - Turf B</div>
                <div>Scheduled: 15 Oct 2026, 6:00 PM</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
