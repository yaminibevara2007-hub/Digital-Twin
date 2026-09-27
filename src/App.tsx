import React, { useState, useEffect } from 'react';
import { WellId, TelemetryData } from './types';
import { BAGHEWALA_WELLS, getWellTelemetry, getFieldAlerts } from './services/mockDataService';
import { checkBackendHealth } from './services/apiClient';

import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';

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

export const App: React.FC = () => {
  const [currentWellId, setCurrentWellId] = useState<WellId>('BW-01');
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [demoScenario, setDemoScenario] = useState('DEFAULT');
  const [backendOnline, setBackendOnline] = useState(false);

  // Probe FastAPI backend on mount & periodic heartbeat
  useEffect(() => {
    let isMounted = true;
    const probe = async () => {
      const res = await checkBackendHealth();
      if (isMounted) setBackendOnline(res.online);
    };
    probe();
    const interval = setInterval(probe, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const well = BAGHEWALA_WELLS[currentWellId];
  const telemetry: TelemetryData = getWellTelemetry(currentWellId, demoScenario);
  const alerts = getFieldAlerts(currentWellId);
  const activeAlertCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="min-h-screen bg-industrial-950 text-industrial-100 flex flex-col font-sans select-none antialiased">
      {/* SCADA Global Header */}
      <Header
        currentWellId={currentWellId}
        onSelectWell={setCurrentWellId}
        demoScenario={demoScenario}
        onSelectDemoScenario={setDemoScenario}
        backendOnline={backendOnline}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          telemetry={telemetry}
          activeAlertCount={activeAlertCount}
        />

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-industrial-950">
          <div className="max-w-[1600px] mx-auto">
            {activeTab === 'overview' && (
              <OverviewPage well={well} telemetry={telemetry} onNavigate={setActiveTab} />
            )}
            {activeTab === 'digital_twin' && (
              <DigitalTwinPage well={well} telemetry={telemetry} onNavigate={setActiveTab} />
            )}
            {activeTab === 'monitoring' && (
              <WellMonitoringPage well={well} telemetry={telemetry} />
            )}
            {activeTab === 'css_opt' && (
              <CSSOptimizationPage well={well} telemetry={telemetry} />
            )}
            {activeTab === 'reservoir_model' && (
              <ReservoirModelPage well={well} telemetry={telemetry} onNavigate={setActiveTab} />
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
      </div>

      {/* Industrial SCADA Status Strip */}
      <footer className="bg-industrial-900 border-t border-industrial-800 px-4 py-1.5 text-[11px] font-mono text-industrial-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 telemetry-live" />
            <span>SCADA PROTOCOL: MODBUS-TCP / OPC-UA</span>
          </span>
          <span>|</span>
          <span>STATION: JODHPUR CENTRAL SCADA MASTER</span>
          <span>|</span>
          <span>ASSET: BAGHEWALA HEAVY OIL FIELD</span>
        </div>

        <div className="flex items-center gap-4">
          <span>LATENCY: 18ms</span>
          <span>DATABASE: POSTGRESQL / TIMESCALEDB</span>
          <span className="text-industrial-300 font-semibold">v2.4-PROD</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
