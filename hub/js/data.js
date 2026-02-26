// ============================================================
// hub/js/data.js — Application state, data loading, CRUD
// ES Module: import from config.js, export all public symbols
//
// NOTE (bridge pattern): functions not yet migrated to modules
// are referenced as window.xxx (still live in index.html).
// ============================================================

import { SB, mapFromDb, mapToDb, tableForSheet } from './config.js';

// ---- Filter cache (invalidated on each loadData) ----
export let _filterCache = new Map();
export let _filterCacheVersion = 0;

// ---- Application state ----
export let DATA = {
  partners: [], tasks: [], directions: [], staff: [],
  projects: [], approvals: [], comms: [], documents: []
};
export let USER = null;

// Setter helpers for external updates
export function setUser(u) { USER = u; }
export function setData(d) { DATA = d; }

// ---- Role normalization ----
// References window.ROLES (still in index.html; will be migrated later)
export function normalizeRole(role) {
  const r = (role || '').toLowerCase().trim();
  const map = {
    'генеральный директор': 'CEO', 'гендиректор': 'CEO', 'гендир': 'CEO', 'гд': 'CEO', 'директор': 'CEO',
    'заместитель': 'Зам', 'заместитель директора': 'Зам', 'замдир': 'Зам', 'зам': 'Зам',
    'менеджер по продажам': 'Менеджер', 'продажник': 'Менеджер', 'менеджер': 'Менеджер',
    'разраб': 'Разработчик', 'программист': 'Разработчик', 'dev': 'Разработчик', 'разработчик': 'Разработчик',
    'инженер': 'Инженер', 'руководитель': 'Руководитель', 'сотрудник': 'Сотрудник',
    'ceo': 'CEO'
  };
  if (map[r]) return map[r];
  if (r.startsWith('зам')) return 'Зам';
  if (r.startsWith('руковод')) return 'Руководитель';
  if (r.startsWith('менеджер')) return 'Менеджер';
  if (r.startsWith('директор') || r.startsWith('генеральн') || r.startsWith('генд') || r === 'ceo') return 'CEO';
  if (r.startsWith('разраб') || r.startsWith('программ') || r.startsWith('dev')) return 'Разработчик';
  if (r.startsWith('инженер')) return 'Инженер';
  // Check if role is already a valid ROLES key (ROLES is still in index.html)
  if (window.ROLES && window.ROLES[role]) return role;
  return role || 'Сотрудник';
}

// ---- Data normalization ----
export function normData(d) {
  const staffArr = Array.isArray(d.staff) ? d.staff : [];
  const cleanStaff = staffArr
    .filter(s => s['Имя'] && !['ФИО', 'Имя', 'Фамилия', 'Пример'].includes(s['Имя']))
    .map(s => { if (s['Роль']) s['Роль'] = normalizeRole(s['Роль']); return s; });
  return {
    partners: (Array.isArray(d.partners) ? d.partners : []).filter(p => p['Название'] && !['Название', 'Пример'].includes(p['Название'])),
    tasks: (Array.isArray(d.tasks) ? d.tasks : []).filter(t => t['Описание'] && !['Описание', 'Пример'].includes(t['Описание'])),
    directions: Array.isArray(d.directions) ? d.directions : [],
    staff: cleanStaff,
    projects: Array.isArray(d.projects) ? d.projects : [],
    approvals: Array.isArray(d.approvals) ? d.approvals : [],
    comms: Array.isArray(d.comms) ? d.comms : [],
    documents: Array.isArray(d.documents) ? d.documents : []
  };
}

// ---- Load all data from Supabase ----
export async function loadData() {
  _filterCache.clear();
  _filterCacheVersion++;
  if (window.setStatus) window.setStatus('loading');
  try {
    const [staff, partners, tasks, directions, projects, approvals, comms, docs] = await Promise.all([
      SB.from('staff').select('*'),
      SB.from('partners').select('*'),
      SB.from('tasks').select('*'),
      SB.from('directions').select('*'),
      SB.from('projects').select('*'),
      SB.from('approvals').select('*'),
      SB.from('communications').select('*'),
      SB.from('documents').select('*')
    ]);

    DATA = normData({
      staff: mapFromDb('staff', staff.data || []),
      partners: mapFromDb('partners', partners.data || []),
      tasks: mapFromDb('tasks', tasks.data || []),
      directions: mapFromDb('directions', directions.data || []),
      projects: mapFromDb('projects', projects.data || []),
      approvals: mapFromDb('approvals', approvals.data || []),
      comms: mapFromDb('communications', comms.data || []),
      documents: mapFromDb('documents', docs.data || [])
    });

    // Sync USER from fresh DB data (role/project may have changed by CEO)
    if (USER && USER.id) {
      const freshStaff = (DATA.staff || []).find(s => (s.ID || s.id) === USER.id);
      if (freshStaff) {
        const newRole = normalizeRole(freshStaff['Роль'] || freshStaff.role || USER.role);
        const newProject = (freshStaff['Проект'] || freshStaff.project || USER.project || '').trim();
        const newDir = (freshStaff['Направление'] || freshStaff.direction || USER.direction || '').trim();
        const newName = (freshStaff['Имя'] || freshStaff.name || USER.name).trim();
        if (newRole !== USER.role || newProject !== USER.project || newDir !== USER.direction || newName !== USER.name) {
          USER.role = newRole;
          USER.project = newProject;
          USER.direction = newDir || 'Все';
          USER.name = newName;
          localStorage.setItem('rkt_user', JSON.stringify(USER));
          // Update sidebar display
          const p = window.getUserPerms ? window.getUserPerms() : null;
          const nameEl = document.getElementById('userName');
          const roleEl = document.getElementById('userRoleText');
          if (nameEl) nameEl.textContent = USER.name;
          if (roleEl && p) roleEl.textContent = p.emoji + ' ' + USER.role;
          const avatarEl = document.getElementById('userAvatar');
          if (avatarEl) avatarEl.textContent = USER.name.charAt(0).toUpperCase();
          console.log('[RKT] USER synced from DB:', USER.name, USER.role, USER.project);
        }
      }
    }

    if (window.renderAll) window.renderAll();
    if (window.setStatus) window.setStatus('connected');
  } catch(e) {
    console.error('loadData error:', e);
    if (window.setStatus) window.setStatus('error');
    if (window.toast) window.toast('⚠️ Не удалось загрузить данные. Проверьте интернет-соединение.', 'error');
  }
}

