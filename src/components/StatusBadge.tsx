import React from 'react';
import { AlertSeverity } from '../types';

interface StatusBadgeProps {
  status: AlertSeverity | 'ACTIVE' | 'COMPLETED' | 'PLANNED' | 'ONLINE' | 'OFFLINE' | 'MONITORING';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const isSm = size === 'sm';

  const getStyle = () => {
    switch (status) {
      case 'CRITICAL':
        return 'bg-app-softRed border-[#F8D7DA] text-app-red';
      case 'WARNING':
        return 'bg-app-softAmber border-[#FEEBAA] text-app-amber';
      case 'WATCH':
        return 'bg-app-softBlue border-[#D4E8F3] text-app-blue';
      case 'NORMAL':
      case 'ONLINE':
      case 'ACTIVE':
      case 'MONITORING':
        return 'bg-app-softGreen border-[#D5EFE1] text-app-green';
      case 'COMPLETED':
      case 'PLANNED':
      case 'OFFLINE':
      default:
        return 'bg-[#F1F5F9] border-[#E2E8F0] text-app-muted';
    }
  };

  const getDotColor = () => {
    switch (status) {
      case 'CRITICAL':
        return 'bg-app-red';
      case 'WARNING':
        return 'bg-app-amber';
      case 'WATCH':
        return 'bg-app-blue';
      case 'NORMAL':
      case 'ONLINE':
      case 'ACTIVE':
      case 'MONITORING':
        return 'bg-app-green';
      default:
        return 'bg-app-muted';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-sans font-medium border rounded ${
        isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs'
      } ${getStyle()}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getDotColor()}`} />
      <span>{status}</span>
    </span>
  );
};
