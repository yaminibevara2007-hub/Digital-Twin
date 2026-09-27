import React from 'react';
import { TelemetryData, WellInfo } from '../types';
import { Zap, Flame, Gauge, DollarSign, Scale, ArrowRight } from 'lucide-react';
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
  // Steam sensitivity trade-off frontier data
  const steamTradeoffData = [
    { steamTonnes: 1200, oilProducedBbl: 4200, sor: 2.86, costUSDPerBbl: 28.4, netMarginIndex: 62 },
    { steamTonnes: 1500, oilProducedBbl: 5800, sor: 2.59, costUSDPerBbl: 24.1, netMarginIndex: 78 },
    { steamTonnes: 1800, oilProducedBbl: 7400, sor: 2.43, costUSDPerBbl: 22.8, netMarginIndex: 88 },
    { steamTonnes: 2050, oilProducedBbl: 8900, sor: 2.30, costUSDPerBbl: 21.6, netMarginIndex: 94 }, // Optimal point
    { steamTonnes: 2400, oilProducedBbl: 9500, sor: 2.53, costUSDPerBbl: 23.9, netMarginIndex: 84 },
    { steamTonnes: 2800, oilProducedBbl: 9900, sor: 2.83, costUSDPerBbl: 27.2, netMarginIndex: 71 },
  ];

  return (
    <div className="space-y-4">
      {/* Energy Efficiency Overview */}
      <div className="scada-panel p-4 border-l-4 border-l-amber-500 bg-industrial-900/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            Thermal Energy & Lifting Power Optimization
          </span>
          <div className="text-xs text-industrial-300 mt-1 max-w-3xl leading-relaxed">
            Balances the thermodynamic trade-off between higher steam volume injection (yielding deeper heating and reduced viscosity) against the diminishing economic return of higher steam-to-oil ratios (SOR) and parasitic thermal losses to caprock.
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-industrial-950 px-3 py-2 rounded border border-industrial-800">
          <span className="text-industrial-400">Current SOR:</span>
          <span className="text-emerald-400 font-bold">{telemetry.steamOilRatioSOR} bbl CWE / bbl</span>
        </div>
      </div>

      {/* KPI Cards: Energy & Steam */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
        <div className="scada-panel p-3">
          <div className="text-[10px] text-industrial-400 uppercase flex items-center gap-1">
            <Flame className="w-3 h-3 text-petro-orange" />
            Steam Injected (Cycle {well.currentCycle})
          </div>
          <div className="text-lg font-bold text-petro-orange mt-1">1,920 tonnes</div>
          <div className="text-[10px] text-industrial-400 mt-0.5">80% steam quality @ 1,420 psi</div>
        </div>

        <div className="scada-panel p-3">
          <div className="text-[10px] text-industrial-400 uppercase flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            Specific Lifting Energy
          </div>
          <div className="text-lg font-bold text-industrial-100 mt-1">{telemetry.energyConsumptionKWhBbl} kWh/bbl</div>
          <div className="text-[10px] text-industrial-400 mt-0.5">SRP 40 HP VFD motor draw</div>
        </div>

        <div className="scada-panel p-3">
          <div className="text-[10px] text-industrial-400 uppercase flex items-center gap-1">
            <Scale className="w-3 h-3 text-sky-400" />
            Production per Tonne Steam
          </div>
          <div className="text-lg font-bold text-sky-400 mt-1">2.70 bbl oil / tonne</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Above field average (2.2)</div>
        </div>

        <div className="scada-panel p-3">
          <div className="text-[10px] text-industrial-400 uppercase flex items-center gap-1">
            <Gauge className="w-3 h-3 text-emerald-400" />
            Thermal Utilization Efficiency
          </div>
          <div className="text-lg font-bold text-emerald-400 mt-1">72.4%</div>
          <div className="text-[10px] text-industrial-400 mt-0.5">Overburden heat loss: 27.6%</div>
        </div>
      </div>

      {/* Steam Volume vs Economic Frontier Chart */}
      <div className="scada-panel p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-industrial-800 pb-2">
          <div>
            <span className="text-xs font-mono font-bold text-industrial-200 uppercase tracking-wider">
              Steam Volume vs Recovery & Specific Cost Frontier
            </span>
            <div className="text-[11px] font-mono text-industrial-400">
              Identifies the optimal thermodynamic sweet spot for cyclic steam injection
            </div>
          </div>

          <div className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-800">
            Recommended Optimal: 2,050 Tonnes
          </div>
        </div>

        <div className="w-full h-72 bg-industrial-950 rounded p-2 border border-industrial-850">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={steamTradeoffData} margin={{ top: 10, right: 25, left: 10, bottom: 20 }}>
              <CartesianGrid stroke="#1c2c47" strokeDasharray="3 3" />
              <XAxis
                dataKey="steamTonnes"
                unit=" t"
                stroke="#5c75a3"
                tick={{ fontSize: 10, fill: '#8ba2c7', fontFamily: 'monospace' }}
                label={{
                  value: 'Injected Steam Volume (tonnes)',
                  position: 'insideBottom',
                  offset: -12,
                  fill: '#8ba2c7',
                  fontSize: 10,
                  fontFamily: 'monospace',
                }}
              />
              <YAxis
                yAxisId="left"
                stroke="#5c75a3"
                unit=" bbl"
                tick={{ fontSize: 10, fill: '#8ba2c7', fontFamily: 'monospace' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#d97736"
                unit=" bbl/bbl"
                domain={[2.0, 3.5]}
                tick={{ fontSize: 10, fill: '#d97736', fontFamily: 'monospace' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const p = payload[0].payload;
                    return (
                      <div className="bg-industrial-900 border border-industrial-700 p-2 text-xs font-mono rounded shadow-lg text-industrial-200">
                        <div className="text-industrial-400">Steam: {p.steamTonnes} tonnes</div>
                        <div className="text-sky-400">Oil Produced: {p.oilProducedBbl} bbl</div>
                        <div className="text-petro-orange">Specific SOR: {p.sor}</div>
                        <div className="text-emerald-400">Net Utility Index: {p.netMarginIndex}/100</div>
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
              <Bar
                yAxisId="left"
                dataKey="oilProducedBbl"
                name="Cumulative Oil Recovery (bbl)"
                fill="#0284c7"
                radius={[2, 2, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="sor"
                name="Steam Oil Ratio (SOR)"
                stroke="#d97736"
                strokeWidth={2}
                dot={{ r: 4, fill: '#d97736' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trade-off Engineering Decision Summary */}
      <div className="scada-panel p-4 bg-industrial-900/60">
        <div className="text-xs font-mono font-bold text-industrial-200 uppercase tracking-wider mb-2">
          Thermodynamic Efficiency Summary:
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-industrial-300">
          <div className="bg-industrial-950 p-3 rounded border border-industrial-800">
            <span className="font-semibold text-sky-400 font-mono">1. Diminishing Heat Penetration:</span>
            <p className="mt-1">
              Injecting steam beyond 2,400 tonnes yields marginal incremental heating because heat dissipation into the overburden shale increases with the square of the heated boundary area, causing SOR to climb steeply from 2.30 to 2.83.
            </p>
          </div>
          <div className="bg-industrial-950 p-3 rounded border border-industrial-800">
            <span className="font-semibold text-emerald-400 font-mono">2. Lifting Power Synergy:</span>
            <p className="mt-1">
              Heating reduces heavy oil viscosity from 22,000 cP to 168 cP, dropping SRP lifting power consumption by <strong>68%</strong> (from 82 kWh/bbl to 26 kWh/bbl). The optimum operational strategy balances steam generation cost with electrical lifting savings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
