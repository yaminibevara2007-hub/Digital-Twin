import React, { useState } from 'react';
import { TelemetryData, TimeSeriesPoint, WellInfo } from '../types';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { generateTimeSeriesData } from '../services/mockDataService';
import { Clock, Sliders } from 'lucide-react';

interface WellMonitoringPageProps {
  well: WellInfo;
  telemetry: TelemetryData;
}

type TimeframeOption = '1H' | '6H' | '24H' | '7D' | '30D' | 'CYCLE';

type MonitoredParameter =
  | 'oilRate'
  | 'reservoirTemp'
  | 'viscosity'
  | 'pressures'
  | 'srpSPM'
  | 'pumpFillage'
  | 'rodLoads'
  | 'energyKWhBbl';

export const WellMonitoringPage: React.FC<WellMonitoringPageProps> = ({ well, telemetry }) => {
  const [timeframe, setTimeframe] = useState<TimeframeOption>('24H');
  const [selectedParam, setSelectedParam] = useState<MonitoredParameter>('oilRate');

  const seriesData: TimeSeriesPoint[] = generateTimeSeriesData(well.id, timeframe);

  const parameterConfig: Record<
    MonitoredParameter,
    { title: string; unit: string; description: string; lines: { key: string; name: string; color: string; dashed?: boolean }[] }
  > = {
    oilRate: {
      title: 'Surface Oil Production Rate',
      unit: 'bbl/day',
      description: 'Metered surface oil production rate vs thermal decline prediction model',
      lines: [
        { key: 'oilRate', name: 'Actual Oil Rate', color: '#3B82A0' },
        { key: 'predictedOilRate', name: 'Predicted Model Rate', color: '#94A3B8', dashed: true },
      ],
    },
    reservoirTemp: {
      title: 'Near-Wellbore Reservoir Temperature',
      unit: '°C',
      description: 'Conducted heat dissipation in Jodhpur Sandstone completion interval',
      lines: [
        { key: 'reservoirTemp', name: 'Reservoir Temp T_near', color: '#D9824B' },
      ],
    },
    viscosity: {
      title: 'In-Situ Oil Viscosity',
      unit: 'cP',
      description: 'Calculated dead crude dynamic viscosity from thermal response',
      lines: [
        { key: 'viscosity', name: 'Estimated Viscosity', color: '#B7791F' },
      ],
    },
    pressures: {
      title: 'Wellhead, Tubing & Casing Annulus Pressures',
      unit: 'psi',
      description: 'SCADA transducer pressure readings across well completion',
      lines: [
        { key: 'wellheadPressure', name: 'Wellhead Pressure (WHP)', color: '#3B82A0' },
        { key: 'tubingPressure', name: 'Tubing Pressure (TP)', color: '#3D8B68' },
        { key: 'casingPressure', name: 'Casing Annulus Pressure (CP)', color: '#D9824B' },
      ],
    },
    srpSPM: {
      title: 'SRP Operating Speed',
      unit: 'strokes/min',
      description: 'Variable Frequency Drive (VFD) governed beam pump speed',
      lines: [
        { key: 'srpSPM', name: 'Pumping Speed (SPM)', color: '#3D8B68' },
      ],
    },
    pumpFillage: {
      title: 'Downhole Pump Fillage',
      unit: '%',
      description: 'Standing valve fluid entry efficiency per stroke cycle',
      lines: [
        { key: 'pumpFillage', name: 'Pump Fillage %', color: '#3B82A0' },
      ],
    },
    rodLoads: {
      title: 'Polished Rod Mechanical Loads',
      unit: 'lbs',
      description: 'Peak tension load on upstroke vs minimum load on downstroke',
      lines: [
        { key: 'rodLoadPeak', name: 'Peak Polished Rod Load (PPRL)', color: '#C94A4A' },
        { key: 'rodLoadMin', name: 'Min Rod Load (MPRL)', color: '#3B82A0' },
      ],
    },
    energyKWhBbl: {
      title: 'Specific Energy Consumption',
      unit: 'kWh/bbl',
      description: 'Motor electrical consumption normalized to net produced oil',
      lines: [
        { key: 'energyKWhBbl', name: 'Energy Consumption', color: '#B7791F' },
      ],
    },
  };

  const currentCfg = parameterConfig[selectedParam];

  return (
    <div className="space-y-6">
      {/* Parameter Selection Ribbon */}
      <div className="bg-white border border-app-border rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sliders className="w-4 h-4 text-app-blue" />
          <span className="text-xs font-semibold text-app-text uppercase tracking-wide">
            Parameter:
          </span>
          <select
            value={selectedParam}
            onChange={(e) => setSelectedParam(e.target.value as MonitoredParameter)}
            className="bg-app-bg border border-app-border text-app-text text-xs font-medium rounded-md px-3 py-1.5 focus:outline-none focus:border-app-navy cursor-pointer"
          >
            <option value="oilRate">Surface Oil Production Rate (bbl/d)</option>
            <option value="reservoirTemp">Near-Wellbore Temperature (°C)</option>
            <option value="viscosity">Estimated In-Situ Viscosity (cP)</option>
            <option value="pressures">Wellhead, Tubing & Casing Pressures (psi)</option>
            <option value="srpSPM">SRP Pumping Speed (SPM)</option>
            <option value="pumpFillage">Downhole Pump Fillage (%)</option>
            <option value="rodLoads">Polished Rod Tension & Drag Loads (lbs)</option>
            <option value="energyKWhBbl">Specific Lifting Energy (kWh/bbl)</option>
          </select>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-1 bg-app-bg p-1 rounded-md border border-app-border text-xs">
          <Clock className="w-3.5 h-3.5 text-app-muted ml-1.5 mr-1" />
          {(['1H', '6H', '24H', '7D', '30D', 'CYCLE'] as TimeframeOption[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 rounded transition-colors font-medium ${
                timeframe === tf
                  ? 'bg-white text-app-navy font-semibold shadow-sm border border-app-border'
                  : 'text-app-muted hover:text-app-text'
              }`}
            >
              {tf === 'CYCLE' ? 'Cycle View' : tf}
            </button>
          ))}
        </div>
      </div>

      {/* Main Engineering Trend Chart */}
      <div className="bg-white border border-app-border rounded-lg p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-app-border pb-3">
          <div>
            <span className="text-sm font-semibold text-app-text tracking-tight">
              {currentCfg.title}
            </span>
            <div className="text-xs text-app-muted">
              {currentCfg.description} | Unit: {currentCfg.unit}
            </div>
          </div>

          <div className="text-xs text-app-muted">
            Current: <span className="text-app-text font-semibold">{telemetry[selectedParam === 'oilRate' ? 'oilRateBOPD' : selectedParam === 'reservoirTemp' ? 'reservoirTempC' : selectedParam === 'viscosity' ? 'estimatedViscosityCP' : selectedParam === 'srpSPM' ? 'srpSPM' : selectedParam === 'pumpFillage' ? 'pumpFillagePct' : selectedParam === 'energyKWhBbl' ? 'energyConsumptionKWhBbl' : 'wellheadPressurePsi']} {currentCfg.unit}</span>
          </div>
        </div>

        {/* Chart View - Pure White Canvas */}
        <div className="w-full h-80 bg-white rounded p-1 border border-app-border">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={seriesData} margin={{ top: 15, right: 25, left: 10, bottom: 20 }}>
              <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" />
              <XAxis
                dataKey="timeLabel"
                stroke="#94A3B8"
                tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'sans-serif' }}
                label={{
                  value: `Timestamp (${timeframe} Horizon)`,
                  position: 'insideBottom',
                  offset: -12,
                  fill: '#64748B',
                  fontSize: 11,
                  fontFamily: 'sans-serif',
                }}
              />
              <YAxis
                unit={` ${currentCfg.unit}`}
                stroke="#94A3B8"
                tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'sans-serif' }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white border border-app-border p-2.5 text-xs rounded-lg shadow-md text-app-text">
                        <div className="text-app-muted border-b border-app-border pb-1 mb-1 font-medium">
                          Time: {label}
                        </div>
                        {payload.map((entry, idx) => (
                          <div key={idx} className="flex justify-between gap-3 font-medium" style={{ color: entry.color }}>
                            <span>{entry.name}:</span>
                            <span>{entry.value} {currentCfg.unit}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                wrapperStyle={{ fontSize: '11px', fontFamily: 'sans-serif', paddingBottom: '8px' }}
              />
              {currentCfg.lines.map((line, idx) => (
                <Line
                  key={idx}
                  type="monotone"
                  dataKey={line.key}
                  name={line.name}
                  stroke={line.color}
                  strokeWidth={2}
                  strokeDasharray={line.dashed ? '4 4' : undefined}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Synchronized Multi-Parameter Mini Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-app-border rounded-lg p-4">
          <div className="text-[11px] text-app-muted uppercase font-medium">Production & Cut</div>
          <div className="text-base font-semibold text-app-text mt-1">
            {telemetry.oilRateBOPD} bbl/d <span className="text-xs text-app-muted font-normal">({telemetry.waterCutPct}% WC)</span>
          </div>
          <div className="text-[11px] text-app-muted mt-1">GGS manifold line online</div>
        </div>

        <div className="bg-white border border-app-border rounded-lg p-4">
          <div className="text-[11px] text-app-muted uppercase font-medium">Thermal State</div>
          <div className="text-base font-semibold text-app-steam mt-1">
            {telemetry.reservoirTempC} °C <span className="text-xs text-app-muted font-normal">({telemetry.estimatedViscosityCP} cP)</span>
          </div>
          <div className="text-[11px] text-app-muted mt-1">Mobility: {telemetry.fluidMobilityMD_CP} mD/cP</div>
        </div>

        <div className="bg-white border border-app-border rounded-lg p-4">
          <div className="text-[11px] text-app-muted uppercase font-medium">Downhole Plunger</div>
          <div className="text-base font-semibold text-app-green mt-1">
            {telemetry.pumpFillagePct}% Fillage <span className="text-xs text-app-muted font-normal">({telemetry.srpSPM} SPM)</span>
          </div>
          <div className="text-[11px] text-app-muted mt-1">Volumetric Eff: {telemetry.pumpEfficiencyPct}%</div>
        </div>

        <div className="bg-white border border-app-border rounded-lg p-4">
          <div className="text-[11px] text-app-muted uppercase font-medium">Mechanical Rod Stress</div>
          <div className="text-base font-semibold text-app-text mt-1">
            {telemetry.peakPolishedRodLoadLbs} lbs <span className="text-xs text-app-muted font-normal">(Margin: {telemetry.rodFloatMarginLbs} lb)</span>
          </div>
          <div className="text-[11px] text-app-muted mt-1">API Grade D Rod String</div>
        </div>
      </div>
    </div>
  );
};
