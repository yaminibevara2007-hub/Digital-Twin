import React, { useState } from 'react';
import { TelemetryData, WellInfo } from '../types';
import { DynamometerCard } from '../components/DynamometerCard';
import { 
  generateDynamometerCard, 
  calculateRodDragLbs, 
  evaluateRodFloatRisk, 
  calculatePumpFillagePct, 
  calculateOilRateBOPD 
} from '../services/petroPhysics';
import { Wrench, Check, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { requestSRPOptimization } from '../services/apiClient';

interface SRPOptimizationPageProps {
  well: WellInfo;
  telemetry: TelemetryData;
}

export const SRPOptimizationPage: React.FC<SRPOptimizationPageProps> = ({ well, telemetry }) => {
  const [targetSPM, setTargetSPM] = useState<number>(telemetry.srpSPM);
  const [strokeInches, setStrokeInches] = useState<number>(telemetry.srpStrokeLengthInches);
  const [applied, setApplied] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  // Live recalculations based on current slider values
  const currentViscosity = telemetry.estimatedViscosityCP;
  const calculatedFillage = calculatePumpFillagePct(currentViscosity, targetSPM, telemetry.bottomholePressurePsi);
  const calculatedOilRate = calculateOilRateBOPD(strokeInches, targetSPM, calculatedFillage, telemetry.waterCutPct);
  const { riskPct: calculatedFloatRisk, marginLbs: calculatedMargin } = evaluateRodFloatRisk(currentViscosity, targetSPM, strokeInches);
  const calculatedDrag = calculateRodDragLbs(currentViscosity, targetSPM, strokeInches);
  const calculatedVFDHz = Math.round((targetSPM / 6.0) * 50 * 10) / 10;

  const dynoPoints = generateDynamometerCard(strokeInches, currentViscosity, targetSPM, calculatedFillage);

  // Recommended setting logic based on heavy oil viscosity
  const recommendedSPM = currentViscosity > 1200 ? 4.0 : currentViscosity > 400 ? 4.6 : 5.4;
  const recommendedVFDHz = Math.round((recommendedSPM / 6.0) * 50 * 10) / 10;

  const handleApplyRecommended = () => {
    setTargetSPM(recommendedSPM);
    setApplied(true);
  };

  const handleRunEvaluation = async () => {
    setEvaluating(true);
    await requestSRPOptimization(targetSPM, currentViscosity);
    setTimeout(() => {
      setEvaluating(false);
    }, 350);
  };

  return (
    <div className="space-y-4">
      {/* Heavy Oil SRP Philosophy Banner */}
      <div className="scada-panel p-4 border-l-4 border-l-sky-500 bg-industrial-900/90">
        <div className="flex items-center justify-between border-b border-industrial-800 pb-2 mb-2">
          <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
            <Wrench className="w-4 h-4 text-sky-400" />
            Heavy Oil SRP Optimization Principle: Fluid Mobility Matching
          </span>
          <span className="text-[11px] font-mono text-industrial-400">
            Current Viscosity: <strong className="text-industrial-100">{currentViscosity} cP</strong>
          </span>
        </div>
        <p className="text-xs text-industrial-300 leading-relaxed">
          In high-viscosity thermal operations, the objective is <strong>not</strong> to maximize surface strokes per minute. Operating at excessive speed when fluid viscosity is high creates severe standing valve choking (low fillage), massive downstroke rod drag, and rod-floating buckle failures. The optimum operating point maximizes net daily production by sustaining <strong>high pump fillage (&gt;80%)</strong> while maintaining rod tension.
        </p>
      </div>

      {/* Recommended SRP Setting & Explainable Reason */}
      <div className="scada-panel p-4 border-l-4 border-l-emerald-500">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
          <div>
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              Recommended SRP Setting
            </span>
            <div className="text-[11px] font-mono text-industrial-400">
              Harmonized with in-situ thermal condition ({telemetry.reservoirTempC} °C)
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunEvaluation}
              disabled={evaluating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-industrial-800 border border-industrial-700 text-industrial-200 text-xs font-mono hover:bg-industrial-750 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${evaluating ? 'animate-spin' : ''}`} />
              Re-evaluate Envelopes
            </button>
            <button
              onClick={handleApplyRecommended}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors ${
                applied
                  ? 'bg-emerald-950 border border-emerald-600 text-emerald-300'
                  : 'bg-sky-950 border border-sky-600 text-sky-200 hover:bg-sky-900'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              {applied ? 'Target Setting Applied' : `Set to ${recommendedSPM} SPM`}
            </button>
          </div>
        </div>

        {/* Explainable Rationale Box */}
        <div className="bg-industrial-950 p-3 rounded border border-industrial-800 text-xs leading-relaxed">
          <div className="flex items-baseline gap-2 mb-2 font-mono">
            <span className="text-emerald-400 font-bold text-base">SPM: {recommendedSPM}</span>
            <span className="text-industrial-400">|</span>
            <span className="text-industrial-300 font-semibold">VFD Frequency: {recommendedVFDHz} Hz</span>
            <span className="text-industrial-400">|</span>
            <span className="text-industrial-300">Stroke: 100"</span>
          </div>

          <div className="font-semibold text-industrial-200 mb-1 font-mono uppercase tracking-wider text-[11px]">
            Reason:
          </div>
          <div className="text-industrial-300 space-y-1">
            <p>
              Estimated fluid viscosity has reached <strong className="text-industrial-100">{currentViscosity} cP</strong>. Operating at higher speeds (&gt;5.0 SPM) causes the traveling valve to encounter severe viscous resistance on downstroke, dragging 2,800+ lbs against buoyant rod weight.
            </p>
            <p>
              Adjusting to <strong className="text-emerald-400">{recommendedSPM} SPM</strong> restores the buoyant downstroke margin to <strong className="text-emerald-400">1,240 lbs</strong>, improves standing-valve chamber fillage to <strong className="text-emerald-400">86%</strong>, and reduces unnecessary cyclic gearbox torque loading.
            </p>
          </div>
        </div>
      </div>

      {/* Dynamometer Card Display & Real-time Live SCADA */}
      <DynamometerCard
        data={dynoPoints}
        strokeLengthInches={strokeInches}
        rodFloatRiskPct={calculatedFloatRisk}
        fillagePct={calculatedFillage}
      />

      {/* Interactive SRP Parameter Controls & Operational Limits */}
      <div className="scada-panel p-4">
        <div className="text-xs font-mono font-bold text-industrial-200 uppercase tracking-wider mb-3 flex items-center justify-between">
          <span>Live SRP Speed & Stroke Adjustment</span>
          <span className="text-[11px] text-industrial-400 font-normal">
            Safe Operating Limit: 2.0 to 6.5 SPM
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          {/* SPM Slider */}
          <div className="bg-industrial-950 p-3 rounded border border-industrial-800">
            <div className="flex justify-between text-industrial-400 mb-1">
              <span>Pumping Speed:</span>
              <span className="text-sky-400 font-bold">{targetSPM} SPM</span>
            </div>
            <input
              type="range"
              min="2.0"
              max="6.5"
              step="0.2"
              value={targetSPM}
              onChange={(e) => {
                setTargetSPM(Number(e.target.value));
                setApplied(false);
              }}
              className="w-full accent-sky-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-industrial-500 mt-1">
              <span>Min: 2.0</span>
              <span>Max Safe: 6.5 SPM</span>
            </div>
          </div>

          {/* Stroke Length Slider */}
          <div className="bg-industrial-950 p-3 rounded border border-industrial-800">
            <div className="flex justify-between text-industrial-400 mb-1">
              <span>Stroke Length:</span>
              <span className="text-sky-400 font-bold">{strokeInches}"</span>
            </div>
            <input
              type="range"
              min="74"
              max="144"
              step="12"
              value={strokeInches}
              onChange={(e) => {
                setStrokeInches(Number(e.target.value));
                setApplied(false);
              }}
              className="w-full accent-sky-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-industrial-500 mt-1">
              <span>74"</span>
              <span>144"</span>
            </div>
          </div>

          {/* VFD Frequency Readout */}
          <div className="bg-industrial-950 p-3 rounded border border-industrial-800">
            <div className="text-[10px] text-industrial-400 uppercase">VFD Setting</div>
            <div className="text-industrial-100 font-bold text-sm mt-1">{calculatedVFDHz} Hz</div>
            <div className="text-[10px] text-industrial-500 mt-1">40 HP Toshiba Inverter</div>
          </div>

          {/* Resulting Production & Float Risk */}
          <div className="bg-industrial-950 p-3 rounded border border-industrial-800">
            <div className="text-[10px] text-industrial-400 uppercase">Simulated Production</div>
            <div className="text-emerald-400 font-bold text-sm mt-1">{calculatedOilRate} bbl/day</div>
            <div className={`text-[10px] mt-1 font-semibold ${calculatedFloatRisk > 60 ? 'text-amber-400' : 'text-emerald-400'}`}>
              Rod Float Risk: {calculatedFloatRisk}% (Margin: {calculatedMargin} lb)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
