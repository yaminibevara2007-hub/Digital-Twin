# Baghewala Field CSS-SRP Digital Twin Platform
## Comprehensive Technical Documentation & Architectural Specification

---

## 1. Executive Summary & Field Context

### 1.1 Asset Background: Baghewala Heavy Oil Field
The **Baghewala Field**, situated in the Bikaner-Nagaur Basin of Rajasthan, India, represents one of the country's most technically demanding upstream hydrocarbon assets. The target reservoir is the **Jodhpur Sandstone formation** (Lower, Middle, and Upper Sand units), located at shallow depths between **360 m and 430 m TVD**.

### 1.2 Reservoir & Fluid Characterization
- **Crude Gravity**: 18.2° – 19.1° API (Extra-Heavy / Viscous Asphaltic Crude).
- **Dead Oil Viscosity at Virgin Reservoir Temperature (40°C–42°C)**: ~**20,000 to 24,000 cP**.
- **In-Situ Fluid State**: Immobile under natural reservoir energy conditions. The fluid has zero commercial natural inflow into a conventional wellbore without thermal intervention.
- **Reservoir Porosity**: ~26%.
- **Permeability**: 1,600 to 2,000 mD.
- **Initial Reservoir Pressure**: ~360 psi (~2.5 MPa).

### 1.3 Exploitation Strategy: Coupled CSS & SRP
To extract Baghewala heavy crude, operators deploy **Cyclic Steam Stimulation (CSS)** (colloquially termed the "Huff-and-Puff" method) paired with **Sucker Rod Pump (SRP / Beam Pump)** artificial lift:
1. **Steam Injection (Huff)**: High-pressure superheated steam (80% quality, ~1,420 psi, ~308°C) is injected downhole for 14–18 days to heat the matrix, conduct thermal energy radially, and drop oil viscosity by orders of magnitude (from ~22,000 cP down to <100 cP at peak temperatures).
2. **Thermal Soaking (Soak)**: The well is shut in for 4–7 days to allow uniform conductive heat dissipation across the near-wellbore radius ($R_{\text{th}} \approx 18.5\text{ m}$).
3. **Production Phase (Puff)**: The well is placed on artificial lift using an insert sucker rod pump. As fluids are produced over 70–90 days, the near-wellbore reservoir cools continuously back towards 45°C–50°C.

### 1.4 The Engineering Challenge & Digital Twin Purpose
As the thermal zone cools:
- **Crude Viscosity Escalates Non-Linearly**: Increases from 100 cP post-soak up to 1,500+ cP towards late cycle.
- **Darcy Fluid Inflow Velocity Drops**: Fluid mobility ($k/\mu$) drops, diminishing chamber fillage.
- **Downstroke Viscous Drag Spikes**: The downward motion of the sucker rod string through highly viscous crude creates hydrodynamic drag that opposes rod gravity. When viscous drag approaches the buoyant weight of the rods (3,340 lbs), the rods **float**, fail to fall at pump speed, slacken the bridle cable, and cause severe compressive buckling, rod parting, or pump barrel destruction.
- **Steam Channeling Risk**: High-permeability streaks or fractured anhydrite caprock seals can cause steam to channel prematurely into casing annuli, risking casing rupture or bypassed reserves.

The **Baghewala Digital Twin Platform** couples reservoir thermodynamics, multiphase fluid rheology, wellbore hydraulic pressure gradients, downhole sucker rod mechanics, and surface beam pumping dynamics into a single, real-time decision-support system.

---

## 2. Architecture & Technology Stack

### 2.1 Technology Matrix
| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Core Framework** | React 19.2 (TypeScript) | High-performance reactive UI and virtual twin state management. |
| **Build & Tooling** | Vite 8.3 & TypeScript 6.0 | Sub-second HMR and strict type-safe compilation. |
| **Styling & Design System** | TailwindCSS 3.4 & PostCSS | Architectural design system using CSS variables and precise engineering tokens. |
| **Data Visualization** | Recharts 3.10 | Engineering charts (Line graphs, Dynamometer cards, bar charts). |
| **Iconography** | Lucide React | Clean, subtle line icons (no decorative AI/3D graphics). |
| **Backend Integration** | REST / Fetch API | Health probing and optional connection to a FastAPI physics engine. |

