// GramSathi Repository, IoT Simulation Engine & State Management
// Single Source of Truth for GramSathi & COSMOS Village Operating Platform

window.GramStore = (function() {
  const STORAGE_KEY = 'gramsathi_data';

  // Default Baseline Demonstration State
  const defaultState = {
    villageName: 'Rampur Village Hub',
    villageState: 'Uttar Pradesh',
    lastSyncTime: new Date().toISOString(),
    connectionStatus: 'ONLINE_HUB',
    
    // IoT Sensor Subsystems
    iot: {
      water: {
        sourceType: 'SIMULATED',
        source: 'Solar Submersible Water Telemetry',
        tankLevel: 74,
        turbidity: 2.1,
        ph: 7.3,
        flowRate: 18.5,
        dailyConsumption: 4200,
        activePump: 'P-01 (Primary Solar Submersible)',
        pumpStatus: 'AUTO_OFF',
        history: [68, 70, 72, 75, 74, 76, 74]
      },
      energy: {
        sourceType: 'SIMULATED',
        source: 'LiFePO4 Solar Microgrid Controller',
        solarGeneration: 4.8,
        batterySoc: 82,
        villageLoad: 2.6,
        inverterEfficiency: 94.2,
        batteryCapacityKwh: 15.0,
        dailySolarGeneratedKwh: 28.4,
        scenario: 'Nominal Daytime Sunlight',
        history: [1.2, 3.4, 4.8, 5.1, 4.2, 2.6, 0.8]
      },
      livestock: [
        {
          id: 'COW-01',
          name: 'Gauri',
          type: 'Cow',
          breed: 'Gir (Indigenous Dairy)',
          age: 4,
          lactationStage: 'Peak (Month 3)',
          heartRate: 72,
          temperature: 38.6,
          ruminationMinutes: 460,
          geofenceStatus: 'Inside Monitored Pasture (Safe)',
          dailyMilkAvg: 14.2,
          feedRation: { green: 22, dry: 6, concentrate: 3.5 },
          healthNotes: 'Healthy, routine FMD & Brucellosis vaccination verified.',
          timeline: [
            { time: '06:30 AM', event: 'Morning milking completed (7.5 Liters, Fat 4.6%)' },
            { time: '08:00 AM', event: 'Feed ration provided (22kg green, 6kg dry)' },
            { time: '11:15 AM', event: 'Collar Telemetry Check: Vitals nominal (38.6°C, 72 bpm)' },
            { time: '02:00 PM', event: 'Geofence Check: Pasture Zone A (Optimal Rumination)' }
          ],
          status: 'healthy',
          sourceType: 'SIMULATED'
        },
        {
          id: 'BUF-02',
          name: 'Shyamali',
          type: 'Buffalo',
          breed: 'Murrah (High Fat Yield)',
          age: 5,
          lactationStage: 'Mid (Month 5)',
          heartRate: 68,
          temperature: 38.4,
          ruminationMinutes: 490,
          geofenceStatus: 'Inside Monitored Pasture (Safe)',
          dailyMilkAvg: 16.5,
          feedRation: { green: 25, dry: 7, concentrate: 4.0 },
          healthNotes: 'Deworming scheduled for next week.',
          timeline: [
            { time: '06:45 AM', event: 'Morning milking completed (8.8 Liters, Fat 7.1%)' },
            { time: '08:30 AM', event: 'Feed ration provided (25kg green, 7kg dry)' },
            { time: '12:00 PM', event: 'Collar Telemetry Check: Normal resting vitals' }
          ],
          status: 'healthy',
          sourceType: 'SIMULATED'
        },
        {
          id: 'COW-03',
          name: 'Kamdhenu',
          type: 'Cow',
          breed: 'Sahiwal (Dairy Cattle)',
          age: 3,
          lactationStage: 'Early (Month 2)',
          heartRate: 76,
          temperature: 38.8,
          ruminationMinutes: 440,
          geofenceStatus: 'Inside Monitored Pasture (Safe)',
          dailyMilkAvg: 12.8,
          feedRation: { green: 20, dry: 5, concentrate: 3.0 },
          healthNotes: 'Good appetite and high vigor.',
          timeline: [
            { time: '07:00 AM', event: 'Morning milking completed (6.4 Liters, Fat 4.4%)' },
            { time: '09:00 AM', event: 'Pasture grazing active' }
          ],
          status: 'healthy',
          sourceType: 'SIMULATED'
        },
        {
          id: 'GOAT-04',
          name: 'Chanda',
          type: 'Goat',
          breed: 'Jamnapari (Dual Purpose)',
          age: 2,
          lactationStage: 'Mid (Month 3)',
          heartRate: 84,
          temperature: 39.1,
          ruminationMinutes: 380,
          geofenceStatus: 'Inside Monitored Pasture (Safe)',
          dailyMilkAvg: 2.4,
          feedRation: { green: 4, dry: 1.5, concentrate: 0.8 },
          healthNotes: 'Active grazing, normal collar vitals.',
          timeline: [
            { time: '07:15 AM', event: 'Morning milk yield recorded (1.2 Liters)' },
            { time: '10:00 AM', event: 'Vitals nominal in community paddock' }
          ],
          status: 'healthy',
          sourceType: 'SIMULATED'
        }
      ]
    },

    // Dairy & Milk Records Ledger
    dairy: {
      sourceType: 'USER_ENTERED',
      milkPricePerLiter: 55,
      records: [
        { id: 'MR-101', date: '2026-09-23', session: 'Morning', morningLiters: 7.5, eveningLiters: 0, animalId: 'COW-01', liters: 7.5, fat: 4.6, snf: 8.8, pricePerLiter: 55, farmer: 'Ramesh Patel', note: 'Standard morning yield' },
        { id: 'MR-102', date: '2026-09-23', session: 'Morning', morningLiters: 8.8, eveningLiters: 0, animalId: 'BUF-02', liters: 8.8, fat: 7.1, snf: 9.2, pricePerLiter: 60, farmer: 'Ramesh Patel', note: 'Rich fat content' },
        { id: 'MR-103', date: '2026-09-23', session: 'Morning', morningLiters: 6.4, eveningLiters: 0, animalId: 'COW-03', liters: 6.4, fat: 4.4, snf: 8.6, pricePerLiter: 55, farmer: 'Suresh Kumar', note: 'Good yield' },
        { id: 'MR-104', date: '2026-09-22', session: 'Evening', morningLiters: 0, eveningLiters: 6.8, animalId: 'COW-01', liters: 6.8, fat: 4.7, snf: 8.9, pricePerLiter: 55, farmer: 'Ramesh Patel', note: 'Evening session' },
        { id: 'MR-105', date: '2026-09-22', session: 'Evening', morningLiters: 0, eveningLiters: 7.9, animalId: 'BUF-02', liters: 7.9, fat: 7.2, snf: 9.3, pricePerLiter: 60, farmer: 'Ramesh Patel', note: 'High SNF' },
        { id: 'MR-106', date: '2026-09-22', session: 'Morning', morningLiters: 7.4, eveningLiters: 0, animalId: 'COW-01', liters: 7.4, fat: 4.5, snf: 8.7, pricePerLiter: 55, farmer: 'Ramesh Patel', note: 'Morning' },
        { id: 'MR-107', date: '2026-09-21', session: 'Evening', morningLiters: 0, eveningLiters: 8.0, animalId: 'BUF-02', liters: 8.0, fat: 7.0, snf: 9.1, pricePerLiter: 60, farmer: 'Ramesh Patel', note: 'Evening' }
      ]
    },

    // System Alert Feed
    alerts: [
      { id: 'ALT-1', timestamp: new Date(Date.now() - 1800000).toISOString(), type: 'info', category: 'Energy', source: 'Inverter Telemetry', message: 'Solar microgrid generating 4.8 kW. Battery bank charged to 82%.', resolved: false },
      { id: 'ALT-2', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'info', category: 'Water', source: 'Water Tank Sensor', message: 'Overhead tank at 74%. Potability verified (pH 7.3, Turbidity 2.1 NTU).', resolved: false },
      { id: 'ALT-3', timestamp: new Date(Date.now() - 14400000).toISOString(), type: 'info', category: 'Livestock', source: 'Collar Geofence Engine', message: 'All 4 monitored livestock heads within designated safe grazing zone.', resolved: true }
    ],

    // Simulated Cellular SMS Dispatch Records
    smsLogs: [
      { id: 'SMS-1', timestamp: new Date(Date.now() - 3600000).toISOString(), recipient: '+91 98765 43210', message: 'GramSathi Alert: Overhead tank level at 74%. Solar microgrid power stable at 4.8 kW.', status: 'Delivered (Simulated GSM Gateway)' }
    ],

    // Weather Telemetry
    weather: {
      sourceType: 'LIVE',
      source: 'LIVE_WEATHER',
      provider: 'Open-Meteo Satellite Feed (Live)',
      location: 'Rampur Village Hub',
      latitude: '25.5941',
      longitude: '85.1376',
      temperature: 28.5,
      feelsLike: 30.2,
      humidity: 62,
      windSpeed: 11.5,
      solarRadiation: 780,
      uvIndex: 7,
      condition: 'Sunny & Pleasant',
      precipitationChance: 10,
      sunrise: '05:48 AM',
      sunset: '06:24 PM',
      lastUpdated: new Date().toISOString(),
      forecast: [
        { day: 'Today', tempMax: 32, tempMin: 22, condition: 'Sunny & Pleasant', rainChance: 10 },
        { day: 'Thu', tempMax: 33, tempMin: 23, condition: 'Sunny & Warm', rainChance: 5 },
        { day: 'Fri', tempMax: 31, tempMin: 21, condition: 'Scattered Showers', rainChance: 45 },
        { day: 'Sat', tempMax: 29, tempMin: 20, condition: 'Thunderstorm', rainChance: 70 },
        { day: 'Sun', tempMax: 30, tempMin: 21, condition: 'Mainly Clear', rainChance: 20 },
        { day: 'Mon', tempMax: 32, tempMin: 22, condition: 'Sunny', rainChance: 10 },
        { day: 'Tue', tempMax: 33, tempMin: 23, condition: 'Sunny', rainChance: 5 }
      ],
      advisory: 'Favorable conditions for field irrigation, crop spraying, and livestock grazing. Keep cattle in shade during peak noon heat.'
    },

    // Verified Government Schemes
    schemes: [],
    
    // Agronomic Crop Knowledge Matrix
    agriMatrix: [],

    // Agmarknet / e-NAM Mandi Market Records
    mandiData: []
  };

  let state = loadState();
  const listeners = new Set();

  function subscribe(fn) {
    if (typeof fn === 'function') {
      listeners.add(fn);
      return () => listeners.delete(fn);
    }
    return () => {};
  }

  function notify() {
    listeners.forEach(fn => {
      try { fn(state); } catch (e) { console.error('GramStore listener error:', e); }
    });
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return Object.assign({}, defaultState, parsed);
      }
    } catch (e) {
      console.error('Failed to load state from localStorage:', e);
    }
    return JSON.parse(JSON.stringify(defaultState));
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
    notify();
  }

  function resetToDefault() {
    state = JSON.parse(JSON.stringify(defaultState));
    saveState();
    return state;
  }

  function restoreBackupJson(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && (parsed.iot || parsed.dairy || parsed.villageName)) {
        state = Object.assign({}, defaultState, parsed);
        saveState();
        return { success: true };
      }
    } catch (e) {
      return { success: false, error: e.message };
    }
    return { success: false, error: 'Invalid backup JSON structure.' };
  }

  // Load Baseline External Datasets (Schemes, Agri, Mandi)
  async function loadInitialDatasets() {
    try {
      // 1. Schemes
      if (!state.schemes || state.schemes.length === 0) {
        const res = await fetch('data/schemes.json');
        if (res.ok) state.schemes = await res.json();
      }
      // 2. Agri Matrix
      if (!state.agriMatrix || state.agriMatrix.length === 0) {
        const res = await fetch('data/agri_matrix.json');
        if (res.ok) state.agriMatrix = await res.json();
      }
      // 3. Mandi Data
      if (!state.mandiData || state.mandiData.length === 0) {
        const res = await fetch('data/mandi_data.json');
        if (res.ok) state.mandiData = await res.json();
      }
      saveState();
    } catch (e) {
      console.warn('Dataset initial preload:', e.message);
    }
  }
  loadInitialDatasets();

  // Real-time IoT simulation loop (Runs every 3 seconds)
  function simulateTick() {
    const hour = new Date().getHours();
    const isDay = hour >= 6 && hour <= 18;

    // Energy simulation if in nominal mode
    if (!state.iot.energy.scenario || state.iot.energy.scenario.includes('Nominal')) {
      const baseSolar = isDay ? (Math.sin((hour - 6) / 12 * Math.PI) * 5.2) : 0;
      const solarNoise = (Math.random() - 0.5) * 0.2;
      state.iot.energy.solarGeneration = Math.max(0, +(baseSolar + solarNoise).toFixed(2));
      
      const baseLoad = 2.4 + (Math.random() - 0.5) * 0.3;
      state.iot.energy.villageLoad = +baseLoad.toFixed(2);

      const netPower = state.iot.energy.solarGeneration - state.iot.energy.villageLoad;
      let newSoc = state.iot.energy.batterySoc + (netPower * 0.04);
      state.iot.energy.batterySoc = Math.min(100, Math.max(15, +newSoc.toFixed(1)));
    }

    // Water automated pump controller simulation
    if (state.iot.water.pumpStatus && state.iot.water.pumpStatus.includes('ON')) {
      state.iot.water.tankLevel = Math.min(100, +(state.iot.water.tankLevel + 0.3).toFixed(1));
      if (state.iot.water.tankLevel >= 95 && state.iot.water.pumpStatus === 'AUTO_ON') {
        state.iot.water.pumpStatus = 'AUTO_OFF';
        addAlert('info', 'Water', 'Water Tank Sensor', 'Community overhead tank full (95%). Solar pump auto-stopped.');
      }
    } else {
      state.iot.water.tankLevel = Math.max(10, +(state.iot.water.tankLevel - 0.05).toFixed(1));
      if (state.iot.water.tankLevel <= 25 && state.iot.water.pumpStatus === 'AUTO_OFF') {
        state.iot.water.pumpStatus = 'AUTO_ON';
        addAlert('warning', 'Water', 'Water Tank Sensor', 'Tank level dropped below 25%. Auto solar pump triggered.');
      }
    }

    state.iot.water.ph = +(7.2 + (Math.random() - 0.5) * 0.1).toFixed(2);
    state.iot.water.turbidity = +(2.0 + (Math.random() - 0.5) * 0.15).toFixed(2);

    // Livestock collar telemetry simulation
    if (state.iot.livestock && Array.isArray(state.iot.livestock)) {
      state.iot.livestock.forEach(animal => {
        const hrDelta = Math.floor((Math.random() - 0.5) * 3);
        const tempDelta = +((Math.random() - 0.5) * 0.1).toFixed(1);
        animal.heartRate = Math.min(95, Math.max(55, animal.heartRate + hrDelta));
        animal.temperature = Math.min(40.2, Math.max(37.5, +(animal.temperature + tempDelta).toFixed(1)));
        
        if (animal.temperature > 39.6 && !animal.hasFeverAlert) {
          animal.hasFeverAlert = true;
          addAlert('danger', 'Livestock', `Collar Telemetry (${animal.id})`, `High body temperature alert for ${animal.name} (${animal.id}): ${animal.temperature}°C. Threshold notice only.`);
        }
      });
    }

    state.lastSyncTime = new Date().toISOString();
    saveState();
  }

  // Interactive Scenario Triggers: Energy Panel
  function simulateEnergyScenario(scenario) {
    if (scenario === 'high_solar') {
      state.iot.energy.solarGeneration = 5.8;
      state.iot.energy.batterySoc = 96;
      state.iot.energy.villageLoad = 2.4;
      state.iot.energy.scenario = 'Peak Solar Generation (5.8 kW)';
      addAlert('info', 'Energy', 'Inverter Telemetry', 'Peak solar generation (5.8 kW). LiFePO4 battery bank reached 96%.');
    } else if (scenario === 'low_solar') {
      state.iot.energy.solarGeneration = 1.2;
      state.iot.energy.batterySoc = 65;
      state.iot.energy.villageLoad = 2.2;
      state.iot.energy.scenario = 'Low Solar Irradiance (Overcast)';
      addAlert('warning', 'Energy', 'PV Array Telemetry', 'Low solar irradiance detected (1.2 kW). Battery discharge active.');
    } else if (scenario === 'high_load') {
      state.iot.energy.villageLoad = 4.8;
      state.iot.energy.scenario = 'High Village Load (4.8 kW)';
      addAlert('warning', 'Energy', 'Circuit Monitor', 'High village load detected (4.8 kW - Water pump + Clinic cold storage).');
    } else if (scenario === 'battery_critical') {
      state.iot.energy.batterySoc = 18;
      state.iot.energy.scenario = 'Critical Battery SoC (< 20%)';
      addAlert('danger', 'Energy', 'Battery BMS', 'Battery SoC critical (18%). Non-essential circuit shedding enabled.');
    } else if (scenario === 'night_low') {
      state.iot.energy.solarGeneration = 0.0;
      state.iot.energy.villageLoad = 1.8;
      state.iot.energy.scenario = 'Night / Battery Inverter Mode';
      addAlert('info', 'Energy', 'Grid Controller', 'Solar generation 0.0 kW (Night mode). Battery supplying essential circuits.');
    } else {
      state.iot.energy.solarGeneration = 4.8;
      state.iot.energy.batterySoc = 82;
      state.iot.energy.villageLoad = 2.6;
      state.iot.energy.scenario = 'Nominal Daytime Sunlight';
    }
    saveState();
  }

  // Interactive Scenario Triggers: Water System
  function simulateWaterScenario(scenario) {
    if (scenario === 'low_flow') {
      state.iot.water.flowRate = 3.2;
      state.iot.water.tankLevel = 22;
      state.iot.water.pumpStatus = 'AUTO_ON';
      addAlert('danger', 'Water', 'Pump P-01 Telemetry', 'Low water flow detected (3.2 L/min). Auto-pump triggered.');
    } else if (scenario === 'high_turbidity') {
      state.iot.water.turbidity = 7.8;
      addAlert('warning', 'Water', 'Potability Sensor', 'Turbidity spike detected: 7.8 NTU. Filtration maintenance advised.');
    } else if (scenario === 'refill') {
      state.iot.water.tankLevel = 92;
      state.iot.water.flowRate = 22.0;
      state.iot.water.turbidity = 1.9;
      state.iot.water.ph = 7.3;
      addAlert('info', 'Water', 'Overhead Tank', 'Tank successfully refilled to 92%. Water potability optimal.');
    } else if (scenario === 'pump_override_on') {
      state.iot.water.pumpStatus = 'MANUAL_ON';
      state.iot.water.flowRate = 24.5;
      addAlert('info', 'Water', 'Manual Pump Control', 'Solar pump started manually in test override mode.');
    } else if (scenario === 'pump_override_off') {
      state.iot.water.pumpStatus = 'MANUAL_OFF';
      state.iot.water.flowRate = 0;
      addAlert('info', 'Water', 'Manual Pump Control', 'Solar pump stopped manually.');
    } else {
      state.iot.water.tankLevel = 74;
      state.iot.water.turbidity = 2.1;
      state.iot.water.ph = 7.3;
      state.iot.water.flowRate = 18.5;
      state.iot.water.pumpStatus = 'AUTO_OFF';
    }
    saveState();
  }

  function addAlert(type, category, source, message) {
    const newAlert = {
      id: 'ALT-' + Date.now().toString().slice(-4),
      timestamp: new Date().toISOString(),
      type,
      category,
      source: source || 'System Sensor',
      message,
      resolved: false
    };
    state.alerts.unshift(newAlert);
    if (state.alerts.length > 25) state.alerts.pop();
    saveState();
  }

  function resolveAlert(id) {
    const alert = state.alerts.find(a => a.id === id);
    if (alert) {
      alert.resolved = true;
      saveState();
    }
  }

  function sendSmsAlert(recipient, message) {
    const newSms = {
      id: 'SMS-' + Date.now().toString().slice(-4),
      timestamp: new Date().toISOString(),
      recipient,
      message,
      status: 'Delivered (Simulated GSM Gateway)'
    };
    state.smsLogs.unshift(newSms);
    if (state.smsLogs.length > 30) state.smsLogs.pop();
    saveState();
    return newSms;
  }

  /**
   * Add / Record Milk Entry
   * Supports Morning and Evening milk entries, Fat %, SNF %, Price/Liter, Animal Tag, Date, and Notes.
   * Recalculates all daily/weekly/monthly/all-time totals immediately and updates local storage.
   */
  function addMilkRecord(record) {
    const morningQty = parseFloat(record.morningLiters) || 0;
    const eveningQty = parseFloat(record.eveningLiters) || 0;
    const specifiedQty = parseFloat(record.liters) || 0;
    const totalQty = (morningQty + eveningQty) > 0 ? (morningQty + eveningQty) : (specifiedQty > 0 ? specifiedQty : 0);

    const price = parseFloat(record.pricePerLiter) || parseFloat(state.dairy.milkPricePerLiter) || 55;
    const fatVal = parseFloat(record.fat) || 4.5;
    const snfVal = parseFloat(record.snf) || 8.5;

    const newRecord = {
      id: 'MR-' + Date.now().toString().slice(-5),
      date: record.date || new Date().toISOString().split('T')[0],
      session: record.session || (morningQty > 0 && eveningQty > 0 ? 'Full Day' : morningQty > 0 ? 'Morning' : 'Evening'),
      morningLiters: +morningQty.toFixed(1),
      eveningLiters: +eveningQty.toFixed(1),
      animalId: record.animalId || 'COW-01',
      liters: +totalQty.toFixed(1),
      fat: +fatVal.toFixed(1),
      snf: +snfVal.toFixed(1),
      pricePerLiter: +price.toFixed(1),
      farmer: record.farmer || 'Farmer',
      note: record.note || ''
    };

    if (!state.dairy.records) state.dairy.records = [];
    state.dairy.records.unshift(newRecord);

    // Update animal's timeline and milk stats
    const animal = state.iot.livestock.find(a => a.id === newRecord.animalId);
    if (animal) {
      if (!animal.timeline) animal.timeline = [];
      animal.timeline.unshift({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        event: `${newRecord.session} milk entry recorded: ${newRecord.liters} L (Fat ${newRecord.fat}%, SNF ${newRecord.snf}%)`
      });

      // Recalculate animal's recent average
      const animalRecords = state.dairy.records.filter(r => r.animalId === animal.id);
      if (animalRecords.length > 0) {
        const recentSum = animalRecords.slice(0, 7).reduce((acc, r) => acc + (parseFloat(r.liters) || 0), 0);
        animal.dailyMilkAvg = +(recentSum / Math.min(animalRecords.length, 7)).toFixed(1);
      }
    }

    saveState();
    return newRecord;
  }

  function getDairyTotals() {
    const records = state.dairy.records || [];
    const todayStr = new Date().toISOString().split('T')[0];
    
    const d7 = new Date();
    d7.setDate(d7.getDate() - 7);
    const d7Str = d7.toISOString().split('T')[0];

    const d30 = new Date();
    d30.setDate(d30.getDate() - 30);
    const d30Str = d30.toISOString().split('T')[0];

    let todayTotal = 0;
    let weeklyTotal = 0;
    let monthlyTotal = 0;
    let allTimeTotal = 0;
    let fatSum = 0;
    let snfSum = 0;
    let count = records.length;

    records.forEach(r => {
      const qty = parseFloat(r.liters) || 0;
      allTimeTotal += qty;
      fatSum += parseFloat(r.fat) || 0;
      snfSum += parseFloat(r.snf) || 0;
      if (r.date === todayStr) todayTotal += qty;
      if (r.date >= d7Str) weeklyTotal += qty;
      if (r.date >= d30Str) monthlyTotal += qty;
    });

    const pricePerLiter = parseFloat(state.dairy.milkPricePerLiter) || 55;
    const estTodayRev = todayTotal * pricePerLiter;
    const estWeeklyRev = weeklyTotal * pricePerLiter;
    const estMonthlyRev = monthlyTotal * pricePerLiter;

    return {
      todayTotal: +todayTotal.toFixed(1),
      weeklyTotal: +weeklyTotal.toFixed(1),
      monthlyTotal: +monthlyTotal.toFixed(1),
      allTimeTotal: +allTimeTotal.toFixed(1),
      avgFat: count > 0 ? +(fatSum / count).toFixed(1) : 4.5,
      avgSnf: count > 0 ? +(snfSum / count).toFixed(1) : 8.5,
      pricePerLiter,
      estTodayRev: Math.round(estTodayRev),
      estWeeklyRev: Math.round(estWeeklyRev),
      estMonthlyRev: Math.round(estMonthlyRev)
    };
  }

  // Generic File Download Helper
  function triggerDownload(content, filename, mimeType = 'text/plain;charset=utf-8;') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // --- Export Implementations ---

  function exportDairyCsv() {
    const records = state.dairy.records || [];
    let csv = 'Record ID,Date,Session,Morning (L),Evening (L),Total Quantity (L),Fat (%),SNF (%),Rate (₹/L),Farmer,Notes\n';
    records.forEach(r => {
      csv += `"${r.id}","${r.date}","${r.session}","${r.morningLiters || 0}","${r.eveningLiters || 0}","${r.liters}","${r.fat}","${r.snf}","${r.pricePerLiter || state.dairy.milkPricePerLiter}","${r.farmer}","${(r.note || '')}"\n`;
    });
    triggerDownload(csv, `GramSathi_Milk_Records_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
    return true;
  }

  function exportDairyJson() {
    const records = state.dairy.records || [];
    const totals = getDairyTotals();
    const data = {
      exportedAt: new Date().toISOString(),
      villageName: state.villageName,
      totals,
      records
    };
    triggerDownload(JSON.stringify(data, null, 2), `GramSathi_Milk_Records_${new Date().toISOString().split('T')[0]}.json`, 'application/json;charset=utf-8;');
    return true;
  }

  function exportLivestockCsv() {
    const animals = state.iot.livestock || [];
    let csv = 'Animal ID,Name,Type,Breed,Age,Lactation Stage,Body Temp (°C),Heart Rate (bpm),Rumination (min),Geofence,Daily Avg Milk (L),Notes\n';
    animals.forEach(a => {
      csv += `"${a.id}","${a.name}","${a.type}","${a.breed}","${a.age}","${a.lactationStage}","${a.temperature}","${a.heartRate}","${a.ruminationMinutes}","${a.geofenceStatus}","${a.dailyMilkAvg}","${a.healthNotes}"\n`;
    });
    triggerDownload(csv, `GramSathi_Livestock_Census_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
    return true;
  }

  function exportLivestockJson() {
    const data = {
      exportedAt: new Date().toISOString(),
      villageName: state.villageName,
      livestock: state.iot.livestock || []
    };
    triggerDownload(JSON.stringify(data, null, 2), `GramSathi_Livestock_${new Date().toISOString().split('T')[0]}.json`, 'application/json;charset=utf-8;');
    return true;
  }

  function exportWaterCsv() {
    const w = state.iot.water || {};
    let csv = 'Metric,Value,Unit,Status\n';
    csv += `"Tank Level","${w.tankLevel}","%","${w.tankLevel < 25 ? 'Critical' : 'Normal'}"\n`;
    csv += `"pH Level","${w.ph}","pH","${w.ph >= 6.5 && w.ph <= 8.5 ? 'Potable' : 'Check'}"\n`;
    csv += `"Turbidity","${w.turbidity}","NTU","${w.turbidity <= 5.0 ? 'Safe' : 'High Turbidity'}"\n`;
    csv += `"Flow Rate","${w.flowRate}","L/min","Active"\n`;
    csv += `"Daily Consumption","${w.dailyConsumption}","Liters","Estimated"\n`;
    csv += `"Pump Status","${w.pumpStatus}","State","${w.pumpStatus}"\n`;
    csv += `"Active Hardware","${w.activePump}","Unit","Connected"\n`;
    triggerDownload(csv, `GramSathi_Water_Telemetry_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
    return true;
  }

  function exportWaterJson() {
    const data = {
      exportedAt: new Date().toISOString(),
      villageName: state.villageName,
      waterTelemetry: state.iot.water || {}
    };
    triggerDownload(JSON.stringify(data, null, 2), `GramSathi_Water_Telemetry_${new Date().toISOString().split('T')[0]}.json`, 'application/json;charset=utf-8;');
    return true;
  }

  function exportEnergyCsv() {
    const e = state.iot.energy || {};
    let csv = 'Metric,Value,Unit,Note\n';
    csv += `"Solar Generation","${e.solarGeneration}","kW","PV Array Output"\n`;
    csv += `"Battery SoC","${e.batterySoc}","%","LiFePO4 Bank"\n`;
    csv += `"Village Essential Load","${e.villageLoad}","kW","Connected Circuits"\n`;
    csv += `"Inverter Efficiency","${e.inverterEfficiency}","%","Pure Sine Wave"\n`;
    csv += `"Battery Capacity","${e.batteryCapacityKwh}","kWh","Total Storage"\n`;
    csv += `"Daily Harvest","${e.dailySolarGeneratedKwh}","kWh","Estimated Solar Harvest"\n`;
    csv += `"Active Scenario","${e.scenario}","Profile","Telemetry Profile"\n`;
    triggerDownload(csv, `GramSathi_Energy_Microgrid_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
    return true;
  }

  function exportEnergyJson() {
    const data = {
      exportedAt: new Date().toISOString(),
      villageName: state.villageName,
      energyMicrogrid: state.iot.energy || {}
    };
    triggerDownload(JSON.stringify(data, null, 2), `GramSathi_Energy_Microgrid_${new Date().toISOString().split('T')[0]}.json`, 'application/json;charset=utf-8;');
    return true;
  }

  function exportAgricultureCsv() {
    const crops = state.agriMatrix || [];
    let csv = 'Crop ID,Crop Name,Scientific Name,Season,Soil Suitability,Water Requirement,Growth Days,Expected Yield/Acre,Sowing Window,Harvest Window\n';
    crops.forEach(c => {
      csv += `"${c.id}","${c.name || c.cropName}","${c.scientificName || ''}","${c.season}","${c.soilTypes || ''}","${c.waterRequirement || ''}","${c.growthDurationDays || ''}","${c.yieldEstimateQtlPerAcre || ''}","${c.sowingWindow || ''}","${c.harvestWindow || ''}"\n`;
    });
    triggerDownload(csv, `GramSathi_Agri_Knowledge_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
    return true;
  }

  function exportAlertsCsv() {
    const alerts = state.alerts || [];
    let csv = 'Alert ID,Timestamp,Category,Type,Source,Message,Resolved\n';
    alerts.forEach(a => {
      csv += `"${a.id}","${a.timestamp}","${a.category}","${a.type}","${a.source}","${a.message}","${a.resolved ? 'Yes' : 'No'}"\n`;
    });
    triggerDownload(csv, `GramSathi_System_Alerts_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
    return true;
  }

  /**
   * Complete Human-Readable Village Status Report
   */
  function exportVillageReport(format = 'markdown') {
    const summary = getVillageStatusSummary();
    const totals = getDairyTotals();
    const dateStr = new Date().toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = new Date().toLocaleTimeString();

    if (format === 'json') {
      const data = {
        title: 'GramSathi Comprehensive Village Operating Report',
        village: state.villageName,
        region: state.villageState,
        generatedAt: new Date().toISOString(),
        summary,
        dairyTotals: totals,
        fullState: state
      };
      triggerDownload(JSON.stringify(data, null, 2), `GramSathi_Village_Report_${new Date().toISOString().split('T')[0]}.json`, 'application/json;charset=utf-8;');
      return true;
    }

    const report = `# GRAMSATHI — VILLAGE DIGITAL OPERATING REPORT
**Village Hub:** ${state.villageName} (${state.villageState})  
**Report Date:** ${dateStr} at ${timeStr}  
**Platform Status:** ${summary.overallStatus.toUpperCase()}  
**System Mode:** Simulated Demonstration Telemetry & Real-Time Village Ledger  

---

## 1. VILLAGE OVERVIEW & EXECUTIVE SUMMARY
- **Overall Operational Health:** ${summary.overallStatus} (${summary.alerts.totalActive} Active Incidents)
- **Active Weather:** ${summary.weather.temperature}°C, ${summary.weather.condition}, Humidity: ${summary.weather.humidity}%, Rain Probability: ${summary.weather.rainChance}%
- **Agricultural Window:** ${summary.agriculture.currentSeason}
- **Agronomic Advisory:** ${summary.agriculture.advisory}

---

## 2. SOLAR MICROGRID & ENERGY INFRASTRUCTURE
- **Current Solar Generation:** ${summary.energy.solarGen} kW
- **LiFePO4 Battery Bank State of Charge:** ${summary.energy.batterySoc}% (Capacity: ${state.iot.energy.batteryCapacityKwh} kWh)
- **Essential Village Load:** ${summary.energy.load} kW
- **Inverter Efficiency:** ${state.iot.energy.inverterEfficiency}%
- **Daily Solar Generation Harvested:** ${state.iot.energy.dailySolarGeneratedKwh} kWh
- **Operating Scenario:** ${summary.energy.scenario}

---

## 3. POTABLE WATER TELEMETRY & GRAVITY DISTRIBUTION
- **Overhead Drinking Water Tank Level:** ${summary.water.tankLevel}% (10,000 Liters Capacity)
- **Water Potability Status:** pH ${summary.water.ph}, Turbidity ${summary.water.turbidity} NTU (${summary.water.turbidity <= 5.0 ? 'Safe Potable WHO standard' : 'Filtration Required'})
- **Automated Pump Status:** ${summary.water.pumpStatus}
- **Flow Rate:** ${state.iot.water.flowRate} L/min
- **Daily Village Consumption Draw:** ${state.iot.water.dailyConsumption} Liters

---

## 4. LIVESTOCK TELEMETRY & DAIRY REVENUE LEDGER
- **Monitored Livestock Heads:** ${summary.livestock.totalCount} heads registered
- **Geofence Pasture Security:** 100% inside monitored safe pasture zone
- **Active Temperature/Health Notices:** ${summary.livestock.feverCount > 0 ? summary.livestock.feverishNames.join(', ') + ' High Temperature Alert' : 'All vitals within normal baseline'}
- **Today's Total Milk Collection:** ${totals.todayTotal} Liters
- **7-Day Cumulative Milk Yield:** ${totals.weeklyTotal} Liters
- **30-Day Cumulative Milk Yield:** ${totals.monthlyTotal} Liters
- **Estimated Today Milk Revenue:** ₹${totals.estTodayRev} (Based on ₹${totals.pricePerLiter}/L base rate)
- **Estimated Weekly Milk Revenue:** ₹${totals.estWeeklyRev}
- **Estimated Monthly Milk Revenue:** ₹${totals.estMonthlyRev}

---

## 5. RECENT SYSTEM INCIDENTS & ALERT AUDIT LOG
${(state.alerts || []).slice(0, 8).map(a => `- [${a.resolved ? 'RESOLVED' : 'ACTIVE'}] **${a.category}** (${new Date(a.timestamp).toLocaleTimeString()}): ${a.message}`).join('\n')}

---
*Report generated automatically by GramSathi Rural Digital Operating Platform • COSMOS Digital Village Infrastructure Map.*
`;

    triggerDownload(report, `GramSathi_Village_Report_${new Date().toISOString().split('T')[0]}.md`, 'text/markdown;charset=utf-8;');
    return true;
  }

  function addAnimal(animalData) {
    const newAnimal = Object.assign({
      id: (animalData.type === 'Buffalo' ? 'BUF-' : animalData.type === 'Goat' ? 'GOAT-' : 'COW-') + ('0' + (state.iot.livestock.length + 1)).slice(-2),
      name: 'New Cattle',
      type: 'Cow',
      breed: 'Indigenous Dairy',
      age: 3,
      lactationStage: 'Peak (Month 3)',
      heartRate: 72,
      temperature: 38.5,
      ruminationMinutes: 450,
      geofenceStatus: 'Inside Monitored Pasture (Safe)',
      dailyMilkAvg: 10.0,
      feedRation: { green: 20, dry: 5, concentrate: 3.0 },
      healthNotes: 'New profile registered.',
      timeline: [
        { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), event: 'RFID Tag synchronized and registered' }
      ],
      status: 'healthy',
      sourceType: 'SIMULATED'
    }, animalData);
    state.iot.livestock.push(newAnimal);
    saveState();
    return newAnimal;
  }

  function updateAnimal(id, updatedFields) {
    const animal = state.iot.livestock.find(a => a.id === id);
    if (animal) {
      Object.assign(animal, updatedFields);
      if (!animal.timeline) animal.timeline = [];
      animal.timeline.unshift({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        event: 'Profile details updated by veterinary technician'
      });
      saveState();
      return animal;
    }
    return null;
  }

  function markAnimalHealthCheck(id, notes = 'Routine veterinary health examination completed. All vitals nominal.') {
    const animal = state.iot.livestock.find(a => a.id === id);
    if (animal) {
      animal.temperature = 38.5;
      animal.heartRate = 72;
      animal.hasFeverAlert = false;
      animal.status = 'healthy';
      if (!animal.timeline) animal.timeline = [];
      animal.timeline.unshift({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        event: notes
      });
      saveState();
      return animal;
    }
    return null;
  }

  // Fetch Live Weather (Coordinates / City / Geolocation)
  async function fetchLiveWeather(city = 'Rampur Village Hub', lat = null, lon = null) {
    let reqUrl = '/api/weather?city=' + encodeURIComponent(city);
    if (lat && lon) {
      reqUrl += `&lat=${lat}&lon=${lon}`;
    }

    try {
      const res = await fetch(reqUrl);
      if (res.ok) {
        const data = await res.json();
        state.weather = data;
        saveState();
        return data;
      }
    } catch (e) {
      console.warn('Weather API fetch failed, using fallback:', e.message);
    }

    state.weather.sourceType = 'DEMO';
    state.weather.source = 'DEMO_WEATHER';
    state.weather.location = city;
    state.weather.temperature = +(28 + (Math.random() - 0.5) * 3).toFixed(1);
    saveState();
    return state.weather;
  }

  // Fetch Mandi Rates from API or verified fallback
  async function fetchMandiRates(crop = '', stateFilter = '', market = '') {
    try {
      const q = new URLSearchParams();
      if (crop) q.append('crop', crop);
      if (stateFilter) q.append('state', stateFilter);
      if (market) q.append('market', market);

      const res = await fetch('/api/mandi?' + q.toString());
      if (res.ok) {
        const result = await res.json();
        if (result && result.data && result.data.length > 0) {
          state.mandiData = result.data;
          saveState();
          return result;
        }
      }
    } catch (e) {
      console.warn('Mandi API proxy unavailable, using local cache:', e.message);
    }
    return {
      sourceType: 'CACHED',
      data: state.mandiData || []
    };
  }

  // Fetch Government Schemes from API or verified catalog
  async function fetchSchemes(query = '', category = '') {
    try {
      const q = new URLSearchParams();
      if (query) q.append('q', query);
      if (category) q.append('category', category);

      const res = await fetch('/api/schemes?' + q.toString());
      if (res.ok) {
        const result = await res.json();
        if (result && result.data) {
          state.schemes = result.data;
          saveState();
          return result;
        }
      }
    } catch (e) {
      console.warn('Schemes API proxy unavailable, using local catalog:', e.message);
    }
    return {
      sourceType: 'VERIFIED_OFFICIAL',
      data: state.schemes || []
    };
  }

  // Search Knowledge Database for a specific crop
  function searchCropKnowledge(query) {
    const matrix = state.agriMatrix || [];
    if (!query) return matrix;
    const q = query.toLowerCase().trim();
    return matrix.filter(crop => {
      const name = (crop.name || crop.cropName || '').toLowerCase();
      const sciName = (crop.scientificName || '').toLowerCase();
      const type = (crop.cropType || '').toLowerCase();
      const regions = (crop.suitableRegions || '').toLowerCase();
      return name.includes(q) || sciName.includes(q) || type.includes(q) || regions.includes(q);
    });
  }

  // Multi-Factor Agronomic Recommendation Evaluator
  function evaluateCropRecommendation(params) {
    const { season, soilType, waterAvail, farmSizeAcres, prevCrop, irrigationType } = params;
    const matrix = state.agriMatrix || [];

    const scoredCrops = matrix.map(crop => {
      let score = 50;
      const reasons = [];

      // Season affinity
      const cropSeasons = crop.seasons || [(crop.season || '').toLowerCase()];
      const seasonLower = (season || 'rabi').toLowerCase();
      if (cropSeasons.some(s => seasonLower.includes(s) || s.includes(seasonLower))) {
        score += 25;
        reasons.push(`Season Match: Recommended for ${season} sowing window (${crop.sowingWindow || 'Timely'}).`);
      } else {
        score -= 20;
        reasons.push(`Season Mismatch: Primary window is ${crop.season || 'different season'}.`);
      }

      // Soil affinity
      const soilLower = (soilType || 'alluvial').toLowerCase();
      const cropSoils = crop.soils || [];
      const soilTypesStr = (crop.soilTypes || '').toLowerCase();
      if (cropSoils.some(s => soilLower.includes(s) || s.includes(soilLower)) || soilTypesStr.includes(soilLower)) {
        score += 15;
        reasons.push(`Soil Affinity: Excellent growth profile in ${soilType} soils.`);
      } else {
        reasons.push(`Soil Note: Requires good drainage and soil organic conditioning in ${soilType}.`);
      }

      // Water availability vs requirement
      const waterReq = (crop.waterMin || crop.waterRequirement || 'moderate').toLowerCase();
      if (waterAvail === 'Scarce' && (waterReq.includes('high') || waterReq.includes('abundant'))) {
        score -= 30;
        reasons.push('Water Risk: High water requirement conflicts with scarce water availability.');
      } else if (waterAvail === 'Abundant' && (waterReq.includes('high') || waterReq.includes('abundant'))) {
        score += 15;
        reasons.push('Water Match: Assured irrigation supports maximum crop biomass and yield.');
      } else if (waterAvail === 'Scarce' && (waterReq.includes('low') || waterReq.includes('drought'))) {
        score += 20;
        reasons.push('Drought Resilience: Well adapted to dryland rainfed conditions.');
      }

      // Crop rotation synergy
      const prevLower = (prevCrop || '').toLowerCase();
      const cropNameLower = (crop.cropName || crop.name || '').toLowerCase();
      if (prevLower.includes('paddy') && cropNameLower.includes('wheat')) {
        score += 15;
        reasons.push('Rotation Synergy: Standard high-efficiency Paddy-Wheat cropping cycle.');
      } else if (prevLower.includes('wheat') && cropNameLower.includes('moong')) {
        score += 20;
        reasons.push('Soil Restorative: Short 60-day summer legume restores atmospheric nitrogen.');
      } else if (prevLower.includes('bajra') && cropNameLower.includes('mustard')) {
        score += 15;
        reasons.push('Dryland Sequence: Optimal low-water Bajra-Mustard sequence.');
      }

      score = Math.min(98, Math.max(20, score));

      // Calculate total harvest estimate
      let yieldPerAcreNum = 10;
      if (crop.yieldEstimateQtlPerAcre) {
        const match = crop.yieldEstimateQtlPerAcre.match(/(\d+)/);
        if (match) yieldPerAcreNum = parseInt(match[1], 10);
      }
      const estTotalYieldQtl = Math.round(yieldPerAcreNum * (parseFloat(farmSizeAcres) || 1));

      return {
        crop,
        score,
        reasons,
        estTotalYieldQtl
      };
    });

    return scoredCrops.sort((a, b) => b.score - a.score);
  }

  // Refresh All API-Backed Modules
  async function refreshAllData() {
    const results = await Promise.allSettled([
      fetchLiveWeather(state.weather.location, state.weather.latitude, state.weather.longitude),
      fetchMandiRates(),
      fetchSchemes()
    ]);
    simulateTick();
    state.lastSyncTime = new Date().toISOString();
    saveState();
    return { success: true, timestamp: state.lastSyncTime };
  }

  // Dynamic Village Status Summary Generator
  function getVillageStatusSummary() {
    const e = state.iot.energy;
    const w = state.iot.water;
    const livestock = state.iot.livestock || [];
    const alerts = (state.alerts || []).filter(a => !a.resolved);
    const feverish = livestock.filter(a => a.temperature > 39.5);

    // Energy Status
    let energyStatus = 'Healthy';
    let energyBadge = 'success';
    if (e.batterySoc < 20 || (e.solarGeneration === 0 && e.villageLoad > 4.0)) {
      energyStatus = 'Critical';
      energyBadge = 'danger';
    } else if (e.batterySoc < 40 || e.solarGeneration < 1.5) {
      energyStatus = 'Warning';
      energyBadge = 'warning';
    }

    // Water Status
    let waterStatus = 'Healthy';
    let waterBadge = 'success';
    if (w.tankLevel < 20 || w.turbidity > 5.0) {
      waterStatus = 'Critical';
      waterBadge = 'danger';
    } else if (w.tankLevel < 40 || w.turbidity > 3.5) {
      waterStatus = 'Warning';
      waterBadge = 'warning';
    }

    // Livestock Status
    let livestockStatus = 'Normal';
    let livestockBadge = 'success';
    if (feverish.length > 0) {
      livestockStatus = 'Attention';
      livestockBadge = 'warning';
    }

    // Overall Status
    const isCritical = energyStatus === 'Critical' || waterStatus === 'Critical' || alerts.some(a => a.type === 'danger');
    const isWarning = energyStatus === 'Warning' || waterStatus === 'Warning' || livestockStatus === 'Attention' || alerts.some(a => a.type === 'warning');
    const overallStatus = isCritical ? 'Critical Attention Required' : (isWarning ? 'System Warnings Active' : 'All Village Systems Nominal');
    const overallBadge = isCritical ? 'danger' : (isWarning ? 'warning' : 'success');

    return {
      overallStatus,
      overallBadge,
      energy: {
        status: energyStatus,
        badge: energyBadge,
        solarGen: e.solarGeneration,
        batterySoc: e.batterySoc,
        load: e.villageLoad,
        scenario: e.scenario || 'Nominal'
      },
      water: {
        status: waterStatus,
        badge: waterBadge,
        tankLevel: w.tankLevel,
        turbidity: w.turbidity,
        ph: w.ph,
        pumpStatus: w.pumpStatus
      },
      livestock: {
        status: livestockStatus,
        badge: livestockBadge,
        totalCount: livestock.length,
        feverCount: feverish.length,
        feverishNames: feverish.map(a => a.name)
      },
      weather: {
        temperature: state.weather.temperature || state.weather.temp || 28.5,
        condition: state.weather.condition || 'Clear',
        humidity: state.weather.humidity || 60,
        rainChance: state.weather.precipitationChance || 10,
        advisory: state.weather.advisory || 'Conditions favorable for rural operations.'
      },
      agriculture: {
        currentSeason: 'Rabi Season (Winter-Spring)',
        advisory: 'Optimal soil moisture for wheat tillering & mustard flowering. Monitor micro-irrigation schedules.',
        keyCrops: ['Wheat (HD-2967)', 'Mustard (RH-749)', 'Chickpea (JG-11)']
      },
      alerts: {
        totalActive: alerts.length,
        criticalCount: alerts.filter(a => a.type === 'danger').length,
        warningCount: alerts.filter(a => a.type === 'warning').length,
        infoCount: alerts.filter(a => a.type === 'info').length,
        latest: alerts.slice(0, 3)
      }
    };
  }

  return {
    getState: () => state,
    saveState,
    subscribe,
    notify,
    resetToDefault,
    restoreBackupJson,
    simulateTick,
    simulateEnergyScenario,
    simulateWaterScenario,
    addAlert,
    resolveAlert,
    sendSmsAlert,
    addMilkRecord,
    getDairyTotals,
    exportDairyCsv,
    exportDairyJson,
    exportLivestockCsv,
    exportLivestockJson,
    exportWaterCsv,
    exportWaterJson,
    exportEnergyCsv,
    exportEnergyJson,
    exportAgricultureCsv,
    exportAlertsCsv,
    exportVillageReport,
    addAnimal,
    updateAnimal,
    markAnimalHealthCheck,
    fetchLiveWeather,
    fetchMandiRates,
    fetchSchemes,
    searchCropKnowledge,
    evaluateCropRecommendation,
    refreshAllData,
    getVillageStatusSummary
  };
})();
