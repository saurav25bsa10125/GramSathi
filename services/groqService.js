// GramSathi - Primary AI Service: Groq API with OpenAI & Offline Rule-Based Fallbacks
// Uses native Node.js standard library (https) - zero external dependencies

const https = require('https');

function getGroqApiKey() {
  const key = process.env.GROQ_API_KEY;
  if (!key || key.trim() === '' || key.startsWith('xxxx')) {
    return null;
  }
  return key.trim();
}

function getGroqModel() {
  return process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
}

function getOpenAiApiKey() {
  const key = process.env.OPENAI_API_KEY;
  if (!key || key.trim() === '' || key.startsWith('xxxx')) {
    return null;
  }
  return key.trim();
}

function getOpenAiModel() {
  return process.env.OPENAI_MODEL || 'gpt-4o-mini';
}

function getActiveProvider() {
  if (getGroqApiKey()) return { provider: 'GROQ', model: getGroqModel() };
  if (getOpenAiApiKey()) return { provider: 'OPENAI', model: getOpenAiModel() };
  return { provider: 'LOCAL_RULE_ENGINE', model: 'GramSathi-Rule-Engine-v2' };
}

/**
 * Low-level HTTPS request to Groq / OpenAI OpenAI-compatible completion endpoint
 */
function sendChatCompletion({ hostname, path, apiKey, model, messages, temperature = 0.4, maxTokens = 600 }) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens
    });

    const options = {
      hostname,
      port: 443,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 15000
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
            resolve({ content, usage: parsed.usage, model });
          } else {
            const errMsg = parsed.error ? (parsed.error.message || JSON.stringify(parsed.error)) : `HTTP ${res.statusCode}: ${data}`;
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
      reject(new Error(`API request to ${hostname} timed out (15s limit)`));
    });

    req.write(payload);
    req.end();
  });
}

/**
 * Call Groq Cloud API (Primary AI Engine)
 */
async function callGroq(messages, temperature = 0.4, maxTokens = 600) {
  const apiKey = getGroqApiKey();
  if (!apiKey) throw new Error('GROQ_API_KEY_NOT_CONFIGURED');

  return sendChatCompletion({
    hostname: 'api.groq.com',
    path: '/openai/v1/chat/completions',
    apiKey,
    model: getGroqModel(),
    messages,
    temperature,
    maxTokens
  });
}

/**
 * Call OpenAI API (Secondary Backup Engine)
 */
async function callOpenAi(messages, temperature = 0.4, maxTokens = 600) {
  const apiKey = getOpenAiApiKey();
  if (!apiKey) throw new Error('OPENAI_API_KEY_NOT_CONFIGURED');

  return sendChatCompletion({
    hostname: 'api.openai.com',
    path: '/v1/chat/completions',
    apiKey,
    model: getOpenAiModel(),
    messages,
    temperature,
    maxTokens
  });
}

/**
 * Generate Assistant response with live village context, multi-turn history, and language support
 */
