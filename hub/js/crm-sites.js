// ============================================================
// hub/js/crm-sites.js — CRM Сайты: slide-over deal card,
//   stage management, touch log, follow-up, feedback, notes
// ES Module: export all public symbols
//
// Bridge: DATA, PROJECTS, STAGES (from kanban.js / window.STAGES),
//   today, addDays, formatDateRu, esc, escA, getUserPerms,
//   toast, SB, loadData, renderAll, renderKanban, renderProjectView,
//   showCustomModal, closeCustomModal, notifyTaskAssigned,
//   buildRktCrmHtml (crm-med.js), genId, SITE_PIPELINE,
//   getSiteStaffByRole, openSubproject, confirmDelete
// ============================================================

let currentDealId = null;

// Helper: get STAGES from kanban module or window fallback
function getStages() {
  return window.STAGES || [];
}

// ── Slide-over open/close ─────────────────────────────────────

export function openSlideOver(id) {
  const DATA         = window.DATA         || {};
  const today        = window.today        || (() => new Date().toISOString().split('T')[0]);
  const esc          = window.esc          || (s => String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
  const escA         = window.escA         || esc;
  const getUserPerms = window.getUserPerms || (() => ({}));
  const formatDateRu = window.formatDateRu || (d => d || '—');
  const STAGES       = getStages();

  const dir = (DATA.directions || []).find(d => (d['ID'] || d.id) === id);
  if (!dir) return;
  currentDealId = id;

  const stage    = dir['stage'] || 'prospect';
  const stageIdx = STAGES.findIndex(s => s.id === stage);
  const td       = today();

  document.getElementById('so-name').textContent = dir['Название'] || '?';
  document.getElementById('so-type').textContent = (dir['Тип сайта'] || '—') + ' · ' + (dir['Город'] || '—');

  // Progress circles
  document.getElementById('so-progress').innerHTML = STAGES.map((s, i) =>
    (i > 0 ? `<div class="so-line ${i <= stageIdx ? 'done' : ''}"></div>` : '') +
    `<div class="so-step ${i < stageIdx ? 'done' : ''} ${i === stageIdx ? 'active' : ''}" title="${s.name}"
      onclick="window.setDealStageConfirm('${id}','${s.id}','${s.name.replace(/'/g, "\\'").replace(/`/g, '\\`')}')"></div>`
  ).join('');

  document.getElementById('so-stage-labels').innerHTML = STAGES.map(s =>
    `<span>${s.name.replace(/[^\s\wА-Яа-яёЁ]/g, '').trim()}</span>`
  ).join('');

  // Guided workflow banner
  const wfBanner = document.getElementById('so-workflow-banner');
  const nextActions = {
    'prospect':    {step:'1️⃣', title:'Позвоните клиенту',              desc:'Установите первый контакт — позвоните или напишите',       action:'📞 Позвонил → Первый контакт', fn:`window.setDealStage('${id}','contact')`},
    'contact':     {step:'2️⃣', title:'Ждём ответ от клиента',          desc:'Клиент знает о нас. Перезвоните через 1-2 дня если не ответил', action:'✅ Клиент заинтересован',    fn:`window.setDealStage('${id}','interest')`},
    'interest':    {step:'3️⃣', title:'Создайте прототип сайта',         desc:'Клиент заинтересован — покажите ему демо-сайт',            action:'🎨 Создать прототип',          fn:`window.openSubproject('${escA(dir['Название']||'')}')`},
    'proto':       {step:'4️⃣', title:'Отправьте КП',                    desc:'Покажите прототип + отправьте цену и условия',             action:'📋 КП отправлено',             fn:`window.setDealStage('${id}','proposal')`},
    'proposal':    {step:'5️⃣', title:'Обсудите условия',                desc:'Созвонитесь, обсудите правки, торгуйтесь',                 action:'🤝 Начали переговоры',         fn:`window.setDealStage('${id}','negotiation')`},
    'negotiation': {step:'6️⃣', title:'Закройте сделку!',                desc:'Клиент готов — выставьте счёт',                           action:'💰 Клиент оплатил',            fn:`window.setDealStage('${id}','payment')`},
    'payment':     {step:'7️⃣', title:'Сдайте сайт',                     desc:'Залейте на хостинг и передайте клиенту',                  action:'✅ Сайт сдан!',                 fn:`window.setDealStage('${id}','done')`},
  };
  if (nextActions[stage]) {
    const na = nextActions[stage];
    wfBanner.innerHTML = `<div class="workflow-banner"><div class="wf-step">${na.step}</div><div class="wf-info"><h4>${na.title}</h4><p>${na.desc}</p></div><div class="wf-action"><button onclick="${na.fn}">${na.action}</button></div></div>`;
  } else if (stage === 'done') {
    wfBanner.innerHTML = '<div class="workflow-banner" style="border-color:var(--green);background:rgba(0,212,170,.06)"><div class="wf-step">🎉</div><div class="wf-info"><h4 style="color:var(--green)">Проект завершён!</h4><p>Клиент получил готовый сайт</p></div></div>';
  } else if (stage === 'lost') {
    wfBanner.innerHTML = `<div class="workflow-banner" style="border-color:var(--red);background:rgba(255,75,75,.06)"><div class="wf-step">❌</div><div class="wf-info"><h4 style="color:var(--red)">Клиент отказался</h4><p>Причина: ${esc(dir['Причина отказа'] || 'не указана')}</p></div><div class="wf-action"><button onclick="window.setDealStage('${id}','prospect')">🔄 Вернуть в воронку</button></div></div>`;
  } else {
    wfBanner.innerHTML = '';
  }

  // Details grid
  const touches     = Number(dir['Касания'] || 0);
  const nextContact = dir['Следующий контакт'] || '';
  const isOverdue   = nextContact && nextContact <= td && !['done', 'lost'].includes(stage);
  document.getElementById('so-details').innerHTML = `
    <div class="so-detail-item"><div class="so-label">💰 Цена</div><div class="so-value">${(Number(dir['Цена'])||0).toLocaleString('ru')}₽</div></div>
    <div class="so-detail-item"><div class="so-label">💳 Оплата</div><div class="so-value" style="color:${dir['Оплачено']?'var(--green)':'var(--orange)'}">${dir['Оплачено']?'✅ Оплачен':'⏳ Не оплачен'}</div></div>
    <div class="so-detail-item"><div class="so-label">👤 Контакт</div><div class="so-value">${esc(dir['Клиент']||dir['Название']||'—')}</div></div>
    <div class="so-detail-item"><div class="so-label">📱 Телефон</div><div class="so-value">${esc(dir['Телефон']||'—')}</div></div>
    <div class="so-detail-item"><div class="so-label">👤 Менеджер</div><div class="so-value">${esc(dir['Менеджер']||'—')}</div></div>
    <div class="so-detail-item"><div class="so-label">📡 Источник</div><div class="so-value">${esc(dir['Источник']||'—')}</div></div>
    <div class="so-detail-item"><div class="so-label">🌐 Тип</div><div class="so-value">${esc(dir['Тип сайта']||'—')}</div></div>
    <div class="so-detail-item"><div class="so-label">📍 Город</div><div class="so-value">${esc(dir['Город']||'—')}</div></div>
    <div class="so-detail-item"><div class="so-label">📞 Касаний</div><div class="so-value">${touches} из 8</div></div>
    <div class="so-detail-item"><div class="so-label">📅 Перезвонить</div><div class="so-value" style="color:${isOverdue?'var(--orange)':'inherit'}">${isOverdue?'🔔 ':''}${nextContact ? formatDateRu(nextContact) : 'не указано'}</div></div>
    ${dir['Ссылка']    ? `<div class="so-detail-item" style="grid-column:span 2"><div class="so-label">🔗 Ссылка</div><div class="so-value"><a href="${esc(dir['Ссылка'])}" target="_blank" style="color:var(--accent)">${esc(dir['Ссылка'])}</a></div></div>` : ''}
    ${dir['Описание']  ? `<div class="so-detail-item" style="grid-column:span 2"><div class="so-label">📝 Заметка</div><div class="so-value">${esc(dir['Описание'])}</div></div>` : ''}
    ${dir['Фидбек']    ? `<div class="so-detail-item" style="grid-column:span 2"><div class="so-label">💬 Фидбек</div><div class="so-value">${esc(dir['Фидбек'])}</div></div>` : ''}
  `;

  // Actions
  const p = getUserPerms();
  const cleanPh = (dir['Телефон'] || '').replace(/[^\d+]/g, '');
  document.getElementById('so-actions').innerHTML = `
    <button onclick="window.closeSlideOver();window.openSubproject('${escA(dir['Название']||'')}')" style="width:100%;padding:14px;font-size:15px;font-weight:700;background:linear-gradient(135deg,var(--accent),var(--blue));color:#fff;border:none;border-radius:var(--radius);cursor:pointer;margin-bottom:12px">📂 Перейти на страницу клиента</button>
    ${cleanPh ? `<button onclick="window.open('tel:${cleanPh}')">📞 Позвонить</button>` : ''}
    ${cleanPh ? `<button onclick="window.open('https://t.me/${cleanPh.replace('+','')}','_blank')">💬 Telegram</button>` : ''}
    <button onclick="window.logTouch('${id}')">📞 Записать касание</button>
    <button onclick="window.scheduleFollowUp('${id}')">📅 Напоминание</button>
    <button onclick="window.addDealFeedback('${id}')">💬 Фидбек</button>
    <button onclick="window.addDealNote('${id}')">📝 Заметка</button>
    ${p.canWrite   ? `<button onclick="window.closeSlideOver();window.openClientCard('${escA(id)}')">✏️ Редактировать</button>` : ''}
    ${!dir['Оплачено'] && p.canWrite ? `<button onclick="window.markPaid('${id}')">💰 Оплата</button>` : ''}
    ${stage !== 'lost' && stage !== 'done' ? `<button onclick="window.rejectDeal('${id}')" style="background:rgba(255,75,75,.15);color:var(--red)">❌ Отказ</button>` : ''}
    ${p.canDelete  ? `<button onclick="window.confirmDelete('direction','${escA(id)}','${escA(dir['Название']||'')}')" style="background:rgba(231,76,60,.15);color:var(--red)">🗑 Удалить</button>` : ''}
    <button id="so-ai-summary-btn"  onclick="window.aiSummary('${id}')"  style="background:rgba(0,212,170,.08);border-color:var(--accent);color:var(--accent)">🤖 AI Итог</button>
    <button id="so-ai-nextstep-btn" onclick="window.aiNextStep('${id}')" style="background:rgba(77,171,247,.08);border-color:var(--blue);color:var(--blue)">💡 AI Следующий шаг</button>
  `;

  // Tasks checklist
  const tasks = (DATA.tasks || []).filter(t =>
    t['Направление'] === dir['Название'] || t['Направление'] === dir['name']
  );
  document.getElementById('so-tasks').innerHTML = tasks.length
    ? tasks.map(t => {
        const done = t['Статус'] === 'Готово';
        return `<li class="${done ? 'done' : ''}"><span class="check" onclick="window.toggleTaskDone('${t['ID'] || t.id}')">${done ? '✓' : ''}</span>${esc(t['Описание'] || t['Название'] || '?')}</li>`;
      }).join('')
    : '<li style="color:var(--text3)">Нет задач</li>';

  // Next stage button
  const nextBtn = document.getElementById('so-next-btn');
  if (nextBtn) {
    if (stageIdx < STAGES.length - 1 && stage !== 'done') {
      nextBtn.style.display = 'block';
      nextBtn.textContent = '➡️ Перевести: ' + STAGES[stageIdx + 1].name;
    } else {
      nextBtn.style.display = 'none';
    }
  }

  // РКТ Мед CRM section
  const rktCrmEl = document.getElementById('so-rkt-crm');
  if (rktCrmEl) {
    if ((dir['Проект'] || '') === 'РКТ') {
      rktCrmEl.innerHTML = window.buildRktCrmHtml ? window.buildRktCrmHtml(id, dir) : '';
    } else {
      rktCrmEl.innerHTML = '';
    }
  }

  // Touch timeline
  const touchLogEl = document.getElementById('so-touch-log');
  if (touchLogEl) {
    let tlog = [];
    try { tlog = JSON.parse(dir['История касаний'] || '[]'); } catch (e) {}
    if (Array.isArray(tlog) && tlog.length > 0) {
      const typeIcon = { call: '📞', msg: '💬', email: '📧' };
      touchLogEl.innerHTML = `<div class="so-section"><h4>📞 История касаний (${tlog.length})</h4><div style="display:flex;flex-direction:column;gap:5px">${
        tlog.slice().reverse().map(entry => {
          const icon = typeIcon[entry.type] || '📞';
          return `<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--bg3);border-radius:8px;font-size:12px">
            <span>${icon}</span>
            <div style="flex:1;font-weight:600">Касание #${entry.n}${entry.note ? ' — ' + esc(entry.note) : ''}</div>
            <div style="color:var(--text3);white-space:nowrap">${formatDateRu(entry.date)}</div>
          </div>`;
        }).join('')
      }</div></div>`;
    } else {
      touchLogEl.innerHTML = '';
    }
  }

  document.getElementById('slideoverOverlay').classList.add('open');
  document.getElementById('slideoverPanel').classList.add('open');
}

