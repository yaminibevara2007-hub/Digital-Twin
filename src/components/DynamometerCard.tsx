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
    <div className="bg-white border border-app-border rounded-lg p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-app-border pb-3">
        <div>
          <span className="text-sm font-semibold text-app-text tracking-tight">
            Polished Rod Dynamometer Card (Surface vs Downhole Plunger)
          </span>
          <div className="text-xs text-app-muted">
            Surface Stroke Length: {strokeLengthInches}" | Standing & Traveling Valve Cycle
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-app-bg px-2.5 py-1 rounded border border-app-border">
            <span className="text-app-muted">Pump Fillage:</span>
            <span className="text-app-green font-semibold">{fillagePct}%</span>
          </div>

          <div className="flex items-center gap-1.5 bg-app-bg px-2.5 py-1 rounded border border-app-border">
            <span className="text-app-muted">Rod Float Risk:</span>
            <span className={`font-semibold ${rodFloatRiskPct > 60 ? 'text-app-amber' : 'text-app-green'}`}>
              {rodFloatRiskPct}%
            </span>
          </div>
        </div>
      </div>

      {/* Dyno Graph Container - Pure White Canvas */}
      <div className="w-full h-72 bg-white rounded p-1 border border-app-border">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 15, right: 25, left: 10, bottom: 20 }}
          >
            <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" />
            <XAxis
              dataKey="positionInches"
              type="number"
              domain={[0, strokeLengthInches]}
              unit='"'
              stroke="#94A3B8"
              tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'sans-serif' }}
              label={{
                value: 'Polished Rod Position (inches)',
                position: 'insideBottom',
                offset: -12,
                fill: '#64748B',
                fontSize: 11,
                fontFamily: 'sans-serif',
              }}
            />
            <YAxis
              domain={[0, 7500]}
              unit=" lbs"
              stroke="#94A3B8"
              tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'sans-serif' }}
              label={{
                value: 'Load (lbs)',
                angle: -90,
                position: 'insideLeft',
                offset: 5,
                fill: '#64748B',
                fontSize: 11,
                fontFamily: 'sans-serif',
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const p = payload[0].payload as DynoPoint;
                  return (
                    <div className="bg-white border border-app-border p-2.5 text-xs rounded-lg shadow-md text-app-text">
                      <div className="text-app-muted mb-1">Position: {p.positionInches}"</div>
                      <div className="text-app-blue font-medium">Surface Load: {p.surfaceLoadLbs} lbs</div>
                      <div className="text-app-green font-medium">Downhole Load: {p.downholeLoadLbs} lbs</div>
                      <div className="text-app-muted text-[11px]">Normal Ref: {p.referenceNormalSurfaceLoadLbs} lbs</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              wrapperStyle={{ fontSize: '11px', fontFamily: 'sans-serif', paddingBottom: '8px' }}
            />
            <ReferenceLine
              y={buoyantWeight}
              stroke="#B7791F"
              strokeDasharray="4 4"
              label={{
                value: `Buoyant Rod Weight (${buoyantWeight} lbs)`,
                fill: '#B7791F',
                fontSize: 10,
                position: 'top',
              }}
            />
            <Line
              type="monotone"
              dataKey="surfaceLoadLbs"
              name="Surface Polished Rod Load"
              stroke="#3B82A0"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="downholeLoadLbs"
              name="Downhole Plunger Load"
              stroke="#3D8B68"
              strokeWidth={1.8}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="referenceNormalSurfaceLoadLbs"
              name="Baseline Reference (Healthy)"
              stroke="#CBD5E1"
              strokeWidth={1.2}
              strokeDasharray="3 3"
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Dyno Engineering Diagnosis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="bg-app-bg p-3 rounded border border-app-border">
          <span className="text-[11px] text-app-muted uppercase font-medium">Upstroke Pickup</span>
          <div className="text-app-text font-medium mt-1">
            Normal fluid load transfer ({Math.round(buoyantWeight + 2650)} lbs peak)
          </div>
        </div>

        <div className="bg-app-bg p-3 rounded border border-app-border">
          <span className="text-[11px] text-app-muted uppercase font-medium">Downstroke Drag Envelope</span>
          <div className={`mt-1 font-medium ${rodFloatRiskPct > 60 ? 'text-app-amber' : 'text-app-text'}`}>
            {rodFloatRiskPct > 60 ? 'Viscous retardation approaching buoyant threshold' : 'Stable downward momentum'}
          </div>
        </div>

        <div className="bg-app-bg p-3 rounded border border-app-border">
          <span className="text-[11px] text-app-muted uppercase font-medium">Fillage / Fluid Pound</span>
          <div className="text-app-text font-medium mt-1">
            {fillagePct < 70 ? 'Traveling valve delay: incomplete chamber fillage' : 'Complete fluid chamber loading'}
          </div>
        </div>
      </div>
    </div>
  );
};
