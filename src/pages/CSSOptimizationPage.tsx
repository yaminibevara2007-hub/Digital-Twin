import React, { useState } from 'react';
import { TelemetryData, WellInfo } from '../types';
import { Flame, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { requestCSSOptimization } from '../services/apiClient';

interface CSSOptimizationPageProps {
  well: WellInfo;
  telemetry: TelemetryData;
}

export const CSSOptimizationPage: React.FC<CSSOptimizationPageProps> = ({ well, telemetry }) => {
  const [steamVolInput, setSteamVolInput] = useState(2050);
  const [soakDaysInput, setSoakDaysInput] = useState(6);
  const [injDurationDaysInput, setInjDurationDaysInput] = useState(17);
  const [cutoffWaterCutInput, setCutoffWaterCutInput] = useState(82);

  const [optimizing, setOptimizing] = useState(false);
  const [applied, setApplied] = useState(false);

  const predictedAvgOilRate = Math.round((138 * (steamVolInput / 1920) * (soakDaysInput === 6 ? 1.05 : 0.98)) * 10) / 10;
  const predictedCumulativeOil = Math.round(predictedAvgOilRate * (90 - injDurationDaysInput - soakDaysInput) * 0.94);
  const predictedSOR = Math.round((steamVolInput * 6.29 / Math.max(1, predictedCumulativeOil)) * 100) / 100;

  const handleRunOptimization = async () => {
    setOptimizing(true);
    setApplied(false);
    await requestCSSOptimization(well.currentCycle + 1, telemetry.reservoirTempC);
    setTimeout(() => {
      setOptimizing(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* CSS Cycle Overview & Horizontal Process Timeline */}
      <div className="bg-white border border-app-border rounded-lg p-6">
        <div className="flex items-center justify-between border-b border-app-border pb-3 mb-4">
          <div>
            <span className="text-sm font-semibold text-app-text tracking-tight flex items-center gap-2">
              <Flame className="w-4 h-4 text-app-steam" />
              CSS Cycle Overview & Operational Pipeline
            </span>
            <div className="text-xs text-app-muted">
              Well {well.id} | Jodhpur Sandstone Thermal Recovery
            </div>
          </div>

          <div className="text-xs text-app-muted">
            Active Cycle: <span className="text-app-text font-semibold">Cycle {well.currentCycle}</span> (Day {well.stageDay}/{well.stageTotalDays})
          </div>
        </div>

        {/* 3-Stage Process Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stage 1: Steam Injection */}
          <div className={`p-4 rounded-lg border transition-all ${
            well.currentStage === 'INJECTION'
              ? 'bg-app-softSteam border-[#FED7AA]'
              : 'bg-white border-app-border'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-app-text uppercase tracking-wide">1. Steam Injection</span>
              {well.currentStage === 'INJECTION' && (
                <span className="px-2 py-0.5 rounded bg-app-steam text-white text-[11px] font-medium">Active</span>
              )}
            </div>
            <p className="text-xs leading-relaxed text-app-muted">
              High-pressure superheated steam (80% quality, 1,420 psi) is injected through thermal packer to liquefy heavy crude and heat the rock matrix.
            </p>
            <div className="mt-3 pt-2 border-t border-app-border flex justify-between text-xs text-app-muted">
              <span>Standard Window:</span>
              <span className="text-app-text font-medium">14 - 18 Days</span>
            </div>
          </div>

          {/* Stage 2: Thermal Soaking */}
          <div className={`p-4 rounded-lg border transition-all ${
            well.currentStage === 'SOAKING'
              ? 'bg-app-softAmber border-[#FEEBAA]'
              : 'bg-white border-app-border'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-app-text uppercase tracking-wide">2. Thermal Soaking</span>
              {well.currentStage === 'SOAKING' && (
                <span className="px-2 py-0.5 rounded bg-app-amber text-white text-[11px] font-medium">Active</span>
              )}
            </div>
            <p className="text-xs leading-relaxed text-app-muted">
              Wellbore shut-in allows thermal energy to conduct radially into surrounding formation, expanding mobility radius while condensing steam into hot water bank.
            </p>
            <div className="mt-3 pt-2 border-t border-app-border flex justify-between text-xs text-app-muted">
              <span>Standard Window:</span>
              <span className="text-app-text font-medium">5 - 7 Days</span>
            </div>
          </div>

          {/* Stage 3: Production */}
          <div className={`p-4 rounded-lg border transition-all ${
            well.currentStage === 'PRODUCTION'
              ? 'bg-app-softGreen border-[#D5EFE1]'
              : 'bg-white border-app-border'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-app-text uppercase tracking-wide">3. Production (SRP Lifting)</span>
              {well.currentStage === 'PRODUCTION' && (
                <span className="px-2 py-0.5 rounded bg-app-green text-white text-[11px] font-medium">Active</span>
              )}
            </div>
            <p className="text-xs leading-relaxed text-app-muted">
              Sucker Rod Pump placed on production. High initial oil flow gradually declines as near-wellbore heat dissipates into overburden shales.
            </p>
            <div className="mt-3 pt-2 border-t border-app-border flex justify-between text-xs text-app-muted">
              <span>Standard Window:</span>
              <span className="text-app-text font-medium">70 - 90 Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Operating Condition & Explainable Engineering Reason */}
      <div className="bg-white border border-app-border rounded-lg p-6 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-app-border pb-3">
          <div>
            <span className="text-sm font-semibold text-app-text tracking-tight">
              Operating Recommendation: Recommended CSS Cycle
            </span>
            <div className="text-xs text-app-muted">
              Cycle {well.currentCycle + 1} Turn-Around | Thermal heat balance & SRP downstroke rod-float limits
            </div>
          </div>

          <button
            onClick={handleRunOptimization}
            disabled={optimizing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-app-border text-app-text text-xs font-medium hover:bg-app-bg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${optimizing ? 'animate-spin' : ''}`} />
            {optimizing ? 'Recalculating...' : 'Recalculate Limits'}
          </button>
        </div>

        {/* Reason Box */}
        <div className="bg-app-bg p-4 rounded-lg border border-app-border text-xs leading-relaxed">
          <div className="flex items-center gap-1.5 text-app-text font-semibold mb-1">
            <AlertCircle className="w-4 h-4 text-app-steam" />
            <span>Reason</span>
          </div>
          <div className="text-app-muted space-y-1.5 pl-5">
            <p>
              Near-wellbore reservoir temperature has cooled from peak levels to <strong className="text-app-text">{telemetry.reservoirTempC} °C</strong>, which increases estimated in-situ crude viscosity to <strong className="text-app-text">{telemetry.estimatedViscosityCP} cP</strong>.
            </p>
            <p>
              As viscosity exceeds 1,200 cP, downstroke viscous drag on the rod string reaches <strong className="text-app-amber">{3340 - telemetry.rodFloatMarginLbs} lbs</strong>, leaving only <strong className="text-app-amber">{telemetry.rodFloatMarginLbs} lbs</strong> of downward buoyant margin.
            </p>
            <p>
              The proposed steam volume of <strong className="text-app-text">2,050 tonnes</strong> with a <strong className="text-app-text">6-day thermal soak</strong> is expected to improve crude mobility while limiting additional steam consumption.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison: CURRENT vs RECOMMENDED */}
      <div className="bg-white border border-app-border rounded-lg p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-app-border pb-3">
          <div>
            <span className="text-sm font-semibold text-app-text tracking-tight">
              Cycle Parameter Comparison: Current vs Proposed
            </span>
            <div className="text-xs text-app-muted">
              Parameter | Current | Proposed | Expected Effect
            </div>
          </div>

          <button
            onClick={() => setApplied(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              applied
                ? 'bg-app-softGreen text-app-green border border-[#D5EFE1]'
                : 'bg-app-navy text-white hover:bg-app-navyDark'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            {applied ? 'Applied to Schedule' : 'Apply Recommendation'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-app-bg border-b border-app-border text-app-text text-left">
                <th className="py-2.5 px-3 font-semibold">Operating Parameter</th>
                <th className="py-2.5 px-3 font-semibold">Current (Cycle {well.currentCycle})</th>
                <th className="py-2.5 px-3 font-semibold text-app-navy">Proposed (Cycle {well.currentCycle + 1})</th>
                <th className="py-2.5 px-3 font-semibold">Expected Effect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border">
              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-2 px-3 text-app-text font-medium">Steam Volume</td>
                <td className="py-2 px-3 text-app-muted">1,920 tonnes</td>
                <td className="py-2 px-3 text-app-navy font-semibold">{steamVolInput} tonnes</td>
                <td className="py-2 px-3 text-app-muted">+6.8% thermal radius penetration into cold reservoir matrix</td>
              </tr>
              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-2 px-3 text-app-text font-medium">Injection Pressure</td>
                <td className="py-2 px-3 text-app-muted">1,420 psi</td>
                <td className="py-2 px-3 text-app-navy font-semibold">1,460 psi</td>
                <td className="py-2 px-3 text-app-muted">Maintains injection rate below formation breakdown gradient</td>
              </tr>
              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-2 px-3 text-app-text font-medium">Soak Duration</td>
                <td className="py-2 px-3 text-app-muted">5 days</td>
                <td className="py-2 px-3 text-app-navy font-semibold">{soakDaysInput} days</td>
                <td className="py-2 px-3 text-app-muted">Ensures uniform heat conduction while limiting overburden heat loss</td>
              </tr>
              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-2 px-3 text-app-text font-medium">Production Cut-Off</td>
                <td className="py-2 px-3 text-app-muted">85% Water Cut</td>
                <td className="py-2 px-3 text-app-navy font-semibold">{cutoffWaterCutInput}% Water Cut</td>
                <td className="py-2 px-3 text-app-muted">Optimizes net oil recovery before high steam condensation lifting</td>
              </tr>
              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-2 px-3 text-app-text font-semibold">Predicted Peak Rate</td>
                <td className="py-2 px-3 text-app-muted">226 bbl/day</td>
                <td className="py-2 px-3 text-app-blue font-bold">{Math.round(predictedAvgOilRate * 1.6)} bbl/day</td>
                <td className="py-2 px-3 text-app-muted">+9.7% peak rate following soak</td>
              </tr>
              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-2 px-3 text-app-text font-semibold">Expected Specific SOR</td>
                <td className="py-2 px-3 text-app-muted">3.42 bbl/bbl</td>
                <td className="py-2 px-3 text-app-green font-bold">{predictedSOR} bbl/bbl</td>
                <td className="py-2 px-3 text-app-muted">Maintains high thermal efficiency within EOR commercial targets</td>
              </tr>
              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-2 px-3 text-app-text font-semibold">Downstroke Rod Drag</td>
                <td className="py-2 px-3 text-app-amber">{3340 - telemetry.rodFloatMarginLbs} lbs</td>
                <td className="py-2 px-3 text-app-green font-bold">1,120 lbs</td>
                <td className="py-2 px-3 text-app-muted">62% reduction in rod drag; eliminates compressive buckling risk</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Clean Parameter Controls */}
      <div className="bg-white border border-app-border rounded-lg p-6">
        <div className="text-xs font-semibold text-app-text uppercase tracking-wider mb-4">
          Adjust Next Cycle Parameters
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 text-xs">
          <div className="bg-app-bg p-4 rounded-lg border border-app-border">
            <div className="flex justify-between text-app-text mb-1 font-medium">
              <span>Steam Volume:</span>
              <span className="font-semibold text-app-steam">{steamVolInput} t</span>
            </div>
            <input
              type="range"
              min="1400"
              max="2600"
              step="50"
              value={steamVolInput}
              onChange={(e) => setSteamVolInput(Number(e.target.value))}
              className="w-full accent-app-navy cursor-pointer mt-1"
            />
            <div className="flex justify-between text-[11px] text-app-muted mt-1">
              <span>1,400 t</span>
              <span>2,600 t</span>
            </div>
          </div>

          <div className="bg-app-bg p-4 rounded-lg border border-app-border">
            <div className="flex justify-between text-app-text mb-1 font-medium">
              <span>Soak Duration:</span>
              <span className="font-semibold text-app-navy">{soakDaysInput} days</span>
            </div>
            <input
              type="range"
              min="3"
              max="10"
              step="1"
              value={soakDaysInput}
              onChange={(e) => setSoakDaysInput(Number(e.target.value))}
              className="w-full accent-app-navy cursor-pointer mt-1"
            />
            <div className="flex justify-between text-[11px] text-app-muted mt-1">
              <span>3 d</span>
              <span>10 d</span>
            </div>
          </div>

          <div className="bg-app-bg p-4 rounded-lg border border-app-border">
            <div className="flex justify-between text-app-text mb-1 font-medium">
              <span>Injection Duration:</span>
              <span className="font-semibold text-app-navy">{injDurationDaysInput} days</span>
            </div>
            <input
              type="range"
              min="10"
              max="24"
              step="1"
              value={injDurationDaysInput}
              onChange={(e) => setInjDurationDaysInput(Number(e.target.value))}
              className="w-full accent-app-navy cursor-pointer mt-1"
            />
            <div className="flex justify-between text-[11px] text-app-muted mt-1">
              <span>10 d</span>
              <span>24 d</span>
            </div>
          </div>

          <div className="bg-app-bg p-4 rounded-lg border border-app-border">
            <div className="flex justify-between text-app-text mb-1 font-medium">
              <span>Cut-Off Water Cut:</span>
              <span className="font-semibold text-app-navy">{cutoffWaterCutInput}%</span>
            </div>
            <input
              type="range"
              min="70"
              max="90"
              step="1"
              value={cutoffWaterCutInput}
              onChange={(e) => setCutoffWaterCutInput(Number(e.target.value))}
              className="w-full accent-app-navy cursor-pointer mt-1"
            />
            <div className="flex justify-between text-[11px] text-app-muted mt-1">
              <span>70%</span>
              <span>90%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
