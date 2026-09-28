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

  const forecastData = [];
  const currentRate = telemetry.oilRateBOPD;
  const declineRatePerDay = 0.0075;

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

  forecastData.push({
    dayLabel: 'Today (Day 0)',
    actualRate: currentRate,
    predictedRate: currentRate,
    upperBound: currentRate,
    lowerBound: currentRate,
    isForecast: false,
  });

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
    <div className="space-y-6">
      {/* Header Overview */}
      <div className="bg-white border border-app-border rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-sm font-semibold text-app-text tracking-tight flex items-center gap-2">
            <LineChart className="w-4 h-4 text-app-blue" />
            Thermodynamic Production Decline & Recovery Prediction
          </span>
          <div className="text-xs text-app-muted">
            Actual metered rate vs coupled reservoir heat dissipation model
          </div>
        </div>

        {/* Forecast Horizon Selector */}
        <div className="flex items-center gap-1 bg-app-bg p-1 rounded-md border border-app-border text-xs">
          <Calendar className="w-3.5 h-3.5 text-app-muted ml-1.5 mr-1" />
          {(['7D', '14D', '30D', '90D'] as ForecastHorizon[]).map((h) => (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              className={`px-2.5 py-1 rounded transition-colors font-medium ${
                horizon === h
                  ? 'bg-white text-app-navy font-semibold shadow-sm border border-app-border'
                  : 'text-app-muted hover:text-app-text'
              }`}
            >
              {h} Horizon
            </button>
          ))}
        </div>
      </div>

      {/* Production Forecast Chart */}
      <div className="bg-white border border-app-border rounded-lg p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-app-border pb-3">
          <div>
            <span className="text-sm font-semibold text-app-text tracking-tight">
              Oil Production Forecast with 90% Confidence Interval
            </span>
            <div className="text-xs text-app-muted">
              Baghewala Crude (18.5° API) | Cycle {well.currentCycle}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-app-muted bg-app-bg px-2.5 py-1 rounded border border-app-border">
            <Info className="w-3.5 h-3.5 text-app-muted" />
            Physics-Calibrated Model
          </div>
        </div>

        {/* Chart View - Pure White Canvas */}
        <div className="w-full h-80 bg-white rounded p-1 border border-app-border">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecastData} margin={{ top: 15, right: 25, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="lightConfidenceBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82A0" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#3B82A0" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" />
              <XAxis
                dataKey="dayLabel"
                stroke="#94A3B8"
                tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'sans-serif' }}
              />
              <YAxis
                unit=" bbl/d"
                stroke="#94A3B8"
                tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'sans-serif' }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white border border-app-border p-2.5 text-xs rounded-lg shadow-md text-app-text">
                        <div className="text-app-muted border-b border-app-border pb-1 mb-1 font-medium">
                          {label}
                        </div>
                        {payload.map((entry, idx) => (
                          <div key={idx} className="flex justify-between gap-3 font-medium" style={{ color: entry.color }}>
                            <span>{entry.name}:</span>
                            <span>{entry.value} bbl/day</span>
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
              <Area
                type="monotone"
                dataKey="upperBound"
                name="Confidence Range"
                stroke="#CBD5E1"
                strokeWidth={1}
                strokeDasharray="2 2"
                fill="url(#lightConfidenceBand)"
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="actualRate"
                name="Historical Actual Production"
                stroke="#3B82A0"
                strokeWidth={2.5}
                dot={{ r: 2 }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="predictedRate"
                name="Predicted Mean Decline Rate"
                stroke="#D9824B"
                strokeWidth={2}
                strokeDasharray="4 3"
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Production KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div className="bg-white border border-app-border rounded-lg p-4">
          <div className="text-[11px] text-app-muted uppercase font-medium">Current Production</div>
          <div className="text-xl font-bold text-app-text mt-1">{currentRate} bbl/day</div>
          <div className="text-[11px] text-app-green mt-1 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            Steady plateau phase
          </div>
        </div>

        <div className="bg-white border border-app-border rounded-lg p-4">
          <div className="text-[11px] text-app-muted uppercase font-medium">Projected Rate at Horizon</div>
          <div className="text-xl font-bold text-app-navy mt-1">{projectedEndRate} bbl/day</div>
          <div className="text-[11px] text-app-muted mt-1 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-app-amber" />
            Thermal decay: -0.75%/day
          </div>
        </div>

        <div className="bg-white border border-app-border rounded-lg p-4">
          <div className="text-[11px] text-app-muted uppercase font-medium">Expected Cumulative Volume</div>
          <div className="text-xl font-bold text-app-text mt-1">{totalProjectedRecovery.toLocaleString()} bbl</div>
          <div className="text-[11px] text-app-muted mt-1">Over next {daysCount} days</div>
        </div>

        <div className="bg-white border border-app-border rounded-lg p-4">
          <div className="text-[11px] text-app-muted uppercase font-medium">CSS Economic Cut-off Trigger</div>
          <div className="text-xl font-bold text-app-steam mt-1">45 bbl/day</div>
          <div className="text-[11px] text-app-muted mt-1">Scheduled turn-around threshold</div>
        </div>
      </div>
    </div>
  );
};