export function closeSlideOver() {
  document.getElementById('slideoverOverlay').classList.remove('open');
  document.getElementById('slideoverPanel').classList.remove('open');
  currentDealId = null;
}

// ── Stage management ──────────────────────────────────────────

export const STAGE_TO_STEPS = {
  'prospect':    { complete: [],                       active: [1] },
  'contact':     { complete: [1],                      active: [2] },
  'interest':    { complete: [1,2],                    active: [3,4] },
  'proto':       { complete: [1,2,3,4],                active: [5,6] },
  'proposal':    { complete: [1,2,3,4,5,6],            active: [7] },
  'negotiation': { complete: [1,2,3,4,5,6,7],          active: [8] },
  'payment':     { complete: [1,2,3,4,5,6,7,8],        active: [9] },
  'done':        { complete: [1,2,3,4,5,6,7,8,9,10,11],active: [12] },
  'lost':        { complete: [],                        active: [] },
};

export async function setDealStage(id, newStage) {
  const DATA         = window.DATA         || {};
  const SB           = window.SB;
  const toast        = window.toast        || (() => {});
  const loadData     = window.loadData     || (async () => {});
  const renderAll    = window.renderAll    || (() => {});
  const STAGES       = getStages();

  const dir = (DATA.directions || []).find(d => (d['ID'] || d.id) === id);
  if (!dir) { toast('❌ Клиент не найден', 'error'); return; }

  const oldStage = dir['stage'] || 'prospect';
  dir['stage'] = newStage;
  try {
    const dbId = dir['ID'] || dir._dbId || dir.id;
    if (!dbId) { toast('❌ Нет ID для сохранения', 'error'); return; }
    const { error } = await SB.from('directions').update({ stage: newStage }).eq('id', dbId);
    if (error) throw error;
    toast('✅ → ' + (STAGES.find(s => s.id === newStage)?.name || newStage));
    await syncTasksForStage(dir, newStage);
    await loadData();
    renderAll();
    if (currentDealId === id) openSlideOver(id);
  } catch (err) {
    dir['stage'] = oldStage;
    toast('❌ Ошибка: ' + err.message, 'error');
  }
}

