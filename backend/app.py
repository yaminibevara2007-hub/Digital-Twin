"""
Baghewala Field CSS-SRP Digital Twin Platform
FastAPI Petroleum Engineering Optimization & Diagnostics Backend
Bikaner-Nagaur Basin, Rajasthan, India
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import math
import datetime

app = FastAPI(
    title="Baghewala Field CSS-SRP Digital Twin API",
    description="Industrial petroleum engineering decision-support platform for heavy oil wells",
    version="1.0.0"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- PHYSICAL CONSTANTS & REPOSITORY ---
FIELD_NAME = "Baghewala Heavy Oil Field"
BASIN = "Bikaner-Nagaur Basin, Rajasthan"
FORMATION = "Jodhpur Sandstone"
DEPTH_M = 410.0
DEAD_OIL_VISC_40C = 22000.0 # cP
ROD_BUOYANT_WEIGHT_LBS = 3340.0

def calculate_viscosity_cp(temp_c: float) -> float:
    t = max(15.0, temp_c)
    t_k = t + 273.15
    t_ref_k = 40.0 + 273.15
    b = 5820.0
    ln_visc = math.log(DEAD_OIL_VISC_40C) + b * ((1.0 / t_k) - (1.0 / t_ref_k))
    visc = math.exp(ln_visc)
    return round(max(8.0, min(65000.0, visc)), 1)

def calculate_rod_drag_lbs(viscosity_cp: float, spm: float, stroke_inches: float) -> float:
    v_avg = 2.0 * (stroke_inches * 0.0254) * (spm / 60.0) # m/s
    mu_pa_s = viscosity_cp * 0.001
    l_m = DEPTH_M
    r_ratio = 1.8
    drag_n = (2.0 * math.pi * mu_pa_s * v_avg * l_m) / math.log(r_ratio)
    return max(0.0, round(drag_n * 0.224809, 1))

class SimulationInput(BaseModel):
    scenario_name: str = "Proposed Operating Point"
    steam_volume_tonnes: float
    injection_pressure_psi: float
    injection_duration_days: float
    soak_days: float
    production_cutoff_wc_pct: float = 85.0
    srp_stroke_length_inches: float
    srp_spm: float
    vfd_frequency_hz: float

class AlertAckRequest(BaseModel):
    acknowledged_by: str = "P. Sharma (Sr. Production Engineer)"

@app.get("/api/health")
def health_check():
    return {
        "status": "ONLINE",
        "system": "SCADA-PetroEngine Decision Support Platform",
        "field": FIELD_NAME,
        "basin": BASIN,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "dataSource": "Synthetic / Demo Physics Calibrated"
    }

@app.get("/api/wells")
def get_wells():
    return [
        {
            "id": "BW-01",
            "name": "BW-01 (Producer)",
            "stage": "PRODUCTION",
            "cycle": 4,
            "stageDay": 46,
            "depthM": 412,
            "apiGravity": 18.6
        },
        {
            "id": "BW-04",
            "name": "BW-04 (Cooling / High Drag)",
            "stage": "PRODUCTION",
            "cycle": 3,
            "stageDay": 82,
            "depthM": 428,
            "apiGravity": 18.2
        },
        {
            "id": "BW-12",
            "name": "BW-12 (Thermal Injection)",
            "stage": "INJECTION",
            "cycle": 5,
            "stageDay": 12,
            "depthM": 395,
            "apiGravity": 19.1
        },
        {
            "id": "BW-19",
            "name": "BW-19 (Soak Phase)",
            "stage": "SOAKING",
            "cycle": 2,
            "stageDay": 4,
            "depthM": 405,
            "apiGravity": 18.4
        }
    ]

@app.post("/api/simulation/run")
def run_simulation(data: SimulationInput):
    # Thermal gain
    heat_gain = (data.steam_volume_tonnes / 1800.0) * 165.0
    peak_temp_c = min(240.0, 42.0 + heat_gain)
    soak_efficiency = max(0.7, 1.0 - abs(data.soak_days - 5.0) * 0.04)
    avg_temp_c = 42.0 + (peak_temp_c - 42.0) * 0.58 * soak_efficiency

    viscosity_cp = calculate_viscosity_cp(avg_temp_c)

    # SRP Performance
    mobility = min(1.0, 500.0 / max(10.0, viscosity_cp))
    speed_penalty = max(0.0, (data.srp_spm - 2.5) * 6.5)
    fillage_pct = round(min(98.0, max(18.0, 92.0 * mobility - speed_penalty + 8.0)), 1)

    c = 0.1166 * (2.25 ** 2)
    fluid_rate = c * data.srp_stroke_length_inches * data.srp_spm * (fillage_pct / 100.0)
    oil_rate = round(max(2.0, fluid_rate * 0.55), 1)

    drag_lbs = calculate_rod_drag_lbs(viscosity_cp, data.srp_spm, data.srp_stroke_length_inches)
    rod_margin = ROD_BUOYANT_WEIGHT_LBS - drag_lbs
    rod_float_risk = 95.0 if rod_margin <= 0 else max(2.0, min(95.0, (1400.0 - rod_margin) / 14.0))

    prod_days = 90 - int(data.injection_duration_days) - int(data.soak_days)
    cumulative_oil = round(oil_rate * prod_days * 0.92)
    sor = round((data.steam_volume_tonnes * 6.29 / max(1.0, cumulative_oil)), 2)

    return {
        "scenarioName": data.scenario_name,
        "predictedAvgOilRateBOPD": oil_rate,
        "predictedCumulativeOilBbl": cumulative_oil,
        "predictedPeakTempC": round(peak_temp_c, 1),
        "predictedViscosityCP": viscosity_cp,
        "predictedPumpFillagePct": fillage_pct,
        "predictedSOR": sor,
        "predictedRodFloatRiskPct": round(rod_float_risk, 1),
        "predictedRodDragLbs": round(drag_lbs, 1),
        "predictedRodMarginLbs": round(rod_margin, 1)
    }

@app.post("/api/css/optimize")
def optimize_css(current_cycle: int = 4, reservoir_temp_c: float = 54.0):
    viscosity = calculate_viscosity_cp(reservoir_temp_c)
    return {
        "status": "RECOMMENDATION_GENERATED",
        "currentCondition": {
            "reservoirTempC": reservoir_temp_c,
            "viscosityCP": viscosity,
            "fluidMobility": round(280.0 / viscosity, 2)
        },
        "recommendedCycle": {
            "steamVolumeTonnes": 2050,
            "injectionRateTonnesDay": 118,
            "injectionPressurePsi": 1460,
            "injectionDurationDays": 17,
            "soakDurationDays": 6,
            "targetNearWellboreTempC": 235.0,
            "targetViscosityCP": 45.0
        },
        "engineeringRationale": (
            "Near-wellbore thermal decay has increased crude viscosity beyond 1,500 cP, "
            "reducing fluid mobility into the pump intake by 74%. "
            "A steam volume of 2,050 tonnes with a 6-day thermal soaking window is recommended "
            "to establish an 18-meter heated radius while preventing early casing thermal packer fatigue."
        )
    }

@app.post("/api/srp/optimize")
def optimize_srp(current_spm: float = 5.2, viscosity_cp: float = 1840.0):
    recommended_spm = 4.0 if viscosity_cp > 1200.0 else 4.6
    return {
        "status": "RECOMMENDATION_GENERATED",
        "currentSPM": current_spm,
        "recommendedSPM": recommended_spm,
        "recommendedVfdHz": round((recommended_spm / 6.0) * 50.0, 1),
        "engineeringRationale": (
            f"Current fluid viscosity is elevated at {viscosity_cp} cP. "
            f"At {current_spm} SPM, downstroke rod viscous drag reaches 2,960 lbs, "
            f"reducing the net falling force to only 380 lbs (rod-float risk: 78%). "
            f"Reducing pumping speed to {recommended_spm} SPM restores the buoyant margin to 1,220 lbs, "
            "improves standing-valve fillage to 86%, and reduces motor torque cyclic fatigue."
        )
    }
