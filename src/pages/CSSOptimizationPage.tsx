import React, { useState } from 'react';
import { TelemetryData, WellInfo } from '../types';
import { 
  Flame, 
  Check, 
  RefreshCw, 
  AlertCircle, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  Thermometer 
} from 'lucide-react';
import { requestSimulationRun } from '../services/apiClient';
import { 
  calculateViscosityCP, 
  calculateRodDragLbs, 
  evaluateRodFloatRisk, 
  calculatePumpFillagePct, 
  calculateOilRateBOPD 
} from '../services/petroPhysics';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

interface CSSOptimizationPageProps {
  well: WellInfo;
  telemetry: TelemetryData;
}

export const CSSOptimizationPage: React.FC<CSSOptimizationPageProps> = ({ well, telemetry }) => {
  // Input scenario controls
  const [steamVolInput, setSteamVolInput] = useState<number>(2050);
  const [injPressureInput, setInjPressureInput] = useState<number>(1460);
  const [soakDaysInput, setSoakDaysInput] = useState<number>(6);
  const [injDurationDaysInput, setInjDurationDaysInput] = useState<number>(17);
  const [cutoffWaterCutInput, setCutoffWaterCutInput] = useState<number>(82);

  const [optimizing, setOptimizing] = useState<boolean>(false);
  const [applied, setApplied] = useState<boolean>(false);
  const [lastRecalculatedAt, setLastRecalculatedAt] = useState<string | null>(null);

  // 1. Reservoir Thermal Response
  const specificHeatGain = (steamVolInput / 1800) * 165;
  const peakTempC = Math.round(Math.min(240, 42 + specificHeatGain));
  // Heat conservation factor during soaking (5-7 days optimal)
  const soakHeatConservation = Math.min(1.0, Math.max(0.70, 1.0 - (Math.abs(soakDaysInput - 5) * 0.04)));
  const proposedTempC = Math.round(42 + (peakTempC - 42) * 0.58 * soakHeatConservation);
  const heatGainC = proposedTempC - telemetry.reservoirTempC;
  const proposedRadiusM = Math.round((18.5 * Math.sqrt(steamVolInput / 1920) * (soakDaysInput >= 4 ? 1.0 : 0.92)) * 10) / 10;

  // 2. Temperature -> Viscosity Response (ASTM D341 Walther Model)
  const proposedViscosityCP = calculateViscosityCP(proposedTempC);

  // 3. CSS -> SRP Coupled Impact (Downhole Fluid Mobility, Drag, and Rod Fall Margin)
  const proposedFillagePct = calculatePumpFillagePct(proposedViscosityCP, telemetry.srpSPM, telemetry.bottomholePressurePsi);
  const proposedRodDrag = calculateRodDragLbs(proposedViscosityCP, telemetry.srpSPM, telemetry.srpStrokeLengthInches);
  const { riskPct: proposedFloatRisk, marginLbs: proposedMargin } = evaluateRodFloatRisk(
    proposedViscosityCP, 
    telemetry.srpSPM, 
    telemetry.srpStrokeLengthInches
  );

  // 4. Production & SOR Calculations
  // Post-soak initial water cut is low (~40%) before rising to cut-off
  const initialWaterCut = Math.max(35, Math.min(55, cutoffWaterCutInput * 0.5));
  const cycleAvgWaterCut = Math.round((initialWaterCut + cutoffWaterCutInput) / 2);
  const thermalMobilityBoost = 1.0 + (heatGainC > 0 ? (heatGainC / 100) * 0.35 : 0);
  
  const grossLiquidRate = 0.1166 * Math.pow(2.25, 2) * telemetry.srpStrokeLengthInches * telemetry.srpSPM * (proposedFillagePct / 100);
  const proposedPeakRate = Math.round(grossLiquidRate * (1 - initialWaterCut / 100) * thermalMobilityBoost);
  const proposedAvgOilRate = Math.round(grossLiquidRate * (1 - cycleAvgWaterCut / 100) * (thermalMobilityBoost * 0.72));
  
  const productionDays = Math.max(10, 90 - injDurationDaysInput - soakDaysInput);
  const proposedCumulativeOil = Math.round(proposedAvgOilRate * productionDays * 0.94);
  const proposedSOR = proposedCumulativeOil > 0 
    ? Math.round((steamVolInput * 6.29 / proposedCumulativeOil) * 100) / 100 
    : 0;

  // 5. Safety Constraint Checks
  const isOverPressure = injPressureInput > 1650;
  const isUnderSoaked = soakDaysInput < 4;
  const isWaterCutHigh = cutoffWaterCutInput > 88;
  const hasSafetyViolation = isOverPressure || isUnderSoaked || isWaterCutHigh;

  // Dynamic cycle trajectory for charts
  const trajectoryData = [
    { day: 'Day 0', temp: 42, visc: 22000, rate: 0, phase: 'Pre-Inj' },
    { day: `Day ${injDurationDaysInput}`, temp: peakTempC, visc: calculateViscosityCP(peakTempC), rate: 0, phase: 'Inj End' },
    { day: `Day ${injDurationDaysInput + soakDaysInput}`, temp: Math.round(peakTempC * 0.92), visc: calculateViscosityCP(peakTempC * 0.92), rate: proposedPeakRate, phase: 'Soak End' },
    { day: `Day ${injDurationDaysInput + soakDaysInput + 15}`, temp: Math.round(proposedTempC * 1.12), visc: calculateViscosityCP(proposedTempC * 1.12), rate: Math.round(proposedPeakRate * 0.82), phase: 'Early Puff' },
    { day: `Day ${injDurationDaysInput + soakDaysInput + 35}`, temp: proposedTempC, visc: proposedViscosityCP, rate: proposedAvgOilRate, phase: 'Mid Puff' },
    { day: `Day ${injDurationDaysInput + soakDaysInput + 55}`, temp: Math.round(proposedTempC * 0.86), visc: calculateViscosityCP(proposedTempC * 0.86), rate: Math.round(proposedAvgOilRate * 0.68), phase: 'Late Puff' },
    { day: 'Day 90', temp: Math.round(42 + (proposedTempC - 42) * 0.4), visc: calculateViscosityCP(42 + (proposedTempC - 42) * 0.4), rate: Math.round(proposedAvgOilRate * 0.38), phase: 'Cut-off' },
  ];

  // 6. Recalculate Limits Handler
  const handleRunOptimization = async () => {
    setOptimizing(true);
    setApplied(false);
    
    // Pass active scenario parameters to backend physics service
    await requestSimulationRun({
      scenarioName: `CSS Cycle ${well.currentCycle + 1} Candidate`,
      steamVolumeTonnes: steamVolInput,
      injectionPressurePsi: injPressureInput,
      injectionDurationDays: injDurationDaysInput,
      soakDays: soakDaysInput,
      productionCutoffWaterCutPct: cutoffWaterCutInput,
      srpStrokeLengthInches: telemetry.srpStrokeLengthInches,
      srpSPM: telemetry.srpSPM,
      vfdFrequencyHz: telemetry.vfdFrequencyHz,
    });

    setTimeout(() => {
      setOptimizing(false);
      setLastRecalculatedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 350);
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
              High-pressure superheated steam (80% quality, {injPressureInput} psi) is injected through thermal packer to liquefy heavy crude and heat the rock matrix.
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

      {/* Safety Constraint Warning (if violated) */}
      {hasSafetyViolation && (
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-app-amber flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-semibold text-app-amber uppercase tracking-wide">
              Operational Safety Limit Advisory
            </span>
            <div className="text-app-text leading-relaxed">
              {isOverPressure && (
                <p>• <strong>Injection Pressure ({injPressureInput} psi)</strong> exceeds the maximum safe limit (1,650 psi). High risk of caprock fracturing and annular steam blowouts.</p>
              )}
              {isUnderSoaked && (
                <p>• <strong>Soak Duration ({soakDaysInput} days)</strong> is below the 4-day minimum requirement. High risk of incomplete thermal conduction and hot fluid channeling.</p>
              )}
              {isWaterCutHigh && (
                <p>• <strong>Cut-Off Water Cut ({cutoffWaterCutInput}%)</strong> exceeds economic threshold (88%). Risk of lifting excessive condensed water at poor energy efficiency.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recommended Operating Condition & Explainable Engineering Reason */}
      <div className="bg-white border border-app-border rounded-lg p-6 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-app-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-app-text tracking-tight">
                Operating Recommendation: Recommended CSS Cycle
              </span>
              {!hasSafetyViolation ? (
                <span className="flex items-center gap-1 text-[11px] font-medium text-app-green bg-[#EBF7F0] border border-[#D5EFE1] px-2 py-0.5 rounded">
                  <ShieldCheck className="w-3 h-3" /> Constraints Met
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-medium text-app-amber bg-[#FFFBEB] border border-[#FDE68A] px-2 py-0.5 rounded">
                  <AlertTriangle className="w-3 h-3" /> Safety Review Needed
                </span>
              )}
            </div>
            <div className="text-xs text-app-muted mt-0.5">
              Cycle {well.currentCycle + 1} Turn-Around | Thermal heat balance & SRP downstroke rod-float limits
              {lastRecalculatedAt && ` · Recalculated at ${lastRecalculatedAt}`}
            </div>
          </div>

          <button
            id="recalculate-limits-btn"
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
            <span>Thermodynamic & Mechanical Rationale</span>
          </div>
          <div className="text-app-muted space-y-1.5 pl-5">
            <p>
              Current reservoir temperature is <strong className="text-app-text">{telemetry.reservoirTempC} °C</strong> with estimated in-situ crude viscosity of <strong className="text-app-text">{telemetry.estimatedViscosityCP} cP</strong>. Current downstroke viscous resistance is <strong className="text-app-amber">{3340 - telemetry.rodFloatMarginLbs} lbs</strong> (leaving {telemetry.rodFloatMarginLbs} lbs buoyant margin).
            </p>
            <p>
              The proposed steam volume of <strong className="text-app-text">{steamVolInput.toLocaleString()} tonnes</strong> with a <strong className="text-app-text">{soakDaysInput}-day thermal soak</strong> is predicted to elevate operating temperature to <strong className="text-app-navy">{proposedTempC} °C</strong> (+{heatGainC} °C over baseline), expanding thermal penetration to <strong className="text-app-navy">{proposedRadiusM} m</strong>.
            </p>
            <p>
              This thermal elevation lowers dynamic viscosity to <strong className="text-app-green">{proposedViscosityCP} cP</strong>, dropping downstroke rod drag to <strong className="text-app-green">{proposedRodDrag} lbs</strong> and expanding downward rod fall margin to <strong className="text-app-green">{proposedMargin} lbs</strong> ({proposedFloatRisk}% float risk) for safe SRP operation.
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic CSS Visualizations: Thermal/Viscosity & Production Decline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Reservoir Temperature & Viscosity Profile */}
        <div className="bg-white border border-app-border rounded-lg p-5">
          <div className="flex items-center justify-between border-b border-app-border pb-2.5 mb-3">
            <span className="text-xs font-semibold text-app-text uppercase tracking-wider flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-app-steam" />
              Thermal & Viscosity Response Trajectory
            </span>
            <span className="text-[11px] text-app-muted">
              Peak: {peakTempC} °C · Avg: {proposedTempC} °C
            </span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trajectoryData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#D9824B' }} domain={[20, 260]} unit="°C" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#64748B' }} scale="log" domain={[10, 30000]} unit=" cP" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', fontSize: '11px', borderRadius: '6px' }}
                  formatter={(val: any, name: any) => [
                    name === 'temp' ? `${val} °C` : `${val} cP`,
                    name === 'temp' ? 'Temperature' : 'Viscosity'
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line yAxisId="left" type="monotone" dataKey="temp" name="Temperature (°C)" stroke="#D9824B" strokeWidth={2} dot={{ r: 3 }} />
                <Line yAxisId="right" type="monotone" dataKey="visc" name="Viscosity (cP)" stroke="#183B56" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Production Lifecycle & Peak Flow */}
        <div className="bg-white border border-app-border rounded-lg p-5">
          <div className="flex items-center justify-between border-b border-app-border pb-2.5 mb-3">
            <span className="text-xs font-semibold text-app-text uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-app-green" />
              Predicted Oil Production Response
            </span>
            <span className="text-[11px] text-app-muted">
              Peak: {proposedPeakRate} bbl/d · SOR: {proposedSOR}
            </span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trajectoryData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#3D8B68' }} domain={[0, Math.max(300, proposedPeakRate + 50)]} unit=" b/d" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', fontSize: '11px', borderRadius: '6px' }}
                  formatter={(val: any) => [`${val} bbl/day`, 'Oil Rate']}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="rate" name="Oil Rate (bbl/day)" stroke="#3D8B68" strokeWidth={2} dot={{ r: 3 }} fill="#D5EFE1" />
              </LineChart>
            </ResponsiveContainer>
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
              Operating Parameter | Current | Proposed | Physical Expected Effect
            </div>
          </div>

          <button
            onClick={() => setApplied(true)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
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
                <th className="py-2.5 px-3 font-semibold">Expected Physical Effect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border">
              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-2 px-3 text-app-text font-medium">Steam Volume</td>
                <td className="py-2 px-3 text-app-muted">1,920 tonnes</td>
                <td className="py-2 px-3 text-app-navy font-semibold">{steamVolInput.toLocaleString()} tonnes</td>
                <td className="py-2 px-3 text-app-muted">Thermal energy input scaled to deliver conductive radial heat</td>
              </tr>
              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-2 px-3 text-app-text font-medium">Injection Pressure</td>
                <td className="py-2 px-3 text-app-muted">1,420 psi</td>
                <td className={`py-2 px-3 font-semibold ${isOverPressure ? 'text-app-amber font-bold' : 'text-app-navy'}`}>
                  {injPressureInput} psi {isOverPressure && '(Exceeds Limit!)'}
                </td>
                <td className="py-2 px-3 text-app-muted">
                  {isOverPressure ? 'Exceeds 1,650 psi safe limit; risks fracturing caprock' : 'Below 1,650 psi formation breakdown threshold'}
                </td>
              </tr>
              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-2 px-3 text-app-text font-medium">Soak Duration</td>
                <td className="py-2 px-3 text-app-muted">5 days</td>
                <td className={`py-2 px-3 font-semibold ${isUnderSoaked ? 'text-app-amber font-bold' : 'text-app-navy'}`}>
                  {soakDaysInput} days {isUnderSoaked && '(< 4d min)'}
                </td>
                <td className="py-2 px-3 text-app-muted">
                  {isUnderSoaked ? 'Sub-optimal soak; risk of steam channeling' : 'Ensures uniform heat conduction while limiting overburden losses'}
                </td>
              </tr>
              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-2 px-3 text-app-text font-medium">Production Cut-Off</td>
                <td className="py-2 px-3 text-app-muted">85% Water Cut</td>
                <td className="py-2 px-3 text-app-navy font-semibold">{cutoffWaterCutInput}% Water Cut</td>
                <td className="py-2 px-3 text-app-muted">Optimizes net oil recovery before high condensed water lifting</td>
              </tr>
              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-2 px-3 text-app-text font-medium">Reservoir Temperature</td>
                <td className="py-2 px-3 text-app-muted">{telemetry.reservoirTempC} °C</td>
                <td className="py-2 px-3 text-app-navy font-semibold">{proposedTempC} °C</td>
                <td className="py-2 px-3 text-app-muted">Net thermal elevation: +{heatGainC} °C across production lifecycle</td>
              </tr>
              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-2 px-3 text-app-text font-medium">Oil Viscosity (In-situ)</td>
                <td className="py-2 px-3 text-app-muted">{telemetry.estimatedViscosityCP} cP</td>
                <td className="py-2 px-3 text-app-green font-semibold">{proposedViscosityCP} cP</td>
                <td className="py-2 px-3 text-app-muted">Viscosity reduced by {Math.round((1 - proposedViscosityCP / telemetry.estimatedViscosityCP) * 100)}% via ASTM D341 thermal thinning</td>
              </tr>
              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-2 px-3 text-app-text font-medium">Thermal Penetration Radius</td>
                <td className="py-2 px-3 text-app-muted">{telemetry.thermalZoneRadiusMeters} m</td>
                <td className="py-2 px-3 text-app-navy font-semibold">{proposedRadiusM} m</td>
                <td className="py-2 px-3 text-app-muted">Radial expansion of heated zone away from wellbore</td>
              </tr>
              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-2 px-3 text-app-text font-semibold">Predicted Peak Rate</td>
                <td className="py-2 px-3 text-app-muted">226 bbl/day</td>
                <td className="py-2 px-3 text-app-blue font-bold">{proposedPeakRate} bbl/day</td>
                <td className="py-2 px-3 text-app-muted">Initial post-soak peak rate under improved mobility</td>
              </tr>
              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-2 px-3 text-app-text font-semibold">Expected Specific SOR</td>
                <td className="py-2 px-3 text-app-muted">3.42 bbl/bbl</td>
                <td className="py-2 px-3 text-app-green font-bold">{proposedSOR} bbl/bbl</td>
                <td className="py-2 px-3 text-app-muted">Steam-to-oil energy efficiency over {productionDays} production days</td>
              </tr>
              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-2 px-3 text-app-text font-semibold">Downstroke Rod Drag</td>
                <td className="py-2 px-3 text-app-amber">{3340 - telemetry.rodFloatMarginLbs} lbs</td>
                <td className="py-2 px-3 text-app-green font-bold">{proposedRodDrag} lbs</td>
                <td className="py-2 px-3 text-app-muted">Dynamic Couette-Poiseuille viscous resistance on rod string</td>
              </tr>
              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-2 px-3 text-app-text font-semibold">Rod Fall Margin (SRP)</td>
                <td className="py-2 px-3 text-app-muted">{telemetry.rodFloatMarginLbs} lbs</td>
                <td className={`py-2 px-3 font-bold ${proposedFloatRisk > 40 ? 'text-app-amber' : 'text-app-green'}`}>
                  {proposedMargin} lbs ({proposedFloatRisk}% Risk)
                </td>
                <td className="py-2 px-3 text-app-muted">Coupled SRP downward momentum margin against 3,340 lb buoyant weight</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Clean Parameter Controls (5 Sliders including Steam Injection Pressure) */}
      <div className="bg-white border border-app-border rounded-lg p-6">
        <div className="flex items-center justify-between border-b border-app-border pb-3 mb-4">
          <span className="text-xs font-semibold text-app-text uppercase tracking-wider">
            Adjust Next Cycle Parameters (Candidate Scenario)
          </span>
          <span className="text-xs text-app-muted">
            Safety Limits: Max Pressure 1,650 psi · Min Soak 4 days
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
          {/* 1. Steam Volume */}
          <div className="bg-app-bg p-4 rounded-lg border border-app-border">
            <div className="flex justify-between text-app-text mb-1 font-medium">
              <span>Steam Volume:</span>
              <span className="font-semibold text-app-steam">{steamVolInput.toLocaleString()} t</span>
            </div>
            <input
              id="slider-steam-volume"
              type="range"
              min="1400"
              max="2600"
              step="50"
              value={steamVolInput}
              onChange={(e) => {
                setSteamVolInput(Number(e.target.value));
                setApplied(false);
              }}
              className="w-full accent-app-navy cursor-pointer mt-1"
            />
            <div className="flex justify-between text-[11px] text-app-muted mt-1">
              <span>1,400 t</span>
              <span>2,600 t</span>
            </div>
          </div>

          {/* 2. Injection Pressure (Added Control!) */}
          <div className="bg-app-bg p-4 rounded-lg border border-app-border">
            <div className="flex justify-between text-app-text mb-1 font-medium">
              <span>Injection Pressure:</span>
              <span className={`font-semibold ${isOverPressure ? 'text-app-amber' : 'text-app-navy'}`}>
                {injPressureInput} psi
              </span>
            </div>
            <input
              id="slider-injection-pressure"
              type="range"
              min="1300"
              max="1700"
              step="10"
              value={injPressureInput}
              onChange={(e) => {
                setInjPressureInput(Number(e.target.value));
                setApplied(false);
              }}
              className="w-full accent-app-navy cursor-pointer mt-1"
            />
            <div className="flex justify-between text-[11px] text-app-muted mt-1">
              <span>1,300 psi</span>
              <span className="text-app-muted font-medium">Max: 1,650</span>
              <span>1,700 psi</span>
            </div>
          </div>

          {/* 3. Soak Duration */}
          <div className="bg-app-bg p-4 rounded-lg border border-app-border">
            <div className="flex justify-between text-app-text mb-1 font-medium">
              <span>Soak Duration:</span>
              <span className={`font-semibold ${isUnderSoaked ? 'text-app-amber' : 'text-app-navy'}`}>
                {soakDaysInput} days
              </span>
            </div>
            <input
              id="slider-soak-duration"
              type="range"
              min="3"
              max="10"
              step="1"
              value={soakDaysInput}
              onChange={(e) => {
                setSoakDaysInput(Number(e.target.value));
                setApplied(false);
              }}
              className="w-full accent-app-navy cursor-pointer mt-1"
            />
            <div className="flex justify-between text-[11px] text-app-muted mt-1">
              <span>3 d</span>
              <span className="text-app-muted font-medium">Min: 4 d</span>
              <span>10 d</span>
            </div>
          </div>

          {/* 4. Injection Duration */}
          <div className="bg-app-bg p-4 rounded-lg border border-app-border">
            <div className="flex justify-between text-app-text mb-1 font-medium">
              <span>Injection Duration:</span>
              <span className="font-semibold text-app-navy">{injDurationDaysInput} days</span>
            </div>
            <input
              id="slider-injection-duration"
              type="range"
              min="10"
              max="24"
              step="1"
              value={injDurationDaysInput}
              onChange={(e) => {
                setInjDurationDaysInput(Number(e.target.value));
                setApplied(false);
              }}
              className="w-full accent-app-navy cursor-pointer mt-1"
            />
            <div className="flex justify-between text-[11px] text-app-muted mt-1">
              <span>10 d</span>
              <span>24 d</span>
            </div>
          </div>

          {/* 5. Cut-Off Water Cut */}
          <div className="bg-app-bg p-4 rounded-lg border border-app-border">
            <div className="flex justify-between text-app-text mb-1 font-medium">
              <span>Cut-Off Water Cut:</span>
              <span className={`font-semibold ${isWaterCutHigh ? 'text-app-amber' : 'text-app-navy'}`}>
                {cutoffWaterCutInput}%
              </span>
            </div>
            <input
              id="slider-cutoff-watercut"
              type="range"
              min="70"
              max="90"
              step="1"
              value={cutoffWaterCutInput}
              onChange={(e) => {
                setCutoffWaterCutInput(Number(e.target.value));
                setApplied(false);
              }}
              className="w-full accent-app-navy cursor-pointer mt-1"
            />
            <div className="flex justify-between text-[11px] text-app-muted mt-1">
              <span>70%</span>
              <span className="text-app-muted font-medium">Eco: 88%</span>
              <span>90%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
