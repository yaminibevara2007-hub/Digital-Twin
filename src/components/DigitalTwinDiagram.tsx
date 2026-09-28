import React from 'react';
import { TelemetryData } from '../types';

export type ComponentId = 'RESERVOIR' | 'THERMAL_ZONE' | 'WELLBORE' | 'SRP' | 'WELLHEAD';

interface DigitalTwinDiagramProps {
  telemetry: TelemetryData;
  selectedComponent: ComponentId;
  onSelectComponent: (component: ComponentId) => void;
}

export const DigitalTwinDiagram: React.FC<DigitalTwinDiagramProps> = ({
  telemetry,
  selectedComponent,
  onSelectComponent,
}) => {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Interactive Quick Component Tabs */}
      <div className="w-full flex flex-wrap items-center justify-between gap-1.5 mb-4 pb-3 border-b border-app-border text-xs">
        <span className="text-[11px] font-semibold text-app-muted uppercase tracking-wider">
          Select Component to Inspect:
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {(
            [
              { id: 'RESERVOIR', label: 'Reservoir' },
              { id: 'THERMAL_ZONE', label: 'Thermal Zone' },
              { id: 'WELLBORE', label: 'Wellbore' },
              { id: 'SRP', label: 'SRP' },
              { id: 'WELLHEAD', label: 'Wellhead' },
            ] as { id: ComponentId; label: string }[]
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectComponent(item.id)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedComponent === item.id
                  ? 'bg-app-navy text-white font-semibold'
                  : 'bg-app-bg text-app-text hover:bg-app-softBlue hover:text-app-navy border border-app-border'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Engineering Diagram */}
      <div className="w-full relative flex justify-center py-2">
        <svg
          viewBox="0 0 580 560"
          className="w-full max-w-[540px] h-auto select-none"
        >
          {/* DEFINITIONS */}
          <defs>
            <marker
              id="flowArrow"
              markerWidth="6"
              markerHeight="6"
              refX="4"
              refY="3"
              orient="auto"
            >
              <path d="M 0 0 L 6 3 L 0 6 z" fill="#3B82A0" />
            </marker>
          </defs>

          {/* ============================================================== */}
          {/* 1. GEOLOGICAL STRATA LAYERS (Subtle, soft earth tones) */}
          {/* ============================================================== */}

          {/* Overburden Layer (0 - 320m) */}
          <rect
            x="40"
            y="70"
            width="500"
            height="110"
            fill="#F9FAFB"
            stroke="#E5E7EB"
            strokeWidth="1"
          />
          <text
            x="55"
            y="95"
            fill="#64748B"
            fontSize="10"
            fontFamily="Inter, sans-serif"
            fontWeight="500"
          >
            Overburden Shale & Siltstone (0 – 320m)
          </text>

          {/* Caprock Impermeable Anhydrite Seal (320 - 360m) */}
          <rect
            x="40"
            y="180"
            width="500"
            height="40"
            fill="#ECEFEA"
            stroke="#D1D5DB"
            strokeWidth="1"
            strokeDasharray="4 2"
          />
          <text
            x="55"
            y="204"
            fill="#475569"
            fontSize="10"
            fontFamily="Inter, sans-serif"
            fontWeight="600"
          >
            Caprock Impermeable Seal (320 – 360m)
          </text>

          {/* Jodhpur Sandstone Heavy Oil Formation (360 - 430m) */}
          <g
            className="cursor-pointer"
            onClick={() => onSelectComponent('RESERVOIR')}
          >
            <rect
              x="40"
              y="220"
              width="500"
              height="320"
              fill={selectedComponent === 'RESERVOIR' ? '#FAF6ED' : '#FBF9F5'}
              stroke={selectedComponent === 'RESERVOIR' ? '#183B56' : '#E5E7EB'}
              strokeWidth={selectedComponent === 'RESERVOIR' ? '1.5' : '1'}
              rx="2"
            />
            <text
              x="55"
              y="245"
              fill="#B7791F"
              fontSize="11"
              fontFamily="Inter, sans-serif"
              fontWeight="600"
            >
              Jodhpur Sandstone
            </text>
            <text
              x="55"
              y="262"
              fill="#64748B"
              fontSize="10"
              fontFamily="Inter, sans-serif"
            >
              Reservoir Formation (360m – 430m TVD)
            </text>
          </g>

          {/* ============================================================== */}
          {/* 2. THERMAL ZONE (Muted soft orange fill, thin dashed boundary) */}
          {/* ============================================================== */}
          <g
            className="cursor-pointer"
            onClick={() => onSelectComponent('THERMAL_ZONE')}
          >
            {/* Outer Thermal Front Boundary */}
            <ellipse
              cx="290"
              cy="430"
              rx="155"
              ry="75"
              fill="#FFF8F2"
              stroke="#D9824B"
              strokeWidth={selectedComponent === 'THERMAL_ZONE' ? '2.5' : '1.5'}
              strokeDasharray="5 3"
            />
            {/* Inner Heated Chamber */}
            <ellipse
              cx="290"
              cy="430"
              rx="85"
              ry="42"
              fill="#FED7AA"
              opacity={selectedComponent === 'THERMAL_ZONE' ? '0.6' : '0.4'}
            />
            {/* Label inside zone */}
            <text
              x="215"
              y="468"
              textAnchor="middle"
              fill="#C2410C"
              fontSize="10"
              fontFamily="Inter, sans-serif"
              fontWeight="600"
            >
              Thermal Zone
            </text>
          </g>

          {/* Inflow Direction Indicators */}
          <path
            d="M 155 430 L 235 430"
            stroke="#3B82A0"
            strokeWidth="1.5"
            markerEnd="url(#flowArrow)"
            strokeDasharray="3 2"
          />
          <path
            d="M 425 430 L 345 430"
            stroke="#3B82A0"
            strokeWidth="1.5"
            markerEnd="url(#flowArrow)"
            strokeDasharray="3 2"
          />
          <text
            x="160"
            y="422"
            fill="#3B82A0"
            fontSize="9"
            fontFamily="Inter, sans-serif"
            fontWeight="500"
          >
            Oil Inflow
          </text>

          {/* ============================================================== */}
          {/* 3. SURFACE EQUIPMENT & WELLHEAD */}
          {/* ============================================================== */}
          {/* Ground Line */}
          <line
            x1="40"
            y1="70"
            x2="540"
            y2="70"
            stroke="#94A3B8"
            strokeWidth="1.5"
          />
          <text
            x="475"
            y="62"
            fill="#94A3B8"
            fontSize="9"
            fontFamily="Inter, sans-serif"
          >
            Surface 0m
          </text>

          {/* Surface Pumpjack & Wellhead Group */}
          <g
            className="cursor-pointer"
            onClick={() => onSelectComponent('WELLHEAD')}
          >
            {/* Samson Post */}
            <polygon
              points="195,70 210,18 218,18 233,70"
              fill="#E2E8F0"
              stroke="#64748B"
              strokeWidth="1"
            />
            {/* Walking Beam */}
            <rect
              x="165"
              y="14"
              width="140"
              height="10"
              fill="#315A75"
              rx="2"
              transform="rotate(-5 235 19)"
            />
            {/* Horsehead */}
            <path
              d="M 288 8 Q 306 18 300 44 L 292 40 Z"
              fill="#183B56"
              stroke="#0F2B3E"
              strokeWidth="1"
            />
            {/* Counterweight & Crank */}
            <circle
              cx="180"
              cy="46"
              r="12"
              fill="#F1F5F9"
              stroke="#64748B"
              strokeWidth="1.2"
            />
            <rect
              x="172"
              y="38"
              width="16"
              height="10"
              fill="#D9824B"
              rx="1"
            />
            {/* Bridle & Polished Rod to Stuffing Box */}
            <line
              x1="300"
              y1="40"
              x2="300"
              y2="70"
              stroke="#475569"
              strokeWidth="1.5"
            />

            {/* Wellhead / Stuffing Box */}
            <rect
              x="292"
              y="60"
              width="16"
              height="15"
              fill={selectedComponent === 'WELLHEAD' ? '#EAF3F8' : '#FFFFFF'}
              stroke={selectedComponent === 'WELLHEAD' ? '#183B56' : '#B7791F'}
              strokeWidth={selectedComponent === 'WELLHEAD' ? '2' : '1.5'}
              rx="2"
            />

            {/* Flowline to GGS */}
            <path
              d="M 300 68 L 360 68 L 360 52 L 400 52"
              fill="none"
              stroke="#3D8B68"
              strokeWidth="2"
            />
            <text
              x="365"
              y="46"
              fill="#3D8B68"
              fontSize="9"
              fontFamily="Inter, sans-serif"
              fontWeight="500"
            >
              To GGS
            </text>
          </g>

          {/* ============================================================== */}
          {/* 4. WELLBORE (Casing & Tubing) */}
          {/* ============================================================== */}
          <g
            className="cursor-pointer"
            onClick={() => onSelectComponent('WELLBORE')}
          >
            {/* Outer Casing 7" */}
            <rect
              x="274"
              y="70"
              width="32"
              height="440"
              fill="#F8FAFC"
              stroke={selectedComponent === 'WELLBORE' ? '#183B56' : '#94A3B8'}
              strokeWidth={selectedComponent === 'WELLBORE' ? '2.5' : '1.5'}
            />
            {/* Inner Tubing 3-1/2" */}
            <rect
              x="282"
              y="70"
              width="16"
              height="390"
              fill="#E2E8F0"
              stroke="#64748B"
              strokeWidth="1"
            />

            {/* Thermal Packer at 385m */}
            <rect
              x="274"
              y="380"
              width="8"
              height="14"
              fill="#D9824B"
              stroke="#B45309"
              strokeWidth="1"
            />
            <rect
              x="298"
              y="380"
              width="8"
              height="14"
              fill="#D9824B"
              stroke="#B45309"
              strokeWidth="1"
            />

            {/* Perforations */}
            {Array.from({ length: 6 }).map((_, i) => (
              <g key={i}>
                <line
                  x1="268"
                  y1={418 + i * 8}
                  x2="274"
                  y2={418 + i * 8}
                  stroke="#C94A4A"
                  strokeWidth="1.5"
                />
                <line
                  x1="306"
                  y1={418 + i * 8}
                  x2="312"
                  y2={418 + i * 8}
                  stroke="#C94A4A"
                  strokeWidth="1.5"
                />
              </g>
            ))}
          </g>

          {/* ============================================================== */}
          {/* 5. SUCKER ROD PUMP & PLUNGER */}
          {/* ============================================================== */}
          <g
            className="cursor-pointer"
            onClick={() => onSelectComponent('SRP')}
          >
            {/* Sucker Rod String */}
            <line
              x1="290"
              y1="70"
              x2="290"
              y2="425"
              stroke="#183B56"
              strokeWidth={selectedComponent === 'SRP' ? '2.5' : '2'}
            />

            {/* Pump Barrel & Plunger */}
            <rect
              x="284"
              y="420"
              width="12"
              height="30"
              fill={selectedComponent === 'SRP' ? '#EAF3F8' : '#FFFFFF'}
              stroke={selectedComponent === 'SRP' ? '#183B56' : '#3B82A0'}
              strokeWidth={selectedComponent === 'SRP' ? '2' : '1.5'}
              rx="1"
            />
            {/* Traveling Valve */}
            <circle cx="290" cy="430" r="2.5" fill="#D9824B" />
            {/* Standing Valve */}
            <circle cx="290" cy="444" r="2.5" fill="#3D8B68" />
          </g>

          {/* ============================================================== */}
          {/* 6. CLEAN RECTANGULAR CALLOUTS (Outside Diagram, No Text Overlap) */}
          {/* ============================================================== */}

          {/* Callout: Wellhead */}
          <g
            className="cursor-pointer"
            onClick={() => onSelectComponent('WELLHEAD')}
          >
            <line x1="308" y1="65" x2="330" y2="35" stroke="#CBD5E1" strokeWidth="1" />
            <rect
              x="330"
              y="22"
              width="100"
              height="28"
              rx="6"
              fill="#FFFFFF"
              stroke={selectedComponent === 'WELLHEAD' ? '#183B56' : '#E5E7EB'}
              strokeWidth={selectedComponent === 'WELLHEAD' ? '1.5' : '1'}
            />
            <text x="338" y="35" fill="#172033" fontSize="9" fontWeight="600" fontFamily="Inter, sans-serif">
              Wellhead
            </text>
            <text x="338" y="45" fill="#64748B" fontSize="8" fontFamily="Inter, sans-serif">
              {telemetry.wellheadPressurePsi} psi
            </text>
          </g>

          {/* Callout: Wellbore */}
          <g
            className="cursor-pointer"
            onClick={() => onSelectComponent('WELLBORE')}
          >
            <line x1="306" y1="140" x2="355" y2="140" stroke="#CBD5E1" strokeWidth="1" />
            <rect
              x="355"
              y="126"
              width="110"
              height="28"
              rx="6"
              fill="#FFFFFF"
              stroke={selectedComponent === 'WELLBORE' ? '#183B56' : '#E5E7EB'}
              strokeWidth={selectedComponent === 'WELLBORE' ? '1.5' : '1'}
            />
            <text x="363" y="139" fill="#172033" fontSize="9" fontWeight="600" fontFamily="Inter, sans-serif">
              Wellbore
            </text>
            <text x="363" y="149" fill="#64748B" fontSize="8" fontFamily="Inter, sans-serif">
              Casing 7" · Tubing 3.5"
            </text>
          </g>

          {/* Callout: SRP Plunger */}
          <g
            className="cursor-pointer"
            onClick={() => onSelectComponent('SRP')}
          >
            <line x1="296" y1="435" x2="360" y2="435" stroke="#CBD5E1" strokeWidth="1" />
            <rect
              x="360"
              y="421"
              width="95"
              height="28"
              rx="6"
              fill="#FFFFFF"
              stroke={selectedComponent === 'SRP' ? '#183B56' : '#E5E7EB'}
              strokeWidth={selectedComponent === 'SRP' ? '1.5' : '1'}
            />
            <text x="368" y="434" fill="#172033" fontSize="9" fontWeight="600" fontFamily="Inter, sans-serif">
              SRP Plunger
            </text>
            <text x="368" y="444" fill="#64748B" fontSize="8" fontFamily="Inter, sans-serif">
              {telemetry.srpSPM} SPM · 2.25"
            </text>
          </g>

          {/* Callout: Thermal Zone */}
          <g
            className="cursor-pointer"
            onClick={() => onSelectComponent('THERMAL_ZONE')}
          >
            <line x1="200" y1="410" x2="150" y2="350" stroke="#CBD5E1" strokeWidth="1" />
            <rect
              x="60"
              y="336"
              width="105"
              height="28"
              rx="6"
              fill="#FFFFFF"
              stroke={selectedComponent === 'THERMAL_ZONE' ? '#D9824B' : '#E5E7EB'}
              strokeWidth={selectedComponent === 'THERMAL_ZONE' ? '1.5' : '1'}
            />
            <text x="68" y="349" fill="#C2410C" fontSize="9" fontWeight="600" fontFamily="Inter, sans-serif">
              Thermal Zone
            </text>
            <text x="68" y="359" fill="#64748B" fontSize="8" fontFamily="Inter, sans-serif">
              {Math.round(telemetry.reservoirTempC)} °C · R={telemetry.thermalZoneRadiusMeters}m
            </text>
          </g>
        </svg>
      </div>

      <div className="text-[11px] text-app-muted text-center pt-2">
        Click any component in the diagram or tabs above to inspect engineering telemetry
      </div>
    </div>
  );
};
