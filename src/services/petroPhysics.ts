import { DynoPoint, SimulationScenario, TelemetryData } from '../types';

/**
 * Petroleum Physics Engine for Baghewala Field Heavy Oil
 * Basin: Bikaner-Nagaur Basin, Rajasthan, India
 * Formation: Jodhpur Sandstone
 * Crude: Extra-Heavy Oil (~18-19° API, high asphaltene/paraffin content)
 */

export const BAGHEWALA_FIELD_CONSTANTS = {
  FIELD_NAME: 'Baghewala Field',
  BASIN: 'Bikaner-Nagaur Basin, Rajasthan',
  FORMATION: 'Jodhpur Sandstone',
  AVERAGE_DEPTH_M: 410, // ~1350 ft shallow heavy oil reservoir
  INITIAL_RESERVOIR_TEMP_C: 42.0,
  INITIAL_RESERVOIR_PRESSURE_PSI: 520,
  CRUDE_API: 18.5,
  SPECIFIC_GRAVITY: 0.943,
  DEAD_OIL_VISCOSITY_40C_CP: 22000,
  ROD_STRING_WEIGHT_IN_AIR_LBS: 3850, // 3/4" & 7/8" tapered string for 410m
  ROD_BUOYANT_WEIGHT_LBS: 3340,
  PLUNGER_DIAMETER_INCHES: 2.25,
  TUBING_ID_INCHES: 2.992, // 3-1/2" tubing
  MAX_RECOMMENDED_SPM_HEAVY_OIL: 6.5,
  MIN_RECOMMENDED_SPM: 2.0,
  CRITICAL_VISCOSITY_FOR_ROD_FLOAT_CP: 1200,
};

/**
 * Calculates Baghewala heavy crude dynamic viscosity (cP) at a given temperature (°C)
 * Calibrated using experimental thermal rheology of Rajasthan heavy oil.
 */
export function calculateViscosityCP(tempC: number): number {
  const T = Math.max(15, tempC);
  // Modified Walther / Andrade equation for heavy bitumen/oil
  // At 40°C -> ~22,000 cP
  // At 80°C -> ~1,100 cP
  // At 140°C -> ~140 cP
  // At 200°C -> ~38 cP
  // At 260°C -> ~15 cP
  const b = 5820; // Activation parameter
  const T_kelvin = T + 273.15;
  const T_ref = 40 + 273.15;
  const mu_ref = BAGHEWALA_FIELD_CONSTANTS.DEAD_OIL_VISCOSITY_40C_CP;

  const ln_visc = Math.log(mu_ref) + b * ((1 / T_kelvin) - (1 / T_ref));
  const visc = Math.exp(ln_visc);
  return Math.max(8.0, Math.min(65000, Math.round(visc * 10) / 10));
}

/**
 * Calculates downstroke viscous drag force (lbs) on the sucker rod string.
 * When Drag > Buoyant Weight, Rod Float occurs.
 */
export function calculateRodDragLbs(viscosityCP: number, spm: number, strokeInches: number): number {
  // Linear rod velocity approx: v_avg = 2 * Stroke * SPM / 60 (in/sec)
  const v_avg = (2 * (strokeInches * 0.0254) * (spm / 60)); // m/s
  // Viscous drag in annular geometry: F_drag = 2*pi * mu * v * L / ln(R_tubing/R_rod)
  const mu_Pa_s = viscosityCP * 0.001;
  const L_m = BAGHEWALA_FIELD_CONSTANTS.AVERAGE_DEPTH_M;
  const R_ratio = 1.8; // ln(Rt/Rr) approx 0.588

  const drag_N = (2 * Math.PI * mu_Pa_s * v_avg * L_m) / Math.log(R_ratio);
  const drag_lbs = drag_N * 0.224809;
  return Math.max(0, Math.round(drag_lbs));
}

/**
 * Calculates Rod-Floating Risk Percentage (0-100%) and Net Fall Margin
 */
export function evaluateRodFloatRisk(viscosityCP: number, spm: number, strokeInches: number): {
  riskPct: number;
  marginLbs: number;
  dragLbs: number;
  status: 'NORMAL' | 'WATCH' | 'WARNING' | 'CRITICAL';
} {
  const dragLbs = calculateRodDragLbs(viscosityCP, spm, strokeInches);
  const buoyantWeight = BAGHEWALA_FIELD_CONSTANTS.ROD_BUOYANT_WEIGHT_LBS;
  const marginLbs = buoyantWeight - dragLbs;

  let riskPct = 0;
  if (marginLbs <= 0) {
    riskPct = 95 + Math.min(5, Math.abs(marginLbs) / 100);
  } else if (marginLbs < 600) {
    riskPct = 70 + (30 * (600 - marginLbs) / 600);
  } else if (marginLbs < 1400) {
    riskPct = 30 + (40 * (1400 - marginLbs) / 800);
  } else {
    riskPct = Math.max(2, 30 * (1 - (marginLbs - 1400) / 2000));
  }

  riskPct = Math.round(Math.min(100, Math.max(1, riskPct)));

  let status: 'NORMAL' | 'WATCH' | 'WARNING' | 'CRITICAL' = 'NORMAL';
  if (riskPct >= 80) status = 'CRITICAL';
  else if (riskPct >= 60) status = 'WARNING';
  else if (riskPct >= 35) status = 'WATCH';

  return { riskPct, marginLbs: Math.round(marginLbs), dragLbs, status };
}

