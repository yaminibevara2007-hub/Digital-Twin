import React from 'react';
import { TelemetryData, WellInfo } from '../types';
import { Zap, Flame, Gauge, Scale } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface EnergyOptimizationPageProps {
  well: WellInfo;
  telemetry: TelemetryData;
}

export const EnergyOptimizationPage: React.FC<EnergyOptimizationPageProps> = ({ well, telemetry }) => {
  const steamTradeoffData = [
    { steamTonnes: 1200, oilProducedBbl: 4200, sor: 2.86, netMarginIndex: 62 },
    { steamTonnes: 1500, oilProducedBbl: 5800, sor: 2.59, netMarginIndex: 78 },
    { steamTonnes: 1800, oilProducedBbl: 7400, sor: 2.43, netMarginIndex: 88 },
    { steamTonnes: 2050, oilProducedBbl: 8900, sor: 2.30, netMarginIndex: 94 },
    { steamTonnes: 2400, oilProducedBbl: 9500, sor: 2.53, netMarginIndex: 84 },
    { steamTonnes: 2800, oilProducedBbl: 9900, sor: 2.83, netMarginIndex: 71 },
  ];

  return (
    <div className="space-y-6">
      {/* Energy Efficiency Overview */}
      <div className="bg-white border border-app-border rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-sm font-semibold text-app-text tracking-tight flex items-center gap-2">
            <Zap className="w-4 h-4 text-app-blue" />
            Thermal Energy & Lifting Power Optimization
          </span>
          <div className="text-xs text-app-muted mt-1 max-w-3xl leading-relaxed">
            Balances the thermodynamic trade-off between higher steam volume injection (yielding deeper heating and reduced viscosity) against the diminishing economic return of higher steam-to-oil ratios (SOR) and parasitic thermal losses to caprock.
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs bg-app-bg px-3 py-2 rounded-md border border-app-border">
          <span className="text-app-muted">Current SOR:</span>
          <span className="text-app-green font-semibold">{telemetry.steamOilRatioSOR} bbl CWE / bbl</span>
        </div>
      </div>

      {/* KPI Cards: Energy & Steam */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div className="bg-white border border-app-border rounded-lg p-5">
          <div className="text-[11px] text-app-muted uppercase font-medium flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-app-steam" />
            Steam Injected (Cycle {well.currentCycle})
          </div>
          <div className="text-xl font-bold text-app-steam mt-2">1,920 tonnes</div>
          <div className="text-[11px] text-app-muted mt-1">80% steam quality @ 1,420 psi</div>
        </div>

        <div className="bg-white border border-app-border rounded-lg p-5">
          <div className="text-[11px] text-app-muted uppercase font-medium flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-app-blue" />
            Specific Lifting Energy
          </div>
          <div className="text-xl font-bold text-app-text mt-2">{telemetry.energyConsumptionKWhBbl} kWh/bbl</div>
          <div className="text-[11px] text-app-muted mt-1">SRP 40 HP VFD motor draw</div>
        </div>

        <div className="bg-white border border-app-border rounded-lg p-5">
          <div className="text-[11px] text-app-muted uppercase font-medium flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-app-navy" />
            Production per Tonne Steam
          </div>
          <div className="text-xl font-bold text-app-navy mt-2">2.70 bbl oil / tonne</div>
          <div className="text-[11px] text-app-green mt-1 font-medium">Above field average (2.2)</div>
        </div>

        <div className="bg-white border border-app-border rounded-lg p-5">
          <div className="text-[11px] text-app-muted uppercase font-medium flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-app-green" />
            Thermal Utilization Efficiency
          </div>
          <div className="text-xl font-bold text-app-green mt-2">72.4%</div>
          <div className="text-[11px] text-app-muted mt-1">Overburden loss: 27.6%</div>
        </div>
      </div>

      {/* Steam Volume vs Economic Frontier Chart */}
      <div className="bg-white border border-app-border rounded-lg p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-app-border pb-3">
          <div>
            <span className="text-sm font-semibold text-app-text tracking-tight">
              Steam Volume vs Recovery & Specific Cost Frontier
            </span>
            <div className="text-xs text-app-muted">
              Identifies the optimal thermodynamic sweet spot for cyclic steam injection
            </div>
          </div>

          <div className="text-xs text-app-green bg-app-softGreen px-2.5 py-1 rounded border border-[#D5EFE1] font-medium">
            Recommended Optimal: 2,050 Tonnes
          </div>
        </div>

        <div className="w-full h-72 bg-white rounded p-1 border border-app-border">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={steamTradeoffData} margin={{ top: 15, right: 25, left: 10, bottom: 20 }}>
              <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" />
              <XAxis
                dataKey="steamTonnes"
                unit=" t"
                stroke="#94A3B8"
                tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'sans-serif' }}
                label={{
                  value: 'Injected Steam Volume (tonnes)',
                  position: 'insideBottom',
                  offset: -12,
                  fill: '#64748B',
                  fontSize: 11,
                  fontFamily: 'sans-serif',
                }}
              />
              <YAxis
                yAxisId="left"
                stroke="#94A3B8"
                unit=" bbl"
                tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'sans-serif' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#D9824B"
                unit=" bbl/bbl"
                domain={[2.0, 3.5]}
                tick={{ fontSize: 11, fill: '#D9824B', fontFamily: 'sans-serif' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const p = payload[0].payload;
                    return (
                      <div className="bg-white border border-app-border p-2.5 text-xs rounded-lg shadow-md text-app-text">
                        <div className="text-app-muted mb-1">Steam: {p.steamTonnes} tonnes</div>
                        <div className="text-app-blue font-medium">Oil Produced: {p.oilProducedBbl} bbl</div>
                        <div className="text-app-steam font-medium">Specific SOR: {p.sor}</div>
                        <div className="text-app-green font-medium">Net Utility Index: {p.netMarginIndex}/100</div>
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
              <Bar
                yAxisId="left"
                dataKey="oilProducedBbl"
                name="Cumulative Oil Recovery (bbl)"
                fill="#3B82A0"
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="sor"
                name="Steam Oil Ratio (SOR)"
                stroke="#D9824B"
                strokeWidth={2}
                dot={{ r: 3.5, fill: '#D9824B' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trade-off Decision Summary */}
      <div className="bg-white border border-app-border rounded-lg p-6">
        <div className="text-xs font-semibold text-app-text uppercase tracking-wider mb-3">
          Thermodynamic Efficiency Summary
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs leading-relaxed text-app-muted">
          <div className="bg-app-bg p-4 rounded-lg border border-app-border">
            <span className="font-semibold text-app-text">1. Heat Penetration Limit:</span>
            <p className="mt-1.5">
              Injecting steam beyond 2,400 tonnes yields marginal incremental heating because heat dissipation into the overburden shale increases with the boundary surface area, causing SOR to climb steeply from 2.30 to 2.83.
            </p>
          </div>
          <div className="bg-app-bg p-4 rounded-lg border border-app-border">
            <span className="font-semibold text-app-text">2. Lifting Power Synergy:</span>
            <p className="mt-1.5">
              Heating reduces heavy oil viscosity from 22,000 cP to 168 cP, dropping SRP lifting power consumption by <strong>68%</strong> (from 82 kWh/bbl to 26 kWh/bbl). The optimum operational strategy balances steam generation cost with electrical lifting savings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
