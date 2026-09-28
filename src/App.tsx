import React, { useState, useEffect } from 'react';
import { WellId, TelemetryData, NavTab } from './types';
import { BAGHEWALA_WELLS, getWellTelemetry, getFieldAlerts } from './services/mockDataService';

import { Header } from './components/Header';

import { OverviewPage } from './pages/OverviewPage';
import { WellMonitoringPage } from './pages/WellMonitoringPage';
import { CSSOptimizationPage } from './pages/CSSOptimizationPage';
import { ReservoirModelPage } from './pages/ReservoirModelPage';
import { SRPOptimizationPage } from './pages/SRPOptimizationPage';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { ProductionAnalyticsPage } from './pages/ProductionAnalyticsPage';
import { PredictiveMaintenancePage } from './pages/PredictiveMaintenancePage';
import { EnergyOptimizationPage } from './pages/EnergyOptimizationPage';
import { WhatIfSimulationPage } from './pages/WhatIfSimulationPage';
import { AlertsPage } from './pages/AlertsPage';
import { HistoricalAnalysisPage } from './pages/HistoricalAnalysisPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

const validTabs: NavTab[] = [
  'overview', 'monitoring', 'css_opt', 'reservoir_model', 'srp_opt', 
  'digital_twin', 'production_analytics', 'predictive_maintenance', 
  'energy_opt', 'what_if', 'alerts', 'historical', 'reports', 'settings'
];

const getInitialTab = (): NavTab => {
  if (typeof window !== 'undefined') {
    const hash = window.location.hash.replace('#', '') as NavTab;
    if (validTabs.includes(hash)) return hash;
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as NavTab;
    if (validTabs.includes(tabParam)) return tabParam;
  }
  return 'overview';
};

export const App: React.FC = () => {
  const [currentWellId, setCurrentWellId] = useState<WellId>('BW-01');
  const [activeTab, setActiveTab] = useState<NavTab>(getInitialTab);
  const [demoScenario] = useState('DEFAULT');

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      window.location.hash = tab;
    }
  };

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '') as NavTab;
      if (validTabs.includes(hash)) {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const well = BAGHEWALA_WELLS[currentWellId];
  const telemetry: TelemetryData = getWellTelemetry(currentWellId, demoScenario);
  const alerts = getFieldAlerts(currentWellId);
  const activeAlertCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="min-h-screen bg-app-bg text-app-text flex flex-col font-sans select-none antialiased">
      {/* 1. Clean Top Horizontal Navigation Bar (Replaces Left Sidebar) */}
      <Header
        currentWellId={currentWellId}
        onSelectWell={setCurrentWellId}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        activeAlertCount={activeAlertCount}
      />

      {/* 2. Spacious Main Content Workspace (Full Width, No Left Sidebar) */}
      <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10 md:py-8 bg-app-bg">
        <div className="max-w-[1440px] mx-auto">
          {activeTab === 'overview' && (
            <OverviewPage well={well} telemetry={telemetry} onNavigate={handleSelectTab} />
          )}
          {activeTab === 'digital_twin' && (
            <DigitalTwinPage well={well} telemetry={telemetry} onNavigate={handleSelectTab} />
          )}
          {activeTab === 'monitoring' && (
            <WellMonitoringPage well={well} telemetry={telemetry} />
          )}
          {activeTab === 'css_opt' && (
            <CSSOptimizationPage well={well} telemetry={telemetry} />
          )}
          {activeTab === 'reservoir_model' && (
            <ReservoirModelPage well={well} telemetry={telemetry} onNavigate={handleSelectTab} />
          )}
          {activeTab === 'srp_opt' && (
            <SRPOptimizationPage well={well} telemetry={telemetry} />
          )}
          {activeTab === 'what_if' && (
            <WhatIfSimulationPage well={well} telemetry={telemetry} />
          )}
          {activeTab === 'production_analytics' && (
            <ProductionAnalyticsPage well={well} telemetry={telemetry} />
          )}
          {activeTab === 'predictive_maintenance' && (
            <PredictiveMaintenancePage well={well} telemetry={telemetry} />
          )}
          {activeTab === 'energy_opt' && (
            <EnergyOptimizationPage well={well} telemetry={telemetry} />
          )}
          {activeTab === 'alerts' && (
            <AlertsPage well={well} />
          )}
          {activeTab === 'historical' && (
            <HistoricalAnalysisPage well={well} />
          )}
          {activeTab === 'reports' && (
            <ReportsPage well={well} telemetry={telemetry} />
          )}
          {activeTab === 'settings' && (
            <SettingsPage />
          )}
        </div>
      </main>

      {/* 3. Subtle Clean Status Bar */}
      <footer className="h-9 bg-white border-t border-app-border px-6 text-[11px] text-app-muted flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-app-text">
            <span className="w-1.5 h-1.5 rounded-full bg-app-green" />
            <span>Baghewala Asset Operations</span>
          </span>
          <span className="hidden sm:inline text-app-border">•</span>
          <span className="hidden sm:inline">Bikaner-Nagaur Basin</span>
          <span className="hidden md:inline text-app-border">•</span>
          <span className="hidden md:inline">Petroleum Engineering Decision Support</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-app-muted">SCADA Real-Time Sweep</span>
          <span className="text-app-text font-medium">Release 2.4</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
