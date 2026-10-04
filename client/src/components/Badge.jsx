import React from 'react';

export default function Badge({ children, variant = 'default', size = 'md' }) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  };

  const variantClasses = {
    default: 'bg-slate-800 text-slate-300 border border-slate-700',
    primary: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    success: 'bg-green-500/10 text-green-400 border border-green-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    info: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  };

  // Auto-detect status variant if text matches
  let chosenVariant = variant;
  if (typeof children === 'string') {
    const text = children.toUpperCase();
    if (text === 'UPCOMING') chosenVariant = 'primary';
    else if (text === 'COMPLETED') chosenVariant = 'default';
    else if (text === 'CANCELLED') chosenVariant = 'danger';
    else if (text === 'ADMIN') chosenVariant = 'purple';
    else if (text === 'PLAYER') chosenVariant = 'info';
  }

  return (
    <span
      className={`inline-flex items-center rounded-full tracking-wide transition-colors ${sizeClasses[size] || sizeClasses.md} ${
        variantClasses[chosenVariant] || variantClasses.default
      }`}
    >
      {children}
    </span>
  );
}
