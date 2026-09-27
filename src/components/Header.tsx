import React, { useState } from 'react';
import { WellId } from '../types';
import { BAGHEWALA_WELLS } from '../services/mockDataService';
import { 
  Activity, 
  Clock, 
  User, 
  HelpCircle, 
  Server,
  Layers
} from 'lucide-react';

interface HeaderProps {
  currentWellId: WellId;
  onSelectWell: (wellId: WellId) => void;
  demoScenario: string;
  onSelectDemoScenario: (scenario: string) => void;
  backendOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentWellId,
  onSelectWell,
  demoScenario,
  onSelectDemoScenario,
  backendOnline,
}) => {
  const [showSyntheticInfo, setShowSyntheticInfo] = useState(false);
  const well = BAGHEWALA_WELLS[currentWellId];

  return (
    <header className="bg-industrial-900 border-b border-industrial-800 text-industrial-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 select-none">
      {/* Field Identification & Well Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-industrial-850 border border-industrial-700 flex items-center justify-center text-sky-400 font-mono font-bold text-sm">
            BW
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-white tracking-wide uppercase">
                Baghewala Field
              </h1>
              <span className="text-[11px] text-industrial-400 font-mono">
                Bikaner-Nagaur Basin | Rajasthan
              </span>
            </div>
            <div className="text-[11px] text-industrial-500 font-mono">
              Jodhpur Sandstone (Heavy Oil EOR Operations)
            </div>
          </div>
        </div>

        {/* Well Selector */}
        <div className="flex items-center gap-2 pl-3 border-l border-industrial-800">
          <label htmlFor="well-select" className="text-xs text-industrial-400 uppercase font-mono font-medium">
            Well:
          </label>
          <select
            id="well-select"
            value={currentWellId}
            onChange={(e) => onSelectWell(e.target.value as WellId)}
            className="bg-industrial-950 border border-industrial-700 text-industrial-100 text-xs font-mono font-semibold rounded px-2.5 py-1.5 focus:outline-none focus:border-sky-500"
          >
            <option value="BW-01">BW-01 (Producer, Cycle 4)</option>
            <option value="BW-04">BW-04 (Cooling / High Drag, Cycle 3)</option>
            <option value="BW-12">BW-12 (Steam Injection, Cycle 5)</option>
            <option value="BW-19">BW-19 (Soaking Phase, Cycle 2)</option>
          </select>

          {/* Operating Status Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-industrial-850 border border-industrial-700 font-mono text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                well.currentStage === 'PRODUCTION'
                  ? 'bg-emerald-400 telemetry-live'
                  : well.currentStage === 'INJECTION'
                  ? 'bg-petro-orange telemetry-live'
                  : 'bg-amber-400'
              }`}
            />
            <span className="text-industrial-300 font-medium">{well.currentStage}</span>
            <span className="text-industrial-500">|</span>
            <span className="text-industrial-400">
              Cycle {well.currentCycle} (Day {well.stageDay}/{well.stageTotalDays})
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls: Demo Mode, Synthetic Banner, SCADA Health, Operator */}
      <div className="flex items-center gap-3">
        {/* Preset Operational Scenarios for Demonstration */}
        <div className="flex items-center gap-1.5 bg-industrial-950/80 px-2 py-1 rounded border border-industrial-800">
          <Layers className="w-3.5 h-3.5 text-industrial-400" />
          <span className="text-[11px] font-mono text-industrial-400">Condition:</span>
          <select
            value={demoScenario}
            onChange={(e) => onSelectDemoScenario(e.target.value)}
            className="bg-transparent text-xs font-mono text-industrial-200 border-none focus:outline-none cursor-pointer"
          >
            <option value="DEFAULT" className="bg-industrial-900">Standard Baseline</option>
            <option value="RESERVOIR_COOLING" className="bg-industrial-900">Scenario: Reservoir Cooling Alert</option>
            <option value="ROD_FLOATING_RISK" className="bg-industrial-900">Scenario: Rod-Floating Risk</option>
            <option value="STEAM_CHANNELING" className="bg-industrial-900">Scenario: Steam Channeling Indication</option>
            <option value="OPTIMIZED_OPERATING" className="bg-industrial-900">Scenario: Optimized Operating Point</option>
          </select>
        </div>

        {/* Synthetic / Demo Data Watermark Badge */}
        <div className="relative">
          <button
            onClick={() => setShowSyntheticInfo(!showSyntheticInfo)}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-950/40 border border-amber-800/60 text-amber-300 text-[11px] font-mono hover:bg-amber-900/40 transition-colors"
            title="Click for synthetic physics calibration details"
          >
            <span className="font-semibold">DEMO / SYNTHETIC DATA</span>
            <HelpCircle className="w-3 h-3 text-amber-400" />
          </button>

          {showSyntheticInfo && (
            <div className="absolute right-0 top-9 w-80 bg-industrial-900 border border-industrial-700 shadow-2xl p-3 z-50 rounded text-xs text-industrial-300">
              <div className="font-semibold text-industrial-100 mb-1 border-b border-industrial-800 pb-1 flex justify-between">
                <span>Physics-Calibrated Synthetic Engine</span>
                <span className="text-[10px] text-industrial-400">Baghewala Analogue</span>
              </div>
              <p className="text-[11px] leading-relaxed mb-2 text-industrial-300">
                To respect field operational confidentiality while demonstrating authentic petroleum engineering dynamics, telemetry is computed using experimental heavy-oil rheology (18.5° API, Walther viscosity model, Sucker Rod downstroke drag vs buoyant string weight, and CSS thermal diffusion).
              </p>
              <div className="text-[10px] font-mono text-industrial-400 bg-industrial-950 p-1.5 rounded">
                Dead oil viscosity at 40°C: 22,000 cP | Jodhpur Sandstone
              </div>
            </div>
          )}
        </div>

        {/* Backend Connectivity Status */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-industrial-950 border border-industrial-800 text-[11px] font-mono">
          <Server className="w-3 h-3 text-industrial-400" />
          <span
            className={`w-1.5 h-1.5 rounded-full ${backendOnline ? 'bg-emerald-400' : 'bg-amber-400'}`}
          />
          <span className="text-industrial-300">
            {backendOnline ? 'FASTAPI API' : 'ENGINE COUPLING'}
          </span>
        </div>

        {/* Operator Profile & Timestamp */}
        <div className="flex items-center gap-3 pl-3 border-l border-industrial-800 text-xs">
          <div className="flex items-center gap-1.5 text-industrial-400">
            <Clock className="w-3.5 h-3.5 text-industrial-500" />
            <span className="font-mono text-industrial-300 text-[11px]">
              2026-09-27 20:49 IST
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-industrial-300 bg-industrial-850 px-2 py-1 rounded border border-industrial-700">
            <User className="w-3.5 h-3.5 text-industrial-400" />
            <span className="font-medium text-[11px]">P. Sharma (Sr. Prod Eng)</span>
          </div>
        </div>
      </div>
    </header>
  );
};
