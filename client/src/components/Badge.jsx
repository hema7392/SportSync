import React from 'react';

export function StatusBadge({ status, size = 'md' }) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  const config = {
    REPORTED: {
      bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      dot: 'bg-blue-400',
      label: 'Reported',
    },
    ASSIGNED: {
      bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      dot: 'bg-purple-400',
      label: 'Assigned',
    },
    IN_PROGRESS: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      dot: 'bg-amber-400 animate-pulse',
      label: 'In Progress',
    },
    RESOLVED: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      dot: 'bg-emerald-400',
      label: 'Resolved',
    },
    CLOSED: {
      bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      dot: 'bg-slate-400',
      label: 'Closed',
    },
    REOPENED: {
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      dot: 'bg-rose-400 animate-ping',
      label: 'Reopened',
    },
    CANCELLED: {
      bg: 'bg-gray-500/10 text-gray-400 border-gray-600/30',
      dot: 'bg-gray-400',
      label: 'Cancelled',
    },
  }[status] || {
    bg: 'bg-slate-800 text-slate-300 border-slate-700',
    dot: 'bg-slate-400',
    label: status || 'Unknown',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

export function PriorityBadge({ priority, size = 'md' }) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  const config = {
    LOW: {
      bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      label: 'Low',
    },
    MEDIUM: {
      bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      label: 'Medium',
    },
    HIGH: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      label: 'High Priority',
    },
    CRITICAL: {
      bg: 'bg-rose-500/15 text-rose-400 border-rose-500/40 font-bold',
      label: 'Critical',
    },
  }[priority] || {
    bg: 'bg-slate-800 text-slate-300 border-slate-700',
    label: priority || 'Normal',
  };

  return (
    <span className={`inline-flex items-center rounded border ${config.bg} ${sizeClasses}`}>
      {config.label}
    </span>
  );
}

export function RoleBadge({ role }) {
  const config = {
    ADMIN: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    TECHNICIAN: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    REPORTER: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  }[role] || 'bg-slate-800 text-slate-300 border-slate-700';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${config}`}>
      {role}
    </span>
  );
}
