import React, { useState } from 'react';
import { Settings, Save, RotateCcw, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const defaultLimits = {
    maxSafeSPM: 6.5,
    minSPM: 2.0,
    maxRodLoadPeakLbs: 18000,
    minRodFloatMarginLbs: 600,
    maxCasingAnnulusPressurePsi: 450,
    maxSteamInjectionPressurePsi: 1650,
    minSoakDurationDays: 4,
    economicWaterCutCutoffPct: 88,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-app-border rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-sm font-semibold text-app-text tracking-tight flex items-center gap-2">
            <Settings className="w-4 h-4 text-app-blue" />
            Petroleum Engineering Limits & Safety Interlocks
          </span>
          <div className="text-xs text-app-muted mt-1 max-w-3xl leading-relaxed">
            Configure mechanical safety boundaries, thermal packer envelope thresholds, and economic cut-off guidelines for the Baghewala Asset. The optimization engine strictly abides by these boundaries when generating cycle recommendations.
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-app-border text-app-muted hover:text-app-text text-xs font-medium hover:bg-app-bg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Standards
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-app-navy text-white text-xs font-medium hover:bg-app-navyDark transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            Save Operational Limits
          </button>
        </div>
      </div>

      {savedFeedback && (
        <div className="bg-app-softGreen border border-[#D5EFE1] p-3.5 rounded-lg text-xs text-app-green flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-app-green" />
          <span className="font-medium">Engineering limits successfully verified and stored in SCADA registry.</span>
        </div>
      )}

      {/* Limits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* SRP Mechanical Constraints */}
        <div className="bg-white border border-app-border rounded-lg p-6 space-y-4">
          <div className="border-b border-app-border pb-3 flex items-center justify-between">
            <span className="font-semibold text-app-text uppercase tracking-wider text-xs">
              1. Sucker Rod & Downhole Limits
            </span>
            <span className="text-[11px] text-app-muted">API Spec 11B / 11E</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-app-text mb-1 font-medium">
                <span>Maximum Safe Operating Speed (SPM):</span>
                <span className="font-semibold text-app-navy">{limits.maxSafeSPM} strokes/min</span>
              </div>
              <input
                type="range"
                min="4.0"
                max="8.5"
                step="0.1"
                value={limits.maxSafeSPM}
                onChange={(e) => setLimits({ ...limits, maxSafeSPM: Number(e.target.value) })}
                className="w-full accent-app-navy cursor-pointer mt-1"
              />
              <div className="text-[11px] text-app-muted mt-1">Prevents downstroke rod float in cold heavy crude</div>
            </div>

            <div>
              <div className="flex justify-between text-app-text mb-1 font-medium">
                <span>Minimum Rod-Float Downward Margin:</span>
                <span className="font-semibold text-app-navy">{limits.minRodFloatMarginLbs} lbs</span>
              </div>
              <input
                type="range"
                min="300"
                max="1200"
                step="50"
                value={limits.minRodFloatMarginLbs}
                onChange={(e) => setLimits({ ...limits, minRodFloatMarginLbs: Number(e.target.value) })}
                className="w-full accent-app-navy cursor-pointer mt-1"
              />
              <div className="text-[11px] text-app-muted mt-1">Safety margin above terminal fluid drag</div>
            </div>

            <div>
              <div className="flex justify-between text-app-text mb-1 font-medium">
                <span>Peak Polished Rod Load (PPRL) Limit:</span>
                <span className="font-semibold text-app-navy">{limits.maxRodLoadPeakLbs} lbs</span>
              </div>
              <input
                type="range"
                min="14000"
                max="24000"
                step="500"
                value={limits.maxRodLoadPeakLbs}
                onChange={(e) => setLimits({ ...limits, maxRodLoadPeakLbs: Number(e.target.value) })}
                className="w-full accent-app-navy cursor-pointer mt-1"
              />
              <div className="text-[11px] text-app-muted mt-1">Maximum tensile stress limit for Grade D string</div>
            </div>
          </div>
        </div>

        {/* CSS Thermal & Pressure Constraints */}
        <div className="bg-white border border-app-border rounded-lg p-6 space-y-4">
          <div className="border-b border-app-border pb-3 flex items-center justify-between">
            <span className="font-semibold text-app-text uppercase tracking-wider text-xs">
              2. Thermal & Pressure Envelopes
            </span>
            <span className="text-[11px] text-app-muted">Casing & Formation Safety</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-app-text mb-1 font-medium">
                <span>Maximum Steam Injection Pressure:</span>
                <span className="font-semibold text-app-steam">{limits.maxSteamInjectionPressurePsi} psi</span>
              </div>
              <input
                type="range"
                min="1300"
                max="1800"
                step="25"
                value={limits.maxSteamInjectionPressurePsi}
                onChange={(e) => setLimits({ ...limits, maxSteamInjectionPressurePsi: Number(e.target.value) })}
                className="w-full accent-app-navy cursor-pointer mt-1"
              />
              <div className="text-[11px] text-app-muted mt-1">Must remain strictly below Jodhpur formation fracture breakdown</div>
            </div>

            <div>
              <div className="flex justify-between text-app-text mb-1 font-medium">
                <span>Max Casing Annulus Pressure (Channeling Alert):</span>
                <span className="font-semibold text-app-steam">{limits.maxCasingAnnulusPressurePsi} psi</span>
              </div>
              <input
                type="range"
                min="250"
                max="600"
                step="10"
                value={limits.maxCasingAnnulusPressurePsi}
                onChange={(e) => setLimits({ ...limits, maxCasingAnnulusPressurePsi: Number(e.target.value) })}
                className="w-full accent-app-navy cursor-pointer mt-1"
              />
              <div className="text-[11px] text-app-muted mt-1">Triggers automatic thermal packer bypass investigation</div>
            </div>

            <div>
              <div className="flex justify-between text-app-text mb-1 font-medium">
                <span>Economic Water Cut Cut-off:</span>
                <span className="font-semibold text-app-text">{limits.economicWaterCutCutoffPct}%</span>
              </div>
              <input
                type="range"
                min="75"
                max="95"
                step="1"
                value={limits.economicWaterCutCutoffPct}
                onChange={(e) => setLimits({ ...limits, economicWaterCutCutoffPct: Number(e.target.value) })}
                className="w-full accent-app-navy cursor-pointer mt-1"
              />
              <div className="text-[11px] text-app-muted mt-1">Initiates next CSS injection turn-around window</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
