/**
 * UI Module
 * Рендеринг интерфейса, модальные окна, уведомления
 */

export const UI = {
  // Show login screen
  showLoginScreen() {
    const container = document.getElementById('loginScreen');
    if (!container) return;

    container.innerHTML = `
      <div class="login-card">
        <div class="login-icon">🔐</div>
        <div class="login-logo">RKT HUB</div>
        <div class="login-sub">Система управления проектами</div>
        
        <div style="display:flex;gap:8px;margin-bottom:20px">
          <button class="auth-tab active" onclick="UI.switchAuthTab('phone')">Телефон</button>
          <button class="auth-tab" onclick="UI.switchAuthTab('telegram')">Telegram</button>
        </div>
        
        <div id="phoneLoginForm">
          <label class="login-label">📱 Телефон</label>
          <input type="tel" id="loginPhone" class="login-input" placeholder="+7___ ___ __ __" maxlength="16">
          
          <label class="login-label">🔒 Пароль</label>
          <input type="password" id="loginPassword" class="login-input" placeholder="••••••••" style="letter-spacing:4px">
          
          <button class="login-btn" onclick="UI.handleLogin()">Войти</button>
          <div class="login-error" id="loginError"></div>
          
          <p class="login-hint">
            Нет доступа? <a href="https://t.me/AIhroject_bot" target="_blank">@AIhroject_bot</a>
          </p>
        </div>
        
        <div id="telegramLoginForm" style="display:none">
          <button class="tg-login-btn" onclick="UI.handleTelegramLogin()">
            <span>✈️</span> Войти через Telegram
          </button>
          <p class="login-hint" style="margin-top:16px">
            Откройте бота @AIhroject_bot для входа
          </p>
        </div>
      </div>
    `;

    // Phone mask
    const phoneInput = document.getElementById('loginPhone');
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.startsWith('7')) val = val.slice(1);
        if (val.length > 10) val = val.slice(0, 10);
        
        let formatted = '+7';
        if (val.length > 0) formatted += ' ' + val.slice(0, 3);
        if (val.length > 3) formatted += ' ' + val.slice(3, 6);
        if (val.length > 6) formatted += ' ' + val.slice(6, 8);
        if (val.length > 8) formatted += ' ' + val.slice(8, 10);
        
        e.target.value = formatted;
      });
    }
  },

  switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    document.getElementById('phoneLoginForm').style.display = 
      tab === 'phone' ? 'block' : 'none';
    document.getElementById('telegramLoginForm').style.display = 
      tab === 'telegram' ? 'block' : 'none';
  },

  async handleLogin() {
    const phone = document.getElementById('loginPhone')?.value.replace(/\D/g, '') || '';
    const password = document.getElementById('loginPassword')?.value || '';
    const errorEl = document.getElementById('loginError');

    if (phone.length < 10) {
      errorEl.textContent = 'Введите корректный номер телефона';
      errorEl.style.display = 'block';
      return;
    }

    if (!password) {
      errorEl.textContent = 'Введите пароль';
      errorEl.style.display = 'block';
      return;
    }

    try {
      const { Auth } = await import('./auth.js');
      await Auth.login(phone, password);
      
      // Reload app
      window.location.reload();
    } catch (e) {
      errorEl.textContent = e.message || 'Ошибка входа';
      errorEl.style.display = 'block';
    }
  },

  async handleTelegramLogin() {
    // Check if running inside Telegram WebApp
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      const user = tg.initDataUnsafe?.user;
      if (user) {
        try {
          const { Auth } = await import('./auth.js');
          await Auth.loginTelegram({
            id: user.id,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name
          });
          window.location.reload();
        } catch (e) {
          UI.showNotification(e.message, 'error');
        }
      } else {
        UI.showNotification('Данные пользователя не получены', 'error');
      }
    } else {
      UI.showNotification('Откройте в Telegram для входа', 'warning');
    }
  },

  // Render main app
  renderApp(state) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    document.getElementById('statusBar').style.display = 'flex';

    const container = document.getElementById('app');
    container.innerHTML = `
      ${this.renderSidebar(state)}
      <main class="main">
        <div id="mobileToggle" class="mobile-toggle" onclick="UI.toggleMobileMenu()" style="display:none">☰</div>
        <div id="pageContainer"></div>
      </main>
      ${this.renderAIButton()}
    `;

    // Update status
    this.updateStatus('connected');
    this.updateStatusTime();
    setInterval(() => this.updateStatusTime(), 60000);

    // Navigate to default page
    this.navigate('projects');
  },

  renderSidebar(state) {
    const user = state.user;
    const perms = user ? window.Auth?.getPermissions() : {};

    return `
      <aside class="sidebar" id="sidebar">
        <button class="sidebar-collapse-btn" onclick="UI.toggleSidebar()">◀</button>
        
        <div class="logo-section">
          <h1>RKT HUB</h1>
          <span class="subtitle">v14 · Управление проектами</span>
        </div>
        
        <nav class="nav">
          <div class="nav-section">Основное</div>
          <a href="#" class="nav-item active" data-page="projects" onclick="UI.navigate('projects')">
            <span class="icon">📊</span>
            <span class="label">Проекты</span>
          </a>
          <a href="#" class="nav-item" data-page="tasks" onclick="UI.navigate('tasks')">
            <span class="icon">✅</span>
            <span class="label">Задачи</span>
            <span class="badge" id="taskBadge">0</span>
          </a>
          
          ${perms.canManageStaff ? `
          <div class="nav-section">Команда</div>
          <a href="#" class="nav-item" data-page="staff" onclick="UI.navigate('staff')">
            <span class="icon">👥</span>
            <span class="label">Сотрудники</span>
          </a>
          <a href="#" class="nav-item" data-page="partners" onclick="UI.navigate('partners')">
            <span class="icon">🤝</span>
            <span class="label">Партнёры</span>
          </a>
          ` : ''}
          
          <div class="nav-section">Коммуникации</div>
          <a href="#" class="nav-item" data-page="comms" onclick="UI.navigate('comms')">
            <span class="icon">💬</span>
            <span class="label">Коммуникации</span>
          </a>
          <a href="#" class="nav-item" data-page="clients" onclick="UI.navigate('clients')">
            <span class="icon">👤</span>
            <span class="label">Клиенты</span>
          </a>
          
          ${perms.canSettings ? `
          <div class="nav-section">Администрирование</div>
          <a href="#" class="nav-item" data-page="admin" onclick="UI.navigate('admin')">
            <span class="icon">🛡️</span>
            <span class="label">Админ-панель</span>
          </a>
          ` : ''}
        </nav>
        
        <div class="user-bar">
          <div class="user-info">
            <div class="user-avatar">${user?.name?.charAt(0) || '👤'}</div>
            <div>
              <div class="user-name">${user?.name || 'Гость'}</div>
              <div class="user-role-text">${user?.role || ''}</div>
            </div>
          </div>
          <button class="logout-btn" onclick="UI.logout()">
            <span>🚪</span> Выйти
          </button>
        </div>
      </aside>
    `;
  },

  renderAIButton() {
    return `
      <button class="ai-fab" id="aiFab" onclick="UI.toggleAIChat()" aria-label="ИИ-ассистент">🤖</button>
      <div class="ai-global-panel" id="aiGlobalPanel">
        <div class="ai-head">
          <div class="ai-head-dot"></div>
          <div class="ai-head-info">
            <div class="ai-head-title">🤖 ИИ-ассистент RCT</div>
            <div class="ai-head-sub">Multi-AI · Groq + Gemini + Claude + DeepSeek</div>
          </div>
          <button class="ai-close" onclick="UI.toggleAIChat()">✕</button>
        </div>
        <div class="ai-body" id="aiBody">
          <div class="ai-msg bot">
            Здравствуйте! 👋 Я ИИ-ассистент RCT.<br><br>
            Расскажу об услугах, ценах, сроках — спрашивайте!
          </div>
        </div>
        <div class="ai-quick" id="aiQuick">
          <button class="ai-quick-btn" onclick="UI.aiSendQuick('Сколько стоит сайт?')">💰 Цены</button>
          <button class="ai-quick-btn" onclick="UI.aiSendQuick('Расскажите о медоборудовании')">🏥 Мед</button>
          <button class="ai-quick-btn" onclick="UI.aiSendQuick('Что такое AI-контент?')">🎬 Контент</button>
          <button class="ai-quick-btn" onclick="UI.aiSendQuick('Хочу заказать')">📝 Заказать</button>
        </div>
        <div class="ai-typing" id="aiTyping">
          <span></span><span></span><span></span>
        </div>
        <div class="ai-foot">
          <input id="aiInput" placeholder="Задайте вопрос..." onkeydown="if(event.key==='Enter'){event.preventDefault();UI.aiSend()}">
          <button id="aiSendBtn" onclick="UI.aiSend()">➤</button>
        </div>
      </div>
    `;
  },

  navigate(page) {
    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });

    // Render page content
    this.renderPage(page);
    
    // Close mobile menu if open
    document.getElementById('sidebar')?.classList.remove('open', 'mobile-open');
    document.getElementById('mobileToggle')?.classList.remove('active');
  },

  renderPage(page) {
    const container = document.getElementById('pageContainer');
    if (!container) return;

    const pages = {
      projects: () => this.renderProjectsPage(),
      tasks: () => this.renderTasksPage(),
      staff: () => this.renderStaffPage(),
      partners: () => this.renderPartnersPage(),
      comms: () => this.renderCommsPage(),
      clients: () => this.renderClientsPage(),
      admin: () => this.renderAdminPage()
    };

    const render = pages[page] || pages.projects;
    container.innerHTML = `<div class="page active" id="page-${page}">${render()}</div>`;
  },

  renderCurrentPage(state) {
    const currentPage = document.querySelector('.page.active');
    if (currentPage) {
      const pageId = currentPage.id.replace('page-', '');
      this.renderPage(pageId);
    }
  },

  // Page renderers (simplified - would be expanded)
  renderProjectsPage() {
    return `
      <div class="page-header">
        <h2>📊 Проекты</h2>
        <div class="actions">
          <button class="btn btn-primary" onclick="UI.openModal('project')">+ Проект</button>
        </div>
      </div>
      <div class="metrics" id="projectMetrics"></div>
      <div class="project-grid" id="projectGrid"></div>
    `;
  },

  renderTasksPage() {
    return `
      <div class="page-header">
        <h2>✅ Задачи</h2>
        <div class="actions">
          <button class="btn btn-primary" onclick="UI.openModal('task')">+ Задача</button>
          <button class="btn btn-secondary" onclick="UI.exportCSV('tasks')">📥 CSV</button>
        </div>
      </div>
      <div class="filters-bar">
        <div id="taskFilters"></div>
        <input class="search-input" placeholder="🔍 Поиск..." oninput="UI.filterTasks(this.value)">
      </div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>№</th><th>Задача</th><th>Направление</th>
                <th>Приоритет</th><th>Статус</th><th>Ответственный</th><th></th>
              </tr>
            </thead>
            <tbody id="tasksTable"></tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderStaffPage() {
    return `
      <div class="page-header">
        <h2>👥 Сотрудники</h2>
        <div class="actions">
          <button class="btn btn-primary" onclick="UI.openModal('staff')">+ Сотрудник</button>
        </div>
      </div>
      <div id="staffContent"></div>
    `;
  },

  renderPartnersPage() {
    return `
      <div class="page-header">
        <h2>🤝 Партнёры</h2>
        <div class="actions">
          <button class="btn btn-primary" onclick="UI.openModal('partner')">+ Партнёр</button>
          <button class="btn btn-secondary" onclick="UI.exportCSV('partners')">📥 CSV</button>
        </div>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Название</th><th>Страна</th><th>Направление</th>
                <th>Продукт</th><th>Статус</th><th>Контакт</th><th></th>
              </tr>
            </thead>
            <tbody id="partnersTable"></tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderCommsPage() {
    return `
      <div class="page-header">
        <h2>💬 Коммуникации</h2>
        <div class="actions">
          <button class="btn btn-primary" onclick="UI.openModal('comm')">+ Контакт</button>
        </div>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Партнёр</th><th>Тип</th><th>Тема</th>
                <th>Результат</th><th>Дата</th><th>Автор</th><th></th>
              </tr>
            </thead>
            <tbody id="commsTable"></tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderClientsPage() {
    return `
      <div class="page-header">
        <h2>👤 Клиенты</h2>
        <div class="actions">
          <button class="btn btn-primary" onclick="UI.openModal('direction')">+ Клиент</button>
        </div>
      </div>
      <div id="clientsContent"></div>
    `;
  },

  renderAdminPage() {
    return `
      <div class="page-header">
        <h2>🛡️ Админ-панель</h2>
      </div>
      <div id="adminContent"></div>
    `;
  },

  // Modal handling
  openModal(type, data = null) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay show';
    overlay.id = 'modalOverlay';
    overlay.onclick = (e) => { if (e.target === overlay) this.closeModal(); };

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = this.getModalContent(type, data);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  },

  closeModal() {
    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
      overlay.classList.remove('show');
      setTimeout(() => overlay.remove(), 250);
    }
  },

  getModalContent(type, data) {
    const titles = {
      project: '📊 Новый проект',
      task: '✅ Новая задача',
      staff: '👤 Сотрудник',
      partner: '🤝 Партнёр',
      comm: '💬 Коммуникация'
    };

    return `
      <div class="modal-header">
        <h3>${titles[type] || 'Форма'}</h3>
        <button class="modal-close" onclick="UI.closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <p>Форма для ${type}...</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="UI.closeModal()">Отмена</button>
        <button class="btn btn-primary" onclick="UI.saveModal('${type}')">Сохранить</button>
      </div>
    `;
  },

  saveModal(type) {
    // Implementation would save to database
    this.showNotification('Сохранено', 'success');
    this.closeModal();
  },

  // Notifications
  showNotification(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast toast-${type} show`;
    
    setTimeout(() => toast.classList.remove('show'), 3000);
  },

  showError(message) {
    this.showNotification(message, 'error');
  },

  // Status bar
  updateStatus(status) {
    const dot = document.getElementById('statusDot');
    const text = document.getElementById('statusText');
    
    if (status === 'connected') {
      dot.className = 'dot dot-green';
      text.textContent = 'Подключено';
    } else if (status === 'loading') {
      dot.className = 'dot dot-green';
      text.textContent = 'Загрузка...';
    } else {
      dot.className = 'dot dot-red';
      text.textContent = 'Ошибка';
    }
  },

  updateStatusTime() {
    const el = document.getElementById('statusTime');
    if (el) {
      el.textContent = new Date().toLocaleString('ru', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    }
  },

  // Sidebar controls
  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('collapsed');
    }
  },

  toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('mobileToggle');
    
    if (sidebar && toggle) {
      sidebar.classList.toggle('open');
      sidebar.classList.toggle('mobile-open');
      toggle.classList.toggle('active');
    }
  },

  // AI Chat controls
  toggleAIChat() {
    const panel = document.getElementById('aiGlobalPanel');
    const fab = document.getElementById('aiFab');
    
    if (panel && fab) {
      panel.classList.toggle('show');
      fab.classList.toggle('open');
      
      if (panel.classList.contains('show')) {
        document.getElementById('aiInput')?.focus();
      }
    }
  },

  aiSendQuick(text) {
    document.getElementById('aiQuick').style.display = 'none';
    this.aiAddMessage(text, 'user');
    this.aiCallBackend(text);
  },

  aiSend() {
    const input = document.getElementById('aiInput');
    const text = input?.value.trim();
    if (!text) return;
    
    input.value = '';
    document.getElementById('aiQuick').style.display = 'none';
    this.aiAddMessage(text, 'user');
    this.aiCallBackend(text);
  },

  aiAddMessage(text, type) {
    const body = document.getElementById('aiBody');
    if (!body) return;

    const div = document.createElement('div');
    div.className = `ai-msg ${type}`;
    div.innerHTML = type === 'bot' 
      ? text.replace(/\n/g, '<br>') 
      : text;
    
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  },

  async aiCallBackend(text) {
    // Implementation would call AI cascade
    this.showTyping(true);
    
    // Simulated response
    setTimeout(() => {
      this.showTyping(false);
      this.aiAddMessage('Это демонстрационный ответ. Настройте AI каскад в админ-панели.', 'bot');
    }, 1000);
  },

  showTyping(show) {
    const typing = document.getElementById('aiTyping');
    if (typing) {
      typing.classList.toggle('show', show);
    }
    document.getElementById('aiSendBtn').disabled = show;
    document.getElementById('aiInput').disabled = show;
  },

  // Export
  exportCSV(type) {
    this.showNotification(`Экспорт ${type}...`, 'info');
    // Implementation would generate CSV
  },

  filterTasks(query) {
    // Implementation would filter tasks table
    console.log('Filter tasks:', query);
  },

  logout() {
    if (confirm('Выйти из системы?')) {
      window.Auth?.logout();
      window.location.reload();
    }
  }
};
