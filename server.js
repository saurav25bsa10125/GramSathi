// GramSathi Backend Server
// Provides static file serving and server-side API proxy routes for Weather, Mandi, Schemes, and AI Assistant (Groq / OpenAI / Local Engine).
// Uses native Node.js standard library (zero third-party dependencies required).

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Services
const aiService = require('./services/groqService');
const weatherService = require('./services/weatherService');
const mandiService = require('./services/mandiService');
const schemeService = require('./services/schemeService');

// Load .env file manually if present (Without requiring dotenv package)
function loadEnv() {
  const candidateFiles = ['.env', '.env.local', '.env.txt', '.env.example.txt', '.env.example'];
  for (const file of candidateFiles) {
    const envPath = path.join(__dirname, file);
    if (fs.existsSync(envPath)) {
      try {
        let content = fs.readFileSync(envPath, 'utf8');
        // Strip UTF-8 BOM if present
        if (content.charCodeAt(0) === 0xFEFF) {
          content = content.slice(1);
        }
        const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
        let loadedCount = 0;
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const idx = trimmed.indexOf('=');
          if (idx > 0) {
            const key = trimmed.slice(0, idx).trim();
            const val = trimmed.slice(idx + 1).trim().replace(/(^['"]|['"]$)/g, '');
            // Do not override if already non-empty in process.env, unless process.env[key] is empty or placeholder
            if (val && (!process.env[key] || process.env[key].startsWith('your_') || process.env[key].includes('...'))) {
              process.env[key] = val;
              loadedCount++;
            }
          }
        }
        console.log(`[GramSathi] Environment configuration loaded from ${file} (${loadedCount} keys set)`);
        break; // Stop after loading the highest priority file found
      } catch (e) {
        console.warn(`[GramSathi] Notice: Could not parse ${file}:`, e.message);
      }
    }
  }
}
loadEnv();

const PORT = parseInt(process.env.PORT || '3000', 10);
const STATIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=UTF-8'
};

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1024 * 1024) { // 1MB limit
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

// API Route Dispatcher
async function handleApi(req, res, parsedUrl) {
  const pathname = parsedUrl.pathname;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. Health Probe
  if (pathname === '/api/health') {
    const aiStatus = aiService.getActiveProvider();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      platform: 'GramSathi Rural Digital Operating Platform',
      cosmos: 'Universe in One Place',
      time: new Date().toISOString(),
      node: process.version,
      aiProvider: aiStatus.provider,
      aiModel: aiStatus.model,
      groqConfigured: !!aiService.getGroqApiKey(),
      openaiConfigured: !!aiService.getOpenAiApiKey()
    }));
    return;
  }

  // 2. Weather Endpoint (Live coordinate / location support)
  if (pathname === '/api/weather' && req.method === 'GET') {
    const q = parsedUrl.query || {};
    const lat = q.lat || process.env.DEFAULT_VILLAGE_LAT;
    const lon = q.lon || process.env.DEFAULT_VILLAGE_LON;
    const city = q.city || process.env.DEFAULT_VILLAGE_NAME || 'Rampur Village Hub';

    try {
      const weatherData = await weatherService.getWeather(lat, lon, city);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(weatherData));
    } catch (err) {
      console.error('Error fetching weather:', err.message);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(weatherService.getDemoWeather(city, lat, lon)));
    }
    return;
  }

  // 3. Mandi Market Endpoint
  if (pathname === '/api/mandi' && req.method === 'GET') {
    const q = parsedUrl.query || {};
    const crop = q.crop || q.q || '';
    const state = q.state || '';
    const market = q.market || '';

    try {
      const mandiData = await mandiService.getMandiRates(crop, state, market);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(mandiData));
    } catch (err) {
      console.error('Error fetching mandi data:', err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message, data: [] }));
    }
    return;
  }

  // 4. Government Schemes Endpoint
  if (pathname === '/api/schemes' && req.method === 'GET') {
    const q = parsedUrl.query || {};
    const queryStr = q.q || q.search || '';
    const category = q.category || '';

    try {
      const schemeData = await schemeService.getSchemes(queryStr, category);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(schemeData));
    } catch (err) {
      console.error('Error fetching schemes:', err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message, data: [] }));
    }
    return;
  }

  // 5. Context-Aware AI Chat Assistant Endpoint (Groq Primary / OpenAI / Rule Engine)
  if (pathname === '/api/chat' && req.method === 'POST') {
    try {
      const payload = await readRequestBody(req);
      const userMsg = (payload.message || '').trim();
      const language = payload.language || 'en';
      const villageContext = payload.context || payload.villageState || {};
      const conversationHistory = payload.conversationHistory || [];

      if (!userMsg) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Message cannot be empty' }));
        return;
      }

      const response = await aiService.generateChatResponse({
        message: userMsg,
        language,
        context: villageContext,
        conversationHistory
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
    } catch (err) {
      console.error('Error handling /api/chat:', err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message, reply: 'Assistant is temporarily unavailable.' }));
    }
    return;
  }

  // 6. Crop Guidance AI Explanation Endpoint
  if (pathname === '/api/crop-explain' && req.method === 'POST') {
    try {
      const payload = await readRequestBody(req);
      const crop = payload.crop || {};
      const farmProfile = payload.farmProfile || {};

      const result = await aiService.explainCrop(crop, farmProfile);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 7. Mandi Market AI Interpretation Endpoint
  if (pathname === '/api/mandi-explain' && req.method === 'POST') {
    try {
      const payload = await readRequestBody(req);
      const commodity = payload.commodity || 'Produce';
      const records = payload.records || [];

      const result = await aiService.explainMandi(commodity, records);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'API route not found' }));
}

// Static File Server with Security & Clean MIME Handling
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (parsedUrl.pathname.startsWith('/api/')) {
    handleApi(req, res, parsedUrl);
    return;
  }

  let reqPath = decodeURIComponent(parsedUrl.pathname);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  let filePath = path.normalize(path.join(STATIC_DIR, reqPath));

  // Security: prevent directory traversal attacks
  if (!filePath.startsWith(STATIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(STATIC_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  const aiStatus = aiService.getActiveProvider();
  console.log('====================================================');
  console.log(' GramSathi — Rural Digital Operating Platform');
  console.log(' COSMOS — Universe in One Place');
  console.log(` Web Server:    http://localhost:${PORT}`);
  console.log(` Health API:    http://localhost:${PORT}/api/health`);
  console.log(` Weather API:   http://localhost:${PORT}/api/weather`);
  console.log(` Mandi API:     http://localhost:${PORT}/api/mandi`);
  console.log(` Schemes API:   http://localhost:${PORT}/api/schemes`);
  console.log(` AI Provider:   ${aiStatus.provider} (${aiStatus.model})`);
  console.log('====================================================');
});