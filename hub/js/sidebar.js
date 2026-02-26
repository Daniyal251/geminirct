// ============================================================
// hub/js/sidebar.js — Sidebar projects list and nav badges
// ES Module: export all public symbols
//
// NOTE (bridge pattern): DATA, USER, PROJECTS, filterByRole, today,
// getUserPerms are referenced as window.xxx until migrated.
// ============================================================

// ---- Sidebar project expand state ----
export let sidebarExpandedProject = null;

export const PROJECT_ICONS = { rkt: '🏥', sites: '🌐', content: '🎬', ai: '🤖' };

export const PROJECT_TABS_CRM = [
  { key: 'overview',  icon: '📊', label: 'Обзор' },
  { key: 'pipeline',  icon: '🎯', label: 'Воронка' },
  { key: 'clients',   icon: '👥', label: 'Клиенты' },
  { key: 'tasks',     icon: '✅', label: 'Задачи' },
  { key: 'team',      icon: '👤', label: 'Сотрудники' },
  { key: 'finance',   icon: '💰', label: 'Финансы' }
];

export const PROJECT_TABS_STD = [
  { key: 'overview',  icon: '📊', label: 'Обзор' },
  { key: 'tasks',     icon: '✅', label: 'Задачи' },
  { key: 'partners',  icon: '🤝', label: 'Партнёры' },
  { key: 'team',      icon: '👤', label: 'Сотрудники' }
];

// ---- Render the dynamic sidebar project list ----
export function renderSidebarProjects() {
  const el = document.getElementById('sidebarProjectsList');
  if (!el) return;

  const PROJECTS = window.PROJECTS || {};
  const currentProject = window.currentProject || null;
  const currentPvTab = window.currentPvTab || 'overview';

  let html = '';
  Object.keys(PROJECTS).forEach(function(key) {
    const p = PROJECTS[key];
    const icon = PROJECT_ICONS[key] || '📁';
    const name = p.name || key;
    const isOpen = sidebarExpandedProject === key;
    const isActive = currentProject === key;
    const isCRM = !!p.canAddSub;
    const tabs = isCRM ? PROJECT_TABS_CRM : PROJECT_TABS_STD;

    html += '<div class="nav-project">';
    html += '<div class="nav-project-header' + (isActive ? ' active' : '') + (isOpen ? ' open' : '') +
            '" onclick="toggleSidebarProject(\'' + key + '\')">';
    html += '<span class="icon">' + icon + '</span>';
    html += '<span class="label">' + name + '</span>';
    html += '<span class="arrow">▸</span>';
    html += '</div>';
    html += '<div class="nav-sub' + (isOpen ? ' open' : '') + '">';

    tabs.forEach(function(tab) {
      const tabActive = isActive && currentPvTab === tab.key;
      html += '<a class="nav-item' + (tabActive ? ' active' : '') +
              '" onclick="openProjectTab(\'' + key + '\',\'' + tab.key + '\')">';
      html += '<span class="icon">' + tab.icon + '</span><span class="label">' + tab.label + '</span>';
      html += '</a>';
    });

    html += '</div></div>';
  });

  el.innerHTML = html;
}

// ---- Toggle expand/collapse of a project in sidebar ----
export function toggleSidebarProject(projKey) {
  sidebarExpandedProject = sidebarExpandedProject === projKey ? null : projKey;
  renderSidebarProjects();
}

// ---- Open a specific project tab ----
export function openProjectTab(projKey, tab) {
  sidebarExpandedProject = projKey;
  window.currentProject = projKey;
  window.currentSubproject = null;

  const tabMap = {
    overview: 'overview', pipeline: 'pipeline', clients: 'clients',
    tasks: 'tasks', team: 'staff', finance: 'finance', partners: 'partners'
  };
  window.currentPvTab = tabMap[tab] || tab;

  if (window.showPage) window.showPage('project');
  renderSidebarProjects();

  document.getElementById('sidebar').classList.remove('open', 'mobile-open');
  const ov = document.getElementById('mobileOverlay');
  if (ov) ov.classList.remove('show');
}

// ---- Update nav badges ----
export function updateBadges() {
  const DATA = window.DATA || { partners: [], tasks: [], directions: [], approvals: [] };
  const filterByRole = window.filterByRole || (arr => arr);
  const td = (window.today && window.today()) || new Date().toISOString().split('T')[0];

  const fp = filterByRole(DATA.partners || []);
  const allActiveTasks = filterByRole(DATA.tasks || []).filter(t => {
    const st = t['Статус'] || '';
    return st !== 'Готово' && st !== '✅ Готово';
  });
  const overdueTasks = allActiveTasks.filter(t => t['Дедлайн'] && t['Дедлайн'] < td);
  const pa = (DATA.approvals || []).filter(a => (a['Статус'] || '').includes('Ожидает'));
  const fd = filterByRole(DATA.directions || []);

  const el = id => document.getElementById(id);

  if (el('badge-partners')) el('badge-partners').textContent = fp.length;

  const taskBadge = el('badge-tasks');
  if (taskBadge) {
    const hasOverdue = overdueTasks.length > 0;
    taskBadge.textContent = hasOverdue ? overdueTasks.length : allActiveTasks.length;
    taskBadge.className = 'badge' + (hasOverdue ? ' badge-red' : '');
    taskBadge.title = hasOverdue
      ? overdueTasks.length + ' просроченных задач'
      : allActiveTasks.length + ' активных задач';
  }

  if (el('badge-approvals')) el('badge-approvals').textContent = pa.length;
  if (el('badge-clients')) el('badge-clients').textContent = fd.length;

  const bd = el('badge-deals');
  if (bd) {
    const activeDealsCount = fd.filter(d => d['stage'] !== 'done' && d['stage'] !== 'lost').length;
    bd.textContent = activeDealsCount;
    bd.className = 'badge' + (activeDealsCount > 0 ? '' : ' badge-hidden');
  }
}
