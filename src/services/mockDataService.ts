import {
  AlertItem,
  ChannelingIndicator,
  ComponentHealth,
  CSSCycleData,
  DynoPoint,
  SimulationScenario,
  TelemetryData,
  TimeSeriesPoint,
  WellId,
  WellInfo,
} from '../types';
import {
  calculateEnergyKWhPerBbl,
  calculateOilRateBOPD,
  calculatePumpFillagePct,
  calculateViscosityCP,
  evaluateRodFloatRisk,
  generateDynamometerCard,
  simulateScenarioPhysics,
} from './petroPhysics';

export const BAGHEWALA_WELLS: Record<WellId, WellInfo> = {
  'BW-01': {
    id: 'BW-01',
    name: 'BW-01 (Producer)',
    field: 'Baghewala Field',
    basin: 'Bikaner-Nagaur Basin, Rajasthan',
    formation: 'Jodhpur Sandstone (Lower Unit)',
    depthMeters: 412,
    apiGravity: 18.6,
    deadOilViscosityInitialCP: 21500,
    currentCycle: 4,
    currentStage: 'PRODUCTION',
    stageDay: 46,
    stageTotalDays: 90,
    pumpType: 'API 25-225-RHAM-16-4 (Insert Rod Pump)',
    tubingDiameterInches: 3.5,
    plungerDiameterInches: 2.25,
    motorRatingHP: 40,
    lastWorkoverDate: '2025-11-14',
  },
  'BW-04': {
    id: 'BW-04',
    name: 'BW-04 (Cooling / High Drag)',
    field: 'Baghewala Field',
    basin: 'Bikaner-Nagaur Basin, Rajasthan',
    formation: 'Jodhpur Sandstone (Middle Sand)',
    depthMeters: 428,
    apiGravity: 18.2,
    deadOilViscosityInitialCP: 24000,
    currentCycle: 3,
    currentStage: 'PRODUCTION',
    stageDay: 82,
    stageTotalDays: 90,
    pumpType: 'API 25-225-RHAM-18-4 (Heavy-Oil Valve Cage)',
    tubingDiameterInches: 3.5,
    plungerDiameterInches: 2.25,
    motorRatingHP: 50,
    lastWorkoverDate: '2025-08-20',
  },
  'BW-12': {
    id: 'BW-12',
    name: 'BW-12 (Thermal Injection)',
    field: 'Baghewala Field',
    basin: 'Bikaner-Nagaur Basin, Rajasthan',
    formation: 'Jodhpur Sandstone (Lower Unit)',
    depthMeters: 395,
    apiGravity: 19.1,
    deadOilViscosityInitialCP: 19500,
    currentCycle: 5,
    currentStage: 'INJECTION',
    stageDay: 12,
    stageTotalDays: 18,
    pumpType: 'Unseated for Steam Injection Pack-off',
    tubingDiameterInches: 3.5,
    plungerDiameterInches: 2.25,
    motorRatingHP: 40,
    lastWorkoverDate: '2026-02-05',
  },
  'BW-19': {
    id: 'BW-19',
    name: 'BW-19 (Soak Phase)',
    field: 'Baghewala Field',
    basin: 'Bikaner-Nagaur Basin, Rajasthan',
    formation: 'Jodhpur Sandstone (Upper Sand)',
    depthMeters: 405,
    apiGravity: 18.4,
    deadOilViscosityInitialCP: 22800,
    currentCycle: 2,
    currentStage: 'SOAKING',
    stageDay: 4,
    stageTotalDays: 6,
    pumpType: 'API 25-225-RHAM-16-4 (Insert Rod Pump)',
    tubingDiameterInches: 3.5,
    plungerDiameterInches: 2.25,
    motorRatingHP: 40,
    lastWorkoverDate: '2026-01-10',
  },
};

/**
 * Returns instantaneous telemetry for a given well and demo state
 */