export function setDealStageConfirm(id, newStage, stageName) {
  const DATA   = window.DATA || {};
  const STAGES = getStages();
  const dir    = (DATA.directions || []).find(d => (d['ID'] || d.id) === id);
  if (!dir) return;
  const oldName = STAGES.find(s => s.id === (dir['stage'] || 'prospect'))?.name || dir['stage'];
  if (!confirm(`Переместить «${dir['Название'] || id}»\n${oldName} → ${stageName}?`)) return;
  setDealStage(id, newStage);
}

export async function advanceDealStage() {
  if (!currentDealId) return;
  const DATA   = window.DATA || {};
  const STAGES = getStages();
  const dir    = (DATA.directions || []).find(d => (d['ID'] || d.id) === currentDealId);
  if (!dir) return;
  const cur = dir['stage'] || 'prospect';
  const idx = STAGES.findIndex(s => s.id === cur);
  if (idx < STAGES.length - 1) {
    const nextStage = STAGES[idx + 1];
    if (!confirm(`Переместить «${dir['Название'] || currentDealId}» → «${nextStage.name}»?`)) return;
    await setDealStage(currentDealId, nextStage.id);
  }
}

export async function markPaid(id) {
  const DATA  = window.DATA  || {};
  const SB    = window.SB;
  const toast = window.toast || (() => {});

  const dir = (DATA.directions || []).find(d => (d['ID'] || d.id) === id);
  if (!dir) return;
  dir['Оплачено'] = true;
  try {
    const dbId = dir['ID'] || dir._dbId || dir.id;
    await SB.from('directions').update({ paid: true }).eq('id', dbId);
    toast('💰 Оплата отмечена!');
    if (currentDealId === id) openSlideOver(id);
    window.renderKanban?.();
  } catch (err) { toast('❌ ' + err.message, 'error'); }
}

