# GramSathi — Solar-Powered Smart Village Hub & Rural Digital Operating Platform
### COSMOS — Universe in One Place (Community Display Layer)

**GramSathi** is an interactive, real-API-enabled, AI-assisted rural digital operating platform and solar-powered smart village command center designed for village panchayats, farmers, dairy owners, and community service centers.

---

## 🌟 Key Capabilities & Upgraded Architecture

1. **Village Live Command Center (Dashboard)**
   - High-visibility command center showing real village status, live timestamps, and honest metadata badges (`🟢 LIVE DATA`, `🟡 DEMO DATA`, `🔵 USER ENTERED`, `⚪ SIMULATED SENSOR`, `🟣 VERIFIED DATA`).
   - "Refresh All Data" button with instant loading feedback.
   - Connected "Today's Village Brief" summarizing real application state across Water, Livestock, Milk, Energy, Weather, Mandi, and Alerts.

2. **Solar Microgrid & Energy Control Panel**
   - 6 Interactive Simulation Scenario buttons: **High Solar Generation (5.8 kW)**, **Low Solar (Overcast)**, **High Village Load (4.8 kW)**, **Battery Critical (<20%)**, **Night Mode**, and **Normal Restore**.
   - Live telemetry for Solar PV array generation kW, LiFePO4 battery SoC %, essential village load kW, pure sine wave inverter efficiency %, and battery backup runtime.

3. **Potable Water Telemetry & Submersible Pump Automation**
   - 10,000L community overhead tank telemetry with water potability monitoring (pH and turbidity NTU).
   - Automated pump triggers (<25% auto-start, >95% auto-stop) with manual override.
   - 4 Interactive Scenarios: Low Flow, Turbidity Spike, Tank Refill, and Baseline Restore.

4. **Smart Livestock Telemetry & Dairy Ledger**
   - Cattle RFID collar health telemetry (Heart rate, Body temperature, Rumination minutes, Geofence status).
   - Multi-tab Cattle Profile modal with vital charts, lactation tracking, ICAR feed rations, and timestamped event timeline.
   - Comprehensive Morning/Evening Milk Collection Ledger with Fat % and SNF % tracking, auto-calculated totals, user payout rate estimator (`₹/L`), and one-click CSV export.

5. **Hybrid Smart Agriculture Advisor**
   - **Crop Knowledge Search Engine:** Search crops (Wheat, Mustard, Paddy, Chickpea, Cotton, Maize, Moong, Bajra) for scientific profiles, sowing/harvest windows, seed rates, spacing, NPK fertilizer plans, deficiency symptoms, pest/disease prevention, and post-harvest storage.
   - **Personalized Crop Planner:** Multi-factor suitability evaluation based on Season, Soil Type, Water Availability, Farm Size, Previous Crop, and Irrigation Method.
   - **"WHY THIS RECOMMENDATION?"** reasoning breakdown.
   - **AI Agronomic Explanation:** One-click farmer-friendly advice powered by OpenAI.

6. **Live Geolocation Weather Station**
   - **"Use My Live Location"** button utilizing browser `navigator.geolocation` with device permission handling.
   - Live satellite meteorological data via Open-Meteo or OpenWeatherMap with clear `LIVE WEATHER` vs `DEMO WEATHER` indicators.
   - 7-day forecast, solar irradiance (W/m²), UV index, sunrise/sunset, and agricultural advisory.

7. **Agricultural Mandi Market Rates & AI Explanation**
   - Searchable Agmarknet / e-NAM commodity market rates across Indian states with Min/Max/Modal prices and 7-day price sparklines.
   - **"Explain Market Data with AI"** button generating simplified, non-speculative market summaries.

8. **Government Welfare Schemes & Eligibility Wizard**
   - Verified catalog of 10 Government of India welfare schemes (PM-Kisan, PMFBY, KCC, Rashtriya Gokul Mission, AHIDF, PMKSY, PMAY-G, SMAM, MKSP, Soil Health Card).
   - Interactive **4-step Scheme Eligibility Wizard** highlighting `Potentially Relevant Schemes`.

9. **Context-Aware AI Assistant & Multilingual Voice**
   - Backend OpenAI GPT-4o-mini integration injecting real-time village state (solar, battery, water potability, livestock fever alerts, milk yield, weather, mandi rates).
   - Never hallucinates missing village data; falls back to an offline rule-based assistant when keys are absent.
   - **Voice In/Out:** 🎤 Speak question (Web Speech Recognition) and 🔊 Read aloud (Speech Synthesis) in Indian languages.

