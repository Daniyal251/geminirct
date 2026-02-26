// ============================================================
// hub/js/tasks.js — Task list rendering, filters, task comments
// ES Module: export all public symbols
//
// Bridge pattern: DATA, USER, currentFilters, getUserPerms,
// filterByRole, filterByDir, filterBySearch, today,
// renderTimeline, prBadge, statusBadge, actBtns,
// esc, escA, emptyRow, openTaskDetail
// are referenced as window.xxx until migrated.
// ============================================================

// ---- Task filters state (mirrors index.html globals) ----
// currentFilters.tasks is defined in index.html — used directly via window

// ---- Render direction/person filter chips ----
export function renderTaskFilters() {
  const DATA          = window.DATA          || {};
  const currentFilters = window.currentFilters || {};
  const esc           = window.esc           || (s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
  const escA          = window.escA          || esc;

  // Direction chips
  const allDirs = ['Все', ...new Set((DATA.tasks || []).map(i => i['Направление']).filter(Boolean))];
  const filEl = document.getElementById('task-filters');
  if (filEl) {
    filEl.innerHTML = allDirs.map(d =>
      '<button class="filter-chip ' + (currentFilters.tasks === d ? 'active' : '') + '" ' +
      'onclick="currentFilters.tasks=\'' + escA(d) + '\';renderTasks()">' + esc(d) + '</button>'
    ).join('');
  }

  // Person dropdown
  const personSel = document.getElementById('task-filter-person');
  if (personSel) {
    const curVal = personSel.value || 'Все';
    const people = ['Все', ...new Set((DATA.tasks || []).map(t => t['Ответственный']).filter(Boolean))];
    personSel.innerHTML = people.map(p =>
      '<option value="' + escA(p) + '"' + (curVal === p ? ' selected' : '') + '>' + esc(p) + '</option>'
    ).join('');
  }
}

// ---- Main render function ----
export function renderTasks() {
  renderTaskFilters();

  const DATA           = window.DATA           || {};
  const currentFilters = window.currentFilters || {};
  const today          = window.today          || (() => new Date().toISOString().split('T')[0]);
  const filterByRole   = window.filterByRole   || (arr => arr);
  const filterByDir    = window.filterByDir    || ((arr, d) => d ? arr.filter(x => (x['Направление'] || '') === d) : arr);
  const filterBySearch = window.filterBySearch || ((arr) => arr);
  const renderTimeline = window.renderTimeline || (() => '');
  const getUserPerms   = window.getUserPerms   || (() => ({}));

  const esc      = window.esc      || (s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
  const escA     = window.escA     || esc;
  const prBadge  = window.prBadge  || (p => p ? `<span class="p${p.replace('P','')}">${p}</span>` : '—');
  const statusBadge = window.statusBadge || (s => `<span class="status">${esc(s || '—')}</span>`);
  const actBtns  = window.actBtns  || (() => '');
  const emptyRow = window.emptyRow || ((cols, msg, addBtn) => {
    const btn = addBtn ? `<button class="btn btn-sm btn-primary" onclick="${addBtn.action}">${addBtn.label}</button>` : '';
    return `<tr><td colspan="${cols}" style="text-align:center;color:var(--text3);padding:24px">${msg}${btn ? '<br><br>'+btn : ''}</td></tr>`;
  });

  // Apply filters
  let d = filterByRole(DATA.tasks || []);
  d = filterByDir(d, currentFilters.tasks === 'Все' ? null : currentFilters.tasks);
  d = filterBySearch(d, 'task-search', ['Описание', 'Название', 'Ответственный', 'Проект']);

  // Status filter
  const statusFilter = document.getElementById('task-filter-status')?.value || 'active';
  if (statusFilter === 'active') {
    d = d.filter(t => (t['Статус'] || '') !== '✅ Готово' && (t['Статус'] || '') !== 'Готово');
  } else if (statusFilter !== 'Все') {
    d = d.filter(t => (t['Статус'] || '').includes(statusFilter.replace(/[^а-яА-Я\s]/g, '').trim()));
  }

  // Person filter
  const personFilter = document.getElementById('task-filter-person')?.value || 'Все';
  if (personFilter !== 'Все') {
    d = d.filter(t => (t['Ответственный'] || '') === personFilter);
  }

  // Sort by priority
  const pO = { P1: 1, P2: 2, P3: 3 };
  d = [...d].sort((a, b) => (pO[a['Приоритет']] || 9) - (pO[b['Приоритет']] || 9));

  const td = today();
  const perms = getUserPerms();

  // Render table rows
  const tbl = document.getElementById('tasks-table');
  if (tbl) {
    tbl.innerHTML = d.length
      ? d.map((t, idx) => {
          const od = t['Дедлайн'] && t['Дедлайн'] < td &&
            (t['Статус'] || '') !== 'Готово' && (t['Статус'] || '') !== '✅ Готово';
          return '<tr style="cursor:pointer;' + (od ? 'background:rgba(255,107,107,0.05)' : '') +
            '" onclick="openTaskDetail(\'' + escA(t.ID) + '\')">' +
            '<td style="color:var(--text2);font-size:12px;text-align:center">' + (idx + 1) + '</td>' +
            '<td>' + (od ? '🔴 ' : '') + esc(t['Описание'] || t['Название']) + '</td>' +
            '<td>' + esc(t['Направление']) + '</td>' +
            '<td>' + prBadge(t['Приоритет']) + '</td>' +
            '<td>' + statusBadge(t['Статус']) + '</td>' +
            '<td>' + esc(t['Ответственный'] || '—') + '</td>' +
            '<td>' + (od ? '<span style="color:var(--red);font-weight:700">' : '') + esc(t['Дедлайн'] || '—') + (od ? '</span>' : '') + '</td>' +
            '<td onclick="event.stopPropagation()">' + actBtns('task', t.ID, t['Описание'] || t['Название']) + '</td></tr>';
        }).join('')
      : emptyRow(8, '📋 Задач пока нет',
          perms.canEditTasks ? { label: '+ Создать задачу', action: "openModal('task')" } : null
        );
  }

  // Gantt chart
  const ganttEl = document.getElementById('task-gantt');
  if (ganttEl) {
    const showGantt = document.getElementById('task-show-gantt')?.checked;
    ganttEl.innerHTML = showGantt ? renderTimeline(d) : '';
  }
}

// ---- Task comments (localStorage) ----
export function getTaskComments(taskId) {
  try {
    return JSON.parse(localStorage.getItem('rkt_task_comments_' + taskId) || '[]');
  } catch (e) { return []; }
}

export function saveTaskComment(taskId, text) {
  const USER = window.USER || null;
  const comments = getTaskComments(taskId);
  comments.push({
    author: USER ? USER.name : 'Аноним',
    date: new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
    text: String(text).trim()
  });
  localStorage.setItem('rkt_task_comments_' + taskId, JSON.stringify(comments));
}

export function loadTaskComments(taskId) {
  const el = document.getElementById('task-comments-list');
  if (!el) return;

  const esc = window.esc || (s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
  const comments = getTaskComments(taskId);

  if (!comments.length) {
    el.innerHTML = '<div style="text-align:center;color:var(--text2);font-size:12px;padding:16px">Пока нет комментариев</div>';
    return;
  }

  el.innerHTML = comments.map(c =>
    '<div style="padding:8px;background:var(--bg2);border-radius:8px;margin-bottom:6px">' +
    '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text2);margin-bottom:4px">' +
    '<strong>' + esc(c.author) + '</strong><span>' + esc(c.date) + '</span></div>' +
    '<div style="font-size:13px">' + esc(c.text) + '</div></div>'
  ).join('');

  el.scrollTop = el.scrollHeight;
}

// ---- Quick task status update ----
export async function quickSetTaskStatus(taskId, newStatus) {
  const toast    = window.toast    || console.log;
  const apiWrite = window.apiWrite || (() => Promise.reject(new Error('apiWrite not available')));
  const DATA     = window.DATA     || {};
  const renderAll = window.renderAll || (() => {});

  try {
    await apiWrite('tasks', { ID: taskId, 'Статус': newStatus });
    const t = (DATA.tasks || []).find(x => String(x.ID) === String(taskId));
    if (t) t['Статус'] = newStatus;
    renderAll();
    toast('✅ Статус обновлён', 'success');
  } catch (e) {
    toast('❌ Ошибка: ' + e.message, 'error');
  }
}