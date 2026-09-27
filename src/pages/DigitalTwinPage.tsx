import React from 'react';
import { TelemetryData, WellInfo } from '../types';
import { DigitalTwinDiagram } from '../components/DigitalTwinDiagram';
import { Share2, ArrowRight } from 'lucide-react';
import { NavTab } from '../components/Sidebar';

interface DigitalTwinPageProps {
  well: WellInfo;
  telemetry: TelemetryData;
  onNavigate: (tab: NavTab) => void;
}

export const DigitalTwinPage: React.FC<DigitalTwinPageProps> = ({ well, telemetry, onNavigate }) => {
  return (
    <div className="space-y-4">
      {/* Intro Header */}
      <div className="scada-panel p-4 border-l-4 border-l-sky-500 bg-industrial-900/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
            <Share2 className="w-4 h-4 text-sky-400" />
            Coupled Well-to-Surface Virtual Physical Twin
          </span>
          <div className="text-xs text-industrial-300 mt-1 max-w-3xl leading-relaxed">
            Continuously connects reservoir thermodynamics, fluid rheology, wellbore hydraulic pressure drops, sucker rod downstroke viscous mechanics, and surface production. CSS and SRP operate as one unified physical system.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('what_if')}
            className="px-3 py-1.5 rounded bg-sky-950 border border-sky-600 text-sky-200 text-xs font-mono font-medium hover:bg-sky-900 transition-colors flex items-center gap-1.5"
          >
            Launch What-If Simulation
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Digital Twin Interactive Cross-Section Schematic */}
      <DigitalTwinDiagram well={well} telemetry={telemetry} />
    </div>
  );
};
