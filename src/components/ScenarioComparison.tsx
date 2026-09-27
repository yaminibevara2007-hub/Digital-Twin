import React from 'react';
import { SimulationScenario } from '../types';
import { Check, Sliders, ArrowRight } from 'lucide-react';

interface ScenarioComparisonProps {
  scenarios: SimulationScenario[];
  selectedScenarioId: string;
  onSelectScenario: (id: string) => void;
  onApplyScenario: (scenario: SimulationScenario) => void;
}

export const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({
  scenarios,
  selectedScenarioId,
  onSelectScenario,
  onApplyScenario,
}) => {
  const selectedScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  return (
    <div className="scada-panel p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-industrial-800 pb-2">
        <div>
          <span className="text-xs font-mono font-bold text-industrial-200 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            Coupled CSS-SRP Scenario Comparison Table
          </span>
          <div className="text-[11px] font-mono text-industrial-400">
            Compare predicted thermal reservoir response and sucker rod lifting dynamics
          </div>
        </div>

        {selectedScenario && (
          <button
            onClick={() => onApplyScenario(selectedScenario)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-sky-950 border border-sky-600 text-sky-200 text-xs font-mono font-semibold hover:bg-sky-900 transition-colors"
          >
            <Check className="w-3.5 h-3.5 text-sky-400" />
            Apply "{selectedScenario.name}"
          </button>
        )}
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono border-collapse">
          <thead>
            <tr className="bg-industrial-950 border-b border-industrial-800 text-industrial-400 text-left">
              <th className="py-2.5 px-3">Operating & Predicted Parameter</th>
              <th className="py-2.5 px-3">Unit</th>
              {scenarios.map((sc) => (
                <th
                  key={sc.id}
                  onClick={() => onSelectScenario(sc.id)}
                  className={`py-2.5 px-3 cursor-pointer transition-colors ${
                    sc.id === selectedScenarioId
                      ? 'bg-industrial-850 text-sky-400 border-t-2 border-sky-400'
                      : 'text-industrial-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{sc.name}</span>
                    {sc.id === selectedScenarioId && <Check className="w-3.5 h-3.5 text-sky-400" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-industrial-850">
            {/* INPUT PARAMETERS SECTION */}
            <tr className="bg-industrial-900/50 text-[11px] uppercase tracking-wider text-industrial-400 font-bold">
              <td colSpan={2 + scenarios.length} className="py-1 px-3 bg-industrial-950/80">
                1. Configured CSS-SRP Inputs
              </td>
            </tr>
            <tr>
              <td className="py-2 px-3 text-industrial-300">Steam Injection Volume</td>
              <td className="py-2 px-3 text-industrial-500">tonnes</td>
              {scenarios.map((s) => (
                <td key={s.id} className="py-2 px-3 text-industrial-100 font-semibold">{s.steamVolumeTonnes}</td>
              ))}
            </tr>
            <tr>
              <td className="py-2 px-3 text-industrial-300">Injection Pressure</td>
              <td className="py-2 px-3 text-industrial-500">psi</td>
              {scenarios.map((s) => (
                <td key={s.id} className="py-2 px-3 text-industrial-100">{s.injectionPressurePsi}</td>
              ))}
            </tr>
            <tr>
              <td className="py-2 px-3 text-industrial-300">Injection Duration</td>
              <td className="py-2 px-3 text-industrial-500">days</td>
              {scenarios.map((s) => (
                <td key={s.id} className="py-2 px-3 text-industrial-100">{s.injectionDurationDays}</td>
              ))}
            </tr>
            <tr>
              <td className="py-2 px-3 text-industrial-300">Soak Period Duration</td>
              <td className="py-2 px-3 text-industrial-500">days</td>
              {scenarios.map((s) => (
                <td key={s.id} className="py-2 px-3 text-industrial-100">{s.soakDays}</td>
              ))}
            </tr>
            <tr>
              <td className="py-2 px-3 text-industrial-300">SRP Pumping Speed</td>
              <td className="py-2 px-3 text-industrial-500">SPM</td>
              {scenarios.map((s) => (
                <td key={s.id} className="py-2 px-3 text-industrial-100 font-semibold">{s.srpSPM}</td>
              ))}
            </tr>
            <tr>
              <td className="py-2 px-3 text-industrial-300">SRP Stroke Length</td>
              <td className="py-2 px-3 text-industrial-500">inches</td>
              {scenarios.map((s) => (
                <td key={s.id} className="py-2 px-3 text-industrial-100">{s.srpStrokeLengthInches}</td>
              ))}
            </tr>
            <tr>
              <td className="py-2 px-3 text-industrial-300">VFD Drive Frequency</td>
              <td className="py-2 px-3 text-industrial-500">Hz</td>
              {scenarios.map((s) => (
                <td key={s.id} className="py-2 px-3 text-industrial-100">{s.vfdFrequencyHz}</td>
              ))}
            </tr>

            {/* PREDICTED ENGINEERING OUTCOMES */}
            <tr className="bg-industrial-900/50 text-[11px] uppercase tracking-wider text-industrial-400 font-bold">
              <td colSpan={2 + scenarios.length} className="py-1 px-3 bg-industrial-950/80">
                2. Predicted Subsurface & Surface Response
              </td>
            </tr>
            <tr>
              <td className="py-2 px-3 text-industrial-300 font-semibold">Average Oil Production Rate</td>
              <td className="py-2 px-3 text-industrial-500">bbl/day</td>
              {scenarios.map((s) => (
                <td key={s.id} className="py-2 px-3 text-sky-400 font-bold text-sm">
                  {s.predictedAvgOilRateBOPD}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2 px-3 text-industrial-300">Cumulative Cycle Production</td>
              <td className="py-2 px-3 text-industrial-500">bbl</td>
              {scenarios.map((s) => (
                <td key={s.id} className="py-2 px-3 text-industrial-100 font-semibold">{s.predictedCumulativeOilBbl}</td>
              ))}
            </tr>
            <tr>
              <td className="py-2 px-3 text-industrial-300">Peak Near-Wellbore Temp</td>
              <td className="py-2 px-3 text-industrial-500">°C</td>
              {scenarios.map((s) => (
                <td key={s.id} className="py-2 px-3 text-petro-orange font-semibold">{s.predictedPeakTempC}</td>
              ))}
            </tr>
            <tr>
              <td className="py-2 px-3 text-industrial-300">Operating Viscosity</td>
              <td className="py-2 px-3 text-industrial-500">cP</td>
              {scenarios.map((s) => (
                <td key={s.id} className="py-2 px-3 text-industrial-100">{s.predictedViscosityCP}</td>
              ))}
            </tr>
            <tr>
              <td className="py-2 px-3 text-industrial-300">Downhole Pump Fillage</td>
              <td className="py-2 px-3 text-industrial-500">%</td>
              {scenarios.map((s) => (
                <td key={s.id} className="py-2 px-3 text-emerald-400 font-semibold">{s.predictedPumpFillagePct}%</td>
              ))}
            </tr>
            <tr>
              <td className="py-2 px-3 text-industrial-300">Steam-Oil Ratio (SOR)</td>
              <td className="py-2 px-3 text-industrial-500">bbl/bbl</td>
              {scenarios.map((s) => (
                <td key={s.id} className="py-2 px-3 text-industrial-200">{s.predictedSOR}</td>
              ))}
            </tr>
            <tr>
              <td className="py-2 px-3 text-industrial-300">Specific Lifting Energy</td>
              <td className="py-2 px-3 text-industrial-500">kWh/bbl</td>
              {scenarios.map((s) => (
                <td key={s.id} className="py-2 px-3 text-industrial-200">{s.predictedEnergyKWhBbl}</td>
              ))}
            </tr>
            <tr>
              <td className="py-2 px-3 text-industrial-300">Rod-Floating Risk Index</td>
              <td className="py-2 px-3 text-industrial-500">%</td>
              {scenarios.map((s) => (
                <td
                  key={s.id}
                  className={`py-2 px-3 font-semibold ${
                    s.predictedRodFloatRiskPct > 60 ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {s.predictedRodFloatRiskPct}%
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2 px-3 text-industrial-300">Mechanical Failure Risk</td>
              <td className="py-2 px-3 text-industrial-500">%</td>
              {scenarios.map((s) => (
                <td
                  key={s.id}
                  className={`py-2 px-3 font-semibold ${
                    s.predictedPumpFailureRiskPct > 50 ? 'text-petro-red' : 'text-industrial-300'
                  }`}
                >
                  {s.predictedPumpFailureRiskPct}%
                </td>
              ))}
            </tr>
            <tr className="bg-industrial-950 font-bold">
              <td className="py-2.5 px-3 text-sky-300">Engineering Utility Score</td>
              <td className="py-2.5 px-3 text-industrial-500">Index (0-100)</td>
              {scenarios.map((s) => (
                <td key={s.id} className="py-2.5 px-3 text-sky-400 text-sm">
                  {s.economicNetIndex} / 100
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