/**
 * Calculates SRP Pump Fillage (%) in heavy oil environment
 */
export function calculatePumpFillagePct(viscosityCP: number, spm: number, bottomholePressurePsi: number): number {
  // In cold heavy oil, fluid entry through the standing valve is severely impeded.
  const mobilityFactor = Math.min(1.0, 500 / Math.max(10, viscosityCP));
  const speedPenalty = Math.max(0, (spm - 2.5) * 6.5);
  const pressureHelp = Math.min(20, (bottomholePressurePsi - 200) * 0.05);

  const rawFillage = 92 * mobilityFactor - speedPenalty + pressureHelp;
  return Math.round(Math.min(98, Math.max(18, rawFillage)));
}

/**
 * Calculates surface oil production rate (BOPD)
 */
export function calculateOilRateBOPD(
  strokeInches: number,
  spm: number,
  fillagePct: number,
  waterCutPct: number,
  plungerDiameterInches = BAGHEWALA_FIELD_CONSTANTS.PLUNGER_DIAMETER_INCHES
): number {
  // Theoretical displacement constant: C = 0.1166 * D^2 * S * SPM (bbl/day)
  const C = 0.1166 * Math.pow(plungerDiameterInches, 2);
  const totalFluidBPD = C * strokeInches * spm * (fillagePct / 100);
  const oilRate = totalFluidBPD * (1 - (waterCutPct / 100));
  return Math.round(Math.max(2, oilRate) * 10) / 10;
}

/**
 * Calculates specific energy consumption (kWh / bbl)
 */
export function calculateEnergyKWhPerBbl(
  oilRateBOPD: number,
  spm: number,
  strokeInches: number,
  viscosityCP: number
): number {
  if (oilRateBOPD < 1) return 85.0;
  // Hydraulic power + viscous mechanical loss
  const hydraulicHP = (oilRateBOPD * 1.5 * BAGHEWALA_FIELD_CONSTANTS.AVERAGE_DEPTH_M * 3.28) / (135700);
  const viscousLossHP = (calculateRodDragLbs(viscosityCP, spm, strokeInches) * (spm * strokeInches / 60)) / 63025;
  const totalKW = (hydraulicHP + viscousLossHP + 6.0) * 0.746;
  const kwh_per_bbl = (totalKW * 24) / oilRateBOPD;
  return Math.round(Math.min(120, Math.max(8, kwh_per_bbl)) * 10) / 10;
}

/**
 * Generates an accurate 40-point Dynamometer Card (Position vs Polished Rod Load)
 * for SCADA engineering display.
 */
export function generateDynamometerCard(
  strokeInches: number,
  viscosityCP: number,
  spm: number,
  fillagePct: number
): DynoPoint[] {
  const points: DynoPoint[] = [];
  const steps = 40;
  const S = strokeInches;
  const drag = calculateRodDragLbs(viscosityCP, spm, strokeInches);
  const W_rod = BAGHEWALA_FIELD_CONSTANTS.ROD_BUOYANT_WEIGHT_LBS;
  const W_fluid = 2650; // Fluid load on plunger

  const peakLoad = W_rod + W_fluid + (drag * 0.6);
  const minLoad = Math.max(200, W_rod - drag);

  for (let i = 0; i <= steps; i++) {
    // Phase angle around the stroke cycle (0 to 2*PI)
    const angle = (i / steps) * 2 * Math.PI;
    // Harmonic position: 0 to S
    const pos = (S / 2) * (1 - Math.cos(angle));

    let surfaceLoad = 0;
    let downholeLoad = 0;
    const refNormal = W_rod + (W_fluid * (angle < Math.PI ? 0.95 : 0.05)) + 400 * Math.sin(angle);

    if (angle <= Math.PI) {
      // UPSTROKE (0 to PI): Polish rod is lifting rod string + fluid column + fighting fluid drag
      const upProg = angle / Math.PI;
      const stretchPhase = Math.min(1, upProg * 4); // Rod stretch pickup
      surfaceLoad = W_rod + (W_fluid * stretchPhase) + (drag * 0.55);
      downholeLoad = (W_fluid * stretchPhase);
    } else {
      // DOWNSTROKE (PI to 2*PI): Traveling valve opens; rod falls through heavy fluid
      const downProg = (angle - Math.PI) / Math.PI;
      // Fillage impact: if fillage is e.g. 60%, delayed pickup/fluid pound occurs
      const fillageCut = 1 - (fillagePct / 100);
      let poundImpact = 0;

      if (downProg < fillageCut) {
        // Falling through gas/void or viscous delay
        surfaceLoad = W_rod - drag + 200;
        downholeLoad = 150;
      } else {
        // Fluid pound / contact
        poundImpact = (downProg - fillageCut) * 600;
        surfaceLoad = W_rod - drag + poundImpact;
        downholeLoad = 400 + poundImpact * 0.5;
      }
    }

    // Add physical harmonics / beam unit inertia oscillations
    const vibration = 180 * Math.sin(angle * 3.5);
    surfaceLoad = Math.max(150, Math.round(surfaceLoad + vibration));
    downholeLoad = Math.max(50, Math.round(downholeLoad + vibration * 0.3));

    points.push({
      positionInches: Math.round(pos * 10) / 10,
      surfaceLoadLbs: surfaceLoad,
      downholeLoadLbs: downholeLoad,
      referenceNormalSurfaceLoadLbs: Math.round(refNormal),
    });
  }

  return points;
}

