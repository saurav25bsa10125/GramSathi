// GramSathi - OpenAI Backend Service
// Uses native Node.js https client (zero extra dependencies)

const https = require('https');

function getApiKey() {
  const key = process.env.OPENAI_API_KEY;
  if (!key || key.trim() === '' || key.startsWith('xxxx')) {
    return null;
  }
  return key.trim();
}

function getModel() {
  return process.env.OPENAI_MODEL || 'gpt-4o-mini';
}

function callOpenAi(messages, temperature = 0.5, maxTokens = 500) {
  return new Promise((resolve, reject) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      return reject(new Error('OPENAI_API_KEY_NOT_CONFIGURED'));
    }

    const payload = JSON.stringify({
      model: getModel(),
      messages,
      temperature,
      max_tokens: maxTokens
    });

    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 12000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const content = parsed.choices && parsed.choices[0] && parsed.choices[0].message
              ? parsed.choices[0].message.content
              : '';
            resolve({ content, usage: parsed.usage });
          } else {
            const errMsg = parsed.error ? parsed.error.message : `HTTP ${res.statusCode}: ${data}`;
            reject(new Error(errMsg));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('OpenAI API request timed out (12s limit)'));
    });

    req.write(payload);
    req.end();
  });
}

/**
 * Generate assistant reply with village state context
 */
async function generateChatResponse(userMessage, context = {}) {
  const apiKey = getApiKey();

  // If OpenAI key is available, call OpenAI with rich system context
  if (apiKey) {
    const systemPrompt = `You are GramSathi AI, an intelligent, empathetic, and highly knowledgeable rural digital operating companion for village panchayats, farmers, and dairy keepers.

CURRENT LIVE VILLAGE OPERATING CONTEXT:
- Village Hub: ${context.villageName || 'Rampur Village Hub'} (${context.villageState || 'Uttar Pradesh'})
- Overhead Drinking Water Tank: Level ${context.waterLevel || 74}%, Flow Rate: ${context.waterFlow || 18.5} L/min, Potability: pH ${context.waterPh || 7.3}, Turbidity: ${context.waterTurbidity || 2.1} NTU, Pump Status: ${context.pumpStatus || 'AUTO_OFF'}
- Solar Microgrid: Current Generation: ${context.solarGen || 4.8} kW, Battery SoC: ${context.batterySoc || 82}%, Village Load: ${context.villageLoad || 2.6} kW, Inverter Efficiency: ${context.inverterEff || 94}%
- Livestock & Dairy: ${context.livestockCount || 4} monitored heads. Today's recorded milk yield: ${context.todayMilk || 14.8} L. Active fever/health alerts: ${context.feverAlerts || 'None (All normal)'}
- Village Micro-Climate Weather: ${context.weatherTemp || 28}°C, ${context.weatherCond || 'Clear'}, Humidity: ${context.weatherHum || 60}%, Wind: ${context.weatherWind || 12} km/h
- Active System Alerts: ${context.activeAlertsSummary || 'All systems within nominal baseline parameters'}

GUIDELINES:
1. Ground your answers strictly in the current village records provided above. Never invent fake telemetry numbers or contradict existing records.
2. If the user asks for data not in records, answer honestly: "I don't have that information in the current village records."
3. If giving agronomic or veterinary advice, include a brief disclaimer: "General advisory. Please verify with local Krishi Vigyan Kendra (KVK) or veterinary officer."
4. If the user writes in Hindi or other Indian languages, reply in the same language fluently and respectfully.
5. Keep answers practical, structured, and easy to understand for rural users.`;

    try {
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ];
      const result = await callOpenAi(messages, 0.4, 450);
      return {
        reply: result.content,
        sourceType: 'LIVE_AI',
        model: getModel()
      };
    } catch (err) {
      console.warn('OpenAI API call failed, falling back to Context-Aware Rule Assistant:', err.message);
    }
  }

  // Robust Local Context-Aware Rule Assistant Fallback
  return {
    reply: getLocalRuleResponse(userMessage, context),
    sourceType: 'LOCAL_RULE_ASSISTANT',
    note: 'Running in zero-latency offline mode'
  };
}

/**
 * AI Explanation for Crop Suitability
 */
