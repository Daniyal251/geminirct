// ============================================================
// hub/js/staff.js — Staff page rendering and management
// ES Module: export all public symbols
//
// Bridge pattern: DATA, USER, PROJECTS, getUserPerms,
// getProjectDirs, hashPassword, CONFIG, SB, _staffCache,
// esc, escA, toast, renderAll
// are referenced as window.xxx until migrated.
// ============================================================

// ---- Filter state ----
export let staffProjectFilter = 'Все';
export let staffDirFilter     = 'Все';

export function setStaffProjectFilter(v) { staffProjectFilter = v; }
export function setStaffDirFilter(v)     { staffDirFilter     = v; }

// ---- Get staff for a project ----
export function getStaffForProject(proj) {
  const DATA     = window.DATA     || {};
  const PROJECTS = window.PROJECTS || {};
  const getProjectDirs = window.getProjectDirs || (() => []);

  if (proj === 'Все') return DATA.staff || [];

  const projDirs = (DATA.directions || [])
    .filter(d => (d['Проект'] || '') === proj)
    .map(d => d['Название'] || '');

  return (DATA.staff || []).filter(s => {
    const dir  = s['Направление'] || '';
    const role = s['Роль']        || '';
    const sPrj = s['Проект']      || '';
    if (role === 'CEO')    return true;
    if (sPrj === 'Все')    return true;
    if (sPrj === proj)     return true;
    if (projDirs.includes(dir)) return true;
    try {
      const extra = JSON.parse(s['Доп_проекты'] || '[]');
      if (Array.isArray(extra) && extra.includes(proj)) return true;
    } catch (e) {}
    return false;
  });
}