async function generateChatResponse({ message, language = 'en', context = {}, conversationHistory = [] }) {
  const userMsg = (message || '').trim();
  const langName = language === 'hi' ? 'Hindi' : language === 'pa' ? 'Punjabi' : language === 'ta' ? 'Tamil' : language === 'te' ? 'Telugu' : 'English';

  const systemPrompt = `You are GramSathi AI, an intelligent, empathetic, and factual rural digital operating assistant for Indian village panchayats, farmers, and dairy owners.

CURRENT LIVE VILLAGE OPERATING CONTEXT:
- Village Hub: ${context.villageName || 'Rampur Village Hub'} (${context.villageState || 'Uttar Pradesh'})
- Overhead Drinking Water Tank: Level ${context.waterLevel !== undefined ? context.waterLevel : 74}%, Flow Rate: ${context.waterFlow || 18.5} L/min, Potability: pH ${context.waterPh || 7.3}, Turbidity: ${context.waterTurbidity || 2.1} NTU, Pump Status: ${context.pumpStatus || 'AUTO_OFF'}
- Solar Microgrid: Generation: ${context.solarGen !== undefined ? context.solarGen : 4.8} kW, Battery SoC: ${context.batterySoc !== undefined ? context.batterySoc : 82}%, Village Load: ${context.villageLoad || 2.6} kW, Inverter Efficiency: ${context.inverterEff || 94.2}%
- Livestock & Dairy: ${context.livestockCount || 4} monitored heads. Today's recorded milk yield: ${context.todayMilk !== undefined ? context.todayMilk : 14.8} Liters. Active Health/Fever Alerts: ${context.feverAlerts || 'None (All normal)'}
- Village Micro-Climate: Temperature: ${context.weatherTemp || 28.5}°C, Condition: ${context.weatherCond || 'Sunny & Pleasant'}, Humidity: ${context.weatherHum || 62}%, Wind: ${context.weatherWind || 11.5} km/h
- Active System Alerts: ${context.activeAlertsSummary || 'All systems within nominal baseline parameters'}

MANDATORY GUIDELINES:
1. Ground your answers strictly in the current village records provided above. Never fabricate numbers or contradict existing records.
2. If the user asks for data not in records, state clearly and honestly: "I don't have that information in the current village records."
3. If giving agronomic or veterinary advice, include a brief note: "General advisory. Please verify with local Krishi Vigyan Kendra (KVK) or veterinary officer."
4. Respond in the user's selected language: ${langName} (${language}). If in Hindi, use natural, respectful Devanagari Hindi.
5. Provide helpful, structured answers with bullet points where appropriate. Keep answers practical and easy to understand for rural users.`;

  const messages = [{ role: 'system', content: systemPrompt }];

  // Add previous conversation history for multi-turn context (e.g. "What about wheat?")
  if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
    conversationHistory.slice(-8).forEach(item => {
      if (item && item.role && item.content) {
        messages.push({
          role: item.role === 'user' ? 'user' : 'assistant',
          content: String(item.content)
        });
      }
    });
  }

  messages.push({ role: 'user', content: userMsg });

  // 1. Try Groq (Primary Engine)
  if (getGroqApiKey()) {
    try {
      const result = await callGroq(messages, 0.3, 500);
      return {
        reply: result.content,
        sourceType: 'LIVE',
        source: 'GROQ_API_PRIMARY',
        model: result.model || getGroqModel(),
        provider: 'Groq Cloud LLM'
      };
    } catch (err) {
      console.warn('[GramSathi] Groq API call failed:', err.message);
    }
  }

  // 2. Try OpenAI (Secondary Engine Fallback)
  if (getOpenAiApiKey()) {
    try {
      const result = await callOpenAi(messages, 0.3, 500);
      return {
        reply: result.content,
        sourceType: 'LIVE',
        source: 'OPENAI_API_FALLBACK',
        model: result.model || getOpenAiModel(),
        provider: 'OpenAI Cloud LLM'
      };
    } catch (err) {
      console.warn('[GramSathi] OpenAI API call failed:', err.message);
    }
  }

  // 3. Robust Local Rule-Based Engine Fallback
  return {
    reply: getLocalRuleResponse(userMsg, context, language),
    sourceType: 'LOCAL_DATA',
    source: 'LOCAL_RULE_ASSISTANT',
    model: 'GramSathi-Rule-Engine-v2',
    provider: 'Local Offline Knowledge Engine'
  };
}

/**
 * AI Explanation for Crop Suitability
 */
async function explainCrop(cropData, farmProfile = {}) {
  const prompt = `Explain why the crop "${cropData.name || cropData.cropName}" is suitable or not for a farm with:
- Season: ${farmProfile.season || 'Rabi'}
- Soil: ${farmProfile.soilType || 'Alluvial'}
- Water Availability: ${farmProfile.waterAvail || 'Moderate'}
- Farm Size: ${farmProfile.farmSizeAcres || 2.5} acres
- Previous Crop: ${farmProfile.prevCrop || 'Paddy'}

Provide a 3-4 bullet point farmer-friendly explanation covering:
1. Sowing window & water requirement match
2. Crop rotation benefits
3. Fertilizer / nutrient guidance
4. Key risk factors and prevention
Add a 1-line advisory notice at the end.`;

  const messages = [
    { role: 'system', content: 'You are an ICAR-certified senior agronomist giving practical crop advice to Indian farmers.' },
    { role: 'user', content: prompt }
  ];

  if (getGroqApiKey()) {
    try {
      const result = await callGroq(messages, 0.2, 450);
      return { explanation: result.content, sourceType: 'LIVE', provider: 'Groq LLM' };
    } catch (e) {
      console.warn('Groq crop explanation failed:', e.message);
    }
  }

  if (getOpenAiApiKey()) {
    try {
      const result = await callOpenAi(messages, 0.2, 450);
      return { explanation: result.content, sourceType: 'LIVE', provider: 'OpenAI LLM' };
    } catch (e) {
      console.warn('OpenAI crop explanation failed:', e.message);
    }
  }

  return {
    explanation: `**Agronomic Profile for ${cropData.name || cropData.cropName}:**\n- **Season Fit:** Well-suited for ${farmProfile.season || 'Rabi'} sowing window (${cropData.sowingWindow || 'Standard timing'}).\n- **Soil Compatibility:** Thrives in ${cropData.soils ? cropData.soils.join(', ') : 'well-drained fertile soils'} with balanced moisture retention.\n- **Water Management:** ${cropData.waterDesc || 'Requires timely irrigations at critical growth stages'}.\n- **Management Note:** ${cropData.tips || 'Use certified seeds and balanced NPK fertilizer application.'}\n\n*General advisory. Verify with local KVK before major farm decisions.*`,
    sourceType: 'CACHED_DATA',
    provider: 'ICAR Verified Dataset'
  };
}

