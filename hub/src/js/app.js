/**
 * RKT HUB v14 — Main Application Entry Point
 * Модульная архитектура с разделением ответственности
 */

import { Config } from './modules/config.js';
import { Auth } from './modules/auth.js';
import { Router } from './modules/router.js';
import { UI } from './modules/ui.js';
import { Data } from './modules/data.js';
import { AIChat } from './modules/ai-chat.js';

// ═══════════════════════════════════════════════════════════════
// GLOBAL STATE
// ═══════════════════════════════════════════════════════════════
export const AppState = {
  user: null,
  currentProject: null,
  currentSubProject: null,
  data: {
    projects: [],
    directions: [],
    tasks: [],
    staff: [],
    partners: [],
    comms: []
  },
  config: {},
  aiChat: null
};

// ═══════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════
class App {
  constructor() {
    this.initialized = false;
  }

  async init() {
    console.log('[RKT HUB] Initializing...');
    
    try {
      // 1. Load config
      await Config.load();
      AppState.config = Config.getAll();
      console.log('[RKT HUB] Config loaded');

      // 2. Check auth
      const authResult = await Auth.checkSavedLogin();
      if (!authResult) {
        UI.showLoginScreen();
        return;
      }
      
      AppState.user = authResult;
      console.log('[RKT HUB] User authenticated:', authResult.name);

      // 3. Load data
      await Data.loadAll();
      AppState.data = Data.getAll();
      console.log('[RKT HUB] Data loaded');

      // 4. Initialize AI Chat
      AppState.aiChat = new AIChat(AppState);
      
      // 5. Render app
      UI.renderApp(AppState);
      
      // 6. Initialize router
      Router.init(AppState);
      
      this.initialized = true;
      console.log('[RKT HUB] Initialization complete');
      
    } catch (error) {
      console.error('[RKT HUB] Init error:', error);
      UI.showError('Ошибка загрузки: ' + error.message);
      UI.showLoginScreen();
    }
  }

  async refresh() {
    await Data.loadAll();
    AppState.data = Data.getAll();
    UI.renderCurrentPage(AppState);
  }
}

// ═══════════════════════════════════════════════════════════════
// GLOBAL EXPORTS
// ═══════════════════════════════════════════════════════════════
window.APP = new App();
window.AppState = AppState;

// Export modules for use in other scripts
window.Config = Config;
window.Auth = Auth;
window.Data = Data;
window.UI = UI;
window.Router = Router;

// ═══════════════════════════════════════════════════════════════
// START APPLICATION
// ═══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  window.APP.init();
});

// Service Worker registration for PWA (optional)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // navigator.serviceWorker.register('/sw.js');
  });
}
