/**
 * Data Module
 * Загрузка и управление данными из Supabase
 */

import { Config } from './config.js';

const TABLES = {
  projects: 'Проекты',
  directions: 'Направления',
  tasks: 'Задачи',
  staff: 'Сотрудники',
  partners: 'Партнёры',
  comms: 'Коммуникации',
  approvals: 'Согласования',
  leads: 'Лиды',
  clients: 'Клиенты',
  settings: 'settings',
  aiLogs: 'ai_logs'
};

export const Data = {
  data: {},

  async loadAll() {
    const config = Config.getAll();
    const promises = Object.entries(TABLES).map(async ([key, table]) => {
      try {
        const response = await fetch(
          `${config.API_URL}/rest/v1/${table}?select=*`,
          {
            headers: {
              'apikey': config.API_KEY,
              'Authorization': `Bearer ${config.API_KEY}`
            }
          }
        );
        
        if (response.ok) {
          this.data[key] = await response.json();
        } else {
          console.warn(`[Data] Failed to load ${table}:`, response.status);
          this.data[key] = [];
        }
      } catch (e) {
        console.error(`[Data] Error loading ${table}:`, e);
        this.data[key] = [];
      }
    });

    await Promise.all(promises);
  },

  getAll() {
    return { ...this.data };
  },

  get(table) {
    return this.data[table] || [];
  },

  // Get projects with subprojects
  getProjects() {
    const projects = this.data.projects || [];
    const directions = this.data.directions || [];
    
    return projects.map(proj => ({
      ...proj,
      subprojects: directions.filter(d => d['Проект'] === proj['Название'])
    }));
  },

  // Get tasks filtered by user permissions
  getTasks(user) {
    let tasks = this.data.tasks || [];
    
    if (!user) return [];
    
    const perms = window.Auth?.getPermissions();
    if (!perms?.seeAll) {
      // Filter by user's project and direction
      tasks = tasks.filter(t => {
        if (t['Ответственный'] === user.name) return true;
        if (t['Проект'] === user.project) return true;
        return false;
      });
    }
    
    return tasks;
  },

  // Get staff by project
  getStaffByProject(project) {
    const staff = this.data.staff || [];
    if (!project) return staff;
    
    return staff.filter(s => {
      if (s['Проект'] === project) return true;
      if (s['Проект'] === 'Все') return true;
      
      // Check extra_projects JSON field
      try {
        const extra = JSON.parse(s['Доп_проекты'] || '[]');
        return Array.isArray(extra) && extra.includes(project);
      } catch {
        return false;
      }
    });
  },

  // Get directions (subprojects) by project
  getDirections(project) {
    const directions = this.data.directions || [];
    if (!project) return directions;
    
    return directions.filter(d => d['Проект'] === project);
  },

  // CRUD operations
  async create(table, record) {
    const config = Config.getAll();
    
    try {
      const response = await fetch(
        `${config.API_URL}/rest/v1/${table}`,
        {
          method: 'POST',
          headers: {
            'apikey': config.API_KEY,
            'Authorization': `Bearer ${config.API_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(record)
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        await this.loadAll(); // Refresh data
        return result[0];
      } else {
        throw new Error(`Failed to create: ${response.status}`);
      }
    } catch (e) {
      console.error('[Data] Create error:', e);
      throw e;
    }
  },

  async update(table, id, record) {
    const config = Config.getAll();
    
    try {
      const response = await fetch(
        `${config.API_URL}/rest/v1/${table}?id=eq.${id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': config.API_KEY,
            'Authorization': `Bearer ${config.API_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(record)
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        await this.loadAll();
        return result[0];
      } else {
        throw new Error(`Failed to update: ${response.status}`);
      }
    } catch (e) {
      console.error('[Data] Update error:', e);
      throw e;
    }
  },

  async delete(table, id) {
    const config = Config.getAll();
    
    try {
      const response = await fetch(
        `${config.API_URL}/rest/v1/${table}?id=eq.${id}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': config.API_KEY,
            'Authorization': `Bearer ${config.API_KEY}`
          }
        }
      );
      
      if (response.ok) {
        await this.loadAll();
        return true;
      } else {
        throw new Error(`Failed to delete: ${response.status}`);
      }
    } catch (e) {
      console.error('[Data] Delete error:', e);
      throw e;
    }
  },

  // Search and filter
  search(table, query, fields) {
    const data = this.data[table] || [];
    if (!query) return data;
    
    const lowerQuery = query.toLowerCase();
    
    return data.filter(record => {
      return fields.some(field => {
        const value = record[field]?.toString().toLowerCase() || '';
        return value.includes(lowerQuery);
      });
    });
  },

  // Filter by status
  filterByStatus(table, status) {
    const data = this.data[table] || [];
    if (!status || status === 'Все') return data;
    
    return data.filter(record => {
      const recordStatus = record['Статус'] || record['status'] || '';
      return recordStatus.includes(status);
    });
  },

  // Get statistics
  getStats() {
    return {
      projects: (this.data.projects || []).length,
      tasks: (this.data.tasks || []).length,
      staff: (this.data.staff || []).length,
      partners: (this.data.partners || []).length,
      activeTasks: (this.data.tasks || []).filter(t => 
        !t['Статус']?.includes('Готово') && !t['Статус']?.includes('✅')
      ).length,
      completedTasks: (this.data.tasks || []).filter(t => 
        t['Статус']?.includes('Готово') || t['Статус']?.includes('✅')
      ).length
    };
  }
};