// ── syncTasksForStage ─────────────────────────────────────────

async function syncTasksForStage(dir, stage) {
  const DATA            = window.DATA            || {};
  const SB              = window.SB;
  const SITE_PIPELINE   = window.SITE_PIPELINE   || [];
  const getSiteStaffByRole = window.getSiteStaffByRole || (() => '');
  const genId           = window.genId           || (() => 'T' + Date.now());
  const today           = window.today           || (() => new Date().toISOString().split('T')[0]);
  const addDays         = window.addDays         || ((d, n) => { const dt = new Date(d); dt.setDate(dt.getDate() + n); return dt.toISOString().slice(0, 10); });

  const dirName = dir['Название'] || dir['name'] || '';
  if (!dirName) return;
  const mapping = STAGE_TO_STEPS[stage];
  if (!mapping) return;

  const clientTasks = (DATA.tasks || []).filter(t => (t['Направление'] || '') === dirName);

  const matchTask = (stepNum) => {
    const pipeStep = SITE_PIPELINE.find(p => p.step === stepNum);
    if (!pipeStep) return null;
    const stepName = pipeStep.name.replace(/[^\wа-яё]/gi, ' ').toLowerCase();
    const keywords = stepName.split(/\s+/).filter(w => w.length > 2);
    return clientTasks.find(t => {
      const desc = (t['Описание'] || '').toLowerCase();
      return keywords.filter(k => desc.includes(k)).length >= 2;
    });
  };

  const updates = [];

  for (const stepNum of mapping.complete) {
    const task = matchTask(stepNum);
    if (task && (task['Статус'] || '') !== 'Готово' && (task['Статус'] || '') !== '✅ Готово') {
      const taskId = task['ID'] || task.id;
      if (taskId) updates.push(SB.from('tasks').update({ status: 'Готово' }).eq('id', taskId));
    }
  }

  for (const stepNum of mapping.active) {
    const task = matchTask(stepNum);
    if (task) {
      const st = task['Статус'] || '';
      if (st !== 'Готово' && st !== '✅ Готово' && st !== 'В работе' && st !== '🔄 В работе') {
        const taskId = task['ID'] || task.id;
        if (taskId) updates.push(SB.from('tasks').update({ status: 'В работе' }).eq('id', taskId));
      }
    } else {
      const pipeStep = SITE_PIPELINE.find(p => p.step === stepNum);
      if (pipeStep) {
        const assigned = getSiteStaffByRole(pipeStep.role);
        const dl = addDays(today(), pipeStep.days || 3);
        const newTask = {
          id:          genId('T'),
          description: pipeStep.name + ': ' + dirName,
          direction:   dirName,
          project:     'Сайты',
          status:      'В работе',
          priority:    'P2',
          assignee:    assigned || '',
          deadline:    dl,
        };
        updates.push(SB.from('tasks').insert(newTask));
      }
    }
  }

  if (updates.length > 0) {
    try {
      await Promise.all(updates);
    } catch (e) {
      console.error('[RKT] syncTasksForStage error:', e);
    }
  }
}

