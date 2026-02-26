// ============================================================
// hub/js/kanban.js — Kanban pipeline: STAGES, render, drag/drop
// ES Module: export all public symbols
//
// Bridge: DATA, PROJECTS, currentProject, today, esc, escA,
//         getUserPerms, confirmDelete, toast, SB, openSlideOver,
//         aiSummary, aiNextStep — referenced via window.xxx
// ============================================================

export const STAGES = [
  {id:'prospect',    name:'🔍 Поиск',           color:'var(--text2)', tip:'Найден на картах, контакт не установлен', pct:5},
  {id:'contact',     name:'📞 Первый контакт',   color:'var(--blue)',  tip:'Позвонили/написали, ждём ответ',         pct:10},
  {id:'interest',    name:'✅ Интерес',           color:'var(--purple)',tip:'Клиент ответил, готов смотреть',          pct:20},
  {id:'proto',       name:'🎨 Прототип',          color:'#9b59b6',     tip:'Демо-сайт создан и показан',             pct:40},
  {id:'proposal',    name:'📋 КП отправлено',     color:'var(--orange)',tip:'Цена и условия отправлены',              pct:60},
  {id:'negotiation', name:'🤝 Переговоры',        color:'#e67e22',     tip:'Обсуждаем, торгуемся',                   pct:75},
  {id:'payment',     name:'💰 Оплата',            color:'var(--pink)', tip:'Клиент оплатил',                         pct:90},
  {id:'done',        name:'✅ Сдан',              color:'var(--green)',tip:'Сайт готов и передан',                   pct:100},
  {id:'lost',        name:'❌ Отказ',             color:'var(--red)',  tip:'Клиент отказался',                       pct:0},
];

let draggedCard = null;

