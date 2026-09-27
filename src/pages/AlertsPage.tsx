import React, { useState } from 'react';
import { AlertItem, AlertSeverity, AlertCategory, ChannelingIndicator, WellInfo } from '../types';
import { getFieldAlerts, getChannelingDiagnostics } from '../services/mockDataService';
import { StatusBadge } from '../components/StatusBadge';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Check, 
  Search, 
  Flame, 
  Activity, 
  Gauge, 
  Filter,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface AlertsPageProps {
  well: WellInfo;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ well }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>(getFieldAlerts(well.id));
  const [channeling] = useState<ChannelingIndicator>(getChannelingDiagnostics(well.id));
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(alerts[0]);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const handleAcknowledge = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              acknowledged: true,
              acknowledgedBy: 'P. Sharma (Sr. Production Engineer)',
              acknowledgedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST',
            }
          : a
      )
    );
    if (selectedAlert && selectedAlert.id === alertId) {
      setSelectedAlert({
        ...selectedAlert,
        acknowledged: true,
        acknowledgedBy: 'P. Sharma (Sr. Production Engineer)',
        acknowledgedAt: 'Just Now',
      });
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    if (categoryFilter !== 'ALL' && a.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* SECTION 13: STEAM BREAKTHROUGH & CHANNELING SURVEILLANCE MODULE */}
      <div className={`scada-panel p-4 border-l-4 ${
        channeling.status === 'POSSIBLE_CHANNELING'
          ? 'border-l-red-500 bg-industrial-900'
          : 'border-l-emerald-500 bg-industrial-900/90'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-industrial-800 pb-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-industrial-100 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-petro-orange" />
                Steam Breakthrough & High-Permeability Channeling Surveillance
              </span>
              <StatusBadge status={channeling.status === 'POSSIBLE_CHANNELING' ? 'WARNING' : 'NORMAL'} size="sm" />
            </div>
            <div className="text-[11px] font-mono text-industrial-400 mt-0.5">
              Multi-variant detection: Annular casing pressure + Wellhead temperature rise + Inflow water cut surge
            </div>
          </div>

          <div className="text-xs font-mono text-industrial-400">
            Channeling Risk Score: <strong className={channeling.breakthroughRiskScore > 50 ? 'text-petro-red text-sm' : 'text-emerald-400 text-sm'}>{channeling.breakthroughRiskScore} / 100</strong>
          </div>
        </div>

        {/* Channeling Telemetry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono mb-3">
          <div className="bg-industrial-950 p-2.5 rounded border border-industrial-800">
            <span className="text-[10px] text-industrial-400 uppercase">Annulus Pressure Rate</span>
            <div className="text-industrial-100 font-semibold mt-0.5">
              +{channeling.casingAnnulusPressureRatePsiHr} psi/hr
            </div>
            <div className="text-[10px] text-industrial-500">Threshold: &gt; 3.0 psi/hr</div>
          </div>

          <div className="bg-industrial-950 p-2.5 rounded border border-industrial-800">
            <span className="text-[10px] text-industrial-400 uppercase">Wellhead Temp Rise Rate</span>
            <div className="text-industrial-100 font-semibold mt-0.5">
              +{channeling.wellheadTempRiseRateCDay} °C/day
            </div>
            <div className="text-[10px] text-industrial-500">Threshold: &gt; 2.5 °C/day</div>
          </div>

          <div className="bg-industrial-950 p-2.5 rounded border border-industrial-800">
            <span className="text-[10px] text-industrial-400 uppercase">Water Cut Surge</span>
            <div className="text-industrial-100 font-semibold mt-0.5">
              +{channeling.waterCutSurgePct}% delta
            </div>
            <div className="text-[10px] text-industrial-500">Steam condensate arrival</div>
          </div>

          <div className="bg-industrial-950 p-2.5 rounded border border-industrial-800">
            <span className="text-[10px] text-industrial-400 uppercase">Detection Confidence</span>
            <div className="text-sky-400 font-semibold mt-0.5">
              {channeling.confidencePct}% Confidence
            </div>
            <div className="text-[10px] text-industrial-500">Physics indicator model</div>
          </div>
        </div>

        <div className="bg-industrial-950 p-2.5 rounded border border-industrial-800 text-xs text-industrial-300 leading-relaxed">
          <span className="font-semibold text-industrial-200 font-mono">Diagnostic Assessment: </span>
          {channeling.diagnosticNotes}
        </div>
      </div>

      {/* FILTER BAR & ALERTS LIST */}
      <div className="scada-panel p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono text-industrial-300">
            <Filter className="w-3.5 h-3.5 text-industrial-400" />
            <span>Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-industrial-950 border border-industrial-700 text-xs font-mono rounded px-2 py-1 text-industrial-200 focus:outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="WARNING">Warning</option>
              <option value="WATCH">Watch</option>
              <option value="NORMAL">Normal / Cleared</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono text-industrial-300">
            <span>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-industrial-950 border border-industrial-700 text-xs font-mono rounded px-2 py-1 text-industrial-200 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="RESERVOIR">Reservoir</option>
              <option value="CSS">CSS</option>
              <option value="SRP">SRP</option>
              <option value="PRODUCTION">Production</option>
              <option value="EQUIPMENT">Equipment</option>
            </select>
          </div>
        </div>

        <div className="text-xs font-mono text-industrial-400">
          Showing {filteredAlerts.length} Active & Historical Alarms
        </div>
      </div>

      {/* ALERTS SPLIT VIEW: Table on Left, Diagnostic Investigator on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Alerts List */}
        <div className="lg:col-span-7 scada-panel p-3">
          <div className="space-y-2">
            {filteredAlerts.map((alt) => {
              const isSelected = selectedAlert?.id === alt.id;
              return (
                <div
                  key={alt.id}
                  onClick={() => setSelectedAlert(alt)}
                  className={`p-3 rounded border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-sky-500 bg-industrial-850'
                      : 'border-industrial-800 bg-industrial-950 hover:border-industrial-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={alt.severity} size="sm" />
                      <span className="font-mono text-xs font-bold text-industrial-200">{alt.title}</span>
                    </div>
                    <span className="font-mono text-[10px] text-industrial-500">{alt.timestamp}</span>
                  </div>

                  <p className="text-xs text-industrial-300 line-clamp-2 mt-1 leading-relaxed">
                    {alt.description}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-industrial-850 text-[11px] font-mono text-industrial-400">
                    <div>
                      <span>Param: </span>
                      <span className="text-industrial-200 font-semibold">{alt.parameter} ({alt.currentValue})</span>
                    </div>
                    {alt.acknowledged ? (
                      <span className="text-emerald-400 flex items-center gap-1 text-[10px]">
                        <Check className="w-3 h-3" /> Acknowledged
                      </span>
                    ) : (
                      <span className="text-amber-400 font-bold text-[10px]">
                        UNACKNOWLEDGED
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Alert Technical Investigator Panel */}
        <div className="lg:col-span-5 scada-panel p-4 flex flex-col justify-between">
          {selectedAlert ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-industrial-800 pb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={selectedAlert.severity} size="sm" />
                    <span className="text-[11px] font-mono text-industrial-400 uppercase tracking-wider">
                      {selectedAlert.category} Alarm #{selectedAlert.id}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-industrial-100">
                    {selectedAlert.title}
                  </h3>
                </div>

                {!selectedAlert.acknowledged && (
                  <button
                    onClick={() => handleAcknowledge(selectedAlert.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-950 border border-sky-600 text-sky-200 text-xs font-mono font-semibold hover:bg-sky-900 transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    Acknowledge
                  </button>
                )}
              </div>

              {/* Readout stats */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-industrial-950 p-2 rounded border border-industrial-800">
                  <div className="text-[10px] text-industrial-400">Monitored Parameter</div>
                  <div className="text-industrial-100 font-semibold mt-0.5">{selectedAlert.parameter}</div>
                </div>
                <div className="bg-industrial-950 p-2 rounded border border-industrial-800">
                  <div className="text-[10px] text-industrial-400">Current vs Limit</div>
                  <div className="text-amber-300 font-semibold mt-0.5">
                    {selectedAlert.currentValue} <span className="text-industrial-400 text-[10px]">({selectedAlert.thresholdValue})</span>
                  </div>
                </div>
              </div>

              {/* Technical Description */}
              <div>
                <span className="text-xs font-mono font-semibold text-industrial-300 uppercase tracking-wider">
                  Technical Alarm Description:
                </span>
                <p className="text-xs text-industrial-300 mt-1 leading-relaxed bg-industrial-950 p-2.5 rounded border border-industrial-850">
                  {selectedAlert.description}
                </p>
              </div>

              {/* Possible Cause */}
              <div>
                <span className="text-xs font-mono font-semibold text-amber-300 uppercase tracking-wider">
                  Possible Cause:
                </span>
                <p className="text-xs text-industrial-300 mt-1 leading-relaxed bg-industrial-950 p-2.5 rounded border border-industrial-850">
                  {selectedAlert.possibleCause}
                </p>
              </div>

              {/* Suggested Investigation / Operating Action */}
              <div>
                <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
                  Recommended Investigation & Action:
                </span>
                <p className="text-xs text-industrial-300 mt-1 leading-relaxed bg-industrial-950 p-2.5 rounded border border-industrial-850">
                  {selectedAlert.suggestedAction}
                </p>
              </div>

              {/* Acknowledgment Stamp */}
              {selectedAlert.acknowledged && (
                <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 p-2 rounded border border-emerald-800/60 flex items-center justify-between">
                  <span>Acknowledged By: {selectedAlert.acknowledgedBy}</span>
                  <span className="text-industrial-400 text-[10px]">{selectedAlert.acknowledgedAt}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-industrial-400 text-xs font-mono">
              Select an alarm item to view technical investigation details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
