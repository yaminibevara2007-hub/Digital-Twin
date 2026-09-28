import React, { useState, useRef, useEffect } from 'react';
import { WellId, NavTab } from '../types';
import { 
  ChevronDown, 
  Menu, 
  X,
  Activity,
  Flame,
  Wrench,
  LineChart,
  ShieldCheck,
  FileText,
  AlertTriangle,
  History,
  Settings,
  Thermometer,
  Zap
} from 'lucide-react';

interface HeaderProps {
  currentWellId: WellId;
  onSelectWell: (wellId: WellId) => void;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeAlertCount?: number;
}

interface DropdownItem {
  id: NavTab;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentWellId,
  onSelectWell,
  activeTab,
  onSelectTab,
  activeAlertCount = 0,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dropdown menus definition per specification
  const monitoringItems: DropdownItem[] = [
    { id: 'monitoring', label: 'Well Monitoring', icon: Activity },
    { id: 'reservoir_model', label: 'Reservoir Thermal', icon: Thermometer },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: activeAlertCount },
  ];

  const cssItems: DropdownItem[] = [
    { id: 'css_opt', label: 'CSS Optimization', icon: Flame },
    { id: 'historical', label: 'Historical CSS Cycles', icon: History },
  ];

  const srpItems: DropdownItem[] = [
    { id: 'srp_opt', label: 'SRP Optimization', icon: Wrench },
    { id: 'predictive_maintenance', label: 'Pump Health', icon: ShieldCheck },
    { id: 'settings', label: 'Engineering Limits', icon: Settings },
  ];

  const analyticsItems: DropdownItem[] = [
    { id: 'production_analytics', label: 'Production', icon: LineChart },
    { id: 'energy_opt', label: 'Energy & Steam', icon: Zap },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleSelectNav = (tab: NavTab) => {
    onSelectTab(tab);
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  };

  const isGroupActive = (tabs: NavTab[]) => tabs.includes(activeTab);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-app-border select-none" ref={navRef}>
      <div className="max-w-[1560px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* LEFT: BF Logo & Field Info */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded bg-app-softBlue border border-[#D4E8F3] flex items-center justify-center text-app-navy font-semibold text-xs tracking-wider">
            BF
          </div>
          <div>
            <div className="text-sm font-semibold text-app-text tracking-tight leading-tight">
              Baghewala Field
            </div>
            <div className="text-[11px] text-app-muted leading-tight">
              Rajasthan, India
            </div>
          </div>
        </div>

        {/* CENTER: Horizontal Navigation Bar (Desktop & Tablet) */}
        <nav className="hidden xl:flex items-center gap-1 text-[13px] font-medium text-app-muted">
          {/* Overview */}
          <button
            onClick={() => handleSelectNav('overview')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'overview'
                ? 'text-app-navy font-semibold bg-app-softBlue'
                : 'hover:text-app-text hover:bg-app-bg'
            }`}
          >
            Overview
          </button>

          {/* Digital Twin */}
          <button
            onClick={() => handleSelectNav('digital_twin')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'digital_twin'
                ? 'text-app-navy font-semibold bg-app-softBlue'
                : 'hover:text-app-text hover:bg-app-bg'
            }`}
          >
            Digital Twin
          </button>

          {/* Monitoring (Dropdown) */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('monitoring')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${
                isGroupActive(['monitoring', 'reservoir_model', 'alerts'])
                  ? 'text-app-navy font-semibold bg-app-softBlue'
                  : 'hover:text-app-text hover:bg-app-bg'
              }`}
            >
              <span>Monitoring</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {openDropdown === 'monitoring' && (
              <div className="absolute left-0 top-full mt-1.5 w-48 bg-white border border-app-border rounded-lg shadow-sm py-1 z-50 animate-in fade-in duration-100">
                {monitoringItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectNav(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors ${
                      activeTab === item.id
                        ? 'text-app-navy font-semibold bg-app-softBlue'
                        : 'text-app-text hover:bg-app-bg hover:text-app-navy'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] rounded bg-app-softAmber text-app-amber font-mono font-medium">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CSS (Dropdown) */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('css')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${
                isGroupActive(['css_opt', 'historical'])
                  ? 'text-app-navy font-semibold bg-app-softBlue'
                  : 'hover:text-app-text hover:bg-app-bg'
              }`}
            >
              <span>CSS</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {openDropdown === 'css' && (
              <div className="absolute left-0 top-full mt-1.5 w-52 bg-white border border-app-border rounded-lg shadow-sm py-1 z-50 animate-in fade-in duration-100">
                {cssItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectNav(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors ${
                      activeTab === item.id
                        ? 'text-app-navy font-semibold bg-app-softBlue'
                        : 'text-app-text hover:bg-app-bg hover:text-app-navy'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SRP (Dropdown) */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('srp')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${
                isGroupActive(['srp_opt', 'predictive_maintenance', 'settings'])
                  ? 'text-app-navy font-semibold bg-app-softBlue'
                  : 'hover:text-app-text hover:bg-app-bg'
              }`}
            >
              <span>SRP</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {openDropdown === 'srp' && (
              <div className="absolute left-0 top-full mt-1.5 w-52 bg-white border border-app-border rounded-lg shadow-sm py-1 z-50 animate-in fade-in duration-100">
                {srpItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectNav(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors ${
                      activeTab === item.id
                        ? 'text-app-navy font-semibold bg-app-softBlue'
                        : 'text-app-text hover:bg-app-bg hover:text-app-navy'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Analytics (Dropdown) */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('analytics')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${
                isGroupActive(['production_analytics', 'energy_opt', 'reports'])
                  ? 'text-app-navy font-semibold bg-app-softBlue'
                  : 'hover:text-app-text hover:bg-app-bg'
              }`}
            >
              <span>Analytics</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {openDropdown === 'analytics' && (
              <div className="absolute left-0 top-full mt-1.5 w-48 bg-white border border-app-border rounded-lg shadow-sm py-1 z-50 animate-in fade-in duration-100">
                {analyticsItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectNav(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors ${
                      activeTab === item.id
                        ? 'text-app-navy font-semibold bg-app-softBlue'
                        : 'text-app-text hover:bg-app-bg hover:text-app-navy'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Maintenance */}
          <button
            onClick={() => handleSelectNav('predictive_maintenance')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'predictive_maintenance'
                ? 'text-app-navy font-semibold bg-app-softBlue'
                : 'hover:text-app-text hover:bg-app-bg'
            }`}
          >
            Maintenance
          </button>

          {/* Simulation */}
          <button
            onClick={() => handleSelectNav('what_if')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'what_if'
                ? 'text-app-navy font-semibold bg-app-softBlue'
                : 'hover:text-app-text hover:bg-app-bg'
            }`}
          >
            Simulation
          </button>

          {/* Reports */}
          <button
            onClick={() => handleSelectNav('reports')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'reports'
                ? 'text-app-navy font-semibold bg-app-softBlue'
                : 'hover:text-app-text hover:bg-app-bg'
            }`}
          >
            Reports
          </button>
        </nav>

        {/* RIGHT: Compact Well Selector, Status & Timestamp */}
        <div className="flex items-center gap-4 text-xs shrink-0">
          {/* Well Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-app-muted text-xs">Well:</span>
            <div className="relative">
              <select
                id="header-well-select"
                value={currentWellId}
                onChange={(e) => onSelectWell(e.target.value as WellId)}
                aria-label="Select Baghewala Field Well"
                className="appearance-none bg-app-bg hover:bg-white border border-app-border text-app-text text-xs font-medium rounded-md pl-2.5 pr-7 py-1 focus:outline-none focus:border-app-navy cursor-pointer transition-colors"
              >
                <option value="BW-01">BGW-01</option>
                <option value="BW-04">BGW-04</option>
                <option value="BW-12">BGW-12</option>
                <option value="BW-19">BGW-19</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-app-muted absolute right-2 top-1.5 pointer-events-none" />
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-app-green">
            <span className="w-2 h-2 rounded-full bg-app-green" />
            <span>Normal</span>
          </div>

          {/* Last Updated Timestamp */}
          <div className="text-xs text-app-muted font-normal pl-2 border-l border-app-border hidden sm:block">
            10:32 AM
          </div>

          {/* Subtle Demo Data Badge */}
          <span className="text-[10px] text-app-muted uppercase tracking-wider px-2 py-0.5 rounded bg-app-bg border border-app-border hidden md:inline-block">
            Demo Data
          </span>

          {/* Mobile / Tablet Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-1.5 rounded-md text-app-muted hover:text-app-text hover:bg-app-bg transition-colors"
            title="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE / TABLET EXPANDED NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-app-border bg-white px-6 py-4 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-medium">
            <button
              onClick={() => handleSelectNav('overview')}
              className={`p-2.5 text-left rounded-md ${activeTab === 'overview' ? 'bg-app-softBlue text-app-navy font-semibold' : 'text-app-text hover:bg-app-bg'}`}
            >
              Overview
            </button>
            <button
              onClick={() => handleSelectNav('digital_twin')}
              className={`p-2.5 text-left rounded-md ${activeTab === 'digital_twin' ? 'bg-app-softBlue text-app-navy font-semibold' : 'text-app-text hover:bg-app-bg'}`}
            >
              Digital Twin
            </button>
            <button
              onClick={() => handleSelectNav('what_if')}
              className={`p-2.5 text-left rounded-md ${activeTab === 'what_if' ? 'bg-app-softBlue text-app-navy font-semibold' : 'text-app-text hover:bg-app-bg'}`}
            >
              Simulation
            </button>
            <button
              onClick={() => handleSelectNav('predictive_maintenance')}
              className={`p-2.5 text-left rounded-md ${activeTab === 'predictive_maintenance' ? 'bg-app-softBlue text-app-navy font-semibold' : 'text-app-text hover:bg-app-bg'}`}
            >
              Maintenance
            </button>
            <button
              onClick={() => handleSelectNav('reports')}
              className={`p-2.5 text-left rounded-md ${activeTab === 'reports' ? 'bg-app-softBlue text-app-navy font-semibold' : 'text-app-text hover:bg-app-bg'}`}
            >
              Reports
            </button>
          </div>

          <div className="border-t border-app-border pt-3">
            <div className="text-[11px] font-semibold text-app-muted uppercase tracking-wider mb-2">
              Monitoring & Surveillance
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {monitoringItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectNav(item.id)}
                  className={`p-2 text-left rounded-md ${activeTab === item.id ? 'bg-app-softBlue text-app-navy font-semibold' : 'text-app-text hover:bg-app-bg'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-app-border pt-3">
            <div className="text-[11px] font-semibold text-app-muted uppercase tracking-wider mb-2">
              Optimization & Engineering
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {cssItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectNav(item.id)}
                  className={`p-2 text-left rounded-md ${activeTab === item.id ? 'bg-app-softBlue text-app-navy font-semibold' : 'text-app-text hover:bg-app-bg'}`}
                >
                  {item.label}
                </button>
              ))}
              {srpItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectNav(item.id)}
                  className={`p-2 text-left rounded-md ${activeTab === item.id ? 'bg-app-softBlue text-app-navy font-semibold' : 'text-app-text hover:bg-app-bg'}`}
                >
                  {item.label}
                </button>
              ))}
              {analyticsItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectNav(item.id)}
                  className={`p-2 text-left rounded-md ${activeTab === item.id ? 'bg-app-softBlue text-app-navy font-semibold' : 'text-app-text hover:bg-app-bg'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
