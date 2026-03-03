/**
 * Authentication Module
 * Управление входом, сессиями и правами доступа
 */

const STORAGE_KEY = 'rkt_hub_user';

export const Auth = {
  user: null,

  // Roles and permissions
  ROLES: {
    'CEO': {
      emoji: '👑', level: 4,
      canWrite: true, canDelete: true, canApprove: true, canManageStaff: true,
      seeAll: true, canEditTasks: true, canEditPartners: true, canEditStaff: true,
      canEditProjects: true, canAssignTasks: true, canViewFinance: true,
      canExport: true, canSettings: true, canCreateSiteTask: true, canGenerateSite: true,
      writeSheets: ['Партнёры', 'Задачи', 'Направления', 'Сотрудники', 'Проекты', 'Согласования', 'Коммуникации'],
      desc: 'Полный доступ ко всей системе'
    },
    'Зам': {
      emoji: '⭐', level: 3,
      canWrite: true, canDelete: false, canApprove: false, canManageStaff: true,
      seeAll: false, canEditTasks: true, canEditPartners: true, canEditStaff: true,
      canEditProjects: false, canAssignTasks: true, canViewFinance: true,
      canExport: true, canSettings: false, canCreateSiteTask: true, canGenerateSite: true,
      writeSheets: ['Партнёры', 'Задачи', 'Коммуникации', 'Направления'],
      needsApproval: ['Сотрудники', 'Проекты'],
      desc: 'Управление своим проектом'
    },
    'Руководитель': {
      emoji: '📋', level: 2,
      canWrite: true, canDelete: false, canApprove: false, canManageStaff: false,
      seeAll: false, canEditTasks: true, canEditPartners: false, canEditStaff: false,
      canEditProjects: false, canAssignTasks: true, canViewFinance: false,
      canExport: false, canSettings: false, canCreateSiteTask: true, canGenerateSite: true,
      writeSheets: ['Задачи', 'Коммуникации'],
      needsApproval: ['Партнёры', 'Направления', 'Сотрудники', 'Проекты'],
      desc: 'Управление задачами в направлении'
    },
    'Менеджер': {
      emoji: '💼', level: 1,
      canWrite: true, canDelete: false, canApprove: false, canManageStaff: false,
      seeAll: false, canEditTasks: true, canEditPartners: false, canEditStaff: false,
      canEditProjects: false, canAssignTasks: false, canViewFinance: false,
      canExport: false, canSettings: false, canCreateSiteTask: true, canGenerateSite: false,
      writeSheets: ['Задачи', 'Коммуникации'],
      needsApproval: ['Партнёры', 'Направления'],
      desc: 'Работа с клиентами и задачами'
    },
    'Сотрудник': {
      emoji: '👤', level: 0,
      canWrite: false, canDelete: false, canApprove: false, canManageStaff: false,
      seeAll: false, canEditTasks: false, canEditPartners: false, canEditStaff: false,
      canEditProjects: false, canAssignTasks: false, canViewFinance: false,
      canExport: false, canSettings: false, canCreateSiteTask: false, canGenerateSite: false,
      writeSheets: [],
      needsApproval: ['Задачи', 'Партнёры', 'Коммуникации'],
      desc: 'Просмотр и выполнение задач'
    }
  },

  async checkSavedLogin() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    try {
      const userData = JSON.parse(saved);
      // Validate session (could check token expiry, etc.)
      this.user = userData;
      return userData;
    } catch (e) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  },

  async login(phone, password) {
    try {
      const { Config } = await import('./config.js');
      const config = Config.getAll();

      // Find user in staff table by phone
      const response = await fetch(
        `${config.API_URL}/rest/v1/staff?select=*&Телефон=eq.${phone}`,
        {
          headers: {
            'apikey': config.API_KEY,
            'Authorization': `Bearer ${config.API_KEY}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Ошибка подключения к базе');
      }

      const staff = await response.json();
      
      if (!staff || staff.length === 0) {
        throw new Error('Пользователь не найден');
      }

      const userRecord = staff[0];
      
      // For now, simple password check (in production, use proper auth)
      // Password would be stored as hash in real system
      if (userRecord['Пароль'] !== password && userRecord['password'] !== password) {
        throw new Error('Неверный пароль');
      }

      // Create user object
      const user = {
        id: userRecord.id || userRecord['id'],
        name: userRecord['Имя'] || userRecord['name'],
        role: userRecord['Роль'] || userRecord['role'] || 'Сотрудник',
        phone: userRecord['Телефон'] || userRecord['phone'],
        project: userRecord['Проект'] || userRecord['project'],
        direction: userRecord['Направление'] || userRecord['direction'],
        telegramId: userRecord['Telegram_ID'] || userRecord['telegram_id'],
        email: userRecord['Email'] || userRecord['email']
      };

      // Save session
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      this.user = user;

      return user;
    } catch (e) {
      console.error('[Auth] Login error:', e);
      throw e;
    }
  },

  async loginTelegram(telegramData) {
    // Telegram WebApp auth flow
    try {
      const { Config } = await import('./config.js');
      const config = Config.getAll();

      // Find user by Telegram ID
      const response = await fetch(
        `${config.API_URL}/rest/v1/staff?select=*&Telegram_ID=eq.${telegramData.id}`,
        {
          headers: {
            'apikey': config.API_KEY,
            'Authorization': `Bearer ${config.API_KEY}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Ошибка подключения');
      }

      const staff = await response.json();
      
      if (!staff || staff.length === 0) {
        throw new Error('Пользователь не найден. Обратитесь к администратору.');
      }

      const userRecord = staff[0];
      
      const user = {
        id: userRecord.id,
        name: userRecord['Имя'],
        role: userRecord['Роль'] || 'Сотрудник',
        phone: userRecord['Телефон'],
        project: userRecord['Проект'],
        direction: userRecord['Направление'],
        telegramId: userRecord['Telegram_ID'],
        email: userRecord['Email']
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      this.user = user;

      return user;
    } catch (e) {
      console.error('[Auth] Telegram login error:', e);
      throw e;
    }
  },

  logout() {
    localStorage.removeItem(STORAGE_KEY);
    this.user = null;
  },

  getPermissions() {
    if (!this.user) return this.ROLES['Сотрудник'];
    
    const basePerms = this.ROLES[this.user.role] || this.ROLES['Сотрудник'];
    
    // Check for custom permissions override in staff record
    // This would come from the data module
    return basePerms;
  },

  can(permission) {
    const perms = this.getPermissions();
    return !!perms[permission];
  },

  canWrite(sheet) {
    const perms = this.getPermissions();
    if (perms.writeSheets?.includes(sheet)) return 'direct';
    if (perms.needsApproval?.includes(sheet)) return 'approval';
    return 'denied';
  },

  normalizeRole(role) {
    if (!role) return 'Сотрудник';
    const r = role.trim().toLowerCase();
    
    if (r === 'ceo' || r === 'директор') return 'CEO';
    if (r === 'зам' || r === 'заместитель') return 'Зам';
    if (r === 'руководитель' || r === 'lead') return 'Руководитель';
    if (r === 'менеджер' || r === 'manager') return 'Менеджер';
    if (r === 'разработчик' || r === 'developer' || r === 'dev') return 'Разработчик';
    if (r === 'инженер' || r === 'engineer') return 'Инженер';
    
    return 'Сотрудник';
  }
};