async function explainCrop(cropData, farmProfile = {}) {
  const apiKey = getApiKey();
  if (apiKey) {
    const prompt = `Explain why the crop "${cropData.name || cropData.cropName}" is suitable or not for a farm with:
- Season: ${farmProfile.season || 'Rabi'}
- Soil: ${farmProfile.soilType || 'Alluvial'}
- Water Availability: ${farmProfile.waterAvail || 'Moderate'}
- Farm Size: ${farmProfile.farmSizeAcres || 2.5} acres
- Previous Crop: ${farmProfile.prevCrop || 'Paddy'}

Provide a 3-4 bullet point farmer-friendly explanation covering:
1. Sowing & water requirement match
2. Crop rotation benefits
3. Nutrient / fertilizer guidance
4. Key risk factors and prevention
Add a 1-line advisory notice at the end.`;

    try {
      const messages = [
        { role: 'system', content: 'You are an ICAR-certified senior agronomist giving practical crop advice to Indian farmers.' },
        { role: 'user', content: prompt }
      ];
      const result = await callOpenAi(messages, 0.3, 400);
      return { explanation: result.content, sourceType: 'LIVE_AI' };
    } catch (e) {
      console.warn('OpenAI crop explanation failed, using local template:', e.message);
    }
  }

  return {
    explanation: `**Agronomic Profile for ${cropData.name || cropData.cropName}:**\n- **Season Fit:** Well-suited for ${farmProfile.season || 'Rabi'} sowing window (${cropData.sowingWindow || 'Standard timing'}).\n- **Soil Compatibility:** Thrives in ${cropData.soils ? cropData.soils.join(', ') : 'well-drained fertile soils'} with balanced moisture retention.\n- **Water Management:** ${cropData.waterDesc || 'Requires timely irrigations at critical growth stages'}.\n- **Management Note:** ${cropData.tips || 'Use certified seeds and balanced NPK fertilizer application.'}\n\n*General advisory. Verify with local KVK before major farm decisions.*`,
    sourceType: 'OFFLINE_AGRONOMIC_DATA'
  };
}

/**
 * AI Interpretation for Mandi Market Rates
 */
async function explainMandi(commodityName, records = []) {
  const apiKey = getApiKey();
  if (apiKey && records.length > 0) {
    const prompt = `Analyze this current mandi price data for ${commodityName}:
${JSON.stringify(records.slice(0, 5), null, 2)}

Provide a concise 3-bullet summary:
1. Current modal price range across markets
2. High vs low market price variations
3. Key selling considerations for farmers

DO NOT invent future price forecasts or speculative claims. Keep it strictly descriptive of the provided data.`;

    try {
      const messages = [
        { role: 'system', content: 'You are a reliable agricultural market analyst explaining APMC mandi rates to farmers.' },
        { role: 'user', content: prompt }
      ];
      const result = await callOpenAi(messages, 0.2, 350);
      return { explanation: result.content, sourceType: 'LIVE_AI' };
    } catch (e) {
      console.warn('OpenAI mandi explanation failed, using local template:', e.message);
    }
  }

  if (records.length === 0) {
    return {
      explanation: `No active market records available for ${commodityName} at this time.`,
      sourceType: 'CACHED_DATA'
    };
  }

  const prices = records.map(r => r.modalPrice || r.modal_price || 0).filter(p => p > 0);
  const minModal = Math.min(...prices);
  const maxModal = Math.max(...prices);
  const avgModal = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

  return {
    explanation: `**Market Summary for ${commodityName}:**\n- **Modal Price Range:** ₹${minModal} - ₹${maxModal} per quintal across reported terminal APMC markets.\n- **Average Modal Price:** Approx. ₹${avgModal}/quintal.\n- **Market Advisory:** Prices vary based on moisture content, grain purity, and local terminal arrivals. Compare nearby mandis before transporting harvest.`,
    sourceType: 'CACHED_DATA'
  };
}

/**
 * Local Rule-Based Intelligent Fallback
 */
