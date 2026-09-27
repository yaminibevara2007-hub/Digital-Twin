import React from 'react';
import { TelemetryData, WellInfo } from '../types';
import { ReservoirThermalSchematic } from '../components/ReservoirThermalSchematic';
import { Thermometer, ArrowRight } from 'lucide-react';
import { NavTab } from '../components/Sidebar';

interface ReservoirModelPageProps {
  well: WellInfo;
  telemetry: TelemetryData;
  onNavigate: (tab: NavTab) => void;
}

export const ReservoirModelPage: React.FC<ReservoirModelPageProps> = ({ well, telemetry, onNavigate }) => {
  return (
    <div className="space-y-4">
      {/* Intro Header */}
      <div className="scada-panel p-4 border-l-4 border-l-petro-orange bg-industrial-900/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-mono font-bold text-petro-orange uppercase tracking-wider flex items-center gap-1.5">
            <Thermometer className="w-4 h-4 text-petro-orange" />
            Reservoir Heating, Cooling & In-Situ Rheology Model
          </span>
          <div className="text-xs text-industrial-300 mt-1 max-w-3xl leading-relaxed">
            Models near-wellbore conductive thermal decay in Jodhpur Sandstone and its non-linear relationship with Baghewala crude dead oil viscosity. In-situ viscosity governs formation Darcy inflow and downstroke sucker rod mechanical drag.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('css_opt')}
            className="px-3 py-1.5 rounded bg-industrial-800 border border-industrial-700 text-industrial-200 text-xs font-mono hover:bg-industrial-750 transition-colors flex items-center gap-1.5"
          >
            Optimize CSS Turn-Around
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Reservoir Thermal Schematic */}
      <ReservoirThermalSchematic telemetry={telemetry} />
    </div>
  );
};