// ---- Render project/direction filter tabs ----
export function renderStaffTabs() {
  const DATA     = window.DATA     || {};
  const PROJECTS = window.PROJECTS || {};
  const esc      = window.esc      || (s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
  const escA     = window.escA     || esc;

  const projects = ['Все', 'РКТ', 'Сайты'];
  const projDirs = {};
  (DATA.directions || []).forEach(d => {
    const p = d['Проект'] || '';
    if (p && !projects.includes(p)) projects.push(p);
    (projDirs[p] = projDirs[p] || []).push(d['Название'] || '');
  });

  // Project tabs
  const tabsEl = document.getElementById('staff-project-tabs');
  if (tabsEl) {
    tabsEl.innerHTML = projects.map(p => {
      const emoji = p === 'Все' ? '🏠' : p === 'РКТ' ? '🏥' : p === 'Сайты' ? '🌐' : '📂';
      const count = getStaffForProject(p).length;
      return '<div class="tab' + (staffProjectFilter === p ? ' active' : '') +
        '" onclick="filterStaffProject(\'' + escA(p) + '\')">' + emoji + ' ' + esc(p) +
        ' <span style="opacity:.5;font-size:11px">(' + count + ')</span></div>';
    }).join('');
  }

  // Direction tabs (only when specific project selected)
  const dirEl = document.getElementById('staff-direction-tabs');
  if (dirEl) {
    if (staffProjectFilter === 'Все') {
      dirEl.innerHTML = '';
    } else {
      const dirs = ['Все', ...(projDirs[staffProjectFilter] || [])];
      dirEl.innerHTML = '<div class="tabs">' + dirs.map(d => {
        const count = d === 'Все'
          ? getStaffForProject(staffProjectFilter).length
          : (DATA.staff || []).filter(s => (s['Направление'] || '') === d).length;
        return '<div class="tab tab-sm' + (staffDirFilter === d ? ' active' : '') +
          '" onclick="filterStaffDir(\'' + escA(d) + '\')">' + esc(d) +
          ' <span style="opacity:.5">(' + count + ')</span></div>';
      }).join('') + '</div>';
    }
  }
}

export function filterStaffProject(proj) {
  staffProjectFilter = proj;
  staffDirFilter     = 'Все';
  renderStaff();
}

export function filterStaffDir(dir) {
  staffDirFilter = dir;
  renderStaff();
}

// ---- Main render ----
export function renderStaff() {
  renderStaffTabs();

  const DATA         = window.DATA         || {};
  const USER         = window.USER         || null;
  const PROJECTS     = window.PROJECTS     || {};
  const getUserPerms = window.getUserPerms || (() => ({}));
  const getProjectDirs = window.getProjectDirs || (() => []);
  const esc          = window.esc          || (s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
  const escA         = window.escA         || esc;

  const p = getUserPerms();
  let staff = getStaffForProject(staffProjectFilter);

  // Non-CEO: filter to their project/direction scope
  if (!p.seeAll && USER && USER.direction && USER.direction !== 'Все') {
    const userProjKey = Object.keys(PROJECTS).find(k =>
      getProjectDirs(k).includes(USER.direction) || PROJECTS[k].name === USER.direction
    );
    if (userProjKey) {
      const myDirs = getProjectDirs(userProjKey);
      staff = staff.filter(s => {
        const sd = s['Направление'] || '';
        const sp = s['Проект']      || '';
        return sd === USER.direction || myDirs.includes(sd) ||
          sp === (PROJECTS[userProjKey]?.name) || sd === 'Все' || s['Роль'] === 'CEO';
      });
    }
  }

  // Direction filter
  if (staffDirFilter !== 'Все') {
    staff = staff.filter(s => {
      const d    = s['Направление'] || '';
      const role = s['Роль']        || '';
      return d === staffDirFilter || role === 'CEO' || role === 'Зам' || d === 'Все';
    });
  }

  // Search
  const q = (document.getElementById('staff-search')?.value || '').toLowerCase().trim();
  if (q) {
    staff = staff.filter(s =>
      (s['Имя']       || '').toLowerCase().includes(q) ||
      (s['Роль']      || '').toLowerCase().includes(q) ||
      (s['Направление']||'').toLowerCase().includes(q) ||
      (s['Email']     || '').toLowerCase().includes(q)
    );
  }

  // Stats bar
  const roles = {};
  staff.forEach(s => { const r = s['Роль'] || 'Другое'; roles[r] = (roles[r] || 0) + 1; });
  const statsEl = document.getElementById('staff-stats');
  if (statsEl) {
    statsEl.innerHTML = '<div style="display:flex;flex-wrap:wrap;gap:6px">' +
      Object.entries(roles).map(([r, c]) =>
        '<span style="padding:3px 10px;background:var(--bg3);border-radius:20px;font-size:11px;color:var(--text2)">' +
        ({ CEO: '👑', Зам: '⭐', Руководитель: '📋' }[r] || '👤') + ' ' + esc(r) +
        ': <b style="color:var(--text)">' + c + '</b></span>'
      ).join('') +
      '<span style="padding:3px 10px;background:var(--accent-glow);border-radius:20px;font-size:11px;color:var(--accent);font-weight:600">Всего: ' + staff.length + '</span></div>';
  }

  // Pending registrations (CEO / canManageStaff only)
  const pendingEl = document.getElementById('staff-pending');
  if (pendingEl && p.canManageStaff) {
    const pending = (DATA.staff || []).filter(s => (s['Статус'] || '') === 'Ожидает');
    if (pending.length) {
      let ph = '<div class="card" style="border-color:rgba(255,169,77,.4)">' +
        '<div class="card-header" style="background:rgba(255,169,77,.05)"><h3>⏳ Ожидают одобрения (' + pending.length + ')</h3></div>' +
        '<div style="padding:12px;display:flex;flex-wrap:wrap;gap:10px">';
      pending.forEach(s => {
        ph += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:12px;min-width:200px">';
        ph += '<div style="font-weight:700">' + esc(s['Имя'] || '—') + '</div>';
        ph += '<div style="font-size:11px;color:var(--text2)">' + esc(s['Роль'] || '') + ' · ' + esc(s['Направление'] || '') + '</div>';
        if (s['Telegram_ID']) ph += '<div style="font-size:11px;color:var(--text3)">TG: ' + esc(String(s['Telegram_ID'])) + '</div>';
        if (s['Username'])   ph += '<div style="font-size:11px;color:var(--text3)">@' + esc(String(s['Username']).replace('@', '')) + '</div>';
        if (s['Телефон'])    ph += '<div style="font-size:11px;color:var(--text3)">📞 ' + esc(s['Телефон']) + '</div>';
        ph += '<div style="display:flex;gap:6px;margin-top:8px">';
        ph += '<button class="btn btn-sm btn-primary" onclick="approveStaff(\'' + escA(s.ID) + '\')">✅ Принять</button>';
        ph += '<button class="btn btn-sm btn-danger"  onclick="rejectStaff(\''  + escA(s.ID) + '\')">❌ Отклонить</button>';
        ph += '</div></div>';
      });
      ph += '</div></div>';
      pendingEl.innerHTML = ph;
    } else { pendingEl.innerHTML = ''; }
  }

  // Sort: CEO → Зам → Руководитель → rest, exclude pending
  const roleOrder = { CEO: 0, Зам: 1, Руководитель: 2, Менеджер: 3, Инженер: 4 };
  staff = [...staff]
    .filter(s => (s['Статус'] || 'Активный') !== 'Ожидает')
    .sort((a, b) => (roleOrder[a['Роль']] ?? 9) - (roleOrder[b['Роль']] ?? 9));

  const roleColors = {
    CEO:          'linear-gradient(135deg,#00d4aa,#4dabf7)',
    Зам:          'linear-gradient(135deg,#b197fc,#7950f2)',
    Руководитель: 'linear-gradient(135deg,#ffa94d,#fd7e14)',
    Менеджер:     'linear-gradient(135deg,#4dabf7,#228be6)'
  };

  let h = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px">';

  if (staff.length) {
    staff.forEach(s => {
      const bg       = roleColors[s['Роль']] || 'linear-gradient(135deg,var(--text3),var(--text2))';
      const initial  = (s['Имя'] || '?').charAt(0).toUpperCase();
      const dir      = s['Направление'] || 'Все';
      const role     = s['Роль']        || '';
      const taskCount = (DATA.tasks || []).filter(t =>
        (t['Ответственный'] || '').includes(s['Имя'] || '___') &&
        (t['Статус'] || '') !== 'Готово' && (t['Статус'] || '') !== '✅ Готово'
      ).length;

      h += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:16px;transition:all .2s">';
      h += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">';
      h += '<div style="width:44px;height:44px;border-radius:50%;background:' + bg + ';display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:var(--bg);flex-shrink:0">' + esc(initial) + '</div>';
      h += '<div><div style="font-weight:700;font-size:14px">' + esc(s['Имя'] || '—') + '</div>';
      h += '<div style="font-size:11px;color:var(--text2)">' + ({ CEO: '👑', Зам: '⭐', Руководитель: '📋' }[role] || '👤') + ' ' + esc(role) + '</div></div>';
      h += '</div>';

      // Badges
      h += '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">';
      if (role === 'Зам') {
        h += '<span style="padding:2px 8px;background:var(--purple-glow);color:var(--purple);border-radius:12px;font-size:10px;font-weight:600">Весь проект</span>';
      } else {
        h += '<span style="padding:2px 8px;background:var(--blue-glow);color:var(--blue);border-radius:12px;font-size:10px;font-weight:600">📂 ' + esc(dir) + '</span>';
      }
      if (taskCount) {
        h += '<span style="padding:2px 8px;background:var(--orange-glow);color:var(--orange);border-radius:12px;font-size:10px;font-weight:600">📋 ' + taskCount + ' задач</span>';
      }
      h += '</div>';

      // Contacts
      h += '<div style="display:flex;flex-direction:column;gap:3px;font-size:11px;color:var(--text3)">';
      if (s['Username'])   h += '<span>💬 @' + esc(String(s['Username']).replace('@', '')) + '</span>';
      if (s['Телефон'])    h += '<span>📞 ' + esc(s['Телефон']) + '</span>';
      if (s['Email'])      h += '<span>✉️ ' + esc(s['Email']) + '</span>';
      if (s['Telegram_ID']) h += '<span style="opacity:0.6">ID: ' + esc(String(s['Telegram_ID'])) + '</span>';
      h += '</div>';

      // Management buttons
      if (p.canManageStaff) {
        h += '<div style="display:flex;gap:6px;margin-top:10px;padding-top:10px;border-top:1px solid var(--border);flex-wrap:wrap">';
        h += '<button class="btn btn-sm btn-secondary" onclick="editItem(\'staff\',\'' + escA(s.ID) + '\')">✏️</button>';
        h += s['pin_hash']
          ? '<button class="btn btn-sm btn-secondary" onclick="resetStaffPassword(\'' + escA(s.ID) + '\',\'' + escA(s['Имя']) + '\')">🔓 Сброс пароля</button>'
          : '<span style="font-size:10px;color:var(--orange);padding:4px 8px">⚠️ Нет пароля</span>';
        h += '<button class="btn btn-sm btn-danger" onclick="confirmDelete(\'staff\',\'' + escA(s.ID) + '\',\'' + escA(s['Имя']) + '\')">🗑</button>';
        h += '</div>';
      }
      h += '</div>';
    });
  } else {
    h += '<div class="empty" style="grid-column:1/-1">' +
      '<div class="icon">👥</div>' +
      '<p>Нет сотрудников' + (staffProjectFilter !== 'Все' ? ' в «' + esc(staffProjectFilter) + '»' : '') + '</p></div>';
  }

  h += '</div>';

  const contentEl = document.getElementById('staff-content');
  if (contentEl) contentEl.innerHTML = h;
}

// ---- Password reset (calls window.SB) ----
export async function resetStaffPassword(staffId, staffName) {
  const toast       = window.toast       || console.log;
  const CONFIG      = window.CONFIG      || {};
  const SB          = window.SB          || null;
  const _staffCache = window._staffCache || [];
  const DATA        = window.DATA        || {};
  const hashPassword = window.hashPassword || (() => Promise.resolve(''));

  if (!confirm('Сбросить пароль для ' + staffName + '?\nНовый временный пароль будет показан на экране.')) return;
  try {
    const tempPass = Math.random().toString(36).slice(2, 8).toUpperCase();
    const hash     = await hashPassword(tempPass);
    if (SB) await SB.from('staff').update({ pin_hash: hash }).eq('id', staffId);

    const cached = _staffCache.find(s => (s.ID || s.id) === staffId);
    if (cached) cached['pin_hash'] = hash;
    const inData = (DATA.staff || []).find(s => (s.ID || s.id) === staffId);
    if (inData) inData['pin_hash'] = hash;

    const staff = cached || inData;
    const tgId  = staff?.Telegram_ID || staff?.['Telegram_ID'];
    if (tgId && CONFIG.TG_BOT_TOKEN) {
      try {
        await fetch('https://api.telegram.org/bot' + CONFIG.TG_BOT_TOKEN + '/sendMessage', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: tgId, text: '🔑 Ваш новый пароль для RKT HUB: ' + tempPass })
        });
        toast('✅ Новый пароль отправлен в Telegram для ' + staffName, 'success');
      } catch (e) {
        _showPasswordModal(staffName, tempPass, 'Telegram недоступен — передайте лично');
      }
    } else {
      _showPasswordModal(staffName, tempPass, 'Сообщите ему лично');
    }
    renderStaff();
  } catch (e) {
    toast('❌ Ошибка: ' + e.message, 'error');
  }
}

function _showPasswordModal(staffName, pass, note) {
  if (window.showPasswordModal) { window.showPasswordModal(staffName, pass, note); return; }
  // Fallback: simple alert
  alert('Новый пароль для ' + staffName + ': ' + pass + '\n(' + note + ')');
}