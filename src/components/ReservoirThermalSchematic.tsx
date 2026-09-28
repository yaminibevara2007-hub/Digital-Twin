import React from 'react';
import { TelemetryData } from '../types';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { calculateViscosityCP } from '../services/petroPhysics';

interface ReservoirThermalSchematicProps {
  telemetry: TelemetryData;
}

export const ReservoirThermalSchematic: React.FC<ReservoirThermalSchematicProps> = ({ telemetry }) => {
  const radialData = [];
  const T_well = telemetry.reservoirTempC;
  const T_far = 42.0;

  for (let r = 0.5; r <= 35; r += 1.5) {
    const decay = Math.exp(-r / (telemetry.thermalZoneRadiusMeters * 0.75));
    const temp = Math.round((T_far + (T_well - T_far) * decay) * 10) / 10;
    const visc = calculateViscosityCP(temp);
    const mobility = Math.round((280 / Math.max(5, visc)) * 100) / 100;

    radialData.push({
      radiusMeters: r,
      temperatureC: temp,
      viscosityCP: visc,
      mobility: mobility,
    });
  }

  return (
    <div className="bg-white border border-app-border rounded-lg p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-app-border pb-3">
        <div>
          <span className="text-sm font-semibold text-app-text tracking-tight">
            Reservoir Thermal Front & Radial Viscosity Profile
          </span>
          <div className="text-xs text-app-muted">
            Near-Wellbore Conductive Heat Dissipation in Jodhpur Sandstone
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="bg-app-bg px-2.5 py-1 rounded border border-app-border">
            <span className="text-app-muted">Near-Wellbore Temp: </span>
            <span className="text-app-steam font-semibold">{telemetry.reservoirTempC} °C</span>
          </div>
          <div className="bg-app-bg px-2.5 py-1 rounded border border-app-border">
            <span className="text-app-muted">In-Situ Viscosity: </span>
            <span className="text-app-text font-semibold">{telemetry.estimatedViscosityCP} cP</span>
          </div>
          <div className="bg-app-bg px-2.5 py-1 rounded border border-app-border">
            <span className="text-app-muted">Heated Radius: </span>
            <span className="text-app-blue font-semibold">{telemetry.thermalZoneRadiusMeters} m</span>
          </div>
        </div>
      </div>

      {/* Causal Sequence Strip */}
      <div className="bg-app-bg p-3.5 rounded border border-app-border flex items-center justify-between text-xs text-app-text">
        <span className="text-app-muted font-medium">Physical Relationship:</span>
        <span className="text-app-steam font-medium">Temperature Decreases</span>
        <span className="text-app-muted">→</span>
        <span className="text-app-amber font-medium">Viscosity Increases</span>
        <span className="text-app-muted">→</span>
        <span className="text-app-blue font-medium">Oil Mobility Drops</span>
        <span className="text-app-muted">→</span>
        <span className="text-app-red font-medium">Lifting Drag Surges</span>
        <span className="text-app-muted">→</span>
        <span className="text-app-text font-medium">Production Declines</span>
      </div>

      {/* Radial Temperature Gradient Chart - Pure White Canvas */}
      <div className="w-full h-64 bg-white rounded p-1 border border-app-border">
        <div className="text-xs text-app-muted mb-2 px-2 flex justify-between font-medium">
          <span>Radial Temperature Decay T(r) from Wellbore Outward</span>
          <span className="text-app-steam">°C vs Radial Distance (meters)</span>
        </div>
        <ResponsiveContainer width="100%" height="90%">
          <AreaChart data={radialData} margin={{ top: 10, right: 25, left: 10, bottom: 15 }}>
            <defs>
              <linearGradient id="lightTempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D9824B" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#D9824B" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" />
            <XAxis
              dataKey="radiusMeters"
              unit="m"
              stroke="#94A3B8"
              tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'sans-serif' }}
              label={{
                value: 'Radial Distance from Wellbore (m)',
                position: 'insideBottom',
                offset: -10,
                fill: '#64748B',
                fontSize: 11,
                fontFamily: 'sans-serif',
              }}
            />
            <YAxis
              domain={[30, 240]}
              unit="°C"
              stroke="#94A3B8"
              tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'sans-serif' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const p = payload[0].payload;
                  return (
                    <div className="bg-white border border-app-border p-2.5 text-xs rounded-lg shadow-md text-app-text">
                      <div className="text-app-muted">Radius: {p.radiusMeters} m</div>
                      <div className="text-app-steam font-semibold">Temperature: {p.temperatureC} °C</div>
                      <div className="text-app-text">Viscosity: {p.viscosityCP} cP</div>
                      <div className="text-app-blue">Mobility: {p.mobility} mD/cP</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine
              y={42}
              stroke="#CBD5E1"
              strokeDasharray="3 3"
              label={{ value: 'Native Far-Field Temp (42°C)', fill: '#64748B', fontSize: 10 }}
            />
            <Area
              type="monotone"
              dataKey="temperatureC"
              name="Reservoir Temperature"
              stroke="#D9824B"
              strokeWidth={2}
              fill="url(#lightTempGradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Reservoir Technical Data Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-app-bg p-3.5 rounded border border-app-border">
          <div className="text-[11px] text-app-muted uppercase font-medium">Perforated Interval</div>
          <div className="text-app-text font-semibold mt-1">405 - 415 m TVD</div>
          <div className="text-[11px] text-app-muted mt-0.5">8 spf, 90° phasing</div>
        </div>

        <div className="bg-app-bg p-3.5 rounded border border-app-border">
          <div className="text-[11px] text-app-muted uppercase font-medium">Steam Conformance</div>
          <div className="text-app-green font-semibold mt-1">Uniform Radial Expansion</div>
          <div className="text-[11px] text-app-muted mt-0.5">No gravity override detected</div>
        </div>

        <div className="bg-app-bg p-3.5 rounded border border-app-border">
          <div className="text-[11px] text-app-muted uppercase font-medium">Effective Mobility Radius</div>
          <div className="text-app-blue font-semibold mt-1">14.2 meters (&lt;500 cP)</div>
          <div className="text-[11px] text-app-muted mt-0.5">Sufficient Darcy inflow</div>
        </div>

        <div className="bg-app-bg p-3.5 rounded border border-app-border">
          <div className="text-[11px] text-app-muted uppercase font-medium">Thermal Decay Rate</div>
          <div className="text-app-amber font-semibold mt-1">-0.48 °C / day</div>
          <div className="text-[11px] text-app-muted mt-0.5">Natural conduction to shales</div>
        </div>
      </div>
    </div>
  );
};
