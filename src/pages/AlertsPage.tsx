import React, { useState } from 'react';
import { AlertItem, ChannelingIndicator, WellInfo } from '../types';
import { getFieldAlerts, getChannelingDiagnostics } from '../services/mockDataService';
import { StatusBadge } from '../components/StatusBadge';
import { 
  Check, 
  Flame, 
  Filter
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
              acknowledgedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
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
    <div className="space-y-6">
      {/* Steam Breakthrough & Channeling Surveillance Module */}
      <div className={`bg-white border rounded-lg p-6 ${
        channeling.status === 'POSSIBLE_CHANNELING'
          ? 'border-[#F8D7DA]'
          : 'border-app-border'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-app-border pb-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-app-text flex items-center gap-2">
                <Flame className="w-4 h-4 text-app-steam" />
                Steam Breakthrough & High-Permeability Channeling Surveillance
              </span>
              <StatusBadge status={channeling.status === 'POSSIBLE_CHANNELING' ? 'WARNING' : 'NORMAL'} size="sm" />
            </div>
            <div className="text-xs text-app-muted mt-0.5">
              Multi-variant detection: Annular casing pressure + Wellhead temperature rise + Inflow water cut surge
            </div>
          </div>

          <div className="text-xs text-app-muted">
            Channeling Risk Score: <strong className={channeling.breakthroughRiskScore > 50 ? 'text-app-red' : 'text-app-green'}>{channeling.breakthroughRiskScore} / 100</strong>
          </div>
        </div>

        {/* Channeling Telemetry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs mb-4">
          <div className="bg-app-bg p-3.5 rounded border border-app-border">
            <span className="text-[11px] text-app-muted uppercase font-medium">Annulus Pressure Rate</span>
            <div className="text-app-text font-semibold text-base mt-1">
              +{channeling.casingAnnulusPressureRatePsiHr} psi/hr
            </div>
            <div className="text-[11px] text-app-muted mt-0.5">Threshold: &gt; 3.0 psi/hr</div>
          </div>

          <div className="bg-app-bg p-3.5 rounded border border-app-border">
            <span className="text-[11px] text-app-muted uppercase font-medium">Wellhead Temp Rise Rate</span>
            <div className="text-app-text font-semibold text-base mt-1">
              +{channeling.wellheadTempRiseRateCDay} °C/day
            </div>
            <div className="text-[11px] text-app-muted mt-0.5">Threshold: &gt; 2.5 °C/day</div>
          </div>

          <div className="bg-app-bg p-3.5 rounded border border-app-border">
            <span className="text-[11px] text-app-muted uppercase font-medium">Water Cut Surge</span>
            <div className="text-app-text font-semibold text-base mt-1">
              +{channeling.waterCutSurgePct}% delta
            </div>
            <div className="text-[11px] text-app-muted mt-0.5">Condensate arrival</div>
          </div>

          <div className="bg-app-bg p-3.5 rounded border border-app-border">
            <span className="text-[11px] text-app-muted uppercase font-medium">Detection Confidence</span>
            <div className="text-app-blue font-semibold text-base mt-1">
              {channeling.confidencePct}%
            </div>
            <div className="text-[11px] text-app-muted mt-0.5">Statistical indicator model</div>
          </div>
        </div>

        <div className="bg-app-bg p-3.5 rounded border border-app-border text-xs text-app-muted leading-relaxed">
          <span className="font-semibold text-app-text">Assessment: </span>
          {channeling.diagnosticNotes}
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border border-app-border rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-app-muted">
            <Filter className="w-3.5 h-3.5 text-app-muted" />
            <span>Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-app-bg border border-app-border text-xs rounded-md px-2.5 py-1 text-app-text focus:outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="WARNING">Warning</option>
              <option value="WATCH">Watch</option>
              <option value="NORMAL">Normal</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-app-muted">
            <span>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-app-bg border border-app-border text-xs rounded-md px-2.5 py-1 text-app-text focus:outline-none"
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

        <div className="text-xs text-app-muted">
          Showing {filteredAlerts.length} Events
        </div>
      </div>

      {/* ALERTS SPLIT VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Alerts List */}
        <div className="lg:col-span-7 bg-white border border-app-border rounded-lg p-5">
          <div className="space-y-3">
            {filteredAlerts.map((alt) => {
              const isSelected = selectedAlert?.id === alt.id;
              return (
                <div
                  key={alt.id}
                  onClick={() => setSelectedAlert(alt)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-app-navy bg-app-softBlue/30'
                      : 'border-app-border bg-white hover:border-app-muted'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={alt.severity} size="sm" />
                      <span className="text-xs font-semibold text-app-text">{alt.title}</span>
                    </div>
                    <span className="text-[11px] text-app-muted font-mono">{alt.timestamp}</span>
                  </div>

                  <p className="text-xs text-app-muted leading-relaxed line-clamp-2">
                    {alt.description}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-app-border text-[11px] text-app-muted">
                    <div>
                      <span>Parameter: </span>
                      <span className="text-app-text font-medium">{alt.parameter} ({alt.currentValue})</span>
                    </div>
                    {alt.acknowledged ? (
                      <span className="text-app-green flex items-center gap-1 font-medium">
                        <Check className="w-3 h-3" /> Acknowledged
                      </span>
                    ) : (
                      <span className="text-app-amber font-semibold">
                        Awaiting Acknowledgment
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Alert Technical Inspector Panel */}
        <div className="lg:col-span-5 bg-white border border-app-border rounded-lg p-6 flex flex-col justify-between">
          {selectedAlert ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-app-border pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={selectedAlert.severity} size="sm" />
                    <span className="text-xs text-app-muted uppercase font-medium">
                      {selectedAlert.category} • #{selectedAlert.id}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-app-text">
                    {selectedAlert.title}
                  </h3>
                </div>

                {!selectedAlert.acknowledged && (
                  <button
                    onClick={() => handleAcknowledge(selectedAlert.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-app-navy text-white text-xs font-medium hover:bg-app-navyDark transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Acknowledge
                  </button>
                )}
              </div>

              {/* Readout stats */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-app-bg p-3 rounded border border-app-border">
                  <div className="text-[11px] text-app-muted">Monitored Parameter</div>
                  <div className="text-app-text font-semibold mt-1">{selectedAlert.parameter}</div>
                </div>
                <div className="bg-app-bg p-3 rounded border border-app-border">
                  <div className="text-[11px] text-app-muted">Current vs Threshold</div>
                  <div className="text-app-text font-semibold mt-1">
                    {selectedAlert.currentValue} <span className="text-app-muted text-[11px]">({selectedAlert.thresholdValue})</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <span className="text-xs font-semibold text-app-text uppercase tracking-wider">
                  Description:
                </span>
                <p className="text-xs text-app-muted mt-1 leading-relaxed bg-app-bg p-3 rounded border border-app-border">
                  {selectedAlert.description}
                </p>
              </div>

              {/* Possible Cause */}
              <div>
                <span className="text-xs font-semibold text-app-text uppercase tracking-wider">
                  Possible Cause:
                </span>
                <p className="text-xs text-app-muted mt-1 leading-relaxed bg-app-bg p-3 rounded border border-app-border">
                  {selectedAlert.possibleCause}
                </p>
              </div>

              {/* Recommended Action */}
              <div>
                <span className="text-xs font-semibold text-app-text uppercase tracking-wider">
                  Recommended Operating Action:
                </span>
                <p className="text-xs text-app-muted mt-1 leading-relaxed bg-app-bg p-3 rounded border border-app-border">
                  {selectedAlert.suggestedAction}
                </p>
              </div>

              {/* Acknowledgment Stamp */}
              {selectedAlert.acknowledged && (
                <div className="text-xs text-app-green bg-app-softGreen p-3 rounded border border-[#D5EFE1] flex items-center justify-between font-medium">
                  <span>Acknowledged by {selectedAlert.acknowledgedBy}</span>
                  <span className="text-[11px] text-app-muted">{selectedAlert.acknowledgedAt}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-app-muted text-xs">
              Select an alarm item to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