export function renderKanban() {
  const DATA           = window.DATA           || {};
  const PROJECTS       = window.PROJECTS       || {};
  const currentProject = window.currentProject || null;
  const today          = window.today          || (() => new Date().toISOString().split('T')[0]);
  const esc            = window.esc            || (s => String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
  const escA           = window.escA           || esc;
  const getUserPerms   = window.getUserPerms   || (() => ({}));

  const container = document.getElementById('kanban-container');
  if (!container) return;

  const projName = PROJECTS[currentProject] ? PROJECTS[currentProject].name : 'Сайты';
  const dirs = (DATA.directions||[]).filter(d => d['Проект'] === projName);
  const filterMgr = document.getElementById('kanban-filter-manager')?.value || '';
  const filtered = filterMgr ? dirs.filter(d => d['Менеджер'] === filterMgr) : dirs;
  const td = today();

  // Update manager filter dropdown
  const mgrSelect = document.getElementById('kanban-filter-manager');
  if (mgrSelect) {
    const mgrs = [...new Set(dirs.map(d => d['Менеджер']).filter(Boolean))];
    const curVal = mgrSelect.value;
    mgrSelect.innerHTML = '<option value="">Все менеджеры</option>' +
      mgrs.map(m => `<option value="${esc(m)}"${m === curVal ? ' selected' : ''}>${esc(m)}</option>`).join('');
  }

  let html = '';
  STAGES.forEach((stage, stageIdx) => {
    const deals = filtered.filter(d => (d['stage'] || 'prospect') === stage.id);
    const sum   = deals.reduce((s, d) => s + (Number(d['Цена']) || 0), 0);
    const stageNum = stageIdx + 1;

    html += `<div class="kanban-col" data-stage="${stage.id}"
      ondragover="window.kanbanDragOver(event)"
      ondrop="window.kanbanDrop(event,this)"
      ondragleave="this.classList.remove('drag-over')"
      style="border-top:3px solid ${stage.color}">
      <div class="kanban-col-header" title="${esc(stage.tip||'')}">
        <div><span style="color:${stage.color};font-weight:800;margin-right:4px">${stageNum}.</span>${stage.name} <span class="k-count">${deals.length}</span></div>
        <div class="k-sum">${sum ? sum.toLocaleString('ru') + '₽' : ''}</div>
      </div>
      <div class="kanban-col-body">`;

    deals.forEach(d => {
      const id = d['ID'] || d.id || '';
      const overdue = d['Дедлайн'] && d['Дедлайн'] < td && stage.id !== 'done';
      const cardBorderColor = overdue ? 'var(--red)' : stage.color;
      html += `<div class="kanban-card${overdue ? ' overdue' : ''}"
        draggable="true" data-id="${id}"
        onclick="window.openSlideOver('${escA(id)}')"
        ondragstart="window.kanbanDragStart(event,this)"
        ondragend="window.kanbanDragEnd(this)"
        style="border-left:4px solid ${cardBorderColor}">
        <div class="k-name">${esc(d['Название'] || d['name'] || '?')}</div>
        <div class="k-meta">
          ${d['Цена']     ? '<span class="k-price">'   + Number(d['Цена']).toLocaleString('ru') + '₽</span>' : ''}
          ${d['Тип сайта']? '<span class="k-type">'    + esc(d['Тип сайта'])    + '</span>' : ''}
          ${d['Город']    ? '<span class="k-city">📍'  + esc(d['Город'])        + '</span>' : ''}
          ${d['Оплачено'] ? '<span class="k-paid">💰</span>' : '<span class="k-unpaid">⏳</span>'}
          ${d['Менеджер'] ? '<span class="k-manager">👤' + esc(d['Менеджер']) + '</span>' : ''}
        </div>
        <div class="k-ai-btns">
          <button onclick="event.stopPropagation();window.aiSummary('${escA(id)}')" title="AI-сводка по клиенту">🤖 Итог</button>
          <button onclick="event.stopPropagation();window.aiNextStep('${escA(id)}')" title="AI рекомендует следующий шаг">💡 Шаг</button>
        </div>
        ${getUserPerms().canDelete
          ? `<button class="k-delete-btn" onclick="event.stopPropagation();window.confirmDelete('direction','${escA(id)}','${escA(d['Название'] || '')}')" title="Удалить клиента">🗑</button>`
          : ''}
        <div class="k-mobile-move" style="display:none">
          <button onclick="event.stopPropagation();window.moveKanbanCard('${escA(id)}','left')" title="← Предыдущий этап">◀</button>
          <button onclick="event.stopPropagation();window.moveKanbanCard('${escA(id)}','right')" title="Следующий этап →">▶</button>
        </div>
      </div>`;
    });

    html += '</div></div>';
  });

  container.innerHTML = html;

  // First-entry hint
  if (!localStorage.getItem('rkt_kanban_hint')) {
    const hint = document.createElement('div');
    hint.id = 'kanban-hint';
    hint.style.cssText = 'position:sticky;bottom:12px;left:0;right:0;margin:8px 0 0;background:rgba(0,212,170,.12);border:1px solid var(--accent);border-radius:8px;padding:10px 14px;display:flex;align-items:center;gap:10px;font-size:12px;color:var(--text2);cursor:pointer;z-index:10';
    hint.innerHTML = '<span style="font-size:18px">👆</span><span>Перетащите карточку вправо для перехода к следующему этапу. На мобильном — листайте горизонтально.</span>' +
      '<button onclick="event.stopPropagation();window.dismissKanbanHint()" style="margin-left:auto;background:none;border:none;color:var(--accent);cursor:pointer;font-size:18px;line-height:1" title="Закрыть">✕</button>';
    hint.onclick = () => window.dismissKanbanHint();
    container.appendChild(hint);
  }
}

export function dismissKanbanHint() {
  localStorage.setItem('rkt_kanban_hint', '1');
  const h = document.getElementById('kanban-hint');
  if (h) h.remove();
}

// ── Drag & Drop ──────────────────────────────────────────────

export function kanbanDragStart(e, el) {
  draggedCard = el;
  el.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', el.dataset.id);
}

export function kanbanDragEnd(el) {
  el.classList.remove('dragging');
  draggedCard = null;
}

export function kanbanDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

export async function kanbanDrop(e, col) {
  const DATA  = window.DATA  || {};
  const SB    = window.SB;
  const toast = window.toast || (() => {});

  e.preventDefault();
  col.classList.remove('drag-over');
  const id       = e.dataTransfer.getData('text/plain');
  const newStage = col.dataset.stage;
  if (!id || !newStage) return;

  const dir = (DATA.directions || []).find(d => (d['ID'] || d.id) === id);
  if (!dir) return;
  const oldStage = dir['stage'] || 'prospect';
  if (oldStage === newStage) return;

  dir['stage'] = newStage;
  try {
    const dbId = dir['ID'] || dir._dbId || dir.id;
    await SB.from('directions').update({ stage: newStage }).eq('id', dbId);
    toast('✅ ' + (dir['Название'] || 'Сделка') + ' → ' + (STAGES.find(s => s.id === newStage)?.name || newStage));
    renderKanban();
  } catch (err) {
    dir['stage'] = oldStage;
    toast('❌ Ошибка: ' + err.message, 'error');
  }
}

// Mobile touch alternative
export async function moveKanbanCard(id, direction) {
  const DATA  = window.DATA  || {};
  const SB    = window.SB;
  const toast = window.toast || (() => {});

  const dir = (DATA.directions || []).find(d => (d['ID'] || d.id) === id);
  if (!dir) return;
  const currentStage = dir['stage'] || 'prospect';
  const stageIds     = STAGES.map(s => s.id);
  const idx          = stageIds.indexOf(currentStage);
  if (idx < 0) return;

  const newIdx = direction === 'right' ? idx + 1 : idx - 1;
  if (newIdx < 0 || newIdx >= stageIds.length) { toast('Нельзя переместить дальше', 'error'); return; }

  const newStage = stageIds[newIdx];
  dir['stage'] = newStage;
  try {
    const dbId = dir['ID'] || dir._dbId || dir.id;
    await SB.from('directions').update({ stage: newStage }).eq('id', dbId);
    toast('✅ ' + (dir['Название'] || 'Сделка') + ' → ' + (STAGES[newIdx]?.name || newStage));
    renderKanban();
  } catch (err) {
    dir['stage'] = currentStage;
    toast('❌ Ошибка: ' + err.message, 'error');
  }
}

// ── Expose to window for inline HTML handlers ─────────────────
window.renderKanban     = renderKanban;
window.dismissKanbanHint = dismissKanbanHint;
window.kanbanDragStart  = kanbanDragStart;
window.kanbanDragEnd    = kanbanDragEnd;
window.kanbanDragOver   = kanbanDragOver;
window.kanbanDrop       = kanbanDrop;
window.moveKanbanCard   = moveKanbanCard;
window.STAGES           = STAGES;