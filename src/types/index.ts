export type WellId = 'BW-01' | 'BW-04' | 'BW-12' | 'BW-19';

export type CSSStage = 'INJECTION' | 'SOAKING' | 'PRODUCTION' | 'SHUT_IN';

export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'WATCH' | 'NORMAL';

export type AlertCategory = 'RESERVOIR' | 'CSS' | 'SRP' | 'PRODUCTION' | 'ENERGY' | 'EQUIPMENT';

export interface WellInfo {
  id: WellId;
  name: string;
  field: string;
  basin: string;
  formation: string;
  depthMeters: number;
  apiGravity: number;
  deadOilViscosityInitialCP: number;
  currentCycle: number;
  currentStage: CSSStage;
  stageDay: number;
  stageTotalDays: number;
  pumpType: string;
  tubingDiameterInches: number;
  plungerDiameterInches: number;
  motorRatingHP: number;
  lastWorkoverDate: string;
}

export interface TelemetryData {
  timestamp: string;
  oilRateBOPD: number;
  waterRateBWPD: number;
  waterCutPct: number;
  casingPressurePsi: number;
  tubingPressurePsi: number;
  wellheadPressurePsi: number;
  bottomholePressurePsi: number;
  reservoirTempC: number;
  steamInjectionRateTonnesDay: number;
  steamInjectionPressurePsi: number;
  steamQualityPct: number;
  steamTempC: number;
  estimatedViscosityCP: number;
  fluidMobilityMD_CP: number;
  srpStrokeLengthInches: number;
  srpSPM: number;
  vfdFrequencyHz: number;
  pumpFillagePct: number;
  pumpEfficiencyPct: number;
  peakPolishedRodLoadLbs: number;
  minPolishedRodLoadLbs: number;
  rodFloatMarginLbs: number;
  rodFloatRiskPct: number;
  pumpFailureRiskPct: number;
  energyConsumptionKWhBbl: number;
  steamOilRatioSOR: number;
  thermalZoneRadiusMeters: number;
  channelingRiskIndex: number; // 0 - 100
}

export interface TimeSeriesPoint {
  timestamp: string;
  timeLabel: string;
  oilRate: number;
  reservoirTemp: number;
  viscosity: number;
  wellheadPressure: number;
  casingPressure: number;
  tubingPressure: number;
  srpSPM: number;
  pumpFillage: number;
  rodLoadPeak: number;
  rodLoadMin: number;
  energyKWhBbl: number;
  predictedOilRate?: number;
}

export interface DynoPoint {
  positionInches: number; // 0 to stroke length
  surfaceLoadLbs: number;
  downholeLoadLbs: number;
  referenceNormalSurfaceLoadLbs: number;
}

export interface CSSCycleData {
  cycleNumber: number;
  status: 'COMPLETED' | 'ACTIVE' | 'PLANNED';
  steamVolumeTonnes: number;
  injectionRateTonnesDay: number;
  injectionPressurePsi: number;
  injectionDurationDays: number;
  soakDurationDays: number;
  productionDurationDays: number;
  peakOilRateBOPD: number;
  cumulativeOilBbl: number;
  cumulativeSteamTonnes: number;
  sorBblTon: number;
  energyConsumptionMWh: number;
  peakReservoirTempC: number;
  endReservoirTempC: number;
  notes: string;
}

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  category: AlertCategory;
  parameter: string;
  currentValue: string;
  thresholdValue: string;
  timestamp: string;
  title: string;
  description: string;
  possibleCause: string;
  suggestedAction: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface SimulationScenario {
  id: string;
  name: string;
  steamVolumeTonnes: number;
  injectionPressurePsi: number;
  injectionDurationDays: number;
  soakDays: number;
  productionCutoffWaterCutPct: number;
  srpStrokeLengthInches: number;
  srpSPM: number;
  vfdFrequencyHz: number;
  // Predicted results
  predictedAvgOilRateBOPD: number;
  predictedPeakOilRateBOPD: number;
  predictedCumulativeOilBbl: number;
  predictedPeakTempC: number;
  predictedViscosityCP: number;
  predictedPumpFillagePct: number;
  predictedSOR: number;
  predictedEnergyKWhBbl: number;
  predictedRodFloatRiskPct: number;
  predictedPumpFailureRiskPct: number;
  economicNetIndex: number;
}

export interface ComponentHealth {
  component: 'SRP Surface Unit' | 'Rod String (Grade D)' | 'Downhole Plunger Pump' | 'Production Tubing' | 'Thermal Wellhead';
  healthScorePct: number;
  status: 'NORMAL' | 'WATCH' | 'WARNING' | 'CRITICAL';
  failureRiskTrend: 'STABLE' | 'INCREASING' | 'DECREASING';
  operatingHours: number;
  lastInspectionDate: string;
  anomaliesDetectedCount: number;
  riskTimelineCurrentDays: number;
  earlyWarningDays: number;
  inspectionRecommendedDays: number;
  failureWindowDays: number;
  primaryStressFactor: string;
}

export interface ChannelingIndicator {
  status: 'NORMAL' | 'WATCH' | 'POSSIBLE_CHANNELING';
  confidencePct: number;
  breakthroughRiskScore: number;
  casingAnnulusPressureRatePsiHr: number;
  wellheadTempRiseRateCDay: number;
  waterCutSurgePct: number;
  lastAnalysisTimestamp: string;
  diagnosticNotes: string;
}
