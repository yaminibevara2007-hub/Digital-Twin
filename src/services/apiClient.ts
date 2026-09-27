/**
 * API Client for Baghewala Field Digital Twin Backend
 * Connects frontend to Python FastAPI endpoints with physical simulation fallback.
 */

const API_BASE = 'http://127.0.0.1:8000/api';

export async function checkBackendHealth(): Promise<{ online: boolean; info?: any }> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { online: true, info: data };
  } catch (err) {
    return { online: false };
  }
}

export async function requestSimulationRun(params: {
  scenarioName: string;
  steamVolumeTonnes: number;
  injectionPressurePsi: number;
  injectionDurationDays: number;
  soakDays: number;
  productionCutoffWaterCutPct: number;
  srpStrokeLengthInches: number;
  srpSPM: number;
  vfdFrequencyHz: number;
}): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/simulation/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenario_name: params.scenarioName,
        steam_volume_tonnes: params.steamVolumeTonnes,
        injection_pressure_psi: params.injectionPressurePsi,
        injection_duration_days: params.injectionDurationDays,
        soak_days: params.soakDays,
        production_cutoff_wc_pct: params.productionCutoffWaterCutPct,
        srp_stroke_length_inches: params.srpStrokeLengthInches,
        srp_spm: params.srpSPM,
        vfd_frequency_hz: params.vfdFrequencyHz,
      }),
      signal: AbortSignal.timeout(3500),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return null; // Fallback will use local physics
  }
}

export async function requestCSSOptimization(currentCycle: number, tempC: number): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/css/optimize?current_cycle=${currentCycle}&reservoir_temp_c=${tempC}`, {
      method: 'POST',
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return null;
  }
}

export async function requestSRPOptimization(currentSPM: number, viscosityCP: number): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/srp/optimize?current_spm=${currentSPM}&viscosity_cp=${viscosityCP}`, {
      method: 'POST',
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return null;
  }
}
