import React, { useState } from 'react';
import { ComponentHealth, TelemetryData, WellInfo } from '../types';
import { getComponentHealthData } from '../services/mockDataService';
import { StatusBadge } from '../components/StatusBadge';
import { 
  ShieldAlert, 
  Calendar, 
  Wrench, 
  AlertTriangle, 
  Clock, 
  CheckCircle2
} from 'lucide-react';

interface PredictiveMaintenancePageProps {
  well: WellInfo;
  telemetry: TelemetryData;
}

export const PredictiveMaintenancePage: React.FC<PredictiveMaintenancePageProps> = ({ well }) => {
  const components: ComponentHealth[] = getComponentHealthData(well.id);
  const [selectedComp, setSelectedComp] = useState<ComponentHealth>(components[1]);
  const [scheduledWorkorder, setScheduledWorkorder] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header Operational Notice */}
      <div className="bg-white border border-app-border rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-sm font-semibold text-app-text tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-app-blue" />
            Equipment Health Monitoring & Mechanical Stress Forecasting
          </span>
          <div className="text-xs text-app-muted mt-1 max-w-3xl leading-relaxed">
            Evaluates mechanical fatigue, downstroke buckling risk, valve slippage, and cyclic thermal stresses across the wellbore completion. Predictions are derived from continuous dynamometer load envelopes and motor power signatures.
          </div>
        </div>

        <button
          onClick={() => setScheduledWorkorder(true)}
          className={`px-3.5 py-2 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
            scheduledWorkorder
              ? 'bg-app-softGreen text-app-green border border-[#D5EFE1]'
              : 'bg-white border border-app-border text-app-text hover:bg-app-bg'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          {scheduledWorkorder ? 'Work Order Scheduled' : 'Schedule Visual Inspection'}
        </button>
      </div>

      {/* Five Primary Components Health Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {components.map((c) => {
          const isSelected = selectedComp.component === c.component;
          return (
            <div
              key={c.component}
              onClick={() => setSelectedComp(c)}
              className={`bg-white border rounded-lg p-4 cursor-pointer transition-all ${
                isSelected ? 'border-app-navy ring-1 ring-app-navy' : 'border-app-border hover:border-app-muted'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-medium text-app-muted truncate" title={c.component}>
                  {c.component}
                </span>
                <StatusBadge status={c.status} size="sm" />
              </div>

              <div className="my-1 flex items-baseline justify-between">
                <span className="text-2xl font-semibold text-app-text">
                  {c.healthScorePct}%
                </span>
                <span className="text-[11px] text-app-muted">
                  Trend: {c.failureRiskTrend}
                </span>
              </div>

              <div className="w-full bg-app-bg h-1.5 rounded overflow-hidden my-2 border border-app-border">
                <div
                  className={`h-full rounded ${
                    c.healthScorePct < 70 ? 'bg-app-amber' : 'bg-app-green'
                  }`}
                  style={{ width: `${c.healthScorePct}%` }}
                />
              </div>

              <div className="text-[11px] text-app-muted flex justify-between mt-1">
                <span>Anomalies: {c.anomaliesDetectedCount}</span>
                <span>{c.operatingHours.toLocaleString()} hrs</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Component Detailed Risk Timeline & Diagnostics */}
      <div className="bg-white border border-app-border rounded-lg p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-app-border pb-3">
          <div>
            <span className="text-sm font-semibold text-app-text tracking-tight">
              Diagnostic Health Profile: {selectedComp.component}
            </span>
            <div className="text-xs text-app-muted">
              Primary Stress Factor: {selectedComp.primaryStressFactor}
            </div>
          </div>

          <div className="text-xs text-app-muted">
            Last Inspection: <strong className="text-app-text">{selectedComp.lastInspectionDate}</strong>
          </div>
        </div>

        {/* 4-Stage Predictive Risk Timeline */}
        <div>
          <div className="text-xs font-semibold text-app-muted uppercase tracking-wider mb-3">
            Predictive Degradation Horizon & Maintenance Windows
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            {/* Stage 1: Current condition */}
            <div className="bg-app-bg p-4 rounded-lg border border-app-border flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-app-green font-semibold mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  1. Current Condition
                </div>
                <div className="text-app-muted text-xs leading-relaxed">
                  Operating under real-time telemetry supervision. Baseline dyno cards intact.
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-app-border text-app-muted text-[11px]">
                Day 0 (Present)
              </div>
            </div>

            {/* Stage 2: Early Warning Window */}
            <div className="bg-app-bg p-4 rounded-lg border border-app-border flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-app-blue font-semibold mb-1">
                  <Clock className="w-4 h-4" />
                  2. Early Warning Zone
                </div>
                <div className="text-app-muted text-xs leading-relaxed">
                  Micro-vibration harmonics & viscous drag accumulation exceed 15% delta threshold.
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-app-border text-app-blue text-[11px] font-semibold">
                T + {selectedComp.earlyWarningDays} Days
              </div>
            </div>

            {/* Stage 3: Recommended Inspection Window */}
            <div className="bg-app-bg p-4 rounded-lg border border-app-border flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-app-amber font-semibold mb-1">
                  <Wrench className="w-4 h-4" />
                  3. Inspection Recommended
                </div>
                <div className="text-app-muted text-xs leading-relaxed">
                  Execute acoustic liquid-level check and polish rod caliper scan to verify wear.
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-app-border text-app-amber text-[11px] font-semibold">
                T + {selectedComp.inspectionRecommendedDays} Days
              </div>
            </div>

            {/* Stage 4: Potential Failure Window */}
            <div className="bg-app-bg p-4 rounded-lg border border-app-border flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-app-red font-semibold mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  4. Potential Failure Window
                </div>
                <div className="text-app-muted text-xs leading-relaxed">
                  Estimated fatigue endurance limit if high SPM maintained during thermal decline.
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-app-border text-app-red text-[11px] font-semibold">
                T + {selectedComp.failureWindowDays} Days
              </div>
            </div>
          </div>
        </div>

        {/* Possible Anomaly Condition Matrix */}
        <div className="bg-app-bg p-4 rounded-lg border border-app-border">
          <div className="text-xs font-semibold text-app-text mb-3 uppercase tracking-wider">
            Active Anomaly Surveillance for {selectedComp.component}
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded bg-white border border-app-border flex items-start justify-between">
              <div>
                <div className="font-semibold text-app-text flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-app-amber" />
                  Possible rod-floating behaviour detected under viscous drag
                </div>
                <div className="text-app-muted text-xs mt-1">
                  Downstroke polish rod margin is constrained. Rod velocity is lagging carrier bar by 0.14 sec.
                </div>
              </div>
              <div className="text-right shrink-0 ml-4">
                <span className="text-xs text-app-amber font-semibold">Detection Strength: 78%</span>
                <div className="text-[11px] text-app-muted">Continuous Dyno Sweep</div>
              </div>
            </div>

            <div className="p-3 rounded bg-white border border-app-border flex items-start justify-between">
              <div>
                <div className="font-semibold text-app-text flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-app-green" />
                  Standing valve seat integrity normal
                </div>
                <div className="text-app-muted text-xs mt-1">
                  Hold test verified. Zero reverse fluid slippage observed on upstroke load pick-up.
                </div>
              </div>
              <div className="text-right shrink-0 ml-4">
                <span className="text-xs text-app-green font-semibold">Verified</span>
                <div className="text-[11px] text-app-muted">10:00 AM Routine</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
