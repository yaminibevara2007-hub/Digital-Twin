import { TelemetryData, WellInfo, NavTab } from '../types';
import { ReservoirThermalSchematic } from '../components/ReservoirThermalSchematic';
import { Thermometer, ArrowRight } from 'lucide-react';

interface ReservoirModelPageProps {
  well: WellInfo;
  telemetry: TelemetryData;
  onNavigate: (tab: NavTab) => void;
}

export const ReservoirModelPage: React.FC<ReservoirModelPageProps> = ({ well, telemetry, onNavigate }) => {
  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white border border-app-border rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-sm font-semibold text-app-text tracking-tight flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-app-steam" />
            Reservoir Heating, Cooling & In-Situ Rheology Model
          </span>
          <div className="text-xs text-app-muted mt-1 max-w-3xl leading-relaxed">
            Models near-wellbore conductive thermal decay in Jodhpur Sandstone and its non-linear relationship with Baghewala crude dead oil viscosity. In-situ viscosity governs formation Darcy inflow and downstroke sucker rod mechanical drag.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('css_opt')}
            className="px-3.5 py-2 rounded-md bg-white border border-app-border text-app-text text-xs font-medium hover:bg-app-bg transition-colors flex items-center gap-1.5"
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