function getLocalRuleResponse(userMsg, ctx) {
  const lower = (userMsg || '').toLowerCase();

  if (lower.includes('मौसम') || lower.includes('weather') || lower.includes('rain') || lower.includes('बारिश') || lower.includes('temperature') || lower.includes('तापमान')) {
    return `🌦️ **Village Weather:** Current temperature is **${ctx.weatherTemp || 28.5}°C** (${ctx.weatherCond || 'Clear'}). Humidity is **${ctx.weatherHum || 62}%** and wind speed is **${ctx.weatherWind || 11.4} km/h**. Favorable for field work and livestock grazing.`;
  }

  if (lower.includes('दूध') || lower.includes('milk') || lower.includes('dairy') || lower.includes('डेयरी') || lower.includes('गाय') || lower.includes('भैंस') || lower.includes('cattle') || lower.includes('production')) {
    return `🥛 **Dairy Records:** Today's recorded milk collection is **${ctx.todayMilk || 14.8} Liters** across registered dairy cattle. Top producer: **${ctx.topAnimal || 'Gauri (COW-01 - 7.5L)'}**. You can record morning/evening yields in the Dairy section.`;
  }

  if (lower.includes('पानी') || lower.includes('water') || lower.includes('tank') || lower.includes('pump') || lower.includes('पंप') || lower.includes('turbidity') || lower.includes('ph')) {
    return `💧 **Water Systems:** Overhead tank is at **${ctx.waterLevel || 74}%** capacity (10,000 L). Water potability: **pH ${ctx.waterPh || 7.3}**, Turbidity: **${ctx.waterTurbidity || 2.1} NTU** (Safe Potable). Active pump status: **${ctx.pumpStatus || 'AUTO_OFF'}**.`;
  }

  if (lower.includes('बिजली') || lower.includes('solar') || lower.includes('energy') || lower.includes('battery') || lower.includes('सौर') || lower.includes('पावर') || lower.includes('load')) {
    return `⚡ **Solar Microgrid:** Solar PV generation is **${ctx.solarGen || 4.8} kW** with LiFePO4 battery bank at **${ctx.batterySoc || 82}%**. Essential village load is **${ctx.villageLoad || 2.6} kW**. Estimated battery backup is approx. **${Math.round(((ctx.batterySoc || 82) / 100 * 15) / (ctx.villageLoad || 2.6))} hours**.`;
  }

  if (lower.includes('पशु') || lower.includes('livestock') || lower.includes('health') || lower.includes('fever') || lower.includes('बीमार') || lower.includes('collar')) {
    return `🐄 **Livestock Telemetry:** Monitored cattle are inside the geofenced pasture. Average vitals: Body Temp ~38.6°C, Heart Rate ~72 bpm, Rumination ~460 min. Alert status: ${ctx.feverAlerts || 'All vitals normal'}.`;
  }

  if (lower.includes('योजना') || lower.includes('scheme') || lower.includes('subsidy') || lower.includes('pm-kisan') || lower.includes('kcc') || lower.includes('सरकारी')) {
    return `📜 **Government Schemes:** Key active welfare schemes include: 1) **PM-Kisan Samman Nidhi** (₹6,000/yr DBT), 2) **Kisan Credit Card (KCC)** (4% subsidized credit), 3) **PM Fasal Bima Yojana**, and 4) **PMKSY (Micro-Irrigation Subsidy)**. Check the Schemes tab for full eligibility details.`;
  }

  if (lower.includes('मंडी') || lower.includes('mandi') || lower.includes('price') || lower.includes('rate') || lower.includes('भाव') || lower.includes('दाम') || lower.includes('wheat') || lower.includes('mustard')) {
    return `🌾 **Mandi Market Rates:** Wheat is trading at **₹2,275 - ₹2,450 / quintal** (Modal: ₹2,360), Mustard at **₹5,400 - ₹5,850 / quintal** (Modal: ₹5,680), and Chickpea (Chana) at **₹5,850 - ₹6,250 / quintal**. Explore the Mandi tab for state-wise APMC rates.`;
  }

  if (lower.includes('फसल') || lower.includes('crop') || lower.includes('agri') || lower.includes('soil') || lower.includes('खेती') || lower.includes('खाद')) {
    return `🌱 **Smart Agriculture:** For Rabi season in alluvial/loamy soil, Wheat (HD-2967), Mustard (RH-749), and Chickpea (JG-11) are optimal. Use our Agriculture tab for personalized farm advice based on your soil and water availability.`;
  }

  return `🌾 Namaste! I am your **GramSathi Rural Assistant**. All village IoT telemetry (Solar Microgrid, Potable Water Tank, Cattle Collars, Dairy Ledger, and Mandi Rates) are connected. How can I help you today?`;
}

module.exports = {
  getApiKey,
  getModel,
  generateChatResponse,
  explainCrop,
  explainMandi
};
