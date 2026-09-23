# 07. Backend API Setup & External Integrations — GramSathi

---

## 1. Environment Configuration

GramSathi includes a native zero-dependency Node.js server (`server.js`) that securely proxies external API requests.

### Configuration Steps:
1. Copy the example environment template:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` with your preferred settings:
   ```env
   PORT=3000
   WEATHER_API_KEY=your_open_meteo_or_weather_key_here
   DEFAULT_VILLAGE_NAME=Rampur Village Hub
   DEFAULT_VILLAGE_STATE=Uttar Pradesh
   DEFAULT_LAT=28.80
   DEFAULT_LON=79.02
   AI_API_KEY=your_llm_api_key_here
   MANDI_API_KEY=your_enam_api_key_here
   ```
3. Start the server:
   ```bash
   node server.js
   ```

---

## 2. API Endpoints

### 1. Health Probe
- **URL:** `GET /api/health`
- **Response:**
  ```json
  { "status": "ok", "time": "2026-09-23T02:00:00.000Z", "node": "v20.x" }
  ```

### 2. Weather Proxy
- **URL:** `GET /api/weather?city=Rampur`
- **Behavior:** Queries Open-Meteo REST endpoints. If external network is unavailable or no key is set, returns structured demo weather labeled `isLive: false`.

### 3. AI Assistant Gateway
- **URL:** `POST /api/chat`
- **Payload:** `{ "message": "Check water status", "villageState": { ... } }`
- **Behavior:** Forwards context to configured LLM gateway. If unconfigured, falls back to the client-side context-aware rule engine.
