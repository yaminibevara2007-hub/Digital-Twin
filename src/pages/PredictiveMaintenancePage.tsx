import React, { useState } from 'react';
import { ComponentHealth, TelemetryData, WellInfo } from '../types';
import { getComponentHealthData } from '../services/mockDataService';
import { StatusBadge } from '../components/StatusBadge';
import { 
  ShieldAlert, 
  Activity, 
  Calendar, 
  Wrench, 
  AlertTriangle, 
  Clock, 
  CheckCircle2,
  FileCheck
} from 'lucide-react';

interface PredictiveMaintenancePageProps {
  well: WellInfo;
  telemetry: TelemetryData;
}

export const PredictiveMaintenancePage: React.FC<PredictiveMaintenancePageProps> = ({ well, telemetry }) => {
  const components: ComponentHealth[] = getComponentHealthData(well.id);
  const [selectedComp, setSelectedComp] = useState<ComponentHealth>(components[1]); // Rod string default
  const [scheduledWorkorder, setScheduledWorkorder] = useState(false);

  return (
    <div className="space-y-4">
      {/* Header Operational Notice */}
      <div className="scada-panel p-4 border-l-4 border-l-sky-500 bg-industrial-900/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-sky-400" />
            Equipment Health Monitoring & Mechanical Stress Forecasting
          </span>
          <div className="text-xs text-industrial-300 mt-1 max-w-3xl leading-relaxed">
            Evaluates mechanical fatigue, downstroke buckling risk, valve slippage, and cyclic thermal stresses across the complete wellbore completion. Predictions are derived from continuous dynamometer load envelopes and motor power signatures.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setScheduledWorkorder(true)}
            className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 ${
              scheduledWorkorder
                ? 'bg-emerald-950 border border-emerald-600 text-emerald-300'
                : 'bg-industrial-800 border border-industrial-700 text-industrial-200 hover:bg-industrial-750'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            {scheduledWorkorder ? 'Preventive Work Order Logged' : 'Schedule Visual Inspection'}
          </button>
        </div>
      </div>

      {/* Five Primary Components Health Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {components.map((c) => {
          const isSelected = selectedComp.component === c.component;
          return (
            <div
              key={c.component}
              onClick={() => setSelectedComp(c)}
              className={`scada-panel p-3 cursor-pointer transition-all ${
                isSelected ? 'border-sky-500 bg-industrial-850' : 'hover:border-industrial-700'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-[11px] font-mono font-semibold text-industrial-300 uppercase truncate" title={c.component}>
                  {c.component}
                </span>
                <StatusBadge status={c.status} size="sm" />
              </div>

              <div className="my-1 flex items-baseline justify-between">
                <span className="scada-data-cell text-2xl font-bold text-industrial-100">
                  {c.healthScorePct}%
                </span>
                <span className="text-[10px] font-mono text-industrial-400">
                  Trend: {c.failureRiskTrend}
                </span>
              </div>

              <div className="w-full bg-industrial-950 h-1.5 rounded overflow-hidden my-2">
                <div
                  className={`h-full rounded ${
                    c.healthScorePct < 70 ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${c.healthScorePct}%` }}
                />
              </div>

              <div className="text-[10px] font-mono text-industrial-400 flex justify-between mt-1">
                <span>Anomalies: {c.anomaliesDetectedCount}</span>
                <span>{c.operatingHours.toLocaleString()} hrs</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Component Detailed Risk Timeline & Diagnostics */}
      <div className="scada-panel p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-industrial-800 pb-2">
          <div>
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
              Diagnostic Health Profile: {selectedComp.component}
            </span>
            <div className="text-[11px] font-mono text-industrial-400">
              Primary Stress Factor: {selectedComp.primaryStressFactor}
            </div>
          </div>

          <div className="text-xs font-mono text-industrial-400">
            Last Field Inspection: <strong className="text-industrial-200">{selectedComp.lastInspectionDate}</strong>
          </div>
        </div>

        {/* 4-Stage Predictive Risk Timeline */}
        <div>
          <div className="text-xs font-mono text-industrial-400 mb-2 uppercase tracking-wider">
            Predictive Degradation Horizon & Maintenance Windows
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
            {/* Stage 1: Current condition */}
            <div className="bg-industrial-950 p-3 rounded border border-industrial-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  1. Current Condition
                </div>
                <div className="text-industrial-300 text-[11px]">
                  Operating under real-time telemetry supervision. Baseline dyno cards intact.
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-industrial-850 text-industrial-400 text-[10px]">
                Day 0 (Present)
              </div>
            </div>

            {/* Stage 2: Early Warning Window */}
            <div className="bg-industrial-950 p-3 rounded border border-industrial-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-sky-400 font-bold mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  2. Early Warning Zone
                </div>
                <div className="text-industrial-300 text-[11px]">
                  Micro-vibration harmonics & viscous drag accumulation exceed 15% delta threshold.
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-industrial-850 text-sky-400 text-[10px] font-semibold">
                T + {selectedComp.earlyWarningDays} Days
              </div>
            </div>

            {/* Stage 3: Recommended Inspection Window */}
            <div className="bg-industrial-950 p-3 rounded border border-industrial-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                  <Wrench className="w-3.5 h-3.5" />
                  3. Inspection Recommended
                </div>
                <div className="text-industrial-300 text-[11px]">
                  Execute acoustic liquid-level check and polish rod caliper scan to verify wear.
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-industrial-850 text-amber-400 text-[10px] font-semibold">
                T + {selectedComp.inspectionRecommendedDays} Days
              </div>
            </div>

            {/* Stage 4: Potential Failure Window */}
            <div className="bg-industrial-950 p-3 rounded border border-industrial-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-petro-red font-bold mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  4. Potential Failure Window
                </div>
                <div className="text-industrial-300 text-[11px]">
                  Estimated fatigue endurance limit if high SPM maintained during thermal decline.
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-industrial-850 text-red-400 text-[10px] font-semibold">
                T + {selectedComp.failureWindowDays} Days
              </div>
            </div>
          </div>
        </div>

        {/* Possible Anomaly Condition Matrix */}
        <div className="bg-industrial-950 p-3 rounded border border-industrial-800">
          <div className="text-xs font-mono font-bold text-industrial-200 mb-2 uppercase tracking-wider">
            Active Anomaly Surveillance for {selectedComp.component}
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-2 rounded bg-industrial-900 border border-industrial-800 flex items-start justify-between">
              <div>
                <div className="font-semibold text-industrial-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Possible rod-floating behaviour detected under viscous drag
                </div>
                <div className="text-industrial-400 text-[11px] mt-0.5">
                  Downstroke polish rod margin is constrained. Rod velocity is lagging carrier bar by 0.14 sec.
                </div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <span className="text-[10px] text-amber-400 font-semibold">Detection Strength: 78%</span>
                <div className="text-[10px] text-industrial-500">Continuous Dyno Analysis</div>
              </div>
            </div>

            <div className="p-2 rounded bg-industrial-900 border border-industrial-800 flex items-start justify-between">
              <div>
                <div className="font-semibold text-industrial-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Standing valve seat integrity normal
                </div>
                <div className="text-industrial-400 text-[11px] mt-0.5">
                  Hold test verified. Zero reverse slippage observed on upstroke load pick-up.
                </div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <span className="text-[10px] text-emerald-400 font-semibold">Verified</span>
                <div className="text-[10px] text-industrial-500">2026-09-27 18:00 IST</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
