import React, { useState, useMemo } from 'react';
import { TelemetryData, WellInfo, NavTab } from '../types';
import { generateTimeSeriesData } from '../services/mockDataService';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { ArrowUpRight } from 'lucide-react';

interface OverviewPageProps {
  well: WellInfo;
  telemetry: TelemetryData;
  onNavigate: (tab: NavTab) => void;
}

type TimeframeOption = '7D' | '30D' | '90D';

export const OverviewPage: React.FC<OverviewPageProps> = ({ well, telemetry, onNavigate }) => {
  const [timeframe, setTimeframe] = useState<TimeframeOption>('30D');

  // Time-series data for the production trend chart
  const chartData = useMemo(() => {
    const serviceTf = timeframe === '90D' ? 'CYCLE' : timeframe;
    return generateTimeSeriesData(well.id, serviceTf);
  }, [well.id, timeframe]);

  // Alert evaluation
  const isCoolingWatch = telemetry.reservoirTempC < 65 || well.id === 'BW-04';
  const isRodFloatWatch = telemetry.rodFloatRiskPct > 60;
  const hasAlert = isCoolingWatch || isRodFloatWatch;

  // Well formatted display name
  const wellCode = well.name.replace('BW-', 'BGW-').split(' ')[0];

  return (
    <div className="space-y-8 select-none">
      {/* 1. PAGE HEADER: Spacious, no big card wrapper */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <div className="text-xs font-semibold text-app-muted uppercase tracking-wider mb-1">
            Baghewala Field
          </div>
          <h1 className="text-2xl font-semibold text-app-text tracking-tight">
            Well Operating Overview
          </h1>
          <p className="text-[13px] text-app-muted mt-1 font-normal">
            Well {wellCode} · {well.currentStage === 'PRODUCTION' ? 'Producer' : well.currentStage} · Production Cycle {well.currentCycle} · Day {well.stageDay} of {well.stageTotalDays}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasAlert ? (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-app-softAmber border border-[#FEEBAA] text-xs font-medium text-app-amber">
              <span className="w-2 h-2 rounded-full bg-app-amber" />
              <span>Attention Recommended</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-app-softGreen border border-[#D5EFE1] text-xs font-medium text-app-green">
              <span className="w-2 h-2 rounded-full bg-app-green" />
              <span>Operating Normally</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. EXACTLY 4 PRIMARY KPI CARDS (Section 6) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Oil Production */}
        <div className="bg-white border border-app-border rounded-lg p-5">
          <div className="text-xs text-app-muted font-normal">
            Oil Production
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-[28px] font-semibold text-app-text tracking-tight font-mono">
              {telemetry.oilRateBOPD.toFixed(1)}
            </span>
            <span className="text-xs text-app-muted font-normal">
              bbl/day
            </span>
          </div>
          <div className="text-xs text-app-green font-medium mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-app-green" />
            <span>Normal</span>
          </div>
        </div>

        {/* KPI 2: Reservoir Temperature */}
        <div className="bg-white border border-app-border rounded-lg p-5">
          <div className="text-xs text-app-muted font-normal">
            Reservoir Temperature
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-[28px] font-semibold text-app-text tracking-tight font-mono">
              {Math.round(telemetry.reservoirTempC)}
            </span>
            <span className="text-xs text-app-muted font-normal">
              °C
            </span>
          </div>
          <div className={`text-xs font-medium mt-2 flex items-center gap-1.5 ${isCoolingWatch ? 'text-app-amber' : 'text-app-green'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isCoolingWatch ? 'bg-app-amber' : 'bg-app-green'}`} />
            <span>{isCoolingWatch ? 'Cooling Watch' : 'Normal'}</span>
          </div>
        </div>

        {/* KPI 3: SRP Speed */}
        <div className="bg-white border border-app-border rounded-lg p-5">
          <div className="text-xs text-app-muted font-normal">
            SRP Speed
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-[28px] font-semibold text-app-text tracking-tight font-mono">
              {telemetry.srpSPM.toFixed(1)}
            </span>
            <span className="text-xs text-app-muted font-normal">
              SPM
            </span>
          </div>
          <div className="text-xs text-app-green font-medium mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-app-green" />
            <span>Normal</span>
          </div>
        </div>

        {/* KPI 4: Specific SOR */}
        <div className="bg-white border border-app-border rounded-lg p-5">
          <div className="text-xs text-app-muted font-normal">
            Specific SOR
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-[28px] font-semibold text-app-text tracking-tight font-mono">
              {telemetry.steamOilRatioSOR.toFixed(2)}
            </span>
            <span className="text-xs text-app-muted font-normal">
              bbl/bbl
            </span>
          </div>
          <div className="text-xs text-app-green font-medium mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-app-green" />
            <span>Normal</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT: TWO MAJOR SECTIONS (LEFT: Chart, RIGHT: Status) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: Production Trend (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-app-border rounded-lg p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-base font-semibold text-app-text tracking-tight">
                Production Trend
              </h2>
              <div className="flex items-center gap-4 text-xs text-app-muted mt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-app-navy rounded" />
                  <span>Actual Production</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-b-2 border-dashed border-app-muted" />
                  <span>Predicted Production</span>
                </span>
              </div>
            </div>

            {/* Timeframe Toggles: 7D, 30D, 90D */}
            <div className="flex items-center rounded-md bg-app-bg p-0.5 border border-app-border text-xs">
              {(['7D', '30D', '90D'] as TimeframeOption[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    timeframe === tf
                      ? 'bg-white text-app-navy font-semibold shadow-xs'
                      : 'text-app-muted hover:text-app-text'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Clean Line Chart */}
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 12, left: -16, bottom: 4 }}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis 
                  dataKey="timeLabel" 
                  stroke="#94A3B8" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={{ stroke: '#E5E7EB' }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="#94A3B8" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                  domain={['auto', 'auto']}
                  unit=" bbl"
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-app-border rounded-md shadow-xs p-2.5 text-xs text-app-text font-sans">
                          <div className="text-[11px] text-app-muted mb-1.5 font-medium">{label}</div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-app-muted flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-app-navy" />
                                Actual:
                              </span>
                              <span className="font-mono font-semibold text-app-text">
                                {payload[0]?.value} bbl/day
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-app-muted flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-slate-400" />
                                Predicted:
                              </span>
                              <span className="font-mono font-medium text-app-muted">
                                {payload[1]?.value} bbl/day
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="oilRate"
                  name="Actual Production"
                  stroke="#183B56"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, stroke: '#183B56', strokeWidth: 2, fill: '#FFFFFF' }}
                />
                <Line
                  type="monotone"
                  dataKey="predictedOilRate"
                  name="Predicted Production"
                  stroke="#64748B"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT PANEL: Well Status (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-app-border rounded-lg p-5">
          <h2 className="text-base font-semibold text-app-text tracking-tight mb-4">
            Well Status
          </h2>

          <div className="space-y-4 text-xs">
            {/* Reservoir */}
            <div className="flex items-center justify-between py-2 border-b border-[#F1F5F9]">
              <span className="text-app-text font-medium">Reservoir</span>
              <span className="flex items-center gap-1.5 text-app-green font-medium">
                <span className="w-2 h-2 rounded-full bg-app-green" />
                <span>Normal</span>
              </span>
            </div>

            {/* CSS Cycle */}
            <div className="flex items-center justify-between py-2 border-b border-[#F1F5F9]">
              <span className="text-app-text font-medium">CSS Cycle</span>
              <span className="flex items-center gap-1.5 text-app-green font-medium">
                <span className="w-2 h-2 rounded-full bg-app-green" />
                <span>Normal</span>
              </span>
            </div>

            {/* SRP */}
            <div className="flex items-center justify-between py-2 border-b border-[#F1F5F9]">
              <span className="text-app-text font-medium">SRP</span>
              <span className="flex items-center gap-1.5 text-app-green font-medium">
                <span className="w-2 h-2 rounded-full bg-app-green" />
                <span>Normal</span>
              </span>
            </div>

            {/* Production */}
            <div className="flex items-center justify-between py-2 border-b border-[#F1F5F9]">
              <span className="text-app-text font-medium">Production</span>
              <span className="flex items-center gap-1.5 text-app-green font-medium">
                <span className="w-2 h-2 rounded-full bg-app-green" />
                <span>Normal</span>
              </span>
            </div>

            {/* Energy */}
            <div className="flex items-center justify-between py-2">
              <span className="text-app-text font-medium">Energy</span>
              <span className="flex items-center gap-1.5 text-app-green font-medium">
                <span className="w-2 h-2 rounded-full bg-app-green" />
                <span>Normal</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CURRENT OPERATING CONDITION (Section 9) */}
      <div className="bg-white border border-app-border rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div>
          <div className="text-[11px] font-semibold text-app-muted uppercase tracking-wider">
            Current Operating Condition
          </div>
          <div className="text-sm font-semibold text-app-text mt-0.5">
            Production Cycle {well.currentCycle} · Day {well.stageDay} / {well.stageTotalDays}
          </div>
          <p className="text-xs text-app-muted mt-1 leading-relaxed max-w-2xl font-normal">
            Reservoir temperature and SRP operation are currently within the configured operating range.
          </p>
        </div>

        {/* Exactly two buttons (Section 9) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('digital_twin')}
            className="px-4 py-2 rounded-md bg-app-navy text-white text-xs font-medium hover:bg-app-navyDark transition-colors flex items-center gap-1.5"
          >
            <span>View Digital Twin</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate('srp_opt')}
            className="px-4 py-2 rounded-md bg-white border border-app-border text-app-text text-xs font-medium hover:bg-app-bg transition-colors flex items-center gap-1.5"
          >
            <span>Review Operating Parameters</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 5. IMPORTANT ALERT SECTION (Section 10) */}
      {hasAlert ? (
        <div className="bg-app-softAmber/40 border border-[#FEEBAA] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold text-app-amber uppercase tracking-wider">
              Attention
            </div>
            <div className="text-xs text-app-text font-medium mt-1">
              Viscosity is increasing as the thermal zone cools. Review the next CSS cycle.
            </div>
          </div>
          <button
            onClick={() => onNavigate('css_opt')}
            className="px-3.5 py-1.5 rounded-md bg-white border border-[#FEEBAA] text-app-amber hover:text-app-text text-xs font-medium hover:bg-white/80 transition-colors shrink-0"
          >
            View Details
          </button>
        </div>
      ) : (
        <div className="bg-white border border-app-border rounded-lg p-5 flex items-center justify-between gap-4">
          <div className="text-xs text-app-muted">
            <span className="font-medium text-app-text">No immediate attention required.</span> All monitored parameters are within the configured operating range.
          </div>
        </div>
      )}
    </div>
  );
};
