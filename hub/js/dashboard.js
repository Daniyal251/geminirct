// ============================================================
// hub/js/dashboard.js — Dashboard / home page rendering
// ES Module: export all public symbols
//
// Bridge pattern: DATA, USER, PROJECTS, STAGES, getUserPerms,
// filterByRole, today, getProjectDirs, DEFAULT_SALARY_PCT,
// prBadge, statusBadge, actBtns, esc, escA, progBar,
// emptyRow, renderRevenueChart, currentProject
// are referenced as window.xxx until migrated.
// ============================================================

export function renderDashboard() {
  const DATA    = window.DATA    || {};
  const USER    = window.USER    || null;
  const PROJECTS = window.PROJECTS || {};
  const STAGES  = window.STAGES  || [];

  const getUserPerms      = window.getUserPerms      || (() => ({}));
  const filterByRole      = window.filterByRole      || (arr => arr);
  const today             = window.today             || (() => new Date().toISOString().split('T')[0]);
  const getProjectDirs    = window.getProjectDirs    || (() => []);
  const currentProject    = window.currentProject    || null;
  const DEFAULT_SALARY_PCT = window.DEFAULT_SALARY_PCT || {};

  // Utility renderers (still in index.html until extracted)
  const esc       = window.esc      || (s => String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
  const escA      = window.escA     || esc;
  const prBadge   = window.prBadge  || (p => p ? `<span class="p${p.replace('P','')}">${p}</span>` : '—');
  const statusBadge = window.statusBadge || (s => `<span class="status">${esc(s||'—')}</span>`);
  const actBtns   = window.actBtns  || (() => '');
  const progBar   = window.progBar  || (p => `<div class="progress-wrap"><div class="progress-bar"><div class="progress-fill" style="width:${parseInt(p)||0}%;background:var(--accent)"></div></div><span class="progress-text">${parseInt(p)||0}%</span></div>`);
  const emptyRow  = window.emptyRow || ((cols, msg) => `<tr><td colspan="${cols}" style="text-align:center;color:var(--text3);padding:24px">${msg}</td></tr>`);
  const renderRevenueChart = window.renderRevenueChart || (() => '');
  const fmtMoney  = window.fmtMoney || (n => n.toLocaleString('ru-RU') + ' ₽');

  const p     = getUserPerms();
  const isCEO = USER && USER.role === 'CEO';

  // ── CEO / Зам KPI PANEL ─────────────────────────────────
  if (isCEO || (USER && USER.role === 'Зам')) {
    try {
      const projName = currentProject && PROJECTS[currentProject]
        ? PROJECTS[currentProject].name
        : 'Сайты';
      const allDirs   = DATA.directions || [];
      const siteDirs  = allDirs.filter(d => d['Проект'] === projName);
      const totalLeads  = siteDirs.length;
      const wonDeals    = siteDirs.filter(d => d['stage'] === 'done').length;
      const lostDeals   = siteDirs.filter(d => d['stage'] === 'lost').length;
      const activeDeals = totalLeads - wonDeals - lostDeals;
      const convRate    = totalLeads > 0 ? ((wonDeals / totalLeads) * 100).toFixed(1) : '0.0';
      const revenue     = siteDirs.filter(d => d['stage'] === 'done')
        .reduce((s, d) => s + (parseFloat(d['Цена']) || 0), 0);
      const todayDate   = new Date().toISOString().split('T')[0];
      const overdueFollowups = siteDirs.filter(d =>
        d['Следующий контакт'] && d['Следующий контакт'] < todayDate &&
        d['stage'] !== 'done' && d['stage'] !== 'lost'
      );

      let kpi = '<div style="background:linear-gradient(135deg,var(--bg3),var(--bg2));border:1px solid var(--border);border-radius:16px;padding:24px;margin-bottom:24px">';
      kpi += '<h3 style="font-size:15px;margin-bottom:16px;color:var(--text2)">📊 KPI Продажи (' + esc(projName) + ')</h3>';
      kpi += '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px" class="metrics">';
      kpi += '<div style="text-align:center"><div style="font-size:28px;font-weight:700;color:var(--accent)">'      + totalLeads  + '</div><div style="font-size:12px;color:var(--text2)">Всего</div></div>';
      kpi += '<div style="text-align:center"><div style="font-size:28px;font-weight:700;color:var(--blue)">'        + activeDeals  + '</div><div style="font-size:12px;color:var(--text2)">В работе</div></div>';
      kpi += '<div style="text-align:center"><div style="font-size:28px;font-weight:700;color:var(--green)">'       + wonDeals     + '</div><div style="font-size:12px;color:var(--text2)">Закрыто</div></div>';
      kpi += '<div style="text-align:center"><div style="font-size:28px;font-weight:700;color:var(--yellow)">'      + convRate + '%</div><div style="font-size:12px;color:var(--text2)">Конверсия</div></div>';
      kpi += '<div style="text-align:center"><div style="font-size:28px;font-weight:700;color:var(--purple)">'      + fmtMoney(revenue) + '</div><div style="font-size:12px;color:var(--text2)">Выручка</div></div>';
      kpi += '</div>';

      if (overdueFollowups.length > 0) {
        kpi += '<div style="margin-top:16px;padding:12px;background:rgba(255,107,107,0.1);border-radius:10px;border:1px solid rgba(255,107,107,0.2)">';
        kpi += '<span style="color:var(--red);font-weight:600">⚠️ Просроченных follow-up: ' + overdueFollowups.length + '</span>';
        kpi += '</div>';
      }

      // Per-stage funnel bars
      if (totalLeads > 0 && STAGES.length) {
        kpi += '<div style="margin-top:16px;border-top:1px solid var(--border);padding-top:14px">';
        kpi += '<div style="font-size:12px;color:var(--text2);margin-bottom:10px;font-weight:600">📊 Воронка по этапам</div>';
        STAGES.filter(s => s.id !== 'lost').forEach(s => {
          const cnt = siteDirs.filter(d => (d['stage'] || 'prospect') === s.id).length;
          const pct = Math.round(cnt / totalLeads * 100);
          kpi += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">';
          kpi += '<div style="font-size:11px;color:var(--text2);width:110px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(s.name) + '</div>';
          kpi += '<div style="flex:1;height:5px;background:var(--bg);border-radius:3px"><div style="width:' + pct + '%;height:100%;background:' + (s.color || 'var(--accent)') + ';border-radius:3px;transition:width .3s"></div></div>';
          kpi += '<div style="font-size:11px;color:var(--text3);width:24px;text-align:right">' + cnt + '</div>';
          kpi += '</div>';
        });
        kpi += '</div>';
      }

      // Average deal cycle
      const closedWithDates = siteDirs.filter(d =>
        d['stage'] === 'done' && (d['Дата добавления'] || d['Создан'] || d['created_at'])
      );
      if (closedWithDates.length > 0) {
        const avgDays = Math.round(closedWithDates.reduce((sum, d) => {
          const created = new Date(d['Дата добавления'] || d['Создан'] || d['created_at']);
          return sum + (isNaN(created.getTime()) ? 30 : Math.max(1, Math.round((Date.now() - created.getTime()) / 86400000)));
        }, 0) / closedWithDates.length);
        kpi += '<div style="margin-top:8px;font-size:12px;color:var(--text2)">⏱ Средний цикл сделки: <b style="color:var(--accent)">' + avgDays + ' дней</b></div>';
      }

      kpi += '</div>';

      const dashEl = document.getElementById('dashboardPage');
      if (dashEl) {
        const existing = dashEl.querySelector('.ceo-kpi-panel');
        if (existing) existing.remove();
        const div = document.createElement('div');
        div.className = 'ceo-kpi-panel';
        div.innerHTML = kpi;
        dashEl.prepend(div);
      }
    } catch (e) { console.warn('KPI render error:', e); }
  }

  // ── Filter data by user scope ────────────────────────────
  let fp  = filterByRole(DATA.partners  || []);
  let ft  = filterByRole(DATA.tasks     || []);
  let fpr = filterByRole(DATA.projects  || []);
  let fDirs = DATA.directions || [];

  if (!isCEO && USER && USER.direction && USER.direction !== 'Все') {
    fp  = fp.filter(x => (x['Направление'] || '') === USER.direction || !x['Направление']);
    ft  = ft.filter(x => (x['Направление'] || '') === USER.direction || (x['Ответственный'] || '') === USER.name);
    fpr = fpr.filter(x => (x['Направление'] || '') === USER.direction);
    fDirs = fDirs.filter(x => {
      const projKey = Object.keys(PROJECTS).find(k =>
        PROJECTS[k].name === USER.direction || getProjectDirs(k).includes(USER.direction)
      );
      return projKey ? getProjectDirs(projKey).includes(x['Название']) : true;
    });
  }
  if (p.level <= 1 && USER) {
    ft = ft.filter(t => (t['Ответственный'] || '').includes(USER.name));
  }

  const td      = today();
  const active  = ft.filter(t => (t['Статус'] || '') !== 'Готово' && (t['Статус'] || '') !== '✅ Готово');
  const overdue = active.filter(t => t['Дедлайн'] && t['Дедлайн'] < td);

  // ── Metrics cards ────────────────────────────────────────
  const metricsEl = document.getElementById('dash-metrics');
  if (metricsEl) {
    metricsEl.innerHTML =
      (isCEO ? '<div class="metric-card"><div class="m-icon">🏢</div><div class="m-value">' + Object.keys(PROJECTS).length + '</div><div class="m-label">Проектов</div></div>' : '') +
      (p.level >= 3 ? '<div class="metric-card"><div class="m-icon">🤝</div><div class="m-value">' + fp.length + '</div><div class="m-label">Партнёров</div><div class="m-sub">' + fp.filter(x => x['Статус'] === 'Активный').length + ' активных</div></div>' : '') +
      '<div class="metric-card"><div class="m-icon">✅</div><div class="m-value">' + active.length + '</div><div class="m-label">' + (p.level <= 1 ? 'Мои задачи' : 'Задач в работе') + '</div><div class="m-sub">' + (overdue.length ? '🔴 ' + overdue.length + ' просрочено' : 'всё в срок') + '</div></div>' +
      '<div class="metric-card"><div class="m-icon">📁</div><div class="m-value">' + fpr.length + '</div><div class="m-label">Подпроектов</div></div>' +
      (p.canManageStaff ? '<div class="metric-card"><div class="m-icon">👥</div><div class="m-value">' + (DATA.staff || []).filter(s => (s['Статус'] || 'Активный') !== 'Ожидает' && s['Статус'] !== '❌ Удалён').length + '</div><div class="m-label">Сотрудники</div></div>' : '');
  }

  // ── Revenue chart ─────────────────────────────────────────
  const rchEl = document.getElementById('dash-revenue-chart');
  if (rchEl) rchEl.innerHTML = (p.level >= 3) ? renderRevenueChart() : '';

  // ── Pipeline summary ──────────────────────────────────────
  const projName2 = currentProject && PROJECTS[currentProject]
    ? PROJECTS[currentProject].name : 'Сайты';
  const sDirs = fDirs.filter(d => d['Проект'] === projName2);
  const pEl = document.getElementById('dash-pipeline-summary');
  if (pEl && sDirs.length) {
    const tPipe = sDirs.filter(d => (d['stage'] || 'prospect') !== 'done').reduce((s, d) => s + (Number(d['Цена']) || 0), 0);
    const tPaid = sDirs.filter(d => d['Оплачено']).reduce((s, d) => s + (Number(d['Цена']) || 0), 0);
    pEl.innerHTML = '<div class="card" style="padding:16px 20px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><h4 style="font-size:14px;font-weight:600">🔄 Воронка</h4><a onclick="showPage(\'kanban\')" style="font-size:12px;color:var(--accent);cursor:pointer">Kanban →</a></div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">' +
      (STAGES || []).map(s => {
        const cnt = sDirs.filter(d => (d['stage'] || 'prospect') === s.id).length;
        return cnt ? '<span style="padding:3px 10px;border-radius:12px;background:var(--bg);font-size:11px;color:var(--text2)">' + esc(s.name) + ' <b>' + cnt + '</b></span>' : '';
      }).join('') +
      '</div><div style="font-size:12px;color:var(--text2)">💰 Получено: <b style="color:var(--green)">' + tPaid.toLocaleString('ru') + '₽</b> · В работе: <b style="color:var(--accent)">' + tPipe.toLocaleString('ru') + '₽</b></div></div>';
  } else if (pEl) { pEl.innerHTML = ''; }

  // ── My earnings ───────────────────────────────────────────
  const earningsEl = document.getElementById('dash-earnings');
  if (earningsEl && USER) {
    const myStaff = (DATA.staff || []).find(s => s['Имя'] === USER.name);
    const myPct   = myStaff ? (parseInt(myStaff['Процент_ЗП']) || DEFAULT_SALARY_PCT[myStaff['Роль']] || 0) : 0;
    const myDeals = (DATA.directions || []).filter(d =>
      d['Проект'] === projName2 && d['Оплачено'] && d['Менеджер'] === USER.name
    );
    const myTotal = myDeals.reduce((s, d) => s + Math.round((Number(d['Цена']) || 0) * myPct / 100), 0);
    const myPending = (DATA.directions || []).filter(d =>
      d['Проект'] === projName2 && !d['Оплачено'] && d['Менеджер'] === USER.name
    );
    const pendingTotal = myPending.reduce((s, d) => s + Math.round((Number(d['Цена']) || 0) * myPct / 100), 0);

    if (myDeals.length || myPending.length) {
      earningsEl.innerHTML =
        '<div class="card" style="padding:16px 20px"><h4 style="font-size:14px;font-weight:600;margin-bottom:10px">💰 Мои доходы</h4>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
        '<div style="text-align:center;padding:12px;background:rgba(0,212,170,0.08);border-radius:8px"><div style="font-size:11px;color:var(--text2)">✅ Получено</div><div style="font-size:22px;font-weight:700;color:var(--green)">' + myTotal.toLocaleString('ru') + '₽</div><div style="font-size:11px;color:var(--text3)">' + myDeals.length + ' сделок</div></div>' +
        '<div style="text-align:center;padding:12px;background:rgba(255,170,0,0.08);border-radius:8px"><div style="font-size:11px;color:var(--text2)">⏳ Ожидается</div><div style="font-size:22px;font-weight:700;color:var(--orange)">' + pendingTotal.toLocaleString('ru') + '₽</div><div style="font-size:11px;color:var(--text3)">' + myPending.length + ' в работе</div></div>' +
        '</div></div>';
    } else { earningsEl.innerHTML = ''; }
  }

  // ── Overdue tasks table ───────────────────────────────────
  const overdueEl = document.getElementById('dash-overdue');
  if (overdueEl) {
    overdueEl.innerHTML = overdue.length
      ? overdue.map(t =>
          '<tr style="background:rgba(255,107,107,0.03)"><td>' + esc(t['Описание'] || t['Название']) + '</td>' +
          '<td>' + esc(t['Направление']) + '</td>' +
          '<td>' + prBadge(t['Приоритет']) + '</td>' +
          '<td style="color:var(--red);font-weight:700">' + esc(t['Дедлайн']) + '</td>' +
          '<td>' + esc(t['Ответственный'] || '—') + '</td>' +
          '<td>' + actBtns('task', t.ID, t['Описание']) + '</td></tr>'
        ).join('')
      : emptyRow(6, 'Нет просроченных задач 🎉');
  }

  // ── Active projects ───────────────────────────────────────
  const projsEl = document.getElementById('dash-projects');
  if (projsEl) {
    const ap = fpr.filter(p => (p['Статус'] || '') !== 'Завершён').slice(0, 10);
    projsEl.innerHTML = ap.length
      ? ap.map(p =>
          '<tr><td><strong>' + esc(p['Название']) + '</strong></td>' +
          '<td>' + esc(p['Направление']) + '</td>' +
          '<td>' + statusBadge(p['Статус']) + '</td>' +
          '<td>' + progBar(p['Прогресс']) + '</td>' +
          '<td>' + esc(p['Дедлайн'] || '—') + '</td></tr>'
        ).join('')
      : emptyRow(5, 'Нет проектов');
  }

  // ── Recent communications ─────────────────────────────────
  const commsEl = document.getElementById('dash-comms');
  if (commsEl) {
    const rc = (DATA.comms || DATA.communications || []).slice(0, 5);
    commsEl.innerHTML = rc.length
      ? rc.map(c =>
          '<tr><td>' + esc(c['Партнёр']) + '</td>' +
          '<td>' + esc(c['Тип']) + '</td>' +
          '<td>' + esc(c['Тема']) + '</td>' +
          '<td>' + esc(c['Дата'] || '—') + '</td>' +
          '<td>' + esc(c['Автор'] || '—') + '</td></tr>'
        ).join('')
      : emptyRow(5, 'Нет записей');
  }
}