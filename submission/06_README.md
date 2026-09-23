# GramSathi – Complete Project Documentation & Architecture Guide

**Project Name:** GRAMSATHI – Solar-Powered Smart Village Hub & Rural Digital Operating Platform  
**Community Layer:** COSMOS — Universe in One Place  
**Status:** Production / Offline-Ready  

---

## 1. Executive Summary & What Has Been Done

GramSathi is a rural digital operating system designed for village panchayats, community service centers (CSCs), and farming communities. It bridges off-grid solar hardware IoT telemetry with essential village services: drinking water automation, livestock health tracking, dairy yield ledgers, agronomic crop planning, mandi market rates, government direct benefit transfer (DBT) schemes, and a local context-aware AI assistant.

### Key Capabilities Implemented:
1. **100% Zero-Dependency Web Architecture:** Runs purely on standard HTML5, CSS3, and modern Vanilla JavaScript without requiring heavy build tools or frontend frameworks.
2. **Offline-First Data Storage:** All data and telemetry persist reliably in browser `localStorage` (`gramsathi_v2_data`) with instant JSON export/import and CSV dairy record export.
3. **Dynamic Real-Time IoT Simulation Engine:** Emulates solar PV generation, LiFePO4 battery state of charge (SoC), village essential electrical loads, overhead water tank levels, water potability (pH, turbidity NTU), automatic pump triggers (<25% on, >95% off), and livestock RFID collar telemetry (heart rate bpm, body temp °C, rumination minutes, fever alerts, geofencing).
4. **Dedicated Dairy & Milk Section:** Morning & Evening milk logs with Fat % and SNF % quality tracking, auto-calculated daily/weekly/monthly collection totals, and a user-entered baseline price revenue estimator (clearly tagged `USER ESTIMATE`).
5. **Interactive Agriculture Crop Planning Engine:** Multi-factor agronomic evaluation based on ICAR rules (Season, Soil Type, Water Availability, Farm Size, Previous Crop, and Irrigation Method) providing match scores, sowing windows, seed rates, and fertilizer plans (NPK), with agronomic advisory disclaimers.
6. **Live Village Weather Telemetry:** Live meteorological data fetching via server proxy or fallback, with a clear **`LIVE WEATHER`** (green) vs **`DEMO WEATHER`** (amber) status badge, 7-day forecast, solar irradiance (W/m²), UV index, and agricultural advisory.
7. **Verified Mandi Rates & 7-Day Price Trends:** Agmarknet / e-NAM commodity market rates across Indian states with commodity search, state filters, Min/Max/Modal prices, and 7-day SVG sparkline price trends.
8. **Government Welfare Schemes & Eligibility Wizard:** Verified catalog of 10 GoI welfare & DBT schemes with official application links and an interactive **4-step Eligibility Wizard** highlighting `Potentially Relevant Schemes`.
9. **Village Alert & Simulated Cellular SMS Broadcast Center:** Multi-level IoT incident threshold alerts with one-click resolution and a **Cellular SMS Broadcast Modal** with recipient number input and timestamped audit logs.
10. **Context-Aware AI Village Assistant:** Conversational assistant reading real-time village IoT state, weather, cattle telemetry, mandi prices, and crop rules offline, with optional fallback to the `/api/chat` server proxy.
11. **Multi-Language (i18n) Engine:** Dynamic language switching across **5 Indian languages**: English (`en`), Hindi (`hi`), Punjabi (`pa`), Tamil (`ta`), and Telugu (`te`).
12. **Community Kiosk Wall Display Mode:** High-contrast, large-font wall display mode designed for Panchayat Bhawans and Common Service Centers.
13. **Native Node.js Server:** Zero-dependency HTTP backend (`server.js`) providing static file hosting and server-side API proxy routes for weather and chat.

---

## 2. Complete File Directory & Reason for Every File

Here is the exact breakdown of every file in the project, what it does, and why it exists:

