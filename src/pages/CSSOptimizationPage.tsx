import React, { useState } from 'react';
import { TelemetryData, WellInfo } from '../types';
import { Flame, Check, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';
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

  // Proposed/Recommended cycle calculations
  const heatGain = (steamVolInput / 1800) * 165;
  const predictedPeakTemp = Math.round(Math.min(252, 42 + heatGain));
  const predictedAvgOilRate = Math.round((138 * (steamVolInput / 1920) * (soakDaysInput === 6 ? 1.05 : 0.98)) * 10) / 10;
  const predictedCumulativeOil = Math.round(predictedAvgOilRate * (90 - injDurationDaysInput - soakDaysInput) * 0.94);
  const predictedSOR = Math.round((steamVolInput * 6.29 / Math.max(1, predictedCumulativeOil)) * 100) / 100;
  const predictedViscosity = Math.round(18000 * Math.exp(-0.024 * predictedPeakTemp));

  const handleRunOptimization = async () => {
    setOptimizing(true);
    setApplied(false);
    await requestCSSOptimization(well.currentCycle + 1, telemetry.reservoirTempC);
    setTimeout(() => {
      setOptimizing(false);
    }, 400);
  };

  return (
    <div className="space-y-4">
      {/* CSS Cycle Stage Architecture Indicator */}
      <div className="scada-panel p-4">
        <div className="flex items-center justify-between border-b border-industrial-800 pb-2 mb-3">
          <div>
            <span className="text-xs font-mono font-bold text-petro-orange uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-petro-orange" />
              Cyclic Steam Stimulation (CSS) Stage Architecture
            </span>
            <div className="text-[11px] font-mono text-industrial-400">
              Well {well.id} | Jodhpur Sandstone Thermal Recovery
            </div>
          </div>

          <div className="text-xs font-mono text-industrial-400">
            Active Cycle: <span className="text-petro-orange font-bold">Cycle {well.currentCycle}</span> (Day {well.stageDay}/{well.stageTotalDays})
          </div>
        </div>

        {/* 3-Stage Process Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Stage 1: Steam Injection */}
          <div className={`p-3 rounded border ${
            well.currentStage === 'INJECTION'
              ? 'bg-industrial-850 border-petro-orange text-industrial-100'
              : 'bg-industrial-950 border-industrial-800 text-industrial-400'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono font-bold uppercase">1. Steam Injection</span>
              {well.currentStage === 'INJECTION' && (
                <span className="px-1.5 py-0.5 rounded bg-petro-orange text-white text-[10px] font-mono font-bold">ACTIVE</span>
              )}
            </div>
            <p className="text-xs leading-relaxed text-industrial-300">
              High-pressure superheated steam (80% quality, 1,420 psi) is injected through thermal packer to liquefy heavy bitumen and heat rock matrix.
            </p>
            <div className="mt-2 pt-2 border-t border-industrial-800 text-[11px] font-mono flex justify-between">
              <span>Standard Window:</span>
              <span className="text-industrial-200">14 - 18 Days</span>
            </div>
          </div>

          {/* Stage 2: Soaking */}
          <div className={`p-3 rounded border ${
            well.currentStage === 'SOAKING'
              ? 'bg-industrial-850 border-amber-500 text-industrial-100'
              : 'bg-industrial-950 border-industrial-800 text-industrial-400'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono font-bold uppercase">2. Thermal Soaking</span>
              {well.currentStage === 'SOAKING' && (
                <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[10px] font-mono font-bold">ACTIVE</span>
              )}
            </div>
            <p className="text-xs leading-relaxed text-industrial-300">
              Wellbore shut-in allows thermal energy to conduct radially into surrounding formation, expanding mobility radius while condensing steam into hot water bank.
            </p>
            <div className="mt-2 pt-2 border-t border-industrial-800 text-[11px] font-mono flex justify-between">
              <span>Standard Window:</span>
              <span className="text-industrial-200">5 - 7 Days</span>
            </div>
          </div>

          {/* Stage 3: Production */}
          <div className={`p-3 rounded border ${
            well.currentStage === 'PRODUCTION'
              ? 'bg-industrial-850 border-emerald-500 text-industrial-100'
              : 'bg-industrial-950 border-industrial-800 text-industrial-400'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono font-bold uppercase">3. Production (SRP Lifting)</span>
              {well.currentStage === 'PRODUCTION' && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[10px] font-mono font-bold">ACTIVE</span>
              )}
            </div>
            <p className="text-xs leading-relaxed text-industrial-300">
              Sucker Rod Pump unseated and placed on production. High early oil flow gradually declines as near-wellbore heat dissipates into overburden.
            </p>
            <div className="mt-2 pt-2 border-t border-industrial-800 text-[11px] font-mono flex justify-between">
              <span>Standard Window:</span>
              <span className="text-industrial-200">70 - 90 Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Operating Condition & Explainable Engineering Rationale */}
      <div className="scada-panel p-4 border-l-4 border-l-petro-orange bg-industrial-900/90">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
          <div>
            <span className="text-xs font-mono font-bold text-petro-orange uppercase tracking-wider">
              Recommended Operating Condition: Cycle {well.currentCycle + 1} Turn-Around
            </span>
            <div className="text-[11px] font-mono text-industrial-400">
              Based on thermodynamic heat balance & SRP downstroke rod-float limits
            </div>
          </div>

          <button
            onClick={handleRunOptimization}
            disabled={optimizing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-industrial-800 border border-industrial-600 text-industrial-200 text-xs font-mono hover:bg-industrial-750 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${optimizing ? 'animate-spin' : ''}`} />
            {optimizing ? 'Recalculating...' : 'Recalculate Thermal Limits'}
          </button>
        </div>

        {/* Explainable Rationale Box */}
        <div className="bg-industrial-950 p-3 rounded border border-industrial-800 text-xs leading-relaxed">
          <div className="font-semibold text-industrial-200 mb-1 font-mono uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-petro-orange" />
            Reason:
          </div>
          <div className="text-industrial-300 space-y-1.5">
            <p>
              Near-wellbore reservoir temperature has cooled from its peak down to <strong className="text-industrial-100">{telemetry.reservoirTempC} °C</strong>, which increases estimated crude viscosity to <strong className="text-industrial-100">{telemetry.estimatedViscosityCP} cP</strong>.
            </p>
            <p>
              As viscosity exceeds 1,200 cP, downstroke viscous drag on the 3/4" rod string reaches <strong className="text-amber-300">{3340 - telemetry.rodFloatMarginLbs} lbs</strong>, leaving only <strong className="text-amber-300">{telemetry.rodFloatMarginLbs} lbs</strong> of downward buoyant margin (rod-float risk: <strong className="text-amber-300">{telemetry.rodFloatRiskPct}%</strong>).
            </p>
            <p>
              The proposed steam volume of <strong className="text-petro-orange">2,050 tonnes</strong> with a <strong className="text-petro-orange">6-day thermal soak</strong> will establish an 18.5-meter heated radius, lowering in-situ viscosity to 45 cP at production start and allowing safe SRP pumping at 4.2 SPM without rod float or fluid pound.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison: CURRENT vs PROPOSED */}
      <div className="scada-panel p-4">
        <div className="flex items-center justify-between border-b border-industrial-800 pb-2 mb-3">
          <div>
            <span className="text-xs font-mono font-bold text-industrial-200 uppercase tracking-wider">
              Operating Condition Comparison: Current vs Proposed Cycle
            </span>
            <div className="text-[11px] font-mono text-industrial-400">
              Parameter | Current | Proposed | Expected Effect
            </div>
          </div>

          <button
            onClick={() => setApplied(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors ${
              applied
                ? 'bg-emerald-950 border border-emerald-600 text-emerald-300'
                : 'bg-sky-950 border border-sky-600 text-sky-200 hover:bg-sky-900'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            {applied ? 'Recommendation Applied to Schedule' : 'Apply Proposed Recommendation'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-industrial-950 border-b border-industrial-800 text-industrial-400 text-left">
                <th className="py-2 px-3">Operating Parameter</th>
                <th className="py-2 px-3">Current (Cycle {well.currentCycle})</th>
                <th className="py-2 px-3 text-petro-orange">Proposed (Cycle {well.currentCycle + 1})</th>
                <th className="py-2 px-3">Expected Engineering Effect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-850">
              <tr>
                <td className="py-2 px-3 text-industrial-300">Steam Injection Volume</td>
                <td className="py-2 px-3 text-industrial-100">1,920 tonnes</td>
                <td className="py-2 px-3 text-petro-orange font-bold">{steamVolInput} tonnes</td>
                <td className="py-2 px-3 text-industrial-300">+6.8% thermal radius penetration into cold reservoir matrix</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-industrial-300">Injection Pressure</td>
                <td className="py-2 px-3 text-industrial-100">1,420 psi</td>
                <td className="py-2 px-3 text-petro-orange font-bold">1,460 psi</td>
                <td className="py-2 px-3 text-industrial-300">Maintains injection rate below fracture breakdown gradient (1,680 psi)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-industrial-300">Soak Period Duration</td>
                <td className="py-2 px-3 text-industrial-100">5 days</td>
                <td className="py-2 px-3 text-petro-orange font-bold">{soakDaysInput} days</td>
                <td className="py-2 px-3 text-industrial-300">Ensures uniform heat conduction while limiting overburden heat loss</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-industrial-300">Target Production Cut-Off</td>
                <td className="py-2 px-3 text-industrial-100">85% Water Cut</td>
                <td className="py-2 px-3 text-petro-orange font-bold">{cutoffWaterCutInput}% Water Cut</td>
                <td className="py-2 px-3 text-industrial-300">Optimizes net economic oil recovery before excessive steam condensation lift</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-industrial-300 font-semibold">Predicted Peak Production</td>
                <td className="py-2 px-3 text-industrial-100">226 bbl/day</td>
                <td className="py-2 px-3 text-sky-400 font-bold">{Math.round(predictedAvgOilRate * 1.6)} bbl/day</td>
                <td className="py-2 px-3 text-industrial-300">+9.7% peak rate following soak</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-industrial-300 font-semibold">Expected Specific SOR</td>
                <td className="py-2 px-3 text-industrial-100">3.42 bbl/bbl</td>
                <td className="py-2 px-3 text-emerald-400 font-bold">{predictedSOR} bbl/bbl</td>
                <td className="py-2 px-3 text-industrial-300">Maintains high thermal efficiency within commercial EOR benchmarks</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-industrial-300 font-semibold">Downstroke Rod Drag</td>
                <td className="py-2 px-3 text-amber-400">{3340 - telemetry.rodFloatMarginLbs} lbs</td>
                <td className="py-2 px-3 text-emerald-400 font-bold">1,120 lbs</td>
                <td className="py-2 px-3 text-industrial-300">62% reduction in rod drag; eliminates compressive buckling risk</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive CSS Control Sliders */}
      <div className="scada-panel p-4">
        <div className="text-xs font-mono font-bold text-industrial-200 uppercase tracking-wider mb-3">
          Interactive Parameter Calibration for Next Cycle
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-industrial-950 p-3 rounded border border-industrial-800">
            <div className="flex justify-between text-industrial-400 mb-1">
              <span>Steam Volume:</span>
              <span className="text-petro-orange font-bold">{steamVolInput} t</span>
            </div>
            <input
              type="range"
              min="1400"
              max="2600"
              step="50"
              value={steamVolInput}
              onChange={(e) => setSteamVolInput(Number(e.target.value))}
              className="w-full accent-petro-orange cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-industrial-500 mt-1">
              <span>1,400 t</span>
              <span>2,600 t</span>
            </div>
          </div>

          <div className="bg-industrial-950 p-3 rounded border border-industrial-800">
            <div className="flex justify-between text-industrial-400 mb-1">
              <span>Soak Duration:</span>
              <span className="text-petro-orange font-bold">{soakDaysInput} days</span>
            </div>
            <input
              type="range"
              min="3"
              max="10"
              step="1"
              value={soakDaysInput}
              onChange={(e) => setSoakDaysInput(Number(e.target.value))}
              className="w-full accent-petro-orange cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-industrial-500 mt-1">
              <span>3 d</span>
              <span>10 d</span>
            </div>
          </div>

          <div className="bg-industrial-950 p-3 rounded border border-industrial-800">
            <div className="flex justify-between text-industrial-400 mb-1">
              <span>Injection Duration:</span>
              <span className="text-petro-orange font-bold">{injDurationDaysInput} days</span>
            </div>
            <input
              type="range"
              min="10"
              max="24"
              step="1"
              value={injDurationDaysInput}
              onChange={(e) => setInjDurationDaysInput(Number(e.target.value))}
              className="w-full accent-petro-orange cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-industrial-500 mt-1">
              <span>10 d</span>
              <span>24 d</span>
            </div>
          </div>

          <div className="bg-industrial-950 p-3 rounded border border-industrial-800">
            <div className="flex justify-between text-industrial-400 mb-1">
              <span>Cut-Off Water Cut:</span>
              <span className="text-petro-orange font-bold">{cutoffWaterCutInput}%</span>
            </div>
            <input
              type="range"
              min="70"
              max="90"
              step="1"
              value={cutoffWaterCutInput}
              onChange={(e) => setCutoffWaterCutInput(Number(e.target.value))}
              className="w-full accent-petro-orange cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-industrial-500 mt-1">
              <span>70%</span>
              <span>90%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