export function getWellTelemetry(wellId: WellId, demoScenario = 'DEFAULT'): TelemetryData {
  const well = BAGHEWALA_WELLS[wellId];

  // Base state calibrated to well & stage
  let reservoirTempC = 96.0;
  let srpSPM = 4.6;
  let strokeInches = 100;
  let waterCutPct = 42.0;
  let wellheadPressurePsi = 85.0;
  let casingPressurePsi = 120.0;
  let tubingPressurePsi = 240.0;
  let bottomholePressurePsi = 360.0;
  let steamRate = 0;
  let steamPressure = 0;
  let steamTemp = 0;
  let steamQuality = 0;
  let channelingRisk = 8;

  if (well.currentStage === 'INJECTION') {
    reservoirTempC = 210.0;
    srpSPM = 0;
    steamRate = 115.0; // tonnes/day
    steamPressure = 1420.0;
    steamTemp = 308.0;
    steamQuality = 80.0;
    casingPressurePsi = 290.0;
    wellheadPressurePsi = 1380.0;
    tubingPressurePsi = 1400.0;
    channelingRisk = 24;
  } else if (well.currentStage === 'SOAKING') {
    reservoirTempC = 195.0;
    srpSPM = 0;
    casingPressurePsi = 180.0;
    wellheadPressurePsi = 640.0;
    bottomholePressurePsi = 790.0;
    channelingRisk = 12;
  } else if (wellId === 'BW-04') {
    // Late cycle cooling well
    reservoirTempC = 54.0;
    srpSPM = 5.2; // slightly fast for viscous oil
    waterCutPct = 58.0;
    casingPressurePsi = 95.0;
  }

  // Handle Demo Mode Overrides
  if (demoScenario === 'RESERVOIR_COOLING') {
    reservoirTempC = 48.0;
    srpSPM = 5.4;
  } else if (demoScenario === 'ROD_FLOATING_RISK') {
    reservoirTempC = 52.0;
    srpSPM = 6.4; // High speed in cool crude -> severe drag
    strokeInches = 120;
  } else if (demoScenario === 'STEAM_CHANNELING') {
    reservoirTempC = 225.0;
    steamRate = 140.0;
    steamPressure = 1680.0;
    casingPressurePsi = 640.0; // Sudden annulus pressurization!
    channelingRisk = 82;
  } else if (demoScenario === 'OPTIMIZED_OPERATING') {
    reservoirTempC = 92.0;
    srpSPM = 4.2; // Harmonized optimal operating point
    strokeInches = 100;
  }

  const viscosityCP = calculateViscosityCP(reservoirTempC);
  const fillagePct = srpSPM > 0 ? calculatePumpFillagePct(viscosityCP, srpSPM, bottomholePressurePsi) : 0;
  const oilRateBOPD = srpSPM > 0 ? calculateOilRateBOPD(strokeInches, srpSPM, fillagePct, waterCutPct) : 0;
  const waterRateBWPD = oilRateBOPD > 0 ? Math.round(oilRateBOPD * (waterCutPct / (100 - waterCutPct))) : 0;
  const { riskPct: rodFloatRisk, marginLbs: rodMargin } = evaluateRodFloatRisk(viscosityCP, srpSPM, strokeInches);

  const pumpEfficiencyPct = Math.round(fillagePct * 0.94);
  const energyConsumptionKWhBbl = calculateEnergyKWhPerBbl(oilRateBOPD, srpSPM, strokeInches, viscosityCP);

  const W_rod = 3340;
  const W_fluid = 2650;
  const drag = (3340 - rodMargin);
  const peakLoad = Math.round(W_rod + W_fluid + (drag * 0.65));
  const minLoad = Math.round(Math.max(150, W_rod - drag));
  const pumpFailureRiskPct = Math.round(Math.min(95, Math.max(4, (rodFloatRisk * 0.5) + (srpSPM * 5) + (viscosityCP > 1000 ? 25 : 0))));

  return {
    timestamp: new Date().toISOString(),
    oilRateBOPD,
    waterRateBWPD,
    waterCutPct,
    casingPressurePsi,
    tubingPressurePsi,
    wellheadPressurePsi,
    bottomholePressurePsi,
    reservoirTempC,
    steamInjectionRateTonnesDay: steamRate,
    steamInjectionPressurePsi: steamPressure,
    steamQualityPct: steamQuality,
    steamTempC: steamTemp,
    estimatedViscosityCP: viscosityCP,
    fluidMobilityMD_CP: Math.round((280 / Math.max(5, viscosityCP)) * 100) / 100,
    srpStrokeLengthInches: strokeInches,
    srpSPM,
    vfdFrequencyHz: Math.round((srpSPM / 6.0) * 50 * 10) / 10,
    pumpFillagePct: fillagePct,
    pumpEfficiencyPct,
    peakPolishedRodLoadLbs: peakLoad,
    minPolishedRodLoadLbs: minLoad,
    rodFloatMarginLbs: rodMargin,
    rodFloatRiskPct: rodFloatRisk,
    pumpFailureRiskPct,
    energyConsumptionKWhBbl,
    steamOilRatioSOR: 3.42,
    thermalZoneRadiusMeters: 18.5,
    channelingRiskIndex: channelingRisk,
  };
}

