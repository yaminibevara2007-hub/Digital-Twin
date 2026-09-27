import React, { useState } from 'react';
import { Settings, Save, RotateCcw, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const defaultLimits = {
    maxSafeSPM: 6.5,
    minSPM: 2.0,
    maxRodLoadPeakLbs: 18000,
    minRodFloatMarginLbs: 600,
    maxCasingAnnulusPressurePsi: 450,
    maxSteamInjectionPressurePsi: 1650, // Below fracture gradient
    minSoakDurationDays: 4,
    economicWaterCutCutoffPct: 88,
    steamGeneratorMaxRateTonnesDay: 130,
    viscosityWarningThresholdCP: 1200,
  };

  const [limits, setLimits] = useState(defaultLimits);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSave = () => {
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  const handleReset = () => {
    setLimits(defaultLimits);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="scada-panel p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-l-4 border-l-sky-500 bg-industrial-900/90">
        <div>
          <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-sky-400" />
            Petroleum Engineering Limits & Safety Interlocks
          </span>
          <div className="text-xs text-industrial-300 mt-1 max-w-3xl leading-relaxed">
            Configure mechanical safety boundaries, thermal packer envelope thresholds, and economic cut-off guidelines for the Baghewala Asset. The optimization engine strictly abides by these boundaries when generating cycle recommendations.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-industrial-800 border border-industrial-700 text-industrial-300 text-xs font-mono hover:bg-industrial-750 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Standards
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-sky-950 border border-sky-600 text-sky-200 text-xs font-mono font-semibold hover:bg-sky-900 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            Save Operational Limits
          </button>
        </div>
      </div>

      {savedFeedback && (
        <div className="bg-emerald-950 border border-emerald-600 p-3 rounded text-xs font-mono text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Engineering limits successfully verified and stored in SCADA registry.</span>
        </div>
      )}

      {/* Limits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        {/* SRP Mechanical Constraints */}
        <div className="scada-panel p-4 space-y-3">
          <div className="border-b border-industrial-800 pb-2 flex items-center justify-between">
            <span className="font-bold text-industrial-200 uppercase">
              1. Sucker Rod & Downhole Limits
            </span>
            <span className="text-[10px] text-industrial-500">API Spec 11B / 11E</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-industrial-300 mb-1">
                <span>Maximum Safe Operating Speed (SPM):</span>
                <span className="text-industrial-100 font-bold">{limits.maxSafeSPM} strokes/min</span>
              </div>
              <input
                type="range"
                min="4.0"
                max="8.5"
                step="0.1"
                value={limits.maxSafeSPM}
                onChange={(e) => setLimits({ ...limits, maxSafeSPM: Number(e.target.value) })}
                className="w-full accent-sky-400 cursor-pointer"
              />
              <div className="text-[10px] text-industrial-500">Prevents downstroke rod float in heavy crude</div>
            </div>

            <div>
              <div className="flex justify-between text-industrial-300 mb-1">
                <span>Minimum Rod-Float Downward Margin:</span>
                <span className="text-industrial-100 font-bold">{limits.minRodFloatMarginLbs} lbs</span>
              </div>
              <input
                type="range"
                min="300"
                max="1200"
                step="50"
                value={limits.minRodFloatMarginLbs}
                onChange={(e) => setLimits({ ...limits, minRodFloatMarginLbs: Number(e.target.value) })}
                className="w-full accent-sky-400 cursor-pointer"
              />
              <div className="text-[10px] text-industrial-500">Safety margin above terminal fluid drag</div>
            </div>

            <div>
              <div className="flex justify-between text-industrial-300 mb-1">
                <span>Peak Polished Rod Load (PPRL) Limit:</span>
                <span className="text-industrial-100 font-bold">{limits.maxRodLoadPeakLbs} lbs</span>
              </div>
              <input
                type="range"
                min="14000"
                max="24000"
                step="500"
                value={limits.maxRodLoadPeakLbs}
                onChange={(e) => setLimits({ ...limits, maxRodLoadPeakLbs: Number(e.target.value) })}
                className="w-full accent-sky-400 cursor-pointer"
              />
              <div className="text-[10px] text-industrial-500">Maximum tension for API Grade D rod string</div>
            </div>
          </div>
        </div>

        {/* CSS Thermal & Pressure Constraints */}
        <div className="scada-panel p-4 space-y-3">
          <div className="border-b border-industrial-800 pb-2 flex items-center justify-between">
            <span className="font-bold text-industrial-200 uppercase">
              2. Thermal & Pressure Envelopes
            </span>
            <span className="text-[10px] text-industrial-500">Casing & Reservoir Safety</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-industrial-300 mb-1">
                <span>Maximum Steam Injection Pressure:</span>
                <span className="text-industrial-100 font-bold">{limits.maxSteamInjectionPressurePsi} psi</span>
              </div>
              <input
                type="range"
                min="1300"
                max="1800"
                step="25"
                value={limits.maxSteamInjectionPressurePsi}
                onChange={(e) => setLimits({ ...limits, maxSteamInjectionPressurePsi: Number(e.target.value) })}
                className="w-full accent-petro-orange cursor-pointer"
              />
              <div className="text-[10px] text-industrial-500">Must remain strictly below Jodhpur formation fracture breakdown</div>
            </div>

            <div>
              <div className="flex justify-between text-industrial-300 mb-1">
                <span>Max Casing Annulus Pressure (Channeling Alert):</span>
                <span className="text-industrial-100 font-bold">{limits.maxCasingAnnulusPressurePsi} psi</span>
              </div>
              <input
                type="range"
                min="250"
                max="600"
                step="10"
                value={limits.maxCasingAnnulusPressurePsi}
                onChange={(e) => setLimits({ ...limits, maxCasingAnnulusPressurePsi: Number(e.target.value) })}
                className="w-full accent-petro-orange cursor-pointer"
              />
              <div className="text-[10px] text-industrial-500">Triggers automatic thermal packer bypass investigation</div>
            </div>

            <div>
              <div className="flex justify-between text-industrial-300 mb-1">
                <span>Economic Water Cut Cut-off:</span>
                <span className="text-industrial-100 font-bold">{limits.economicWaterCutCutoffPct}%</span>
              </div>
              <input
                type="range"
                min="75"
                max="95"
                step="1"
                value={limits.economicWaterCutCutoffPct}
                onChange={(e) => setLimits({ ...limits, economicWaterCutCutoffPct: Number(e.target.value) })}
                className="w-full accent-petro-orange cursor-pointer"
              />
              <div className="text-[10px] text-industrial-500">Initiates next CSS injection turn-around window</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
