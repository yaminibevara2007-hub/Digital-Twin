import React, { useState } from 'react';
import { TelemetryData, WellInfo, NavTab } from '../types';
import { DigitalTwinDiagram, ComponentId } from '../components/DigitalTwinDiagram';

interface DigitalTwinPageProps {
  well: WellInfo;
  telemetry: TelemetryData;
  onNavigate: (tab: NavTab) => void;
}

export const DigitalTwinPage: React.FC<DigitalTwinPageProps> = ({ well, telemetry }) => {
  const [selectedComponent, setSelectedComponent] = useState<ComponentId>('RESERVOIR');

  const wellCode = well.name.replace('BW-', 'BGW-').split(' ')[0];

  return (
    <div className="space-y-8 select-none">
      {/* 1. DIGITAL TWIN PAGE HEADER (Spacious, simple, no big card) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <div className="text-xs font-semibold text-app-muted uppercase tracking-wider mb-1">
            Digital Twin
          </div>
          <h1 className="text-2xl font-semibold text-app-text tracking-tight">
            Well-to-Surface Operating Model
          </h1>
          <p className="text-[13px] text-app-muted mt-1 font-normal">
            {wellCode} · {well.currentStage === 'PRODUCTION' ? 'Producer' : well.currentStage} · Production Cycle {well.currentCycle}
          </p>

          {/* Process Flow Indicator */}
          <div className="flex items-center gap-2 text-xs font-medium text-app-muted mt-2.5">
            <span className="text-app-navy font-semibold">Reservoir</span>
            <span>→</span>
            <span className="text-app-text">Wellbore</span>
            <span>→</span>
            <span className="text-app-text">SRP</span>
            <span>→</span>
            <span className="text-app-text">Surface</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-app-softGreen border border-[#D5EFE1] text-xs font-medium text-app-green">
            <span className="w-2 h-2 rounded-full bg-app-green" />
            <span>Operating Normally</span>
          </span>
        </div>
      </div>

      {/* 2. MAIN BALANCED TWO-COLUMN LAYOUT (LEFT 65%, RIGHT 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: Digital Twin Visualization (65% width / 8 cols) */}
        <div className="lg:col-span-8 bg-white border border-app-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-app-border">
            <div>
              <h2 className="text-base font-semibold text-app-text tracking-tight">
                Well Cross-Section
              </h2>
              <div className="text-xs text-app-muted mt-0.5">
                Reservoir → Wellbore → Surface
              </div>
            </div>
            <div className="text-xs text-app-muted hidden sm:block">
              Formation: Jodhpur Sandstone
            </div>
          </div>

          {/* Interactive Cross-Section Schematic */}
          <DigitalTwinDiagram
            telemetry={telemetry}
            selectedComponent={selectedComponent}
            onSelectComponent={setSelectedComponent}
          />
        </div>

        {/* RIGHT PANEL: Technical Inspector (35% width / 4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* SECTION 1: WELL CONDITION */}
          <div className="bg-white border border-app-border rounded-lg p-5">
            <h3 className="text-sm font-semibold text-app-text tracking-tight mb-3 pb-2 border-b border-app-border">
              Well Condition
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#F8FAFC]">
                <span className="text-app-text font-medium">Reservoir</span>
                <span className="flex items-center gap-1.5 text-app-green font-medium">
                  <span className="w-2 h-2 rounded-full bg-app-green" />
                  <span>Normal</span>
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#F8FAFC]">
                <span className="text-app-text font-medium">Thermal Zone</span>
                <span className="flex items-center gap-1.5 text-app-green font-medium">
                  <span className="w-2 h-2 rounded-full bg-app-green" />
                  <span>Normal</span>
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#F8FAFC]">
                <span className="text-app-text font-medium">Wellbore</span>
                <span className="flex items-center gap-1.5 text-app-green font-medium">
                  <span className="w-2 h-2 rounded-full bg-app-green" />
                  <span>Normal</span>
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#F8FAFC]">
                <span className="text-app-text font-medium">SRP</span>
                <span className="flex items-center gap-1.5 text-app-green font-medium">
                  <span className="w-2 h-2 rounded-full bg-app-green" />
                  <span>Normal</span>
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-app-text font-medium">Surface Production</span>
                <span className="flex items-center gap-1.5 text-app-green font-medium">
                  <span className="w-2 h-2 rounded-full bg-app-green" />
                  <span>Normal</span>
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: SELECTED COMPONENT DETAILS */}
          <div className="bg-white border border-app-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-app-border">
              <div>
                <span className="text-[11px] font-semibold text-app-muted uppercase tracking-wider">
                  Component Inspector
                </span>
                <h3 className="text-sm font-semibold text-app-text tracking-tight uppercase mt-0.5">
                  {selectedComponent === 'RESERVOIR' && 'Reservoir'}
                  {selectedComponent === 'THERMAL_ZONE' && 'Thermal Zone'}
                  {selectedComponent === 'WELLBORE' && 'Wellbore'}
                  {selectedComponent === 'SRP' && 'SRP Assembly'}
                  {selectedComponent === 'WELLHEAD' && 'Wellhead & Surface'}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-app-softGreen text-app-green border border-[#D5EFE1]">
                Active
              </span>
            </div>

            {/* RESERVOIR DETAILS */}
            {selectedComponent === 'RESERVOIR' && (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#F8FAFC]">
                  <span className="text-app-muted">Formation:</span>
                  <span className="font-semibold text-app-text">Jodhpur Sandstone</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F8FAFC]">
                  <span className="text-app-muted">Temperature:</span>
                  <span className="font-mono font-semibold text-app-text">{Math.round(telemetry.reservoirTempC)} °C</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F8FAFC]">
                  <span className="text-app-muted">Pressure:</span>
                  <span className="font-mono font-semibold text-app-text">{telemetry.bottomholePressurePsi} psi</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F8FAFC]">
                  <span className="text-app-muted">Estimated Viscosity:</span>
                  <span className="font-mono font-semibold text-app-text">{telemetry.estimatedViscosityCP} cP</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-app-muted">Thermal Radius:</span>
                  <span className="font-mono font-semibold text-app-text">{telemetry.thermalZoneRadiusMeters} m</span>
                </div>
              </div>
            )}

            {/* THERMAL ZONE DETAILS */}
            {selectedComponent === 'THERMAL_ZONE' && (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#F8FAFC]">
                  <span className="text-app-muted">Temperature:</span>
                  <span className="font-mono font-semibold text-app-steam">{Math.round(telemetry.reservoirTempC)} °C</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F8FAFC]">
                  <span className="text-app-muted">Estimated Viscosity:</span>
                  <span className="font-mono font-semibold text-app-text">{telemetry.estimatedViscosityCP} cP</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F8FAFC]">
                  <span className="text-app-muted">Thermal Radius:</span>
                  <span className="font-mono font-semibold text-app-text">{telemetry.thermalZoneRadiusMeters} m</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-app-muted">Status:</span>
                  <span className="font-medium text-app-green">Normal Conduction</span>
                </div>
              </div>
            )}

            {/* WELLBORE DETAILS */}
            {selectedComponent === 'WELLBORE' && (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#F8FAFC]">
                  <span className="text-app-muted">Wellhead Pressure:</span>
                  <span className="font-mono font-semibold text-app-text">{telemetry.wellheadPressurePsi} psi</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F8FAFC]">
                  <span className="text-app-muted">Tubing Pressure:</span>
                  <span className="font-mono font-semibold text-app-text">{telemetry.tubingPressurePsi} psi</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F8FAFC]">
                  <span className="text-app-muted">Casing Pressure:</span>
                  <span className="font-mono font-semibold text-app-text">{telemetry.casingPressurePsi} psi</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-app-muted">Differential Pressure:</span>
                  <span className="font-mono font-semibold text-app-text">{telemetry.bottomholePressurePsi - telemetry.tubingPressurePsi} psi</span>
                </div>
              </div>
            )}

            {/* SRP DETAILS */}
            {selectedComponent === 'SRP' && (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#F8FAFC]">
                  <span className="text-app-muted">Stroke Length:</span>
                  <span className="font-mono font-semibold text-app-text">{telemetry.srpStrokeLengthInches} in</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F8FAFC]">
                  <span className="text-app-muted">Speed:</span>
                  <span className="font-mono font-semibold text-app-navy">{telemetry.srpSPM} SPM</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F8FAFC]">
                  <span className="text-app-muted">Pump Fillage:</span>
                  <span className="font-mono font-semibold text-app-green">{telemetry.pumpFillagePct}%</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-app-muted">Peak Rod Load:</span>
                  <span className="font-mono font-semibold text-app-text">{telemetry.peakPolishedRodLoadLbs} lbs</span>
                </div>
              </div>
            )}

            {/* WELLHEAD DETAILS */}
            {selectedComponent === 'WELLHEAD' && (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#F8FAFC]">
                  <span className="text-app-muted">Surface Unit:</span>
                  <span className="font-semibold text-app-text">Mark II Pumpjack</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F8FAFC]">
                  <span className="text-app-muted">Wellhead Pressure:</span>
                  <span className="font-mono font-semibold text-app-text">{telemetry.wellheadPressurePsi} psi</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F8FAFC]">
                  <span className="text-app-muted">Flowline:</span>
                  <span className="font-medium text-app-green">To GGS Manifold</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-app-muted">Surface Oil Rate:</span>
                  <span className="font-mono font-semibold text-app-text">{telemetry.oilRateBOPD} bbl/day</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. BOTTOM SUMMARY: KEY OPERATING PARAMETERS (Section 11) */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-app-muted mb-3">
          Key Operating Parameters
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Reservoir Temperature */}
          <div className="bg-white border border-app-border rounded-lg p-5">
            <div className="text-xs text-app-muted font-normal">
              Reservoir Temperature
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-[28px] font-semibold text-app-text tracking-tight font-mono">
                {Math.round(telemetry.reservoirTempC)}
              </span>
              <span className="text-xs text-app-muted font-normal">
                °C
              </span>
            </div>
            <div className="text-xs text-app-green font-medium mt-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-app-green" />
              <span>Normal Range</span>
            </div>
          </div>

          {/* Card 2: Estimated Viscosity */}
          <div className="bg-white border border-app-border rounded-lg p-5">
            <div className="text-xs text-app-muted font-normal">
              Estimated Viscosity
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-[28px] font-semibold text-app-text tracking-tight font-mono">
                {telemetry.estimatedViscosityCP}
              </span>
              <span className="text-xs text-app-muted font-normal">
                cP
              </span>
            </div>
            <div className="text-xs text-app-green font-medium mt-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-app-green" />
              <span>Mobile In-Situ</span>
            </div>
          </div>

          {/* Card 3: SRP Speed */}
          <div className="bg-white border border-app-border rounded-lg p-5">
            <div className="text-xs text-app-muted font-normal">
              SRP Speed
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-[28px] font-semibold text-app-text tracking-tight font-mono">
                {telemetry.srpSPM.toFixed(1)}
              </span>
              <span className="text-xs text-app-muted font-normal">
                SPM
              </span>
            </div>
            <div className="text-xs text-app-green font-medium mt-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-app-green" />
              <span>Harmonized Speed</span>
            </div>
          </div>

          {/* Card 4: Pump Fillage */}
          <div className="bg-white border border-app-border rounded-lg p-5">
            <div className="text-xs text-app-muted font-normal">
              Pump Fillage
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-[28px] font-semibold text-app-text tracking-tight font-mono">
                {telemetry.pumpFillagePct}
              </span>
              <span className="text-xs text-app-muted font-normal">
                %
              </span>
            </div>
            <div className="text-xs text-app-green font-medium mt-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-app-green" />
              <span>Normal Intake</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
