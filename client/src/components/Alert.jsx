import React from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react';

export default function Alert({ type = 'info', message, onClose, className = '' }) {
  if (!message) return null;

  const config = {
    info: {
      bg: 'bg-sky-500/10 border-sky-500/20 text-sky-300',
      icon: <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />,
    },
    success: {
      bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
    },
    warning: {
      bg: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
      icon: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />,
    },
    error: {
      bg: 'bg-rose-500/10 border-rose-500/20 text-rose-300',
      icon: <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />,
    },
  };

  const { bg, icon } = config[type] || config.info;

  return (
    <div
      role="alert"
      className={`flex items-start justify-between gap-3 p-4 rounded-xl border text-sm backdrop-blur-sm transition-all ${bg} ${className}`}
    >
      <div className="flex items-start gap-3">
        {icon}
        <div className="leading-relaxed font-medium">{message}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 transition-colors p-1 -mr-1 -mt-1 rounded-lg"
          aria-label="Close alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
