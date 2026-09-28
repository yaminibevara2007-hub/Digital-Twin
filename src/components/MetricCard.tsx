import React from 'react';
import { StatusBadge } from './StatusBadge';
import { AlertSeverity } from '../types';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  status?: AlertSeverity;
  subtext?: string;
  timestamp?: string;
  highlight?: boolean;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  trend,
  trendDirection = 'neutral',
  status = 'NORMAL',
  subtext,
  timestamp,
  highlight = false,
  onClick,
}) => {
  const getTrendColor = () => {
    if (trendDirection === 'up') return 'text-app-green';
    if (trendDirection === 'down') return 'text-app-steam';
    return 'text-app-muted';
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white border rounded-lg p-4 flex flex-col justify-between transition-all ${
        onClick ? 'cursor-pointer hover:border-app-secondaryNavy' : ''
      } ${highlight ? 'border-app-blue bg-app-softBlue/30' : 'border-app-border'}`}
    >
      <div className="flex items-center justify-between gap-1 mb-2">
        <span className="text-xs font-medium text-app-muted tracking-wide" title={label}>
          {label}
        </span>
        <StatusBadge status={status} size="sm" />
      </div>

      <div className="my-1.5 flex items-baseline gap-1.5">
        <span className="eng-data-cell text-2xl font-semibold tracking-tight text-app-text">
          {value}
        </span>
        <span className="text-xs font-medium text-app-muted">
          {unit}
        </span>
      </div>

      <div className="mt-2 pt-2 border-t border-app-borderLight flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          {trend && (
            <span className={`font-medium ${getTrendColor()}`}>
              {trend}
            </span>
          )}
          {subtext && (
            <span className="text-app-muted truncate max-w-[130px]" title={subtext}>
              {subtext}
            </span>
          )}
        </div>
        {timestamp && (
          <span className="text-[11px] text-[#94A3B8] font-mono">
            {timestamp}
          </span>
        )}
      </div>
    </div>
  );
};