```
gramsathi/
│
├── index.html                  # Main Web Application Entry Point
├── package.json                # Project manifest & start script definition
├── server.js                   # Lightweight native Node.js HTTP backend & API proxy
├── .env.example                # Example environment configuration file
├── .gitignore                  # Git ignore rules for node_modules, .env, and logs
├── README.md                   # Project summary & Quick start guide
├── PROJECT_DOCUMENTATION.md    # In-depth architectural documentation
│
├── src/                        # Modular Client-Side Source Files
│   ├── styles.css              # Unified responsive design, theme variables & components
│   ├── icons.js                # Clean SVG icon library for all 13 modules
│   ├── i18n.js                 # Multi-language translation engine (EN, HI, TA, PA, TE)
│   ├── store.js                # State management, LocalStorage repositories & IoT simulation
│   ├── views.js                # UI renderers for all 13 dashboard modules & sections
│   ├── modals.js               # Interactive dialog modals (Milk, Animal, SMS, Eligibility, Reset)
│   └── app.js                  # App lifecycle router, hash navigation & event handling
│
├── data/                       # Verified Baseline Datasets (JSON)
│   ├── schemes.json            # 10 verified Government of India welfare schemes
│   ├── agri_matrix.json        # 8 scientific ICAR crop planning agronomic rules
│   └── mandi_data.json         # Real-world Agmarknet commodity market price baselines
│
├── locales/                    # Multi-Language Translation Dictionaries
│   ├── en.json                 # English language dictionary
│   ├── hi.json                 # Hindi (हिंदी) language dictionary
│   ├── pa.json                 # Punjabi (ਪੰਜਾਬੀ) language dictionary
│   ├── ta.json                 # Tamil (தமிழ்) language dictionary
│   └── te.json                 # Telugu (తెలుగు) language dictionary
│
└── gramsathi-package/          # Mirror distribution package for clean distribution
```

---

### In-Depth Breakdown of Each File:

#### `index.html`
- **Purpose:** The single-page application (SPA) shell.
- **Why it exists:** Provides the primary semantic DOM structure: the 13-item navigation sidebar, top header bar with live clock, status pill, language dropdown, theme toggle, dynamic `#page-content` container, mobile bottom navigation bar, mobile off-canvas drawer, modal backdrop container, and toast notification container.

#### `server.js`
- **Purpose:** Native Node.js backend server.
- **Why it exists:** Serves static files with correct MIME types and acts as a CORS-safe proxy for:
  - `GET /api/health` - Server liveness probe.
  - `GET /api/weather?city=<name>` - Fetches live weather from Open-Meteo or falls back to labeled demo data.
  - `POST /api/chat` - Connects to upstream LLM APIs if configured, otherwise falls back gracefully.
- **Zero-Dependency:** Uses only native Node.js built-ins (`http`, `https`, `fs`, `path`, `url`).

#### `src/styles.css`
- **Purpose:** Design tokens, layout styling, and animations.
- **Why it exists:** Provides modern CSS custom properties (`--primary`, `--bg-main`, `--border`), Dark/Light mode theme switching, responsive CSS grid (`grid-cols-4`, `grid-cols-3`, `grid-cols-2`), glassmorphic cards, stat cards, progress bars, responsive tables, modal overlays, mobile bottom navigation, and full-screen Kiosk display styling.

#### `src/icons.js`
- **Purpose:** Lightweight vector icon library.
- **Why it exists:** Stores all UI icons as clean, scalable SVG strings (Dashboard, Water, Energy, Livestock, Dairy, Agriculture, Weather, Mandi, Schemes, Alerts, Assistant, Settings, Display, etc.) without requiring bulky external font icon packages.

#### `src/i18n.js`
- **Purpose:** Internationalization (i18n) controller.
- **Why it exists:** Manages language switching across English, Hindi, Punjabi, Tamil, and Telugu. Updates DOM elements dynamically matching `data-i18n`, `data-i18n-placeholder`, and `data-i18n-title` attributes, while persisting the user's language preference in `localStorage`.

#### `src/store.js`
- **Purpose:** Data persistence & IoT Simulation Engine.
- **Why it exists:** Acts as the single source of truth for the entire application. Handles:
  - Repository layer reading and writing to `localStorage` (`gramsathi_v2_data`).
  - Real-time IoT simulation loop running every 3 seconds (updates solar generation, battery SoC, water tank level, pump states, and cattle vitals).
  - Dairy calculations (Daily, 7-Day, 30-Day totals, revenue calculations).
  - Crop recommendation rule scoring.
  - CSV export and factory baseline demo data reset.

