import React, { useState } from 'react';
import { TelemetryData, WellInfo } from '../types';
import { 
  Thermometer, 
  Droplet, 
  Activity, 
  Gauge, 
  Zap, 
  AlertTriangle,
  Info,
  ArrowDown,
  ArrowUp,
  Flame
} from 'lucide-react';

interface DigitalTwinDiagramProps {
  well: WellInfo;
  telemetry: TelemetryData;
}

type NodeSection = 'RESERVOIR' | 'CSS_ZONE' | 'WELLBORE' | 'SRP_DOWNHOLE' | 'SURFACE_UNIT';

export const DigitalTwinDiagram: React.FC<DigitalTwinDiagramProps> = ({ well, telemetry }) => {
  const [selectedSection, setSelectedSection] = useState<NodeSection>('RESERVOIR');

  return (
    <div className="scada-panel p-4 flex flex-col gap-4">
      {/* Top Banner: Causal Chain Flow */}
      <div className="bg-industrial-950 p-3 rounded border border-industrial-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-industrial-300 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-sky-400" />
            Physical Well-to-Surface Coupling Chain
          </span>
          <span className="text-[11px] font-mono text-industrial-400">
            Coupled CSS-SRP Hydro-Thermal Dynamics
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs font-mono">
          <div className="bg-industrial-900 p-2 rounded border border-industrial-800 flex flex-col items-center">
            <span className="text-[10px] text-industrial-400">1. Res. Temp</span>
            <span className="font-bold text-petro-orange text-sm">{telemetry.reservoirTempC} °C</span>
            <span className="text-[10px] text-industrial-400">Thermal Energy</span>
          </div>

          <div className="bg-industrial-900 p-2 rounded border border-industrial-800 flex flex-col items-center">
            <span className="text-[10px] text-industrial-400">2. Oil Viscosity</span>
            <span className="font-bold text-industrial-100 text-sm">{telemetry.estimatedViscosityCP} cP</span>
            <span className="text-[10px] text-industrial-400">Walther Model</span>
          </div>

          <div className="bg-industrial-900 p-2 rounded border border-industrial-800 flex flex-col items-center">
            <span className="text-[10px] text-industrial-400">3. Mobility</span>
            <span className="font-bold text-sky-400 text-sm">{telemetry.fluidMobilityMD_CP} mD/cP</span>
            <span className="text-[10px] text-industrial-400">Darcy Inflow</span>
          </div>

          <div className="bg-industrial-900 p-2 rounded border border-industrial-800 flex flex-col items-center">
            <span className="text-[10px] text-industrial-400">4. Downstroke Drag</span>
            <span className="font-bold text-amber-400 text-sm">{3340 - telemetry.rodFloatMarginLbs} lbs</span>
            <span className="text-[10px] text-industrial-400">Margin: {telemetry.rodFloatMarginLbs} lbs</span>
          </div>

          <div className="bg-industrial-900 p-2 rounded border border-industrial-800 flex flex-col items-center">
            <span className="text-[10px] text-industrial-400">5. Pump Fillage</span>
            <span className="font-bold text-emerald-400 text-sm">{telemetry.pumpFillagePct} %</span>
            <span className="text-[10px] text-industrial-400">{telemetry.srpSPM} SPM</span>
          </div>

          <div className="bg-industrial-900 p-2 rounded border border-industrial-800 flex flex-col items-center">
            <span className="text-[10px] text-industrial-400">6. Surface Oil Rate</span>
            <span className="font-bold text-industrial-100 text-sm">{telemetry.oilRateBOPD} bbl/d</span>
            <span className="text-[10px] text-industrial-400">WC: {telemetry.waterCutPct}%</span>
          </div>

          <div className="bg-industrial-900 p-2 rounded border border-industrial-800 flex flex-col items-center">
            <span className="text-[10px] text-industrial-400">7. Energy / SOR</span>
            <span className="font-bold text-industrial-300 text-sm">{telemetry.energyConsumptionKWhBbl} kWh/bbl</span>
            <span className="text-[10px] text-industrial-400">SOR: {telemetry.steamOilRatioSOR}</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Cross-Section & Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Engineering Schematic Diagram (SVG) */}
        <div className="lg:col-span-7 bg-industrial-950 p-3 rounded border border-industrial-800 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-industrial-400 uppercase tracking-wider">
              Subsurface to Surface Wellbore Cross-Section
            </span>
            <span className="text-[11px] font-mono text-sky-400">
              Interactive Schematic (Click Components)
            </span>
          </div>

          {/* SVG Schematic */}
          <div className="w-full relative flex justify-center py-2">
            <svg
              viewBox="0 0 540 680"
              className="w-full max-w-[500px] h-auto select-none"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}
            >
              {/* Background Geological Strata */}
              {/* Overburden Shale */}
              <rect x="20" y="80" width="500" height="130" fill="#141e30" stroke="#1c2c47" strokeWidth="1" />
              <text x="35" y="105" fill="#405782" fontSize="10" fontFamily="monospace">Overburden Shale & Siltstone (0 - 320m)</text>

              {/* Caprock Impermeable Seal */}
              <rect x="20" y="210" width="500" height="40" fill="#182338" stroke="#2b3f63" strokeWidth="1" strokeDasharray="4 2" />
              <text x="35" y="235" fill="#8ba2c7" fontSize="10" fontFamily="monospace">Caprock Impermeable Anhydrite Seal (320 - 360m)</text>

              {/* Jodhpur Sandstone Heavy Oil Reservoir */}
              <rect x="20" y="250" width="500" height="390" fill="#0f1929" stroke="#1c2c47" strokeWidth="1" />
              <text x="35" y="275" fill="#d97736" fontSize="11" fontFamily="monospace" fontWeight="bold">
                Jodhpur Sandstone Reservoir (360m - 430m TVD)
              </text>
              <text x="35" y="292" fill="#5c75a3" fontSize="10" fontFamily="monospace">
                Porosity: 26% | Permeability: 1,800 mD | Initial Temp: 42°C
              </text>

              {/* Thermal Steam Heated Zone (Concentric Ellipses around perforations) */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedSection('CSS_ZONE')}
              >
                <ellipse
                  cx="270"
                  cy="530"
                  rx="180"
                  ry="95"
                  fill="url(#steamThermalGrad)"
                  stroke="#d97736"
                  strokeWidth={selectedSection === 'CSS_ZONE' ? '2.5' : '1.5'}
                  strokeDasharray="6 3"
                  opacity="0.85"
                />
                <ellipse
                  cx="270"
                  cy="530"
                  rx="105"
                  ry="55"
                  fill="#9a5323"
                  opacity="0.4"
                />
                <text x="360" y="475" fill="#f59e0b" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  Thermal Front (R_th = {telemetry.thermalZoneRadiusMeters}m)
                </text>
                <text x="360" y="490" fill="#dce5f2" fontSize="9" fontFamily="monospace">
                  T_near = {telemetry.reservoirTempC} °C | μ = {telemetry.estimatedViscosityCP} cP
                </text>
              </g>

              {/* Radial arrows representing fluid mobility into perforations */}
              <path d="M 120 530 L 220 530" stroke="#38bdf8" strokeWidth="2" markerEnd="url(#flowArrow)" strokeDasharray="4 2" />
              <path d="M 420 530 L 320 530" stroke="#38bdf8" strokeWidth="2" markerEnd="url(#flowArrow)" strokeDasharray="4 2" />
              <text x="135" y="522" fill="#38bdf8" fontSize="9" fontFamily="monospace">Mobilized Oil Inflow</text>

              {/* SURFACE EQUIPMENT (Clickable) */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedSection('SURFACE_UNIT')}
              >
                {/* Ground Line */}
                <line x1="20" y1="80" x2="520" y2="80" stroke="#5c75a3" strokeWidth="2" />
                <text x="440" y="72" fill="#5c75a3" fontSize="10" fontFamily="monospace">Surface GL 0.0m</text>

                {/* Samson Post */}
                <polygon points="170,80 185,15 195,15 210,80" fill="#2b3f63" stroke="#405782" strokeWidth="1" />
                {/* Walking Beam */}
                <rect x="140" y="10" width="160" height="12" fill="#3b82f6" rx="2" transform="rotate(-6 220 16)" />
                {/* Horsehead */}
                <path d="M 285 5 Q 310 15 305 45 L 295 40 Z" fill="#1d4ed8" stroke="#60a5fa" strokeWidth="1" />
                {/* Counterweight & Crank */}
                <circle cx="155" cy="50" r="14" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                <rect x="145" y="40" width="20" height="12" fill="#d97736" rx="1" />
                {/* Bridle & Polished Rod to Stuffing Box */}
                <line x1="305" y1="40" x2="305" y2="85" stroke="#94a3b8" strokeWidth="2" />
                <rect x="298" y="70" width="14" height="15" fill="#f59e0b" stroke="#d97736" strokeWidth="1" />
                <text x="318" y="76" fill="#f59e0b" fontSize="9" fontFamily="monospace">Wellhead / Stuffing Box</text>
                {/* Production Flowline */}
                <path d="M 305 82 L 380 82 L 380 65 L 430 65" fill="none" stroke="#22c55e" strokeWidth="3" />
                <text x="385" y="58" fill="#22c55e" fontSize="9" fontFamily="monospace">To GGS Manifold</text>
              </g>

              {/* WELLBORE CASING & TUBING (Clickable) */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedSection('WELLBORE')}
              >
                {/* Casing 7" */}
                <rect x="250" y="80" width="40" height="490" fill="#16233b" stroke="#334155" strokeWidth="2" />
                {/* Tubing 3-1/2" */}
                <rect x="260" y="80" width="20" height="460" fill="#0b1320" stroke="#475569" strokeWidth="1.5" />
                {/* Thermal Packer */}
                <rect x="250" y="480" width="10" height="16" fill="#f97316" stroke="#ea580c" />
                <rect x="280" y="480" width="10" height="16" fill="#f97316" stroke="#ea580c" />
                <text x="160" y="492" fill="#ea580c" fontSize="9" fontFamily="monospace">Thermal Packer (385m)</text>

                {/* Perforations */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <g key={i}>
                    <line x1="244" y1={515 + i * 8} x2="252" y2={515 + i * 8} stroke="#ef4444" strokeWidth="2" />
                    <line x1="288" y1={515 + i * 8} x2="296" y2={515 + i * 8} stroke="#ef4444" strokeWidth="2" />
                  </g>
                ))}
                <text x="155" y="540" fill="#ef4444" fontSize="9" fontFamily="monospace">Perforations (405-415m)</text>
              </g>

              {/* SUCKER ROD PUMP & DOWNHOLE ASSEMBLY (Clickable) */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedSection('SRP_DOWNHOLE')}
              >
                {/* Sucker Rod String */}
                <line x1="270" y1="80" x2="270" y2="520" stroke="#e2e8f0" strokeWidth="3" />
                {/* Pump Barrel & Plunger */}
                <rect x="263" y="515" width="14" height="35" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
                {/* Traveling Valve */}
                <circle cx="270" cy="528" r="3.5" fill="#f59e0b" />
                {/* Standing Valve */}
                <circle cx="270" cy="546" r="3.5" fill="#22c55e" />
                <text x="310" y="534" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  SRP Plunger (2.25")
                </text>
                <text x="310" y="548" fill="#5c75a3" fontSize="9" fontFamily="monospace">
                  Fillage: {telemetry.pumpFillagePct}%
                </text>
              </g>

              {/* RESERVOIR MATRIX (Clickable) */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedSection('RESERVOIR')}
              >
                <circle cx="90" cy="350" r="16" fill="#1c2c47" stroke="#2b3f63" />
                <text x="83" y="354" fill="#8ba2c7" fontSize="10" fontFamily="monospace">RES</text>
              </g>

              {/* Gradients and Markers */}
              <defs>
                <radialGradient id="steamThermalGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#d97736" stopOpacity="0.8" />
                  <stop offset="45%" stopColor="#b45309" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#0b1320" stopOpacity="0.05" />
                </radialGradient>
                <marker id="flowArrow" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
                  <path d="M 0 0 L 6 3 L 0 6 z" fill="#38bdf8" />
                </marker>
              </defs>
            </svg>
          </div>

          {/* Section Selector Buttons */}
          <div className="w-full grid grid-cols-5 gap-1.5 mt-2 pt-2 border-t border-industrial-800 text-[11px] font-mono">
            <button
              onClick={() => setSelectedSection('RESERVOIR')}
              className={`py-1 rounded text-center transition-colors ${
                selectedSection === 'RESERVOIR'
                  ? 'bg-industrial-800 text-sky-400 border border-sky-600'
                  : 'bg-industrial-900 text-industrial-400 hover:text-industrial-200'
              }`}
            >
              Reservoir
            </button>
            <button
              onClick={() => setSelectedSection('CSS_ZONE')}
              className={`py-1 rounded text-center transition-colors ${
                selectedSection === 'CSS_ZONE'
                  ? 'bg-industrial-800 text-petro-orange border border-petro-orange'
                  : 'bg-industrial-900 text-industrial-400 hover:text-industrial-200'
              }`}
            >
              Steam Zone
            </button>
            <button
              onClick={() => setSelectedSection('WELLBORE')}
              className={`py-1 rounded text-center transition-colors ${
                selectedSection === 'WELLBORE'
                  ? 'bg-industrial-800 text-sky-400 border border-sky-600'
                  : 'bg-industrial-900 text-industrial-400 hover:text-industrial-200'
              }`}
            >
              Wellbore
            </button>
            <button
              onClick={() => setSelectedSection('SRP_DOWNHOLE')}
              className={`py-1 rounded text-center transition-colors ${
                selectedSection === 'SRP_DOWNHOLE'
                  ? 'bg-industrial-800 text-emerald-400 border border-emerald-600'
                  : 'bg-industrial-900 text-industrial-400 hover:text-industrial-200'
              }`}
            >
              SRP Pump
            </button>
            <button
              onClick={() => setSelectedSection('SURFACE_UNIT')}
              className={`py-1 rounded text-center transition-colors ${
                selectedSection === 'SURFACE_UNIT'
                  ? 'bg-industrial-800 text-industrial-100 border border-industrial-500'
                  : 'bg-industrial-900 text-industrial-400 hover:text-industrial-200'
              }`}
            >
              Surface Unit
            </button>
          </div>
        </div>

        {/* Right: Technical Inspector Panel for Selected Section */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {selectedSection === 'RESERVOIR' && (
            <div className="scada-panel p-3.5 flex flex-col gap-3 h-full">
              <div className="flex items-center justify-between border-b border-industrial-800 pb-2">
                <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Droplet className="w-4 h-4 text-sky-400" />
                  Reservoir & Matrix Parameters
                </span>
                <span className="text-[10px] font-mono text-industrial-400">Jodhpur Formation</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-industrial-850">
                  <span className="text-industrial-400">Formation Depth:</span>
                  <span className="text-industrial-100 font-semibold">{well.depthMeters} m TVD (Shallow Sand)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-industrial-850">
                  <span className="text-industrial-400">Reservoir Static Pressure:</span>
                  <span className="text-industrial-100 font-semibold">{telemetry.bottomholePressurePsi} psi</span>
                </div>
                <div className="flex justify-between py-1 border-b border-industrial-850">
                  <span className="text-industrial-400">Native Far-Field Temp:</span>
                  <span className="text-industrial-100 font-semibold">42.0 °C</span>
                </div>
                <div className="flex justify-between py-1 border-b border-industrial-850">
                  <span className="text-industrial-400">API Crude Gravity:</span>
                  <span className="text-industrial-100 font-semibold">{well.apiGravity}° API (Heavy Viscous)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-industrial-850">
                  <span className="text-industrial-400">Dead Oil Viscosity (40°C):</span>
                  <span className="text-petro-orange font-semibold">22,000 cP (Immobile without CSS)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-industrial-850">
                  <span className="text-industrial-400">Water Cut (WC):</span>
                  <span className="text-industrial-100 font-semibold">{telemetry.waterCutPct} %</span>
                </div>
              </div>

              <div className="mt-auto bg-industrial-950 p-2.5 rounded border border-industrial-800 text-[11px] text-industrial-300">
                <div className="font-semibold text-industrial-200 mb-1">Engineering Dynamics:</div>
                At initial reservoir temperature (42°C), Baghewala heavy oil exhibits zero natural mobility. Thermal stimulation through CSS is mandatory to reduce crude viscosity from ~22,000 cP down to &lt;200 cP for Sucker Rod lifting.
              </div>
            </div>
          )}

          {selectedSection === 'CSS_ZONE' && (
            <div className="scada-panel p-3.5 flex flex-col gap-3 h-full">
              <div className="flex items-center justify-between border-b border-industrial-800 pb-2">
                <span className="text-xs font-mono font-bold text-petro-orange uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-petro-orange" />
                  Thermal Stimulation & Steam Chamber
                </span>
                <span className="text-[10px] font-mono text-petro-orange">Cycle {well.currentCycle}</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-industrial-850">
                  <span className="text-industrial-400">Near-Wellbore Temperature:</span>
                  <span className="text-petro-orange font-semibold">{telemetry.reservoirTempC} °C</span>
                </div>
                <div className="flex justify-between py-1 border-b border-industrial-850">
                  <span className="text-industrial-400">Estimated Viscosity at T_res:</span>
                  <span className="text-industrial-100 font-semibold">{telemetry.estimatedViscosityCP} cP</span>
                </div>
                <div className="flex justify-between py-1 border-b border-industrial-850">
                  <span className="text-industrial-400">Heated Thermal Radius:</span>
                  <span className="text-industrial-100 font-semibold">{telemetry.thermalZoneRadiusMeters} meters</span>
                </div>
                <div className="flex justify-between py-1 border-b border-industrial-850">
                  <span className="text-industrial-400">Steam Oil Ratio (SOR):</span>
                  <span className="text-industrial-100 font-semibold">{telemetry.steamOilRatioSOR} bbl/bbl</span>
                </div>
                <div className="flex justify-between py-1 border-b border-industrial-850">
                  <span className="text-industrial-400">Channeling Risk Index:</span>
                  <span className={`font-semibold ${telemetry.channelingRiskIndex > 50 ? 'text-petro-red' : 'text-emerald-400'}`}>
                    {telemetry.channelingRiskIndex} / 100 ({telemetry.channelingRiskIndex > 50 ? 'HIGH' : 'NORMAL'})
                  </span>
                </div>
              </div>

              <div className="mt-auto bg-industrial-950 p-2.5 rounded border border-industrial-800 text-[11px] text-industrial-300">
                <div className="font-semibold text-industrial-200 mb-1">Thermal Decay Impact:</div>
                Thermal energy dissipates into overburden and produced fluids. As temperature decays below 70°C, viscosity jumps exponentially, increasing downstroke rod drag and threatening rod float.
              </div>
            </div>
          )}

          {selectedSection === 'WELLBORE' && (
            <div className="scada-panel p-3.5 flex flex-col gap-3 h-full">
              <div className="flex items-center justify-between border-b border-industrial-800 pb-2">
                <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-sky-400" />
                  Wellbore & Pressure Envelopes
                </span>
                <span className="text-[10px] font-mono text-industrial-400">Completion</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-industrial-850">
                  <span className="text-industrial-400">Wellhead Pressure (WHP):</span>
                  <span className="text-industrial-100 font-semibold">{telemetry.wellheadPressurePsi} psi</span>
                </div>
                <div className="flex justify-between py-1 border-b border-industrial-850">
                  <span className="text-industrial-400">Tubing Pressure (TP):</span>
                  <span className="text-industrial-100 font-semibold">{telemetry.tubingPressurePsi} psi</span>
                </div>
                <div className="flex justify-between py-1 border-b border-industrial-850">
                  <span className="text-industrial-400">Casing Annulus Pressure (CP):</span>
                  <span className="text-industrial-100 font-semibold">{telemetry.casingPressurePsi} psi</span>
                </div>
                <div className="flex justify-between py-1 border-b border-industrial-850">
                  <span className="text-industrial-400">Bottomhole Flowing Pressure:</span>
                  <span className="text-industrial-100 font-semibold">{telemetry.bottomholePressurePsi} psi</span>
                </div>
                <div className="flex justify-between py-1 border-b border-industrial-850">
                  <span className="text-industrial-400">Tubing String Spec:</span>
                  <span className="text-industrial-100 font-semibold">3-1/2" EUE, 9.3 lb/ft, J-55</span>
                </div>
              </div>

              <div className="mt-auto bg-industrial-950 p-2.5 rounded border border-industrial-800 text-[11px] text-industrial-300">
                <div className="font-semibold text-industrial-200 mb-1">Hydraulic Balance:</div>
                Casing pressure monitoring provides immediate early warning for thermal packer leakage or steam breakthrough during injection cycles.
              </div>
            </div>
          )}

          {selectedSection === 'SRP_DOWNHOLE' && (
            <div className="scada-panel p-3.5 flex flex-col gap-3 h-full">
              <div className="flex items-center justify-between border-b border-industrial-800 pb-2">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  SRP Downhole Assembly Diagnostics
                </span>
                <span className="text-[10px] font-mono text-emerald-400">{well.pumpType}</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-industrial-850">
                  <span className="text-industrial-400">Pumping Speed (SPM):</span>
                  <span className="text-industrial-100 font-semibold">{telemetry.srpSPM} strokes/min</span>
                </div>
                <div className="flex justify-between py-1 border-b border-industrial-850">
                  <span className="text-industrial-400">Stroke Length:</span>
                  <span className="text-industrial-100 font-semibold">{telemetry.srpStrokeLengthInches} inches</span>
                </div>
                <div className="flex justify-between py-1 border-b border-industrial-850">
                  <span className="text-industrial-400">Downhole Pump Fillage:</span>
                  <span className="text-emerald-400 font-semibold">{telemetry.pumpFillagePct} %</span>
                </div>
                <div className="flex justify-between py-1 border-b border-industrial-850">
                  <span className="text-industrial-400">Buoyant Rod Weight:</span>
                  <span className="text-industrial-100 font-semibold">3,340 lbs</span>
                </div>
                <div className="flex justify-between py-1 border-b border-industrial-850">
                  <span className="text-industrial-400">Downstroke Viscous Drag:</span>
                  <span className="text-amber-400 font-semibold">{3340 - telemetry.rodFloatMarginLbs} lbs</span>
                </div>
                <div className="flex justify-between py-1 border-b border-industrial-850">
                  <span className="text-industrial-400">Net Rod Downward Margin:</span>
                  <span className={`font-semibold ${telemetry.rodFloatMarginLbs < 600 ? 'text-petro-orange' : 'text-emerald-400'}`}>
                    {telemetry.rodFloatMarginLbs} lbs ({telemetry.rodFloatRiskPct}% float risk)
                  </span>
                </div>
              </div>

              <div className="mt-auto bg-industrial-950 p-2.5 rounded border border-industrial-800 text-[11px] text-industrial-300">
                <div className="font-semibold text-industrial-200 mb-1">Heavy Oil Pumping Principle:</div>
                Excessive SPM in cold heavy oil leads to standing valve choking and rod floating. The optimal operating point balances fluid entry velocity with rod string terminal fall velocity.
              </div>
            </div>
          )}

          {selectedSection === 'SURFACE_UNIT' && (
            <div className="scada-panel p-3.5 flex flex-col gap-3 h-full">
              <div className="flex items-center justify-between border-b border-industrial-800 pb-2">
                <span className="text-xs font-mono font-bold text-industrial-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-sky-400" />
                  Surface Beam Unit & Drive
                </span>
                <span className="text-[10px] font-mono text-industrial-400">{well.motorRatingHP} HP VFD Drive</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-industrial-850">
                  <span className="text-industrial-400">Surface Oil Production:</span>
                  <span className="text-industrial-100 font-semibold">{telemetry.oilRateBOPD} bbl/day</span>
                </div>
                <div className="flex justify-between py-1 border-b border-industrial-850">
                  <span className="text-industrial-400">VFD Drive Frequency:</span>
                  <span className="text-industrial-100 font-semibold">{telemetry.vfdFrequencyHz} Hz</span>
                </div>
                <div className="flex justify-between py-1 border-b border-industrial-850">
                  <span className="text-industrial-400">Peak Polished Rod Load:</span>
                  <span className="text-industrial-100 font-semibold">{telemetry.peakPolishedRodLoadLbs} lbs</span>
                </div>
                <div className="flex justify-between py-1 border-b border-industrial-850">
                  <span className="text-industrial-400">Minimum Rod Load:</span>
                  <span className="text-industrial-100 font-semibold">{telemetry.minPolishedRodLoadLbs} lbs</span>
                </div>
                <div className="flex justify-between py-1 border-b border-industrial-850">
                  <span className="text-industrial-400">Specific Lifting Energy:</span>
                  <span className="text-industrial-100 font-semibold">{telemetry.energyConsumptionKWhBbl} kWh/bbl</span>
                </div>
              </div>

              <div className="mt-auto bg-industrial-950 p-2.5 rounded border border-industrial-800 text-[11px] text-industrial-300">
                <div className="font-semibold text-industrial-200 mb-1">Energy Optimization:</div>
                Adjusting VFD frequency allows precise speed tuning to track reservoir thermal decline without mechanical gearbox or belt changes.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
