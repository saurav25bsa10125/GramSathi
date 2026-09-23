// GramSathi Unified Views Renderer Library
window.GramViews = (function() {

  function renderSparkline(values, minVal, maxVal, color = '#16a34a') {
    const width = 110;
    const height = 26;
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

  // Helper: Source Badges
  function getSourceBadge(sourceType) {
    switch(sourceType) {
      case 'LIVE':
      case 'LIVE_WEATHER':
      case 'LIVE_AI':
        return `<span class="badge badge-live">🟢 LIVE DATA</span>`;
      case 'USER_ENTERED':
        return `<span class="badge badge-user">🔵 USER ENTERED</span>`;
      case 'SIMULATED':
        return `<span class="badge badge-simulated">⚪ SIMULATED SENSOR</span>`;
      case 'CACHED':
      case 'VERIFIED_OFFICIAL':
        return `<span class="badge badge-info" style="font-size:0.68rem; font-weight:700;">🟣 VERIFIED DATA</span>`;
      case 'DEMO':
      case 'DEMO_WEATHER':
      default:
        return `<span class="badge badge-demo">🟡 DEMO DATA</span>`;
    }
  }

  // =========================================================================
  // 1. Dashboard: Village Live Command Center
  // =========================================================================
  function renderDashboard(container) {
    const state = GramStore.getState();
    const totals = GramStore.getDairyTotals();
    const activeAlerts = (state.alerts || []).filter(a => !a.resolved);
    const w = state.iot.water;
    const e = state.iot.energy;
    const ls = state.iot.livestock;
    const feverCattle = ls.filter(a => a.temperature > 39.5);
    const now = new Date();

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        
        <!-- Header Banner: Village Live Command Center -->
        <div class="dashboard-banner">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.75rem;">
            <div>
              <div style="display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap; margin-bottom:0.25rem;">
                <h1 style="font-size:1.4rem; font-weight:900; color:var(--text-main);">${state.villageName}</h1>
                <span class="badge badge-live">🟢 VILLAGE LIVE COMMAND CENTER</span>
                <span class="badge badge-simulated">⚪ IoT PROOF-OF-CONCEPT</span>
              </div>
              <p style="font-size:0.82rem; color:var(--text-muted);">
                ${state.villageState} • Central Microgrid, Gravity Water Telemetry, Cattle Health Hub & Mandi Intelligence
              </p>
              <div style="display:flex; align-items:center; gap:0.8rem; font-size:0.72rem; color:var(--text-muted); margin-top:0.4rem;">
                <span>📅 ${now.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span>•</span>
                <span>🕒 Last Synced: <strong id="dash-last-sync">${new Date(state.lastSyncTime || Date.now()).toLocaleTimeString()}</strong></span>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
              <button class="btn btn-outline btn-sm" id="btn-refresh-all" onclick="GramViews.handleRefreshAllData(this);">
                ${getIcon('refresh')} <span>Refresh All Data</span>
              </button>
              <button class="btn btn-outline btn-sm" onclick="GramApp.toggleKioskMode(true);">
                ${getIcon('display')} <span>Kiosk Wall Display</span>
              </button>
              <button class="btn btn-primary btn-sm" onclick="GramModals.showRecordMilkModal();">
                ${getIcon('plus')} <span>Record Milk Log</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Today's Village Brief: Connected Summary Bar -->
        <div class="card" style="padding:1rem 1.25rem; background:var(--bg-surface-elevated);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
            <div style="font-size:0.75rem; font-weight:800; text-transform:uppercase; color:var(--text-muted); letter-spacing:0.05em;">
              Today's Village Brief — Real-Time Systems Status
            </div>
            <span style="font-size:0.7rem; color:var(--primary); font-weight:700;">Click any card to inspect module →</span>
          </div>
          <div style="display:grid; grid-template-columns:repeat(6, 1fr); gap:0.75rem;" class="brief-grid">
            
            <!-- Water brief -->
            <a href="#water" class="brief-card" title="Open Water Telemetry">
              <span class="brief-label">WATER TANK</span>
              <strong class="brief-value" style="color:var(--info);">${w.tankLevel}% Level</strong>
              <span class="brief-sub" style="color:${w.turbidity > 5 ? 'var(--danger)' : 'var(--success)'};">
                ${w.turbidity > 5 ? '⚠️ Filter Check' : 'Potable (pH ' + w.ph + ')'}
              </span>
            </a>

            <!-- Livestock brief -->
            <a href="#livestock" class="brief-card" title="Open Cattle Telemetry">
              <span class="brief-label">LIVESTOCK</span>
              <strong class="brief-value">${ls.length} Monitored</strong>
              <span class="brief-sub" style="color:${feverCattle.length > 0 ? 'var(--danger)' : 'var(--success)'};">
                ${feverCattle.length > 0 ? feverCattle.length + ' Warning Alert' : 'All Vitals Normal'}
              </span>
            </a>

            <!-- Milk brief -->
            <a href="#dairy" class="brief-card" title="Open Dairy Ledger">
              <span class="brief-label">MILK COLLECTED</span>
              <strong class="brief-value" style="color:var(--primary);">${totals.todayTotal} L</strong>
              <span class="brief-sub" style="color:var(--text-muted);">Est. ₹${totals.estTodayRev}</span>
            </a>

            <!-- Solar / Energy brief -->
            <a href="#energy" class="brief-card" title="Open Solar Microgrid">
              <span class="brief-label">SOLAR MICROGRID</span>
              <strong class="brief-value" style="color:var(--accent);">${e.solarGeneration} kW Gen</strong>
              <span class="brief-sub" style="color:var(--text-muted);">${e.batterySoc}% Battery</span>
            </a>

            <!-- Weather brief -->
            <a href="#weather" class="brief-card" title="Open Village Weather">
              <span class="brief-label">WEATHER</span>
              <strong class="brief-value">${state.weather.temperature || state.weather.temp}°C</strong>
              <span class="brief-sub" style="color:var(--text-muted);">${state.weather.condition}</span>
            </a>

            <!-- Alerts brief -->
            <a href="#alerts" class="brief-card" title="Open Incident Center">
              <span class="brief-label">INCIDENTS</span>
              <strong class="brief-value" style="color:${activeAlerts.length > 0 ? 'var(--warning)' : 'var(--success)'};">${activeAlerts.length} Active</strong>
              <span class="brief-sub" style="color:var(--text-muted);">View Incident Log</span>
            </a>

          </div>
        </div>

        <!-- Interactive IoT Demo Scenario Controls -->
        <div class="scenario-bar">
          <span class="scenario-label">${getIcon('refresh')} Live Simulation Demo Scenarios:</span>
          <button class="btn btn-outline btn-sm" onclick="GramStore.simulateWaterScenario('low_flow'); GramApp.showToast('Simulated Low Water Flow (3.2 L/min)'); GramViews.renderDashboard(document.getElementById('page-content'));">
            💧 Low Water Flow
          </button>
          <button class="btn btn-outline btn-sm" onclick="GramStore.simulateWaterScenario('high_turbidity'); GramApp.showToast('Simulated Turbidity Spike (7.8 NTU)'); GramViews.renderDashboard(document.getElementById('page-content'));">
            ⚠️ Turbidity Spike
          </button>
          <button class="btn btn-outline btn-sm" onclick="GramStore.simulateEnergyScenario('high_solar'); GramApp.showToast('Simulated Peak Solar Generation (5.8 kW)'); GramViews.renderDashboard(document.getElementById('page-content'));">
            ☀️ Peak Solar Gen
          </button>
          <button class="btn btn-outline btn-sm" onclick="GramStore.simulateEnergyScenario('battery_critical'); GramApp.showToast('Simulated Battery Critical (18%)'); GramViews.renderDashboard(document.getElementById('page-content'));">
            ⚡ Battery Critical
          </button>
          <button class="btn btn-outline btn-sm" onclick="GramStore.simulateWaterScenario('normal'); GramStore.simulateEnergyScenario('normal'); GramApp.showToast('All Systems Restored to Baseline Baseline'); GramViews.renderDashboard(document.getElementById('page-content'));">
            🔄 Restore Nominal Baseline
          </button>
        </div>

        <!-- 4 Primary Stat Cards -->
        <div class="grid-cols-4">
          
          <!-- Solar Battery SoC -->
          <div class="stat-card" onclick="window.location.hash = '#energy';" style="cursor:pointer;">
            <div class="stat-icon-wrapper" style="background:var(--accent-subtle); color:var(--accent);">
              ${getIcon('energy')}
            </div>
            <span class="stat-label">Solar Battery SoC</span>
            <span class="stat-value" id="dash-battery-soc">${e.batterySoc}%</span>
            <div class="progress-bar-container">
              <div class="progress-fill ${e.batterySoc < 25 ? 'danger' : e.batterySoc < 50 ? 'warning' : ''}" style="width:${e.batterySoc}%;"></div>
            </div>
            <div class="stat-footer" style="color:var(--text-muted); justify-content:space-between;">
              <span>Gen: <strong>${e.solarGeneration} kW</strong></span>
              <span>Load: <strong>${e.villageLoad} kW</strong></span>
            </div>
          </div>

          <!-- Water Tank Level -->
          <div class="stat-card" onclick="window.location.hash = '#water';" style="cursor:pointer;">
            <div class="stat-icon-wrapper" style="background:var(--info-subtle); color:var(--info);">
              ${getIcon('water')}
            </div>
            <span class="stat-label">Overhead Tank Level</span>
            <span class="stat-value" id="dash-tank-level">${w.tankLevel}%</span>
            <div class="progress-bar-container">
              <div class="progress-fill ${w.tankLevel < 25 ? 'danger' : 'info'}" style="width:${w.tankLevel}%;"></div>
            </div>
            <div class="stat-footer" style="color:var(--text-muted); justify-content:space-between;">
              <span>Pump: <strong class="badge ${w.pumpStatus.includes('ON') ? 'badge-success' : 'badge-neutral'}">${w.pumpStatus}</strong></span>
              <span>pH: <strong>${w.ph}</strong></span>
            </div>
          </div>

          <!-- Monitored Livestock -->
          <div class="stat-card" onclick="window.location.hash = '#livestock';" style="cursor:pointer;">
            <div class="stat-icon-wrapper" style="background:var(--success-subtle); color:var(--success);">
              ${getIcon('livestock')}
            </div>
            <span class="stat-label">Livestock Telemetry</span>
            <span class="stat-value">${ls.length} <span style="font-size:0.95rem; font-weight:600; color:var(--text-muted);">Heads</span></span>
            <div class="stat-footer" style="color:var(--success); font-weight:600; margin-top:0.4rem;">
              ${getIcon('check')} <span>100% In Geofenced Pasture</span>
            </div>
          </div>

          <!-- Milk Revenue Est -->
          <div class="stat-card" onclick="window.location.hash = '#dairy';" style="cursor:pointer;">
            <div class="stat-icon-wrapper" style="background:var(--primary-subtle); color:var(--primary);">
              ${getIcon('dairy')}
            </div>
            <span class="stat-label">Today's Milk Collected</span>
            <span class="stat-value">${totals.todayTotal} <span style="font-size:0.95rem; font-weight:600; color:var(--text-muted);">L</span></span>
            <div class="stat-footer" style="color:var(--text-muted); justify-content:space-between;">
              <span>Est. Revenue: <strong style="color:var(--primary);">₹${totals.estTodayRev}</strong></span>
              <span class="badge badge-user" style="font-size:0.6rem;">USER ESTIMATE</span>
            </div>
          </div>

        </div>

        <!-- Middle Grid: Modular Quick Hubs -->
        <div class="grid-cols-3">
          
          <!-- Solar Microgrid Card -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">${getIcon('energy')} <span>Solar Microgrid</span></div>
              <a href="#energy" class="btn btn-outline btn-sm">Control Panel</a>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.65rem; font-size:0.83rem;">
              <div style="display:flex; justify-content:space-between; padding-bottom:0.4rem; border-bottom:1px solid var(--border-subtle);">
                <span style="color:var(--text-muted);">Solar PV Array</span>
                <strong style="color:var(--accent);">${e.solarGeneration} kW</strong>
              </div>
              <div style="display:flex; justify-content:space-between; padding-bottom:0.4rem; border-bottom:1px solid var(--border-subtle);">
                <span style="color:var(--text-muted);">Essential Village Load</span>
                <strong>${e.villageLoad} kW</strong>
              </div>
              <div style="display:flex; justify-content:space-between; padding-bottom:0.4rem; border-bottom:1px solid var(--border-subtle);">
                <span style="color:var(--text-muted);">Inverter Efficiency</span>
                <strong style="color:var(--success);">${e.inverterEfficiency}%</strong>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span style="color:var(--text-muted);">Est. Battery Runtime</span>
                <strong>~${Math.round((e.batterySoc / 100 * e.batteryCapacityKwh) / (e.villageLoad || 1))} Hours</strong>
              </div>
            </div>
          </div>

          <!-- Community Water Hub -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">${getIcon('water')} <span>Potable Water Hub</span></div>
              <a href="#water" class="btn btn-outline btn-sm">Telemetry</a>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.65rem; font-size:0.83rem;">
              <div style="display:flex; justify-content:space-between; padding-bottom:0.4rem; border-bottom:1px solid var(--border-subtle);">
                <span style="color:var(--text-muted);">Turbidity</span>
                <strong style="color:${w.turbidity > 5 ? 'var(--danger)' : 'var(--success)'};">${w.turbidity} NTU</strong>
              </div>
              <div style="display:flex; justify-content:space-between; padding-bottom:0.4rem; border-bottom:1px solid var(--border-subtle);">
                <span style="color:var(--text-muted);">Water Potability</span>
                <span class="badge ${w.turbidity > 5 ? 'badge-danger' : 'badge-success'}">${w.turbidity > 5 ? 'Filtration Required' : 'Safe Potable (WHO)'}</span>
              </div>
              <div style="display:flex; justify-content:space-between; padding-bottom:0.4rem; border-bottom:1px solid var(--border-subtle);">
                <span style="color:var(--text-muted);">Active Pump</span>
                <span>${w.activePump.split('(')[0]}</span>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span style="color:var(--text-muted);">Daily Village Draw</span>
                <strong>${w.dailyConsumption} L / day</strong>
              </div>
            </div>
          </div>

          <!-- Village Weather Snapshot -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">${getIcon('weather')} <span>Village Weather</span></div>
              ${getSourceBadge(state.weather.sourceType)}
            </div>
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.6rem;">
              <div>
                <div style="font-size:1.85rem; font-weight:800; line-height:1.1;">${state.weather.temperature || state.weather.temp}°C</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">${state.weather.condition} • ${state.weather.location || state.weather.city}</div>
              </div>
              <div style="text-align:right; font-size:0.75rem; color:var(--text-muted); line-height:1.4;">
                <div>Humidity: <strong>${state.weather.humidity}%</strong></div>
                <div>Wind: <strong>${state.weather.windSpeed} km/h</strong></div>
                <div>Solar Rad: <strong>${state.weather.solarRadiation || 780} W/m²</strong></div>
              </div>
            </div>
            <p style="font-size:0.75rem; color:var(--text-muted); background:var(--bg-main); padding:0.45rem 0.6rem; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
              ${state.weather.advisory || 'Suitable conditions for field irrigation and crop inspection.'}
            </p>
          </div>

        </div>

        <!-- Bottom Row: Active Alerts & Quick Action Shortcuts -->
        <div class="grid-cols-2">
          
          <!-- Active Alerts Feed -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                ${getIcon('alerts')} 
                <span>Active Alerts</span> 
                <span class="badge ${activeAlerts.length > 0 ? 'badge-warning' : 'badge-success'}">${activeAlerts.length}</span>
              </div>
              <a href="#alerts" class="btn btn-outline btn-sm">Alert Center</a>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.45rem;">
              ${activeAlerts.length === 0 ? `
                <div style="padding:1.5rem; text-align:center; color:var(--text-muted); font-size:0.83rem;">
                  ${getIcon('check')} All village IoT systems operating under nominal baseline parameters.
                </div>
              ` : activeAlerts.slice(0, 3).map(alt => `
                <div style="display:flex; align-items:flex-start; gap:0.6rem; padding:0.55rem 0.75rem; border-radius:var(--radius-md); background:var(--bg-main); border:1px solid var(--border);">
                  <span class="badge badge-${alt.type === 'danger' ? 'danger' : alt.type === 'warning' ? 'warning' : 'info'}" style="text-transform:uppercase; margin-top:2px;">${alt.category}</span>
                  <div style="flex:1;">
                    <div style="font-size:0.8rem; font-weight:600;">${alt.message}</div>
                    <div style="font-size:0.68rem; color:var(--text-muted);">${new Date(alt.timestamp).toLocaleTimeString()} • ${alt.source}</div>
                  </div>
                  <button class="btn btn-outline btn-sm" onclick="GramStore.resolveAlert('${alt.id}'); GramApp.showToast('Alert resolved'); GramViews.renderDashboard(document.getElementById('page-content'));">Resolve</button>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Connected Quick Actions -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">${getIcon('dashboard')} <span>Quick Village Operations</span></div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.6rem;">
              <button class="btn btn-outline" onclick="GramModals.showRecordMilkModal();" style="justify-content:flex-start;">
                ${getIcon('dairy')} <span>Record Milk Log</span>
              </button>
              <button class="btn btn-outline" onclick="GramModals.showAddAnimalModal();" style="justify-content:flex-start;">
                ${getIcon('livestock')} <span>Register Cattle Tag</span>
              </button>
              <button class="btn btn-outline" onclick="GramModals.showSmsModal();" style="justify-content:flex-start;">
                ${getIcon('sms')} <span>Simulate SMS Alert</span>
              </button>
              <button class="btn btn-outline" onclick="GramModals.showEligibilityModal();" style="justify-content:flex-start;">
                ${getIcon('schemes')} <span>Check Govt Schemes</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    `;
    GramI18n.updateDOM();
  }

  async function handleRefreshAllData(btn) {
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `${getIcon('refresh')} <span class="spinner-inline"></span> Refreshing...`;
    }
    try {
      const res = await GramStore.refreshAllData();
      GramApp.showToast('All village API datasets refreshed successfully!');
    } catch (e) {
      GramApp.showToast('Data refreshed with local fallbacks.');
    } finally {
      renderDashboard(document.getElementById('page-content'));
    }
  }

  // =========================================================================
  // 2. Water Management View
  // =========================================================================
  function renderWater(container) {
    const state = GramStore.getState();
    const w = state.iot.water;

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <h2 style="font-size:1.25rem; font-weight:800;">Water Telemetry & Pump Automation</h2>
              ${getSourceBadge(w.sourceType)}
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted);">Real-time monitoring of community overhead tank, solar pump automation, and potable drinking water standards.</p>
          </div>
          <div style="display:flex; gap:0.5rem;">
            <button class="btn ${w.pumpStatus.includes('ON') ? 'btn-danger' : 'btn-primary'}" onclick="
              const s = GramStore.getState();
              s.iot.water.pumpStatus = s.iot.water.pumpStatus === 'MANUAL_ON' ? 'AUTO_OFF' : 'MANUAL_ON';
              GramStore.saveState();
              GramApp.showToast('Solar pump state changed to ' + s.iot.water.pumpStatus);
              GramViews.renderWater(document.getElementById('page-content'));
            ">
              ${w.pumpStatus.includes('ON') ? 'Stop Solar Pump' : 'Start Solar Pump'}
            </button>
          </div>
        </div>

        <!-- Water Scenarios -->
        <div class="scenario-bar">
          <span class="scenario-label">${getIcon('refresh')} Water Scenarios:</span>
          <button class="btn btn-outline btn-sm" onclick="GramStore.simulateWaterScenario('low_flow'); GramApp.showToast('Simulated Low Water Flow (3.2 L/min)'); GramViews.renderWater(document.getElementById('page-content'));">
            Simulate Low Flow (3.2 L/min)
          </button>
          <button class="btn btn-outline btn-sm" onclick="GramStore.simulateWaterScenario('high_turbidity'); GramApp.showToast('Simulated Turbidity Spike (7.8 NTU)'); GramViews.renderWater(document.getElementById('page-content'));">
            Simulate Turbidity Spike (7.8 NTU)
          </button>
          <button class="btn btn-outline btn-sm" onclick="GramStore.simulateWaterScenario('refill'); GramApp.showToast('Refilled Overhead Tank to 92%'); GramViews.renderWater(document.getElementById('page-content'));">
            Simulate Tank Refill (92%)
          </button>
          <button class="btn btn-outline btn-sm" onclick="GramStore.simulateWaterScenario('normal'); GramApp.showToast('Water metrics restored to nominal baseline'); GramViews.renderWater(document.getElementById('page-content'));">
            Restore Nominal
          </button>
        </div>

        <div class="grid-cols-4">
          <div class="stat-card">
            <span class="stat-label">Tank Level</span>
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
              <div class="card-title">7-Day Tank Storage Trend</div>
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
                <span>Backup DC Pump</span>
                <span>P-02 (Standby Ready)</span>
              </div>
              <div style="display:flex; justify-content:space-between; padding-bottom:0.35rem; border-bottom:1px solid var(--border-subtle);">
                <span>Auto-Refill Threshold</span>
                <strong style="color:var(--info);">&lt; 25% Auto-Start, &gt; 95% Auto-Stop</strong>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span>Filtration Unit</span>
                <strong style="color:var(--success);">Dual Sand & Activated Carbon</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    GramI18n.updateDOM();
  }

  // =========================================================================
  // 3. Smart Livestock Hub View
  // =========================================================================
  function renderLivestock(container) {
    const state = GramStore.getState();
    const ls = state.iot.livestock || [];

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <h2 style="font-size:1.25rem; font-weight:800;">Smart Livestock Hub & Health Telemetry</h2>
              <span class="badge badge-simulated">⚪ SIMULATED RFID & COLLAR DATA</span>
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted);">RFID identification, health collar telemetry (temp, heart rate, rumination), lactation cycles, and geofence tracking.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="GramModals.showAddAnimalModal();">
            ${getIcon('plus')} <span>Register Cattle Tag</span>
          </button>
        </div>

        <div style="padding:0.6rem 0.9rem; border-radius:var(--radius-md); background:var(--bg-surface); border:1px solid var(--border); font-size:0.75rem; color:var(--text-muted);">
          <strong>* Disclaimer:</strong> Livestock telemetry collar readings are simulated demonstration alerts based on indicative physiological thresholds — not a medical or veterinary diagnosis.
        </div>

        <div class="grid-cols-2">
          ${ls.map(animal => `
            <div class="card">
              <div class="card-header">
                <div style="display:flex; align-items:center; gap:0.4rem; flex-wrap:wrap;">
                  <span class="badge badge-neutral" style="font-weight:700;">${animal.id}</span>
                  <strong style="font-size:1.05rem;">${animal.name}</strong>
                  <span class="badge ${animal.temperature > 39.5 ? 'badge-danger' : 'badge-success'}">${animal.breed}</span>
                </div>
                <button class="btn btn-outline btn-sm" onclick="GramModals.showAnimalProfileModal('${animal.id}')">
                  View Full Profile
                </button>
              </div>

              <!-- Mini telemetry vitals -->
              <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.6rem; margin:0.6rem 0; background:var(--bg-main); padding:0.65rem; border-radius:var(--radius-md); border:1px solid var(--border);">
                <div>
                  <div style="font-size:0.68rem; color:var(--text-muted); font-weight:600;">BODY TEMP</div>
                  <div style="font-size:1.05rem; font-weight:800; color:${animal.temperature > 39.5 ? 'var(--danger)' : 'inherit'};">${animal.temperature}°C</div>
                </div>
                <div>
                  <div style="font-size:0.68rem; color:var(--text-muted); font-weight:600;">HEART RATE</div>
                  <div style="font-size:1.05rem; font-weight:800;">${animal.heartRate} bpm</div>
                </div>
                <div>
                  <div style="font-size:0.68rem; color:var(--text-muted); font-weight:600;">RUMINATION</div>
                  <div style="font-size:1.05rem; font-weight:800; color:var(--success);">${animal.ruminationMinutes} min</div>
                </div>
              </div>

              <div style="font-size:0.8rem; display:flex; flex-direction:column; gap:0.3rem;">
                <div style="display:flex; justify-content:space-between;">
                  <span style="color:var(--text-muted);">Lactation Stage:</span>
                  <strong>${animal.lactationStage}</strong>
                </div>
                <div style="display:flex; justify-content:space-between;">
                  <span style="color:var(--text-muted);">Daily Feed Ration:</span>
                  <span>Green: ${animal.feedRation.green}kg | Dry: ${animal.feedRation.dry}kg | Conc: ${animal.feedRation.concentrate}kg</span>
                </div>
                <div style="display:flex; justify-content:space-between;">
                  <span style="color:var(--text-muted);">Geofence:</span>
                  <span style="color:var(--success); font-weight:600;">${animal.geofenceStatus}</span>
                </div>
              </div>
            </div>
          `).join('')}
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
              <h2 style="font-size:1.25rem; font-weight:800;">Dairy Operations & Milk Records</h2>
              <span class="badge badge-user">🔵 USER-ENTERED / LEDGER DATA</span>
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted);">Morning and evening collections, Fat/SNF tracking, yield totals, revenue estimator, and CSV records export.</p>
          </div>
          <div style="display:flex; gap:0.5rem;">
            <button class="btn btn-outline btn-sm" onclick="GramStore.exportDairyCsv(); GramApp.showToast('Milk records exported as CSV');">
              ${getIcon('download')} <span>Export CSV</span>
            </button>
            <button class="btn btn-primary btn-sm" onclick="GramModals.showRecordMilkModal();">
              ${getIcon('plus')} <span>Record Milk Entry</span>
            </button>
          </div>
        </div>

        <!-- Totals & User Price Estimator -->
        <div class="grid-cols-4">
          <div class="stat-card">
            <span class="stat-label">Today's Total Yield</span>
            <span class="stat-value">${totals.todayTotal} <span style="font-size:0.95rem;">L</span></span>
            <div class="stat-footer" style="color:var(--primary); font-weight:600;">Est. Value: ₹${totals.estTodayRev}</div>
          </div>
          <div class="stat-card">
            <span class="stat-label">7-Day Cumulative</span>
            <span class="stat-value">${totals.weeklyTotal} <span style="font-size:0.95rem;">L</span></span>
            <div class="stat-footer" style="color:var(--primary); font-weight:600;">Est. Value: ₹${totals.estWeeklyRev}</div>
          </div>
          <div class="stat-card">
            <span class="stat-label">30-Day Cumulative</span>
            <span class="stat-value">${totals.monthlyTotal} <span style="font-size:0.95rem;">L</span></span>
            <div class="stat-footer" style="color:var(--primary); font-weight:600;">Est. Value: ₹${totals.estMonthlyRev}</div>
          </div>
          <div class="stat-card" style="background:var(--primary-subtle); border-color:var(--primary);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span class="stat-label" style="color:var(--primary-dark); font-weight:700;">Rate Estimator (₹/L)</span>
              <span class="badge badge-user" style="font-size:0.6rem;">USER ESTIMATE</span>
            </div>
            <div style="display:flex; align-items:center; gap:0.4rem; margin-top:0.3rem;">
              <span style="font-size:1.3rem; font-weight:800; color:var(--primary-dark);">₹</span>
              <input type="number" id="milk-price-input" value="${totals.pricePerLiter}" min="10" max="200" step="1" 
                class="form-control" style="font-size:1.1rem; font-weight:800; width:85px; padding:0.2rem 0.4rem;"
                onchange="
                  const val = parseFloat(this.value) || 55;
                  const s = GramStore.getState();
                  s.dairy.milkPricePerLiter = val;
                  GramStore.saveState();
                  GramApp.showToast('Baseline milk price updated to ₹' + val + '/L');
                  GramViews.renderDairy(document.getElementById('page-content'));
                "
              />
            </div>
            <div class="stat-footer" style="color:var(--primary-dark); font-size:0.7rem;">Enter assumed payout rate</div>
          </div>
        </div>

        <!-- Milk Entries Table -->
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
                  <th>Animal ID</th>
                  <th>Quantity (L)</th>
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
                    <td><a href="javascript:void(0)" onclick="GramModals.showAnimalProfileModal('${r.animalId}')" style="font-weight:700; color:var(--primary); text-decoration:none;">${r.animalId}</a></td>
                    <td><strong style="color:var(--primary); font-size:0.92rem;">${r.liters} L</strong></td>
                    <td>${r.fat}%</td>
                    <td>${r.snf}%</td>
                    <td>${r.farmer}</td>
                    <td><strong>₹${Math.round(r.liters * totals.pricePerLiter)}</strong></td>
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
  // 5. Energy & Solar Microgrid View
  // =========================================================================
  function renderEnergy(container) {
    const state = GramStore.getState();
    const e = state.iot.energy;

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <h2 style="font-size:1.25rem; font-weight:800;">Solar Microgrid & Energy Control Panel</h2>
              <span class="badge badge-simulated">⚪ SIMULATED POWER TELEMETRY</span>
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted);">Real-time PV generation, LiFePO4 battery SoC, inverter telemetry, and village load balancing.</p>
          </div>
        </div>

        <!-- 6 Interactive Scenario Controls -->
        <div class="scenario-bar">
          <span class="scenario-label">${getIcon('refresh')} Energy Scenario Controls:</span>
          <button class="btn btn-outline btn-sm ${e.scenario && e.scenario.includes('Peak') ? 'active' : ''}" onclick="GramStore.simulateEnergyScenario('high_solar'); GramApp.showToast('Scenario: Peak Sunlight (5.8 kW)'); GramViews.renderEnergy(document.getElementById('page-content'));">
            ☀️ High Solar Gen
          </button>
          <button class="btn btn-outline btn-sm ${e.scenario && e.scenario.includes('Low') ? 'active' : ''}" onclick="GramStore.simulateEnergyScenario('low_solar'); GramApp.showToast('Scenario: Low Solar (1.2 kW)'); GramViews.renderEnergy(document.getElementById('page-content'));">
            ⛅ Low Solar Gen
          </button>
          <button class="btn btn-outline btn-sm ${e.scenario && e.scenario.includes('High Village') ? 'active' : ''}" onclick="GramStore.simulateEnergyScenario('high_load'); GramApp.showToast('Scenario: High Village Load (4.8 kW)'); GramViews.renderEnergy(document.getElementById('page-content'));">
            ⚡ High Consumption
          </button>
          <button class="btn btn-outline btn-sm ${e.scenario && e.scenario.includes('Critical') ? 'active' : ''}" onclick="GramStore.simulateEnergyScenario('battery_critical'); GramApp.showToast('Scenario: Battery Critical (18%)'); GramViews.renderEnergy(document.getElementById('page-content'));">
            ⚠️ Battery Critical
          </button>
          <button class="btn btn-outline btn-sm ${e.scenario && e.scenario.includes('Night') ? 'active' : ''}" onclick="GramStore.simulateEnergyScenario('night_low'); GramApp.showToast('Scenario: Night Battery Inverter Mode'); GramViews.renderEnergy(document.getElementById('page-content'));">
            🌙 Night Mode
          </button>
          <button class="btn btn-outline btn-sm ${e.scenario && e.scenario.includes('Nominal') ? 'active' : ''}" onclick="GramStore.simulateEnergyScenario('normal'); GramApp.showToast('Restored Nominal Solar Parameters'); GramViews.renderEnergy(document.getElementById('page-content'));">
            🔄 Normal Restore
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
            <div class="stat-footer">Bank Capacity: ${e.batteryCapacityKwh} kWh</div>
          </div>
          <div class="stat-card">
            <span class="stat-label">Village Essential Load</span>
            <span class="stat-value">${e.villageLoad} <span style="font-size:0.95rem;">kW</span></span>
            <div class="stat-footer">Water pump, Clinic, Hub WiFi</div>
          </div>
          <div class="stat-card">
            <span class="stat-label">Inverter Efficiency</span>
            <span class="stat-value">${e.inverterEfficiency}%</span>
            <div class="stat-footer" style="color:var(--success); font-weight:600;">Pure Sine Wave</div>
          </div>
        </div>

        <div class="grid-cols-2">
          <div class="card">
            <div class="card-header">
              <div class="card-title">Daily Solar Generation Trend (kW)</div>
              ${renderSparkline(e.history, 0, 6, '#d97706')}
            </div>
            <div style="margin-top:0.75rem; font-size:0.82rem; color:var(--text-muted);">
              Total energy harvested today: <strong style="color:var(--text-main); font-size:0.95rem;">${e.dailySolarGeneratedKwh} kWh</strong>. Offsets approx. 24 kg CO₂ daily.
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title">Circuit Routing & Battery Runtime</div>
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
                <span>Active Simulation Scenario</span>
                <strong style="color:var(--accent);">${e.scenario || 'Nominal Daytime'}</strong>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span>Estimated Backup Runtime</span>
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
  // 6. Smart Agriculture Advisor & Hybrid Crop Knowledge
  // =========================================================================
  function renderAgriculture(container) {
    const state = GramStore.getState();
    const crops = state.agriMatrix || [];

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <h2 style="font-size:1.25rem; font-weight:800;">Smart Agriculture & Hybrid Crop Advisor</h2>
              <span class="badge badge-live">ICAR AGRONOMIC DATA + AI REASONING</span>
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted);">Scientific crop knowledge search, multi-factor suitability evaluation, and personalized farm advisory.</p>
          </div>
        </div>

        <!-- 1. Search Any Crop Knowledge Section -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">${getIcon('search')} <span>Crop Knowledge Database Search</span></div>
          </div>
          <div style="display:flex; gap:0.6rem; flex-wrap:wrap; margin-bottom:0.75rem;">
            <input type="text" id="crop-search-input" class="form-control" style="flex:1; min-width:240px;" placeholder="Search crop (e.g. Wheat, Mustard, Paddy, Cotton, Chickpea, Maize, Moong, Bajra)..." 
              oninput="GramViews.handleCropSearch(this.value);"
            />
            <button class="btn btn-outline" onclick="GramViews.handleCropSearch(document.getElementById('crop-search-input').value);">
              Search Knowledge Base
            </button>
          </div>

          <!-- Quick Crop Chips -->
          <div style="display:flex; gap:0.4rem; overflow-x:auto; padding-bottom:0.4rem;">
            <button class="btn btn-outline btn-sm" onclick="GramViews.viewCropDetails('wheat')">🌾 Wheat</button>
            <button class="btn btn-outline btn-sm" onclick="GramViews.viewCropDetails('mustard')">🌼 Mustard</button>
            <button class="btn btn-outline btn-sm" onclick="GramViews.viewCropDetails('paddy')">🍚 Paddy</button>
            <button class="btn btn-outline btn-sm" onclick="GramViews.viewCropDetails('gram_chickpea')">🌱 Chickpea (Chana)</button>
            <button class="btn btn-outline btn-sm" onclick="GramViews.viewCropDetails('cotton')">☁️ Cotton</button>
            <button class="btn btn-outline btn-sm" onclick="GramViews.viewCropDetails('maize')">🌽 Maize</button>
            <button class="btn btn-outline btn-sm" onclick="GramViews.viewCropDetails('moong')">🌿 Moong</button>
            <button class="btn btn-outline btn-sm" onclick="GramViews.viewCropDetails('bajra')">🌾 Bajra</button>
          </div>

          <!-- Crop Knowledge Details Target Container -->
          <div id="crop-profile-detail-container" style="margin-top:0.75rem;"></div>
        </div>

        <!-- 2. Personalized Crop Planning Form -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">${getIcon('agriculture')} <span>Personalized Farm Profile & Evaluation</span></div>
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
                ${getIcon('sparkle')} <span>Evaluate Farm Crop Suitability</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Recommendations Container -->
        <div id="crop-results-container"></div>

        <!-- Advisory Notice -->
        <div style="padding:0.7rem 1rem; border-radius:var(--radius-md); background:var(--warning-subtle); color:var(--warning); font-size:0.75rem; border:1px solid rgba(217,119,6,0.2);">
          <strong>* Agronomic Advisory Notice:</strong> General advisory. Verify local recommendations with an agriculture expert / Krishi Vigyan Kendra (KVK) / official source before making major farm decisions.
        </div>
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
      <div style="padding:1.1rem; border-radius:var(--radius-md); background:var(--bg-main); border:1px solid var(--border); display:flex; flex-direction:column; gap:0.75rem;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <h3 style="font-size:1.15rem; font-weight:800; color:var(--text-main);">${crop.name || crop.cropName}</h3>
              <span class="badge badge-info">${crop.cropType || 'Crop Profile'}</span>
              <span class="badge badge-success">${crop.season}</span>
            </div>
            <p style="font-size:0.78rem; color:var(--text-muted); font-style:italic;">Scientific Name: ${crop.scientificName || 'N/A'}</p>
          </div>
          <button class="btn btn-outline btn-sm" onclick="GramViews.explainCropWithAI('${crop.id}');">
            ${getIcon('sparkle')} <span>Explain with AI</span>
          </button>
        </div>

        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.65rem; font-size:0.8rem;">
          <div style="background:var(--bg-surface); padding:0.6rem; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
            <strong style="color:var(--text-muted); font-size:0.7rem;">CLIMATE & TEMP:</strong>
            <div>${crop.temperature}</div>
            <div style="font-size:0.72rem; color:var(--text-muted);">${crop.climate}</div>
          </div>
          <div style="background:var(--bg-surface); padding:0.6rem; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
            <strong style="color:var(--text-muted); font-size:0.7rem;">SOIL & PH:</strong>
            <div>${crop.soilTypes}</div>
            <div style="font-size:0.72rem; color:var(--text-muted);">Optimal pH: ${crop.phRange}</div>
          </div>
          <div style="background:var(--bg-surface); padding:0.6rem; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
            <strong style="color:var(--text-muted); font-size:0.7rem;">WATER & IRRIGATION:</strong>
            <div>${crop.waterRequirement}</div>
            <div style="font-size:0.72rem; color:var(--text-muted);">${crop.waterDesc}</div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:0.65rem; font-size:0.8rem;">
          <div style="background:var(--bg-surface); padding:0.6rem; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
            <strong style="color:var(--text-muted); font-size:0.7rem;">SOWING & SEED RATE:</strong>
            <div>Sowing Window: <strong>${crop.sowingWindow}</strong></div>
            <div>Seed Rate: ${crop.seedRatePerAcre} | Spacing: ${crop.spacing}</div>
          </div>
          <div style="background:var(--bg-surface); padding:0.6rem; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
            <strong style="color:var(--text-muted); font-size:0.7rem;">HARVEST & YIELD:</strong>
            <div>Harvest Window: <strong>${crop.harvestWindow}</strong> (${crop.growthDurationDays})</div>
            <div>Expected Yield: <strong style="color:var(--primary);">${crop.yieldEstimateQtlPerAcre}</strong></div>
          </div>
        </div>

        <div style="font-size:0.8rem; background:var(--bg-surface); padding:0.65rem; border-radius:var(--radius-sm); border:1px solid var(--border-subtle); display:flex; flex-direction:column; gap:0.35rem;">
          <div><strong style="color:var(--text-main);">NPK & Fertilizer Plan:</strong> ${crop.fertilizerPlan ? Object.values(crop.fertilizerPlan).join(' • ') : 'Standard balanced NPK'}</div>
          <div><strong style="color:var(--text-main);">Pests & Diseases:</strong> ${crop.commonPests} • ${crop.commonDiseases}</div>
          <div><strong style="color:var(--text-main);">Prevention & Management:</strong> ${crop.preventionPractices}</div>
          <div><strong style="color:var(--text-main);">Storage & Post-Harvest:</strong> ${crop.storageGuidance}</div>
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
            <strong style="color:var(--primary-dark);">${getIcon('sparkle')} AI Farmer-Friendly Advisory:</strong>
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
                  <div style="font-size:0.72rem; color:var(--text-muted);">${r.crop.season} Season • Growth Duration: ${r.crop.growthDurationDays}</div>
                </div>
                <div style="text-align:right;">
                  <span class="badge ${r.score >= 75 ? 'badge-success' : 'badge-warning'}" style="font-size:0.82rem; padding:0.25rem 0.55rem;">${r.score}% Match</span>
                </div>
              </div>

              <div style="font-size:0.8rem; display:flex; flex-direction:column; gap:0.35rem; margin:0.4rem 0;">
                <div><strong>Sowing Window:</strong> ${r.crop.sowingWindow}</div>
                <div><strong>Seed Rate:</strong> ${r.crop.seedRatePerAcre}</div>
                <div><strong>Fertilizer Plan:</strong> ${r.crop.fertilizerPlan ? Object.values(r.crop.fertilizerPlan).slice(0, 2).join(', ') : 'Balanced NPK'}</div>
                <div><strong>Est. Harvest Yield:</strong> <strong style="color:var(--primary); font-size:0.9rem;">${r.estTotalYieldQtl} Quintals</strong> (${r.crop.yieldEstimateQtlPerAcre || 'Standard'})</div>
              </div>

              <!-- "WHY THIS CROP?" Reasoning Breakdown -->
              <div style="margin-top:0.4rem; padding:0.5rem 0.65rem; background:var(--bg-main); border-radius:var(--radius-sm); font-size:0.73rem; color:var(--text-muted); border:1px solid var(--border);">
                <strong style="color:var(--text-main);">WHY THIS RECOMMENDATION:</strong>
                <ul style="margin-left:1.1rem; margin-top:0.25rem;">
                  ${r.reasons.map(reason => `<li>${reason}</li>`).join('')}
                </ul>
              </div>

              <!-- Actions -->
              <div style="margin-top:0.75rem; display:flex; justify-content:space-between; align-items:center;">
                <button class="btn btn-outline btn-sm" onclick="GramViews.viewCropDetails('${r.crop.id}'); window.scrollTo({top: 200, behavior: 'smooth'});">
                  Full Crop Profile
                </button>
                <button class="btn btn-outline btn-sm" onclick="
                  window.location.hash = '#mandi';
                  setTimeout(() => {
                    const searchInput = document.getElementById('mandi-search');
                    if (searchInput) {
                      searchInput.value = '${(r.crop.cropName || r.crop.name).split(' ')[0]}';
                      GramViews.filterMandiTable('${(r.crop.cropName || r.crop.name).split(' ')[0]}');
                    }
                  }, 100);
                ">
                  ${getIcon('mandi')} <span>Check Mandi Rates</span>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 7. Village Weather View (With Live GPS Geolocation)
  // =========================================================================
  function renderWeather(container) {
    const state = GramStore.getState();
    const w = state.weather;

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <h2 style="font-size:1.25rem; font-weight:800;">Village Micro-Climate Weather Telemetry</h2>
              ${getSourceBadge(w.sourceType)}
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted);">Hyperlocal weather telemetry, live satellite meteorological feed, solar irradiance, and 7-day outlook.</p>
          </div>
          <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
            
            <!-- Live Location Button -->
            <button class="btn btn-primary btn-sm" id="btn-live-location" onclick="GramViews.handleUseLiveLocation(this);">
              ${getIcon('location')} <span>Use My Live Location</span>
            </button>

            <select class="form-control" id="weather-city-select" style="width:160px;" onchange="
              const city = this.value;
              GramStore.fetchLiveWeather(city).then(() => {
                GramApp.showToast('Weather updated for ' + city);
                GramViews.renderWeather(document.getElementById('page-content'));
              });
            ">
              <option value="Rampur Village Hub" ${w.location && w.location.includes('Rampur') ? 'selected' : ''}>Rampur Village (UP)</option>
              <option value="Anand" ${w.location && w.location.includes('Anand') ? 'selected' : ''}>Anand (Gujarat)</option>
              <option value="Ludhiana" ${w.location && w.location.includes('Ludhiana') ? 'selected' : ''}>Ludhiana (Punjab)</option>
              <option value="Karnal" ${w.location && w.location.includes('Karnal') ? 'selected' : ''}>Karnal (Haryana)</option>
              <option value="Jaipur" ${w.location && w.location.includes('Jaipur') ? 'selected' : ''}>Jaipur (Rajasthan)</option>
              <option value="Coimbatore" ${w.location && w.location.includes('Coimbatore') ? 'selected' : ''}>Coimbatore (TN)</option>
            </select>

            <button class="btn btn-outline btn-sm" onclick="
              GramStore.fetchLiveWeather(state.weather.location, state.weather.latitude, state.weather.longitude).then(() => {
                GramApp.showToast('Weather telemetry refreshed');
                GramViews.renderWeather(document.getElementById('page-content'));
              });
            ">
              ${getIcon('refresh')} <span>Refresh</span>
            </button>
          </div>
        </div>

        <!-- Weather Card Banner -->
        <div class="card" style="background:linear-gradient(135deg, var(--bg-surface), var(--primary-subtle)); border-color:var(--primary);">
          <div class="card-header">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              ${getSourceBadge(w.sourceType)}
              <span style="font-size:0.75rem; color:var(--text-muted);">Provider: <strong>${w.provider || 'Live Satellite Feed'}</strong></span>
            </div>
            <span style="font-size:0.8rem; color:var(--text-muted);">Location: <strong>${w.location || w.city}</strong> ${w.latitude ? `(${w.latitude}°N, ${w.longitude}°E)` : ''}</span>
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1.25rem; margin:0.75rem 0;">
            <div>
              <div style="font-size:3.2rem; font-weight:900; line-height:1;">${w.temperature || w.temp}°C</div>
              <div style="font-size:1rem; font-weight:700; color:var(--primary-dark); margin-top:0.3rem;">${w.condition} • Feels Like ${w.feelsLike || w.temperature}°C</div>
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
            <strong style="color:var(--primary);">Agricultural & Livestock Advisory:</strong> ${w.advisory}
          </div>
        </div>

        <!-- 7-Day Forecast Cards -->
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
      btn.innerHTML = `${getIcon('location')} Retrieving GPS...`;
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
  // 8. Mandi Prices & Market Intelligence
  // =========================================================================
  function renderMandi(container) {
    const state = GramStore.getState();
    const mandiList = state.mandiData || [];

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <h2 style="font-size:1.25rem; font-weight:800;">Agricultural Mandi Market Rates</h2>
              <span class="badge badge-live">AGMARKNET / e-NAM VERIFIED DATASET</span>
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted);">Verified Agmarknet / e-NAM commodity market rates, modal prices, and authentic 7-day price trends.</p>
          </div>
          <button class="btn btn-outline btn-sm" onclick="GramViews.explainCurrentMandiData();">
            ${getIcon('sparkle')} <span>Explain Market Data with AI</span>
          </button>
        </div>

        <!-- AI Explanation Target Container -->
        <div id="mandi-ai-explanation-box"></div>

        <!-- Filter Controls -->
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

        <!-- Mandi Table -->
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

        <div style="font-size:0.73rem; color:var(--text-muted); text-align:center;">
          * Market prices sourced via Agmarknet / e-NAM verified agricultural terminal market baseline.
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
            <strong style="color:var(--primary-dark);">${getIcon('sparkle')} AI Market Analysis for ${query}:</strong>
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
  // 9. Government Welfare Schemes View
  // =========================================================================
  function renderSchemes(container) {
    const state = GramStore.getState();
    const schemes = state.schemes || [];

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <h2 style="font-size:1.25rem; font-weight:800;">Government Welfare & Agriculture Schemes</h2>
              <span class="badge badge-live">10 VERIFIED OFFICIAL GoI SCHEMES</span>
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted);">Direct benefit transfer (DBT) programs, subsidy guidelines, and official application portals.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="GramModals.showEligibilityModal();">
            ${getIcon('check')} <span>Check Scheme Eligibility Wizard</span>
          </button>
        </div>

        <!-- Search Bar -->
        <div class="card" style="padding:0.75rem 1rem;">
          <input type="text" id="scheme-search-input" class="form-control" placeholder="Search schemes (e.g. Kisan, Dairy, Credit, Housing, Women, Irrigation)..." 
            oninput="GramViews.filterSchemesSearch(this.value);"
          />
        </div>

        <!-- Filter category tags -->
        <div style="display:flex; gap:0.45rem; flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm active" onclick="GramViews.filterSchemesByCategory('', this);">All Schemes (${schemes.length})</button>
          <button class="btn btn-outline btn-sm" onclick="GramViews.filterSchemesByCategory('central_agri', this);">Agriculture & Direct Benefit</button>
          <button class="btn btn-outline btn-sm" onclick="GramViews.filterSchemesByCategory('livestock_dairy', this);">Dairy & Livestock</button>
          <button class="btn btn-outline btn-sm" onclick="GramViews.filterSchemesByCategory('finance_loans', this);">Credit & Insurance</button>
          <button class="btn btn-outline btn-sm" onclick="GramViews.filterSchemesByCategory('family_housing', this);">Housing & Welfare</button>
          <button class="btn btn-outline btn-sm" onclick="GramViews.filterSchemesByCategory('women_empowerment', this);">Women Farmers</button>
        </div>

        <!-- Scheme Cards Grid -->
        <div class="grid-cols-2" id="schemes-cards-container">
          ${schemes.map(s => `
            <div class="card scheme-item" data-category="${s.category}" data-search="${(s.name + ' ' + s.dept + ' ' + s.benefits + ' ' + s.target).toLowerCase()}">
              <div class="card-header">
                <div>
                  <span class="badge badge-info" style="font-size:0.68rem; text-transform:uppercase;">${s.category.replace('_', ' ')}</span>
                  <h3 style="font-size:1rem; font-weight:800; margin-top:0.25rem;">${s.name}</h3>
                  <div style="font-size:0.72rem; color:var(--text-muted);">${s.dept}</div>
                </div>
                <a href="${s.link || s.officialPortal || 'https://www.myscheme.gov.in/'}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="gap:0.3rem;">
                  <span>Apply Portal</span> ${getIcon('external')}
                </a>
              </div>
              <div style="background:var(--bg-main); padding:0.65rem; border-radius:var(--radius-md); font-size:0.78rem; display:flex; flex-direction:column; gap:0.35rem; border:1px solid var(--border);">
                <div><strong style="color:var(--primary);">Key Benefits:</strong> ${s.benefits}</div>
                <div><strong>Target Beneficiaries:</strong> ${s.target}</div>
                <div><strong>Eligibility:</strong> ${s.eligibility}</div>
                <div><strong>Required Documents:</strong> ${s.documents || 'Aadhaar, Land records, Bank account'}</div>
                <div><strong>Application Process:</strong> ${s.process}</div>
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
  // 10. Alert Center View
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
              <h2 style="font-size:1.25rem; font-weight:800;">Village Alert & Cellular SMS Center</h2>
              <span class="badge badge-simulated">⚪ SIMULATED GSM BROADCAST</span>
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted);">IoT incident triggers, threshold alerts, and mobile cellular SMS broadcast audit log.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="GramModals.showSmsModal();">
            ${getIcon('sms')} <span>Dispatch Simulated SMS</span>
          </button>
        </div>

        <div class="grid-cols-2">
          <!-- Live Alerts -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">${getIcon('alerts')} <span>IoT Threshold Alerts (${alerts.length})</span></div>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.5rem;">
              ${alerts.map(alt => `
                <div style="display:flex; align-items:flex-start; gap:0.6rem; padding:0.65rem 0.85rem; border-radius:var(--radius-md); background:${alt.resolved ? 'var(--bg-main)' : 'var(--bg-surface)'}; border:1px solid ${alt.resolved ? 'var(--border-subtle)' : 'var(--border)'}; opacity:${alt.resolved ? '0.7' : '1'};">
                  <span class="badge badge-${alt.type === 'danger' ? 'danger' : alt.type === 'warning' ? 'warning' : 'info'}" style="text-transform:uppercase; margin-top:2px;">${alt.category}</span>
                  <div style="flex:1;">
                    <div style="font-size:0.82rem; font-weight:${alt.resolved ? '500' : '700'};">${alt.message}</div>
                    <div style="font-size:0.68rem; color:var(--text-muted);">${new Date(alt.timestamp).toLocaleTimeString()} • ${alt.source} • ${alt.resolved ? 'Resolved' : 'Active'}</div>
                  </div>
                  ${!alt.resolved ? `
                    <button class="btn btn-outline btn-sm" onclick="GramStore.resolveAlert('${alt.id}'); GramApp.showToast('Alert resolved'); GramViews.renderAlerts(document.getElementById('page-content'));">Resolve</button>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>

          <!-- SMS Simulation Logs -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">${getIcon('sms')} <span>Simulated SMS Broadcast Log (${smsLogs.length})</span></div>
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
  // 11. Context-Aware AI Assistant View (With Speech In & Speech Out)
  // =========================================================================
  function renderAssistant(container) {
    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:0.85rem; height:calc(100vh - 120px);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <h2 style="font-size:1.25rem; font-weight:800;">GramSathi AI Village Assistant</h2>
              <span class="badge badge-live">🟢 CONTEXT-AWARE LLM + SPEECH</span>
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted);">Directly answers queries using live telemetry from solar, water tank, cattle health, dairy yield, and mandi rates.</p>
          </div>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <button class="btn btn-outline btn-sm" onclick="GramVoice.stopSpeaking(); GramApp.showToast('Voice stopped');" title="Stop audio playback">
              ${getIcon('stop')} <span>Stop Voice</span>
            </button>
          </div>
        </div>

        <div class="card" style="flex:1; display:flex; flex-direction:column; overflow:hidden; padding:0.85rem;">
          
          <!-- Quick Prompt Chips -->
          <div style="display:flex; gap:0.45rem; overflow-x:auto; padding-bottom:0.65rem; border-bottom:1px solid var(--border-subtle);">
            <button class="btn btn-outline btn-sm" onclick="GramViews.sendAssistantPrompt('What is today\'s milk production and top animal?')">🥛 Today's Milk Total</button>
            <button class="btn btn-outline btn-sm" onclick="GramViews.sendAssistantPrompt('Check overhead water tank level and potability')">💧 Water Tank Status</button>
            <button class="btn btn-outline btn-sm" onclick="GramViews.sendAssistantPrompt('Is solar battery sufficient for tonight load?')">⚡ Solar Battery Runtime</button>
            <button class="btn btn-outline btn-sm" onclick="GramViews.sendAssistantPrompt('Which animals currently have health alerts?')">🐄 Cattle Health Check</button>
            <button class="btn btn-outline btn-sm" onclick="GramViews.sendAssistantPrompt('What is current modal price for Wheat in Punjab mandi?')">🌾 Wheat Mandi Rate</button>
            <button class="btn btn-outline btn-sm" onclick="GramViews.sendAssistantPrompt('Check PM-Kisan and KCC scheme benefits')">📜 PM-Kisan Benefits</button>
          </div>

          <!-- Chat messages area -->
          <div id="chat-messages" style="flex:1; overflow-y:auto; padding:0.85rem 0; display:flex; flex-direction:column; gap:0.65rem;">
            <div style="display:flex; gap:0.65rem; align-items:flex-start;">
              <div style="width:32px; height:32px; border-radius:50%; background:var(--primary); color:white; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                ${getIcon('assistant')}
              </div>
              <div style="background:var(--bg-main); border:1px solid var(--border); padding:0.65rem 0.85rem; border-radius:var(--radius-lg); font-size:0.83rem; max-width:85%;">
                <div>Namaste! I am your <strong>GramSathi Rural Operating Assistant</strong>. I am connected to our village's solar microgrid, overhead potable water tank, livestock health collars, and local mandi rates.</div>
                <div style="margin-top:0.35rem; font-size:0.75rem; color:var(--text-muted);">You can type or click the microphone 🎤 button to speak in Hindi or English.</div>
              </div>
            </div>
          </div>

          <!-- Chat Input with Microphone Button -->
          <form onsubmit="event.preventDefault(); GramViews.handleChatSubmit();" style="display:flex; gap:0.45rem; margin-top:0.45rem;">
            
            <!-- Microphone Voice Button -->
            <button type="button" id="btn-voice-mic" class="btn btn-outline" style="padding:0.5rem 0.75rem;" onclick="GramViews.toggleVoiceRecording();" title="Speak question">
              ${getIcon('mic')}
            </button>

            <input type="text" id="chat-input" class="form-control" placeholder="Ask about solar energy, water potability, cattle health, or mandi rates..." autocomplete="off" />
            
            <button type="submit" class="btn btn-primary">
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    `;
    GramI18n.updateDOM();
  }

  function toggleVoiceRecording() {
    const micBtn = document.getElementById('btn-voice-mic');
    const input = document.getElementById('chat-input');
    if (!micBtn) return;

    if (GramVoice.isListening()) {
      GramVoice.stopListening();
      micBtn.classList.remove('mic-recording');
      micBtn.innerHTML = getIcon('mic');
      GramApp.showToast('Voice recording stopped');
    } else {
      micBtn.classList.add('mic-recording');
      micBtn.innerHTML = `${getIcon('mic')} <span style="font-size:0.7rem; color:var(--danger); font-weight:800;">Listening...</span>`;
      GramApp.showToast('Listening... Speak now in Hindi or English.');

      GramVoice.startListening({
        onResult: (text) => {
          if (input) input.value = text;
          micBtn.classList.remove('mic-recording');
          micBtn.innerHTML = getIcon('mic');
          handleChatSubmit();
        },
        onError: (err) => {
          micBtn.classList.remove('mic-recording');
          micBtn.innerHTML = getIcon('mic');
          GramApp.showToast(err);
        },
        onEnd: () => {
          micBtn.classList.remove('mic-recording');
          micBtn.innerHTML = getIcon('mic');
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

    // Append Bot Thinking state
    const botEl = document.createElement('div');
    botEl.style.cssText = 'display:flex; gap:0.65rem; align-items:flex-start;';
    botEl.innerHTML = `
      <div style="width:32px; height:32px; border-radius:50%; background:var(--primary); color:white; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
        ${getIcon('assistant')}
      </div>
      <div style="background:var(--bg-main); border:1px solid var(--border); padding:0.65rem 0.85rem; border-radius:var(--radius-lg); font-size:0.83rem; max-width:85%;">
        <em>Checking village records and analyzing query...</em>
      </div>
    `;
    msgContainer.appendChild(botEl);
    msgContainer.scrollTop = msgContainer.scrollHeight;

    const state = GramStore.getState();
    const totals = GramStore.getDairyTotals();
    const activeAlerts = (state.alerts || []).filter(a => !a.resolved);
    const feverish = (state.iot.livestock || []).filter(a => a.temperature > 39.5);

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
        body: JSON.stringify({ message: userText, context: contextPayload })
      });
      const data = await res.json();
      const reply = data.reply || 'Namaste! I checked the village records.';

      botEl.querySelector('div:last-child').innerHTML = `
        <div style="line-height:1.5;">${reply}</div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.4rem; padding-top:0.35rem; border-top:1px solid var(--border-subtle); font-size:0.7rem; color:var(--text-muted);">
          <span>${getSourceBadge(data.sourceType)}</span>
          <button class="btn btn-outline btn-sm" style="padding:0.2rem 0.4rem; font-size:0.68rem;" onclick="GramVoice.speak(this.parentElement.previousElementSibling.textContent);">
            ${getIcon('speaker')} <span>Read Aloud</span>
          </button>
        </div>
      `;
    } catch (e) {
      botEl.querySelector('div:last-child').innerHTML = `
        <div>I am currently in local offline mode. All village telemetry systems are active. Please select a quick question or check the Dashboard cards.</div>
      `;
    }

    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  // =========================================================================
  // 12. Settings & Data Governance View
  // =========================================================================
  function renderSettings(container) {
    const state = GramStore.getState();

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        <div>
          <h2 style="font-size:1.25rem; font-weight:800;">Hub Settings & Data Governance</h2>
          <p style="font-size:0.8rem; color:var(--text-muted);">Configure village hub identity, backup complete village JSON data, restore backups, or reset demo state.</p>
        </div>

        <div class="grid-cols-2">
          <!-- Hub Configuration -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">${getIcon('settings')} <span>Village Identity</span></div>
            </div>
            <div class="form-group">
              <label class="form-label">Village Hub Name</label>
              <input type="text" class="form-control" id="settings-village-name" value="${state.villageName}" />
            </div>
            <div class="form-group">
              <label class="form-label">State / Region</label>
              <input type="text" class="form-control" id="settings-village-state" value="${state.villageState}" />
            </div>
            <button class="btn btn-primary btn-sm" onclick="
              const s = GramStore.getState();
              s.villageName = document.getElementById('settings-village-name').value;
              s.villageState = document.getElementById('settings-village-state').value;
              GramStore.saveState();
              GramApp.showToast('Village hub details updated successfully');
            ">Save Village Details</button>
          </div>

          <!-- Data Backup & Factory Reset -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">${getIcon('download')} <span>Data Persistence & Governance</span></div>
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
                ${getIcon('download')} <span>Export Complete Village Backup (JSON)</span>
              </button>

              <div style="display:flex; gap:0.5rem; align-items:center;">
                <input type="file" id="import-backup-file" accept=".json" style="display:none;" onchange="
                  const file = this.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      const res = GramStore.restoreBackupJson(e.target.result);
                      if (res.success) {
                        GramApp.showToast('Village data restored successfully from backup!');
                        GramViews.renderSettings(document.getElementById('page-content'));
                      } else {
                        alert('Failed to restore backup: ' + res.error);
                      }
                    };
                    reader.readAsText(file);
                  }
                " />
                <button class="btn btn-outline" onclick="document.getElementById('import-backup-file').click();">
                  ${getIcon('upload')} <span>Restore Backup JSON</span>
                </button>
              </div>

              <div style="margin-top:0.5rem; padding-top:0.5rem; border-top:1px solid var(--border-subtle);">
                <button class="btn btn-danger btn-sm" onclick="GramModals.showResetModal();">
                  ${getIcon('refresh')} <span>Global Reset Demo State</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    GramI18n.updateDOM();
  }

  // =========================================================================
  // 13. COSMOS — Interactive Village Display & Community Layer
  // "Universe in One Place • Powered by GramSathi"
  // =========================================================================
  let cosmosAutoTimer = null;
  let cosmosCurrentStep = 0;
  let cosmosIsPaused = false;
  let cosmosUnsubscribe = null;

  const COSMOS_STEPS = [
    { id: 'overview', name: 'Village Overview', icon: '🌾' },
    { id: 'energy', name: 'Solar Microgrid', icon: '☀️' },
    { id: 'water', name: 'Drinking Water', icon: '💧' },
    { id: 'weather', name: 'Micro-Climate', icon: '🌦' },
    { id: 'livestock', name: 'Livestock Telemetry', icon: '🐄' },
    { id: 'agriculture', name: 'Crop Advisory', icon: '🌾' },
    { id: 'alerts', name: 'Incident Center', icon: '🚨' }
  ];

  function renderCosmos(container) {
    // Cleanup previous subscriptions/timers
    if (cosmosUnsubscribe) {
      cosmosUnsubscribe();
      cosmosUnsubscribe = null;
    }
    if (cosmosAutoTimer) {
      clearInterval(cosmosAutoTimer);
      cosmosAutoTimer = null;
    }

    const state = GramStore.getState();
    const w = state.iot.water;
    const e = state.iot.energy;
    const totals = GramStore.getDairyTotals();
    const summary = GramStore.getVillageStatusSummary();
    const activeAlerts = (state.alerts || []).filter(a => !a.resolved);

    container.innerHTML = `
      <div class="cosmos-root" id="cosmos-display-container">
        
        <!-- Top Emergency Alert Ticker (if critical or warning alerts active) -->
        ${activeAlerts.length > 0 ? `
          <div class="cosmos-emergency-ticker ${activeAlerts[0].type === 'danger' ? 'ticker-danger' : 'ticker-warning'}" onclick="GramModals.showAlertActionModal('${activeAlerts[0].id}')" title="Click to view alert action">
            <span class="ticker-pulse-icon">🚨</span>
            <span class="ticker-text"><strong>${(activeAlerts[0].category || 'VILLAGE ALERT').toUpperCase()}:</strong> ${activeAlerts[0].message}</span>
            <button class="btn btn-sm btn-outline" style="background:rgba(255,255,255,0.2); border-color:white; color:white; padding:0.2rem 0.5rem; font-size:0.75rem;">Action Alert &rarr;</button>
          </div>
        ` : ''}

        <!-- COSMOS Header Banner -->
        <div class="cosmos-header">
          <div class="cosmos-header-brand">
            <div class="cosmos-brand-badge">
              <span class="cosmos-logo-glyph">✨</span>
              <div>
                <h1 class="cosmos-title">COSMOS</h1>
                <p class="cosmos-tagline">Universe in One Place &bull; <span style="color:var(--primary); font-weight:700;">Powered by GramSathi</span></p>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:0.5rem; margin-top:0.35rem;">
              <span class="badge badge-neutral" style="font-size:0.75rem; letter-spacing:0.5px;">DIGITAL SIMULATION & LIVE TELEMETRY</span>
              <span class="badge badge-${summary.overallBadge}" style="font-size:0.75rem; font-weight:800;">${summary.overallStatus}</span>
            </div>
          </div>

          <div class="cosmos-header-controls">
            <!-- Village Status Button -->
            <button class="btn btn-primary" onclick="GramModals.showVillageStatusModal();" style="display:flex; align-items:center; gap:0.4rem; font-weight:800; box-shadow:0 4px 12px rgba(16,185,129,0.25);">
              <span>📊</span>
              <span>VILLAGE STATUS</span>
            </button>

            <!-- Auto Mode / Pause / Resume Button -->
            <div class="cosmos-carousel-controls">
              <button class="btn btn-outline btn-sm" id="btn-cosmos-pause" onclick="GramViews.toggleCosmosAutoMode();" title="Toggle automatic rotation">
                <span id="cosmos-pause-icon">⏸️</span>
                <span id="cosmos-pause-text">Pause Auto</span>
              </button>
              <button class="btn btn-outline btn-sm" onclick="GramApp.toggleKioskMode();" title="Fullscreen / Kiosk Display">
                <span>🖥️ Fullscreen</span>
              </button>
            </div>

            <!-- Live Clock -->
            <div class="cosmos-clock-box">
              <span id="cosmos-live-clock" style="font-size:1.3rem; font-weight:800; font-family:monospace; color:var(--text-main);">${new Date().toLocaleTimeString()}</span>
              <span style="font-size:0.7rem; color:var(--text-muted);">${state.villageName}</span>
            </div>
          </div>
        </div>

        <!-- Central Digital Village Scene & Surround Interactive Nodes -->
        <div class="cosmos-main-layout">
          
          <!-- LEFT / CENTRAL Interactive Digital Village Scene -->
          <div class="cosmos-centerpiece card">
            <div class="cosmos-scene-header">
              <div style="display:flex; align-items:center; gap:0.5rem;">
                <span style="font-size:1.1rem;">🏞️</span>
                <h3 style="font-size:1rem; font-weight:800;">Digital Village Infrastructure Map</h3>
              </div>
              <div style="display:flex; align-items:center; gap:0.4rem;">
                <span class="status-dot pulse-dot"></span>
                <span style="font-size:0.75rem; font-weight:700; color:var(--success);">LIVE MODEL</span>
              </div>
            </div>

            <!-- Interactive Village SVG Canvas Scene -->
            <div class="cosmos-village-scene" id="cosmos-village-scene">
              
              <!-- Solar PV Microgrid Station -->
              <div class="cosmos-element solar-station ${e.solarGeneration > 0 ? 'active-power' : ''}" onclick="window.location.hash = '#energy';" title="Click to view Solar Microgrid">
                <div class="element-icon">☀️</div>
                <div class="element-label">Solar PV Array</div>
                <div class="element-metric" id="cosmos-el-solar">${e.solarGeneration} kW</div>
                <div class="power-ray-animation"></div>
              </div>

              <!-- LiFePO4 Battery Hub -->
              <div class="cosmos-element battery-station ${e.batterySoc < 20 ? 'element-danger-pulse' : ''}" onclick="window.location.hash = '#energy';" title="Click to view LiFePO4 Battery Bank">
                <div class="element-icon">🔋</div>
                <div class="element-label">LiFePO4 Storage</div>
                <div class="element-metric" id="cosmos-el-battery">${e.batterySoc}%</div>
                <div class="battery-bar-fill" style="width:${e.batterySoc}%;"></div>
              </div>

              <!-- Community Potable Water Tower -->
              <div class="cosmos-element water-tower ${w.turbidity > 5 ? 'element-warning-pulse' : ''}" onclick="window.location.hash = '#water';" title="Click to view Water Subsystem">
                <div class="element-icon">💧</div>
                <div class="element-label">Overhead Tank</div>
                <div class="element-metric" id="cosmos-el-water">${w.tankLevel}%</div>
                <div class="water-wave-anim"></div>
              </div>

              <!-- Dairy & Cattle Pasture Enclosure -->
              <div class="cosmos-element cattle-pasture" onclick="window.location.hash = '#livestock';" title="Click to view Livestock Hub">
                <div class="element-icon">🐄</div>
                <div class="element-label">Dairy Pasture</div>
                <div class="element-metric" id="cosmos-el-cattle">${state.iot.livestock.length} Heads</div>
                <div class="geofence-ring"></div>
              </div>

              <!-- Rabi Agricultural Fields -->
              <div class="cosmos-element crop-fields" onclick="window.location.hash = '#agriculture';" title="Click to view Crop Advisor">
                <div class="element-icon">🌾</div>
                <div class="element-label">Rabi Crop Fields</div>
                <div class="element-metric">Wheat & Mustard</div>
              </div>

              <!-- Village Community & Health Clinic -->
              <div class="cosmos-element community-hub" onclick="GramModals.showVillageStatusModal();" title="Click to view Village Status">
                <div class="element-icon">🏡</div>
                <div class="element-label">Panchayat & Clinic</div>
                <div class="element-metric" id="cosmos-el-load">${e.villageLoad} kW Load</div>
              </div>

            </div>

            <!-- Active Carousel Step Bar -->
            <div class="cosmos-step-tracker">
              ${COSMOS_STEPS.map((step, idx) => `
                <div class="cosmos-step-pill ${idx === 0 ? 'active' : ''}" id="cosmos-step-pill-${idx}" onclick="GramViews.setCosmosStep(${idx});">
                  <span>${step.icon}</span>
                  <span class="step-pill-label">${step.name}</span>
                </div>
              `).join('')}
            </div>

          </div>

          <!-- TODAY'S VILLAGE BRIEF (High-Contrast Overview Card) -->
          <div class="cosmos-brief-panel card">
            <div class="card-header" style="padding-bottom:0.5rem; border-bottom:1px solid var(--border-subtle);">
              <div class="card-title" style="font-size:1.05rem; font-weight:900;">
                <span>📋</span> <span>TODAY'S VILLAGE BRIEF</span>
              </div>
              <span class="badge badge-primary">LIVE SYNTHESIS</span>
            </div>

            <div class="cosmos-brief-list">
              <!-- Energy Item -->
              <div class="cosmos-brief-item" onclick="window.location.hash = '#energy';">
                <div class="brief-item-icon" style="background:rgba(245,158,11,0.15); color:var(--accent);">☀️</div>
                <div class="brief-item-body">
                  <div class="brief-item-title">Solar Microgrid</div>
                  <div class="brief-item-desc" id="brief-desc-energy">Solar Gen: <strong>${e.solarGeneration} kW</strong> &bull; Battery: <strong>${e.batterySoc}%</strong> (${e.scenario || 'Nominal'})</div>
                </div>
                <span class="brief-item-arrow">&rarr;</span>
              </div>

              <!-- Water Item -->
              <div class="cosmos-brief-item" onclick="window.location.hash = '#water';">
                <div class="brief-item-icon" style="background:rgba(14,165,233,0.15); color:var(--info);">💧</div>
                <div class="brief-item-body">
                  <div class="brief-item-title">Drinking Water System</div>
                  <div class="brief-item-desc" id="brief-desc-water">Tank: <strong>${w.tankLevel}%</strong> &bull; Pump: <strong>${w.pumpStatus}</strong> &bull; pH: <strong>${w.ph}</strong></div>
                </div>
                <span class="brief-item-arrow">&rarr;</span>
              </div>

              <!-- Livestock Item -->
              <div class="cosmos-brief-item" onclick="window.location.hash = '#livestock';">
                <div class="brief-item-icon" style="background:rgba(16,185,129,0.15); color:var(--primary);">🐄</div>
                <div class="brief-item-body">
                  <div class="brief-item-title">Livestock & Dairy</div>
                  <div class="brief-item-desc" id="brief-desc-livestock"><strong>${state.iot.livestock.length} Monitored Heads</strong> &bull; Today's Milk: <strong>${totals.todayTotal} L</strong></div>
                </div>
                <span class="brief-item-arrow">&rarr;</span>
              </div>

              <!-- Weather Item -->
              <div class="cosmos-brief-item" onclick="window.location.hash = '#weather';">
                <div class="brief-item-icon" style="background:rgba(99,102,241,0.15); color:var(--info);">🌦</div>
                <div class="brief-item-body">
                  <div class="brief-item-title">Village Weather</div>
                  <div class="brief-item-desc" id="brief-desc-weather"><strong>${state.weather.temperature || state.weather.temp}°C</strong> &bull; ${state.weather.condition} &bull; Humidity: ${state.weather.humidity}%</div>
                </div>
                <span class="brief-item-arrow">&rarr;</span>
              </div>

              <!-- Agriculture Item -->
              <div class="cosmos-brief-item" onclick="window.location.hash = '#agriculture';">
                <div class="brief-item-icon" style="background:rgba(34,197,94,0.15); color:var(--success);">🌾</div>
                <div class="brief-item-body">
                  <div class="brief-item-title">Crop Planning</div>
                  <div class="brief-item-desc">Rabi Season &bull; Wheat & Mustard tillering advisory active</div>
                </div>
                <span class="brief-item-arrow">&rarr;</span>
              </div>

              <!-- Alerts Item -->
              <div class="cosmos-brief-item" onclick="window.location.hash = '#alerts';">
                <div class="brief-item-icon" style="background:rgba(239,68,68,0.15); color:var(--danger);">🚨</div>
                <div class="brief-item-body">
                  <div class="brief-item-title">Active Alert Count</div>
                  <div class="brief-item-desc" id="brief-desc-alerts"><strong>${activeAlerts.length} Active System Incidents</strong> (${summary.alerts.criticalCount} Critical, ${summary.alerts.warningCount} Warning)</div>
                </div>
                <span class="brief-item-arrow">&rarr;</span>
              </div>
            </div>

            <!-- Voice Quick Interaction in Brief Card -->
            <div class="cosmos-voice-bar">
              <button class="btn btn-outline btn-sm" id="cosmos-voice-btn" onclick="GramViews.toggleVoiceRecording();" style="display:flex; align-items:center; gap:0.4rem;">
                ${getIcon('mic')} <span>🎤 Ask by Voice</span>
              </button>
              <button class="btn btn-primary btn-sm" onclick="window.location.hash = '#assistant';">
                <span>🤖 AI Assistant &rarr;</span>
              </button>
            </div>
          </div>

        </div>

        <!-- 9 Interactive Domain Nodes (Surround / Drilldown Grid) -->
        <div class="cosmos-nodes-section">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; flex-wrap:wrap; gap:0.5rem;">
            <div>
              <h3 style="font-size:1.15rem; font-weight:800;">Interactive Subsystem Nodes</h3>
              <p style="font-size:0.78rem; color:var(--text-muted);">Tap any node card or action button to inspect telemetry, run scenarios, or drill down.</p>
            </div>
            <div style="display:flex; gap:0.4rem;">
              <span class="badge badge-neutral">100% TOUCH-ENABLED</span>
            </div>
          </div>

          <div class="cosmos-nodes-grid">
            
            <!-- 1. ENERGY NODE -->
            <div class="cosmos-node-card" id="cosmos-node-energy">
              <div class="node-card-top">
                <div class="node-card-title">
                  <span class="node-emoji">☀️</span>
                  <span>ENERGY</span>
                </div>
                <span class="badge badge-${summary.energy.badge}">${summary.energy.status}</span>
              </div>
              <div class="node-primary-value" id="node-val-energy">${e.solarGeneration} <span class="unit">kW</span></div>
              <div class="node-sub-stats">
                <div>Battery: <strong id="node-sub-batt">${e.batterySoc}%</strong></div>
                <div>Load: <strong id="node-sub-load">${e.villageLoad} kW</strong></div>
              </div>
              <div class="node-scenario-tag" id="node-scen-energy">${e.scenario || 'Nominal Sunlight'}</div>
              <div class="node-card-actions">
                <button class="btn btn-primary btn-sm" onclick="window.location.hash = '#energy';">View Details</button>
                <button class="btn btn-outline btn-sm" onclick="GramViews.openQuickScenarioModal('energy');">Run Scenario</button>
              </div>
            </div>

            <!-- 2. WATER NODE -->
            <div class="cosmos-node-card" id="cosmos-node-water">
              <div class="node-card-top">
                <div class="node-card-title">
                  <span class="node-emoji">💧</span>
                  <span>WATER</span>
                </div>
                <span class="badge badge-${summary.water.badge}">${summary.water.status}</span>
              </div>
              <div class="node-primary-value" id="node-val-water" style="color:var(--info);">${w.tankLevel} <span class="unit">%</span></div>
              <div class="node-sub-stats">
                <div>Pump: <strong id="node-sub-pump">${w.pumpStatus}</strong></div>
                <div>Potability: <strong id="node-sub-pot">pH ${w.ph}</strong></div>
              </div>
              <div class="node-scenario-tag"><span class="badge badge-neutral" style="font-size:0.68rem;">SIMULATED SENSOR</span></div>
              <div class="node-card-actions">
                <button class="btn btn-primary btn-sm" onclick="window.location.hash = '#water';">Open Water</button>
                <button class="btn btn-outline btn-sm" onclick="GramStore.simulateWaterScenario(GramStore.getState().iot.water.pumpStatus === 'AUTO_OFF' ? 'pump_override_on' : 'pump_override_off'); GramApp.showToast('Pump state toggled');">Toggle Pump</button>
              </div>
            </div>

            <!-- 3. LIVESTOCK NODE -->
            <div class="cosmos-node-card" id="cosmos-node-livestock">
              <div class="node-card-top">
                <div class="node-card-title">
                  <span class="node-emoji">🐄</span>
                  <span>LIVESTOCK</span>
                </div>
                <span class="badge badge-${summary.livestock.badge}">${summary.livestock.status}</span>
              </div>
              <div class="node-primary-value" id="node-val-livestock" style="color:var(--primary);">${state.iot.livestock.length} <span class="unit">Heads</span></div>
              <div class="node-sub-stats">
                <div>Avg Temp: <strong>38.6°C</strong></div>
                <div>Pasture: <strong>Geofenced Safe</strong></div>
              </div>
              <div class="node-scenario-tag">Collar Telemetry Active</div>
              <div class="node-card-actions">
                <button class="btn btn-primary btn-sm" onclick="window.location.hash = '#livestock';">View Cattle</button>
                <button class="btn btn-outline btn-sm" onclick="GramModals.showAnimalProfileModal('${state.iot.livestock[0] ? state.iot.livestock[0].id : 'COW-01'}');">Animal Card</button>
              </div>
            </div>

            <!-- 4. DAIRY NODE -->
            <div class="cosmos-node-card" id="cosmos-node-dairy">
              <div class="node-card-top">
                <div class="node-card-title">
                  <span class="node-emoji">🥛</span>
                  <span>DAIRY</span>
                </div>
                <span class="badge badge-success">RECORDED</span>
              </div>
              <div class="node-primary-value" id="node-val-dairy">${totals.todayTotal} <span class="unit">Liters</span></div>
              <div class="node-sub-stats">
                <div>Today Est: <strong>₹${totals.estTodayRev}</strong></div>
                <div>Ledger: <strong>${state.dairy.records.length} Entries</strong></div>
              </div>
              <div class="node-scenario-tag">Milk Price: ₹55/L Base</div>
              <div class="node-card-actions">
                <button class="btn btn-primary btn-sm" onclick="GramModals.showRecordMilkModal();">Record Milk</button>
                <button class="btn btn-outline btn-sm" onclick="window.location.hash = '#dairy';">View Ledger</button>
              </div>
            </div>

            <!-- 5. AGRICULTURE NODE -->
            <div class="cosmos-node-card" id="cosmos-node-agriculture">
              <div class="node-card-top">
                <div class="node-card-title">
                  <span class="node-emoji">🌾</span>
                  <span>AGRICULTURE</span>
                </div>
                <span class="badge badge-success">RABI SEASON</span>
              </div>
              <div class="node-primary-value" style="font-size:1.35rem; color:var(--success);">Wheat & Mustard</div>
              <div class="node-sub-stats">
                <div>Tillering Stage</div>
                <div>Water: <strong>Moderate</strong></div>
              </div>
              <div style="margin:0.4rem 0;">
                <input type="text" id="cosmos-crop-search" class="form-control" placeholder="Search crop (e.g. Wheat, Mustard, Rice)..." style="font-size:0.75rem; padding:0.35rem 0.5rem;" onkeydown="if(event.key==='Enter') GramViews.quickSearchCosmosCrop();" />
              </div>
              <div class="node-card-actions">
                <button class="btn btn-primary btn-sm" onclick="GramViews.quickSearchCosmosCrop();">Search Crop</button>
                <button class="btn btn-outline btn-sm" onclick="window.location.hash = '#agriculture';">Advisor</button>
              </div>
            </div>

            <!-- 6. WEATHER NODE -->
            <div class="cosmos-node-card" id="cosmos-node-weather">
              <div class="node-card-top">
                <div class="node-card-title">
                  <span class="node-emoji">🌦</span>
                  <span>WEATHER</span>
                </div>
                <span class="badge badge-live">${state.weather.sourceType === 'LIVE' ? 'LIVE WEATHER' : 'CACHED'}</span>
              </div>
              <div class="node-primary-value" id="node-val-weather">${state.weather.temperature || state.weather.temp}°C</div>
              <div class="node-sub-stats">
                <div>${state.weather.condition}</div>
                <div>Rain: <strong>${state.weather.precipitationChance}%</strong></div>
              </div>
              <div class="node-scenario-tag" style="font-size:0.7rem;">${state.weather.location}</div>
              <div class="node-card-actions">
                <button class="btn btn-primary btn-sm" onclick="GramViews.handleUseLiveLocation();">Use GPS</button>
                <button class="btn btn-outline btn-sm" onclick="window.location.hash = '#weather';">Details</button>
              </div>
            </div>

            <!-- 7. MANDI NODE -->
            <div class="cosmos-node-card" id="cosmos-node-mandi">
              <div class="node-card-top">
                <div class="node-card-title">
                  <span class="node-emoji">📈</span>
                  <span>MANDI</span>
                </div>
                <span class="badge badge-neutral">AGMARKNET DATA</span>
              </div>
              <div class="node-primary-value" style="font-size:1.35rem; color:var(--accent);">₹2,360 <span class="unit">Wheat</span></div>
              <div class="node-sub-stats">
                <div>Mustard: <strong>₹5,680</strong></div>
                <div>Gram: <strong>₹5,850</strong></div>
              </div>
              <div class="node-scenario-tag">APMC Verified Rates</div>
              <div class="node-card-actions">
                <button class="btn btn-primary btn-sm" onclick="window.location.hash = '#mandi';">Explore Mandi</button>
                <button class="btn btn-outline btn-sm" onclick="window.location.hash = '#assistant'; GramViews.sendAssistantPrompt('What are current Mandi rates for Wheat and Mustard?');">AI Advice</button>
              </div>
            </div>

            <!-- 8. ALERTS NODE -->
            <div class="cosmos-node-card" id="cosmos-node-alerts">
              <div class="node-card-top">
                <div class="node-card-title">
                  <span class="node-emoji">🚨</span>
                  <span>ALERTS</span>
                </div>
                <span class="badge badge-${summary.alerts.criticalCount > 0 ? 'danger' : (summary.alerts.warningCount > 0 ? 'warning' : 'neutral')}">
                  ${summary.alerts.totalActive} Active
                </span>
              </div>
              <div class="node-primary-value" id="node-val-alerts" style="color:${summary.alerts.criticalCount > 0 ? 'var(--danger)' : 'var(--warning)'};">${summary.alerts.totalActive} <span class="unit">Alerts</span></div>
              <div class="node-sub-stats">
                <div>Critical: <strong style="color:var(--danger);">${summary.alerts.criticalCount}</strong></div>
                <div>Warning: <strong style="color:var(--warning);">${summary.alerts.warningCount}</strong></div>
              </div>
              <div class="node-scenario-tag">${activeAlerts[0] ? activeAlerts[0].message.slice(0, 30) + '...' : 'All normal'}</div>
              <div class="node-card-actions">
                <button class="btn btn-primary btn-sm" onclick="${activeAlerts[0] ? `GramModals.showAlertActionModal('${activeAlerts[0].id}')` : `window.location.hash = '#alerts'`};">Action Alert</button>
                <button class="btn btn-outline btn-sm" onclick="window.location.hash = '#alerts';">All Alerts</button>
              </div>
            </div>

            <!-- 9. AI ASSISTANT NODE -->
            <div class="cosmos-node-card" id="cosmos-node-ai">
              <div class="node-card-top">
                <div class="node-card-title">
                  <span class="node-emoji">🤖</span>
                  <span>AI ASSISTANT</span>
                </div>
                <span class="badge badge-live">AI ONLINE</span>
              </div>
              <div class="node-primary-value" style="font-size:1.25rem; color:var(--primary);">GramSathi AI</div>
              <div class="node-sub-stats">
                <div>Speech In &amp; Out</div>
                <div>Village Context Aware</div>
              </div>
              <div class="node-scenario-tag">Hindi &amp; English Fluent</div>
              <div class="node-card-actions">
                <button class="btn btn-primary btn-sm" onclick="window.location.hash = '#assistant';">Ask AI</button>
                <button class="btn btn-outline btn-sm" onclick="GramViews.toggleVoiceRecording();">🎤 Speak</button>
              </div>
            </div>

          </div>
        </div>

        <!-- Quick Scenario Modal Anchor Container -->
        <div id="cosmos-quick-modal"></div>

      </div>
    `;

    // Subscribe to reactive store changes to update numbers live
    cosmosUnsubscribe = GramStore.subscribe((updatedState) => {
      updateCosmosLiveDOM(updatedState);
    });

    // Start auto carousel
    startCosmosAutoRotation();
    GramI18n.updateDOM();
  }

  function updateCosmosLiveDOM(state) {
    if (window.location.hash !== '#cosmos' && window.location.hash !== '#display' && window.location.hash !== '#about') return;

    const e = state.iot.energy;
    const w = state.iot.water;
    const totals = GramStore.getDairyTotals();
    const summary = GramStore.getVillageStatusSummary();
    const activeAlerts = (state.alerts || []).filter(a => !a.resolved);

    // Update village scene counters
    const elSolar = document.getElementById('cosmos-el-solar');
    if (elSolar) elSolar.textContent = e.solarGeneration + ' kW';
    const elBattery = document.getElementById('cosmos-el-battery');
    if (elBattery) elBattery.textContent = e.batterySoc + '%';
    const elWater = document.getElementById('cosmos-el-water');
    if (elWater) elWater.textContent = w.tankLevel + '%';
    const elLoad = document.getElementById('cosmos-el-load');
    if (elLoad) elLoad.textContent = e.villageLoad + ' kW Load';

    // Update node values
    const nodeEnergy = document.getElementById('node-val-energy');
    if (nodeEnergy) nodeEnergy.innerHTML = `${e.solarGeneration} <span class="unit">kW</span>`;
    const nodeWater = document.getElementById('node-val-water');
    if (nodeWater) nodeWater.innerHTML = `${w.tankLevel} <span class="unit">%</span>`;
    const nodeDairy = document.getElementById('node-val-dairy');
    if (nodeDairy) nodeDairy.innerHTML = `${totals.todayTotal} <span class="unit">Liters</span>`;
    const nodeAlerts = document.getElementById('node-val-alerts');
    if (nodeAlerts) nodeAlerts.innerHTML = `${activeAlerts.length} <span class="unit">Alerts</span>`;

    // Update brief items
    const descEnergy = document.getElementById('brief-desc-energy');
    if (descEnergy) descEnergy.innerHTML = `Solar Gen: <strong>${e.solarGeneration} kW</strong> &bull; Battery: <strong>${e.batterySoc}%</strong> (${e.scenario || 'Nominal'})`;
    const descWater = document.getElementById('brief-desc-water');
    if (descWater) descWater.innerHTML = `Tank: <strong>${w.tankLevel}%</strong> &bull; Pump: <strong>${w.pumpStatus}</strong> &bull; pH: <strong>${w.ph}</strong>`;
    const descAlerts = document.getElementById('brief-desc-alerts');
    if (descAlerts) descAlerts.innerHTML = `<strong>${activeAlerts.length} Active System Incidents</strong> (${summary.alerts.criticalCount} Critical, ${summary.alerts.warningCount} Warning)`;
  }

  function startCosmosAutoRotation() {
    if (cosmosAutoTimer) clearInterval(cosmosAutoTimer);
    cosmosAutoTimer = setInterval(() => {
      if (cosmosIsPaused) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      
      cosmosCurrentStep = (cosmosCurrentStep + 1) % COSMOS_STEPS.length;
      highlightCosmosStep(cosmosCurrentStep);
    }, 6000);
  }

  function highlightCosmosStep(idx) {
    document.querySelectorAll('.cosmos-step-pill').forEach((pill, i) => {
      if (i === idx) pill.classList.add('active');
      else pill.classList.remove('active');
    });

    const step = COSMOS_STEPS[idx];
    document.querySelectorAll('.cosmos-node-card').forEach(card => card.classList.remove('active-focus-node'));
    if (step && step.id !== 'overview') {
      const targetCard = document.getElementById(`cosmos-node-${step.id}`);
      if (targetCard) {
        targetCard.classList.add('active-focus-node');
      }
    }
  }

  function setCosmosStep(idx) {
    cosmosCurrentStep = idx;
    highlightCosmosStep(idx);
    GramApp.showToast(`Focused on: ${COSMOS_STEPS[idx].name}`);
  }

  function toggleCosmosAutoMode() {
    cosmosIsPaused = !cosmosIsPaused;
    const btnText = document.getElementById('cosmos-pause-text');
    const btnIcon = document.getElementById('cosmos-pause-icon');
    if (btnText && btnIcon) {
      if (cosmosIsPaused) {
        btnText.textContent = 'Resume Auto';
        btnIcon.textContent = '▶️';
        GramApp.showToast('COSMOS Auto rotation paused');
      } else {
        btnText.textContent = 'Pause Auto';
        btnIcon.textContent = '⏸️';
        GramApp.showToast('COSMOS Auto rotation running');
      }
    }
  }

  function openQuickScenarioModal(category) {
    const c = document.getElementById('modal-container');
    if (!c) return;
    c.innerHTML = `
      <div class="modal-backdrop active" onclick="if(event.target === this) GramModals.closeModal();">
        <div class="modal-content" style="max-width:520px;">
          <div class="modal-header">
            <h3>☀️ Run Energy Microgrid Scenario</h3>
            <button class="modal-close-btn" onclick="GramModals.closeModal();">&times;</button>
          </div>
          <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:1rem;">
            Select a solar generation or battery load event to test system-wide reactions and automated load shedding.
          </p>
          <div style="display:flex; flex-direction:column; gap:0.5rem;">
            <button class="btn btn-outline" style="text-align:left; justify-content:flex-start;" onclick="GramStore.simulateEnergyScenario('nominal'); GramModals.closeModal(); GramApp.showToast('Applied: Nominal Sunlight');">
              ☀️ <strong>Nominal Daytime Sunlight</strong> (4.8 kW Gen, 82% Battery)
            </button>
            <button class="btn btn-outline" style="text-align:left; justify-content:flex-start;" onclick="GramStore.simulateEnergyScenario('high_solar'); GramModals.closeModal(); GramApp.showToast('Applied: Peak Solar Generation');">
              ⚡ <strong>Peak Solar Generation</strong> (5.8 kW Gen, 96% Battery)
            </button>
            <button class="btn btn-outline" style="text-align:left; justify-content:flex-start;" onclick="GramStore.simulateEnergyScenario('low_solar'); GramModals.closeModal(); GramApp.showToast('Applied: Overcast Weather');">
              ⛅ <strong>Low Solar Irradiance</strong> (1.2 kW Overcast)
            </button>
            <button class="btn btn-outline" style="text-align:left; justify-content:flex-start;" onclick="GramStore.simulateEnergyScenario('high_load'); GramModals.closeModal(); GramApp.showToast('Applied: Heavy Village Load');">
              🏭 <strong>Heavy Village Peak Load</strong> (4.8 kW High Draw)
            </button>
            <button class="btn btn-outline" style="text-align:left; justify-content:flex-start;" onclick="GramStore.simulateEnergyScenario('battery_critical'); GramModals.closeModal(); GramApp.showToast('Applied: Battery Critical');">
              🔴 <strong>Critical Battery Reserve</strong> (18% Battery Alert)
            </button>
            <button class="btn btn-outline" style="text-align:left; justify-content:flex-start;" onclick="GramStore.simulateEnergyScenario('night_low'); GramModals.closeModal(); GramApp.showToast('Applied: Night Mode');">
              🌙 <strong>Night Mode</strong> (0.0 kW Solar, Battery Inverter)
            </button>
          </div>
          <div class="modal-footer" style="margin-top:1rem;">
            <button type="button" class="btn btn-outline" onclick="GramModals.closeModal();">Cancel</button>
          </div>
        </div>
      </div>
    `;
    c.classList.add('active');
  }

  function quickSearchCosmosCrop() {
    const input = document.getElementById('cosmos-crop-search');
    const query = input ? input.value.trim() : '';
    if (!query) {
      window.location.hash = '#agriculture';
      return;
    }
    window.location.hash = '#agriculture';
    setTimeout(() => {
      const agInput = document.getElementById('crop-search-input');
      if (agInput) {
        agInput.value = query;
        GramViews.handleCropSearch(query);
      }
    }, 100);
  }

  // Alias renderAbout to renderCosmos so all kiosk / about links point cleanly to COSMOS
  function renderAbout(container) {
    renderCosmos(container);
  }

  return {
    renderDashboard,
    handleRefreshAllData,
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
    toggleVoiceRecording,
    sendAssistantPrompt,
    handleChatSubmit,
    renderSettings,
    renderAbout,
    renderCosmos,
    setCosmosStep,
    toggleCosmosAutoMode,
    openQuickScenarioModal,
    quickSearchCosmosCrop
  };
})();
