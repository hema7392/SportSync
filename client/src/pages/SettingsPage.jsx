import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from '../components/Badge';
import {
  User,
  KeyRound,
  Shield,
  CheckCircle,
  AlertCircle,
  Lock,
} from 'lucide-react';

export function SettingsPage() {
  const { user, changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess('Your password has been changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-white font-display">
          Account & Security Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your campus profile details and authentication credentials
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <User className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Profile Details
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block mb-0.5">Full Name</span>
            <span className="font-bold text-white text-sm">{user?.name}</span>
          </div>

          <div>
            <span className="text-slate-500 block mb-0.5">Campus Email</span>
            <span className="font-semibold text-slate-200">{user?.email}</span>
          </div>

          <div>
            <span className="text-slate-500 block mb-0.5">Assigned Role</span>
            <div className="mt-1">
              <RoleBadge role={user?.role} />
            </div>
          </div>

          <div>
            <span className="text-slate-500 block mb-0.5">Department / Faculty</span>
            <span className="font-semibold text-slate-200">{user?.department || '—'}</span>
          </div>

          {user?.phone && (
            <div>
              <span className="text-slate-500 block mb-0.5">Phone Contact</span>
              <span className="font-semibold text-slate-200">{user?.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-6 shadow-sm">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <KeyRound className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Change Password
          </h3>
        </div>

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            {success}
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            {error}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                New Password (min 6 characters)
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20 transition disabled:opacity-50"
            >
              {loading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
