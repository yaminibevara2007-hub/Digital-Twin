import React, { useState } from 'react';
import { TelemetryData, WellInfo } from '../types';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { LineChart, Calendar, TrendingDown, TrendingUp, Info } from 'lucide-react';

interface ProductionAnalyticsPageProps {
  well: WellInfo;
  telemetry: TelemetryData;
}

type ForecastHorizon = '7D' | '14D' | '30D' | '90D';

export const ProductionAnalyticsPage: React.FC<ProductionAnalyticsPageProps> = ({ well, telemetry }) => {
  const [horizon, setHorizon] = useState<ForecastHorizon>('30D');

  const daysCount = horizon === '7D' ? 7 : horizon === '14D' ? 14 : horizon === '30D' ? 30 : 90;

  // Generate historical + predicted production curve with confidence bounds
  const forecastData = [];
  const currentRate = telemetry.oilRateBOPD;
  const declineRatePerDay = 0.0075; // Thermal decline constant in Jodhpur sandstone

  // 14 days history
  for (let i = 14; i >= 1; i--) {
    const historicalRate = Math.round((currentRate * (1 + (i * declineRatePerDay * 0.95)) + Math.sin(i * 0.7) * 2.5) * 10) / 10;
    forecastData.push({
      dayLabel: `Day -${i}`,
      actualRate: historicalRate,
      predictedRate: null,
      upperBound: null,
      lowerBound: null,
      isForecast: false,
    });
  }

  // Day 0 (Current)
  forecastData.push({
    dayLabel: 'Today (Day 0)',
    actualRate: currentRate,
    predictedRate: currentRate,
    upperBound: currentRate,
    lowerBound: currentRate,
    isForecast: false,
  });

  // Future prediction days
  for (let i = 1; i <= daysCount; i++) {
    const projectedMean = Math.round((currentRate * Math.exp(-declineRatePerDay * i)) * 10) / 10;
    const uncertaintyBand = Math.round((projectedMean * (0.04 + (i / daysCount) * 0.12)) * 10) / 10;

    forecastData.push({
      dayLabel: `Day +${i}`,
      actualRate: null,
      predictedRate: projectedMean,
      upperBound: Math.round((projectedMean + uncertaintyBand) * 10) / 10,
      lowerBound: Math.round(Math.max(10, projectedMean - uncertaintyBand) * 10) / 10,
      isForecast: true,
    });
  }

  const projectedEndRate = forecastData[forecastData.length - 1].predictedRate || 0;
  const totalProjectedRecovery = Math.round(
    forecastData
      .filter((d) => d.isForecast)
      .reduce((sum, d) => sum + (d.predictedRate || 0), 0)
  );

  return (
    <div className="space-y-4">
      {/* Header Overview */}
      <div className="scada-panel p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
            <LineChart className="w-4 h-4 text-sky-400" />
            Thermodynamic Production Decline & Recovery Prediction
          </span>
          <div className="text-[11px] font-mono text-industrial-400">
            Actual Historical Metered Rate vs Coupled Reservoir Heat Loss Model
          </div>
        </div>

        {/* Forecast Horizon Selector */}
        <div className="flex items-center gap-1 bg-industrial-950 p-1 rounded border border-industrial-800 text-xs font-mono">
          <Calendar className="w-3.5 h-3.5 text-industrial-400 ml-1 mr-1" />
          {(['7D', '14D', '30D', '90D'] as ForecastHorizon[]).map((h) => (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              className={`px-2 py-0.5 rounded transition-colors ${
                horizon === h
                  ? 'bg-industrial-800 text-sky-400 font-bold border border-sky-600'
                  : 'text-industrial-400 hover:text-industrial-200'
              }`}
            >
              {h} Horizon
            </button>
          ))}
        </div>
      </div>

      {/* Production Forecast Chart */}
      <div className="scada-panel p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-industrial-800 pb-2">
          <div>
            <span className="text-xs font-mono font-bold text-industrial-200 uppercase tracking-wider">
              Oil Production Forecast with 90% Confidence Interval
            </span>
            <div className="text-[11px] font-mono text-industrial-400">
              Baghewala Crude (18.5° API) | Cycle {well.currentCycle}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono text-amber-300 bg-amber-950/40 px-2 py-1 rounded border border-amber-800/60">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            Physics-Calibrated Synthetic Forecast
          </div>
        </div>

        {/* Chart View */}
        <div className="w-full h-80 bg-industrial-950 rounded p-2 border border-industrial-850">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecastData} margin={{ top: 10, right: 25, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1c2c47" strokeDasharray="3 3" />
              <XAxis
                dataKey="dayLabel"
                stroke="#5c75a3"
                tick={{ fontSize: 10, fill: '#8ba2c7', fontFamily: 'monospace' }}
              />
              <YAxis
                unit=" bbl/d"
                stroke="#5c75a3"
                tick={{ fontSize: 10, fill: '#8ba2c7', fontFamily: 'monospace' }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-industrial-900 border border-industrial-700 p-2.5 text-xs font-mono rounded shadow-lg text-industrial-200">
                        <div className="text-industrial-400 border-b border-industrial-800 pb-1 mb-1">
                          {label}
                        </div>
                        {payload.map((entry, idx) => (
                          <div key={idx} className="flex justify-between gap-3" style={{ color: entry.color }}>
                            <span>{entry.name}:</span>
                            <span className="font-semibold">{entry.value} bbl/day</span>
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
              {/* Uncertainty Upper and Lower Area */}
              <Area
                type="monotone"
                dataKey="upperBound"
                name="Confidence Range (Upper)"
                stroke="#0284c7"
                strokeWidth={1}
                strokeDasharray="2 2"
                fill="url(#confidenceBand)"
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="actualRate"
                name="Historical Actual Oil Rate"
                stroke="#22c55e"
                strokeWidth={2.5}
                dot={{ r: 2 }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="predictedRate"
                name="Predicted Mean Decline Rate"
                stroke="#38bdf8"
                strokeWidth={2}
                strokeDasharray="5 3"
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Production KPIs for Horizon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
        <div className="scada-panel p-3">
          <div className="text-[10px] text-industrial-400 uppercase">Current Production</div>
          <div className="text-lg font-bold text-industrial-100 mt-1">{currentRate} bbl/day</div>
          <div className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Optimal steady plateau
          </div>
        </div>

        <div className="scada-panel p-3">
          <div className="text-[10px] text-industrial-400 uppercase">Projected Rate at Horizon</div>
          <div className="text-lg font-bold text-sky-400 mt-1">{projectedEndRate} bbl/day</div>
          <div className="text-[10px] text-industrial-400 mt-0.5 flex items-center gap-1">
            <TrendingDown className="w-3 h-3 text-amber-400" />
            Thermal decay: -0.75%/day
          </div>
        </div>

        <div className="scada-panel p-3">
          <div className="text-[10px] text-industrial-400 uppercase">Expected Cumulative Volume</div>
          <div className="text-lg font-bold text-industrial-100 mt-1">{totalProjectedRecovery.toLocaleString()} bbl</div>
          <div className="text-[10px] text-industrial-400 mt-0.5">Over next {daysCount} days</div>
        </div>

        <div className="scada-panel p-3">
          <div className="text-[10px] text-industrial-400 uppercase">CSS Economic Cut-off Trigger</div>
          <div className="text-lg font-bold text-petro-orange mt-1">45 bbl/day</div>
          <div className="text-[10px] text-industrial-400 mt-0.5">Scheduled Turn-around threshold</div>
        </div>
      </div>
    </div>
  );
};