// ── Touch log ─────────────────────────────────────────────────

export async function logTouch(id) {
  const DATA                = window.DATA                || {};
  const SB                  = window.SB;
  const toast               = window.toast               || (() => {});
  const today               = window.today               || (() => new Date().toISOString().split('T')[0]);
  const addDays             = window.addDays             || ((d, n) => { const dt = new Date(d); dt.setDate(dt.getDate() + n); return dt.toISOString().slice(0, 10); });
  const notifyTaskAssigned  = window.notifyTaskAssigned  || (() => {});
  const renderProjectView   = window.renderProjectView   || (() => {});

  const dir = (DATA.directions || []).find(d => (d['ID'] || d.id) === id);
  if (!dir) return;

  const touches  = (Number(dir['Касания'] || 0)) + 1;
  dir['Касания'] = touches;

  const intervals = [2, 3, 5, 7, 14, 21, 30, 90];
  const nextDays  = intervals[Math.min(touches - 1, intervals.length - 1)];
  const nextDate  = addDays(today(), nextDays);
  dir['Следующий контакт'] = nextDate;

  let touchLog = [];
  try { touchLog = JSON.parse(dir['История касаний'] || '[]'); } catch (e) {}
  if (!Array.isArray(touchLog)) touchLog = [];
  touchLog.push({ date: today(), n: touches, type: 'call', note: '' });
  dir['История касаний'] = JSON.stringify(touchLog);

  try {
    const dbId = dir['ID'] || dir._dbId || dir.id;
    const baseUpdate = { touches, next_contact: nextDate };
    const { error: e1 } = await SB.from('directions').update({ ...baseUpdate, touch_log: touchLog }).eq('id', dbId);
    if (e1) await SB.from('directions').update(baseUpdate).eq('id', dbId);
    toast('📞 Касание #' + touches + ' записано. Следующий звонок: ' + nextDate);
    const mgr = dir['Менеджер'];
    if (mgr) notifyTaskAssigned('📞 Перезвонить клиенту «' + dir['Название'] + '» ' + nextDate, mgr, dir['Название']);
    if (currentDealId === id) openSlideOver(id);
    renderProjectView();
  } catch (err) { toast('❌ ' + err.message, 'error'); }
}