### 2.2 Design Philosophy: Clean White Engineering Workspace
The visual aesthetic strictly adheres to international standards for industrial SCADA and petroleum engineering consoles:
- **Clean White Palette**: Dominated by pure white (`#FFFFFF`), light gray backdrop (`#F7F8FA`), and thin architectural borders (`#E5E7EB`).
- **Typography**: Inter (modern, calm, legible) paired with IBM Plex Mono for numerical tabular readouts.
- **Color Discipline**: Color is reserved exclusively for operational meaning (navy for primary controls, green for normal/optimal limits, amber for watch/drag warnings, red for critical limit breaches, and thermal orange for steam/heat).
- **Human-Designed & Professional**: Completely free of futuristic AI visual noise (no floating glowing blobs, purple neon gradients, "AI-powered" marketing badges, or 3D cartoon models).

---

## 3. Global Information Architecture & Navigation

### 3.1 Why the Vertical Left Sidebar Was Removed
In previous iterations, a 14-item vertical sidebar occupied 260px of permanent horizontal screen width. This compressed the main visualization workspace, forced data-dense engineering charts to wrap awkwardly, and caused visual fatigue. 

The vertical sidebar was **completely eliminated** and replaced by a **compact, single horizontal top navigation bar** (`src/components/Header.tsx`).

### 3.2 Top Horizontal Navigation Bar Architecture
The top bar spans the full viewport width (64px height) with a clean bottom border:
```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [BF] Baghewala Field    Overview  Digital Twin  Monitoring▾  CSS▾  SRP▾  Analytics▾ ...│  Well: BGW-01▾  ● Normal  10:32 AM  DEMO │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Left Section — Brand Identity**:
   - `BF` monogram badge (soft blue `#EAF3F8` background, navy `#183B56` text).
   - Asset Title: `Baghewala Field` (14px, font-semibold).
   - Subtitle: `Rajasthan, India` (11px, text-app-muted).
2. **Center Section — Horizontal Grouped Navigation**:
   - **Overview**: Instant operational health overview.
   - **Digital Twin**: Virtual coupled well cross-section and component inspector.
   - **Monitoring** (Dropdown):
     - *Well Monitoring*: Multivariable real-time transducer trends (WHP, TP, CP, rates).
     - *Reservoir Thermal*: In-situ temperature decay and Walther viscosity curve.
     - *Alerts*: Multi-variant steam breakthrough and diagnostic alarms with badge counts.
   - **CSS** (Dropdown):
     - *CSS Optimization*: 3-stage thermal pipeline tracking and cycle turn-around forecasting.
     - *Historical CSS Cycles*: Cross-cycle cumulative steam vs oil conformance logs.
   - **SRP** (Dropdown):
     - *SRP Optimization*: Dynamometer card canvas and interactive VFD/SPM sliders.
     - *Pump Health*: Rod-float margin calculations and mechanical wear states.
     - *Engineering Limits*: Petroleum safety interlocks and operational envelope limits.
   - **Analytics** (Dropdown):
     - *Production*: Decline curve forecasts with statistical uncertainty bands.
     - *Energy & Steam*: Specific lifting energy (kWh/bbl) and cumulative SOR tracking.
     - *Reports*: Formal engineering field summary reports with printable export.
   - **Maintenance**: Predictive failure risk and rod-string buckling surveillance.
   - **Simulation**: What-If scenario sandbox with real-time physics recalculations.
   - **Reports**: Direct link to technical field dispatch summaries.
3. **Right Section — Operational Telemetry Strip**:
   - **Well Selector**: Clean native selector allowing one-click switching across all monitored assets (`BGW-01`, `BGW-04`, `BGW-12`, `BGW-19`).
   - **Status Dot**: `● Normal` in soft green (`#3D8B68`).
   - **Timestamp**: `10:32 AM` in muted typography.
   - **Subtle Demo Data Badge**: Unobtrusive indicator signifying physics-calibrated synthetic telemetry.
   - *Technical clutter removed*: Implementation details (such as FastAPI status, operator user badges, and raw baseline presets) were moved into their respective engineering settings.

---

## 4. In-Depth Module Specifications

---

### Module 1: Well Operating Overview (`OverviewPage.tsx`)

