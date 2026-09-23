// GramSathi Core Controller & Hash Router
window.GramApp = (function() {
  let simTimer = null;

  function init() {
    // 1. Language initialization
    const savedLang = localStorage.getItem('gramsathi_lang') || 'en';
    const langSelect = document.getElementById('header-lang-select');
    if (langSelect) {
      langSelect.value = savedLang;
      langSelect.addEventListener('change', (e) => {
        GramI18n.setLanguage(e.target.value);
      });
    }
    GramI18n.setLanguage(savedLang);

    // 2. Theme initialization
    const savedTheme = localStorage.getItem('gramsathi_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // 3. Setup Hash Router
    window.addEventListener('hashchange', () => {
      navigate(window.location.hash);
    });

    // 4. Initial Navigation
    navigate(window.location.hash || '#dashboard');

    // 5. Start IoT Simulation Ticker (runs every 3 seconds)
    if (simTimer) clearInterval(simTimer);
    simTimer = setInterval(() => {
      GramStore.simulateTick();
      updateHeaderLiveStats();
    }, 3000);

    // 6. Live Clock
    updateClock();
    setInterval(updateClock, 1000);

    // 7. Initial Weather fetch
    GramStore.fetchLiveWeather();

    // 8. Keyboard Accessibility (ESC closes modals)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        GramModals.closeModal();
      }
    });
  }

  function navigate(hash) {
    const route = (hash || '#dashboard').replace('#', '');
    const pageContent = document.getElementById('page-content');
    if (!pageContent) return;

    // Update active nav links
    document.querySelectorAll('.nav-link, .mobile-nav-item').forEach(el => {
      const href = el.getAttribute('href') || '';
      if (href === '#' + route) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // Close mobile drawer if open
    closeMobileDrawer();

    // Route Switch
    switch(route) {
      case 'cosmos':
        GramViews.renderCosmos(pageContent);
        break;
      case 'water':
        GramViews.renderWater(pageContent);
        break;
      case 'livestock':
        GramViews.renderLivestock(pageContent);
        break;
      case 'dairy':
        GramViews.renderDairy(pageContent);
        break;
      case 'energy':
        GramViews.renderEnergy(pageContent);
        break;
      case 'agriculture':
        GramViews.renderAgriculture(pageContent);
        break;
      case 'weather':
        GramViews.renderWeather(pageContent);
        break;
      case 'mandi':
        GramViews.renderMandi(pageContent);
        break;
      case 'schemes':
        GramViews.renderSchemes(pageContent);
        break;
      case 'alerts':
        GramViews.renderAlerts(pageContent);
        break;
      case 'assistant':
        GramViews.renderAssistant(pageContent);
        break;
      case 'settings':
        GramViews.renderSettings(pageContent);
        break;
      case 'export':
        GramViews.renderExport(pageContent);
        break;
      case 'about':
      case 'display':
        GramViews.renderCosmos(pageContent);
        break;
      case 'dashboard':
      default:
        GramViews.renderDashboard(pageContent);
        break;
    }
  }

  function updateClock() {
    const clockEl = document.getElementById('header-live-clock');
    const cosmosClock = document.getElementById('cosmos-live-clock');
    const nowStr = new Date().toLocaleTimeString();
    if (clockEl) clockEl.textContent = nowStr;
    if (cosmosClock) cosmosClock.textContent = nowStr;
  }

  function updateHeaderLiveStats() {
    if (window.location.hash === '#dashboard' || !window.location.hash) {
      const state = GramStore.getState();
      const bSoc = document.getElementById('dash-battery-soc');
      if (bSoc) bSoc.textContent = state.iot.energy.batterySoc + '%';
      const tLvl = document.getElementById('dash-tank-level');
      if (tLvl) tLvl.textContent = state.iot.water.tankLevel + '%';
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('gramsathi_theme', next);
    showToast('Theme switched to ' + next + ' mode');
  }

  function toggleKioskMode(force) {
    const isKiosk = document.body.classList.contains('kiosk-mode');
    if (force !== undefined) {
      if (force) document.body.classList.add('kiosk-mode');
      else document.body.classList.remove('kiosk-mode');
    } else {
      document.body.classList.toggle('kiosk-mode');
    }
    const exitBtn = document.getElementById('kiosk-exit-btn');
    if (exitBtn) {
      exitBtn.style.display = document.body.classList.contains('kiosk-mode') ? 'block' : 'none';
    }
  }

  function toggleMobileDrawer() {
    const drawer = document.getElementById('mobile-drawer');
    if (drawer) drawer.classList.toggle('active');
  }

  function closeMobileDrawer() {
    const drawer = document.getElementById('mobile-drawer');
    if (drawer) drawer.classList.remove('active');
  }

  function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    if (sb) sb.classList.toggle('open');
  }

  function showToast(msg) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `${GramIcons.check} <span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3200);
  }

  function onLanguageChange(lang) {
    navigate(window.location.hash || '#dashboard');
    showToast('Language updated to ' + lang.toUpperCase());
  }

  return {
    init,
    navigate,
    toggleTheme,
    toggleKioskMode,
    toggleMobileDrawer,
    closeMobileDrawer,
    toggleSidebar,
    showToast,
    onLanguageChange
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  GramApp.init();
});