// ---- CRUD helper ----
export async function apiWrite(sheet, row, action) {
  try {
    const table = tableForSheet(sheet);
    const dbRow = mapToDb(table, row);

    if (!dbRow.id && row.ID) dbRow.id = row.ID;
    if (!dbRow.id) dbRow.id = genId(table.charAt(0).toUpperCase());

    if (action === 'delete') {
      const { error } = await SB.from(table).delete().eq('id', dbRow.id);
      if (error) throw error;
    } else if (dbRow.id && action === 'update') {
      const id = dbRow.id;
      delete dbRow.id;
      const { error } = await SB.from(table).update(dbRow).eq('id', id);
      if (error) throw error;
    } else {
      const { error } = await SB.from(table).upsert(dbRow, { onConflict: 'id' });
      if (error) throw error;
    }
    return true;
  } catch(e) {
    console.error('apiWrite error:', e);
    if (window.toast) window.toast('❌ Не удалось сохранить. Проверьте интернет и попробуйте снова.', 'error');
    return false;
  }
}

// ---- ID generator ----
export function genId(prefix) {
  return (prefix || 'X') + Date.now().toString(36).toUpperCase();
}

// ---- Role-based data filtering ----
// References window.getUserPerms, window.getUserProjectKey, window.getProjectDirs, window.PROJECTS
export function filterByRole(arr) {
  const cacheKey = arr;
  if (_filterCache.has(cacheKey)) return _filterCache.get(cacheKey);

  const p = window.getUserPerms ? window.getUserPerms() : { seeAll: true };
  if (p.seeAll || !USER) { _filterCache.set(cacheKey, arr); return arr; }

  const userProjKey = window.getUserProjectKey ? window.getUserProjectKey() : null;
  const userName = (USER.name || USER['Имя'] || '').trim();
  const userDir = (USER.direction || USER['Направление'] || '').trim();
  const userProj = (USER.project || USER['Проект'] || '').trim();

  if (!userProjKey && (userDir === 'Все' || !userDir)) {
    if (p.level >= 2 && userProj) {
      const result = arr.filter(i => {
        const d = i['Направление'] || '';
        const proj = i['Проект'] || '';
        if (proj === userProj || d === userProj) return true;
        if (userName && (i['Ответственный'] || '').includes(userName)) return true;
        return false;
      });
      _filterCache.set(cacheKey, result);
      return result;
    }
    const result = arr.filter(i => userName && (i['Ответственный'] || '').includes(userName));
    _filterCache.set(cacheKey, result);
    return result;
  }

  const myDirs = new Set(['Все', 'Общее', '']);
  if (userDir && userDir !== 'Все') myDirs.add(userDir);
  if (userProj) myDirs.add(userProj);

  if (p.level >= 2 && userProjKey && window.getProjectDirs && window.PROJECTS) {
    window.getProjectDirs(userProjKey).forEach(d => myDirs.add(d));
    myDirs.add(window.PROJECTS[userProjKey].name);
  }

  if (userName) {
    const myStaff = (DATA.staff || []).find(s => s['Имя'] === userName);
    if (myStaff) {
      try {
        const extra = JSON.parse(myStaff['Доп_проекты'] || '[]');
        if (Array.isArray(extra)) {
          extra.forEach(ep => {
            myDirs.add(ep);
            if (window.PROJECTS && window.getProjectDirs) {
              const epKey = Object.keys(window.PROJECTS).find(k => window.PROJECTS[k].name === ep);
              if (epKey) window.getProjectDirs(epKey).forEach(d => myDirs.add(d));
            }
          });
        }
      } catch(e) {}
    }
  }

  const result = arr.filter(i => {
    const d = i['Направление'] || '';
    const proj = i['Проект'] || '';
    if (myDirs.has(d) || myDirs.has(proj)) return true;
    if (userName && (i['Ответственный'] || '').includes(userName)) return true;
    return false;
  });
  _filterCache.set(cacheKey, result);
  return result;
}
