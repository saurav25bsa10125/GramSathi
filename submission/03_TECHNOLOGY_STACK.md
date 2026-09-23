# 03. Technology Stack — GramSathi

GramSathi is intentionally engineered with a **zero-dependency, lightweight footprint** to maximize resilience in low-resource rural settings.

| Layer | Technologies & Tools | Rationale & Tradeoffs |
|---|---|---|
| **Frontend Core** | HTML5 Semantic Markup, CSS3 Variables, Vanilla JavaScript (ES6+) | 100% zero build tools required; operates in any kiosk browser or low-spec hardware without memory bloat. |
| **Styling & Theming** | Custom CSS Design Tokens, Glassmorphic & High-Contrast Utility Classes, CSS Grid & Flexbox | Clean rural-tech aesthetic; lightweight (<18 KB stylesheet); instant Dark/Light theme toggle. |
| **Iconography** | Native Inline SVG Library (`src/icons.js`) | Zero HTTP requests for font icons; crystal-sharp rendering at all resolutions and kiosk displays. |
| **Client Storage** | HTML5 `localStorage` (`gramsathi_v2_data`), Blob API | Instant offline persistence, JSON backup export/import, and native CSV dairy records generation. |
| **Backend Runtime** | Node.js (v18+) Native Standard Library (`http`, `https`, `fs`, `path`, `url`) | Zero `node_modules` dependency installation required; extremely safe, lightweight, and fast startup (<50ms). |
| **APIs & Proxies** | Open-Meteo REST API, e-NAM / Agmarknet Baseline Dataset, Local Rule Engines | Secure server-side proxy prevents API key exposure; graceful fallback to labeled demo data. |
| **Internationalization** | Custom Multi-Language Engine (`src/i18n.js`) | Client-side reactive translation dictionary for 5 Indian languages (English, Hindi, Punjabi, Tamil, Telugu). |
