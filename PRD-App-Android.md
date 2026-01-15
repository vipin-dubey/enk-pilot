# PRD: ENK Pilot Android (The Truly Exhaustive Nordic Master Edition)

## 1. Product Overview & Vision
ENK Pilot Android is the definitive, standalone financial companion for Norwegian Sole Proprietorships (ENK). It prioritizes **Privacy**, **Speed**, and **Offline-First Functionality**. It rejects traditional "boring" accounting in favor of a **Scandinavian Startup** aesthetic, powered by native Android 14+ (Material 3/Material You) technologies.

---

## 2. Universal Design System (Nordic Material 3)

### 2.1 Visual Language (Material 3 / 2026)
- **Dynamic Color (Monet)**: The app primary, secondary, and tertiary colors sync with the user's system wallpaper.
- **Surfaces**: Tonal palettes using **Surface Containers** with rounded corners (28dp). 
- **Materials**: **Tonal Glass** (RenderEffect blur) for high-elevation components.
- **Dynamic Accents**: Theme evolves based on the sun cycle in Oslo (Day: Blue, Sunset: Amber, Night: Emerald).

### 2.2 Typography & Numbers
- **Headlines**: `Geist Sans` (ExtraBold).
- **Financials**: `Geist Mono` for perfect decimal alignment.
- **Voice**: Conversational, using "Du" (Bokmål) and "You".

### 2.3 Sensory Feedback & Animation
- **Haptics**: `VibrationEffect` API for "tick" sensations, "heavy" save pulses, and a triple-tap "Warning Pulse" for duplicates.
- **Motion**: **Predictive Back** and **Shared Element Transitions** for seamless context flow.

---

## 3. Core Features & "Exhaustive" Business Logic

### 3.1 The Norwegian Tax Engine (2026 Rules)
Exact port of the logic in `tax-calculations.ts`.

#### 3.1.1 Rates & Thresholds
- **Ordinary Tax**: 22%
- **National Insurance (Trygdeavgift)**: 10.8%
- **Personal Allowance (Personfradrag)**: **114,210 NOK**.
- **Step Tax (Trinnskatt) 2026 Brackets**:
  1. 0 - 226,100: 0%
  2. 226,101 - 318,300: 1.7%
  3. 318,301 - 725,050: 4.0%
  4. 725,051 - 980,100: 13.7%
  5. 980,101 - 1,467,200: 16.8%
  6. 1,467,201+: 17.8%

#### 3.1.2 "Safe to Spend" Intelligence
- **Formula**: `Safe = Gross - Reserved_MVA - Reserved_Tax`.
- **Annualization**: `projectedProfit = (ytdProfit / max(14, daysPassed)) * 365`.
- **Health Checks**: Notify if projected liability deviates **> 2,000 NOK** from estimate.

### 3.2 Advanced ML Kit Scanning (The Eye)
#### 3.2.1 Scanning Heuristics
- **Scanner**: Google ML Kit Document Scanner API (Auto-crop/Perspective).
- **Vendor Recognition**: Local registry of 150+ stores (KIWI, REMA, Clas Ohlson, etc.).
- **Amount Detection**: Handle `TOTALT`, `SUM`, `Beløp`, and OCR errors like `fotalt`.
- **Duplicate Detection**: Check for matches on **Vendor + Date + Amount (+/- 1 day)**.
- **MVA Auto-Logic**: Heuristics for 25% (Std), 15% (Food), or 12% (Transport).

### 3.3 Transaction Journal & Accountant View (NS 4102)
- **X-Ray Toggle**: Reveal technical SAF-T accounting data:
  - **Account 3000**: Revenue (MVA 3)
  - **Account 5900**: Food / Catering (MVA 1)
  - **Account 7100**: Travel / Travel (MVA 13)
  - **Account 7000**: Car / Fuel (MVA 1)
  - **Account 6800**: Office Supplies (MVA 1)
  - **Account 6700**: Consulting / External (MVA 1)
  - **Account 6540**: IT / Software (MVA 1)
  - **Account 6500**: Tools / Equipment (MVA 1)
- **MVA Periods**: Bimonthly terms (floor(month/2)+1). Support for **Annual MVA** toggle in settings.
- **CSV Spec**: Semicolon (`;`) separator. Required columns: `Date;Type;Vendor;Category;Account;MVA Code;MVA Period;Orig Amount;Currency;NOK Gross;NOK Net;MVA Amount`.

### 3.4 Smart Tax Assistant & Deductions
- **Constants**: Home Office (2,050 NOK), Mileage (3.50 NOK/km, cap 6k km), Union Fees (max 7,700 NOK), Depreciation (> 15,000 NOK).
- **Insights**: Assist Chips with Google Neural TTS options.

### 3.5 Central Bank & Currency
- **Logic**: Fetch via Norges Bank REST. Cache locally.
- **Normalization**: JPY/SEK/DKK rates divided by 100.
- **Static Fallbacks**: USD: 10.5, EUR: 11.2, GBP: 13.5.

---

## 4. UI Architecture & Menus

### 4.1 Navigation (The Orbital Hub)
- **Center Bloom FAB**: Long-press for Scanner, Allocation, or PDF Import.
- **Edge-to-Edge**: Transparent Status and Navigation bars with `WindowInsets` padding.

### 4.2 App Widgets & Dynamic Island (Android Equivalent)
- **Safe-to-Spend Widget**: Material 3 tonal progress ring.
- **Status Ring**: In-app "Bloom" notification for OCR progress in the status bar area.

### 4.3 "The Lab" (Simulators)
- **Interaction**: Circular knobs for tax buffers and profit simulations.
- **Allocation Flow**: Record income settlement with option for **Auto-Reserve** or **Manual Reserve % Slider**.

---

## 5. Security & Privacy ("The Vault")
- **The Integrity HUD**: Confirming `0.00 KB Traffic Outbound`.
- **Encryption**: Room Database sealed with **SQLCipher**.
- **Privacy Shield**: `FLAG_SECURE` toggle to block screenshots/task switcher view.

---

## 6. Implementation Checklist
- [ ] Setup **Room** with SQLCipher.
- [ ] Integrate **ML Kit Document Scanner API**.
- [ ] Build **Material 3 Dynamic Color** theme.
- [ ] Implement **WorkManager** for background Norges Bank API refresh.
- [ ] **Hard Audit**: 0 External Analytics/SDK links.