// ── Follow-up scheduling ──────────────────────────────────────

export async function scheduleFollowUp(id) {
  const DATA              = window.DATA              || {};
  const SB                = window.SB;
  const toast             = window.toast             || (() => {});
  const today             = window.today             || (() => new Date().toISOString().split('T')[0]);
  const addDays           = window.addDays           || ((d, n) => { const dt = new Date(d); dt.setDate(dt.getDate() + n); return dt.toISOString().slice(0, 10); });
  const showCustomModal   = window.showCustomModal   || (() => {});
  const closeCustomModal  = window.closeCustomModal  || (() => {});
  const notifyTaskAssigned = window.notifyTaskAssigned || (() => {});
  const renderProjectView = window.renderProjectView || (() => {});

  const dir = (DATA.directions || []).find(d => (d['ID'] || d.id) === id);
  if (!dir) return;

  showCustomModal('📅 Напоминание', `
    <div class="form-group"><label>Когда перезвонить?</label><input type="date" id="fu-date" value="${dir['Следующий контакт'] || addDays(today(), 1)}"></div>
    <div class="form-group"><label>Заметка</label><input type="text" id="fu-note" placeholder="О чём поговорить"></div>
    <div style="display:flex;gap:8px;margin-top:8px">
      <button type="button" onclick="document.getElementById('fu-date').value='${addDays(today(),1)}'" style="flex:1;padding:8px;border-radius:6px;border:1px solid var(--border);background:var(--bg2);cursor:pointer">Завтра</button>
      <button type="button" onclick="document.getElementById('fu-date').value='${addDays(today(),3)}'" style="flex:1;padding:8px;border-radius:6px;border:1px solid var(--border);background:var(--bg2);cursor:pointer">Через 3 дня</button>
      <button type="button" onclick="document.getElementById('fu-date').value='${addDays(today(),7)}'" style="flex:1;padding:8px;border-radius:6px;border:1px solid var(--border);background:var(--bg2);cursor:pointer">Через неделю</button>
    </div>
  `, async () => {
    const dt   = document.getElementById('fu-date').value;
    const note = document.getElementById('fu-note').value.trim();
    if (!dt) { toast('❌ Укажите дату', 'error'); return; }
    dir['Следующий контакт'] = dt;
    if (note) dir['Описание'] = (dir['Описание'] || '') + '\n[' + today() + '] ' + note;
    try {
      const dbId = dir['ID'] || dir._dbId || dir.id;
      const upd  = { next_contact: dt };
      if (note) upd.description = dir['Описание'];
      await SB.from('directions').update(upd).eq('id', dbId);
      toast('📅 Напоминание: ' + dt);
      closeCustomModal();
      const mgr = dir['Менеджер'];
      if (mgr) notifyTaskAssigned('📅 Напоминание: перезвонить «' + dir['Название'] + '» ' + dt + (note ? ' — ' + note : ''), mgr, dir['Название']);
      if (currentDealId === id) openSlideOver(id);
      renderProjectView();
    } catch (err) { toast('❌ ' + err.message, 'error'); }
  });
}

// ── Feedback & notes ──────────────────────────────────────────

