import React, { useState } from 'react';
import { TelemetryData, WellInfo } from '../types';
import { FileText, Printer, Download, CheckCircle, Clock, ShieldCheck } from 'lucide-react';

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
Oil & Natural Gas Corporation Ltd. / Cairn India Jodhpur Operations
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
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="scada-panel p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-sky-400" />
            Official Petroleum Engineering Operations Summary Report
          </span>
          <div className="text-[11px] font-mono text-industrial-400">
            Complies with Baghewala Asset EOR Technical Standards | Rigless Operations
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadText}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-industrial-800 border border-industrial-700 text-industrial-200 text-xs font-mono hover:bg-industrial-750 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            {downloaded ? 'Downloaded TXT' : 'Export Data File'}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-sky-950 border border-sky-600 text-sky-200 text-xs font-mono font-semibold hover:bg-sky-900 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Technical Report
          </button>
        </div>
      </div>

      {/* Printable Engineering Formal Sheet */}
      <div className="bg-industrial-900 border border-industrial-800 p-6 rounded shadow-xl text-industrial-100 font-mono text-xs space-y-6">
        {/* Header Block */}
        <div className="border-b-2 border-industrial-700 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div>
            <div className="text-sm font-bold tracking-wider uppercase text-white">
              BAGHEWALA ASSET OPERATIONS — PETROLEUM ENGINEERING DIVISION
            </div>
            <div className="text-industrial-400 text-[11px]">
              CYCLIC STEAM STIMULATION (CSS) & SUCKER ROD PUMP (SRP) INTEGRATED REPORT
            </div>
          </div>
          <div className="text-right text-[11px] text-industrial-400">
            <div>Ref: BAG-EOR-RPT-2026-09</div>
            <div>Date: 2026-09-27 20:49 IST</div>
          </div>
        </div>

        {/* Section 1: Asset Information */}
        <div>
          <div className="bg-industrial-950 p-2 font-bold text-sky-400 uppercase text-[11px] border border-industrial-800 mb-2">
            1. Well Identification & Reservoir Characteristics
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
            <div>Well Name: <strong className="text-white">{well.name}</strong></div>
            <div>Formation: <strong className="text-white">{well.formation}</strong></div>
            <div>Perforated Depth: <strong className="text-white">{well.depthMeters} m TVD</strong></div>
            <div>Crude Gravity: <strong className="text-white">{well.apiGravity}° API</strong></div>
            <div>CSS Stage: <strong className="text-petro-orange">{well.currentStage} (Day {well.stageDay})</strong></div>
            <div>Active Cycle: <strong className="text-white">Cycle {well.currentCycle}</strong></div>
            <div>Initial Dead Viscosity: <strong className="text-white">22,000 cP @ 40°C</strong></div>
            <div>Pump Specification: <strong className="text-white">{well.pumpType}</strong></div>
          </div>
        </div>

        {/* Section 2: Current Thermal & Viscosity State */}
        <div>
          <div className="bg-industrial-950 p-2 font-bold text-petro-orange uppercase text-[11px] border border-industrial-800 mb-2">
            2. Near-Wellbore Thermal Conformance & Hydro-Dynamics
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
            <div>Near-Wellbore Temp: <strong className="text-petro-orange">{telemetry.reservoirTempC} °C</strong></div>
            <div>In-Situ Viscosity: <strong className="text-white">{telemetry.estimatedViscosityCP} cP</strong></div>
            <div>Effective Heated Radius: <strong className="text-white">{telemetry.thermalZoneRadiusMeters} meters</strong></div>
            <div>Specific SOR: <strong className="text-white">{telemetry.steamOilRatioSOR} bbl CWE/bbl</strong></div>
            <div>Metered Oil Rate: <strong className="text-emerald-400 font-bold">{telemetry.oilRateBOPD} bbl/day</strong></div>
            <div>Produced Water Cut: <strong className="text-white">{telemetry.waterCutPct}%</strong></div>
            <div>Darcy Fluid Mobility: <strong className="text-white">{telemetry.fluidMobilityMD_CP} mD/cP</strong></div>
            <div>Channeling Indicator: <strong className="text-white">{telemetry.channelingRiskIndex}/100 (Normal)</strong></div>
          </div>
        </div>

        {/* Section 3: Sucker Rod Pump Mechanical Health */}
        <div>
          <div className="bg-industrial-950 p-2 font-bold text-emerald-400 uppercase text-[11px] border border-industrial-800 mb-2">
            3. Mechanical SRP Pumping Performance & Load Envelopes
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
            <div>Pumping Speed: <strong className="text-white">{telemetry.srpSPM} SPM</strong></div>
            <div>Surface Stroke Length: <strong className="text-white">{telemetry.srpStrokeLengthInches}"</strong></div>
            <div>VFD Drive Frequency: <strong className="text-white">{telemetry.vfdFrequencyHz} Hz</strong></div>
            <div>Pump Fillage: <strong className="text-emerald-400 font-bold">{telemetry.pumpFillagePct}%</strong></div>
            <div>Peak Polished Rod Load: <strong className="text-white">{telemetry.peakPolishedRodLoadLbs} lbs</strong></div>
            <div>Downstroke Rod Drag: <strong className="text-amber-400">{3340 - telemetry.rodFloatMarginLbs} lbs</strong></div>
            <div>Buoyant Fall Margin: <strong className={telemetry.rodFloatMarginLbs < 600 ? 'text-amber-400 font-bold' : 'text-white'}>{telemetry.rodFloatMarginLbs} lbs</strong></div>
            <div>Specific Lifting Energy: <strong className="text-white">{telemetry.energyConsumptionKWhBbl} kWh/bbl</strong></div>
          </div>
        </div>

        {/* Section 4: Engineering Actions & Dispatch */}
        <div>
          <div className="bg-industrial-950 p-2 font-bold text-sky-400 uppercase text-[11px] border border-industrial-800 mb-2">
            4. Verified Engineering Operational Dispatch & Decision
          </div>
          <div className="p-3 bg-industrial-950 border border-industrial-850 rounded space-y-2 text-[11px] text-industrial-200 leading-relaxed">
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
        <div className="pt-4 border-t border-industrial-800 flex justify-between items-end text-[11px]">
          <div>
            <div className="text-industrial-400">Inspecting Engineer:</div>
            <div className="text-white font-bold mt-1">P. Sharma (Senior Production Engineer)</div>
            <div className="text-industrial-500">Baghewala Sub-Surface Operations Unit</div>
          </div>
          <div className="text-right">
            <div className="text-industrial-400">Asset Verification:</div>
            <div className="text-emerald-400 font-bold mt-1">APPROVED & LOGGED IN SCADA</div>
            <div className="text-industrial-500">Digital Signature Hash: #8F94-BW-01</div>
          </div>
        </div>
      </div>
    </div>
  );
};