/**
 * Generates continuous time-series trend points for charting
 */
export function generateTimeSeriesData(
  wellId: WellId,
  timeframe: '1H' | '6H' | '24H' | '7D' | '30D' | 'CYCLE'
): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = [];
  let count = 24;
  let intervalMinutes = 60;

  if (timeframe === '1H') {
    count = 30;
    intervalMinutes = 2;
  } else if (timeframe === '6H') {
    count = 36;
    intervalMinutes = 10;
  } else if (timeframe === '24H') {
    count = 24;
    intervalMinutes = 60;
  } else if (timeframe === '7D') {
    count = 28;
    intervalMinutes = 360; // 6h
  } else if (timeframe === '30D') {
    count = 30;
    intervalMinutes = 1440; // 24h
  } else if (timeframe === 'CYCLE') {
    count = 45;
    intervalMinutes = 2880; // 2 days
  }

  const baseTelemetry = getWellTelemetry(wellId);
  const now = Date.now();

  for (let i = count; i >= 0; i--) {
    const t = new Date(now - i * intervalMinutes * 60 * 1000);
    const progress = 1 - (i / count);

    // Realistic thermal decline or fluctuation
    let temp = baseTelemetry.reservoirTempC;
    if (timeframe === '30D' || timeframe === 'CYCLE') {
      // Natural thermal decay from post-soak 160C to current
      temp = 150 - (progress * 65) + Math.sin(i * 0.4) * 2;
    } else {
      temp = baseTelemetry.reservoirTempC + Math.sin(i * 0.6) * 1.5;
    }

    const visc = calculateViscosityCP(temp);
    const spm = baseTelemetry.srpSPM;
    const fillage = spm > 0 ? calculatePumpFillagePct(visc, spm, 360) : 0;
    const oilRate = spm > 0 ? calculateOilRateBOPD(baseTelemetry.srpStrokeLengthInches, spm, fillage, 42) : 0;
    const energy = calculateEnergyKWhPerBbl(oilRate, spm, baseTelemetry.srpStrokeLengthInches, visc);

    const timeLabel = (timeframe === '1H' || timeframe === '6H')
      ? t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : (timeframe === '24H')
        ? t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : t.toLocaleDateString([], { month: 'short', day: 'numeric' });

    points.push({
      timestamp: t.toISOString(),
      timeLabel,
      oilRate,
      predictedOilRate: Math.round((oilRate * (1 + 0.04 * Math.sin(i * 0.8))) * 10) / 10,
      reservoirTemp: Math.round(temp * 10) / 10,
      viscosity: visc,
      wellheadPressure: Math.round(baseTelemetry.wellheadPressurePsi + Math.sin(i * 0.5) * 4),
      casingPressure: Math.round(baseTelemetry.casingPressurePsi + Math.cos(i * 0.3) * 6),
      tubingPressure: Math.round(baseTelemetry.tubingPressurePsi + Math.sin(i * 0.7) * 8),
      srpSPM: spm,
      pumpFillage: fillage,
      rodLoadPeak: Math.round(baseTelemetry.peakPolishedRodLoadLbs + Math.sin(i) * 120),
      rodLoadMin: Math.round(baseTelemetry.minPolishedRodLoadLbs - Math.cos(i) * 80),
      energyKWhBbl: energy,
    });
  }

  return points;
}

/**
 * Returns historical CSS cycles for comparison
 */
