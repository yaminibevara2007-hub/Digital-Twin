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
import { Wrench, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { requestSRPOptimization } from '../services/apiClient';

interface SRPOptimizationPageProps {
  well: WellInfo;
  telemetry: TelemetryData;
}

export const SRPOptimizationPage: React.FC<SRPOptimizationPageProps> = ({ well, telemetry }) => {
  const [targetSPM, setTargetSPM] = useState<number>(4.0);
  const [strokeInches, setStrokeInches] = useState<number>(telemetry.srpStrokeLengthInches);
  const [applied, setApplied] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  const currentViscosity = telemetry.estimatedViscosityCP;
  const calculatedFillage = calculatePumpFillagePct(currentViscosity, targetSPM, telemetry.bottomholePressurePsi);
  const calculatedOilRate = calculateOilRateBOPD(strokeInches, targetSPM, calculatedFillage, telemetry.waterCutPct);
  const { riskPct: calculatedFloatRisk, marginLbs: calculatedMargin } = evaluateRodFloatRisk(currentViscosity, targetSPM, strokeInches);
  const calculatedVFDHz = Math.round((targetSPM / 6.0) * 50 * 10) / 10;

  const dynoPoints = generateDynamometerCard(strokeInches, currentViscosity, targetSPM, calculatedFillage);

  const recommendedSPM = currentViscosity > 1200 ? 4.0 : currentViscosity > 400 ? 4.4 : 5.2;
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
    <div className="space-y-6">
      {/* Heavy Oil SRP Philosophy Banner */}
      <div className="bg-white border border-app-border rounded-lg p-6 flex flex-col gap-2">
        <div className="flex items-center justify-between border-b border-app-border pb-3">
          <span className="text-sm font-semibold text-app-text tracking-tight flex items-center gap-2">
            <Wrench className="w-4 h-4 text-app-blue" />
            Heavy Oil SRP Optimization: Fluid Mobility Matching
          </span>
          <span className="text-xs text-app-muted">
            Current Viscosity: <strong className="text-app-text">{currentViscosity} cP</strong>
          </span>
        </div>
        <p className="text-xs text-app-muted leading-relaxed">
          In high-viscosity thermal operations, the objective is not simply to maximize pump speed. Excessive operating speed when viscosity is high reduces standing-valve chamber fillage, induces severe downstroke viscous drag, and threatens rod-floating buckle failures. The target operating point balances fluid entry velocity with rod string downward terminal velocity.
        </p>
      </div>

      {/* Recommended SRP Setting & Explainable Reason */}
      <div className="bg-white border border-app-border rounded-lg p-6 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-app-border pb-3">
          <div>
            <span className="text-sm font-semibold text-app-text tracking-tight">
              Recommended SRP Setting
            </span>
            <div className="text-xs text-app-muted">
              Harmonized with in-situ reservoir temperature ({telemetry.reservoirTempC} °C)
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunEvaluation}
              disabled={evaluating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-app-border text-app-text text-xs font-medium hover:bg-app-bg transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${evaluating ? 'animate-spin' : ''}`} />
              Re-evaluate Envelopes
            </button>
            <button
              onClick={handleApplyRecommended}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                applied
                  ? 'bg-app-softGreen text-app-green border border-[#D5EFE1]'
                  : 'bg-app-navy text-white hover:bg-app-navyDark'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              {applied ? 'Target Setting Applied' : `Set to ${recommendedSPM} SPM`}
            </button>
          </div>
        </div>

        {/* Reason Box */}
        <div className="bg-app-bg p-4 rounded-lg border border-app-border text-xs leading-relaxed">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-app-text font-bold text-base font-mono">SPM: {recommendedSPM}</span>
            <span className="text-app-muted">|</span>
            <span className="text-app-text font-medium">VFD Frequency: {recommendedVFDHz} Hz</span>
            <span className="text-app-muted">|</span>
            <span className="text-app-muted">Stroke Length: 100"</span>
          </div>

          <div className="flex items-center gap-1.5 text-app-text font-semibold mb-1">
            <AlertCircle className="w-4 h-4 text-app-blue" />
            <span>Reason</span>
          </div>
          <div className="text-app-muted space-y-1 pl-5">
            <p>
              Estimated fluid viscosity has reached <strong className="text-app-text">{currentViscosity} cP</strong>. Current pumping speed of {telemetry.srpSPM} SPM causes downstroke viscous resistance to exceed 2,800 lbs against buoyant rod weight.
            </p>
            <p>
              A lower operating speed of <strong className="text-app-text">{recommendedSPM} SPM</strong> restores the buoyant downward margin to <strong className="text-app-text">1,240 lbs</strong>, improves standing-valve chamber fillage to <strong className="text-app-green">86%</strong>, and reduces unnecessary mechanical loading.
            </p>
          </div>
        </div>
      </div>

      {/* SPM Scenario Testing: Interactive SPM Selector & Evaluate Button */}
      <div className="bg-white border border-app-border rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-app-text uppercase tracking-wider">
            SPM Scenario Testing
          </span>
          <div className="text-xs text-app-muted mt-0.5">
            Select candidate pumping speed (3.5, 4.0, 4.5, 5.0 SPM) and evaluate dynamic pump performance.
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <div className="inline-flex rounded-md border border-app-border bg-app-bg p-1 gap-1" id="spm-selector">
            {[3.5, 4.0, 4.5, 5.0].map((spm) => (
              <button
                key={spm}
                id={`spm-option-${spm}`}
                type="button"
                onClick={() => {
                  setTargetSPM(spm);
                  setApplied(false);
                }}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  targetSPM === spm
                    ? 'bg-app-navy text-white shadow-sm'
                    : 'text-app-text hover:bg-white'
                }`}
              >
                {spm.toFixed(1)} SPM
              </button>
            ))}
          </div>

          <button
            id="evaluate-spm-btn"
            type="button"
            onClick={handleRunEvaluation}
            disabled={evaluating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-app-navy text-white hover:bg-app-navyDark text-xs font-medium transition-colors shadow-sm disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${evaluating ? 'animate-spin' : ''}`} />
            <span>{evaluating ? 'Evaluating...' : 'Evaluate'}</span>
          </button>
        </div>
      </div>

      {/* Dynamometer Card Display */}
      <DynamometerCard
        data={dynoPoints}
        strokeLengthInches={strokeInches}
        rodFloatRiskPct={calculatedFloatRisk}
        fillagePct={calculatedFillage}
      />

      {/* Engineering Controls: Sliders with Numerical Values */}
      <div className="bg-white border border-app-border rounded-lg p-6">
        <div className="flex items-center justify-between border-b border-app-border pb-3 mb-4">
          <span className="text-xs font-semibold text-app-text uppercase tracking-wider">
            Operational Parameter Controls & Safety Limits
          </span>
          <span className="text-xs text-app-muted">
            Safe Operating Limit: 2.0 to 6.5 SPM
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
          {/* SPM Slider */}
          <div className="bg-app-bg p-4 rounded-lg border border-app-border">
            <div className="flex justify-between text-app-text mb-1 font-medium">
              <span>Pumping Speed:</span>
              <span className="font-semibold text-app-navy">{targetSPM} SPM</span>
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
              className="w-full accent-app-navy cursor-pointer mt-1"
            />
            <div className="flex justify-between text-[11px] text-app-muted mt-1.5">
              <span>4.0</span>
              <span className="text-app-muted">Current: {telemetry.srpSPM}</span>
              <span>7.0</span>
            </div>
          </div>

          {/* Stroke Length */}
          <div className="bg-app-bg p-4 rounded-lg border border-app-border">
            <div className="flex justify-between text-app-text mb-1 font-medium">
              <span>Stroke Length:</span>
              <span className="font-semibold text-app-navy">{strokeInches}"</span>
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
              className="w-full accent-app-navy cursor-pointer mt-1"
            />
            <div className="flex justify-between text-[11px] text-app-muted mt-1.5">
              <span>74"</span>
              <span>144"</span>
            </div>
          </div>

          {/* VFD Frequency Readout */}
          <div className="bg-app-bg p-4 rounded-lg border border-app-border flex flex-col justify-between">
            <div className="text-[11px] text-app-muted uppercase font-medium">VFD Setting</div>
            <div className="text-lg font-bold text-app-text mt-1">{calculatedVFDHz} Hz</div>
            <div className="text-[11px] text-app-muted mt-1">40 HP Toshiba Inverter</div>
          </div>

          {/* Simulated Production & Float Risk */}
          <div className="bg-app-bg p-4 rounded-lg border border-app-border flex flex-col justify-between">
            <div className="text-[11px] text-app-muted uppercase font-medium">Simulated Production</div>
            <div className="text-lg font-bold text-app-text mt-1">{calculatedOilRate} bbl/day</div>
            <div className={`text-[11px] mt-1 font-medium ${calculatedFloatRisk > 60 ? 'text-app-amber' : 'text-app-green'}`}>
              Rod Float Risk: {calculatedFloatRisk}% (Margin: {calculatedMargin} lb)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
