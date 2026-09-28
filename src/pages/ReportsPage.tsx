import React, { useState } from 'react';
import { TelemetryData, WellInfo } from '../types';
import { FileText, Printer, Download } from 'lucide-react';

interface ReportsPageProps {
  well: WellInfo;
  telemetry: TelemetryData;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ well, telemetry }) => {
  const [downloaded, setDownloaded] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadText = () => {
    const reportContent = `
================================================================================
BAGHEWALA HEAVY OIL FIELD - TECHNICAL WELL INTEGRITY & EOR REPORT
OPERATING FORMATION: JODHPUR SANDSTONE | BIKANER-NAGAUR BASIN, RAJASTHAN
DATE & TIME: ${new Date().toISOString()}
WELL IDENTIFIER: ${well.name} (API: ${well.apiGravity}° API)
REPORT PREPARED BY: P. Sharma (Senior Production Engineer)
================================================================================

1. EXECUTIVE WELL OPERATING STATUS
--------------------------------------------------------------------------------
- Current Operating Stage: ${well.currentStage}
- Active CSS Cycle: Cycle ${well.currentCycle} (Day ${well.stageDay} of ${well.stageTotalDays})
- Near-Wellbore Temperature: ${telemetry.reservoirTempC} °C
- In-Situ Dead Oil Viscosity: ${telemetry.estimatedViscosityCP} cP
- Wellhead Pressure (WHP): ${telemetry.wellheadPressurePsi} psi
- Casing Annulus Pressure (CP): ${telemetry.casingPressurePsi} psi
- Tubing Pressure (TP): ${telemetry.tubingPressurePsi} psi

2. PRODUCTION SUMMARY & FLUID MOBILITY
--------------------------------------------------------------------------------
- Metered Surface Oil Rate: ${telemetry.oilRateBOPD} bbl/day
- Water Cut: ${telemetry.waterCutPct}% (${telemetry.waterRateBWPD} BWPD)
- Darcy Fluid Mobility (k/μ): ${telemetry.fluidMobilityMD_CP} mD/cP
- Thermal Heated Radius: ${telemetry.thermalZoneRadiusMeters} meters

3. SUCKER ROD PUMP (SRP) LIFTING DYNAMICS
--------------------------------------------------------------------------------
- Pumping Speed (SPM): ${telemetry.srpSPM} strokes/min
- Surface Stroke Length: ${telemetry.srpStrokeLengthInches} inches
- VFD Operating Frequency: ${telemetry.vfdFrequencyHz} Hz
- Downhole Pump Fillage: ${telemetry.pumpFillagePct}%
- Volumetric Pump Efficiency: ${telemetry.pumpEfficiencyPct}%
- Peak Polished Rod Load: ${telemetry.peakPolishedRodLoadLbs} lbs
- Minimum Downstroke Rod Load: ${telemetry.minPolishedRodLoadLbs} lbs
- Buoyant Rod Weight: 3,340 lbs
- Viscous Downstroke Drag: ${3340 - telemetry.rodFloatMarginLbs} lbs
- Polish Rod Downward Margin: ${telemetry.rodFloatMarginLbs} lbs
- Rod-Floating Risk Index: ${telemetry.rodFloatRiskPct}% (${telemetry.rodFloatRiskPct > 60 ? 'WARNING' : 'NORMAL'})

4. CSS THERMAL CONFORMANCE & ENERGY
--------------------------------------------------------------------------------
- Cumulative Steam Injected: 1,920 tonnes (Cycle ${well.currentCycle})
- Specific Steam-to-Oil Ratio (SOR): ${telemetry.steamOilRatioSOR} bbl CWE / bbl
- Specific Lifting Energy: ${telemetry.energyConsumptionKWhBbl} kWh/bbl
- Channeling / Steam Breakthrough Index: ${telemetry.channelingRiskIndex} / 100

5. ENGINEERING RECOMMENDATIONS & DISPATCH
--------------------------------------------------------------------------------
- CSS Recommendation: Prepare Cycle ${well.currentCycle + 1} with 2,050 tonnes steam volume and 6 days soaking.
- SRP Speed Adjustment: Maintain VFD speed between 35-38 Hz (4.0-4.4 SPM) to prevent rod float.
- Preventive Action: Schedule acoustic liquid level inspection in 25 days.

================================================================================
AUTHORIZED SIGN-OFF:
Senior Production Engineer, Baghewala Asset Operations
================================================================================
    `;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Baghewala_${well.id}_Engineering_Report_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="bg-white border border-app-border rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-sm font-semibold text-app-text tracking-tight flex items-center gap-2">
            <FileText className="w-4 h-4 text-app-blue" />
            Petroleum Engineering Field Summary Report
          </span>
          <div className="text-xs text-app-muted">
            Formal asset summary conforming to heavy-oil EOR technical reporting standards
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadText}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-white border border-app-border text-app-text text-xs font-medium hover:bg-app-bg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-app-muted" />
            {downloaded ? 'Downloaded TXT' : 'Export Data File'}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-app-navy text-white text-xs font-medium hover:bg-app-navyDark transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
        </div>
      </div>

      {/* Formal Technical Document Sheet */}
      <div className="bg-white border border-app-border p-8 rounded-lg shadow-sm text-app-text font-sans text-xs space-y-6">
        {/* Document Header */}
        <div className="border-b border-app-border pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div>
            <div className="text-sm font-bold text-app-text tracking-tight uppercase">
              Baghewala Asset Operations — Petroleum Engineering Division
            </div>
            <div className="text-app-muted text-xs">
              Cyclic Steam Stimulation (CSS) & Sucker Rod Pump (SRP) Technical Summary
            </div>
          </div>
          <div className="text-right text-xs text-app-muted">
            <div>Ref: BAG-EOR-RPT-2026-09</div>
            <div>Date: 2026-09-27 | 10:32 AM</div>
          </div>
        </div>

        {/* Section 1 */}
        <div>
          <div className="bg-app-bg p-2.5 font-semibold text-app-text uppercase text-xs border border-app-border rounded-t mb-3">
            1. Well Identification & Formation Characteristics
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>Well Name: <strong className="text-app-text">{well.name}</strong></div>
            <div>Formation: <strong className="text-app-text">{well.formation}</strong></div>
            <div>Perforated Depth: <strong className="text-app-text">{well.depthMeters} m TVD</strong></div>
            <div>Crude Gravity: <strong className="text-app-text">{well.apiGravity}° API</strong></div>
            <div>CSS Stage: <strong className="text-app-steam">{well.currentStage} (Day {well.stageDay})</strong></div>
            <div>Active Cycle: <strong className="text-app-text">Cycle {well.currentCycle}</strong></div>
            <div>Initial Dead Viscosity: <strong className="text-app-text">22,000 cP @ 40°C</strong></div>
            <div>Pump Specification: <strong className="text-app-text">{well.pumpType}</strong></div>
          </div>
        </div>

        {/* Section 2 */}
        <div>
          <div className="bg-app-bg p-2.5 font-semibold text-app-text uppercase text-xs border border-app-border rounded-t mb-3">
            2. Near-Wellbore Thermal Conformance & Hydro-Dynamics
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>Near-Wellbore Temp: <strong className="text-app-steam">{telemetry.reservoirTempC} °C</strong></div>
            <div>In-Situ Viscosity: <strong className="text-app-text">{telemetry.estimatedViscosityCP} cP</strong></div>
            <div>Effective Heated Radius: <strong className="text-app-text">{telemetry.thermalZoneRadiusMeters} meters</strong></div>
            <div>Specific SOR: <strong className="text-app-text">{telemetry.steamOilRatioSOR} bbl CWE/bbl</strong></div>
            <div>Metered Oil Rate: <strong className="text-app-green font-bold">{telemetry.oilRateBOPD} bbl/day</strong></div>
            <div>Produced Water Cut: <strong className="text-app-text">{telemetry.waterCutPct}%</strong></div>
            <div>Darcy Fluid Mobility: <strong className="text-app-text">{telemetry.fluidMobilityMD_CP} mD/cP</strong></div>
            <div>Channeling Indicator: <strong className="text-app-text">{telemetry.channelingRiskIndex}/100 (Normal)</strong></div>
          </div>
        </div>

        {/* Section 3 */}
        <div>
          <div className="bg-app-bg p-2.5 font-semibold text-app-text uppercase text-xs border border-app-border rounded-t mb-3">
            3. Mechanical SRP Pumping Performance & Load Envelopes
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>Pumping Speed: <strong className="text-app-navy">{telemetry.srpSPM} SPM</strong></div>
            <div>Surface Stroke Length: <strong className="text-app-text">{telemetry.srpStrokeLengthInches}"</strong></div>
            <div>VFD Drive Frequency: <strong className="text-app-text">{telemetry.vfdFrequencyHz} Hz</strong></div>
            <div>Pump Fillage: <strong className="text-app-green font-bold">{telemetry.pumpFillagePct}%</strong></div>
            <div>Peak Polished Rod Load: <strong className="text-app-text">{telemetry.peakPolishedRodLoadLbs} lbs</strong></div>
            <div>Downstroke Rod Drag: <strong className="text-app-amber">{3340 - telemetry.rodFloatMarginLbs} lbs</strong></div>
            <div>Buoyant Fall Margin: <strong className={telemetry.rodFloatMarginLbs < 600 ? 'text-app-amber font-semibold' : 'text-app-text'}>{telemetry.rodFloatMarginLbs} lbs</strong></div>
            <div>Specific Lifting Energy: <strong className="text-app-text">{telemetry.energyConsumptionKWhBbl} kWh/bbl</strong></div>
          </div>
        </div>

        {/* Section 4 */}
        <div>
          <div className="bg-app-bg p-2.5 font-semibold text-app-text uppercase text-xs border border-app-border rounded-t mb-3">
            4. Verified Engineering Operational Dispatch & Decision
          </div>
          <div className="p-4 bg-app-bg border border-app-border rounded-b space-y-2 text-xs text-app-muted leading-relaxed">
            <p>
              1. <strong>SRP Velocity Regulation:</strong> Pumping speed of {telemetry.srpSPM} SPM is well-matched to current in-situ viscosity of {telemetry.estimatedViscosityCP} cP. Do not increase VFD speed beyond 40 Hz (4.8 SPM) to prevent rod float and fluid pound.
            </p>
            <p>
              2. <strong>CSS Cycle Turn-Around Window:</strong> When reservoir temperature decays to &lt;55°C, plan steam generator tie-in for Cycle {well.currentCycle + 1} with a recommended volume of 2,050 tonnes superheated steam (17 days injection, 6 days soak).
            </p>
            <p>
              3. <strong>Channeling Surveillance:</strong> Continue acoustic casing annulus pressure sweeps every 4 hours. Current annulus pressure of {telemetry.casingPressurePsi} psi indicates healthy thermal packer isolation.
            </p>
          </div>
        </div>

        {/* Sign-off Block */}
        <div className="pt-6 border-t border-app-border flex justify-between items-end text-xs">
          <div>
            <div className="text-app-muted">Inspecting Engineer:</div>
            <div className="text-app-text font-semibold mt-1">P. Sharma (Senior Production Engineer)</div>
            <div className="text-app-muted text-[11px]">Baghewala Sub-Surface Operations Unit</div>
          </div>
          <div className="text-right">
            <div className="text-app-muted">Asset Verification:</div>
            <div className="text-app-green font-semibold mt-1">APPROVED & LOGGED IN SCADA</div>
            <div className="text-app-muted text-[11px]">Digital Signature Hash: #8F94-BW-01</div>
          </div>
        </div>
      </div>
    </div>
  );
};
