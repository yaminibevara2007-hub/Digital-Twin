import React from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  Flame, 
  Wrench, 
  Share2, 
  LineChart, 
  ShieldAlert, 
  Zap, 
  SlidersHorizontal, 
  AlertTriangle, 
  History, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Thermometer
} from 'lucide-react';
import { TelemetryData } from '../types';

export type NavTab = 
  | 'overview'
  | 'monitoring'
  | 'css_opt'
  | 'reservoir_model'
  | 'srp_opt'
  | 'digital_twin'
  | 'production_analytics'
  | 'predictive_maintenance'
  | 'energy_opt'
  | 'what_if'
  | 'alerts'
  | 'historical'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  telemetry: TelemetryData;
  activeAlertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  telemetry,
  activeAlertCount,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'digital_twin', label: 'Digital Twin', icon: Share2 },
    { id: 'monitoring', label: 'Well Monitoring', icon: Activity },
    { id: 'css_opt', label: 'CSS Optimization', icon: Flame },
    { id: 'reservoir_model', label: 'Reservoir Thermal Model', icon: Thermometer },
    { id: 'srp_opt', label: 'SRP Optimization', icon: Wrench },
    { id: 'what_if', label: 'What-If Simulation', icon: SlidersHorizontal },
    { id: 'production_analytics', label: 'Production Analytics', icon: LineChart },
    { id: 'predictive_maintenance', label: 'Predictive Maintenance', icon: ShieldAlert },
    { id: 'energy_opt', label: 'Energy & Steam', icon: Zap },
    { id: 'alerts', label: 'Alerts & Diagnostics', icon: AlertTriangle, badge: activeAlertCount },
    { id: 'historical', label: 'Historical CSS Cycles', icon: History },
    { id: 'reports', label: 'Engineering Reports', icon: FileText },
    { id: 'settings', label: 'Engineering Limits', icon: Settings },
  ];

  return (
    <aside
      className={`bg-industrial-900 border-r border-industrial-800 flex flex-col justify-between transition-all duration-200 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Navigation Links */}
      <div className="flex-1 py-3 overflow-y-auto">
        <div className="px-3 mb-2 flex items-center justify-between">
          {!collapsed && (
            <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-industrial-400">
              Operations Control
            </span>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded text-industrial-400 hover:text-industrial-200 hover:bg-industrial-800 transition-colors ml-auto"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-industrial-800 text-sky-400 border-l-2 border-sky-400'
                    : 'text-industrial-300 hover:bg-industrial-850 hover:text-industrial-100'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-400' : 'text-industrial-400'}`} />
                {!collapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {!collapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1.5 py-0.2 font-mono text-[10px] rounded bg-amber-950 text-amber-300 border border-amber-800">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Quick Telemetry Mini-Strip */}
      {!collapsed && (
        <div className="p-3 border-t border-industrial-800 bg-industrial-950/70">
          <div className="text-[10px] font-mono text-industrial-400 uppercase tracking-wider mb-1.5 flex justify-between">
            <span>Live Readouts</span>
            <span className="text-emerald-400 font-bold">LIVE</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-industrial-900 p-1.5 rounded border border-industrial-800">
              <div className="text-[10px] text-industrial-400">Oil Rate</div>
              <div className="text-industrial-100 font-semibold">{telemetry.oilRateBOPD} <span className="text-[10px] text-industrial-400">bbl/d</span></div>
            </div>
            <div className="bg-industrial-900 p-1.5 rounded border border-industrial-800">
              <div className="text-[10px] text-industrial-400">Res. Temp</div>
              <div className="text-industrial-100 font-semibold">{telemetry.reservoirTempC} <span className="text-[10px] text-industrial-400">°C</span></div>
            </div>
            <div className="bg-industrial-900 p-1.5 rounded border border-industrial-800">
              <div className="text-[10px] text-industrial-400">Viscosity</div>
              <div className="text-industrial-100 font-semibold">{telemetry.estimatedViscosityCP} <span className="text-[10px] text-industrial-400">cP</span></div>
            </div>
            <div className="bg-industrial-900 p-1.5 rounded border border-industrial-800">
              <div className="text-[10px] text-industrial-400">SRP Speed</div>
              <div className="text-industrial-100 font-semibold">{telemetry.srpSPM} <span className="text-[10px] text-industrial-400">SPM</span></div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