export async function addDealFeedback(id) {
  const DATA             = window.DATA             || {};
  const SB               = window.SB;
  const toast            = window.toast            || (() => {});
  const today            = window.today            || (() => new Date().toISOString().split('T')[0]);
  const showCustomModal  = window.showCustomModal  || (() => {});
  const closeCustomModal = window.closeCustomModal || (() => {});

  const dir = (DATA.directions || []).find(d => (d['ID'] || d.id) === id);
  if (!dir) return;

  showCustomModal('💬 Фидбек клиента', `
    <div class="form-group"><label>Реакция клиента</label><select id="fb-type">
      <option value="👍 Положительный">👍 Положительный — заинтересован</option>
      <option value="😐 Нейтральный">😐 Нейтральный — думает</option>
      <option value="👎 Отрицательный">👎 Отрицательный — не хочет</option>
      <option value="📞 Не дозвонился">📞 Не дозвонился</option>
      <option value="⏳ Перезвонить позже">⏳ Попросил перезвонить позже</option>
    </select></div>
    <div class="form-group"><label>Что сказал клиент?</label><textarea id="fb-text" rows="3" placeholder="Что клиент сказал? Какие возражения? Что понравилось?"></textarea></div>
  `, async () => {
    const fbType = document.getElementById('fb-type').value;
    const fbText = document.getElementById('fb-text').value.trim();
    const fb     = '[' + today() + '] ' + fbType + (fbText ? ' — ' + fbText : '');
    dir['Фидбек'] = (dir['Фидбек'] || '') + (dir['Фидбек'] ? '\n' : '') + fb;
    try {
      const dbId = dir['ID'] || dir._dbId || dir.id;
      await SB.from('directions').update({ feedback: dir['Фидбек'] }).eq('id', dbId);
      toast('💬 Фидбек записан');
      closeCustomModal();
      if (currentDealId === id) openSlideOver(id);
    } catch (err) { toast('❌ ' + err.message, 'error'); }
  });
}

export async function addDealNote(id) {
  const DATA             = window.DATA             || {};
  const SB               = window.SB;
  const toast            = window.toast            || (() => {});
  const today            = window.today            || (() => new Date().toISOString().split('T')[0]);
  const showCustomModal  = window.showCustomModal  || (() => {});
  const closeCustomModal = window.closeCustomModal || (() => {});

  const dir = (DATA.directions || []).find(d => (d['ID'] || d.id) === id);
  if (!dir) return;

  showCustomModal('📝 Заметка', `
    <div class="form-group"><label>Заметка по клиенту</label><textarea id="dn-text" rows="3" placeholder="Любая информация..."></textarea></div>
  `, async () => {
    const note = document.getElementById('dn-text').value.trim();
    if (!note) return;
    dir['Описание'] = (dir['Описание'] || '') + (dir['Описание'] ? '\n' : '') + '[' + today() + '] ' + note;
    try {
      const dbId = dir['ID'] || dir._dbId || dir.id;
      await SB.from('directions').update({ description: dir['Описание'] }).eq('id', dbId);
      toast('📝 Заметка сохранена');
      closeCustomModal();
      if (currentDealId === id) openSlideOver(id);
    } catch (err) { toast('❌ ' + err.message, 'error'); }
  });
}

export async function rejectDeal(id) {
  const DATA             = window.DATA             || {};
  const SB               = window.SB;
  const toast            = window.toast            || (() => {});
  const loadData         = window.loadData         || (async () => {});
  const renderAll        = window.renderAll        || (() => {});
  const showCustomModal  = window.showCustomModal  || (() => {});
  const closeCustomModal = window.closeCustomModal || (() => {});

  const dir = (DATA.directions || []).find(d => (d['ID'] || d.id) === id);
  if (!dir) return;

  showCustomModal('❌ Отказ клиента', `
    <div class="form-group"><label>Причина отказа</label><select id="rj-reason">
      <option value="Дорого">💰 Дорого</option>
      <option value="Не нужен сайт">🤷 Не нужен сайт</option>
      <option value="Выбрал конкурента">🏃 Выбрал другую студию</option>
      <option value="Сделает сам">🛠️ Сделает сам (Tilda, Wix)</option>
      <option value="Не отвечает">📵 Не отвечает на звонки</option>
      <option value="Нет бюджета">💸 Нет бюджета сейчас</option>
      <option value="Другое">📌 Другое</option>
    </select></div>
    <div class="form-group"><label>Комментарий</label><input type="text" id="rj-comment" placeholder="Подробности..."></div>
  `, async () => {
    const reason  = document.getElementById('rj-reason').value;
    const comment = document.getElementById('rj-comment').value.trim();
    dir['Причина отказа'] = reason + (comment ? ' — ' + comment : '');
    dir['stage'] = 'lost';
    try {
      const dbId = dir['ID'] || dir._dbId || dir.id;
      await SB.from('directions').update({ stage: 'lost', reject_reason: dir['Причина отказа'] }).eq('id', dbId);
      toast('❌ Клиент «' + dir['Название'] + '» → Отказ: ' + reason);
      closeCustomModal();
      closeSlideOver();
      await loadData();
      renderAll();
    } catch (err) { toast('❌ ' + err.message, 'error'); }
  });
}

