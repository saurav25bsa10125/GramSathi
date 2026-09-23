# 02. Project Documentation & Architecture — GramSathi

---

## 1. System Architecture

```
+-----------------------------------------------------------------------+
|                       GRAMSATHI FRONTEND CLIENT                      |
| (Single Page Architecture, Zero-Dependency HTML5 / CSS3 / Vanilla JS) |
+-----------------------------------+-----------------------------------+
                                    |
      +-----------------------------+-----------------------------+
      |                             |                             |
      v                             v                             v
[ Router & Views ]          [ i18n Engine ]              [ UI Modals ]
- Dashboard (#dashboard)    - English (en)               - Record Milk
- Water (#water)            - Hindi (hi)                 - Add Cattle
- Energy (#energy)          - Punjabi (pa)               - Edit Cattle
- Livestock (#livestock)    - Tamil (ta)                 - SMS Dispatch
- Dairy (#dairy)            - Telugu (te)                - Scheme Wizard
- Agriculture (#agriculture)                             - Reset Demo
- Weather (#weather)
- Mandi (#mandi)
- Schemes (#schemes)
- Alerts (#alerts)
- Assistant (#assistant)
- Settings (#settings)
- Kiosk Display (#display)
                                    |
                                    v
            +-----------------------------------------------+
            |           STATE & REPOSITORY LAYER            |
            |                 (store.js)                    |
            +-----------------------+-----------------------+
                                    |
      +-----------------------------+-----------------------------+
      |                             |                             |
      v                             v                             v
[ IoT Simulation Engine ]    [ Rule Engines ]          [ Data Repositories ]
- Solar PV (kW) & SoC (%)    - ICAR Crop Rules         - WaterRepo
- Tank Level (%) & Turbidity - Welfare Scheme Wizard   - LivestockRepo
- Livestock RFID Telemetry   - Context AI Assistant    - DairyRepo
- 3s Simulation Ticker                                 - AlertRepo
                                                       - SmsAuditRepo
                                    |
                                    v
                    +-------------------------------+
                    |  BROWSER PERSISTENCE LAYER    |
                    |   (localStorage: gramsathi)   |
                    +---------------+---------------+
                                    |
                                    v
+-----------------------------------------------------------------------+
|                       NODE.JS BACKEND SERVER                          |
|                       (Native http / https)                           |
+-------------------+-------------------------------+-------------------+
                    |                               |
                    v                               v
         [ GET /api/weather ]               [ POST /api/chat ]
         - Open-Meteo Proxy                 - LLM Gateway Proxy
         - Fallback Generator               - Local Rule Engine
```

---

## 2. Data Models & Schemas

### Water Sensor Telemetry
```json
{
  "tankLevel": 74,
  "turbidity": 2.1,
  "ph": 7.3,
  "flowRate": 18.5,
  "dailyConsumption": 4200,
  "activePump": "P-01 (Primary Solar Submersible)",
  "pumpStatus": "AUTO_OFF",
  "history": [68, 70, 72, 75, 74, 76, 74]
}
```

### Livestock RFID Profile
```json
{
  "id": "COW-01",
  "name": "Gauri",
  "type": "Cow",
  "breed": "Gir (Indigenous Dairy)",
  "age": 4,
  "lactationStage": "Peak (Month 3)",
  "heartRate": 72,
  "temperature": 38.6,
  "ruminationMinutes": 460,
  "geofenceStatus": "Inside Monitored Pasture (Safe)",
  "dailyMilkAvg": 14.2,
  "feedRation": { "green": 22, "dry": 6, "concentrate": 3.5 },
  "healthNotes": "Healthy, routine vaccination verified.",
  "timeline": [
    { "time": "06:30 AM", "event": "Morning milking completed (7.5 Liters)" }
  ]
}
```

### Dairy Collection Log
```json
{
  "id": "MR-101",
  "date": "2026-09-23",
  "session": "Morning",
  "animalId": "COW-01",
  "liters": 7.5,
  "fat": 4.6,
  "snf": 8.8,
  "farmer": "Ramesh Patel",
  "note": "Standard morning yield"
}
```

---

## 3. Backend API Endpoints

| Endpoint | Method | Parameters | Description |
|---|---|---|---|
| `/api/health` | `GET` | None | Server health and uptime probe. |
| `/api/weather` | `GET` | `city` (string) | Proxies live weather data via Open-Meteo API or returns labeled demo fallback. |
| `/api/chat` | `POST` | `{ message, villageState }` | Proxies queries to configured LLM provider or invokes local context engine. |
