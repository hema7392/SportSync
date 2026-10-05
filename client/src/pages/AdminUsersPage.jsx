import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../api/users';
import { RoleBadge } from '../components/Badge';
import {
  Users,
  Search,
  Shield,
  CheckCircle,
  XCircle,
  Filter,
  UserCheck,
  UserX,
  AlertCircle,
} from 'lucide-react';

export function AdminUsersPage() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await usersApi.getUsers({
        search: searchTerm || undefined,
        role: roleFilter || undefined,
        isActive: statusFilter !== '' ? statusFilter : undefined,
      });
      setUsers(res.users || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch user directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (targetUser) => {
    if (targetUser.id === currentUser.id) {
      alert('Security Protection: You cannot deactivate your own administrative account.');
      return;
    }

    const nextState = !targetUser.isActive;
    const confirmMsg = nextState
      ? `Activate ${targetUser.name}'s account?`
      : `Deactivate ${targetUser.name}'s account? They will no longer be able to log in.`;

    if (!window.confirm(confirmMsg)) return;

    setActionLoading(targetUser.id);
    try {
      await usersApi.updateUserStatus(targetUser.id, { isActive: nextState });
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, isActive: nextState } : u))
      );
    } catch (err) {
      alert(err.message || 'Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">
            User Directory & Access Control
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage student reporters, maintenance technicians, and campus administrators
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or department..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-2 text-xs">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Administrators</option>
            <option value="REPORTER">Reporters</option>
            <option value="TECHNICIAN">Technicians</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="true">Active Accounts</option>
            <option value="false">Deactivated Accounts</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Loading user accounts...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Department / Wing</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Activity</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {users.map((u) => {
                  const isSelf = u.id === currentUser.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          {u.name}
                          {isSelf && (
                            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-normal">
                              (You)
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">{u.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {u.department || 'Not specified'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{u.phone || '—'}</td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {u.role === 'TECHNICIAN' && (
                          <span>{u._count?.assignedIssues || 0} tasks assigned</span>
                        )}
                        {u.role === 'REPORTER' && (
                          <span>{u._count?.reportedIssues || 0} issues reported</span>
                        )}
                        {u.role === 'ADMIN' && <span>Facility Admin</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            Deactivated
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          disabled={isSelf || actionLoading === u.id}
                          onClick={() => handleToggleStatus(u)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                            u.isActive
                              ? 'bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30'
                              : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30'
                          } disabled:opacity-30 disabled:cursor-not-allowed`}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
