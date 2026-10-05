import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  FileCheck2,
  Wrench,
  Users,
  FolderTree,
  Building2,
  BarChart3,
  Settings,
  ShieldAlert,
} from 'lucide-react';

export function Sidebar({ isOpen, onClose }) {
  const { user, isAdmin, isReporter, isTechnician } = useAuth();

  const getNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
      isActive
        ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
    }`;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 border-r border-slate-800 bg-slate-900/95 backdrop-blur-md transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col justify-between p-4 overflow-y-auto">
          <div className="space-y-6">
            {/* Core Section */}
            <div>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Main Menu
              </p>
              <nav className="space-y-1">
                <NavLink to="/dashboard" onClick={onClose} className={getNavLinkClass}>
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </NavLink>

                <NavLink to="/issues" onClick={onClose} className={getNavLinkClass}>
                  <ClipboardList className="w-4 h-4" />
                  All Issues
                </NavLink>
              </nav>
            </div>

            {/* Reporter Quick Actions */}
            {isReporter && (
              <div>
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Reporter Actions
                </p>
                <nav className="space-y-1">
                  <NavLink to="/issues/new" onClick={onClose} className={getNavLinkClass}>
                    <PlusCircle className="w-4 h-4 text-emerald-400" />
                    Report New Issue
                  </NavLink>
                  <NavLink to="/my-issues" onClick={onClose} className={getNavLinkClass}>
                    <FileCheck2 className="w-4 h-4" />
                    My Reported Issues
                  </NavLink>
                </nav>
              </div>
            )}

            {/* Technician Workspace */}
            {(isTechnician || isAdmin) && (
              <div>
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Technician Hub
                </p>
                <nav className="space-y-1">
                  <NavLink to="/technician/issues" onClick={onClose} className={getNavLinkClass}>
                    <Wrench className="w-4 h-4 text-amber-400" />
                    Assigned Issues
                  </NavLink>
                </nav>
              </div>
            )}

            {/* Admin Management */}
            {isAdmin && (
              <div>
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-3 h-3 text-purple-400" />
                  Administration
                </p>
                <nav className="space-y-1">
                  <NavLink to="/admin/reports" onClick={onClose} className={getNavLinkClass}>
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                    Analytics & Reports
                  </NavLink>
                  <NavLink to="/admin/users" onClick={onClose} className={getNavLinkClass}>
                    <Users className="w-4 h-4" />
                    User Directory
                  </NavLink>
                  <NavLink to="/admin/categories" onClick={onClose} className={getNavLinkClass}>
                    <FolderTree className="w-4 h-4" />
                    Category Management
                  </NavLink>
                  <NavLink to="/admin/locations" onClick={onClose} className={getNavLinkClass}>
                    <Building2 className="w-4 h-4" />
                    Campus Locations
                  </NavLink>
                </nav>
              </div>
            )}
          </div>

          {/* Footer Settings Link */}
          <div className="pt-4 border-t border-slate-800">
            <NavLink to="/settings" onClick={onClose} className={getNavLinkClass}>
              <Settings className="w-4 h-4" />
              Account Settings
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
}