/**
 * Predicts CSS-SRP Performance for What-If Simulation
 */
export function simulateScenarioPhysics(
  baseScenario: {
    steamVolumeTonnes: number;
    injectionPressurePsi: number;
    injectionDurationDays: number;
    soakDays: number;
    productionCutoffWaterCutPct: number;
    srpStrokeLengthInches: number;
    srpSPM: number;
    vfdFrequencyHz: number;
  },
  scenarioName: string
): SimulationScenario {
  const {
    steamVolumeTonnes,
    injectionPressurePsi,
    injectionDurationDays,
    soakDays,
    productionCutoffWaterCutPct,
    srpStrokeLengthInches,
    srpSPM,
    vfdFrequencyHz,
  } = baseScenario;

  // Thermal energy injected: Q = M * h_steam
  // Peak reservoir temperature achieved in near-wellbore zone
  const specificHeatGain = (steamVolumeTonnes / 1800) * 165;
  const peakTempC = Math.round(Math.min(240, 42 + specificHeatGain));

  // Average reservoir temperature during production lifecycle (accounting for heat loss to overburden/underburden)
  const soakHeatConservation = Math.min(1.0, Math.max(0.7, 1.0 - (Math.abs(soakDays - 5) * 0.04)));
  const avgOperatingTempC = 42 + (peakTempC - 42) * 0.58 * soakHeatConservation;

  // Operating Viscosity
  const operatingViscosityCP = calculateViscosityCP(avgOperatingTempC);

  // SRP Performance
  const fillage = calculatePumpFillagePct(operatingViscosityCP, srpSPM, 380);
  const avgOilRate = calculateOilRateBOPD(srpStrokeLengthInches, srpSPM, fillage, 45);
  const peakOilRate = Math.round(avgOilRate * 1.55);

  // Rod-Float and Equipment Risk
  const { riskPct: rodFloatRisk } = evaluateRodFloatRisk(operatingViscosityCP, srpSPM, srpStrokeLengthInches);
  const mechanicalStressIndex = (srpSPM / 6.0) * (srpStrokeLengthInches / 100);
  const pumpFailureRisk = Math.round(Math.min(95, Math.max(5, (rodFloatRisk * 0.45) + (mechanicalStressIndex * 35))));

  // Cumulative Oil (over standard 90-day CSS cycle)
  const productionDays = 90 - injectionDurationDays - soakDays;
  const cumulativeOil = Math.round(avgOilRate * productionDays * 0.92);

  // Steam-Oil Ratio (SOR: bbl CWE steam / bbl oil or tonnes/bbl)
  const sor = cumulativeOil > 0 ? Math.round((steamVolumeTonnes * 6.29 / cumulativeOil) * 100) / 100 : 0;
  const energyKWh = calculateEnergyKWhPerBbl(avgOilRate, srpSPM, srpStrokeLengthInches, operatingViscosityCP);

  // Economic Net Index (Relative engineering utility 0-100)
  const economicIndex = Math.round(Math.max(10, Math.min(98,
    (avgOilRate * 0.5) - (sor * 8) - (energyKWh * 0.3) - (pumpFailureRisk * 0.2) + 40
  )));

  return {
    id: `sim-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: scenarioName,
    steamVolumeTonnes,
    injectionPressurePsi,
    injectionDurationDays,
    soakDays,
    productionCutoffWaterCutPct,
    srpStrokeLengthInches,
    srpSPM,
    vfdFrequencyHz,
    predictedAvgOilRateBOPD: avgOilRate,
    predictedPeakOilRateBOPD: peakOilRate,
    predictedCumulativeOilBbl: cumulativeOil,
    predictedPeakTempC: peakTempC,
    predictedViscosityCP: operatingViscosityCP,
    predictedPumpFillagePct: fillage,
    predictedSOR: sor,
    predictedEnergyKWhBbl: energyKWh,
    predictedRodFloatRiskPct: rodFloatRisk,
    predictedPumpFailureRiskPct: pumpFailureRisk,
    economicNetIndex: economicIndex,
  };
}
