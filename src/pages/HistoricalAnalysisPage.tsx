import React, { useState } from 'react';
import { CSSCycleData, WellInfo } from '../types';
import { getWellCSSCycles } from '../services/mockDataService';
import { StatusBadge } from '../components/StatusBadge';
import { 
  History, 
  Flame, 
  Droplet, 
  BarChart2, 
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
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
    <div className="space-y-4">
      {/* Header Notice */}
      <div className="scada-panel p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-4 h-4 text-sky-400" />
            Historical Cyclic Steam Stimulation (CSS) Multi-Cycle Analysis
          </span>
          <div className="text-[11px] font-mono text-industrial-400">
            Cross-Cycle Thermodynamic Conformance & Net Oil Recovery Performance
          </div>
        </div>

        <div className="text-xs font-mono text-industrial-400">
          Well {well.id} | Formation: Jodhpur Sandstone
        </div>
      </div>

      {/* Cycle Multi-Bar Comparison Chart */}
      <div className="scada-panel p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-industrial-800 pb-2">
          <div>
            <span className="text-xs font-mono font-bold text-industrial-200 uppercase tracking-wider">
              Steam Volume Injected vs Cumulative Oil Recovery by Cycle
            </span>
            <div className="text-[11px] font-mono text-industrial-400">
              Evaluates thermal stimulation efficiency trends across successive cycles
            </div>
          </div>

          <div className="text-xs font-mono text-industrial-400">
            Cycles 1 to 5
          </div>
        </div>

        <div className="w-full h-72 bg-industrial-950 rounded p-2 border border-industrial-850">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 25, left: 10, bottom: 20 }}>
              <CartesianGrid stroke="#1c2c47" strokeDasharray="3 3" />
              <XAxis
                dataKey="cycle"
                stroke="#5c75a3"
                tick={{ fontSize: 10, fill: '#8ba2c7', fontFamily: 'monospace' }}
              />
              <YAxis
                stroke="#5c75a3"
                tick={{ fontSize: 10, fill: '#8ba2c7', fontFamily: 'monospace' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const p = payload[0].payload;
                    return (
                      <div className="bg-industrial-900 border border-industrial-700 p-2 text-xs font-mono rounded shadow-lg text-industrial-200">
                        <div className="text-industrial-400 font-bold">{p.cycle}</div>
                        <div className="text-petro-orange">Steam: {p.steamVolume} tonnes</div>
                        <div className="text-sky-400">Cumulative Oil: {p.cumulativeOil} bbl</div>
                        <div className="text-emerald-400">Peak Rate: {p.peakRate} bbl/day</div>
                        <div className="text-industrial-300">SOR: {p.sor} bbl/tonne</div>
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
              <Bar dataKey="steamVolume" name="Steam Injected (tonnes)" fill="#d97736" radius={[2, 2, 0, 0]} />
              <Bar dataKey="cumulativeOil" name="Cumulative Oil (bbl)" fill="#0284c7" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cycle Comparison Master Table */}
      <div className="scada-panel p-4">
        <div className="flex items-center justify-between border-b border-industrial-800 pb-2 mb-3">
          <span className="text-xs font-mono font-bold text-industrial-200 uppercase tracking-wider">
            Cycle-to-Cycle Parameters & Performance Metrics
          </span>
          <span className="text-[11px] font-mono text-industrial-400">Click any row to inspect cycle log</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-industrial-950 border-b border-industrial-800 text-industrial-400 text-left">
                <th className="py-2.5 px-3">Cycle #</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Steam (t)</th>
                <th className="py-2.5 px-3">Inj. Days</th>
                <th className="py-2.5 px-3">Soak Days</th>
                <th className="py-2.5 px-3">Prod. Days</th>
                <th className="py-2.5 px-3">Peak BOPD</th>
                <th className="py-2.5 px-3">Cum. Oil (bbl)</th>
                <th className="py-2.5 px-3">SOR</th>
                <th className="py-2.5 px-3">Peak Temp (°C)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-850">
              {cycles.map((c) => {
                const isSelected = selectedCycleNum === c.cycleNumber;
                return (
                  <tr
                    key={c.cycleNumber}
                    onClick={() => setSelectedCycleNum(c.cycleNumber)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-industrial-850 font-semibold text-white' : 'hover:bg-industrial-900/60'
                    }`}
                  >
                    <td className="py-2 px-3 text-sky-400 font-bold">Cycle {c.cycleNumber}</td>
                    <td className="py-2 px-3"><StatusBadge status={c.status} size="sm" /></td>
                    <td className="py-2 px-3 text-petro-orange">{c.steamVolumeTonnes}</td>
                    <td className="py-2 px-3">{c.injectionDurationDays}</td>
                    <td className="py-2 px-3">{c.soakDurationDays}</td>
                    <td className="py-2 px-3">{c.productionDurationDays}</td>
                    <td className="py-2 px-3 text-industrial-100">{c.peakOilRateBOPD}</td>
                    <td className="py-2 px-3 text-sky-400 font-bold">{c.cumulativeOilBbl.toLocaleString()}</td>
                    <td className="py-2 px-3">{c.sorBblTon}</td>
                    <td className="py-2 px-3 text-petro-orange">{c.peakReservoirTempC} °C</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Cycle Engineering Post-Mortem & Operational Log */}
      <div className="scada-panel p-4 bg-industrial-900/80">
        <div className="flex items-center justify-between border-b border-industrial-800 pb-2 mb-2">
          <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
            Operational Log & Engineering Observations: Cycle {selectedCycle.cycleNumber}
          </span>
          <StatusBadge status={selectedCycle.status} size="sm" />
        </div>
        <p className="text-xs text-industrial-300 leading-relaxed font-mono">
          {selectedCycle.notes}
        </p>
      </div>
    </div>
  );
};