export function getWellCSSCycles(wellId: WellId): CSSCycleData[] {
  return [
    {
      cycleNumber: 1,
      status: 'COMPLETED',
      steamVolumeTonnes: 1550,
      injectionRateTonnesDay: 95,
      injectionPressurePsi: 1320,
      injectionDurationDays: 16,
      soakDurationDays: 5,
      productionDurationDays: 84,
      peakOilRateBOPD: 184,
      cumulativeOilBbl: 7420,
      cumulativeSteamTonnes: 1550,
      sorBblTon: 4.78,
      energyConsumptionMWh: 38.4,
      peakReservoirTempC: 228,
      endReservoirTempC: 48,
      notes: 'Initial virgin reservoir thermal stimulation. High steam mobility, moderate water breakthrough after day 65.',
    },
    {
      cycleNumber: 2,
      status: 'COMPLETED',
      steamVolumeTonnes: 1720,
      injectionRateTonnesDay: 105,
      injectionPressurePsi: 1390,
      injectionDurationDays: 16,
      soakDurationDays: 6,
      productionDurationDays: 92,
      peakOilRateBOPD: 215,
      cumulativeOilBbl: 8960,
      cumulativeSteamTonnes: 1720,
      sorBblTon: 5.21,
      energyConsumptionMWh: 44.1,
      peakReservoirTempC: 236,
      endReservoirTempC: 51,
      notes: 'Excellent thermal conformance. SRP speed held at 4.2 SPM during peak phase; increased pump fillage.',
    },
    {
      cycleNumber: 3,
      status: 'COMPLETED',
      steamVolumeTonnes: 1850,
      injectionRateTonnesDay: 110,
      injectionPressurePsi: 1440,
      injectionDurationDays: 17,
      soakDurationDays: 6,
      productionDurationDays: 88,
      peakOilRateBOPD: 198,
      cumulativeOilBbl: 8140,
      cumulativeSteamTonnes: 1850,
      sorBblTon: 4.40,
      energyConsumptionMWh: 49.8,
      peakReservoirTempC: 242,
      endReservoirTempC: 53,
      notes: 'Minor rod-float detected in late cycle due to excessive SPM (5.8). Re-adjusted VFD to 38 Hz.',
    },
    {
      cycleNumber: 4,
      status: 'ACTIVE',
      steamVolumeTonnes: 1920,
      injectionRateTonnesDay: 115,
      injectionPressurePsi: 1420,
      injectionDurationDays: 17,
      soakDurationDays: 5,
      productionDurationDays: 46, // in progress
      peakOilRateBOPD: 226,
      cumulativeOilBbl: 5180,
      cumulativeSteamTonnes: 1920,
      sorBblTon: 2.70, // to date
      energyConsumptionMWh: 28.2,
      peakReservoirTempC: 248,
      endReservoirTempC: 96, // current
      notes: 'Current active cycle. Steady production phase. Viscosity stable at 168 cP. Excellent pump fillage (88%).',
    },
    {
      cycleNumber: 5,
      status: 'PLANNED',
      steamVolumeTonnes: 2050,
      injectionRateTonnesDay: 118,
      injectionPressurePsi: 1460,
      injectionDurationDays: 17,
      soakDurationDays: 6,
      productionDurationDays: 95,
      peakOilRateBOPD: 235,
      cumulativeOilBbl: 9400,
      cumulativeSteamTonnes: 2050,
      sorBblTon: 4.58,
      energyConsumptionMWh: 52.0,
      peakReservoirTempC: 252,
      endReservoirTempC: 55,
      notes: 'Model-optimized proposal. Enlarged thermal radius + targeted low-frequency SRP pumping schedule.',
    },
  ];
}

/**
 * Component health scores and maintenance timelines
 */
