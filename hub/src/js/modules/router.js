/**
 * Router Module
 * Управление навигацией и историей браузера
 */

export const Router = {
  state: null,
  
  init(appState) {
    this.state = appState;
    
    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
      if (e.state?.page) {
        this.navigate(e.state.page, false);
      }
    });
    
    // Handle initial route
    const hash = window.location.hash.slice(1);
    if (hash) {
      this.navigate(hash, false);
    }
  },

  navigate(page, pushState = true) {
    const validPages = [
      'projects', 'tasks', 'staff', 'partners', 
      'comms', 'clients', 'admin', 'settings'
    ];
    
    if (!validPages.includes(page)) {
      page = 'projects';
    }
    
    // Update browser history
    if (pushState) {
      history.pushState({ page }, '', `#${page}`);
    }
    
    // Update UI
    if (window.UI) {
      window.UI.navigate(page);
    }
    
    // Track page view (optional analytics)
    this.trackPageView(page);
  },

  navigateToProject(projectName) {
    const encoded = encodeURIComponent(projectName);
    this.navigate(`project/${encoded}`);
  },

  navigateToTask(taskId) {
    this.navigate(`task/${taskId}`);
  },

  // Parse route and load data
  async handleRoute(path) {
    const parts = path.split('/');
    const page = parts[0];
    const param = parts[1];
    
    switch (page) {
      case 'project':
        if (param) {
          await this.loadProjectDetail(decodeURIComponent(param));
        }
        break;
      
      case 'task':
        if (param) {
          await this.loadTaskDetail(param);
        }
        break;
      
      case 'staff':
        if (param) {
          await this.loadStaffDetail(param);
        }
        break;
      
      default:
        // Standard page navigation
        this.navigate(page || 'projects');
    }
  },

  async loadProjectDetail(projectName) {
    // Load project details
    const { Data } = await import('./data.js');
    const project = Data.get('projects').find(
      p => p['Название'] === projectName
    );
    
    if (project && window.UI) {
      // Render project detail view
      window.UI.renderProjectDetail(project);
    }
  },

  async loadTaskDetail(taskId) {
    const { Data } = await import('./data.js');
    const task = Data.get('tasks').find(
      t => (t.id || t['id']) === taskId
    );
    
    if (task && window.UI) {
      window.UI.renderTaskDetail(task);
    }
  },

  async loadStaffDetail(staffId) {
    const { Data } = await import('./data.js');
    const staff = Data.get('staff').find(
      s => (s.id || s['id']) === staffId
    );
    
    if (staff && window.UI) {
      window.UI.renderStaffDetail(staff);
    }
  },

  // Optional: track page views
  trackPageView(page) {
    // Could integrate with analytics
    console.log('[Router] Page view:', page);
  },

  // Get current page from route
  getCurrentPage() {
    const hash = window.location.hash.slice(1);
    return hash.split('/')[0] || 'projects';
  },

  // Check if user can access page
  canAccess(page) {
    const { Auth } = window;
    if (!Auth) return true;
    
    const perms = Auth.getPermissions();
    
    const restrictedPages = {
      'admin': perms.canSettings,
      'staff': perms.canManageStaff,
      'partners': perms.canEditPartners,
      'settings': perms.canSettings
    };
    
    return restrictedPages[page] !== false;
  }
};
