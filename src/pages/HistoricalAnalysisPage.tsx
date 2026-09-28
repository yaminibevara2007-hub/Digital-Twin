import React, { useState } from 'react';
import { CSSCycleData, WellInfo } from '../types';
import { getWellCSSCycles } from '../services/mockDataService';
import { StatusBadge } from '../components/StatusBadge';
import { History } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface HistoricalAnalysisPageProps {
  well: WellInfo;
}

export const HistoricalAnalysisPage: React.FC<HistoricalAnalysisPageProps> = ({ well }) => {
  const cycles: CSSCycleData[] = getWellCSSCycles(well.id);
  const [selectedCycleNum, setSelectedCycleNum] = useState<number>(4);

  const selectedCycle = cycles.find((c) => c.cycleNumber === selectedCycleNum) || cycles[0];

  const chartData = cycles.map((c) => ({
    cycle: `Cycle ${c.cycleNumber}`,
    steamVolume: c.steamVolumeTonnes,
    cumulativeOil: c.cumulativeOilBbl,
    sor: c.sorBblTon,
    peakRate: c.peakOilRateBOPD,
  }));

  return (
    <div className="space-y-6">
      {/* Header Notice */}
      <div className="bg-white border border-app-border rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-sm font-semibold text-app-text tracking-tight flex items-center gap-2">
            <History className="w-4 h-4 text-app-blue" />
            Historical Cyclic Steam Stimulation (CSS) Cycle Analysis
          </span>
          <div className="text-xs text-app-muted">
            Cross-cycle thermodynamic conformance & net oil recovery comparison
          </div>
        </div>

        <div className="text-xs text-app-muted">
          Well {well.id} | Formation: Jodhpur Sandstone
        </div>
      </div>

      {/* Cycle Comparison Bar Chart */}
      <div className="bg-white border border-app-border rounded-lg p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-app-border pb-3">
          <div>
            <span className="text-sm font-semibold text-app-text tracking-tight">
              Steam Volume Injected vs Cumulative Oil Recovery by Cycle
            </span>
            <div className="text-xs text-app-muted">
              Evaluates thermal stimulation efficiency trends across successive cycles
            </div>
          </div>

          <div className="text-xs text-app-muted">
            Cycles 1 to 5
          </div>
        </div>

        <div className="w-full h-72 bg-white rounded p-1 border border-app-border">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 15, right: 25, left: 10, bottom: 20 }}>
              <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" />
              <XAxis
                dataKey="cycle"
                stroke="#94A3B8"
                tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'sans-serif' }}
              />
              <YAxis
                stroke="#94A3B8"
                tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'sans-serif' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const p = payload[0].payload;
                    return (
                      <div className="bg-white border border-app-border p-2.5 text-xs rounded-lg shadow-xs text-app-text">
                        <div className="text-app-text font-bold mb-1">{p.cycle}</div>
                        <div className="text-app-steam font-medium">Steam: {p.steamVolume} tonnes</div>
                        <div className="text-app-blue font-medium">Cumulative Oil: {p.cumulativeOil} bbl</div>
                        <div className="text-app-green font-medium">Peak Rate: {p.peakRate} bbl/day</div>
                        <div className="text-app-muted">SOR: {p.sor} bbl/tonne</div>
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
              <Bar dataKey="steamVolume" name="Steam Injected (tonnes)" fill="#D9824B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cumulativeOil" name="Cumulative Oil (bbl)" fill="#3B82A0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cycle Comparison Master Table */}
      <div className="bg-white border border-app-border rounded-lg p-6">
        <div className="flex items-center justify-between border-b border-app-border pb-3 mb-4">
          <span className="text-sm font-semibold text-app-text tracking-tight">
            Cycle-to-Cycle Parameters & Performance Metrics
          </span>
          <span className="text-xs text-app-muted">Click row to inspect operational log</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-app-bg border-b border-app-border text-app-text text-left">
                <th className="py-2.5 px-3 font-semibold">Cycle #</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold">Steam (t)</th>
                <th className="py-2.5 px-3 font-semibold">Inj. Days</th>
                <th className="py-2.5 px-3 font-semibold">Soak Days</th>
                <th className="py-2.5 px-3 font-semibold">Prod. Days</th>
                <th className="py-2.5 px-3 font-semibold">Peak BOPD</th>
                <th className="py-2.5 px-3 font-semibold">Cum. Oil (bbl)</th>
                <th className="py-2.5 px-3 font-semibold">SOR</th>
                <th className="py-2.5 px-3 font-semibold">Peak Temp (°C)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border">
              {cycles.map((c) => {
                const isSelected = selectedCycleNum === c.cycleNumber;
                return (
                  <tr
                    key={c.cycleNumber}
                    onClick={() => setSelectedCycleNum(c.cycleNumber)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-app-softBlue font-semibold text-app-navy' : 'hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-medium text-app-navy">Cycle {c.cycleNumber}</td>
                    <td className="py-2.5 px-3"><StatusBadge status={c.status} size="sm" /></td>
                    <td className="py-2.5 px-3 text-app-steam">{c.steamVolumeTonnes}</td>
                    <td className="py-2.5 px-3 text-app-muted">{c.injectionDurationDays}</td>
                    <td className="py-2.5 px-3 text-app-muted">{c.soakDurationDays}</td>
                    <td className="py-2.5 px-3 text-app-muted">{c.productionDurationDays}</td>
                    <td className="py-2.5 px-3 text-app-text">{c.peakOilRateBOPD}</td>
                    <td className="py-2.5 px-3 text-app-blue font-semibold">{c.cumulativeOilBbl.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-app-muted">{c.sorBblTon}</td>
                    <td className="py-2.5 px-3 text-app-steam">{c.peakReservoirTempC} °C</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Cycle Engineering Log */}
      <div className="bg-app-bg border border-app-border rounded-lg p-5">
        <div className="flex items-center justify-between border-b border-app-border pb-2.5 mb-2">
          <span className="text-xs font-semibold text-app-text uppercase tracking-wider">
            Operational Log & Field Observations: Cycle {selectedCycle.cycleNumber}
          </span>
          <StatusBadge status={selectedCycle.status} size="sm" />
        </div>
        <p className="text-xs text-app-muted leading-relaxed">
          {selectedCycle.notes}
        </p>
      </div>
    </div>
  );
};