#### `src/views.js`
- **Purpose:** Modular UI view renderers.
- **Why it exists:** Contains dedicated rendering functions for each of the 13 navigation views:
  1. `renderDashboard`: Overview metrics, quick alert feed, solar/water/livestock quick status.
  2. `renderWater`: Tank level gauge, water pH, turbidity NTU, auto/manual pump toggle, 7-day sparkline.
  3. `renderLivestock`: Cattle profiles, telemetry gauges (temp, heart rate, rumination), geofence status.
  4. `renderDairy`: Morning/evening milk log table, totals cards, price revenue calculator, CSV export.
  5. `renderEnergy`: Solar PV generation kW, battery SoC %, village load kW, inverter efficiency, 24h trend.
  6. `renderAgriculture`: Interactive crop planner form, match scoring, sowing guidance, advisory disclaimer.
  7. `renderWeather`: Live/demo weather card, 7-day forecast cards, agricultural advisory, city selector.
  8. `renderMandi`: Searchable mandi commodity prices table, state filters, 7-day price sparklines.
  9. `renderSchemes`: Categorized GoI welfare schemes, benefit breakdowns, official portal links.
  10. `renderAlerts`: Active IoT incident alerts, mark as resolved, SMS cellular broadcast audit log.
  11. `renderAssistant`: AI chat interface with quick prompt chips and offline context-aware rule engine.
  12. `renderSettings`: Village metadata customization, complete JSON data backup export, factory reset.
  13. `renderAbout`: Architecture overview, mission specs, and full-screen Kiosk mode launcher.

#### `src/modals.js`
- **Purpose:** Modal dialog controller.
- **Why it exists:** Handles popup interfaces for:
  - **Record Milk Modal:** Enter collection session, animal ID, liters, fat %, SNF %, and farmer name.
  - **Register Cattle Modal:** Register new cattle RFID tag, breed, age, lactation stage, and ration.
  - **Edit Cattle Modal:** Update livestock health records and veterinary notes.
  - **Dispatch SMS Modal:** Enter recipient mobile number and broadcast simulated GSM cellular alerts.
  - **Scheme Eligibility Wizard:** 4-step questionnaire matching relevant government schemes.
  - **Reset Confirmation Modal:** Safeguard confirmation before restoring factory demo data.

#### `src/app.js`
- **Purpose:** App core bootstrap and router.
- **Why it exists:** Initializes the application on DOM ready, handles hash routing (`#dashboard`, `#water`, etc.), coordinates the 3-second simulation ticker, manages the live clock, toggles light/dark themes, controls mobile drawer menus, and renders toast notifications.

#### `data/schemes.json`
- **Purpose:** Verified dataset of 10 Government of India agricultural and rural development schemes:
  1. PM-Kisan Samman Nidhi (Direct income support)
  2. Pradhan Mantri Fasal Bima Yojana (Crop insurance)
  3. Kisan Credit Card (Subsidized farm credit)
  4. Rashtriya Gokul Mission (Indigenous cattle breed development)
  5. Animal Husbandry Infrastructure Development Fund (AHIDF)
  6. Pradhan Mantri Krishi Sinchayee Yojana (Micro-irrigation)
  7. Pradhan Mantri Awaas Yojana - Gramin (Rural housing)
  8. Sub-Mission on Agricultural Mechanization (Farm equipment subsidy)
  9. Mahila Kisan Sashaktikaran Pariyojana (Women farmer empowerment)
  10. Soil Health Card Scheme (Soil nutrient testing)

#### `data/agri_matrix.json`
- **Purpose:** Scientific agronomic rule matrix for 8 key crops (Wheat, Mustard, Paddy, Gram/Chickpea, Cotton, Maize, Moong, Bajra). Includes soil preferences, water requirements, sowing windows, seed rates, fertilizer NPK formulations, and yield estimates.

#### `data/mandi_data.json`
- **Purpose:** Verified Agmarknet / e-NAM baseline price records across major agricultural markets (Punjab, UP, Rajasthan, Haryana, MP, Gujarat, Bihar, Tamil Nadu, Maharashtra) with 7-day historical price trends.

#### `locales/*.json` (`en.json`, `hi.json`, `pa.json`, `ta.json`, `te.json`)
- **Purpose:** Complete multi-language dictionary files containing localized strings for all 13 modules, navigation bars, stat cards, buttons, table headers, and alert notices in English, Hindi, Punjabi, Tamil, and Telugu.

---

## 3. How to Run the Project

### Method 1: Via Node.js Server (Recommended)
1. Open a terminal in the project directory:
   ```bash
   cd "c:\Users\Saurav Kumar\Desktop\gramsathi"
   ```
2. (Optional) Create your `.env` file from the example:
   ```bash
   copy .env.example .env
   ```
3. Start the server:
   ```bash
   npm start
   # OR
   node server.js
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Method 2: Direct Standalone Launch (Zero Server Required)
- Double-click `index.html` or open it in any web browser (`file:///.../index.html`).
- The entire platform, offline IoT simulations, dairy ledger, crop planner, scheme wizard, and multi-language engine will run immediately without any internet or server setup.

---

## 4. Downloadable Archive

The entire project has been packaged into a single zip archive for easy download and distribution:
- **`gramsathi-v2-complete.zip`** (Located in the root of the project directory)

Contains all source code, datasets, translations, server backend, and documentation ready to run anywhere.
