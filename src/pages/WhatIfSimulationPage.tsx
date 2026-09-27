import React, { useState } from 'react';
import { SimulationScenario, TelemetryData, WellInfo } from '../types';
import { getDefaultScenarios } from '../services/mockDataService';
import { simulateScenarioPhysics } from '../services/petroPhysics';
import { ScenarioComparison } from '../components/ScenarioComparison';
import { requestSimulationRun } from '../services/apiClient';
import { SlidersHorizontal, Play, Plus, RefreshCw, CheckCircle2, RotateCcw } from 'lucide-react';

interface WhatIfSimulationPageProps {
  well: WellInfo;
  telemetry: TelemetryData;
}

export const WhatIfSimulationPage: React.FC<WhatIfSimulationPageProps> = ({ well, telemetry }) => {
  const [scenarios, setScenarios] = useState<SimulationScenario[]>(getDefaultScenarios());
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(scenarios[1].id); // Scenario A default

  // Custom Simulator Controls State
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
    // Call backend API if online
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

    // If backend provided result, augment
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
    <div className="space-y-4">
      {/* Introduction Banner */}
      <div className="scada-panel p-4 border-l-4 border-l-sky-500 bg-industrial-900/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4 text-sky-400" />
            Interactive Well-to-Surface What-If Scenario Simulator
          </span>
          <div className="text-xs text-industrial-300 mt-1 max-w-3xl leading-relaxed">
            Simulate the coupled effects of varying cyclic steam parameters and Sucker Rod Pump lifting speeds. All simulations evaluate thermal penetration, fluid mobility, standing valve fillage, downstroke rod-float margin, and life-cycle SOR.
          </div>
        </div>

        <button
          onClick={handleResetDefaults}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-industrial-800 border border-industrial-700 text-industrial-300 text-xs font-mono hover:bg-industrial-750 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Baseline Scenarios
        </button>
      </div>

      {appliedFeedback && (
        <div className="bg-emerald-950 border border-emerald-600 p-3 rounded text-xs font-mono text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{appliedFeedback}</span>
        </div>
      )}

      {/* Simulator Control Board */}
      <div className="scada-panel p-4">
        <div className="flex items-center justify-between border-b border-industrial-800 pb-2 mb-3">
          <div>
            <span className="text-xs font-mono font-bold text-industrial-100 uppercase tracking-wider">
              Simulation Scenario Parameter Inputs
            </span>
            <div className="text-[11px] font-mono text-industrial-400">
              Tune reservoir steam injection and mechanical SRP variables simultaneously
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="bg-industrial-950 border border-industrial-700 text-industrial-100 text-xs font-mono rounded px-2.5 py-1 focus:outline-none focus:border-sky-500 w-44"
              placeholder="Scenario Name..."
            />
            <button
              onClick={handleRunSimulation}
              disabled={simulating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-sky-950 border border-sky-600 text-sky-200 text-xs font-mono font-semibold hover:bg-sky-900 transition-colors disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 fill-current ${simulating ? 'animate-spin' : ''}`} />
              {simulating ? 'Computing Physics...' : 'Run Simulation'}
            </button>
          </div>
        </div>

        {/* Sliders Grid: CSS and SRP Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          {/* Steam Volume */}
          <div className="bg-industrial-950 p-2.5 rounded border border-industrial-800">
            <div className="flex justify-between text-industrial-400 mb-1">
              <span>Steam Volume:</span>
              <span className="text-petro-orange font-bold">{steamVolume} t</span>
            </div>
            <input
              type="range"
              min="1200"
              max="2800"
              step="50"
              value={steamVolume}
              onChange={(e) => setSteamVolume(Number(e.target.value))}
              className="w-full accent-petro-orange cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-industrial-500 mt-1">
              <span>1,200 t</span>
              <span>2,800 t</span>
            </div>
          </div>

          {/* Injection Pressure */}
          <div className="bg-industrial-950 p-2.5 rounded border border-industrial-800">
            <div className="flex justify-between text-industrial-400 mb-1">
              <span>Injection Pressure:</span>
              <span className="text-petro-orange font-bold">{injectionPressure} psi</span>
            </div>
            <input
              type="range"
              min="1200"
              max="1650"
              step="10"
              value={injectionPressure}
              onChange={(e) => setInjectionPressure(Number(e.target.value))}
              className="w-full accent-petro-orange cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-industrial-500 mt-1">
              <span>1,200 psi</span>
              <span>1,650 psi</span>
            </div>
          </div>

          {/* Soak Duration */}
          <div className="bg-industrial-950 p-2.5 rounded border border-industrial-800">
            <div className="flex justify-between text-industrial-400 mb-1">
              <span>Soak Duration:</span>
              <span className="text-petro-orange font-bold">{soakDays} days</span>
            </div>
            <input
              type="range"
              min="3"
              max="12"
              step="1"
              value={soakDays}
              onChange={(e) => setSoakDays(Number(e.target.value))}
              className="w-full accent-petro-orange cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-industrial-500 mt-1">
              <span>3 d</span>
              <span>12 d</span>
            </div>
          </div>

          {/* Water Cut Cutoff */}
          <div className="bg-industrial-950 p-2.5 rounded border border-industrial-800">
            <div className="flex justify-between text-industrial-400 mb-1">
              <span>Water Cut Cut-off:</span>
              <span className="text-petro-orange font-bold">{cutoffWaterCut}%</span>
            </div>
            <input
              type="range"
              min="70"
              max="92"
              step="1"
              value={cutoffWaterCut}
              onChange={(e) => setCutoffWaterCut(Number(e.target.value))}
              className="w-full accent-petro-orange cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-industrial-500 mt-1">
              <span>70%</span>
              <span>92%</span>
            </div>
          </div>

          {/* SRP SPM */}
          <div className="bg-industrial-950 p-2.5 rounded border border-industrial-800">
            <div className="flex justify-between text-industrial-400 mb-1">
              <span>SRP Speed:</span>
              <span className="text-sky-400 font-bold">{spm} SPM</span>
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
              className="w-full accent-sky-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-industrial-500 mt-1">
              <span>2.0 SPM</span>
              <span>6.5 SPM</span>
            </div>
          </div>

          {/* Stroke Length */}
          <div className="bg-industrial-950 p-2.5 rounded border border-industrial-800">
            <div className="flex justify-between text-industrial-400 mb-1">
              <span>Stroke Length:</span>
              <span className="text-sky-400 font-bold">{strokeLength}"</span>
            </div>
            <input
              type="range"
              min="74"
              max="144"
              step="12"
              value={strokeLength}
              onChange={(e) => setStrokeLength(Number(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-industrial-500 mt-1">
              <span>74"</span>
              <span>144"</span>
            </div>
          </div>

          {/* VFD Frequency */}
          <div className="bg-industrial-950 p-2.5 rounded border border-industrial-800">
            <div className="flex justify-between text-industrial-400 mb-1">
              <span>VFD Frequency:</span>
              <span className="text-sky-400 font-bold">{vfdHz} Hz</span>
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
              className="w-full accent-sky-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-industrial-500 mt-1">
              <span>20 Hz</span>
              <span>55 Hz</span>
            </div>
          </div>

          {/* Quick Result Summary */}
          <div className="bg-industrial-950 p-2.5 rounded border border-industrial-800 flex flex-col justify-between">
            <div className="text-[10px] text-industrial-400 uppercase">Input Status</div>
            <div className="text-xs font-semibold text-industrial-200">
              Coupled Model Ready
            </div>
            <div className="text-[10px] text-sky-400">
              Click 'Run Simulation' to append scenario
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Table Component */}
      <ScenarioComparison
        scenarios={scenarios}
        selectedScenarioId={selectedScenarioId}
        onSelectScenario={setSelectedScenarioId}
        onApplyScenario={handleApplyScenario}
      />
    </div>
  );
};
