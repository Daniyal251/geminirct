// ============================================================
// hub/js/router.js — Page navigation and history
// ES Module: export all public symbols
//
// NOTE (bridge pattern): page render functions (renderAll, renderKanban,
// renderClientsPage, etc.) are referenced as window.xxx until migrated.
// ============================================================

// ---- Navigation state ----
export let currentProject = null;       // Top-level project key (e.g. 'rkt', 'sites')
export let currentSubproject = null;    // Subproject direction name
export let currentPvTab = 'overview';   // Project view tab
export let currentSpTab = 'overview';   // Subproject view tab
export let currentTaskId = null;        // Task open for detail+AI
export let aiMessages = [];             // AI chat history for current task

export function setCurrentProject(v) { currentProject = v; }
export function setCurrentSubproject(v) { currentSubproject = v; }
export function setCurrentPvTab(v) { currentPvTab = v; }
export function setCurrentSpTab(v) { currentSpTab = v; }
export function setCurrentTaskId(v) { currentTaskId = v; }
export function setAiMessages(v) { aiMessages = v; }

// ---- Show a page by key ----
export function showPage(page) {
  if (page === 'kanban' && window.renderKanban) window.renderKanban();
  if (page === 'admin' && window.adminRefresh) window.adminRefresh();
  if (page === 'clients' && window.renderClientsPage) window.renderClientsPage();
  if (page === 'leads' && window.renderLeadsPage) window.renderLeadsPage();

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item[data-page]').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.nav-project-header').forEach(n => n.classList.remove('active'));

  const pe = document.getElementById('page-' + page);
  const ne = document.querySelector('.nav > [data-page="' + page + '"]');
  if (pe) pe.classList.add('active');
  if (ne) ne.classList.add('active');

  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar').classList.remove('mobile-open');
  const ov = document.getElementById('mobileOverlay');
  if (ov) ov.classList.remove('show');

  if (page === 'home') {
    currentProject = null;
    currentSubproject = null;
    if (window.sidebarExpandedProject !== undefined) window.sidebarExpandedProject = null;
  }

  if (page !== 'project' && page !== 'subproject') {
    document.querySelectorAll('.nav-project-header').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.nav-sub .nav-item').forEach(n => n.classList.remove('active'));
  }

  if (window.renderAll) window.renderAll();
  if (window.renderSidebarProjects) window.renderSidebarProjects();

  try {
    localStorage.setItem('rkt_nav', JSON.stringify({
      page,
      project: currentProject,
      subproject: currentSubproject,
      ts: Date.now()
    }));
  } catch(e) {}
}

// ---- Sidebar toggle (mobile) ----
export function toggleSidebar() {
  const sb = document.getElementById('sidebar') || document.querySelector('.sidebar');
  const overlay = document.getElementById('mobileOverlay');
  if (sb) { sb.classList.toggle('open'); sb.classList.toggle('mobile-open'); }
  if (overlay) overlay.classList.toggle('show');
}

// ---- Sidebar collapse (desktop) ----
export function toggleSidebarCollapse() {
  const sb = document.querySelector('.sidebar');
  if (!sb) return;
  sb.classList.toggle('collapsed');
  localStorage.setItem('sidebar_collapsed', sb.classList.contains('collapsed') ? '1' : '0');
}

// Restore collapsed state on init
export function initSidebarCollapse() {
  if (localStorage.getItem('sidebar_collapsed') === '1') {
    const sb = document.querySelector('.sidebar');
    if (sb) sb.classList.add('collapsed');
  }
}

// ---- Open top-level project ----
export function openProject(projKey) {
  if (window.sidebarExpandedProject !== undefined) window.sidebarExpandedProject = projKey;
  currentProject = projKey;
  currentSubproject = null;
  currentPvTab = 'overview';
  showPage('project');
  if (window.renderSidebarProjects) window.renderSidebarProjects();

  // Show/hide CRM-specific tabs
  const PROJECTS = window.PROJECTS || {};
  const isCRM = !!(PROJECTS[projKey] && PROJECTS[projKey].canAddSub);
  const pvPartnerBtn = document.querySelector('#page-project .actions [onclick*="partner"]');
  if (pvPartnerBtn) pvPartnerBtn.style.display = isCRM ? 'none' : '';
  const pvPartnerTab = document.querySelector('#pv-tabs [data-tab="partners"]');
  if (pvPartnerTab) pvPartnerTab.style.display = isCRM ? 'none' : '';
  document.querySelectorAll('.tab-finance, .tab-salaries').forEach(t => t.style.display = isCRM ? '' : 'none');
  const pipeTab = document.querySelector('#pv-tabs [data-tab="pipeline"]');
  const clientsTab = document.querySelector('#pv-tabs [data-tab="clients"]');
  if (pipeTab) pipeTab.style.display = isCRM ? '' : 'none';
  if (clientsTab) clientsTab.style.display = isCRM ? '' : 'none';

  if (window.renderProjectView) window.renderProjectView();
}

// ---- Open subproject ----
export function openSubproject(spName) {
  currentSubproject = spName;
  currentSpTab = 'overview';
  showPage('subproject');

  const PROJECTS = window.PROJECTS || {};
  const isCRM = !!(PROJECTS[currentProject] && PROJECTS[currentProject].canAddSub);
  const DATA = window.DATA || {};
  const dir = isCRM
    ? (DATA.directions || []).find(d =>
        (d['Название'] || d['name']) === spName &&
        d['Проект'] === (PROJECTS[currentProject] ? PROJECTS[currentProject].name : 'Сайты')
      )
    : null;

  // Configure tab visibility
  const tabs = {
    'overview': true, 'tasks': true,
    'client-info': isCRM, 'partners': !isCRM,
    'projects': !isCRM, 'comms': !isCRM,
    'files': true, 'sitegen': isCRM
  };
  document.querySelectorAll('#sp-tabs .tab').forEach(t => {
    const tab = t.getAttribute('data-tab');
    t.style.display = (tabs[tab] !== undefined ? tabs[tab] : true) ? '' : 'none';
  });

  if (window.renderSubprojectView) window.renderSubprojectView();
}
