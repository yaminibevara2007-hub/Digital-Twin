import React, { useState } from 'react';
import { SimulationScenario, TelemetryData, WellInfo } from '../types';
import { getDefaultScenarios } from '../services/mockDataService';
import { simulateScenarioPhysics } from '../services/petroPhysics';
import { ScenarioComparison } from '../components/ScenarioComparison';
import { requestSimulationRun } from '../services/apiClient';
import { SlidersHorizontal, Play, CheckCircle2, RotateCcw } from 'lucide-react';

interface WhatIfSimulationPageProps {
  well: WellInfo;
  telemetry: TelemetryData;
}

export const WhatIfSimulationPage: React.FC<WhatIfSimulationPageProps> = ({ well, telemetry }) => {
  const [scenarios, setScenarios] = useState<SimulationScenario[]>(getDefaultScenarios());
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(scenarios[1].id);

  const [customName, setCustomName] = useState('Custom Test Run');
  const [steamVolume, setSteamVolume] = useState(2000);
  const [injectionPressure, setInjectionPressure] = useState(1440);
  const [injectionDuration, setInjectionDuration] = useState(16);
  const [soakDays, setSoakDays] = useState(6);
  const [cutoffWaterCut, setCutoffWaterCut] = useState(85);
  const [strokeLength, setStrokeLength] = useState(100);
  const [spm, setSpm] = useState(4.4);
  const [vfdHz, setVfdHz] = useState(36.6);

  const [simulating, setSimulating] = useState(false);
  const [appliedFeedback, setAppliedFeedback] = useState<string | null>(null);

  const handleRunSimulation = async () => {
    setSimulating(true);
    const backendResult = await requestSimulationRun({
      scenarioName: customName,
      steamVolumeTonnes: steamVolume,
      injectionPressurePsi: injectionPressure,
      injectionDurationDays: injectionDuration,
      soakDays: soakDays,
      productionCutoffWaterCutPct: cutoffWaterCut,
      srpStrokeLengthInches: strokeLength,
      srpSPM: spm,
      vfdFrequencyHz: vfdHz,
    });

    const newScenario = simulateScenarioPhysics({
      steamVolumeTonnes: steamVolume,
      injectionPressurePsi: injectionPressure,
      injectionDurationDays: injectionDuration,
      soakDays: soakDays,
      productionCutoffWaterCutPct: cutoffWaterCut,
      srpStrokeLengthInches: strokeLength,
      srpSPM: spm,
      vfdFrequencyHz: vfdHz,
    }, customName);

    if (backendResult) {
      newScenario.predictedAvgOilRateBOPD = backendResult.predictedAvgOilRateBOPD;
      newScenario.predictedPeakTempC = backendResult.predictedPeakTempC;
      newScenario.predictedSOR = backendResult.predictedSOR;
    }

    setScenarios((prev) => [...prev, newScenario]);
    setSelectedScenarioId(newScenario.id);
    setTimeout(() => {
      setSimulating(false);
    }, 400);
  };

  const handleApplyScenario = (scenario: SimulationScenario) => {
    setAppliedFeedback(`Scenario "${scenario.name}" successfully configured for well ${well.id}. Target parameters scheduled in control queue.`);
    setTimeout(() => {
      setAppliedFeedback(null);
    }, 4500);
  };

  const handleResetDefaults = () => {
    setScenarios(getDefaultScenarios());
    setSelectedScenarioId(getDefaultScenarios()[1].id);
  };

  return (
    <div className="space-y-6">
      {/* Header Notice */}
      <div className="bg-white border border-app-border rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-sm font-semibold text-app-text tracking-tight flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-app-blue" />
            What-If Operational Scenario Simulator
          </span>
          <div className="text-xs text-app-muted mt-1 max-w-3xl leading-relaxed">
            Simulate the coupled effects of varying cyclic steam stimulation parameters and sucker rod pumping speeds. Predictions evaluate thermal penetration, fluid mobility, standing valve fillage, downstroke rod-float margin, and life-cycle SOR.
          </div>
        </div>

        <button
          onClick={handleResetDefaults}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-app-border text-app-muted hover:text-app-text text-xs font-medium hover:bg-app-bg transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Baseline
        </button>
      </div>

      {appliedFeedback && (
        <div className="bg-app-softGreen border border-[#D5EFE1] p-3.5 rounded-lg text-xs text-app-green flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-app-green" />
          <span className="font-medium">{appliedFeedback}</span>
        </div>
      )}

      {/* Simulator Control Board: Left Controls, Right Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Parameter Controls (8 Cols) */}
        <div className="lg:col-span-8 bg-white border border-app-border rounded-lg p-6">
          <div className="flex items-center justify-between border-b border-app-border pb-3 mb-4">
            <div>
              <span className="text-xs font-semibold text-app-text uppercase tracking-wider">
                Scenario Parameter Inputs
              </span>
              <div className="text-xs text-app-muted">
                Tune reservoir steam injection and mechanical SRP variables simultaneously
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="bg-app-bg border border-app-border text-app-text text-xs rounded-md px-2.5 py-1.5 focus:outline-none focus:border-app-navy w-44"
                placeholder="Scenario Name..."
              />
              <button
                onClick={handleRunSimulation}
                disabled={simulating}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-app-navy text-white text-xs font-medium hover:bg-app-navyDark transition-colors disabled:opacity-50"
              >
                <Play className={`w-3.5 h-3.5 fill-current ${simulating ? 'animate-spin' : ''}`} />
                {simulating ? 'Computing...' : 'Run Simulation'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Steam Volume */}
            <div className="bg-app-bg p-3.5 rounded border border-app-border">
              <div className="flex justify-between text-app-text mb-1 font-medium">
                <span>Steam Volume:</span>
                <span className="font-semibold text-app-steam">{steamVolume} t</span>
              </div>
              <input
                type="range"
                min="1200"
                max="2800"
                step="50"
                value={steamVolume}
                onChange={(e) => setSteamVolume(Number(e.target.value))}
                className="w-full accent-app-navy cursor-pointer mt-1"
              />
              <div className="flex justify-between text-[11px] text-app-muted mt-1">
                <span>1,200 t</span>
                <span>2,800 t</span>
              </div>
            </div>

            {/* Injection Pressure */}
            <div className="bg-app-bg p-3.5 rounded border border-app-border">
              <div className="flex justify-between text-app-text mb-1 font-medium">
                <span>Injection Pressure:</span>
                <span className="font-semibold text-app-text">{injectionPressure} psi</span>
              </div>
              <input
                type="range"
                min="1200"
                max="1650"
                step="10"
                value={injectionPressure}
                onChange={(e) => setInjectionPressure(Number(e.target.value))}
                className="w-full accent-app-navy cursor-pointer mt-1"
              />
              <div className="flex justify-between text-[11px] text-app-muted mt-1">
                <span>1,200 psi</span>
                <span>1,650 psi</span>
              </div>
            </div>

            {/* Soak Duration */}
            <div className="bg-app-bg p-3.5 rounded border border-app-border">
              <div className="flex justify-between text-app-text mb-1 font-medium">
                <span>Soak Duration:</span>
                <span className="font-semibold text-app-text">{soakDays} days</span>
              </div>
              <input
                type="range"
                min="3"
                max="12"
                step="1"
                value={soakDays}
                onChange={(e) => setSoakDays(Number(e.target.value))}
                className="w-full accent-app-navy cursor-pointer mt-1"
              />
              <div className="flex justify-between text-[11px] text-app-muted mt-1">
                <span>3 d</span>
                <span>12 d</span>
              </div>
            </div>

            {/* SRP Speed */}
            <div className="bg-app-bg p-3.5 rounded border border-app-border">
              <div className="flex justify-between text-app-text mb-1 font-medium">
                <span>SRP Speed:</span>
                <span className="font-semibold text-app-navy">{spm} SPM</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="6.5"
                step="0.2"
                value={spm}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSpm(val);
                  setVfdHz(Math.round((val / 6.0) * 50 * 10) / 10);
                }}
                className="w-full accent-app-navy cursor-pointer mt-1"
              />
              <div className="flex justify-between text-[11px] text-app-muted mt-1">
                <span>2.0 SPM</span>
                <span>6.5 SPM</span>
              </div>
            </div>

            {/* Stroke Length */}
            <div className="bg-app-bg p-3.5 rounded border border-app-border">
              <div className="flex justify-between text-app-text mb-1 font-medium">
                <span>Stroke Length:</span>
                <span className="font-semibold text-app-navy">{strokeLength}"</span>
              </div>
              <input
                type="range"
                min="74"
                max="144"
                step="12"
                value={strokeLength}
                onChange={(e) => setStrokeLength(Number(e.target.value))}
                className="w-full accent-app-navy cursor-pointer mt-1"
              />
              <div className="flex justify-between text-[11px] text-app-muted mt-1">
                <span>74"</span>
                <span>144"</span>
              </div>
            </div>

            {/* VFD Frequency */}
            <div className="bg-app-bg p-3.5 rounded border border-app-border">
              <div className="flex justify-between text-app-text mb-1 font-medium">
                <span>VFD Frequency:</span>
                <span className="font-semibold text-app-navy">{vfdHz} Hz</span>
              </div>
              <input
                type="range"
                min="20"
                max="55"
                step="0.5"
                value={vfdHz}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setVfdHz(val);
                  setSpm(Math.round((val / 50) * 6.0 * 10) / 10);
                }}
                className="w-full accent-app-navy cursor-pointer mt-1"
              />
              <div className="flex justify-between text-[11px] text-app-muted mt-1">
                <span>20 Hz</span>
                <span>55 Hz</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Expected Results Summary (4 Cols) */}
        <div className="lg:col-span-4 bg-app-bg border border-app-border rounded-lg p-6 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-app-text uppercase tracking-wider mb-1">
              Expected Results Summary
            </div>
            <div className="text-xs text-app-muted mb-4">
              Instantaneous physical preview
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-white p-3 rounded border border-app-border flex justify-between items-center">
                <span className="text-app-muted">Oil Production:</span>
                <span className="text-app-green font-semibold">+14.2% vs Baseline</span>
              </div>

              <div className="bg-white p-3 rounded border border-app-border flex justify-between items-center">
                <span className="text-app-muted">Steam-Oil Ratio (SOR):</span>
                <span className="text-app-text font-medium">2.35 bbl/bbl</span>
              </div>

              <div className="bg-white p-3 rounded border border-app-border flex justify-between items-center">
                <span className="text-app-muted">Specific Energy:</span>
                <span className="text-app-text font-medium">-18% Lifting Draw</span>
              </div>

              <div className="bg-white p-3 rounded border border-app-border flex justify-between items-center">
                <span className="text-app-muted">Pump / Rod Risk:</span>
                <span className="text-app-green font-semibold">Low (Margin: 1,220 lbs)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-[11px] text-app-muted">
            Click 'Run Simulation' to append this scenario to the comparison matrix below.
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <ScenarioComparison
        scenarios={scenarios}
        selectedScenarioId={selectedScenarioId}
        onSelectScenario={setSelectedScenarioId}
        onApplyScenario={handleApplyScenario}
      />
    </div>
  );
};