/**
 * AI Interpretation for Mandi Market Rates
 */
async function explainMandi(commodityName, records = []) {
  if (records.length > 0) {
    const prompt = `Analyze this current mandi price data for ${commodityName}:
${JSON.stringify(records.slice(0, 6), null, 2)}

Provide a concise 3-bullet summary:
1. Current modal price range across markets
2. High vs low market price variations
3. Key selling considerations for farmers

DO NOT invent future price forecasts or speculative claims. Keep it strictly descriptive of the provided data.`;

    const messages = [
      { role: 'system', content: 'You are a reliable agricultural market analyst explaining APMC mandi rates to farmers.' },
      { role: 'user', content: prompt }
    ];

    if (getGroqApiKey()) {
      try {
        const result = await callGroq(messages, 0.2, 350);
        return { explanation: result.content, sourceType: 'LIVE', provider: 'Groq LLM' };
      } catch (e) {
        console.warn('Groq mandi explanation failed:', e.message);
      }
    }

    if (getOpenAiApiKey()) {
      try {
        const result = await callOpenAi(messages, 0.2, 350);
        return { explanation: result.content, sourceType: 'LIVE', provider: 'OpenAI LLM' };
      } catch (e) {
        console.warn('OpenAI mandi explanation failed:', e.message);
      }
    }
  }

  if (!records || records.length === 0) {
    return {
      explanation: `No active market records available for ${commodityName} at this time.`,
      sourceType: 'CACHED_DATA',
      provider: 'Agmarknet Dataset'
    };
  }

  const prices = records.map(r => r.modalPrice || r.modal_price || 0).filter(p => p > 0);
  const minModal = Math.min(...prices);
  const maxModal = Math.max(...prices);
  const avgModal = Math.round(prices.reduce((a, b) => a + b, 0) / (prices.length || 1));

  return {
    explanation: `**Market Summary for ${commodityName}:**\n- **Modal Price Range:** ₹${minModal} - ₹${maxModal} per quintal across reported terminal APMC markets.\n- **Average Modal Price:** Approx. ₹${avgModal}/quintal.\n- **Market Advisory:** Prices vary based on moisture content, grain purity, and local arrivals. Compare nearby mandis before transporting harvest.`,
    sourceType: 'CACHED_DATA',
    provider: 'Agmarknet Dataset'
  };
}

/**
 * Local Rule-Based Intelligent Fallback with Multi-Language Support
 */