10. **3D Isometric Community cosmos Wall Display**
    - Panchayat Bhawan wall display mode with animated isometric village map (Solar energy flow, Water tank level, Submersible pump animation, grazing cattle, and lighting load).
    - **Auto Mode:** Carousel automatically cycling through village subsystems every 6 seconds.
    - **Manual Mode:** Touch tiles expanding into detailed telemetry views.
    - Emergency alert pulsation on critical incidents.
---

## 📁 Repository Directory Structure

```
gramsathi/
├── index.html                  # Single-Page App HTML5 Shell
├── package.json                # Node.js project manifest
├── server.js                   # Zero-dependency Node.js HTTP server & API proxies
├── .env.example                # Configuration template with placeholder keys
├── .gitignore                  # Source control security rules
├── README.md                   # Complete documentation
├── API_SETUP.md                # Step-by-step API integration guide
│
├── services/                   # Server-Side Backend Services
│   ├── openaiService.js        # OpenAI LLM integration & local rule fallback
│   ├── weatherService.js       # Live geolocation & Open-Meteo satellite feed
│   ├── mandiService.js         # Agmarknet / e-NAM verified mandi data engine
│   └── schemeService.js        # Verified GoI welfare schemes engine
│
├── src/                        # Modular Frontend Client Files
│   ├── app.js                  # App lifecycle, hash router & toast system
│   ├── store.js                # State store, LocalStorage persistence & IoT simulation
│   ├── views.js                # UI renderers for all 13 modules & cosmos wall display
│   ├── modals.js               # Multi-tab dialogs (Milk, Animal, SMS, Eligibility, Reset)
│   ├── styles.css              # Rural Tech design system, isometric styles & dark theme
│   ├── icons.js                # SVG vector icons library
│   ├── i18n.js                 # Multi-language engine (English, Hindi, Punjabi, Tamil, Telugu)
│   └── services/
│       ├── voice.js            # Web Speech STT/TTS voice service
│       └── location.js         # Geolocation coordinates service
│
├── data/                       # Verified Baseline Datasets (JSON)
│   ├── agri_matrix.json        # Comprehensive ICAR scientific crop profiles
│   ├── mandi_data.json         # Real Agmarknet commodity market price baselines
│   └── schemes.json            # 10 verified Government of India welfare schemes
│
└── locales/                    # Translation Dictionaries (EN, HI, PA, TA, TE)

---

## 🎬  Demonstration tips

1. **Dashboard:**
   - View the **Village Live Command Center** banner with live clock and metadata badges.
   - Click **"Refresh All Data"** to demonstrate real-time backend synchronization.
   - Review **"Today's Village Brief"** cards and click on **"Water Tank"** to jump to the Water module.

2. **Energy Panel:**
   - Click **"High Solar Gen"** → observe Solar jump to 5.8 kW and battery charge to 96%.
   - Click **"Battery Critical"** → observe Battery drop to 18%, warning alert trigger, and cosmos map update.
   - Click **"Restore Baseline"**.

3. **Agriculture:**
   - Type `"Wheat"` into the Crop Knowledge search bar → inspect the rich agronomic profile.
   - Click **"Explain with AI"** to generate instant farmer-friendly guidance.
   - Scroll down to the **Crop Suitability Form**, select your soil and water parameters, and click **"Evaluate Farm Crop Suitability"** to view match scores and the **"WHY THIS RECOMMENDATION?"** breakdown.

4. **Weather:**
   - Click **"Use My Live Location"** → approve browser GPS permission → view live satellite weather and coordinates.

5. **Mandi Rates:**
   - Search `"Wheat"` or filter by state `"Punjab"` → inspect prices and 7-day sparklines.
   - Click **"Explain Market Data with AI"** for simplified pricing summaries.

6. **Government Schemes:**
   - Search `"Kisan"` → view official benefits and application portal links.
   - Click **"Check Scheme Eligibility Wizard"**, complete the 4 questions, and view matched schemes.

7. **AI Village Assistant & Voice:**
   - Ask: *"What is today's milk production and water tank level?"* → Assistant responds with exact live values from village records.
   - Click the 🎤 **Microphone button** → speak a query in Hindi or English.
   - Click **"Read Aloud"** (🔊) to hear the spoken response.

8. **Community cosmos Wall Display:**
   - Click **"cosmos Wall Display"** → experience the animated isometric village map with live energy and water flow.
   - Toggle **Auto Mode** to watch the carousel cycle smoothly through village subsystems.
   
 ---

## 🔐 **Security & Safe Key Management**
- **Graceful Fallbacks:** If API keys are omitted, the application runs on high-fidelity offline datasets and local rule engines.