export function getComponentHealthData(wellId: WellId): ComponentHealth[] {
  const isBW04 = wellId === 'BW-04';
  return [
    {
      component: 'SRP Surface Unit',
      healthScorePct: isBW04 ? 76 : 91,
      status: isBW04 ? 'WATCH' : 'NORMAL',
      failureRiskTrend: isBW04 ? 'INCREASING' : 'STABLE',
      operatingHours: 14280,
      lastInspectionDate: '2026-01-18',
      anomaliesDetectedCount: isBW04 ? 5 : 1,
      riskTimelineCurrentDays: 0,
      earlyWarningDays: 18,
      inspectionRecommendedDays: 45,
      failureWindowDays: 120,
      primaryStressFactor: 'Gearbox cyclic torque variation from viscous downstroke drag',
    },
    {
      component: 'Rod String (Grade D)',
      healthScorePct: isBW04 ? 64 : 88,
      status: isBW04 ? 'WARNING' : 'NORMAL',
      failureRiskTrend: isBW04 ? 'INCREASING' : 'STABLE',
      operatingHours: 8950,
      lastInspectionDate: '2025-11-14',
      anomaliesDetectedCount: isBW04 ? 8 : 0,
      riskTimelineCurrentDays: 0,
      earlyWarningDays: 10,
      inspectionRecommendedDays: 25,
      failureWindowDays: 75,
      primaryStressFactor: isBW04 ? 'Compressive rod-buckling hazard during downstroke fluid drag' : 'Normal tension fatigue',
    },
    {
      component: 'Downhole Plunger Pump',
      healthScorePct: isBW04 ? 71 : 94,
      status: isBW04 ? 'WATCH' : 'NORMAL',
      failureRiskTrend: 'STABLE',
      operatingHours: 8950,
      lastInspectionDate: '2025-11-14',
      anomaliesDetectedCount: isBW04 ? 3 : 0,
      riskTimelineCurrentDays: 0,
      earlyWarningDays: 28,
      inspectionRecommendedDays: 60,
      failureWindowDays: 150,
      primaryStressFactor: 'Viscous sand carry-over & ball-valve lag in cold crude',
    },
    {
      component: 'Production Tubing',
      healthScorePct: isBW04 ? 80 : 92,
      status: 'NORMAL',
      failureRiskTrend: 'STABLE',
      operatingHours: 23400,
      lastInspectionDate: '2025-08-20',
      anomaliesDetectedCount: 1,
      riskTimelineCurrentDays: 0,
      earlyWarningDays: 45,
      inspectionRecommendedDays: 90,
      failureWindowDays: 240,
      primaryStressFactor: 'Internal rod coupling abrasive wear during buckled downstroke',
    },
    {
      component: 'Thermal Wellhead',
      healthScorePct: 96,
      status: 'NORMAL',
      failureRiskTrend: 'STABLE',
      operatingHours: 32000,
      lastInspectionDate: '2026-02-02',
      anomaliesDetectedCount: 0,
      riskTimelineCurrentDays: 0,
      earlyWarningDays: 90,
      inspectionRecommendedDays: 180,
      failureWindowDays: 365,
      primaryStressFactor: 'Thermal expansion packing gland cycling',
    },
  ];
}

/**
 * Returns Active & Historical Alerts
 */
export function getFieldAlerts(wellId: WellId): AlertItem[] {
  const alerts: AlertItem[] = [
    {
      id: 'ALT-1092',
      severity: 'WARNING',
      category: 'SRP',
      parameter: 'Polished Rod Downstroke Margin',
      currentValue: '380 lbs',
      thresholdValue: '< 600 lbs',
      timestamp: '2026-09-27 18:42:10 IST',
      title: 'Possible Rod-Floating Behaviour Detected',
      description: 'Downstroke rod drag force is approaching buoyant string weight. Rod velocity is lagging carrier bar, risking compressive buckling and surface cable slack slap.',
      possibleCause: 'Declining reservoir temperature has increased oil viscosity to 1,840 cP while SPM remains set at 5.2 strokes/min.',
      suggestedAction: 'Reduce VFD frequency from 43 Hz to 35 Hz to lower pump speed to 4.2 SPM; evaluate timing for next CSS cycle injection.',
      acknowledged: false,
    },
    {
      id: 'ALT-1088',
      severity: 'WATCH',
      category: 'RESERVOIR',
      parameter: 'Reservoir Near-Wellbore Temperature',
      currentValue: '54.2 °C',
      thresholdValue: '< 60.0 °C',
      timestamp: '2026-09-27 14:15:00 IST',
      title: 'Reservoir Cooling Trend Detected',
      description: 'Temperature decline rate has steepened to -0.65 °C/day. Estimated viscosity has crossed 1,500 cP threshold.',
      possibleCause: 'Natural thermal conduction to surrounding formations; cumulative heat depletion after 82 days of cycle 3 production.',
      suggestedAction: 'Review CSS cycle turn-around schedule; prepare steam generator hookup and casing thermal packer.',
      acknowledged: true,
      acknowledgedBy: 'P. Sharma (Sr. Production Eng)',
      acknowledgedAt: '2026-09-27 15:02:18 IST',
    },
    {
      id: 'ALT-1074',
      severity: 'WATCH',
      category: 'PRODUCTION',
      parameter: 'Pump Fillage',
      currentValue: '58 %',
      thresholdValue: '< 70 %',
      timestamp: '2026-09-27 10:20:45 IST',
      title: 'Incomplete Pump Fillage Indication',
      description: 'Dynamometer card indicates partial chamber fillage. Traveling valve seating delayed, causing mild fluid pound on downstroke.',
      possibleCause: 'Heavy viscous oil inflow resistance into the pump standing valve under current drawdown.',
      suggestedAction: 'Verify casing head gas venting; throttle pump speed by 0.6 SPM to match formation inflow capacity.',
      acknowledged: true,
      acknowledgedBy: 'R. K. Meena (Field Operator)',
      acknowledgedAt: '2026-09-27 11:00:22 IST',
    },
    {
      id: 'ALT-1061',
      severity: 'NORMAL',
      category: 'CSS',
      parameter: 'Steam Annulus Leakage Check',
      currentValue: '120 psi',
      thresholdValue: '> 450 psi',
      timestamp: '2026-09-26 08:00:00 IST',
      title: 'Steam Conformance Normal',
      description: 'Thermal packer isolation verified. Annulus casing pressure stable within baseline range.',
      possibleCause: 'Normal operational containment.',
      suggestedAction: 'Continue scheduled 4-hour SCADA pressure sweeps.',
      acknowledged: true,
    },
  ];

  if (wellId === 'BW-12') {
    alerts.unshift({
      id: 'ALT-1104',
      severity: 'CRITICAL',
      category: 'CSS',
      parameter: 'Casing Annulus Pressure',
      currentValue: '485 psi',
      thresholdValue: '> 400 psi',
      timestamp: '2026-09-27 19:10:00 IST',
      title: 'Possible Steam Breakthrough / Channeling Indicator',
      description: 'Elevated casing annulus pressure observed during high-rate steam injection. Near-wellbore pressure response suggests preferential high-permeability thief zone or thermal packer bypass.',
      possibleCause: 'Steam channeling through high-permeability streak or mechanical breakdown of thermal expansion seal.',
      suggestedAction: 'Immediately throttle steam injection rate from 115 t/d to 80 t/d; execute acoustic liquid-level and thermal tracer survey.',
      acknowledged: false,
    });
  }

  return alerts;
}

