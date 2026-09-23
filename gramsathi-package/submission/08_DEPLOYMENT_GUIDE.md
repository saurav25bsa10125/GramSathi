# 08. Deployment Guide — GramSathi

GramSathi supports both standalone offline deployment and hosted cloud deployment.

---

## Option 1: Local / Panchayat Kiosk Deployment (Offline)
1. Ensure Node.js (v18+) is installed on the kiosk PC.
2. Clone or extract `gramsathi-v2-complete.zip`.
3. Open terminal in the project folder and run:
   ```bash
   node server.js
   ```
4. Configure the browser to open `http://localhost:3000` on system startup.
5. Press the **'Kiosk Wall Display'** button to enter fullscreen high-contrast mode.

---

## Option 2: Cloud Deployment (Render / Vercel / Railway)
1. Push the repository to GitHub.
2. In your cloud provider dashboard (e.g. Render / Railway):
   - **Build Command:** *(Leave empty / `echo ready`)*
   - **Start Command:** `node server.js`
   - **Environment Variables:** Set `PORT=3000` (or provider default).
3. The platform will immediately start serving both frontend assets and API proxies.

---

## Option 3: Static Web Hosting (GitHub Pages / Netlify)
- Simply deploy the root directory (`index.html`, `src/`, `data/`, `locales/`).
- The entire application operates completely offline in static mode with client-side fallback engines.
