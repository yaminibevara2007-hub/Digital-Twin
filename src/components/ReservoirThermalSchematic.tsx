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
  // Generate radial temperature and viscosity profile outward from wellbore (r = 0.1m to 40m)
  const radialData = [];
  const T_well = telemetry.reservoirTempC;
  const T_far = 42.0; // Native reservoir temp

  for (let r = 0.5; r <= 35; r += 1.5) {
    // Thermal diffusion falloff profile: T(r) = T_far + (T_well - T_far) * exp(-r / R_th)
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
    <div className="scada-panel p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-industrial-800 pb-2">
        <div>
          <span className="text-xs font-mono font-bold text-petro-orange uppercase tracking-wider">
            Reservoir Thermal Front & Viscosity Radial Profile
          </span>
          <div className="text-[11px] font-mono text-industrial-400">
            Near-Wellbore Thermal Conduction into Jodhpur Sandstone
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="bg-industrial-950 px-2 py-1 rounded border border-industrial-800">
            <span className="text-industrial-400">Near-Wellbore T: </span>
            <span className="text-petro-orange font-semibold">{telemetry.reservoirTempC} °C</span>
          </div>
          <div className="bg-industrial-950 px-2 py-1 rounded border border-industrial-800">
            <span className="text-industrial-400">Estimated Viscosity: </span>
            <span className="text-industrial-100 font-semibold">{telemetry.estimatedViscosityCP} cP</span>
          </div>
          <div className="bg-industrial-950 px-2 py-1 rounded border border-industrial-800">
            <span className="text-industrial-400">Thermal Radius: </span>
            <span className="text-sky-400 font-semibold">{telemetry.thermalZoneRadiusMeters} m</span>
          </div>
        </div>
      </div>

      {/* Physical Causal Sequence Bar */}
      <div className="bg-industrial-950 p-2.5 rounded border border-industrial-800 flex items-center justify-between text-xs font-mono text-industrial-300">
        <span className="text-industrial-400">Physical Relationship:</span>
        <span className="text-petro-orange">Temperature Decreases</span>
        <span className="text-industrial-600">→</span>
        <span className="text-amber-300">Viscosity Increases</span>
        <span className="text-industrial-600">→</span>
        <span className="text-sky-400">Oil Mobility Drops</span>
        <span className="text-industrial-600">→</span>
        <span className="text-red-400">Lifting Drag Surges</span>
        <span className="text-industrial-600">→</span>
        <span className="text-industrial-200">Production Declines</span>
      </div>

      {/* Radial Temperature Gradient Chart */}
      <div className="w-full h-64 bg-industrial-950 rounded p-2 border border-industrial-850">
        <div className="text-[11px] font-mono text-industrial-400 mb-1 px-2 flex justify-between">
          <span>Radial Temperature Decay T(r) from Wellbore Outward</span>
          <span className="text-petro-orange">°C vs Radial Distance (meters)</span>
        </div>
        <ResponsiveContainer width="100%" height="90%">
          <AreaChart data={radialData} margin={{ top: 10, right: 25, left: 10, bottom: 15 }}>
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d97736" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#d97736" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1c2c47" strokeDasharray="3 3" />
            <XAxis
              dataKey="radiusMeters"
              unit="m"
              stroke="#5c75a3"
              tick={{ fontSize: 10, fill: '#8ba2c7', fontFamily: 'monospace' }}
              label={{
                value: 'Radial Distance from Wellbore (m)',
                position: 'insideBottom',
                offset: -10,
                fill: '#8ba2c7',
                fontSize: 10,
                fontFamily: 'monospace',
              }}
            />
            <YAxis
              domain={[30, 240]}
              unit="°C"
              stroke="#5c75a3"
              tick={{ fontSize: 10, fill: '#8ba2c7', fontFamily: 'monospace' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const p = payload[0].payload;
                  return (
                    <div className="bg-industrial-900 border border-industrial-700 p-2 text-xs font-mono rounded shadow-lg">
                      <div className="text-industrial-400">Radius: {p.radiusMeters} m</div>
                      <div className="text-petro-orange font-semibold">Temp: {p.temperatureC} °C</div>
                      <div className="text-industrial-200">Viscosity: {p.viscosityCP} cP</div>
                      <div className="text-sky-400">Mobility: {p.mobility} mD/cP</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine
              y={42}
              stroke="#64748b"
              strokeDasharray="3 3"
              label={{ value: 'Native Far-Field Temp (42°C)', fill: '#64748b', fontSize: 10 }}
            />
            <Area
              type="monotone"
              dataKey="temperatureC"
              name="Reservoir Temperature"
              stroke="#d97736"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#tempGradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Reservoir Cross-Section Technical Labels */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs font-mono">
        <div className="bg-industrial-950 p-2.5 rounded border border-industrial-800">
          <div className="text-[10px] text-industrial-400 uppercase">Perforated Zone</div>
          <div className="text-industrial-100 font-semibold mt-1">405 - 415 m TVD</div>
          <div className="text-[10px] text-industrial-500 mt-0.5">8 spf, 90° phasing</div>
        </div>

        <div className="bg-industrial-950 p-2.5 rounded border border-industrial-800">
          <div className="text-[10px] text-industrial-400 uppercase">Steam Conformance</div>
          <div className="text-emerald-400 font-semibold mt-1">Uniform Radial</div>
          <div className="text-[10px] text-industrial-500 mt-0.5">No gravity override detected</div>
        </div>

        <div className="bg-industrial-950 p-2.5 rounded border border-industrial-800">
          <div className="text-[10px] text-industrial-400 uppercase">Effective Mobility Radius</div>
          <div className="text-sky-400 font-semibold mt-1">14.2 meters (&lt;500 cP)</div>
          <div className="text-[10px] text-industrial-500 mt-0.5">Sufficient Darcy inflow</div>
        </div>

        <div className="bg-industrial-950 p-2.5 rounded border border-industrial-800">
          <div className="text-[10px] text-industrial-400 uppercase">Thermal Decay Rate</div>
          <div className="text-amber-400 font-semibold mt-1">-0.48 °C / day</div>
          <div className="text-[10px] text-industrial-500 mt-0.5">Natural overburden conduction</div>
        </div>
      </div>
    </div>
  );
};