/**
 * Returns Steam Channeling & Breakthrough Diagnostics
 */
export function getChannelingDiagnostics(wellId: WellId): ChannelingIndicator {
  const isBW12 = wellId === 'BW-12';
  return {
    status: isBW12 ? 'POSSIBLE_CHANNELING' : 'NORMAL',
    confidencePct: isBW12 ? 78 : 94,
    breakthroughRiskScore: isBW12 ? 68 : 14,
    casingAnnulusPressureRatePsiHr: isBW12 ? 4.2 : 0.1,
    wellheadTempRiseRateCDay: isBW12 ? 3.8 : 0.4,
    waterCutSurgePct: isBW12 ? 18.5 : 1.2,
    lastAnalysisTimestamp: '2026-09-27 20:30:00 IST',
    diagnosticNotes: isBW12
      ? 'Indicator triggered by rapid casing annulus pressure buildup (+4.2 psi/hr) coinciding with peak injection rate. Hall plot slope deflection indicates decreased near-wellbore flow resistance.'
      : 'Normal thermal conformance. Pressure and temperature responses conform to standard radial thermal front expansion in Jodhpur sandstone.',
  };
}

/**
 * Default Simulation Scenarios for What-If Analysis
 */
export function getDefaultScenarios(): SimulationScenario[] {
  const current = simulateScenarioPhysics({
    steamVolumeTonnes: 1800,
    injectionPressurePsi: 1400,
    injectionDurationDays: 16,
    soakDays: 5,
    productionCutoffWaterCutPct: 85,
    srpStrokeLengthInches: 100,
    srpSPM: 5.2,
    vfdFrequencyHz: 43.3,
  }, 'Current Operating Baseline');

  const scenarioA = simulateScenarioPhysics({
    steamVolumeTonnes: 2100, // Higher steam volume
    injectionPressurePsi: 1450,
    injectionDurationDays: 18,
    soakDays: 7, // Extended soak for deeper thermal penetration
    productionCutoffWaterCutPct: 85,
    srpStrokeLengthInches: 100,
    srpSPM: 4.4, // Lower, safer SRP speed for higher fillage & lower rod stress
    vfdFrequencyHz: 36.6,
  }, 'Scenario A: High Thermal + Reduced SPM (Recommended)');

  const scenarioB = simulateScenarioPhysics({
    steamVolumeTonnes: 1500, // Low steam to reduce cost
    injectionPressurePsi: 1350,
    injectionDurationDays: 14,
    soakDays: 4,
    productionCutoffWaterCutPct: 85,
    srpStrokeLengthInches: 120, // Long stroke, high speed
    srpSPM: 5.8,
    vfdFrequencyHz: 48.3,
  }, 'Scenario B: Low Steam + Aggressive Lifting');

  return [current, scenarioA, scenarioB];
}