#### Purpose & User Need
Answers four critical questions in under 5 seconds:
1. *How is the well doing?*
2. *What is current production?*
3. *Is anything wrong?*
4. *What should I look at next?*

#### Page Anatomy & Features
1. **Spacious Page Header**:
   - Pure typography: `Baghewala Field` / `Well Operating Overview`.
   - Secondary metadata: `Well BGW-01 · Producer · Production Cycle 4 · Day 46 of 90`.
   - Right badge: `● Operating Normally` (soft green border).
   - *No giant cards wrapping the header*.
2. **Exactly 4 Primary KPI Cards**:
   - **Oil Production**: `45.7 bbl/day` (Status: Normal, Unit: bbl/day).
   - **Reservoir Temperature**: `96 °C` (Status: Normal, Unit: °C).
   - **SRP Speed**: `4.6 SPM` (Status: Normal, Unit: SPM).
   - **Specific SOR**: `3.42 bbl/bbl` (Status: Normal, Unit: bbl/bbl).
   - *Design*: White cards, `#E5E7EB` borders, 28px mono values, zero noisy gradients.
3. **Two-Column Core Workspace**:
   - **Left Panel (65% width) — Production Trend**:
     - Clean Recharts line graph showing **Actual Production** (solid navy `#183B56`) versus **Predicted Production** (dashed `#64748B`).
     - Includes time toggles: `7D`, `30D`, and `90D`.
     - Displays historical decline from post-soak rate (140 bbl/d) to current operating day (45.7 bbl/d).
   - **Right Panel (35% width) — Well Status Checklist**:
     - Displays 5 key subsystems: *Reservoir*, *CSS Cycle*, *SRP*, *Production*, and *Energy*.
     - Clean status dots (`● Normal`) without giant colored cards.
4. **Current Operating Condition Strip**:
   - Summarizes active phase: `Production Cycle 4 · Day 46 / 90`.
   - Concise technical status: *"Reservoir temperature and SRP operation are currently within the configured operating range."*
   - Exactly two action buttons: `[View Digital Twin ↗]` and `[Review Operating Parameters ↗]`.
5. **Subtle Alert Section**:
   - Normal: *"No immediate attention required. All monitored parameters are within the configured operating range."*
   - Cooling Alert / Drag Watch: Subdued amber prompt indicating viscous drag increase with a `[View Details]` link.

---

### Module 2: Digital Twin Virtual Physical Model (`DigitalTwinPage.tsx` & `DigitalTwinDiagram.tsx`)

#### Purpose & User Need
Provides a clean, technical, structural cross-section of the entire well-to-surface system. Enables engineers to understand **WHERE** equipment and thermodynamic zones are located, inspect parameters interactively, and understand physical coupling.

