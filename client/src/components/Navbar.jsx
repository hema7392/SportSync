import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Badge from './Badge';
import {
  Trophy,
  Calendar,
  PlusCircle,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Compass,
  CheckSquare,
  FolderPlus,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const playerNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Compass },
    { label: 'Available Matches', path: '/sessions', icon: Calendar },
    { label: 'Create Match', path: '/create-session', icon: PlusCircle },
    { label: 'My Created', path: '/sessions/created', icon: FolderPlus },
    { label: 'My Joined', path: '/sessions/joined', icon: CheckSquare },
  ];

  const adminNavItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: Compass },
    { label: 'Sports', path: '/admin/sports', icon: Trophy },
    { label: 'Available Matches', path: '/sessions', icon: Calendar },
    { label: 'Create Match', path: '/create-session', icon: PlusCircle },
    { label: 'My Created', path: '/sessions/created', icon: FolderPlus },
    { label: 'My Joined', path: '/sessions/joined', icon: CheckSquare },
    { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
  ];

  const navItems = isAdmin ? adminNavItems : playerNavItems;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? (isAdmin ? '/admin/dashboard' : '/dashboard') : '/'} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white block leading-none">
                Sport<span className="text-emerald-400">Sync</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                Plan. Play. Connect.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      active
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* User / Auth Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/settings"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs text-emerald-400">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-semibold text-slate-200 block leading-tight">
                      {user?.name || 'User'}
                    </span>
                    <Badge size="sm">{user?.role}</Badge>
                  </div>
                </Link>

                <Link
                  to="/settings"
                  title="Settings"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-4 space-y-2">
          {isAuthenticated ? (
            <>
              <div className="flex items-center justify-between py-2 border-b border-slate-800 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-sm text-emerald-400">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white block">{user?.name}</span>
                    <span className="text-xs text-slate-400">{user?.email}</span>
                  </div>
                </div>
                <Badge size="sm">{user?.role}</Badge>
              </div>

              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                      active
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}

              <Link
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800"
              >
                <Settings className="w-4 h-4" />
                Account Settings
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2.5 rounded-xl text-sm font-semibold text-slate-300 bg-slate-800"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600"
              >
                Create Free Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
