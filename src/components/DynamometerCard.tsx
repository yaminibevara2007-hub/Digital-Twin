import React from 'react';
import { DynoPoint } from '../types';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';
import { BAGHEWALA_FIELD_CONSTANTS } from '../services/petroPhysics';

interface DynamometerCardProps {
  data: DynoPoint[];
  strokeLengthInches: number;
  rodFloatRiskPct: number;
  fillagePct: number;
}

export const DynamometerCard: React.FC<DynamometerCardProps> = ({
  data,
  strokeLengthInches,
  rodFloatRiskPct,
  fillagePct,
}) => {
  const buoyantWeight = BAGHEWALA_FIELD_CONSTANTS.ROD_BUOYANT_WEIGHT_LBS;

  return (
    <div className="scada-panel p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-industrial-800 pb-2">
        <div>
          <span className="text-xs font-mono font-bold text-industrial-200 uppercase tracking-wider">
            SCADA Polished Rod Dynamometer Card
          </span>
          <div className="text-[11px] font-mono text-industrial-400">
            Surface Load vs Downhole Plunger Load (Stroke: {strokeLengthInches}")
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-industrial-950 px-2 py-1 rounded border border-industrial-800">
            <span className="text-industrial-400">Pump Fillage:</span>
            <span className="text-emerald-400 font-semibold">{fillagePct}%</span>
          </div>

          <div className="flex items-center gap-1.5 bg-industrial-950 px-2 py-1 rounded border border-industrial-800">
            <span className="text-industrial-400">Rod Float Risk:</span>
            <span className={`font-semibold ${rodFloatRiskPct > 60 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {rodFloatRiskPct}%
            </span>
          </div>
        </div>
      </div>

      {/* Dyno Graph Container */}
      <div className="w-full h-72 bg-industrial-950 rounded p-2 border border-industrial-850">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 25, left: 10, bottom: 20 }}
          >
            <CartesianGrid stroke="#1c2c47" strokeDasharray="3 3" />
            <XAxis
              dataKey="positionInches"
              type="number"
              domain={[0, strokeLengthInches]}
              unit='"'
              stroke="#5c75a3"
              tick={{ fontSize: 10, fill: '#8ba2c7', fontFamily: 'monospace' }}
              label={{
                value: 'Polished Rod Position (inches)',
                position: 'insideBottom',
                offset: -12,
                fill: '#8ba2c7',
                fontSize: 10,
                fontFamily: 'monospace',
              }}
            />
            <YAxis
              domain={[0, 7500]}
              unit=" lbs"
              stroke="#5c75a3"
              tick={{ fontSize: 10, fill: '#8ba2c7', fontFamily: 'monospace' }}
              label={{
                value: 'Load (lbs)',
                angle: -90,
                position: 'insideLeft',
                offset: 5,
                fill: '#8ba2c7',
                fontSize: 10,
                fontFamily: 'monospace',
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const p = payload[0].payload as DynoPoint;
                  return (
                    <div className="bg-industrial-900 border border-industrial-700 p-2 text-xs font-mono rounded shadow-lg text-industrial-200">
                      <div className="text-industrial-400">Pos: {p.positionInches}"</div>
                      <div className="text-sky-400">Surface Load: {p.surfaceLoadLbs} lbs</div>
                      <div className="text-emerald-400">Downhole Load: {p.downholeLoadLbs} lbs</div>
                      <div className="text-industrial-500">Normal Ref: {p.referenceNormalSurfaceLoadLbs} lbs</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingBottom: '6px' }}
            />
            {/* Reference horizontal line for buoyant rod weight */}
            <ReferenceLine
              y={buoyantWeight}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              label={{
                value: `Buoyant Rod Weight (${buoyantWeight} lbs)`,
                fill: '#f59e0b',
                fontSize: 9,
                position: 'top',
              }}
            />
            <Line
              type="monotone"
              dataKey="surfaceLoadLbs"
              name="Surface Polished Rod Load"
              stroke="#38bdf8"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="downholeLoadLbs"
              name="Downhole Plunger Load"
              stroke="#22c55e"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="referenceNormalSurfaceLoadLbs"
              name="Baseline Reference (Healthy)"
              stroke="#64748b"
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Dyno Engineering Diagnosis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs font-mono">
        <div className="bg-industrial-950 p-2 rounded border border-industrial-800">
          <span className="text-[10px] text-industrial-400 uppercase">Upstroke Pickup</span>
          <div className="text-industrial-200 mt-0.5">
            Normal fluid load transfer ({Math.round(buoyantWeight + 2650)} lbs peak)
          </div>
        </div>

        <div className="bg-industrial-950 p-2 rounded border border-industrial-800">
          <span className="text-[10px] text-industrial-400 uppercase">Downstroke Drag Envelope</span>
          <div className={`mt-0.5 ${rodFloatRiskPct > 60 ? 'text-amber-300 font-semibold' : 'text-industrial-200'}`}>
            {rodFloatRiskPct > 60 ? 'Severe viscous retardation at bottom stroke' : 'Stable downward momentum'}
          </div>
        </div>

        <div className="bg-industrial-950 p-2 rounded border border-industrial-800">
          <span className="text-[10px] text-industrial-400 uppercase">Fillage / Fluid Pound</span>
          <div className="text-industrial-200 mt-0.5">
            {fillagePct < 70 ? 'Traveling valve delay: incomplete fillage' : 'Complete fluid chamber loading'}
          </div>
        </div>
      </div>
    </div>
  );
};