export async function toggleTaskDone(taskId) {
  const DATA  = window.DATA  || {};
  const SB    = window.SB;
  const toast = window.toast || (() => {});

  const task = (DATA.tasks || []).find(t => (t['ID'] || t.id) === taskId);
  if (!task) return;
  const oldStatus = task['Статус'];
  const newStatus = oldStatus === 'Готово' ? '🔄 Выполняется' : 'Готово';
  task['Статус'] = newStatus;
  try {
    const dbId = task['ID'] || task.id;
    await SB.from('tasks').update({ status: newStatus }).eq('id', dbId);
    if (currentDealId) openSlideOver(currentDealId);
  } catch (err) {
    task['Статус'] = oldStatus;
    toast('❌ ' + err.message, 'error');
  }
}

// ── Misc helpers ──────────────────────────────────────────────

export function aiQuick(text) {
  const input = document.getElementById('ai-global-input');
  if (input) { input.value = text; window.sendGlobalAi?.(); }
}

export function togglePipeStage(hdr) {
  const body  = hdr.parentElement.querySelector('.pipe-stage-body');
  if (!body) return;
  const arrow = hdr.querySelector('.pipe-stats span:last-child');
  if (body.style.display === 'none') {
    body.style.display = '';
    if (arrow) arrow.textContent = '▾';
  } else {
    body.style.display = 'none';
    if (arrow) arrow.textContent = '▸';
  }
}

export async function deleteClient(id, name) {
  const p     = window.getUserPerms?.() || {};
  const SB    = window.SB;
  const toast = window.toast || (() => {});
  const loadData = window.loadData || (async () => {});
  const syncSubprojectsFromDb = window.syncSubprojectsFromDb || (() => {});
  const renderProjectView     = window.renderProjectView     || (() => {});
  const currentProject        = window.currentProject;

  if ((p.level || 0) < 3) { toast('⛔ Только CEO и Зам могут удалять клиентов', 'error'); return; }

  document.getElementById('confirmTitle').textContent = '🗑 Удалить клиента?';
  document.getElementById('confirmText').textContent  = '«' + name + '» и все связанные задачи будут удалены.';
  document.getElementById('confirmOverlay').classList.add('show');
  window.confirmCallback = async function (ok) {
    if (!ok) return;
    try {
      const { error: e1 } = await SB.from('directions').delete().eq('id', id);
      if (e1) throw e1;
      const { error: e2 } = await SB.from('tasks').delete().eq('direction', name);
      if (e2) console.warn('Task delete warn:', e2);
      toast('✅ Клиент «' + name + '» удалён', 'success');
      await loadData();
      syncSubprojectsFromDb(currentProject);
      renderProjectView();
    } catch (e) {
      toast('❌ Ошибка: ' + e.message, 'error');
    }
  };
}

export function attachFileToAI() {
  const inp  = document.createElement('input');
  inp.type   = 'file';
  inp.accept = '.pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.csv,.xlsx';
  inp.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    window._aiAttachedFile = file;
    const badge = document.getElementById('ai-file-badge');
    if (badge) { badge.textContent = '📎 ' + file.name; badge.style.display = 'inline-block'; }
    window.toast?.('📎 Файл прикреплён: ' + file.name, 'info');
  };
  inp.click();
}

// ── Expose to window ──────────────────────────────────────────
window.openSlideOver       = openSlideOver;
window.closeSlideOver      = closeSlideOver;
window.setDealStage        = setDealStage;
window.setDealStageConfirm = setDealStageConfirm;
window.advanceDealStage    = advanceDealStage;
window.markPaid            = markPaid;
window.logTouch            = logTouch;
window.scheduleFollowUp    = scheduleFollowUp;
window.addDealFeedback     = addDealFeedback;
window.addDealNote         = addDealNote;
window.rejectDeal          = rejectDeal;
window.toggleTaskDone      = toggleTaskDone;
window.aiQuick             = aiQuick;
window.togglePipeStage     = togglePipeStage;
window.deleteClient        = deleteClient;
window.attachFileToAI      = attachFileToAI;
window.STAGE_TO_STEPS      = STAGE_TO_STEPS;