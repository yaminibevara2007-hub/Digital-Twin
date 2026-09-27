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
    if (trendDirection === 'up') return 'text-petro-green';
    if (trendDirection === 'down') return 'text-petro-orange';
    return 'text-industrial-400';
  };

  return (
    <div
      onClick={onClick}
      className={`scada-panel p-3 flex flex-col justify-between transition-colors ${
        onClick ? 'cursor-pointer hover:border-industrial-600' : ''
      } ${highlight ? 'border-sky-700 bg-industrial-900/90' : ''}`}
    >
      <div className="flex items-start justify-between gap-1 mb-1">
        <span className="text-[11px] font-medium uppercase tracking-wider text-industrial-400 truncate" title={label}>
          {label}
        </span>
        <StatusBadge status={status} size="sm" />
      </div>

      <div className="my-1 flex items-baseline gap-1.5">
        <span className="scada-data-cell text-xl font-semibold tracking-tight text-industrial-100">
          {value}
        </span>
        <span className="text-xs font-mono text-industrial-400">
          {unit}
        </span>
      </div>

      <div className="mt-1 flex items-center justify-between text-[11px] pt-1.5 border-t border-industrial-800">
        <div className="flex items-center gap-1">
          {trend && (
            <span className={`font-mono font-medium ${getTrendColor()}`}>
              {trend}
            </span>
          )}
          {subtext && (
            <span className="text-industrial-400 truncate max-w-[120px]" title={subtext}>
              {subtext}
            </span>
          )}
        </div>
        {timestamp && (
          <span className="font-mono text-[10px] text-industrial-500">
            {timestamp}
          </span>
        )}
      </div>
    </div>
  );
};