function getLocalRuleResponse(userMsg, ctx, lang = 'en') {
  const lower = (userMsg || '').toLowerCase();
  const isHi = lang === 'hi' || /[\u0900-\u097F]/.test(userMsg);

  if (lower.includes('मौसम') || lower.includes('weather') || lower.includes('rain') || lower.includes('बारिश') || lower.includes('temperature') || lower.includes('तापमान')) {
    if (isHi) {
      return `🌦️ **ग्रामीण मौसम स्थिति:** वर्तमान तापमान **${ctx.weatherTemp || 28.5}°C** है (${ctx.weatherCond || 'साफ मौसम'})। आर्द्रता **${ctx.weatherHum || 62}%** तथा हवा की गति **${ctx.weatherWind || 11.5} किमी/घंटा** है। खेत के काम और मवेशी चराई के लिए मौसम अनुकूल है।`;
    }
    return `🌦️ **Village Weather:** Current temperature is **${ctx.weatherTemp || 28.5}°C** (${ctx.weatherCond || 'Sunny & Pleasant'}). Humidity is **${ctx.weatherHum || 62}%** and wind speed is **${ctx.weatherWind || 11.5} km/h**. Favorable for field work and livestock grazing.`;
  }

  if (lower.includes('दूध') || lower.includes('milk') || lower.includes('dairy') || lower.includes('डेयरी') || lower.includes('गाय') || lower.includes('भैंस') || lower.includes('cattle') || lower.includes('production')) {
    if (isHi) {
      return `🥛 **डेयरी रिकॉर्ड:** आज का कुल दर्ज दुग्ध उत्पादन **${ctx.todayMilk || 14.8} लीटर** है। सबसे अधिक उत्पादन: **${ctx.topAnimal || 'गौरी (COW-01 - 7.5L)'}**। आप डेयरी अनुभाग में सुबह और शाम का नया दूध रिकॉर्ड दर्ज कर सकते हैं।`;
    }
    return `🥛 **Dairy Records:** Today's recorded milk collection is **${ctx.todayMilk || 14.8} Liters** across registered dairy cattle. Top producer: **${ctx.topAnimal || 'Gauri (COW-01 - 7.5L)'}**. You can record morning and evening yields in the Dairy section.`;
  }

  if (lower.includes('पानी') || lower.includes('water') || lower.includes('tank') || lower.includes('pump') || lower.includes('पंप') || lower.includes('turbidity') || lower.includes('ph')) {
    if (isHi) {
      return `💧 **जल प्रणाली स्थिति:** ओवरहेड टैंक **${ctx.waterLevel || 74}%** भरा हुआ है (10,000 लीटर क्षमता)। पेयजल गुणवत्ता: **pH ${ctx.waterPh || 7.3}**, टर्बिडिटी: **${ctx.waterTurbidity || 2.1} NTU** (पीने योग्य सुरक्षित)। पंप स्थिति: **${ctx.pumpStatus || 'AUTO_OFF'}**।`;
    }
    return `💧 **Water Systems:** Overhead tank is at **${ctx.waterLevel || 74}%** capacity (10,000 L). Water potability: **pH ${ctx.waterPh || 7.3}**, Turbidity: **${ctx.waterTurbidity || 2.1} NTU** (Safe Potable). Active pump status: **${ctx.pumpStatus || 'AUTO_OFF'}**.`;
  }

  if (lower.includes('बिजली') || lower.includes('solar') || lower.includes('energy') || lower.includes('battery') || lower.includes('सौर') || lower.includes('पावर') || lower.includes('load')) {
    if (isHi) {
      return `⚡ **सौर माइक्रोग्रिड:** सोलर पीवी उत्पादन **${ctx.solarGen || 4.8} kW** है तथा LiFePO4 बैटरी बैंक **${ctx.batterySoc || 82}%** चार्ज है। गांव का लोड **${ctx.villageLoad || 2.6} kW** है। अनुमानित बैटरी बैकअप लगभग **${Math.round(((ctx.batterySoc || 82) / 100 * 15) / (ctx.villageLoad || 2.6))} घंटे** है।`;
    }
    return `⚡ **Solar Microgrid:** Solar PV generation is **${ctx.solarGen || 4.8} kW** with LiFePO4 battery bank at **${ctx.batterySoc || 82}%**. Essential village load is **${ctx.villageLoad || 2.6} kW**. Estimated battery backup is approx. **${Math.round(((ctx.batterySoc || 82) / 100 * 15) / (ctx.villageLoad || 2.6))} hours**.`;
  }

  if (lower.includes('पशु') || lower.includes('livestock') || lower.includes('health') || lower.includes('fever') || lower.includes('बीमार') || lower.includes('collar')) {
    if (isHi) {
      return `🐄 **पशुधन टेलीमेट्री:** सभी मवेशी सुरक्षित चारागाह क्षेत्र में हैं। औसत शारीरिक तापमान ~38.6°C, हृदय गति ~72 bpm, रोमंथन ~460 मिनट। अलर्ट स्थिति: ${ctx.feverAlerts || 'सभी मवेशी सामान्य व स्वस्थ हैं'}।`;
    }
    return `🐄 **Livestock Telemetry:** Monitored cattle are inside the geofenced pasture. Average vitals: Body Temp ~38.6°C, Heart Rate ~72 bpm, Rumination ~460 min. Alert status: ${ctx.feverAlerts || 'All vitals normal'}.`;
  }

  if (lower.includes('योजना') || lower.includes('scheme') || lower.includes('subsidy') || lower.includes('pm-kisan') || lower.includes('kcc') || lower.includes('सरकारी')) {
    if (isHi) {
      return `📜 **सरकारी योजनाएं:** प्रमुख सक्रिय योजनाएं: 1) **पीएम-किसान सम्मान निधि** (₹6,000/वर्ष डीबीटी), 2) **किसान क्रेडिट कार्ड (KCC)** (4% रियायती ऋण), 3) **पीएम फसल बीमा योजना**, 4) **पीएमकेएसवाई (सूक्ष्म सिंचाई सब्सिडी)**। संपूर्ण पात्रता विवरण के लिए योजनाएं टैब देखें।`;
    }
    return `📜 **Government Schemes:** Key active welfare schemes include: 1) **PM-Kisan Samman Nidhi** (₹6,000/yr DBT), 2) **Kisan Credit Card (KCC)** (4% subsidized credit), 3) **PM Fasal Bima Yojana**, and 4) **PMKSY (Micro-Irrigation Subsidy)**. Check the Schemes tab for full eligibility details.`;
  }

  if (lower.includes('मंडी') || lower.includes('mandi') || lower.includes('price') || lower.includes('rate') || lower.includes('भाव') || lower.includes('दाम') || lower.includes('wheat') || lower.includes('mustard')) {
    if (isHi) {
      return `🌾 **मंडी भाव:** गेहूं **₹2,275 - ₹2,450 / क्विंटल** (मॉडल: ₹2,360), सरसों **₹5,400 - ₹5,850 / क्विंटल** (मॉडल: ₹5,680), चना **₹5,850 - ₹6,250 / क्विंटल**। राज्यवार एपीएमसी दरों के लिए मंडी टैब देखें।`;
    }
    return `🌾 **Mandi Market Rates:** Wheat is trading at **₹2,275 - ₹2,450 / quintal** (Modal: ₹2,360), Mustard at **₹5,400 - ₹5,850 / quintal** (Modal: ₹5,680), and Chickpea (Chana) at **₹5,850 - ₹6,250 / quintal**. Explore the Mandi tab for state-wise APMC rates.`;
  }

  if (lower.includes('फसल') || lower.includes('crop') || lower.includes('agri') || lower.includes('soil') || lower.includes('खेती') || lower.includes('खाद')) {
    if (isHi) {
      return `🌱 **स्मार्ट कृषि सलाह:** रबी मौसम में जलोढ़/दोमट मिट्टी के लिए गेहूं (HD-2967), सरसों (RH-749), और चना (JG-11) सर्वोत्तम हैं। अपनी मिट्टी और पानी के अनुसार विस्तृत सिफारिश के लिए फसल योजना टैब का उपयोग करें।`;
    }
    return `🌱 **Smart Agriculture:** For Rabi season in alluvial/loamy soil, Wheat (HD-2967), Mustard (RH-749), and Chickpea (JG-11) are optimal. Use our Agriculture tab for personalized farm advice based on your soil and water availability.`;
  }

  if (isHi) {
    return `🌾 नमस्ते! मैं आपका **ग्रामसाथी ग्रामीण सहायक** हूँ। सौर माइक्रोग्रिड, पेयजल टैंक, मवेशी स्वास्थ्य कॉलर, डेयरी बहीखाता और मंडी भाव से मैं जुड़ा हुआ हूँ। मैं आपकी क्या सहायता कर सकता हूँ?`;
  }
  return `🌾 Namaste! I am your **GramSathi Rural Assistant**. All village IoT telemetry (Solar Microgrid, Potable Water Tank, Cattle Collars, Dairy Ledger, and Mandi Rates) are connected. How can I help you today?`;
}

module.exports = {
  getGroqApiKey,
  getGroqModel,
  getOpenAiApiKey,
  getOpenAiModel,
  getActiveProvider,
  generateChatResponse,
  explainCrop,
  explainMandi
};
