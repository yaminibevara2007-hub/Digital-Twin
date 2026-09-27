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
import { Activity, Clock, Sliders } from 'lucide-react';

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
      description: 'Instantaneous metered oil rate vs thermal decline model prediction',
      lines: [
        { key: 'oilRate', name: 'Actual Oil Rate', color: '#38bdf8' },
        { key: 'predictedOilRate', name: 'Predicted Model Rate', color: '#64748b', dashed: true },
      ],
    },
    reservoirTemp: {
      title: 'Near-Wellbore Reservoir Temperature',
      unit: '°C',
      description: 'Conducted heat dissipation in Jodhpur Sandstone completion interval',
      lines: [
        { key: 'reservoirTemp', name: 'Reservoir Temp T_near', color: '#d97736' },
      ],
    },
    viscosity: {
      title: 'In-Situ Oil Viscosity',
      unit: 'cP',
      description: 'Calculated dead crude dynamic viscosity from thermal response',
      lines: [
        { key: 'viscosity', name: 'Estimated Viscosity', color: '#f59e0b' },
      ],
    },
    pressures: {
      title: 'Wellhead, Tubing & Casing Annulus Pressures',
      unit: 'psi',
      description: 'SCADA transducer pressure readings across well completion',
      lines: [
        { key: 'wellheadPressure', name: 'Wellhead Pressure (WHP)', color: '#38bdf8' },
        { key: 'tubingPressure', name: 'Tubing Pressure (TP)', color: '#22c55e' },
        { key: 'casingPressure', name: 'Casing Annulus Pressure (CP)', color: '#ea580c' },
      ],
    },
    srpSPM: {
      title: 'SRP Operating Speed',
      unit: 'strokes/min',
      description: 'Variable Frequency Drive (VFD) governed beam pump speed',
      lines: [
        { key: 'srpSPM', name: 'Pumping Speed (SPM)', color: '#22c55e' },
      ],
    },
    pumpFillage: {
      title: 'Downhole Pump Fillage',
      unit: '%',
      description: 'Standing valve fluid entry efficiency per stroke cycle',
      lines: [
        { key: 'pumpFillage', name: 'Pump Fillage %', color: '#38bdf8' },
      ],
    },
    rodLoads: {
      title: 'Polished Rod Mechanical Loads',
      unit: 'lbs',
      description: 'Peak tension load on upstroke vs minimum load on downstroke',
      lines: [
        { key: 'rodLoadPeak', name: 'Peak Polished Rod Load (PPRL)', color: '#ef4444' },
        { key: 'rodLoadMin', name: 'Min Rod Load (MPRL)', color: '#38bdf8' },
      ],
    },
    energyKWhBbl: {
      title: 'Specific Energy Consumption',
      unit: 'kWh/bbl',
      description: 'Motor electrical consumption normalized to net produced oil',
      lines: [
        { key: 'energyKWhBbl', name: 'Energy Consumption', color: '#f59e0b' },
      ],
    },
  };

  const currentCfg = parameterConfig[selectedParam];

  return (
    <div className="space-y-4">
      {/* Parameter Selection Ribbon */}
      <div className="scada-panel p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-mono font-bold text-industrial-200 uppercase">
            Parameter Inspector:
          </span>
          <select
            value={selectedParam}
            onChange={(e) => setSelectedParam(e.target.value as MonitoredParameter)}
            className="bg-industrial-950 border border-industrial-700 text-industrial-100 text-xs font-mono rounded px-2.5 py-1 focus:outline-none focus:border-sky-500"
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

        {/* Timeframe Selector (1h, 6h, 24h, 7d, 30d, Cycle View) */}
        <div className="flex items-center gap-1 bg-industrial-950 p-1 rounded border border-industrial-800 text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-industrial-400 ml-1 mr-1" />
          {(['1H', '6H', '24H', '7D', '30D', 'CYCLE'] as TimeframeOption[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-0.5 rounded transition-colors ${
                timeframe === tf
                  ? 'bg-industrial-800 text-sky-400 font-bold border border-sky-600'
                  : 'text-industrial-400 hover:text-industrial-200'
              }`}
            >
              {tf === 'CYCLE' ? 'Cycle View' : tf}
            </button>
          ))}
        </div>
      </div>

      {/* Main Engineering Trend Chart */}
      <div className="scada-panel p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-industrial-800 pb-2">
          <div>
            <span className="text-xs font-mono font-bold text-industrial-100 uppercase tracking-wider">
              {currentCfg.title}
            </span>
            <div className="text-[11px] font-mono text-industrial-400">
              {currentCfg.description} | Unit: {currentCfg.unit}
            </div>
          </div>

          <div className="text-xs font-mono text-industrial-400">
            Current: <span className="text-industrial-100 font-semibold">{telemetry[selectedParam === 'oilRate' ? 'oilRateBOPD' : selectedParam === 'reservoirTemp' ? 'reservoirTempC' : selectedParam === 'viscosity' ? 'estimatedViscosityCP' : selectedParam === 'srpSPM' ? 'srpSPM' : selectedParam === 'pumpFillage' ? 'pumpFillagePct' : selectedParam === 'energyKWhBbl' ? 'energyConsumptionKWhBbl' : 'wellheadPressurePsi']} {currentCfg.unit}</span>
          </div>
        </div>

        {/* Chart View */}
        <div className="w-full h-80 bg-industrial-950 rounded p-2 border border-industrial-850">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={seriesData} margin={{ top: 10, right: 25, left: 10, bottom: 20 }}>
              <CartesianGrid stroke="#1c2c47" strokeDasharray="3 3" />
              <XAxis
                dataKey="timeLabel"
                stroke="#5c75a3"
                tick={{ fontSize: 10, fill: '#8ba2c7', fontFamily: 'monospace' }}
                label={{
                  value: `Timestamp (${timeframe} Horizon)`,
                  position: 'insideBottom',
                  offset: -12,
                  fill: '#8ba2c7',
                  fontSize: 10,
                  fontFamily: 'monospace',
                }}
              />
              <YAxis
                unit={` ${currentCfg.unit}`}
                stroke="#5c75a3"
                tick={{ fontSize: 10, fill: '#8ba2c7', fontFamily: 'monospace' }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-industrial-900 border border-industrial-700 p-2.5 text-xs font-mono rounded shadow-lg text-industrial-200">
                        <div className="text-industrial-400 border-b border-industrial-800 pb-1 mb-1">
                          Time: {label}
                        </div>
                        {payload.map((entry, idx) => (
                          <div key={idx} className="flex justify-between gap-3" style={{ color: entry.color }}>
                            <span>{entry.name}:</span>
                            <span className="font-semibold">{entry.value} {currentCfg.unit}</span>
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
                wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingBottom: '6px' }}
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="scada-panel p-3">
          <div className="text-[11px] font-mono text-industrial-400 uppercase">Production & Cut</div>
          <div className="text-sm font-mono text-industrial-100 font-semibold mt-1">
            {telemetry.oilRateBOPD} bbl/d <span className="text-xs text-industrial-400 font-normal">({telemetry.waterCutPct}% WC)</span>
          </div>
          <div className="text-[10px] font-mono text-industrial-500 mt-1">GGS manifold line online</div>
        </div>

        <div className="scada-panel p-3">
          <div className="text-[11px] font-mono text-industrial-400 uppercase">Thermal State</div>
          <div className="text-sm font-mono text-petro-orange font-semibold mt-1">
            {telemetry.reservoirTempC} °C <span className="text-xs text-industrial-400 font-normal">({telemetry.estimatedViscosityCP} cP)</span>
          </div>
          <div className="text-[10px] font-mono text-industrial-500 mt-1">Mobility: {telemetry.fluidMobilityMD_CP} mD/cP</div>
        </div>

        <div className="scada-panel p-3">
          <div className="text-[11px] font-mono text-industrial-400 uppercase">Downhole Plunger</div>
          <div className="text-sm font-mono text-emerald-400 font-semibold mt-1">
            {telemetry.pumpFillagePct}% Fillage <span className="text-xs text-industrial-400 font-normal">({telemetry.srpSPM} SPM)</span>
          </div>
          <div className="text-[10px] font-mono text-industrial-500 mt-1">Volumetric Eff: {telemetry.pumpEfficiencyPct}%</div>
        </div>

        <div className="scada-panel p-3">
          <div className="text-[11px] font-mono text-industrial-400 uppercase">Mechanical Rod Stress</div>
          <div className="text-sm font-mono text-industrial-100 font-semibold mt-1">
            {telemetry.peakPolishedRodLoadLbs} lbs <span className="text-xs text-industrial-400 font-normal">(Margin: {telemetry.rodFloatMarginLbs} lb)</span>
          </div>
          <div className="text-[10px] font-mono text-industrial-500 mt-1">API Grade D Rod String</div>
        </div>
      </div>
    </div>
  );
};