#### Page Anatomy & Features
1. **Balanced 65% / 35% Layout**:
   - **Left Panel (65%) — Well Cross-Section**:
     - Clean SVG drawing centered on a pure white panel.
     - Major structural components represented:
       - *Surface 0m*: Beam pumpjack schematic (Samson post, walking beam, horsehead) and flowline to GGS manifold.
       - *Overburden Strata (0–320m)*: Subtle neutral shale layer.
       - *Caprock Seal (320–360m)*: Impermeable anhydrite caprock boundary.
       - *Jodhpur Sandstone Reservoir (360–430m TVD)*: Soft sand fill.
       - *Thermal Zone*: Soft orange fill (`#FFF8F2`), dashed boundary indicating $R_{\text{th}} = 18.5\text{ m}$.
       - *Wellbore Column*: Navy outer casing (7"), tubing (3.5"), thermal packer at 385m, and perforation intervals (405–415m).
       - *SRP Assembly*: Sucker rod string, traveling valve, standing valve, and 2.25" pump barrel.
     - **Non-Overlapping Callout Badges**: Rectangular white badges connected by subtle leader lines:
       - `Wellhead | 85 psi`
       - `Wellbore | Casing 7" · Tubing 3.5"`
       - `Thermal Zone | 96 °C · R=18.5m`
       - `SRP Plunger | 4.6 SPM · 2.25"`
     - **Interactive Selection**: Clicking any component (or quick selector tabs) highlights the component and updates the right inspector panel.
   - **Right Panel (35%) — Technical Inspector**:
     - **Section 1: Well Condition**: Health checklist for Reservoir, Thermal Zone, Wellbore, SRP, and Surface.
     - **Section 2: Component Inspector**: Detailed parameters for the active selection:
       - *Reservoir*: Depth (412m TVD), Static pressure (360 psi), Far-field temp (42°C), Viscosity (1312 cP), Thermal radius (18.5m).
       - *Thermal Zone*: In-situ temp (96°C), Viscosity calculation, Radial steam expansion.
       - *Wellbore*: WHP (85 psi), Tubing pressure (240 psi), Casing pressure (120 psi), Differential pressure (120 psi).
       - *SRP*: Stroke length (100"), Speed (4.6 SPM), Pump fillage (29%), Peak rod load (6,317 lbs).
       - *Wellhead*: Unit type (Mark II), WHP (85 psi), Flowline connection, Surface rate (45.7 bbl/d).
2. **Bottom Summary — Key Operating Parameters**:
   - Exactly 4 horizontal cards:
     1. *Reservoir Temperature*: `96 °C`
     2. *Estimated Viscosity*: `1312 cP`
     3. *SRP Speed*: `4.6 SPM`
     4. *Pump Fillage*: `29%`

---

### Module 3: Well Monitoring (`WellMonitoringPage.tsx`)

#### Purpose & User Need
Real-time transducer surveillance across surface and downhole sensors with customizable sampling rates.

#### Features Included & Why
- **Timeframe Selector**: `1H`, `6H`, `24H`, `7D`, `30D`, and `CYCLE` windows to inspect high-frequency transients vs long-term decline.
- **Multivariable Parameter Explorer**:
  - *Surface Oil Rate*: Actual metered rate vs physical decline model.
  - *Near-Wellbore Reservoir Temp*: Conductive dissipation in Jodhpur Sandstone.
  - *In-Situ Oil Viscosity*: Calculated dead crude dynamic viscosity.
  - *Wellhead, Tubing & Casing Annulus Pressures*: Multi-line pressure envelope tracking (WHP, TP, CP).
  - *SRP Operating Speed*: VFD frequency and motor draw.
  - *Downhole Pump Fillage*: Chamber filling efficiency percentage.
  - *Polished Rod Loads*: Peak upstroke tension (PPRL) vs minimum downstroke load (MPRL).
  - *Specific Lifting Energy*: kWh per barrel of produced fluid.

---

### Module 4: CSS Optimization (`CSSOptimizationPage.tsx`)

#### Purpose & User Need
Thermal heat balance optimization to maximize energy efficiency and identify the exact economic turn-around point for the next steam cycle.

#### Features Included & Why
1. **3-Stage Operational Pipeline Tracking**:
   - *1. Steam Injection*: Steam volume, rate, injection pressure, quality (80%), and temperature.
   - *2. Thermal Soaking*: Shut-in duration (5–7 days) for radial conduction.
   - *3. Production (SRP Lifting)*: Active stage day counter (e.g., Day 46 of 90).
2. **Next-Cycle Recommendation Engine**:
   - Calculates energy-balanced steam requirements for Cycle 5 (e.g., 2,050 tonnes steam volume, 6-day soak).
   - Compares economic water cut cut-off (82% vs 85%) to prevent unnecessary lifting of condensed steam.
3. **Cycle Parameter Comparison Table**:
   - Detailed side-by-side comparison across Steam Volume, Injection Pressure, Soak Duration, Water Cut Cut-Off, Predicted Peak Rate, Expected SOR, and Downstroke Rod Drag.

---

### Module 5: SRP Optimization & Dynamometer Surveillance (`SRPOptimizationPage.tsx` & `DynamometerCard.tsx`)

#### Purpose & User Need
Protects the downhole rod string from compressive buckling failures (rod floating) while maximizing pump volumetric fillage.

#### Features Included & Why
1. **Polished Rod Dynamometer Card Canvas**:
   - Renders load vs polished rod position (inches).
   - Compares **Surface Polished Rod Load** (blue curve) against **Downhole Plunger Load** (green curve).
   - Features the **Buoyant Rod Weight reference line** at `3,340 lbs`.
   - Real-time **Volumetric Pump Fillage** (29%) and **Rod Float Risk Index** (8%).
2. **SPM Scenario Testing & Dynamic Evaluation**:
   - **Candidate SPM Selector**: Interactive segmented selector with candidate speeds: **3.5 SPM**, **4.0 SPM**, **4.5 SPM**, and **5.0 SPM**.
   - **4.0 SPM Default**: Preserves the 4.0 SPM engineering recommendation as the default active state.
   - **Evaluate Button**: Triggers evaluation of candidate envelopes and dynamically refreshes pump fillage, rod float margin, surface oil rate, and dynamometer curves.
3. **Operational Sliders & Variable Frequency Drive (VFD) Controls**:
   - **Pumping Speed (SPM) Slider**: Interactive range from 2.0 to 6.5 SPM (synchronized with candidate selector).
   - **Stroke Length Slider**: Range from 74" to 144".
   - **Instantaneous VFD Frequency Calculation**: Translates SPM into inverter Hz (e.g., 4.0 SPM $\to$ 33.3 Hz, 4.6 SPM $\to$ 38.3 Hz).
   - **Simulated Production & Rod Margin Readouts**: Recalculates simulated BOPD and downward buoyant margin in real-time as sliders or candidate buttons are adjusted.
   - **1-Click Optimal Apply**: Button to automatically apply harmonized speed (e.g., `Set to 4.0 SPM`).

---

### Module 6: Reservoir Thermal Model (`ReservoirModelPage.tsx` & `ReservoirThermalSchematic.tsx`)

#### Purpose & User Need
Explains the fundamental physics driving Baghewala heavy oil recovery: conductive radial heating, thermal dissipation, and non-linear viscosity reduction.

#### Features Included & Why
- **Thermal Decay Curve**: Visualizes temperature drop from post-soak 160°C down to 50°C.
- **Walther Viscosity Model Transformation**: Displays the ASTM D341 Walther relationship converting temperature directly into dynamic crude viscosity.
- **Darcy Inflow Fluid Mobility**: Tracks fluid mobility index ($k/\mu$) in mD/cP.
- **Heated Radius Expansion**: Models the thermal front radius ($R_{\text{th}}$) penetration into the cold formation.

---

### Module 7: Production Analytics & Recovery Forecasting (`ProductionAnalyticsPage.tsx`)

#### Purpose & User Need
Predicts remaining cycle recovery, water breakthrough timing, and economic shut-in dates.

#### Features Included & Why
- **Forecast Horizon Selector**: `7D`, `14D`, `30D`, and `90D` lookahead windows.
- **Decline Curve Projections with Confidence Intervals**:
  - Plots historical production (Days -14 to 0).
  - Projects mean decline rate through end of cycle.
  - Renders statistical **uncertainty bands** (upper and lower bounds) to represent subsurface permeability variability.
- **Cumulative Recovery Estimator**: Real-time sum of projected incremental barrels.

---

### Module 8: Predictive Maintenance & Rod-Floating Watch (`PredictiveMaintenancePage.tsx`)

#### Purpose & User Need
Early warning detection of mechanical wear, valve sticking, and sucker rod downward fall stalling.

#### Features Included & Why
- **Downstroke Rod Drag Force vs Buoyant Weight Balance**:
  - Buoyant rod weight: 3,340 lbs.
  - Viscous drag: ~503 lbs.
  - Net downward margin: 2,837 lbs.
- **Component Health Status Readouts**:
  - Pump Barrel & Plunger Assembly (92% health).
  - Standing & Traveling Valves (88% health).
  - Sucker Rod String Fatigue Life (94% health).
  - Surface Stuffing Box Packing (78% health).
  - Pumping Unit Gearbox & Bearings (95% health).

---

### Module 9: Energy & Steam Optimization (`EnergyOptimizationPage.tsx`)

#### Purpose & User Need
Monitors energy expenditure, motor electricity costs, and steam generation thermal efficiency.

#### Features Included & Why
- **Specific Lifting Energy ($E_{\text{lifting}}$)**: Measured in kWh per barrel of produced fluid.
- **Cumulative Steam-to-Oil Ratio (SOR)**: Evaluates thermal energy efficiency (bbl cold water equivalent per barrel of oil produced).
- **Electrical Cost Minimization**: Highlights off-peak electricity pumping schedule optimizations.

---

### Module 10: What-If Scenario Simulation (`WhatIfSimulationPage.tsx`)

#### Purpose & User Need
Allows reservoir and production engineers to safely simulate operational changes before issuing field work orders.

#### Features Included & Why
- **Interactive Input Sandbox**:
  - Reservoir Temperature (40°C to 200°C).
  - Steam Volume (500 to 3,000 tonnes).
  - Pumping Speed (1.0 to 7.0 SPM).
  - Stroke Length (74" to 144").
- **Real-Time Physics Engine Evaluation**:
  - Recalculates expected viscosity, Darcy inflow, pump fillage, peak rod load, buoyant fall margin, simulated oil rate, and lifting cost.
- **Side-by-Side Scenario Comparison Table**: Compares Baseline vs Optimized vs High-Speed risk scenarios.

---

### Module 11: Steam Breakthrough & Channeling Alerts (`AlertsPage.tsx`)

#### Purpose & User Need
Rapid detection of steam breakthrough into casing annuli or water channeling through high-permeability thief zones.

#### Features Included & Why
- **Multi-Variant Channeling Surveillance**:
  - Annular Casing Pressure Rate (+0.4 psi/hr vs 3.0 psi/hr threshold).
  - Wellhead Temperature Rise Rate (+0.2 °C/day vs 2.5 °C/day threshold).
  - Water Cut Surge (+1.2% delta vs 10% threshold).
  - Composite Channeling Risk Index: 8 / 100 (Normal).
- **Field Diagnostic Alarm Table**:
  - Severity filtering: `ALL`, `CRITICAL`, `WARNING`, `WATCH`, `NORMAL`.
  - Category filtering: `RESERVOIR`, `CSS`, `SRP`, `PRODUCTION`, `ENERGY`, `EQUIPMENT`.
  - **Engineer Acknowledgement Workflow**: Allows senior production engineers to log their review and record SCADA verification timestamps.

---

### Module 12: Historical CSS Cycle Analysis (`HistoricalAnalysisPage.tsx`)

#### Purpose & User Need
Long-term field surveillance comparing cycle-over-cycle performance across the lifetime of the well.

#### Features Included & Why
- **Cross-Cycle Performance Bar Chart**:
  - Plots Steam Injected (tonnes) vs Cumulative Oil Recovered (bbl) for Cycles 1, 2, 3, 4, and planned Cycle 5.
- **Master Cycle Comparison Table**:
  - Records Steam Volume, Injection Days, Soak Days, Production Days, Peak BOPD, Cumulative Oil, SOR, and Peak Reservoir Temperature.
- **Operational Log & Field Observations**: Displays geological notes for each cycle (e.g., initial virgin reservoir thermal stimulation, water breakthrough behavior, etc.).

---

### Module 13: Engineering Reports & SCADA Dispatch (`ReportsPage.tsx`)

#### Purpose & User Need
Generates formal, heavy-oil EOR technical reports conforming to Directorate General of Hydrocarbons (DGH) and ONGC/asset documentation standards.

#### Features Included & Why
- **Executive Well Summary Document**:
  - Section 1: Well Identification & Formation Characteristics.
  - Section 2: Near-Wellbore Thermal Conformance & Hydro-Dynamics.
  - Section 3: Mechanical SRP Pumping Performance & Load Envelopes.
  - Section 4: Verified Engineering Operational Dispatch & Decision.
- **Export Data File**: One-click generation of formatted `.txt` engineering data file.
- **Browser Print Function**: Clean CSS print media layout for formal archiving.

---

### Module 14: Engineering Limits & Safety Interlocks (`SettingsPage.tsx`)

#### Purpose & User Need
Defines hard physical boundaries and automated safety interlocks that govern optimization algorithms.

#### Features Included & Why
- Max Safe Pumping Speed: `6.5 SPM`.
- Min Pumping Speed: `2.0 SPM`.
- Max Polished Rod Peak Load: `18,000 lbs`.
- Min Downstroke Rod-Float Margin: `600 lbs`.
- Max Casing Annulus Pressure: `450 psi`.
- Max Steam Injection Pressure: `1,650 psi`.
- Min Soak Duration: `4 days`.
- Economic Water Cut Cutoff: `88%`.

---

## 5. Mathematical & Petro-Physical Formulas

The calculations powering the platform are implemented in `src/services/petroPhysics.ts`:

### 5.1 Walther Viscosity-Temperature Model
The temperature dependence of Baghewala dead crude oil is modeled using the ASTM D341 Walther equation:
$$\log_{10} \log_{10}(\nu + 0.7) = A - B \cdot \log_{10}(T_K)$$
Where:
- $\nu$ is kinematic viscosity in cSt ($\mu = \nu \cdot \rho$).
- $T_K$ is absolute temperature in Kelvin ($T + 273.15$).
- Calibrated constants for Baghewala 18.5° API crude: $A = 9.845$, $B = 3.620$.

### 5.2 Darcy Fluid Inflow Mobility
$$\lambda_o = \frac{k \cdot k_{ro}}{\mu_o(T)}$$
As near-wellbore temperature drops from 150°C to 50°C, viscosity $\mu_o$ increases from 80 cP to 1,800 cP, causing a 20-fold reduction in formation inflow capacity.

### 5.3 Downhole Pump Fillage Percentage
$$F_{\text{pump}} = \max\left(15, \min\left(95, 96 - 0.015 \cdot \mu_o - 5.5 \cdot (\text{SPM} - 3.0) + \frac{P_{\text{wf}}}{25}\right)\right)$$
Where $P_{\text{wf}}$ is bottomhole flowing pressure in psi.

### 5.4 Sucker Rod Downstroke Viscous Drag Force
The hydrodynamic shear drag force on the downward stroke of the rod string inside the production tubing is governed by annular Couette-Poiseuille viscous shear:
$$F_{\text{drag}} = \frac{2 \pi \cdot \mu_o \cdot v_{\text{rod}} \cdot L_{\text{rod}}}{\ln\left(\frac{r_{\text{tubing}}}{r_{\text{rod}}}\right)}$$
Where:
- $v_{\text{rod}} = \frac{2 \cdot S \cdot \text{SPM}}{60}$ is mean downward polished rod velocity (ft/s).
- $L_{\text{rod}}$ is total rod string length (1,350 ft / 412 m).
- $r_{\text{tubing}} = 1.496\text{ in}$, $r_{\text{rod}} = 0.4375\text{ in}$.

### 5.5 Net Rod-Floating Downward Fall Margin
$$W_{\text{buoyant}} = W_{\text{air}} \cdot \left(1 - \frac{\rho_{\text{fluid}}}{\rho_{\text{steel}}}\right) \approx 3,340\text{ lbs}$$
$$\text{Margin}_{\text{float}} = W_{\text{buoyant}} - F_{\text{drag}}$$
$$\text{Risk}_{\text{float}} (\%) = \max\left(2, \min\left(98, \frac{F_{\text{drag}}}{W_{\text{buoyant}}} \cdot 100\right)\right)$$
When $\text{Margin}_{\text{float}} < 600\text{ lbs}$ (or Risk $> 60\%$), the platform issues an automated watch alert to reduce SPM.

### 5.6 Surface Production Oil Rate
$$Q_{\text{gross}} = 0.1166 \cdot d_{\text{plunger}}^2 \cdot S \cdot \text{SPM} \cdot \left(\frac{F_{\text{pump}}}{100}\right)$$
$$Q_{\text{oil}} = Q_{\text{gross}} \cdot \left(1 - \frac{\text{WC}}{100}\right)\text{ bbl/day}$$

---

## 6. Verification & Quality Assurance Results

1. **Compilation & Build**:
   - Zero TypeScript compilation errors (`tsc -b`).
   - Zero linter errors across all 31 source files (`oxlint`).
   - Production Vite bundle builds cleanly in under 8 seconds.
2. **Browser & Visual Execution**:
   - Verified on Google Chrome / Microsoft Edge running at `http://localhost:5173/`.
   - Verified full-width layout with responsive horizontal top navigation bar.
   - Verified interactive component selection on the Digital Twin page.
   - Verified real-time reactivity of the Dynamometer canvas and engineering sliders on the SRP page.
3. **Version Control**:
   - Fully committed and synchronized with remote repository: [`github.com/yaminibevara2007-hub/Digital-Twin`](https://github.com/yaminibevara2007-hub/Digital-Twin).
