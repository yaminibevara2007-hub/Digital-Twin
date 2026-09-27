import React from 'react';
import { AlertSeverity } from '../types';

interface StatusBadgeProps {
  status: AlertSeverity | 'ACTIVE' | 'COMPLETED' | 'PLANNED' | 'ONLINE' | 'OFFLINE';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const isSm = size === 'sm';

  const getStyle = () => {
    switch (status) {
      case 'CRITICAL':
        return 'bg-red-950/80 border-red-600 text-red-300';
      case 'WARNING':
        return 'bg-amber-950/80 border-amber-600 text-amber-300';
      case 'WATCH':
        return 'bg-sky-950/80 border-sky-500 text-sky-300';
      case 'NORMAL':
      case 'ONLINE':
      case 'ACTIVE':
        return 'bg-emerald-950/80 border-emerald-600 text-emerald-300';
      case 'COMPLETED':
        return 'bg-slate-800 border-slate-600 text-slate-300';
      case 'PLANNED':
      case 'OFFLINE':
      default:
        return 'bg-slate-800 border-slate-700 text-slate-400';
    }
  };

  const getDotColor = () => {
    switch (status) {
      case 'CRITICAL':
        return 'bg-red-500';
      case 'WARNING':
        return 'bg-amber-400';
      case 'WATCH':
        return 'bg-sky-400';
      case 'NORMAL':
      case 'ONLINE':
      case 'ACTIVE':
        return 'bg-emerald-400';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-wider font-semibold border ${
        isSm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
      } rounded ${getStyle()}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getDotColor()}`} />
      {status}
    </span>
  );
};
