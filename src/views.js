// GramSathi Unified Views Renderer Library
// High-Fidelity Rural Digital Operating Platform & COSMOS Interactive Display

window.GramViews = (function() {

  // Helper: Sparkline SVG Generator
  function renderSparkline(values, minVal, maxVal, color = '#16a34a') {
    const width = 100;
    const height = 24;
    if (!values || values.length === 0) return '';
    const min = minVal !== undefined ? minVal : Math.min(...values);
    const max = maxVal !== undefined ? maxVal : Math.max(...values);
    const range = (max - min) || 1;
    
    const points = values.map((val, idx) => {
      const x = (idx / (values.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow:visible;">
        <polyline fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${points}" />
      </svg>
    `;
  }

  // Helper: Honest Data Source Badges
  function getSourceBadge(sourceType) {
    switch(sourceType) {
      case 'LIVE':
      case 'LIVE_WEATHER':
      case 'LIVE_AI':
        return `<span class="badge badge-live">LIVE DATA</span>`;
      case 'OFFICIAL_SOURCE':
      case 'VERIFIED_OFFICIAL':
        return `<span class="badge badge-info" style="font-size:0.68rem; font-weight:700;">OFFICIAL SOURCE</span>`;
      case 'USER_ENTERED':
        return `<span class="badge badge-user">USER ENTERED</span>`;
      case 'SIMULATED':
      case 'SIMULATED_SENSOR':
        return `<span class="badge badge-simulated">SIMULATED SENSOR</span>`;
      case 'CACHED':
      case 'CACHED_DATA':
        return `<span class="badge badge-neutral" style="font-size:0.68rem; font-weight:700;">CACHED DATA</span>`;
      case 'LOCAL_DATA':
        return `<span class="badge badge-neutral" style="font-size:0.68rem; font-weight:700;">LOCAL DATA</span>`;
      case 'DEMO':
      case 'DEMO_WEATHER':
      default:
        return `<span class="badge badge-demo">DEMO DATA</span>`;
    }
  }

  // Helper: Universal Search Routing Engine
  function handleUniversalSearch(query) {
    const q = (query || '').trim().toLowerCase();
    if (!q) return;

    // 1. Weather Queries
    if (q.includes('weather') || q.includes('मौसम') || q.includes('rain') || q.includes('barish') || q.includes('temperature') || q.includes('temp')) {
      GramApp.navigate('#weather');
      GramApp.showToast('Routed to Village Weather Station');
      return;
    }

    // 2. Mandi / Market Queries
    if (q.includes('mandi') || q.includes('मंडी') || q.includes('price') || q.includes('rate') || q.includes('bhav') || q.includes('wheat') || q.includes('mustard') || q.includes('sarson') || q.includes('chana')) {
      GramApp.navigate('#mandi');
      setTimeout(() => {
        const input = document.getElementById('mandi-search');
        if (input) {
          input.value = q.replace(/mandi|price|rate|bhav|today|ka/g, '').trim();
          filterMandiTable(input.value);
        }
      }, 100);
      GramApp.showToast('Routed to Mandi Market Rates');
      return;
    }

    // 3. Water Queries
    if (q.includes('water') || q.includes('पानी') || q.includes('tank') || q.includes('pump') || q.includes('ph') || q.includes('turbidity')) {
      GramApp.navigate('#water');
      GramApp.showToast('Routed to Water Telemetry');
      return;
    }

    // 4. Energy / Solar Queries
    if (q.includes('solar') || q.includes('energy') || q.includes('power') || q.includes('battery') || q.includes('बिजली') || q.includes('सौर') || q.includes('inverter')) {
      GramApp.navigate('#energy');
      GramApp.showToast('Routed to Solar Microgrid');
      return;
    }

    // 5. Livestock / Cattle / Dairy Queries
    if (q.includes('livestock') || q.includes('cattle') || q.includes('cow') || q.includes('buffalo') || q.includes('गाय') || q.includes('भैंस') || q.includes('पशु')) {
      GramApp.navigate('#livestock');
      GramApp.showToast('Routed to Livestock Health Hub');
      return;
    }
    if (q.includes('milk') || q.includes('dairy') || q.includes('दूध') || q.includes('fat') || q.includes('snf')) {
      GramApp.navigate('#dairy');
      GramApp.showToast('Routed to Dairy & Milk Ledger');
      return;
    }

    // 6. Schemes Queries
    if (q.includes('scheme') || q.includes('योजना') || q.includes('subsidy') || q.includes('pm-kisan') || q.includes('kcc') || q.includes('government')) {
      GramApp.navigate('#schemes');
      setTimeout(() => {
        const input = document.getElementById('scheme-search-input');
        if (input) {
          input.value = q.replace(/scheme|yojana|subsidy|sarkari/g, '').trim();
          filterSchemesSearch(input.value);
        }
      }, 100);
      GramApp.showToast('Routed to Government Schemes');
      return;
    }

    // 7. Crop / Agriculture Queries
    if (q.includes('crop') || q.includes('soil') || q.includes('agri') || q.includes('फसल') || q.includes('खेती') || q.includes('khad')) {
      GramApp.navigate('#agriculture');
      setTimeout(() => {
        const input = document.getElementById('crop-search-input');
        if (input) {
          input.value = q.replace(/crop|fasal|farming|cultivation/g, '').trim();
          handleCropSearch(input.value);
        }
      }, 100);
      GramApp.showToast('Routed to Crop Advisor');
      return;
    }

    // 8. Default: Route to GramSathi AI Assistant with the full natural question
    GramApp.navigate('#assistant');
    setTimeout(() => {
      const chatInput = document.getElementById('chat-input');
      if (chatInput) {
        chatInput.value = query;
        handleChatSubmit();
      }
    }, 150);
  }

  // =========================================================================
  // 1. Dashboard: Living Village Hero & Command Center
  // =========================================================================
  function renderDashboard(container) {
    const state = GramStore.getState();
    const totals = GramStore.getDairyTotals();
    const activeAlerts = (state.alerts || []).filter(a => !a.resolved);
    const w = state.iot.water;
    const e = state.iot.energy;
    const ls = state.iot.livestock || [];
    const feverCattle = ls.filter(a => a.temperature > 39.5);
    const now = new Date();

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        
        <!-- LIVING ANIMATED VILLAGE HERO EXPERIENCE -->
        <div class="village-hero-container">
          <div class="hero-ambient-glow"></div>
          
          <div class="hero-top-badge-row">
            <div class="hero-brand-pill">
              <span class="status-dot pulse-dot" style="color:var(--primary-light);"></span>
              <span>${state.villageName} &bull; ${state.villageState}</span>
            </div>
            <div style="display:flex; gap:0.4rem; align-items:center;">
              <span class="badge badge-live">LIVE VILLAGE HUB</span>
              <span class="badge badge-simulated">SIMULATED SENSORS</span>
            </div>
          </div>

          <div class="hero-content-grid">
            <div>
              <h1 class="hero-title" data-i18n="dashboard.hero_title">Your village. One connected view.</h1>
              <p class="hero-subtitle" data-i18n="dashboard.hero_subtitle">
                Central digital operating platform for solar microgrid, water telemetry, livestock health, dairy ledger, and verified market intelligence.
              </p>

              <!-- Universal "Ask or Search GramSathi" Bar -->
              <form onsubmit="event.preventDefault(); GramViews.handleUniversalSearch(document.getElementById('dash-search-input').value);" class="universal-search-bar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" id="dash-search-input" placeholder="Ask or search anything about your village..." autocomplete="off" />
                <button type="submit" class="btn btn-primary btn-sm" style="padding:0.4rem 0.85rem;">
                  <span>Search</span>
                </button>
              </form>

              <!-- Quick Search Question Chips -->
              <div class="hero-quick-chips">
                <button class="hero-chip-btn" onclick="GramViews.handleUniversalSearch('What is today weather?')">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg>
                  <span>Today's Weather</span>
                </button>
                <button class="hero-chip-btn" onclick="GramViews.handleUniversalSearch('Water tank level and pump status')">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>
                  <span>Water Tank Status</span>
                </button>
                <button class="hero-chip-btn" onclick="GramViews.handleUniversalSearch('Wheat mandi prices today')">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                  <span>Mandi Rates</span>
                </button>
                <button class="hero-chip-btn" onclick="GramViews.handleUniversalSearch('How much milk was recorded today?')">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2h8v4H8z"></path><path d="M6 6h12v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6z"></path></svg>
                  <span>Dairy Milk Yield</span>
                </button>
              </div>
            </div>

            <!-- Spatial 3D Village Map Scene Hotspots -->
            <div class="spatial-village-scene">
              
              <!-- Central COSMOS Hub Hotspot -->
              <div class="scene-hotspot-center" onclick="GramApp.navigate('#cosmos');" title="Explore COSMOS Digital Village Display">
                <div style="display:flex; align-items:center; gap:0.6rem;">
                  <div style="width:34px; height:34px; border-radius:var(--radius-sm); background:rgba(34,197,94,0.3); display:flex; align-items:center; justify-content:center; color:#22c55e;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path><path d="M2 12h20"></path></svg>
                  </div>
                  <div>
                    <div style="font-size:0.85rem; font-weight:900; color:#ffffff;">COSMOS DIGITAL HUB</div>
                    <div style="font-size:0.7rem; color:#cbd5e1;">Universe in One Place &bull; Interactive Kiosk</div>
                  </div>
                </div>
                <button class="btn btn-sm btn-primary" style="padding:0.25rem 0.6rem; font-size:0.75rem;">Open &rarr;</button>
              </div>

              <!-- Solar Hotspot -->
              <div class="scene-hotspot-node" onclick="GramApp.navigate('#energy');" title="Solar Microgrid">
                <div class="hotspot-header">
                  <div class="hotspot-icon" style="background:rgba(245,158,11,0.2); color:var(--accent-light);">
                    ${GramIcons.energy}
                  </div>
                  <span class="status-dot" style="color:var(--accent-light);"></span>
                </div>
                <div class="hotspot-title">Solar PV</div>
                <div class="hotspot-metric">${e.solarGeneration} kW</div>
                <div class="hotspot-sub">Battery: ${e.batterySoc}%</div>
              </div>

              <!-- Water Hotspot -->
              <div class="scene-hotspot-node" onclick="GramApp.navigate('#water');" title="Potable Water Tank">
                <div class="hotspot-header">
                  <div class="hotspot-icon" style="background:rgba(2,132,199,0.2); color:var(--info);">
                    ${GramIcons.water}
                  </div>
                  <span class="status-dot" style="color:var(--info);"></span>
                </div>
                <div class="hotspot-title">Water Tank</div>
                <div class="hotspot-metric" style="color:#38bdf8;">${w.tankLevel}%</div>
                <div class="hotspot-sub">Pump: ${w.pumpStatus}</div>
              </div>

              <!-- Livestock Hotspot -->
              <div class="scene-hotspot-node" onclick="GramApp.navigate('#livestock');" title="Livestock Hub">
                <div class="hotspot-header">
                  <div class="hotspot-icon" style="background:rgba(34,197,94,0.2); color:var(--primary-light);">
                    ${GramIcons.livestock}
                  </div>
                  <span class="status-dot" style="color:var(--primary-light);"></span>
                </div>
                <div class="hotspot-title">Livestock</div>
                <div class="hotspot-metric">${ls.length} Heads</div>
                <div class="hotspot-sub">${feverCattle.length > 0 ? 'High Temp Alert' : 'Vitals Normal'}</div>
              </div>

            </div>
          </div>
        </div>

        <!-- CONNECTED VILLAGE SYSTEMS SUMMARY BAR -->
        <div class="card" style="padding:1rem 1.25rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; flex-wrap:wrap; gap:0.4rem;">
            <div style="font-size:0.75rem; font-weight:800; text-transform:uppercase; color:var(--text-muted); letter-spacing:0.06em;" data-i18n="dashboard.brief_title">
              Today's Village Brief — Real-Time Systems Status
            </div>
            <span style="font-size:0.72rem; color:var(--primary); font-weight:700;">Tap any card to inspect &rarr;</span>
          </div>

          <div style="display:grid; grid-template-columns:repeat(6, 1fr); gap:0.75rem;" class="brief-grid">
            
            <a href="#water" class="stat-card" style="padding:0.75rem; text-decoration:none;">
              <div class="stat-label" style="font-size:0.68rem;">WATER TANK</div>
              <strong class="stat-value" style="font-size:1.15rem; color:var(--info);">${w.tankLevel}%</strong>
              <span class="stat-footer" style="font-size:0.68rem; color:${w.turbidity > 5 ? 'var(--danger)' : 'var(--success)'};">
                ${w.turbidity > 5 ? 'Filter Check' : 'Potable pH ' + w.ph}
              </span>
            </a>

            <a href="#livestock" class="stat-card" style="padding:0.75rem; text-decoration:none;">
              <div class="stat-label" style="font-size:0.68rem;">LIVESTOCK</div>
              <strong class="stat-value" style="font-size:1.15rem;">${ls.length} Monitored</strong>
              <span class="stat-footer" style="font-size:0.68rem; color:${feverCattle.length > 0 ? 'var(--danger)' : 'var(--success)'};">
                ${feverCattle.length > 0 ? feverCattle.length + ' High Temp' : 'All Normal'}
              </span>
            </a>

            <a href="#dairy" class="stat-card" style="padding:0.75rem; text-decoration:none;">
              <div class="stat-label" style="font-size:0.68rem;">MILK COLLECTED</div>
              <strong class="stat-value" style="font-size:1.15rem; color:var(--primary);">${totals.todayTotal} L</strong>
              <span class="stat-footer" style="font-size:0.68rem;">Est. ₹${totals.estTodayRev}</span>
            </a>

            <a href="#energy" class="stat-card" style="padding:0.75rem; text-decoration:none;">
              <div class="stat-label" style="font-size:0.68rem;">SOLAR MICROGRID</div>
              <strong class="stat-value" style="font-size:1.15rem; color:var(--accent);">${e.solarGeneration} kW</strong>
              <span class="stat-footer" style="font-size:0.68rem;">${e.batterySoc}% Battery</span>
            </a>

            <a href="#weather" class="stat-card" style="padding:0.75rem; text-decoration:none;">
              <div class="stat-label" style="font-size:0.68rem;">WEATHER</div>
              <strong class="stat-value" style="font-size:1.15rem;">${state.weather.temperature || state.weather.temp}°C</strong>
              <span class="stat-footer" style="font-size:0.68rem;">${state.weather.condition}</span>
            </a>

            <a href="#alerts" class="stat-card" style="padding:0.75rem; text-decoration:none;">
              <div class="stat-label" style="font-size:0.68rem;">ACTIVE INCIDENTS</div>
              <strong class="stat-value" style="font-size:1.15rem; color:${activeAlerts.length > 0 ? 'var(--warning)' : 'var(--success)'};">${activeAlerts.length}</strong>
              <span class="stat-footer" style="font-size:0.68rem;">${activeAlerts.length > 0 ? 'Review Log' : 'All Nominal'}</span>
            </a>

          </div>
        </div>

        <!-- QUICK VILLAGE OPERATIONS (ALL BUTTONS FULLY FUNCTIONAL) -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              <span data-i18n="dashboard.quick_ops">Quick Village Operations</span>
            </div>
            <span class="badge badge-simulated" style="font-size:0.65rem;">DEMO CONTROLS</span>
          </div>
          
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:0.65rem;">
            
            <!-- Check Water -->
            <button class="btn btn-outline" onclick="GramApp.navigate('#water');" style="justify-content:flex-start;">
              ${GramIcons.water} <span>Check Water</span>
            </button>

            <!-- Pump Control -->
            <button class="btn btn-outline" onclick="GramModals.showPumpControlModal();" style="justify-content:flex-start;">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"></circle><path d="M12 8v8M8 12h8"></path></svg>
              <span>Pump Control</span>
            </button>

            <!-- Check Livestock -->
            <button class="btn btn-outline" onclick="GramApp.navigate('#livestock');" style="justify-content:flex-start;">
              ${GramIcons.livestock} <span>Check Livestock</span>
            </button>

            <!-- Energy Status -->
            <button class="btn btn-outline" onclick="GramApp.navigate('#energy');" style="justify-content:flex-start;">
              ${GramIcons.energy} <span>Energy Status</span>
            </button>

            <!-- Village Alerts -->
            <button class="btn btn-outline" onclick="GramApp.navigate('#alerts');" style="justify-content:flex-start;">
              ${GramIcons.alerts} <span>Village Alerts</span>
            </button>

            <!-- Record Milk Log -->
            <button class="btn btn-primary" onclick="GramModals.showRecordMilkModal();" style="justify-content:flex-start;">
              ${GramIcons.plus} <span>Record Milk Log</span>
            </button>

            <!-- COSMOS Display -->
            <button class="btn btn-outline" onclick="GramApp.navigate('#cosmos');" style="justify-content:flex-start;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
              <span>COSMOS Display</span>
            </button>

            <!-- AI Assistant -->
            <button class="btn btn-outline" onclick="GramApp.navigate('#assistant');" style="justify-content:flex-start;">
              ${GramIcons.assistant} <span>AI Assistant</span>
            </button>

          </div>
        </div>

        <!-- 4 Subsystem Detail Cards -->
        <div class="grid-cols-4">
          
          <div class="stat-card" onclick="GramApp.navigate('#energy');" style="cursor:pointer;">
            <div class="stat-icon-wrapper" style="background:var(--accent-subtle); color:var(--accent);">
              ${GramIcons.energy}
            </div>
            <span class="stat-label">Solar Battery SoC</span>
            <span class="stat-value" id="dash-battery-soc">${e.batterySoc}%</span>
            <div class="progress-bar-container">
              <div class="progress-fill ${e.batterySoc < 25 ? 'danger' : e.batterySoc < 50 ? 'warning' : ''}" style="width:${e.batterySoc}%;"></div>
            </div>
            <div class="stat-footer" style="justify-content:space-between;">
              <span>Gen: <strong>${e.solarGeneration} kW</strong></span>
              <span>Load: <strong>${e.villageLoad} kW</strong></span>
            </div>
          </div>

          <div class="stat-card" onclick="GramApp.navigate('#water');" style="cursor:pointer;">
            <div class="stat-icon-wrapper" style="background:var(--info-subtle); color:var(--info);">
              ${GramIcons.water}
            </div>
            <span class="stat-label">Overhead Tank Level</span>
            <span class="stat-value" id="dash-tank-level">${w.tankLevel}%</span>
            <div class="progress-bar-container">
              <div class="progress-fill ${w.tankLevel < 25 ? 'danger' : 'info'}" style="width:${w.tankLevel}%;"></div>
            </div>
            <div class="stat-footer" style="justify-content:space-between;">
              <span>Pump: <strong class="badge ${w.pumpStatus.includes('ON') ? 'badge-success' : 'badge-neutral'}">${w.pumpStatus}</strong></span>
              <span>pH: <strong>${w.ph}</strong></span>
            </div>
          </div>

          <div class="stat-card" onclick="GramApp.navigate('#livestock');" style="cursor:pointer;">
            <div class="stat-icon-wrapper" style="background:var(--success-subtle); color:var(--success);">
              ${GramIcons.livestock}
            </div>
            <span class="stat-label">Livestock Telemetry</span>
            <span class="stat-value">${ls.length} <span style="font-size:0.95rem; font-weight:600; color:var(--text-muted);">Heads</span></span>
            <div class="stat-footer" style="color:var(--success); font-weight:700;">
              ${GramIcons.check} <span>100% In Geofence</span>
            </div>
          </div>

          <div class="stat-card" onclick="GramApp.navigate('#dairy');" style="cursor:pointer;">
            <div class="stat-icon-wrapper" style="background:var(--primary-subtle); color:var(--primary);">
              ${GramIcons.dairy}
            </div>
            <span class="stat-label">Today's Milk Collection</span>
            <span class="stat-value">${totals.todayTotal} <span style="font-size:0.95rem; font-weight:600; color:var(--text-muted);">L</span></span>
            <div class="stat-footer" style="justify-content:space-between;">
              <span>Est. Revenue: <strong style="color:var(--primary);">₹${totals.estTodayRev}</strong></span>
              <span class="badge badge-user" style="font-size:0.6rem;">LEDGER</span>
            </div>
          </div>

        </div>

      </div>
    `;
    GramI18n.updateDOM();
  }

  // =========================================================================
  // 2. COSMOS — Universe in One Place (Interactive Digital Village Kiosk)
  // =========================================================================
  let cosmosAutoTimer = null;
  let cosmosCurrentStep = 0;
  let cosmosIsPaused = false;
  let cosmosUnsubscribe = null;

  const COSMOS_STEPS = [
    { id: 'overview', name: 'Village Overview' },
    { id: 'energy', name: 'Solar Microgrid' },
    { id: 'water', name: 'Drinking Water' },
    { id: 'weather', name: 'Micro-Climate' },
    { id: 'livestock', name: 'Livestock Telemetry' },
    { id: 'agriculture', name: 'Crop Advisory' },
    { id: 'alerts', name: 'Incident Center' }
  ];

  function renderCosmos(container) {
    if (cosmosUnsubscribe) { cosmosUnsubscribe(); cosmosUnsubscribe = null; }
    if (cosmosAutoTimer) { clearInterval(cosmosAutoTimer); cosmosAutoTimer = null; }

    const state = GramStore.getState();
    const w = state.iot.water;
    const e = state.iot.energy;
    const totals = GramStore.getDairyTotals();
    const summary = GramStore.getVillageStatusSummary();
    const activeAlerts = (state.alerts || []).filter(a => !a.resolved);

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        
        <!-- COSMOS Header Banner -->
        <div class="card" style="background:linear-gradient(135deg, #0b1528 0%, #152544 100%); color:white; border:1px solid rgba(255,255,255,0.12);">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
            <div>
              <div style="display:flex; align-items:center; gap:0.6rem;">
                <div style="width:36px; height:36px; border-radius:var(--radius-md); background:linear-gradient(135deg, #15803d, #22c55e); display:flex; align-items:center; justify-content:center; color:white;">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                </div>
                <div>
                  <h1 style="font-size:1.6rem; font-weight:900; letter-spacing:-0.02em; line-height:1.1;">COSMOS</h1>
                  <p style="font-size:0.75rem; color:#cbd5e1;">Universe in One Place &bull; <strong style="color:var(--primary-light);">Powered by GramSathi</strong></p>
                </div>
              </div>
              <div style="display:flex; gap:0.4rem; margin-top:0.4rem;">
                <span class="badge badge-live">LIVE COMMUNITY DISPLAY</span>
                <span class="badge badge-${summary.overallBadge}">${summary.overallStatus}</span>
              </div>
            </div>

            <div style="display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap;">
              <button class="btn btn-primary btn-sm" onclick="GramModals.showVillageStatusModal();">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                <span>Village Status</span>
              </button>
              <button class="btn btn-outline btn-sm" style="border-color:rgba(255,255,255,0.2); color:white;" onclick="GramApp.toggleKioskMode();">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                <span>Fullscreen</span>
              </button>
              <div style="background:rgba(0,0,0,0.3); padding:0.4rem 0.75rem; border-radius:var(--radius-md); font-family:monospace; font-weight:800; font-size:1.1rem;">
                <span id="cosmos-live-clock">${new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 9 Interactive Subsystem Nodes Grid -->
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.85rem;" class="cosmos-nodes-grid">
          
          <!-- 1. Energy Node -->
          <div class="card" id="cosmos-node-energy">
            <div class="card-header">
              <div class="card-title">${GramIcons.energy} <span>Solar Microgrid</span></div>
              <span class="badge badge-${summary.energy.badge}">${summary.energy.status}</span>
            </div>
            <div style="font-size:1.75rem; font-weight:900; color:var(--text-main); line-height:1.1; margin:0.2rem 0;">
              ${e.solarGeneration} <span style="font-size:0.9rem; color:var(--text-muted);">kW</span>
            </div>
            <div style="font-size:0.75rem; color:var(--text-muted); display:flex; justify-content:space-between; margin-bottom:0.6rem;">
              <span>Battery: <strong>${e.batterySoc}%</strong></span>
              <span>Load: <strong>${e.villageLoad} kW</strong></span>
            </div>
            <div style="display:flex; gap:0.4rem;">
              <button class="btn btn-primary btn-sm" style="flex:1;" onclick="GramApp.navigate('#energy');">Open Energy</button>
              <button class="btn btn-outline btn-sm" style="flex:1;" onclick="GramStore.simulateEnergyScenario('high_solar'); GramApp.showToast('Peak Solar Simulation Applied');">Peak Solar</button>
            </div>
          </div>

          <!-- 2. Water Node -->
          <div class="card" id="cosmos-node-water">
            <div class="card-header">
              <div class="card-title">${GramIcons.water} <span>Drinking Water</span></div>
              <span class="badge badge-${summary.water.badge}">${summary.water.status}</span>
            </div>
            <div style="font-size:1.75rem; font-weight:900; color:var(--info); line-height:1.1; margin:0.2rem 0;">
              ${w.tankLevel}% <span style="font-size:0.9rem; color:var(--text-muted);">(10,000 L)</span>
            </div>
            <div style="font-size:0.75rem; color:var(--text-muted); display:flex; justify-content:space-between; margin-bottom:0.6rem;">
              <span>Pump: <strong>${w.pumpStatus}</strong></span>
              <span>pH: <strong>${w.ph}</strong></span>
            </div>
            <div style="display:flex; gap:0.4rem;">
              <button class="btn btn-primary btn-sm" style="flex:1;" onclick="GramApp.navigate('#water');">Open Water</button>
              <button class="btn btn-outline btn-sm" style="flex:1;" onclick="GramModals.showPumpControlModal();">Pump Control</button>
            </div>
          </div>

          <!-- 3. Livestock Node -->
          <div class="card" id="cosmos-node-livestock">
            <div class="card-header">
              <div class="card-title">${GramIcons.livestock} <span>Livestock Hub</span></div>
              <span class="badge badge-${summary.livestock.badge}">${summary.livestock.status}</span>
            </div>
            <div style="font-size:1.75rem; font-weight:900; color:var(--primary); line-height:1.1; margin:0.2rem 0;">
              ${state.iot.livestock.length} <span style="font-size:0.9rem; color:var(--text-muted);">Heads</span>
            </div>
            <div style="font-size:0.75rem; color:var(--text-muted); display:flex; justify-content:space-between; margin-bottom:0.6rem;">
              <span>Geofence: <strong>Safe Pasture</strong></span>
              <span>Temp: <strong>${summary.livestock.feverCount > 0 ? 'Warning' : 'Normal'}</strong></span>
            </div>
            <div style="display:flex; gap:0.4rem;">
              <button class="btn btn-primary btn-sm" style="flex:1;" onclick="GramApp.navigate('#livestock');">View Cattle</button>
              <button class="btn btn-outline btn-sm" style="flex:1;" onclick="GramModals.showAnimalProfileModal('COW-01');">Animal Vitals</button>
            </div>
          </div>

          <!-- 4. Dairy Node -->
          <div class="card" id="cosmos-node-dairy">
            <div class="card-header">
              <div class="card-title">${GramIcons.dairy} <span>Dairy Ledger</span></div>
              <span class="badge badge-user">RECORDED</span>
            </div>
            <div style="font-size:1.75rem; font-weight:900; color:var(--text-main); line-height:1.1; margin:0.2rem 0;">
              ${totals.todayTotal} <span style="font-size:0.9rem; color:var(--text-muted);">Liters</span>
            </div>
            <div style="font-size:0.75rem; color:var(--text-muted); display:flex; justify-content:space-between; margin-bottom:0.6rem;">
              <span>Today Est: <strong>₹${totals.estTodayRev}</strong></span>
              <span>Rate: <strong>₹${totals.pricePerLiter}/L</strong></span>
            </div>
            <div style="display:flex; gap:0.4rem;">
              <button class="btn btn-primary btn-sm" style="flex:1;" onclick="GramModals.showRecordMilkModal();">Record Milk</button>
              <button class="btn btn-outline btn-sm" style="flex:1;" onclick="GramApp.navigate('#dairy');">Ledger</button>
            </div>
          </div>

          <!-- 5. Agriculture Node -->
          <div class="card" id="cosmos-node-agriculture">
            <div class="card-header">
              <div class="card-title">${GramIcons.agriculture} <span>Crop Advisory</span></div>
              <span class="badge badge-success">RABI SEASON</span>
            </div>
            <div style="font-size:1.35rem; font-weight:800; color:var(--success); line-height:1.1; margin:0.35rem 0;">
              Wheat &amp; Mustard
            </div>
            <div style="font-size:0.75rem; color:var(--text-muted); display:flex; justify-content:space-between; margin-bottom:0.6rem;">
              <span>Tillering Stage</span>
              <span>Water: <strong>Moderate</strong></span>
            </div>
            <div style="display:flex; gap:0.4rem;">
              <button class="btn btn-primary btn-sm" style="flex:1;" onclick="GramApp.navigate('#agriculture');">Crop Advisor</button>
              <button class="btn btn-outline btn-sm" style="flex:1;" onclick="GramViews.explainCropWithAI('wheat');">Explain Crop</button>
            </div>
          </div>

          <!-- 6. Weather Node -->
          <div class="card" id="cosmos-node-weather">
            <div class="card-header">
              <div class="card-title">${GramIcons.weather} <span>Weather Station</span></div>
              ${getSourceBadge(state.weather.sourceType)}
            </div>
            <div style="font-size:1.75rem; font-weight:900; color:var(--text-main); line-height:1.1; margin:0.2rem 0;">
              ${state.weather.temperature || state.weather.temp}°C
            </div>
            <div style="font-size:0.75rem; color:var(--text-muted); display:flex; justify-content:space-between; margin-bottom:0.6rem;">
              <span>${state.weather.condition}</span>
              <span>Humidity: <strong>${state.weather.humidity}%</strong></span>
            </div>
            <div style="display:flex; gap:0.4rem;">
              <button class="btn btn-primary btn-sm" style="flex:1;" onclick="GramViews.handleUseLiveLocation();">Use GPS</button>
              <button class="btn btn-outline btn-sm" style="flex:1;" onclick="GramApp.navigate('#weather');">Details</button>
            </div>
          </div>

          <!-- 7. Mandi Node -->
          <div class="card" id="cosmos-node-mandi">
            <div class="card-header">
              <div class="card-title">${GramIcons.mandi} <span>Mandi Rates</span></div>
              <span class="badge badge-info">AGMARKNET</span>
            </div>
            <div style="font-size:1.35rem; font-weight:800; color:var(--accent); line-height:1.1; margin:0.35rem 0;">
              ₹2,360 <span style="font-size:0.8rem; color:var(--text-muted);">Wheat Modal</span>
            </div>
            <div style="font-size:0.75rem; color:var(--text-muted); display:flex; justify-content:space-between; margin-bottom:0.6rem;">
              <span>Mustard: <strong>₹5,680</strong></span>
              <span>Chana: <strong>₹5,850</strong></span>
            </div>
            <div style="display:flex; gap:0.4rem;">
              <button class="btn btn-primary btn-sm" style="flex:1;" onclick="GramApp.navigate('#mandi');">Mandi Rates</button>
              <button class="btn btn-outline btn-sm" style="flex:1;" onclick="GramViews.explainCurrentMandiData();">Market AI</button>
            </div>
          </div>

          <!-- 8. Alerts Node -->
          <div class="card" id="cosmos-node-alerts">
            <div class="card-header">
              <div class="card-title">${GramIcons.alerts} <span>Alert Center</span></div>
              <span class="badge badge-${activeAlerts.length > 0 ? 'warning' : 'success'}">${activeAlerts.length} Active</span>
            </div>
            <div style="font-size:1.75rem; font-weight:900; color:${activeAlerts.length > 0 ? 'var(--warning)' : 'var(--success)'}; line-height:1.1; margin:0.2rem 0;">
              ${activeAlerts.length} <span style="font-size:0.9rem; color:var(--text-muted);">Incidents</span>
            </div>
            <div style="font-size:0.75rem; color:var(--text-muted); display:flex; justify-content:space-between; margin-bottom:0.6rem;">
              <span>Critical: <strong>${summary.alerts.criticalCount}</strong></span>
              <span>Warning: <strong>${summary.alerts.warningCount}</strong></span>
            </div>
            <div style="display:flex; gap:0.4rem;">
              <button class="btn btn-primary btn-sm" style="flex:1;" onclick="GramApp.navigate('#alerts');">Open Alerts</button>
              <button class="btn btn-outline btn-sm" style="flex:1;" onclick="GramModals.showSmsModal();">Dispatch SMS</button>
            </div>
          </div>

          <!-- 9. AI Assistant Node -->
          <div class="card" id="cosmos-node-assistant">
            <div class="card-header">
              <div class="card-title">${GramIcons.assistant} <span>GramSathi AI</span></div>
              <span class="badge badge-live">GROQ AI</span>
            </div>
            <div style="font-size:1.25rem; font-weight:800; color:var(--primary); line-height:1.1; margin:0.45rem 0;">
              Village Companion
            </div>
            <div style="font-size:0.75rem; color:var(--text-muted); display:flex; justify-content:space-between; margin-bottom:0.6rem;">
              <span>Speech In &amp; Out</span>
              <span>Context-Aware</span>
            </div>
            <div style="display:flex; gap:0.4rem;">
              <button class="btn btn-primary btn-sm" style="flex:1;" onclick="GramApp.navigate('#assistant');">Ask AI</button>
              <button class="btn btn-outline btn-sm" style="flex:1;" onclick="GramViews.toggleVoiceRecording();">Voice Ask</button>
            </div>
          </div>

        </div>

      </div>
    `;

    // Subscribe to store updates for real-time live numbers
    cosmosUnsubscribe = GramStore.subscribe(() => {
      if (window.location.hash === '#cosmos') {
        const liveClock = document.getElementById('cosmos-live-clock');
        if (liveClock) liveClock.textContent = new Date().toLocaleTimeString();
      }
    });

    GramI18n.updateDOM();
  }

  // =========================================================================
  // 3. Smart Livestock Hub
  // =========================================================================
  function renderLivestock(container) {
    const state = GramStore.getState();
    const ls = state.iot.livestock || [];

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <h2 style="font-size:1.25rem; font-weight:800;" data-i18n="livestock.title">Smart Livestock Hub & Health Telemetry</h2>
              <span class="badge badge-simulated">SIMULATED SENSOR DATA</span>
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted);" data-i18n="livestock.subtitle">RFID tags, health collar telemetry (body temp, heart rate, rumination), lactation stages, and geofence tracking.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="GramModals.showAddAnimalModal();">
            ${GramIcons.plus} <span data-i18n="livestock.register_cattle">Register Cattle Tag</span>
          </button>
        </div>

        <div style="padding:0.65rem 0.95rem; border-radius:var(--radius-md); background:var(--bg-surface); border:1px solid var(--border); font-size:0.75rem; color:var(--text-muted);">
          <strong>* Disclaimer:</strong> Livestock telemetry collar readings are simulated demonstration alerts — not a veterinary diagnosis.
        </div>

        <div class="grid-cols-2">
          ${ls.map(animal => {
            let healthBadge = 'badge-success';
            let healthLabel = 'NORMAL';
            if (animal.temperature > 39.5) {
              healthBadge = 'badge-danger';
              healthLabel = 'ALERT';
            } else if (animal.heartRate > 85 || animal.heartRate < 60) {
              healthBadge = 'badge-warning';
              healthLabel = 'WATCH';
            }

            return `
              <div class="card" style="cursor:pointer;" onclick="GramModals.showAnimalProfileModal('${animal.id}');">
                <div class="card-header">
                  <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                    <span class="badge badge-neutral" style="font-weight:700;">${animal.id}</span>
                    <strong style="font-size:1.05rem;">${animal.name} (${animal.type})</strong>
                    <span class="badge ${healthBadge}" style="font-weight:800;">${healthLabel}</span>
                  </div>
                  <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); GramModals.showAnimalProfileModal('${animal.id}');">
                    View Details
                  </button>
                </div>

                <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.6rem; margin:0.6rem 0; background:var(--bg-main); padding:0.65rem; border-radius:var(--radius-md); border:1px solid var(--border);">
                  <div>
                    <div style="font-size:0.68rem; color:var(--text-muted); font-weight:700;">BODY TEMP</div>
                    <div style="font-size:1.15rem; font-weight:900; color:${animal.temperature > 39.5 ? 'var(--danger)' : 'inherit'};">${animal.temperature}°C</div>
                  </div>
                  <div>
                    <div style="font-size:0.68rem; color:var(--text-muted); font-weight:700;">HEART RATE</div>
                    <div style="font-size:1.15rem; font-weight:900;">${animal.heartRate} bpm</div>
                  </div>
                  <div>
                    <div style="font-size:0.68rem; color:var(--text-muted); font-weight:700;">RUMINATION</div>
                    <div style="font-size:1.15rem; font-weight:900; color:var(--success);">${animal.ruminationMinutes} min</div>
                  </div>
                </div>

                <div style="font-size:0.8rem; display:flex; flex-direction:column; gap:0.3rem;">
                  <div style="display:flex; justify-content:space-between;">
                    <span style="color:var(--text-muted);">Breed & Age:</span>
                    <strong>${animal.breed} &bull; ${animal.age} Years</strong>
                  </div>
                  <div style="display:flex; justify-content:space-between;">
                    <span style="color:var(--text-muted);">Daily Milk Avg:</span>
                    <strong style="color:var(--primary);">${animal.dailyMilkAvg} L / day</strong>
                  </div>
                  <div style="display:flex; justify-content:space-between;">
                    <span style="color:var(--text-muted);">Geofence:</span>
                    <span style="color:var(--success); font-weight:600;">${animal.geofenceStatus}</span>
                  </div>
                </div>

                <div style="margin-top:0.75rem; display:flex; gap:0.4rem;" onclick="event.stopPropagation();">
                  <button class="btn btn-outline btn-sm" style="flex:1;" onclick="GramModals.showRecordMilkModal('${animal.id}');">
                    Record Milk
                  </button>
                  <button class="btn btn-outline btn-sm" style="flex:1;" onclick="
                    GramStore.markAnimalHealthCheck('${animal.id}');
                    GramApp.showToast('Health check logged for ${animal.name}. Vitals nominal.');
                    GramViews.renderLivestock(document.getElementById('page-content'));
                  ">
                    Health Check
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    GramI18n.updateDOM();
  }

  // =========================================================================
  // 4. Dairy & Milk Management View
  // =========================================================================
  function renderDairy(container) {
    const state = GramStore.getState();
    const totals = GramStore.getDairyTotals();
    const records = state.dairy.records || [];

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <h2 style="font-size:1.25rem; font-weight:800;" data-i18n="dairy.title">Dairy Operations & Milk Records</h2>
              <span class="badge badge-user">USER ENTERED</span>
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted);">Morning and evening collections, Fat/SNF tracking, yield totals, revenue estimator, and CSV records export.</p>
          </div>
          <div style="display:flex; gap:0.5rem;">
            <button class="btn btn-outline btn-sm" onclick="GramStore.exportDairyCsv(); GramApp.showToast('Milk records exported as CSV');">
              ${GramIcons.download} <span>Export CSV</span>
            </button>
            <button class="btn btn-primary btn-sm" onclick="GramModals.showRecordMilkModal();">
              ${GramIcons.plus} <span>Record Milk Entry</span>
            </button>
          </div>
        </div>

        <!-- Totals & Revenue Estimator -->
        <div class="grid-cols-4">
          <div class="stat-card">
            <span class="stat-label" data-i18n="dairy.today_yield">Today's Total Yield</span>
            <span class="stat-value">${totals.todayTotal} <span style="font-size:0.95rem;">L</span></span>
            <div class="stat-footer" style="color:var(--primary); font-weight:600;">Est. Value: ₹${totals.estTodayRev}</div>
          </div>
          <div class="stat-card">
            <span class="stat-label" data-i18n="dairy.weekly_yield">7-Day Cumulative</span>
            <span class="stat-value">${totals.weeklyTotal} <span style="font-size:0.95rem;">L</span></span>
            <div class="stat-footer" style="color:var(--primary); font-weight:600;">Est. Value: ₹${totals.estWeeklyRev}</div>
          </div>
          <div class="stat-card">
            <span class="stat-label" data-i18n="dairy.monthly_yield">30-Day Cumulative</span>
            <span class="stat-value">${totals.monthlyTotal} <span style="font-size:0.95rem;">L</span></span>
            <div class="stat-footer" style="color:var(--primary); font-weight:600;">Est. Value: ₹${totals.estMonthlyRev}</div>
          </div>
          <div class="stat-card" style="background:var(--primary-subtle); border-color:var(--primary);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span class="stat-label" style="color:var(--primary-dark); font-weight:700;">Rate Estimator (₹/L)</span>
              <span class="badge badge-user" style="font-size:0.6rem;">RATE</span>
            </div>
            <div style="display:flex; align-items:center; gap:0.4rem; margin-top:0.3rem;">
              <span style="font-size:1.3rem; font-weight:800; color:var(--primary-dark);">₹</span>
              <input type="number" id="milk-price-input" value="${totals.pricePerLiter}" min="10" max="250" step="1" 
                class="form-control" style="font-size:1.1rem; font-weight:800; width:90px; padding:0.2rem 0.4rem;"
                onchange="
                  const val = parseFloat(this.value) || 55;
                  const s = GramStore.getState();
                  s.dairy.milkPricePerLiter = val;
                  GramStore.saveState();
                  GramApp.showToast('Milk rate updated to ₹' + val + '/L');
                  GramViews.renderDairy(document.getElementById('page-content'));
                "
              />
            </div>
            <div class="stat-footer" style="color:var(--primary-dark); font-size:0.7rem;">Average payout rate</div>
          </div>
        </div>

        <!-- Milk Records Table -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">Recent Milk Entries (${records.length})</div>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Entry ID</th>
                  <th>Date</th>
                  <th>Session</th>
                  <th>Morning (L)</th>
                  <th>Evening (L)</th>
                  <th>Total (L)</th>
                  <th>Fat %</th>
                  <th>SNF %</th>
                  <th>Farmer</th>
                  <th>Est. Value</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                ${records.map(r => `
                  <tr>
                    <td><strong style="font-size:0.78rem;">${r.id}</strong></td>
                    <td>${r.date}</td>
                    <td><span class="badge ${r.session === 'Morning' ? 'badge-warning' : 'badge-info'}">${r.session}</span></td>
                    <td>${r.morningLiters !== undefined ? r.morningLiters : '-'}</td>
                    <td>${r.eveningLiters !== undefined ? r.eveningLiters : '-'}</td>
                    <td><strong style="color:var(--primary); font-size:0.92rem;">${r.liters} L</strong></td>
                    <td>${r.fat}%</td>
                    <td>${r.snf}%</td>
                    <td>${r.farmer}</td>
                    <td><strong>₹${Math.round(r.liters * (r.pricePerLiter || totals.pricePerLiter))}</strong></td>
                    <td style="color:var(--text-muted); font-size:0.78rem;">${r.note || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
    GramI18n.updateDOM();
  }

  // =========================================================================
  // 5. Solar Microgrid & Energy Panel
  // =========================================================================
  function renderEnergy(container) {
    const state = GramStore.getState();
    const e = state.iot.energy;

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <h2 style="font-size:1.25rem; font-weight:800;" data-i18n="energy.title">Solar Microgrid & Energy Control Panel</h2>
              <span class="badge badge-simulated">SIMULATED POWER TELEMETRY</span>
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted);" data-i18n="energy.subtitle">Real-time PV generation, LiFePO4 battery SoC, inverter telemetry, and village load balancing.</p>
          </div>
        </div>

        <div class="scenario-bar">
          <span class="scenario-label">${GramIcons.refresh} Energy Scenarios:</span>
          <button class="btn btn-outline btn-sm" onclick="GramStore.simulateEnergyScenario('high_solar'); GramApp.showToast('Peak Solar Generation (5.8 kW)'); GramViews.renderEnergy(document.getElementById('page-content'));">
            Peak Solar (5.8 kW)
          </button>
          <button class="btn btn-outline btn-sm" onclick="GramStore.simulateEnergyScenario('low_solar'); GramApp.showToast('Low Solar (1.2 kW Overcast)'); GramViews.renderEnergy(document.getElementById('page-content'));">
            Low Solar (Overcast)
          </button>
          <button class="btn btn-outline btn-sm" onclick="GramStore.simulateEnergyScenario('high_load'); GramApp.showToast('High Village Load (4.8 kW)'); GramViews.renderEnergy(document.getElementById('page-content'));">
            High Load Draw (4.8 kW)
          </button>
          <button class="btn btn-outline btn-sm" onclick="GramStore.simulateEnergyScenario('battery_critical'); GramApp.showToast('Battery Critical (18%)'); GramViews.renderEnergy(document.getElementById('page-content'));">
            Battery Critical (18%)
          </button>
          <button class="btn btn-outline btn-sm" onclick="GramStore.simulateEnergyScenario('night_low'); GramApp.showToast('Night Inverter Mode'); GramViews.renderEnergy(document.getElementById('page-content'));">
            Night Inverter Mode
          </button>
          <button class="btn btn-outline btn-sm" onclick="GramStore.simulateEnergyScenario('normal'); GramApp.showToast('Restored Nominal Sunlight'); GramViews.renderEnergy(document.getElementById('page-content'));">
            Restore Nominal
          </button>
        </div>

        <div class="grid-cols-4">
          <div class="stat-card">
            <span class="stat-label">Solar PV Output</span>
            <span class="stat-value">${e.solarGeneration} <span style="font-size:0.95rem;">kW</span></span>
            <div class="stat-footer" style="color:var(--accent); font-weight:600;">Array Peak: 6.0 kW</div>
          </div>
          <div class="stat-card">
            <span class="stat-label">Battery SoC</span>
            <span class="stat-value">${e.batterySoc}%</span>
            <div class="progress-bar-container">
              <div class="progress-fill ${e.batterySoc < 25 ? 'danger' : e.batterySoc < 50 ? 'warning' : ''}" style="width:${e.batterySoc}%;"></div>
            </div>
            <div class="stat-footer">Bank: ${e.batteryCapacityKwh} kWh LiFePO4</div>
          </div>
          <div class="stat-card">
            <span class="stat-label">Village Essential Load</span>
            <span class="stat-value">${e.villageLoad} <span style="font-size:0.95rem;">kW</span></span>
            <div class="stat-footer">Water pump, Clinic cold chain</div>
          </div>
          <div class="stat-card">
            <span class="stat-label">Inverter Efficiency</span>
            <span class="stat-value">${e.inverterEfficiency}%</span>
            <div class="stat-footer" style="color:var(--success); font-weight:600;">Pure Sine Wave Controller</div>
          </div>
        </div>

        <div class="grid-cols-2">
          <div class="card">
            <div class="card-header">
              <div class="card-title">Daily Solar Generation Trend</div>
              ${renderSparkline(e.history, 0, 6, '#d97706')}
            </div>
            <p style="font-size:0.82rem; color:var(--text-muted); margin-top:0.75rem;">
              Total energy harvested today: <strong style="color:var(--text-main); font-size:0.95rem;">${e.dailySolarGeneratedKwh} kWh</strong>. Offsets approx. 24 kg CO₂ daily.
            </p>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title">Circuit Routing &amp; Battery Runtime</div>
            </div>
            <div style="font-size:0.83rem; display:flex; flex-direction:column; gap:0.45rem;">
              <div style="display:flex; justify-content:space-between; padding-bottom:0.35rem; border-bottom:1px solid var(--border-subtle);">
                <span>Primary Water Pump Circuit</span>
                <span class="badge ${e.batterySoc < 20 ? 'badge-danger' : 'badge-success'}">${e.batterySoc < 20 ? 'Load Shedding' : 'Energized'}</span>
              </div>
              <div style="display:flex; justify-content:space-between; padding-bottom:0.35rem; border-bottom:1px solid var(--border-subtle);">
                <span>Health Clinic Cold Storage (4°C)</span>
                <span class="badge badge-success">Protected Circuit</span>
              </div>
              <div style="display:flex; justify-content:space-between; padding-bottom:0.35rem; border-bottom:1px solid var(--border-subtle);">
                <span>Active Telemetry Scenario</span>
                <strong style="color:var(--accent);">${e.scenario || 'Nominal Daytime'}</strong>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span>Estimated Battery Backup</span>
                <strong>~${Math.round((e.batterySoc / 100 * e.batteryCapacityKwh) / (e.villageLoad || 1))} Hours</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    GramI18n.updateDOM();
  }

  // =========================================================================
  // 6. Water Management View
  // =========================================================================
  function renderWater(container) {
    const state = GramStore.getState();
    const w = state.iot.water;

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <h2 style="font-size:1.25rem; font-weight:800;" data-i18n="water.title">Water Telemetry & Pump Automation</h2>
              <span class="badge badge-simulated">SIMULATED SENSOR</span>
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted);" data-i18n="water.subtitle">Real-time monitoring of community overhead tank, solar pump automation, and potable drinking water standards.</p>
          </div>
          <div style="display:flex; gap:0.5rem;">
            <button class="btn btn-outline btn-sm" onclick="GramModals.showPumpControlModal();">
              Pump Control Panel
            </button>
            <button class="btn ${w.pumpStatus.includes('ON') ? 'btn-danger' : 'btn-primary'} btn-sm" onclick="
              const nextState = '${w.pumpStatus.includes('ON') ? 'pump_override_off' : 'pump_override_on'}';
              GramStore.simulateWaterScenario(nextState);
              GramApp.showToast('Solar pump state changed to ' + GramStore.getState().iot.water.pumpStatus);
              GramViews.renderWater(document.getElementById('page-content'));
            ">
              ${w.pumpStatus.includes('ON') ? 'Stop Solar Pump' : 'Start Solar Pump'}
            </button>
          </div>
        </div>

        <div class="scenario-bar">
          <span class="scenario-label">${GramIcons.refresh} Water Scenarios:</span>
          <button class="btn btn-outline btn-sm" onclick="GramStore.simulateWaterScenario('low_flow'); GramApp.showToast('Low Flow (3.2 L/min) Simulation'); GramViews.renderWater(document.getElementById('page-content'));">
            Low Flow Spike
          </button>
          <button class="btn btn-outline btn-sm" onclick="GramStore.simulateWaterScenario('high_turbidity'); GramApp.showToast('Turbidity Spike (7.8 NTU)'); GramViews.renderWater(document.getElementById('page-content'));">
            Turbidity Spike (7.8 NTU)
          </button>
          <button class="btn btn-outline btn-sm" onclick="GramStore.simulateWaterScenario('refill'); GramApp.showToast('Refilled Tank to 92%'); GramViews.renderWater(document.getElementById('page-content'));">
            Refill Tank (92%)
          </button>
          <button class="btn btn-outline btn-sm" onclick="GramStore.simulateWaterScenario('normal'); GramApp.showToast('Restored Nominal Water Metrics'); GramViews.renderWater(document.getElementById('page-content'));">
            Restore Nominal
          </button>
        </div>

        <div class="grid-cols-4">
          <div class="stat-card">
            <span class="stat-label">Overhead Tank Level</span>
            <span class="stat-value">${w.tankLevel}%</span>
            <div class="progress-bar-container">
              <div class="progress-fill ${w.tankLevel < 25 ? 'danger' : w.tankLevel < 50 ? 'warning' : 'info'}" style="width:${w.tankLevel}%;"></div>
            </div>
            <div class="stat-footer">Capacity: 10,000 Liters</div>
          </div>
          <div class="stat-card">
            <span class="stat-label">Water pH Level</span>
            <span class="stat-value">${w.ph}</span>
            <div class="stat-footer" style="color:var(--success); font-weight:600;">Safe Potable (6.5 - 8.5)</div>
          </div>
          <div class="stat-card">
            <span class="stat-label">Turbidity (NTU)</span>
            <span class="stat-value" style="color:${w.turbidity > 5 ? 'var(--danger)' : 'inherit'};">${w.turbidity} <span style="font-size:0.9rem;">NTU</span></span>
            <div class="stat-footer" style="color:${w.turbidity > 5 ? 'var(--danger)' : 'var(--success)'}; font-weight:600;">
              ${w.turbidity > 5 ? 'Exceeds Potable Threshold' : 'Clear & Safe (< 5 NTU)'}
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-label">Pump Status</span>
            <span class="stat-value" style="font-size:1.25rem;"><span class="badge ${w.pumpStatus.includes('ON') ? 'badge-success' : 'badge-neutral'}">${w.pumpStatus}</span></span>
            <div class="stat-footer">Flow: ${w.flowRate} L/min</div>
          </div>
        </div>

        <div class="grid-cols-2">
          <div class="card">
            <div class="card-header">
              <div class="card-title">7-Day Tank Level Trend</div>
              ${renderSparkline(w.history, 50, 100, '#0284c7')}
            </div>
            <p style="font-size:0.82rem; color:var(--text-muted); margin-top:0.75rem;">
              Automated solar pump keeps the community tank above 65% during sunlight hours, providing gravity-fed tap water to 120 rural households.
            </p>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title">Pump Hardware Configuration</div>
            </div>
            <div style="font-size:0.83rem; display:flex; flex-direction:column; gap:0.45rem;">
              <div style="display:flex; justify-content:space-between; padding-bottom:0.35rem; border-bottom:1px solid var(--border-subtle);">
                <span>Active Solar Pump</span>
                <strong>${w.activePump}</strong>
              </div>
              <div style="display:flex; justify-content:space-between; padding-bottom:0.35rem; border-bottom:1px solid var(--border-subtle);">
                <span>Auto-Refill Threshold</span>
                <strong style="color:var(--info);">&lt; 25% Auto-Start, &gt; 95% Auto-Stop</strong>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span>Filtration Unit</span>
                <strong style="color:var(--success);">Dual Sand &amp; Activated Carbon</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    GramI18n.updateDOM();
  }

  // =========================================================================
  // 7. Smart Agriculture Advisor & Hybrid Crop Knowledge
  // =========================================================================
  function renderAgriculture(container) {
    const state = GramStore.getState();

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <h2 style="font-size:1.25rem; font-weight:800;" data-i18n="agri.title">Smart Agriculture & Hybrid Crop Advisor</h2>
              <span class="badge badge-info">ICAR DATA + AI REASONING</span>
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted);">Scientific crop knowledge search, multi-factor suitability evaluation, and personalized farm advisory.</p>
          </div>
        </div>

        <!-- Search Crop Knowledge Section -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">${GramIcons.search} <span>Crop Knowledge Database Search</span></div>
          </div>
          <div style="display:flex; gap:0.6rem; flex-wrap:wrap; margin-bottom:0.75rem;">
            <input type="text" id="crop-search-input" class="form-control" style="flex:1; min-width:240px;" placeholder="Search crop (e.g. Wheat, Mustard, Paddy, Cotton, Chickpea, Maize, Moong, Bajra)..." 
              oninput="GramViews.handleCropSearch(this.value);"
            />
            <button class="btn btn-outline" onclick="GramViews.handleCropSearch(document.getElementById('crop-search-input').value);">
              Search
            </button>
          </div>

          <div style="display:flex; gap:0.4rem; overflow-x:auto; padding-bottom:0.4rem;">
            <button class="btn btn-outline btn-sm" onclick="GramViews.viewCropDetails('wheat')">Wheat</button>
            <button class="btn btn-outline btn-sm" onclick="GramViews.viewCropDetails('mustard')">Mustard</button>
            <button class="btn btn-outline btn-sm" onclick="GramViews.viewCropDetails('paddy')">Paddy</button>
            <button class="btn btn-outline btn-sm" onclick="GramViews.viewCropDetails('gram_chickpea')">Chickpea</button>
            <button class="btn btn-outline btn-sm" onclick="GramViews.viewCropDetails('cotton')">Cotton</button>
            <button class="btn btn-outline btn-sm" onclick="GramViews.viewCropDetails('maize')">Maize</button>
            <button class="btn btn-outline btn-sm" onclick="GramViews.viewCropDetails('moong')">Moong</button>
            <button class="btn btn-outline btn-sm" onclick="GramViews.viewCropDetails('bajra')">Bajra</button>
          </div>

          <div id="crop-profile-detail-container" style="margin-top:0.75rem;"></div>
        </div>

        <!-- Personalized Farm Profile & Evaluation -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">${GramIcons.agriculture} <span>Farm Suitability Evaluator</span></div>
          </div>
          <form id="crop-plan-form" onsubmit="event.preventDefault(); GramViews.handleCropPlanSubmit();" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.85rem;">
            <div class="form-group">
              <label class="form-label">Target Season</label>
              <select class="form-control" id="agri-season">
                <option value="Rabi">Rabi (Winter - Oct to Mar)</option>
                <option value="Kharif">Kharif (Monsoon - Jun to Oct)</option>
                <option value="Zaid">Zaid (Summer - Mar to Jun)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Soil Type</label>
              <select class="form-control" id="agri-soil">
                <option value="Alluvial">Alluvial Soil</option>
                <option value="Loam">Loamy / Sandy Loam</option>
                <option value="Black">Black Soil (Regur)</option>
                <option value="Sandy">Sandy Soil</option>
                <option value="Clay">Clay Loam</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Water Availability</label>
              <select class="form-control" id="agri-water">
                <option value="Moderate">Moderate (Solar Pump / Borewell)</option>
                <option value="Abundant">Abundant (Canal / High Water Table)</option>
                <option value="Scarce">Scarce (Rainfed / Dryland)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Farm Size (Acres)</label>
              <input type="number" class="form-control" id="agri-size" value="2.5" step="0.5" min="0.5" max="100" required />
            </div>
            <div class="form-group">
              <label class="form-label">Previous Harvested Crop</label>
              <select class="form-control" id="agri-prev">
                <option value="Paddy">Paddy / Rice</option>
                <option value="Wheat">Wheat</option>
                <option value="Maize">Maize</option>
                <option value="Moong">Moong / Pulses</option>
                <option value="Bajra">Bajra</option>
                <option value="Fallow">Fallow / None</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Irrigation Method</label>
              <select class="form-control" id="agri-irrigation">
                <option value="Drip / Sprinkler">Drip / Sprinkler (Micro-irrigation)</option>
                <option value="Flood / Furrow">Flood / Furrow</option>
                <option value="Rainfed">Rainfed</option>
              </select>
            </div>
            <div style="grid-column: span 3; display:flex; justify-content:flex-end;">
              <button type="submit" class="btn btn-primary">
                ${GramIcons.sparkle} <span>Evaluate Farm Crop Suitability</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Recommendations Results Target Container -->
        <div id="crop-results-container"></div>
      </div>
    `;
    handleCropPlanSubmit();
    GramI18n.updateDOM();
  }

  function handleCropSearch(query) {
    const results = GramStore.searchCropKnowledge(query);
    const container = document.getElementById('crop-profile-detail-container');
    if (!container) return;

    if (results.length === 0) {
      container.innerHTML = `<div style="padding:1rem; color:var(--text-muted); font-size:0.83rem;">No matching crops found in agronomic matrix.</div>`;
      return;
    }
    viewCropDetails(results[0].id);
  }

  function viewCropDetails(cropId) {
    const state = GramStore.getState();
    const crop = (state.agriMatrix || []).find(c => c.id === cropId);
    const container = document.getElementById('crop-profile-detail-container');
    if (!crop || !container) return;

    container.innerHTML = `
      <div style="padding:1rem; border-radius:var(--radius-md); background:var(--bg-main); border:1px solid var(--border); display:flex; flex-direction:column; gap:0.75rem;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <h3 style="font-size:1.15rem; font-weight:800; color:var(--text-main);">${crop.name || crop.cropName}</h3>
              <span class="badge badge-info">${crop.cropType || 'Crop Profile'}</span>
              <span class="badge badge-success">${crop.season}</span>
            </div>
            <p style="font-size:0.75rem; color:var(--text-muted); font-style:italic;">Scientific Name: ${crop.scientificName || 'N/A'}</p>
          </div>
          <button class="btn btn-outline btn-sm" onclick="GramViews.explainCropWithAI('${crop.id}');">
            ${GramIcons.sparkle} <span>Explain with AI</span>
          </button>
        </div>

        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.65rem; font-size:0.8rem;">
          <div style="background:var(--bg-surface); padding:0.6rem; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
            <strong style="color:var(--text-muted); font-size:0.7rem;">CLIMATE &amp; TEMP:</strong>
            <div>${crop.temperature}</div>
          </div>
          <div style="background:var(--bg-surface); padding:0.6rem; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
            <strong style="color:var(--text-muted); font-size:0.7rem;">SOIL &amp; PH:</strong>
            <div>${crop.soilTypes} (pH: ${crop.phRange})</div>
          </div>
          <div style="background:var(--bg-surface); padding:0.6rem; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
            <strong style="color:var(--text-muted); font-size:0.7rem;">WATER REQUIREMENT:</strong>
            <div>${crop.waterRequirement}</div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:0.65rem; font-size:0.8rem;">
          <div style="background:var(--bg-surface); padding:0.6rem; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
            <strong>Sowing Window:</strong> ${crop.sowingWindow} (Seed Rate: ${crop.seedRatePerAcre})
          </div>
          <div style="background:var(--bg-surface); padding:0.6rem; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
            <strong>Expected Yield:</strong> <strong style="color:var(--primary);">${crop.yieldEstimateQtlPerAcre}</strong> (${crop.growthDurationDays})
          </div>
        </div>

        <div id="ai-crop-explanation-${crop.id}"></div>
      </div>
    `;
  }

  async function explainCropWithAI(cropId) {
    const state = GramStore.getState();
    const crop = (state.agriMatrix || []).find(c => c.id === cropId);
    const targetEl = document.getElementById(`ai-crop-explanation-${cropId}`);
    if (!crop || !targetEl) return;

    targetEl.innerHTML = `
      <div style="padding:0.75rem; border-radius:var(--radius-sm); background:var(--primary-subtle); font-size:0.82rem; margin-top:0.4rem;">
        <em>Consulting AI agronomic reasoning engine...</em>
      </div>
    `;

    try {
      const res = await fetch('/api/crop-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crop, farmProfile: { season: crop.season, soilType: crop.soilTypes } })
      });
      const data = await res.json();
      targetEl.innerHTML = `
        <div style="padding:0.85rem; border-radius:var(--radius-sm); background:var(--primary-subtle); font-size:0.82rem; margin-top:0.4rem; border:1px solid var(--primary);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
            <strong style="color:var(--primary-dark);">${GramIcons.sparkle} AI Agronomic Advisory:</strong>
            ${getSourceBadge(data.sourceType)}
          </div>
          <div style="line-height:1.5; color:var(--text-main); white-space:pre-line;">${data.explanation}</div>
        </div>
      `;
    } catch (e) {
      targetEl.innerHTML = `<div style="color:var(--danger); font-size:0.78rem;">AI advisory service temporarily unavailable.</div>`;
    }
  }

  function handleCropPlanSubmit() {
    const season = document.getElementById('agri-season')?.value || 'Rabi';
    const soilType = document.getElementById('agri-soil')?.value || 'Alluvial';
    const waterAvail = document.getElementById('agri-water')?.value || 'Moderate';
    const farmSizeAcres = document.getElementById('agri-size')?.value || '2.5';
    const prevCrop = document.getElementById('agri-prev')?.value || 'Paddy';
    const irrigationType = document.getElementById('agri-irrigation')?.value || 'Drip / Sprinkler';

    const results = GramStore.evaluateCropRecommendation({
      season, soilType, waterAvail, farmSizeAcres, prevCrop, irrigationType
    });

    const resContainer = document.getElementById('crop-results-container');
    if (!resContainer) return;

    resContainer.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:0.85rem;">
        <h3 style="font-size:1.05rem; font-weight:700;">Recommended Crops for Evaluated Farm Profile (${results.length})</h3>
        <div class="grid-cols-2">
          ${results.map(r => `
            <div class="card" style="border-left: 4px solid ${r.score >= 75 ? 'var(--success)' : r.score >= 50 ? 'var(--warning)' : 'var(--danger)'};">
              <div class="card-header">
                <div>
                  <h4 style="font-size:1.05rem; font-weight:800;">${r.crop.name || r.crop.cropName}</h4>
                  <div style="font-size:0.72rem; color:var(--text-muted);">${r.crop.season} Season &bull; Growth: ${r.crop.growthDurationDays}</div>
                </div>
                <span class="badge ${r.score >= 75 ? 'badge-success' : 'badge-warning'}">${r.score}% Match</span>
              </div>

              <div style="font-size:0.8rem; display:flex; flex-direction:column; gap:0.35rem; margin:0.4rem 0;">
                <div><strong>Sowing Window:</strong> ${r.crop.sowingWindow}</div>
                <div><strong>Seed Rate:</strong> ${r.crop.seedRatePerAcre}</div>
                <div><strong>Est. Harvest Yield:</strong> <strong style="color:var(--primary);">${r.estTotalYieldQtl} Quintals</strong></div>
              </div>

              <div style="margin-top:0.4rem; padding:0.5rem 0.65rem; background:var(--bg-main); border-radius:var(--radius-sm); font-size:0.73rem; color:var(--text-muted); border:1px solid var(--border);">
                <strong style="color:var(--text-main);">REASONING:</strong>
                <ul style="margin-left:1.1rem; margin-top:0.25rem;">
                  ${r.reasons.map(reason => `<li>${reason}</li>`).join('')}
                </ul>
              </div>

              <div style="margin-top:0.75rem; display:flex; justify-content:space-between; align-items:center;">
                <button class="btn btn-outline btn-sm" onclick="GramViews.viewCropDetails('${r.crop.id}'); window.scrollTo({top: 180, behavior: 'smooth'});">
                  Full Profile
                </button>
                <button class="btn btn-outline btn-sm" onclick="
                  GramApp.navigate('#mandi');
                  setTimeout(() => {
                    const searchInput = document.getElementById('mandi-search');
                    if (searchInput) {
                      searchInput.value = '${(r.crop.cropName || r.crop.name).split(' ')[0]}';
                      GramViews.filterMandiTable('${(r.crop.cropName || r.crop.name).split(' ')[0]}');
                    }
                  }, 100);
                ">
                  ${GramIcons.mandi} <span>Check Mandi Rates</span>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 8. Village Weather Telemetry View
  // =========================================================================
  function renderWeather(container) {
    const state = GramStore.getState();
    const w = state.weather;

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <h2 style="font-size:1.25rem; font-weight:800;" data-i18n="weather.title">Village Micro-Climate Weather Telemetry</h2>
              ${getSourceBadge(w.sourceType)}
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted);" data-i18n="weather.subtitle">Hyperlocal weather telemetry, live satellite meteorological feed, solar irradiance, and 7-day outlook.</p>
          </div>
          <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
            <button class="btn btn-primary btn-sm" id="btn-live-location" onclick="GramViews.handleUseLiveLocation(this);">
              ${GramIcons.location} <span>Use My Live Location</span>
            </button>
            <button class="btn btn-outline btn-sm" onclick="
              GramStore.fetchLiveWeather(state.weather.location, state.weather.latitude, state.weather.longitude).then(() => {
                GramApp.showToast('Weather telemetry refreshed');
                GramViews.renderWeather(document.getElementById('page-content'));
              });
            ">
              ${GramIcons.refresh} <span>Refresh</span>
            </button>
          </div>
        </div>

        <div class="card" style="background:linear-gradient(135deg, var(--bg-surface), var(--primary-subtle)); border-color:var(--primary);">
          <div class="card-header">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              ${getSourceBadge(w.sourceType)}
              <span style="font-size:0.75rem; color:var(--text-muted);">Provider: <strong>${w.provider || 'Live Satellite Feed'}</strong></span>
            </div>
            <span style="font-size:0.8rem; color:var(--text-muted);">Location: <strong>${w.location || w.city}</strong></span>
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1.25rem; margin:0.75rem 0;">
            <div>
              <div style="font-size:3.2rem; font-weight:900; line-height:1;">${w.temperature || w.temp}°C</div>
              <div style="font-size:1rem; font-weight:700; color:var(--primary-dark); margin-top:0.3rem;">${w.condition} &bull; Feels Like ${w.feelsLike || w.temperature}°C</div>
            </div>
            <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:0.75rem 1.75rem; font-size:0.85rem;">
              <div>Relative Humidity: <strong style="font-size:0.95rem;">${w.humidity}%</strong></div>
              <div>Wind Speed: <strong style="font-size:0.95rem;">${w.windSpeed} km/h</strong></div>
              <div>Solar Irradiance: <strong style="font-size:0.95rem;">${w.solarRadiation || 780} W/m²</strong></div>
              <div>UV Index: <strong style="font-size:0.95rem;">${w.uvIndex || 6}</strong></div>
              <div>Sunrise: <strong>${w.sunrise || '05:48 AM'}</strong></div>
              <div>Sunset: <strong>${w.sunset || '06:24 PM'}</strong></div>
            </div>
          </div>
          <div style="padding:0.65rem 0.85rem; background:var(--bg-surface); border-radius:var(--radius-md); font-size:0.82rem; border:1px solid var(--border);">
            <strong style="color:var(--primary);">Agricultural &amp; Livestock Advisory:</strong> ${w.advisory}
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">7-Day Meteorological Outlook</div>
          </div>
          <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:0.6rem;" class="forecast-grid">
            ${(w.forecast || []).map(f => `
              <div style="display:flex; flex-direction:column; align-items:center; gap:0.25rem; padding:0.65rem 0.4rem; background:var(--bg-main); border:1px solid var(--border); border-radius:var(--radius-md); text-align:center;">
                <strong style="font-size:0.8rem;">${f.day}</strong>
                <div style="font-size:1.05rem; font-weight:800;">${f.tempMax}°</div>
                <div style="font-size:0.72rem; color:var(--text-muted);">${f.tempMin}°</div>
                <div style="font-size:0.68rem; color:var(--primary); font-weight:700; margin-top:0.2rem;">${f.rainChance}% Rain</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    GramI18n.updateDOM();
  }

  async function handleUseLiveLocation(btn) {
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `${GramIcons.location} Locating GPS...`;
    }

    try {
      const coords = await GramLocation.getCoordinates();
      GramApp.showToast(`Coordinates acquired (${coords.latitude}, ${coords.longitude}). Fetching live satellite weather...`);
      await GramStore.fetchLiveWeather('Current Device Location', coords.latitude, coords.longitude);
      GramApp.showToast('Live weather updated for your location!');
    } catch (e) {
      GramApp.showToast(e.message || 'Could not retrieve GPS location.');
    } finally {
      renderWeather(document.getElementById('page-content'));
    }
  }

  // =========================================================================
  // 9. Mandi Market Rates View
  // =========================================================================
  function renderMandi(container) {
    const state = GramStore.getState();
    const mandiList = state.mandiData || [];

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <h2 style="font-size:1.25rem; font-weight:800;" data-i18n="mandi.title">Agricultural Mandi Market Rates</h2>
              <span class="badge badge-info">AGMARKNET / e-NAM VERIFIED DATASET</span>
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted);">Verified Agmarknet / e-NAM commodity market rates, modal prices, and authentic 7-day price trends.</p>
          </div>
          <button class="btn btn-outline btn-sm" onclick="GramViews.explainCurrentMandiData();">
            ${GramIcons.sparkle} <span>Explain Market Data with AI</span>
          </button>
        </div>

        <div id="mandi-ai-explanation-box"></div>

        <div class="card" style="padding:0.75rem 1rem;">
          <div style="display:flex; gap:0.75rem; flex-wrap:wrap; align-items:center;">
            <div style="flex:1; min-width:200px;">
              <input type="text" id="mandi-search" class="form-control" placeholder="Search commodity (e.g. Wheat, Mustard, Cotton, Chana)..." 
                oninput="GramViews.filterMandiTable(this.value);"
              />
            </div>
            <div>
              <select id="mandi-state-filter" class="form-control" onchange="GramViews.filterMandiTable(document.getElementById('mandi-search').value);">
                <option value="">All States</option>
                <option value="Punjab">Punjab</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Haryana">Haryana</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Bihar">Bihar</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Maharashtra">Maharashtra</option>
              </select>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Commodity</th>
                  <th>Market / Mandi</th>
                  <th>State</th>
                  <th>Arrival Date</th>
                  <th>Min Price</th>
                  <th>Max Price</th>
                  <th>Modal Price</th>
                  <th>7-Day Trend</th>
                </tr>
              </thead>
              <tbody id="mandi-table-body">
                ${mandiList.map(m => `
                  <tr>
                    <td><strong style="font-size:0.9rem;">${m.crop || m.commodity}</strong></td>
                    <td>${m.market || m.mandi}</td>
                    <td><span class="badge badge-neutral">${m.state}</span></td>
                    <td>${m.date || m.arrivalDate}</td>
                    <td>₹${m.minPrice}</td>
                    <td>₹${m.maxPrice}</td>
                    <td><strong style="color:var(--primary); font-size:0.95rem;">₹${m.modalPrice} / qtl</strong></td>
                    <td>${renderSparkline(m.trend || m.priceHistory7Days, 0, undefined, '#15803d')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
    GramI18n.updateDOM();
  }

  function filterMandiTable(query) {
    const state = GramStore.getState();
    const mandiList = state.mandiData || [];
    const stateFilter = document.getElementById('mandi-state-filter')?.value || '';
    const q = (query || '').toLowerCase().trim();

    const filtered = mandiList.filter(m => {
      const cropName = (m.crop || m.commodity || '').toLowerCase();
      const marketName = (m.market || m.mandi || '').toLowerCase();
      const stateName = (m.state || '').toLowerCase();

      const matchQ = !q || cropName.includes(q) || marketName.includes(q);
      const matchState = !stateFilter || stateName === stateFilter.toLowerCase();
      return matchQ && matchState;
    });

    const tbody = document.getElementById('mandi-table-body');
    if (!tbody) return;

    tbody.innerHTML = filtered.map(m => `
      <tr>
        <td><strong style="font-size:0.9rem;">${m.crop || m.commodity}</strong></td>
        <td>${m.market || m.mandi}</td>
        <td><span class="badge badge-neutral">${m.state}</span></td>
        <td>${m.date || m.arrivalDate}</td>
        <td>₹${m.minPrice}</td>
        <td>₹${m.maxPrice}</td>
        <td><strong style="color:var(--primary); font-size:0.95rem;">₹${m.modalPrice} / qtl</strong></td>
        <td>${renderSparkline(m.trend || m.priceHistory7Days, 0, undefined, '#15803d')}</td>
      </tr>
    `).join('');
  }

  async function explainCurrentMandiData() {
    const state = GramStore.getState();
    const query = document.getElementById('mandi-search')?.value || 'Major Crops';
    const box = document.getElementById('mandi-ai-explanation-box');
    if (!box) return;

    box.innerHTML = `
      <div style="padding:0.75rem; border-radius:var(--radius-md); background:var(--primary-subtle); font-size:0.83rem;">
        <em>Analyzing current mandi market arrivals with AI...</em>
      </div>
    `;

    try {
      const res = await fetch('/api/mandi-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commodity: query, records: state.mandiData })
      });
      const data = await res.json();
      box.innerHTML = `
        <div style="padding:0.85rem; border-radius:var(--radius-md); background:var(--primary-subtle); border:1px solid var(--primary); font-size:0.83rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
            <strong style="color:var(--primary-dark);">${GramIcons.sparkle} AI Market Analysis for ${query}:</strong>
            ${getSourceBadge(data.sourceType)}
          </div>
          <div style="line-height:1.5; white-space:pre-line; color:var(--text-main);">${data.explanation}</div>
        </div>
      `;
    } catch (e) {
      box.innerHTML = `<div style="color:var(--danger); font-size:0.78rem;">Market analysis service unavailable.</div>`;
    }
  }

  // =========================================================================
  // 10. Government Welfare Schemes View
  // =========================================================================
  function renderSchemes(container) {
    const state = GramStore.getState();
    const schemes = state.schemes || [];

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <h2 style="font-size:1.25rem; font-weight:800;" data-i18n="schemes.title">Government Welfare & Agriculture Schemes</h2>
              <span class="badge badge-info">10 VERIFIED GoI SCHEMES</span>
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted);" data-i18n="schemes.subtitle">Direct benefit transfer (DBT) programs, subsidy guidelines, and official application portals.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="GramModals.showEligibilityModal();">
            ${GramIcons.check} <span data-i18n="schemes.wizard_btn">Check Scheme Eligibility Wizard</span>
          </button>
        </div>

        <div class="card" style="padding:0.75rem 1rem;">
          <input type="text" id="scheme-search-input" class="form-control" placeholder="Search schemes (e.g. Kisan, Dairy, Credit, Housing, Women, Irrigation)..." 
            oninput="GramViews.filterSchemesSearch(this.value);"
          />
        </div>

        <div style="display:flex; gap:0.45rem; flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm active" onclick="GramViews.filterSchemesByCategory('', this);">All (${schemes.length})</button>
          <button class="btn btn-outline btn-sm" onclick="GramViews.filterSchemesByCategory('central_agri', this);">Agriculture &amp; Farmers</button>
          <button class="btn btn-outline btn-sm" onclick="GramViews.filterSchemesByCategory('livestock_dairy', this);">Dairy &amp; Livestock</button>
          <button class="btn btn-outline btn-sm" onclick="GramViews.filterSchemesByCategory('finance_loans', this);">Credit &amp; Insurance</button>
          <button class="btn btn-outline btn-sm" onclick="GramViews.filterSchemesByCategory('family_housing', this);">Housing &amp; Rural Development</button>
          <button class="btn btn-outline btn-sm" onclick="GramViews.filterSchemesByCategory('women_empowerment', this);">Women</button>
        </div>

        <div class="grid-cols-2" id="schemes-cards-container">
          ${schemes.map(s => `
            <div class="card scheme-item" data-category="${s.category}" data-search="${(s.name + ' ' + s.dept + ' ' + s.benefits + ' ' + s.target).toLowerCase()}" style="cursor:pointer;" onclick="GramModals.showSchemeDetailsModal('${s.id}')">
              <div class="card-header">
                <div>
                  <span class="badge badge-info" style="font-size:0.68rem; text-transform:uppercase;">${(s.category || '').replace('_', ' ')}</span>
                  <h3 style="font-size:1rem; font-weight:800; margin-top:0.25rem;">${s.name}</h3>
                  <div style="font-size:0.72rem; color:var(--text-muted);">${s.dept}</div>
                </div>
                <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); GramModals.showSchemeDetailsModal('${s.id}');">
                  Details
                </button>
              </div>
              <div style="background:var(--bg-main); padding:0.65rem; border-radius:var(--radius-md); font-size:0.78rem; display:flex; flex-direction:column; gap:0.35rem; border:1px solid var(--border);">
                <div><strong style="color:var(--primary);">Key Benefits:</strong> ${s.benefits}</div>
                <div><strong>Who It Is For:</strong> ${s.target}</div>
                <div><strong>Eligibility:</strong> ${s.eligibility}</div>
              </div>
              <div style="margin-top:0.6rem; display:flex; justify-content:space-between; align-items:center; font-size:0.72rem; color:var(--text-muted);">
                <span>${getSourceBadge('OFFICIAL_SOURCE')}</span>
                <span style="color:var(--primary); font-weight:700;">Click for details &rarr;</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    GramI18n.updateDOM();
  }

  function filterSchemesByCategory(cat, btn) {
    if (btn) {
      document.querySelectorAll('#page-content button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    const items = document.querySelectorAll('.scheme-item');
    items.forEach(el => {
      const itemCat = el.getAttribute('data-category') || '';
      if (!cat || itemCat.toLowerCase().includes(cat.toLowerCase())) {
        el.style.display = 'block';
      } else {
        el.style.display = 'none';
      }
    });
  }

  function filterSchemesSearch(query) {
    const q = (query || '').toLowerCase().trim();
    const items = document.querySelectorAll('.scheme-item');
    items.forEach(el => {
      const searchData = el.getAttribute('data-search') || '';
      if (!q || searchData.includes(q)) {
        el.style.display = 'block';
      } else {
        el.style.display = 'none';
      }
    });
  }

  // =========================================================================
  // 11. Alert & Cellular SMS Center
  // =========================================================================
  function renderAlerts(container) {
    const state = GramStore.getState();
    const alerts = state.alerts || [];
    const smsLogs = state.smsLogs || [];

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <h2 style="font-size:1.25rem; font-weight:800;" data-i18n="alerts.title">Village Alert & Cellular SMS Center</h2>
              <span class="badge badge-simulated">SIMULATED GSM BROADCAST</span>
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted);" data-i18n="alerts.subtitle">IoT incident triggers, threshold alerts, and mobile cellular SMS broadcast audit log.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="GramModals.showSmsModal();">
            ${GramIcons.sms} <span data-i18n="alerts.dispatch_sms">Dispatch Simulated SMS</span>
          </button>
        </div>

        <div class="grid-cols-2">
          <div class="card">
            <div class="card-header">
              <div class="card-title">${GramIcons.alerts} <span>IoT Threshold Alerts (${alerts.length})</span></div>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.5rem;">
              ${alerts.map(alt => `
                <div style="display:flex; align-items:flex-start; gap:0.6rem; padding:0.65rem 0.85rem; border-radius:var(--radius-md); background:${alt.resolved ? 'var(--bg-main)' : 'var(--bg-surface)'}; border:1px solid ${alt.resolved ? 'var(--border-subtle)' : 'var(--border)'}; opacity:${alt.resolved ? '0.7' : '1'};">
                  <span class="badge badge-${alt.type === 'danger' ? 'danger' : alt.type === 'warning' ? 'warning' : 'info'}" style="text-transform:uppercase; margin-top:2px;">${alt.category}</span>
                  <div style="flex:1;">
                    <div style="font-size:0.82rem; font-weight:${alt.resolved ? '500' : '700'};">${alt.message}</div>
                    <div style="font-size:0.68rem; color:var(--text-muted);">${new Date(alt.timestamp).toLocaleTimeString()} &bull; ${alt.source} &bull; ${alt.resolved ? 'Resolved' : 'Active'}</div>
                  </div>
                  ${!alt.resolved ? `
                    <button class="btn btn-outline btn-sm" onclick="GramStore.resolveAlert('${alt.id}'); GramApp.showToast('Alert resolved'); GramViews.renderAlerts(document.getElementById('page-content'));">Resolve</button>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title">${GramIcons.sms} <span>Simulated SMS Broadcast Log (${smsLogs.length})</span></div>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.5rem;">
              ${smsLogs.map(sms => `
                <div style="padding:0.65rem 0.85rem; border-radius:var(--radius-md); background:var(--bg-main); border:1px solid var(--border);">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">
                    <strong style="font-size:0.82rem; color:var(--primary);">${sms.recipient}</strong>
                    <span class="badge badge-success" style="font-size:0.65rem;">${sms.status}</span>
                  </div>
                  <div style="font-size:0.8rem; margin-bottom:0.25rem;">${sms.message}</div>
                  <div style="font-size:0.68rem; color:var(--text-muted);">${new Date(sms.timestamp).toLocaleString()}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
    GramI18n.updateDOM();
  }

  // =========================================================================
  // 12. Google-like GramSathi AI Search & Conversation Assistant
  // =========================================================================
  let conversationHistory = [];

  function renderAssistant(container) {
    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:0.85rem; height:calc(100vh - 120px);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <h2 style="font-size:1.25rem; font-weight:800;" data-i18n="assistant.title">GramSathi AI Village Assistant</h2>
              <span class="badge badge-live">GROQ CLOUD LLM + SPEECH</span>
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted);" data-i18n="assistant.subtitle">Directly answers queries using live telemetry from solar, water tank, cattle health, dairy yield, and mandi rates.</p>
          </div>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <button class="btn btn-outline btn-sm" onclick="GramViews.clearChatHistory();">
              <span>Clear Chat</span>
            </button>
            <button class="btn btn-outline btn-sm" onclick="GramVoice.stopSpeaking(); GramApp.showToast('Voice stopped');" title="Stop voice audio">
              ${GramIcons.stop} <span>Stop Audio</span>
            </button>
          </div>
        </div>

        <div class="card" style="flex:1; display:flex; flex-direction:column; overflow:hidden; padding:0.85rem;">
          
          <!-- Quick Prompt Chips -->
          <div style="display:flex; gap:0.45rem; overflow-x:auto; padding-bottom:0.65rem; border-bottom:1px solid var(--border-subtle);">
            <button class="btn btn-outline btn-sm" onclick="GramViews.sendAssistantPrompt('How is my village today? Give a full summary.')">Full Village Summary</button>
            <button class="btn btn-outline btn-sm" onclick="GramViews.sendAssistantPrompt('What is today milk production and top cow?')">Today's Milk Yield</button>
            <button class="btn btn-outline btn-sm" onclick="GramViews.sendAssistantPrompt('Check overhead water tank level and potability')">Water Tank Status</button>
            <button class="btn btn-outline btn-sm" onclick="GramViews.sendAssistantPrompt('Is solar battery sufficient for tonight load?')">Solar Battery Runtime</button>
            <button class="btn btn-outline btn-sm" onclick="GramViews.sendAssistantPrompt('What are current modal prices for Wheat and Mustard?')">Mandi Market Rates</button>
            <button class="btn btn-outline btn-sm" onclick="GramViews.sendAssistantPrompt('Which government schemes are available for dairy farmers?')">Dairy Govt Schemes</button>
          </div>

          <!-- Chat messages area -->
          <div id="chat-messages" style="flex:1; overflow-y:auto; padding:0.85rem 0; display:flex; flex-direction:column; gap:0.75rem;">
            <div style="display:flex; gap:0.65rem; align-items:flex-start;">
              <div style="width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg, #15803d, #22c55e); color:white; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                ${GramIcons.assistant}
              </div>
              <div style="background:var(--bg-main); border:1px solid var(--border); padding:0.75rem 0.95rem; border-radius:var(--radius-lg); font-size:0.83rem; max-width:85%;">
                <div>Namaste! I am your <strong>GramSathi Rural Operating Assistant</strong>. I am connected to our village's solar microgrid, overhead potable water tank, livestock health collars, and local mandi rates.</div>
                <div style="margin-top:0.35rem; font-size:0.75rem; color:var(--text-muted);">You can type any question or tap the microphone to speak in Hindi or English.</div>
              </div>
            </div>
          </div>

          <!-- Chat Input Bar with Microphone -->
          <form onsubmit="event.preventDefault(); GramViews.handleChatSubmit();" style="display:flex; gap:0.45rem; margin-top:0.45rem;">
            
            <button type="button" id="btn-voice-mic" class="btn btn-outline" style="padding:0.5rem 0.75rem;" onclick="GramViews.toggleVoiceRecording();" title="Speak question">
              ${GramIcons.mic}
            </button>

            <input type="text" id="chat-input" class="form-control" placeholder="Ask anything about your village (e.g. water status, crop guidance, mandi prices)..." autocomplete="off" />
            
            <button type="submit" class="btn btn-primary">
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>
    `;
    GramI18n.updateDOM();
  }

  function clearChatHistory() {
    conversationHistory = [];
    const msgContainer = document.getElementById('chat-messages');
    if (msgContainer) {
      msgContainer.innerHTML = `
        <div style="display:flex; gap:0.65rem; align-items:flex-start;">
          <div style="width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg, #15803d, #22c55e); color:white; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            ${GramIcons.assistant}
          </div>
          <div style="background:var(--bg-main); border:1px solid var(--border); padding:0.75rem 0.95rem; border-radius:var(--radius-lg); font-size:0.83rem; max-width:85%;">
            <div>Chat history cleared. How can I assist you with your village today?</div>
          </div>
        </div>
      `;
    }
    GramApp.showToast('Conversation history cleared.');
  }

  function toggleVoiceRecording() {
    const micBtn = document.getElementById('btn-voice-mic');
    const input = document.getElementById('chat-input');
    if (!micBtn) return;

    if (GramVoice.isListening()) {
      GramVoice.stopListening();
      micBtn.classList.remove('mic-recording');
      micBtn.innerHTML = GramIcons.mic;
      GramApp.showToast('Voice recording stopped');
    } else {
      micBtn.classList.add('mic-recording');
      micBtn.innerHTML = `${GramIcons.mic} <span style="font-size:0.7rem; color:var(--danger); font-weight:800;">Listening...</span>`;
      GramApp.showToast('Listening... Speak now in Hindi or English.');

      GramVoice.startListening({
        onResult: (text) => {
          if (input) input.value = text;
          micBtn.classList.remove('mic-recording');
          micBtn.innerHTML = GramIcons.mic;
          handleChatSubmit();
        },
        onError: (err) => {
          micBtn.classList.remove('mic-recording');
          micBtn.innerHTML = GramIcons.mic;
          GramApp.showToast(err);
        },
        onEnd: () => {
          micBtn.classList.remove('mic-recording');
          micBtn.innerHTML = GramIcons.mic;
        }
      });
    }
  }

  function sendAssistantPrompt(text) {
    const input = document.getElementById('chat-input');
    if (input) {
      input.value = text;
      handleChatSubmit();
    }
  }

  async function handleChatSubmit() {
    const input = document.getElementById('chat-input');
    const msgContainer = document.getElementById('chat-messages');
    if (!input || !msgContainer) return;
    const userText = input.value.trim();
    if (!userText) return;
    input.value = '';

    // Append User message
    const userEl = document.createElement('div');
    userEl.style.cssText = 'display:flex; justify-content:flex-end;';
    userEl.innerHTML = `
      <div style="background:var(--primary); color:white; padding:0.65rem 0.85rem; border-radius:var(--radius-lg); font-size:0.83rem; max-width:85%;">
        ${userText}
      </div>
    `;
    msgContainer.appendChild(userEl);
    msgContainer.scrollTop = msgContainer.scrollHeight;

    // Append Bot Thinking placeholder
    const botEl = document.createElement('div');
    botEl.style.cssText = 'display:flex; gap:0.65rem; align-items:flex-start;';
    botEl.innerHTML = `
      <div style="width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg, #15803d, #22c55e); color:white; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
        ${GramIcons.assistant}
      </div>
      <div style="background:var(--bg-main); border:1px solid var(--border); padding:0.75rem 0.95rem; border-radius:var(--radius-lg); font-size:0.83rem; max-width:85%;">
        <em>Checking village records and querying AI engine...</em>
      </div>
    `;
    msgContainer.appendChild(botEl);
    msgContainer.scrollTop = msgContainer.scrollHeight;

    const state = GramStore.getState();
    const totals = GramStore.getDairyTotals();
    const activeAlerts = (state.alerts || []).filter(a => !a.resolved);
    const feverish = (state.iot.livestock || []).filter(a => a.temperature > 39.5);
    const currentLang = localStorage.getItem('gramsathi_lang') || 'en';

    const contextPayload = {
      villageName: state.villageName,
      villageState: state.villageState,
      waterLevel: state.iot.water.tankLevel,
      waterFlow: state.iot.water.flowRate,
      waterPh: state.iot.water.ph,
      waterTurbidity: state.iot.water.turbidity,
      pumpStatus: state.iot.water.pumpStatus,
      solarGen: state.iot.energy.solarGeneration,
      batterySoc: state.iot.energy.batterySoc,
      villageLoad: state.iot.energy.villageLoad,
      inverterEff: state.iot.energy.inverterEfficiency,
      livestockCount: state.iot.livestock.length,
      feverAlerts: feverish.length > 0 ? feverish.map(a => `${a.name} (${a.temperature}°C)`).join(', ') : 'None',
      todayMilk: totals.todayTotal,
      topAnimal: state.iot.livestock[0] ? `${state.iot.livestock[0].name} (${state.iot.livestock[0].id})` : 'Cattle',
      weatherTemp: state.weather.temperature || state.weather.temp,
      weatherCond: state.weather.condition,
      weatherHum: state.weather.humidity,
      weatherWind: state.weather.windSpeed,
      activeAlertsSummary: activeAlerts.length > 0 ? activeAlerts.map(a => a.message).join(' | ') : 'All nominal'
    };

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          language: currentLang,
          context: contextPayload,
          conversationHistory
        })
      });
      const data = await res.json();
      const reply = data.reply || 'Namaste! I checked the village records.';

      // Save to conversation history
      conversationHistory.push({ role: 'user', content: userText });
      conversationHistory.push({ role: 'assistant', content: reply });

      botEl.querySelector('div:last-child').innerHTML = `
        <div style="line-height:1.5; white-space:pre-line;">${reply}</div>
        
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.6rem; padding-top:0.4rem; border-top:1px solid var(--border-subtle); font-size:0.7rem; color:var(--text-muted); flex-wrap:wrap; gap:0.4rem;">
          <div style="display:flex; align-items:center; gap:0.4rem;">
            ${getSourceBadge(data.sourceType || 'LIVE')}
            <span>${data.provider || 'Groq LLM'}</span>
          </div>
          <button class="btn btn-outline btn-sm" style="padding:0.2rem 0.4rem; font-size:0.68rem;" onclick="GramVoice.speak(this.closest('div').previousElementSibling.textContent);">
            ${GramIcons.speaker} <span>Read Aloud</span>
          </button>
        </div>
      `;
    } catch (e) {
      botEl.querySelector('div:last-child').innerHTML = `
        <div>I am currently in local offline mode. All village telemetry systems are operating. How else can I assist?</div>
      `;
    }

    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  // =========================================================================
  // 13. Settings & Product Governance View
  // =========================================================================
  function renderSettings(container) {
    const state = GramStore.getState();
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        <div>
          <h2 style="font-size:1.25rem; font-weight:800;" data-i18n="settings.title">Hub Settings & Product Configuration</h2>
          <p style="font-size:0.8rem; color:var(--text-muted);" data-i18n="settings.subtitle">Configure village hub identity, language, theme, simulation speed, and persistent backups.</p>
        </div>

        <div class="grid-cols-2">
          
          <!-- GENERAL SETTINGS CARD -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">${GramIcons.settings} <span>General Settings</span></div>
            </div>
            <div class="form-group">
              <label class="form-label">Village Hub Name</label>
              <input type="text" class="form-control" id="settings-village-name" value="${state.villageName}" />
            </div>
            <div class="form-group">
              <label class="form-label">State / Region</label>
              <input type="text" class="form-control" id="settings-village-state" value="${state.villageState}" />
            </div>
            <div class="form-group">
              <label class="form-label">Active Interface Theme</label>
              <select class="form-control" onchange="
                document.documentElement.setAttribute('data-theme', this.value);
                localStorage.setItem('gramsathi_theme', this.value);
                GramApp.showToast('Theme set to ' + this.value);
              ">
                <option value="light" ${currentTheme === 'light' ? 'selected' : ''}>Light Theme</option>
                <option value="dark" ${currentTheme === 'dark' ? 'selected' : ''}>Dark Theme</option>
              </select>
            </div>
            <button class="btn btn-primary btn-sm" onclick="
              const s = GramStore.getState();
              s.villageName = document.getElementById('settings-village-name').value;
              s.villageState = document.getElementById('settings-village-state').value;
              GramStore.saveState();
              GramApp.showToast('Village hub details updated successfully');
            ">Save Village Profile</button>
          </div>

          <!-- DATA & AI STATUS CARD -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">${GramIcons.sparkle} <span>AI &amp; Data Source Status</span></div>
            </div>
            <div style="font-size:0.83rem; display:flex; flex-direction:column; gap:0.5rem;">
              <div style="display:flex; justify-content:space-between; padding-bottom:0.35rem; border-bottom:1px solid var(--border-subtle);">
                <span>Primary AI Assistant</span>
                <strong style="color:var(--primary);">Groq Cloud API (Llama 3.3)</strong>
              </div>
              <div style="display:flex; justify-content:space-between; padding-bottom:0.35rem; border-bottom:1px solid var(--border-subtle);">
                <span>Weather Telemetry</span>
                <span class="badge badge-live">Live Satellite Feed</span>
              </div>
              <div style="display:flex; justify-content:space-between; padding-bottom:0.35rem; border-bottom:1px solid var(--border-subtle);">
                <span>Mandi Commodity Market</span>
                <span class="badge badge-info">Agmarknet / e-NAM</span>
              </div>
              <div style="display:flex; justify-content:space-between; padding-bottom:0.35rem; border-bottom:1px solid var(--border-subtle);">
                <span>Government Schemes</span>
                <span class="badge badge-info">GoI Welfare Catalog</span>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span>IoT Telemetry Mode</span>
                <span class="badge badge-simulated">Simulated Sensors</span>
              </div>
            </div>
          </div>

          <!-- DATA PERSISTENCE & BACKUP -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">${GramIcons.download} <span>Data Persistence &amp; Backup</span></div>
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.75rem;">
              Export all village telemetry, livestock profiles, dairy entries, and alert logs as a single structured JSON backup.
            </p>
            <div style="display:flex; flex-direction:column; gap:0.6rem;">
              <button class="btn btn-outline" onclick="
                const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(GramStore.getState(), null, 2));
                const a = document.createElement('a');
                a.href = dataStr;
                a.download = 'GramSathi_Complete_Backup_' + new Date().toISOString().split('T')[0] + '.json';
                a.click();
                GramApp.showToast('Full village JSON backup downloaded');
              ">
                ${GramIcons.download} <span>Export Complete Village Backup (JSON)</span>
              </button>
            </div>
          </div>

          <!-- DANGER ZONE -->
          <div class="card" style="border-color:rgba(220,38,38,0.3);">
            <div class="card-header">
              <div class="card-title" style="color:var(--danger);">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                <span>Danger Zone</span>
              </div>
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.75rem;">
              Reset all telemetry and dairy records to clean factory demonstration defaults.
            </p>
            <button class="btn btn-danger btn-sm" onclick="GramModals.showResetModal();">
              ${GramIcons.refresh} <span>Reset Demo State</span>
            </button>
          </div>

        </div>
      </div>
    `;
    GramI18n.updateDOM();
  }

  // =========================================================================
  // 14. Export & Reports Hub View
  // =========================================================================
  function renderExport(container) {
    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        <div>
          <h2 style="font-size:1.25rem; font-weight:800;" data-i18n="export.title">Export & Village Reporting Hub</h2>
          <p style="font-size:0.8rem; color:var(--text-muted);" data-i18n="export.subtitle">Download official CSV/JSON data logs and comprehensive human-readable village status reports.</p>
        </div>

        <div class="grid-cols-2">
          
          <!-- Comprehensive Report -->
          <div class="card" style="grid-column:span 2; background:linear-gradient(135deg, var(--bg-surface), var(--primary-subtle)); border-color:var(--primary);">
            <div class="card-header">
              <div class="card-title">
                ${GramIcons.sparkle} <span>Complete Village Status Report</span>
              </div>
              <span class="badge badge-primary">COMPREHENSIVE</span>
            </div>
            <p style="font-size:0.83rem; color:var(--text-main); margin-bottom:1rem;">
              Generates an executive synthesized report covering Village Overview, Solar Microgrid, Potable Water Telemetry, Livestock &amp; Dairy Revenue, Crop Advisories, and System Incident Logs.
            </p>
            <div style="display:flex; gap:0.6rem; flex-wrap:wrap;">
              <button class="btn btn-primary" onclick="GramStore.exportVillageReport('markdown'); GramApp.showToast('Village Report downloaded in Markdown format');">
                ${GramIcons.download} <span>Download Full Village Report (Markdown)</span>
              </button>
              <button class="btn btn-outline" onclick="GramStore.exportVillageReport('json'); GramApp.showToast('Village Report downloaded in JSON format');">
                ${GramIcons.download} <span>Export Full Report (JSON)</span>
              </button>
            </div>
          </div>

          <!-- Milk Records Export -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">${GramIcons.dairy} <span>Dairy &amp; Milk Records</span></div>
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.75rem;">
              Export daily morning/evening milk collection volume, Fat %, SNF %, rate per liter, and producer details.
            </p>
            <div style="display:flex; gap:0.5rem;">
              <button class="btn btn-outline btn-sm" style="flex:1;" onclick="GramStore.exportDairyCsv(); GramApp.showToast('Milk records exported as CSV');">Export CSV</button>
              <button class="btn btn-outline btn-sm" style="flex:1;" onclick="GramStore.exportDairyJson(); GramApp.showToast('Milk records exported as JSON');">Export JSON</button>
            </div>
          </div>

          <!-- Livestock Census Export -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">${GramIcons.livestock} <span>Livestock Census</span></div>
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.75rem;">
              Export cattle tags, breeds, physiological collar telemetry (temperature, heart rate, rumination), and health notes.
            </p>
            <div style="display:flex; gap:0.5rem;">
              <button class="btn btn-outline btn-sm" style="flex:1;" onclick="GramStore.exportLivestockCsv(); GramApp.showToast('Livestock census exported as CSV');">Export CSV</button>
              <button class="btn btn-outline btn-sm" style="flex:1;" onclick="GramStore.exportLivestockJson(); GramApp.showToast('Livestock census exported as JSON');">Export JSON</button>
            </div>
          </div>

          <!-- Water Telemetry Export -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">${GramIcons.water} <span>Water Telemetry</span></div>
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.75rem;">
              Export overhead storage levels, water pH, turbidity NTU readings, and solar pump operational history.
            </p>
            <div style="display:flex; gap:0.5rem;">
              <button class="btn btn-outline btn-sm" style="flex:1;" onclick="GramStore.exportWaterCsv(); GramApp.showToast('Water telemetry exported as CSV');">Export CSV</button>
              <button class="btn btn-outline btn-sm" style="flex:1;" onclick="GramStore.exportWaterJson(); GramApp.showToast('Water telemetry exported as JSON');">Export JSON</button>
            </div>
          </div>

          <!-- Energy Microgrid Export -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">${GramIcons.energy} <span>Solar Microgrid</span></div>
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.75rem;">
              Export PV output generation, LiFePO4 battery SoC, connected village load, and inverter efficiency logs.
            </p>
            <div style="display:flex; gap:0.5rem;">
              <button class="btn btn-outline btn-sm" style="flex:1;" onclick="GramStore.exportEnergyCsv(); GramApp.showToast('Energy microgrid exported as CSV');">Export CSV</button>
              <button class="btn btn-outline btn-sm" style="flex:1;" onclick="GramStore.exportEnergyJson(); GramApp.showToast('Energy microgrid exported as JSON');">Export JSON</button>
            </div>
          </div>

        </div>
      </div>
    `;
    GramI18n.updateDOM();
  }

  return {
    renderDashboard,
    handleUniversalSearch,
    renderCosmos,
    renderWater,
    renderLivestock,
    renderDairy,
    renderEnergy,
    renderAgriculture,
    handleCropSearch,
    viewCropDetails,
    explainCropWithAI,
    handleCropPlanSubmit,
    renderWeather,
    handleUseLiveLocation,
    renderMandi,
    filterMandiTable,
    explainCurrentMandiData,
    renderSchemes,
    filterSchemesByCategory,
    filterSchemesSearch,
    renderAlerts,
    renderAssistant,
    clearChatHistory,
    toggleVoiceRecording,
    sendAssistantPrompt,
    handleChatSubmit,
    renderSettings,
    renderExport
  };
})();
