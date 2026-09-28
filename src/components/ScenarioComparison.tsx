import React from 'react';
import { SimulationScenario } from '../types';
import { Check, Sliders } from 'lucide-react';

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
    <div className="bg-white border border-app-border rounded-lg p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-app-border pb-3">
        <div>
          <span className="text-sm font-semibold text-app-text tracking-tight flex items-center gap-2">
            <Sliders className="w-4 h-4 text-app-blue" />
            CSS-SRP Scenario Comparison Matrix
          </span>
          <div className="text-xs text-app-muted">
            Side-by-side comparison of configured inputs and predicted recovery parameters
          </div>
        </div>

        {selectedScenario && (
          <button
            onClick={() => onApplyScenario(selectedScenario)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-app-navy text-white text-xs font-medium hover:bg-app-navyDark transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Apply "{selectedScenario.name}"
          </button>
        )}
      </div>

      {/* Comparison Table - Clean Light Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-app-bg border-b border-app-border text-app-text text-left">
              <th className="py-2.5 px-3 font-semibold">Parameter</th>
              <th className="py-2.5 px-3 font-medium text-app-muted">Unit</th>
              {scenarios.map((sc) => (
                <th
                  key={sc.id}
                  onClick={() => onSelectScenario(sc.id)}
                  className={`py-2.5 px-3 cursor-pointer transition-colors font-semibold ${
                    sc.id === selectedScenarioId
                      ? 'bg-app-softBlue text-app-navy border-b-2 border-app-navy'
                      : 'text-app-text hover:bg-[#F1F5F9]'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{sc.name}</span>
                    {sc.id === selectedScenarioId && <Check className="w-3.5 h-3.5 text-app-navy" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border">
            {/* INPUT PARAMETERS SECTION */}
            <tr className="bg-app-bg/60 text-[11px] uppercase tracking-wider text-app-muted font-semibold">
              <td colSpan={2 + scenarios.length} className="py-1.5 px-3">
                1. Operational Inputs
              </td>
            </tr>
            <tr className="hover:bg-[#F8FAFC]">
              <td className="py-2 px-3 text-app-text font-medium">Steam Volume</td>
              <td className="py-2 px-3 text-app-muted">tonnes</td>
              {scenarios.map((s) => (
                <td key={s.id} className="py-2 px-3 text-app-text">{s.steamVolumeTonnes}</td>
              ))}
            </tr>
            <tr className="hover:bg-[#F8FAFC]">
              <td className="py-2 px-3 text-app-text font-medium">Injection Pressure</td>
              <td className="py-2 px-3 text-app-muted">psi</td>
              {scenarios.map((s) => (
                <td key={s.id} className="py-2 px-3 text-app-text">{s.injectionPressurePsi}</td>
              ))}
            </tr>
            <tr className="hover:bg-[#F8FAFC]">
              <td className="py-2 px-3 text-app-text font-medium">Injection Duration</td>
              <td className="py-2 px-3 text-app-muted">days</td>
              {scenarios.map((s) => (
                <td key={s.id} className="py-2 px-3 text-app-text">{s.injectionDurationDays}</td>
              ))}
            </tr>
            <tr className="hover:bg-[#F8FAFC]">
              <td className="py-2 px-3 text-app-text font-medium">Thermal Soak Period</td>
              <td className="py-2 px-3 text-app-muted">days</td>
              {scenarios.map((s) => (
                <td key={s.id} className="py-2 px-3 text-app-text">{s.soakDays}</td>
              ))}
            </tr>
            <tr className="hover:bg-[#F8FAFC]">
              <td className="py-2 px-3 text-app-text font-medium">SRP Pumping Speed</td>
              <td className="py-2 px-3 text-app-muted">SPM</td>
              {scenarios.map((s) => (
                <td key={s.id} className="py-2 px-3 text-app-navy font-semibold">{s.srpSPM}</td>
              ))}
            </tr>
            <tr className="hover:bg-[#F8FAFC]">
              <td className="py-2 px-3 text-app-text font-medium">Stroke Length</td>
              <td className="py-2 px-3 text-app-muted">inches</td>
              {scenarios.map((s) => (
                <td key={s.id} className="py-2 px-3 text-app-text">{s.srpStrokeLengthInches}</td>
              ))}
            </tr>
            <tr className="hover:bg-[#F8FAFC]">
              <td className="py-2 px-3 text-app-text font-medium">VFD Drive Frequency</td>
              <td className="py-2 px-3 text-app-muted">Hz</td>
              {scenarios.map((s) => (
                <td key={s.id} className="py-2 px-3 text-app-text">{s.vfdFrequencyHz}</td>
              ))}
            </tr>

            {/* PREDICTED ENGINEERING OUTCOMES */}
            <tr className="bg-app-bg/60 text-[11px] uppercase tracking-wider text-app-muted font-semibold">
              <td colSpan={2 + scenarios.length} className="py-1.5 px-3">
                2. Predicted Subsurface & Lifting Outcomes
              </td>
            </tr>
            <tr className="hover:bg-[#F8FAFC]">
              <td className="py-2 px-3 text-app-text font-semibold">Average Oil Production</td>
              <td className="py-2 px-3 text-app-muted">bbl/day</td>
              {scenarios.map((s) => (
                <td key={s.id} className="py-2 px-3 text-app-blue font-bold text-sm">
                  {s.predictedAvgOilRateBOPD}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-[#F8FAFC]">
              <td className="py-2 px-3 text-app-text font-medium">Cumulative Oil Recovery</td>
              <td className="py-2 px-3 text-app-muted">bbl</td>
              {scenarios.map((s) => (
                <td key={s.id} className="py-2 px-3 text-app-text font-semibold">{s.predictedCumulativeOilBbl.toLocaleString()}</td>
              ))}
            </tr>
            <tr className="hover:bg-[#F8FAFC]">
              <td className="py-2 px-3 text-app-text font-medium">Peak Reservoir Temp</td>
              <td className="py-2 px-3 text-app-muted">°C</td>
              {scenarios.map((s) => (
                <td key={s.id} className="py-2 px-3 text-app-steam font-semibold">{s.predictedPeakTempC}</td>
              ))}
            </tr>
            <tr className="hover:bg-[#F8FAFC]">
              <td className="py-2 px-3 text-app-text font-medium">Operating Viscosity</td>
              <td className="py-2 px-3 text-app-muted">cP</td>
              {scenarios.map((s) => (
                <td key={s.id} className="py-2 px-3 text-app-text">{s.predictedViscosityCP}</td>
              ))}
            </tr>
            <tr className="hover:bg-[#F8FAFC]">
              <td className="py-2 px-3 text-app-text font-medium">Pump Fillage</td>
              <td className="py-2 px-3 text-app-muted">%</td>
              {scenarios.map((s) => (
                <td key={s.id} className="py-2 px-3 text-app-green font-semibold">{s.predictedPumpFillagePct}%</td>
              ))}
            </tr>
            <tr className="hover:bg-[#F8FAFC]">
              <td className="py-2 px-3 text-app-text font-medium">Steam-Oil Ratio (SOR)</td>
              <td className="py-2 px-3 text-app-muted">bbl/bbl</td>
              {scenarios.map((s) => (
                <td key={s.id} className="py-2 px-3 text-app-text">{s.predictedSOR}</td>
              ))}
            </tr>
            <tr className="hover:bg-[#F8FAFC]">
              <td className="py-2 px-3 text-app-text font-medium">Specific Lifting Energy</td>
              <td className="py-2 px-3 text-app-muted">kWh/bbl</td>
              {scenarios.map((s) => (
                <td key={s.id} className="py-2 px-3 text-app-text">{s.predictedEnergyKWhBbl}</td>
              ))}
            </tr>
            <tr className="hover:bg-[#F8FAFC]">
              <td className="py-2 px-3 text-app-text font-medium">Rod-Floating Risk Index</td>
              <td className="py-2 px-3 text-app-muted">%</td>
              {scenarios.map((s) => (
                <td
                  key={s.id}
                  className={`py-2 px-3 font-semibold ${
                    s.predictedRodFloatRiskPct > 60 ? 'text-app-amber' : 'text-app-green'
                  }`}
                >
                  {s.predictedRodFloatRiskPct}%
                </td>
              ))}
            </tr>
            <tr className="bg-app-bg/50 font-bold">
              <td className="py-2.5 px-3 text-app-text">Engineering Utility Score</td>
              <td className="py-2.5 px-3 text-app-muted">Index (0-100)</td>
              {scenarios.map((s) => (
                <td key={s.id} className="py-2.5 px-3 text-app-navy text-sm font-semibold">
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
