import React from 'react';
import { TelemetryData, WellInfo } from '../types';
import { MetricCard } from '../components/MetricCard';
import { 
  AlertTriangle, 
  CheckCircle, 
  ArrowUpRight, 
  Flame, 
  Wrench, 
  Droplet, 
  Gauge, 
  Activity, 
  Zap,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import { NavTab } from '../components/Sidebar';

interface OverviewPageProps {
  well: WellInfo;
  telemetry: TelemetryData;
  onNavigate: (tab: NavTab) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ well, telemetry, onNavigate }) => {
  const isRodFloatWatch = telemetry.rodFloatRiskPct > 60;
  const isCoolingAlert = telemetry.reservoirTempC < 60;

  return (
    <div className="space-y-4">
      {/* Executive Operational Diagnostic Banner */}
      <div className="scada-panel p-4 border-l-4 border-l-sky-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
              Primary Operating Condition: {well.name}
            </span>
            <span className="text-industrial-500">|</span>
            <span className="text-xs font-mono text-industrial-400">
              Stage: {well.currentStage} (Day {well.stageDay} of {well.stageTotalDays})
            </span>
          </div>

          <h2 className="text-base font-semibold text-industrial-100 flex items-center gap-2">
            {isRodFloatWatch ? (
              <>
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>Elevated Downstroke Rod Drag & Float Risk Detected</span>
              </>
            ) : isCoolingAlert ? (
              <>
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>Near-Wellbore Thermal Decline Accelerating Viscosity Increase</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Well Operating Within Configured Technical Envelope</span>
              </>
            )}
          </h2>

          <p className="text-xs text-industrial-300 mt-1 max-w-3xl leading-relaxed">
            {isRodFloatWatch
              ? `Downstroke drag is ${3340 - telemetry.rodFloatMarginLbs} lbs against buoyant rod weight of 3,340 lbs. At ${telemetry.srpSPM} SPM and ${telemetry.estimatedViscosityCP} cP viscosity, polish rod margin is constrained to ${telemetry.rodFloatMarginLbs} lbs. Investigate reducing VFD speed to 35 Hz (4.0 SPM) or preparing CSS cycle turn-around.`
              : isCoolingAlert
              ? `Near-wellbore temperature has cooled to ${telemetry.reservoirTempC} °C, driving crude viscosity to ${telemetry.estimatedViscosityCP} cP. Production rate is ${telemetry.oilRateBOPD} bbl/day with pump fillage at ${telemetry.pumpFillagePct}%. Plan CSS cycle turn-around.`
              : `Steady production phase in cycle ${well.currentCycle}. Thermal radius maintained at ${telemetry.thermalZoneRadiusMeters}m with crude viscosity at ${telemetry.estimatedViscosityCP} cP. SRP speed of ${telemetry.srpSPM} SPM provides optimal ${telemetry.pumpFillagePct}% pump fillage.`}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
          <button
            onClick={() => onNavigate('digital_twin')}
            className="px-3 py-1.5 rounded bg-sky-950 border border-sky-600 text-sky-200 text-xs font-mono font-medium hover:bg-sky-900 transition-colors flex items-center gap-1.5"
          >
            Inspect Digital Twin
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate('srp_opt')}
            className="px-3 py-1.5 rounded bg-industrial-800 border border-industrial-700 text-industrial-200 text-xs font-mono font-medium hover:bg-industrial-750 transition-colors flex items-center gap-1.5"
          >
            Review SRP Limits
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Six Primary Domain Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* 1. Production Performance */}
        <div className="scada-panel p-3">
          <div className="flex items-center justify-between border-b border-industrial-800 pb-2 mb-2">
            <span className="text-xs font-mono font-semibold text-industrial-200 uppercase flex items-center gap-1.5">
              <Droplet className="w-4 h-4 text-sky-400" />
              Surface Production
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">
              {telemetry.oilRateBOPD} bbl/d
            </span>
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-industrial-400">
              <span>Water Cut:</span>
              <span className="text-industrial-200">{telemetry.waterCutPct}% ({telemetry.waterRateBWPD} bbl/d)</span>
            </div>
            <div className="flex justify-between text-industrial-400">
              <span>Wellhead Pressure:</span>
              <span className="text-industrial-200">{telemetry.wellheadPressurePsi} psi</span>
            </div>
            <div className="flex justify-between text-industrial-400">
              <span>Specific Lifting Energy:</span>
              <span className="text-industrial-200">{telemetry.energyConsumptionKWhBbl} kWh/bbl</span>
            </div>
          </div>
        </div>

        {/* 2. Reservoir Thermal Condition */}
        <div className="scada-panel p-3">
          <div className="flex items-center justify-between border-b border-industrial-800 pb-2 mb-2">
            <span className="text-xs font-mono font-semibold text-industrial-200 uppercase flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-petro-orange" />
              Thermal Reservoir Status
            </span>
            <span className="text-[11px] font-mono text-petro-orange font-semibold">
              {telemetry.reservoirTempC} °C
            </span>
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-industrial-400">
              <span>Estimated Crude Viscosity:</span>
              <span className="text-industrial-200">{telemetry.estimatedViscosityCP} cP</span>
            </div>
            <div className="flex justify-between text-industrial-400">
              <span>Fluid Mobility (k/μ):</span>
              <span className="text-sky-400">{telemetry.fluidMobilityMD_CP} mD/cP</span>
            </div>
            <div className="flex justify-between text-industrial-400">
              <span>Near-Wellbore Thermal Zone:</span>
              <span className="text-industrial-200">{telemetry.thermalZoneRadiusMeters} m radius</span>
            </div>
          </div>
        </div>

        {/* 3. SRP Mechanical Performance */}
        <div className="scada-panel p-3">
          <div className="flex items-center justify-between border-b border-industrial-800 pb-2 mb-2">
            <span className="text-xs font-mono font-semibold text-industrial-200 uppercase flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-emerald-400" />
              SRP Operating Dynamics
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">
              {telemetry.srpSPM} SPM ({telemetry.vfdFrequencyHz} Hz)
            </span>
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-industrial-400">
              <span>Stroke Length:</span>
              <span className="text-industrial-200">{telemetry.srpStrokeLengthInches}"</span>
            </div>
            <div className="flex justify-between text-industrial-400">
              <span>Pump Fillage / Vol. Eff:</span>
              <span className="text-industrial-200">{telemetry.pumpFillagePct}% / {telemetry.pumpEfficiencyPct}%</span>
            </div>
            <div className="flex justify-between text-industrial-400">
              <span>Peak Polished Rod Load:</span>
              <span className="text-industrial-200">{telemetry.peakPolishedRodLoadLbs} lbs</span>
            </div>
          </div>
        </div>

        {/* 4. Equipment Health & Rod Float Risk */}
        <div className="scada-panel p-3">
          <div className="flex items-center justify-between border-b border-industrial-800 pb-2 mb-2">
            <span className="text-xs font-mono font-semibold text-industrial-200 uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              Rod-Float & Pump Risk
            </span>
            <span className={`text-[11px] font-mono font-semibold ${isRodFloatWatch ? 'text-amber-400' : 'text-emerald-400'}`}>
              {telemetry.rodFloatRiskPct}% Risk
            </span>
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-industrial-400">
              <span>Downstroke Fall Margin:</span>
              <span className={telemetry.rodFloatMarginLbs < 600 ? 'text-amber-400 font-bold' : 'text-industrial-200'}>
                {telemetry.rodFloatMarginLbs} lbs
              </span>
            </div>
            <div className="flex justify-between text-industrial-400">
              <span>Viscous Drag Force:</span>
              <span className="text-industrial-200">{3340 - telemetry.rodFloatMarginLbs} lbs</span>
            </div>
            <div className="flex justify-between text-industrial-400">
              <span>Pump Failure Probability:</span>
              <span className="text-industrial-200">{telemetry.pumpFailureRiskPct}%</span>
            </div>
          </div>
        </div>

        {/* 5. CSS Cycle & Thermal Recovery */}
        <div className="scada-panel p-3">
          <div className="flex items-center justify-between border-b border-industrial-800 pb-2 mb-2">
            <span className="text-xs font-mono font-semibold text-industrial-200 uppercase flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-petro-orange" />
              CSS Cycle Conformance
            </span>
            <span className="text-[11px] font-mono text-petro-orange font-semibold">
              Cycle {well.currentCycle}
            </span>
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-industrial-400">
              <span>Specific SOR:</span>
              <span className="text-industrial-200">{telemetry.steamOilRatioSOR} bbl/bbl</span>
            </div>
            <div className="flex justify-between text-industrial-400">
              <span>Production Stage Progress:</span>
              <span className="text-industrial-200">{well.stageDay} / {well.stageTotalDays} days</span>
            </div>
            <div className="flex justify-between text-industrial-400">
              <span>Steam Channeling Risk:</span>
              <span className={telemetry.channelingRiskIndex > 40 ? 'text-petro-red font-semibold' : 'text-emerald-400'}>
                {telemetry.channelingRiskIndex} / 100
              </span>
            </div>
          </div>
        </div>

        {/* 6. Pressure Envelopes */}
        <div className="scada-panel p-3">
          <div className="flex items-center justify-between border-b border-industrial-800 pb-2 mb-2">
            <span className="text-xs font-mono font-semibold text-industrial-200 uppercase flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-sky-400" />
              Wellbore Pressure Envelope
            </span>
            <span className="text-[11px] font-mono text-industrial-300 font-semibold">
              TP: {telemetry.tubingPressurePsi} psi
            </span>
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-industrial-400">
              <span>Casing Annulus Pressure:</span>
              <span className="text-industrial-200">{telemetry.casingPressurePsi} psi</span>
            </div>
            <div className="flex justify-between text-industrial-400">
              <span>Bottomhole Flowing Pressure:</span>
              <span className="text-industrial-200">{telemetry.bottomholePressurePsi} psi</span>
            </div>
            <div className="flex justify-between text-industrial-400">
              <span>Differential Pressure:</span>
              <span className="text-industrial-200">{telemetry.bottomholePressurePsi - telemetry.tubingPressurePsi} psi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Complete SCADA Engineering Metric Cards Grid (16 Key Parameters) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-industrial-400">
            Instantaneous Field Telemetry & Operating Metrics
          </span>
          <span className="text-[11px] font-mono text-industrial-500">
            SCADA Scan Rate: 5 sec | Baghewala Field
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          <MetricCard
            label="Oil Rate"
            value={telemetry.oilRateBOPD}
            unit="bbl/d"
            trend="+3.2%"
            trendDirection="up"
            status="NORMAL"
            subtext="WC: 42%"
          />
          <MetricCard
            label="Res. Temp"
            value={telemetry.reservoirTempC}
            unit="°C"
            trend="-0.4°C"
            trendDirection="down"
            status={telemetry.reservoirTempC < 60 ? 'WATCH' : 'NORMAL'}
            subtext="T_near"
          />
          <MetricCard
            label="Viscosity"
            value={telemetry.estimatedViscosityCP}
            unit="cP"
            trend="+5%"
            trendDirection="up"
            status={telemetry.estimatedViscosityCP > 1200 ? 'WATCH' : 'NORMAL'}
            subtext="In-situ"
          />
          <MetricCard
            label="SRP Speed"
            value={telemetry.srpSPM}
            unit="SPM"
            trend="0.0"
            trendDirection="neutral"
            status="NORMAL"
            subtext={`${telemetry.vfdFrequencyHz} Hz`}
          />
          <MetricCard
            label="Pump Fillage"
            value={telemetry.pumpFillagePct}
            unit="%"
            trend="-2%"
            trendDirection="down"
            status={telemetry.pumpFillagePct < 70 ? 'WATCH' : 'NORMAL'}
            subtext="Downhole"
          />
          <MetricCard
            label="Peak Rod Load"
            value={telemetry.peakPolishedRodLoadLbs}
            unit="lbs"
            trend="+120"
            trendDirection="up"
            status="NORMAL"
            subtext="Rating: 18k"
          />
          <MetricCard
            label="Rod Float Risk"
            value={`${telemetry.rodFloatRiskPct}%`}
            unit=""
            trend="+8%"
            trendDirection="up"
            status={isRodFloatWatch ? 'WARNING' : 'NORMAL'}
            subtext={`Margin: ${telemetry.rodFloatMarginLbs} lb`}
            highlight={isRodFloatWatch}
          />
          <MetricCard
            label="SOR"
            value={telemetry.steamOilRatioSOR}
            unit="bbl/bbl"
            trend="-0.1"
            trendDirection="down"
            status="NORMAL"
            subtext="Cumulative"
          />
          <MetricCard
            label="Wellhead P."
            value={telemetry.wellheadPressurePsi}
            unit="psi"
            trend="0"
            status="NORMAL"
            subtext="Surface"
          />
          <MetricCard
            label="Casing P."
            value={telemetry.casingPressurePsi}
            unit="psi"
            trend="+4"
            status={telemetry.casingPressurePsi > 300 ? 'WARNING' : 'NORMAL'}
            subtext="Annulus"
          />
          <MetricCard
            label="Tubing P."
            value={telemetry.tubingPressurePsi}
            unit="psi"
            trend="-2"
            status="NORMAL"
            subtext="Discharge"
          />
          <MetricCard
            label="Reservoir P."
            value={telemetry.bottomholePressurePsi}
            unit="psi"
            trend="-1"
            status="NORMAL"
            subtext="Static"
          />
          <MetricCard
            label="Stroke Length"
            value={telemetry.srpStrokeLengthInches}
            unit='"'
            status="NORMAL"
            subtext="Mark II"
          />
          <MetricCard
            label="Pump Efficiency"
            value={telemetry.pumpEfficiencyPct}
            unit="%"
            status="NORMAL"
            subtext="Volumetric"
          />
          <MetricCard
            label="Specific Energy"
            value={telemetry.energyConsumptionKWhBbl}
            unit="kWh/bbl"
            status="NORMAL"
            subtext="Motor draw"
          />
          <MetricCard
            label="Channeling Risk"
            value={`${telemetry.channelingRiskIndex}/100`}
            unit=""
            status={telemetry.channelingRiskIndex > 50 ? 'CRITICAL' : 'NORMAL'}
            subtext="Conformance"
          />
        </div>
      </div>
    </div>
  );
};
