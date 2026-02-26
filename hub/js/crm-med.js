// ============================================================
// hub/js/crm-med.js — CRM РКТ Медоборудование:
//   OEM spec, RZN checklist, logistics tracker, procurement
// ES Module: export all public symbols
//
// Bridge: DATA, SB, mapToDb, toast, esc, escA,
//         currentDealId (window), openSlideOver (window)
// ============================================================

const EQ_OPTIONS   = ['КТ 16 срезов', 'КТ 32 среза', 'КТ 64 среза', 'КТ 128 срезов', 'Рентген', 'С-дуга'];
const OEM_OPTIONS  = ['Syno-Tech', 'Powersite', 'Varex', 'Canon'];
const PROC_OPTIONS = ['ФЗ-44', 'ФЗ-223', 'Прямой'];

export const LOG_STEPS = [
  { val: 'factory',       label: 'На заводе' },
  { val: 'customs',       label: 'Таможня' },
  { val: 'delivery',      label: 'Доставка' },
  { val: 'installation',  label: 'Монтаж' },
  { val: 'commissioning', label: 'Ввод в экспл.' },
];

export const RZN_ITEMS = [
  { key: 'tech_file',   label: 'Тех.файл CN→RU' },
  { key: 'toxicology',  label: 'Токсикология' },
  { key: 'dossier',     label: 'Досье в РЗН' },
  { key: 'ru_received', label: 'РУ получено' },
];

export function buildRktCrmHtml(id, dir) {
  const esc  = window.esc  || (s => String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
  const escA = window.escA || esc;

  const eqType    = dir['Тип оборудования']  || '';
  const oemPart   = dir['OEM-партнёр']       || '';
  const logStatus = dir['Статус логистики']  || '';
  const procType  = dir['Тип закупки']       || '';
  const procDl    = dir['Дедлайн закупки']   || '';
  const procNum   = dir['Номер закупки']     || '';

  // Parse rzn_checklist — may arrive as object or JSON string from Supabase
  let rznObj = {};
  const rznRaw = dir['Чеклист РЗН'];
  if (rznRaw && typeof rznRaw === 'object') {
    rznObj = rznRaw;
  } else if (rznRaw) {
    try { rznObj = JSON.parse(rznRaw); } catch (e) { rznObj = {}; }
  }

  const logIdx = LOG_STEPS.findIndex(s => s.val === logStatus);

  const makeSelect = (fid, opts, cur, lbl) =>
    `<div style="display:flex;flex-direction:column;gap:4px">
      <label style="font-size:11px;color:var(--text3)">${lbl}</label>
      <select id="${fid}" style="padding:6px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px">
        <option value="">— выбрать —</option>
        ${opts.map(o => `<option value="${esc(o)}"${cur === o ? ' selected' : ''}>${esc(o)}</option>`).join('')}
      </select>
    </div>`;

  const logStepsHtml = LOG_STEPS.map((s, i) => {
    const done   = logIdx >= 0 && i < logIdx;
    const active = i === logIdx;
    const bg      = (done || active) ? 'var(--accent)' : 'var(--bg2)';
    const txt     = (done || active) ? '#000'           : 'var(--text3)';
    const fw      = active            ? '700'            : '400';
    const opacity = done              ? '0.55'           : '1';
    return `<div onclick="window.setRktLogistics('${escA(id)}','${s.val}')"
      style="flex:1;text-align:center;padding:6px 3px;border-radius:6px;background:${bg};color:${txt};font-size:10px;font-weight:${fw};cursor:pointer;border:1px solid var(--border);transition:all .2s;opacity:${opacity}">${s.label}</div>`;
  }).join('<div style="width:3px"></div>');

  const rznHtml = RZN_ITEMS.map(item =>
    `<label style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);cursor:pointer;font-size:13px;color:var(--text)">
      <input type="checkbox" id="rzn-${item.key}" ${rznObj[item.key] ? 'checked' : ''} style="width:15px;height:15px;accent-color:var(--accent);cursor:pointer">
      ${esc(item.label)}
    </label>`
  ).join('');

  const blockStyle = 'background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:10px';
  const titleStyle = 'font-size:12px;font-weight:600;color:var(--text2);margin-bottom:8px';

  return `<div class="so-section" style="border-top:2px solid var(--accent);padding-top:12px;margin-top:4px">
  <h4 style="color:var(--accent);margin-bottom:10px">🏥 Медоборудование CRM</h4>

  <!-- Блок 1: Спецификация OEM -->
  <div style="${blockStyle}">
    <div style="${titleStyle}">🔧 Спецификация OEM</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      ${makeSelect('rkt-eq-type',     EQ_OPTIONS,   eqType,   'Тип оборудования')}
      ${makeSelect('rkt-oem-partner', OEM_OPTIONS,  oemPart,  'OEM-партнёр')}
    </div>
  </div>

  <!-- Блок 2: Чеклист РЗН -->
  <div style="${blockStyle}">
    <div style="${titleStyle}">📋 Чеклист РЗН</div>
    ${rznHtml}
  </div>

  <!-- Блок 3: Трекер логистики -->
  <div style="${blockStyle}">
    <div style="${titleStyle}">🚚 Трекер логистики</div>
    <div style="display:flex;gap:3px">${logStepsHtml}</div>
    ${logStatus
      ? `<div style="font-size:11px;color:var(--text3);margin-top:6px;text-align:center">Текущий статус: <strong style="color:var(--accent)">${esc(LOG_STEPS.find(s => s.val === logStatus)?.label || logStatus)}</strong></div>`
      : '<div style="font-size:11px;color:var(--text3);margin-top:6px;text-align:center">Нажмите на шаг для выбора</div>'}
  </div>

  <!-- Блок 4: Госзакупки -->
  <div style="${blockStyle}">
    <div style="${titleStyle}">🏛 Госзакупки</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
      ${makeSelect('rkt-proc-type', PROC_OPTIONS, procType, 'Тип закупки')}
      <div style="display:flex;flex-direction:column;gap:4px">
        <label style="font-size:11px;color:var(--text3)">Дедлайн</label>
        <input type="date" id="rkt-proc-deadline" value="${esc(procDl)}"
          style="padding:6px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px">
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:4px">
      <label style="font-size:11px;color:var(--text3)">Номер закупки</label>
      <input type="text" id="rkt-proc-number" value="${esc(procNum)}" placeholder="напр. 0373100012625000001"
        style="padding:6px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;width:100%;box-sizing:border-box">
    </div>
  </div>

  <button onclick="window.saveRktCrm('${escA(id)}')"
    style="width:100%;padding:10px;background:var(--accent);color:#000;border:none;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer">💾 Сохранить данные РКТ</button>
</div>`;
}

export async function saveRktCrm(id) {
  const DATA   = window.DATA   || {};
  const SB     = window.SB;
  const toast  = window.toast  || (() => {});
  const mapToDb = window.mapToDb || ((sheet, obj) => obj);

  const dir = (DATA.directions || []).find(d => (d['ID'] || d.id) === id);
  if (!dir) return;
  const dbId = dir['ID'] || dir._dbId || dir.id;

  const rznObj = {};
  ['tech_file', 'toxicology', 'dossier', 'ru_received'].forEach(k => {
    rznObj[k] = !!(document.getElementById('rzn-' + k)?.checked);
  });

  const updates = {
    'Тип оборудования': document.getElementById('rkt-eq-type')?.value     || '',
    'OEM-партнёр':      document.getElementById('rkt-oem-partner')?.value  || '',
    'Чеклист РЗН':      rznObj,
    'Тип закупки':      document.getElementById('rkt-proc-type')?.value    || '',
    'Дедлайн закупки':  document.getElementById('rkt-proc-deadline')?.value || null,
    'Номер закупки':    document.getElementById('rkt-proc-number')?.value   || '',
  };

  Object.assign(dir, updates);

  try {
    const dbRow = mapToDb('directions', updates);
    const { error } = await SB.from('directions').update(dbRow).eq('id', dbId);
    if (error) throw error;
    toast('✅ Данные РКТ сохранены');
  } catch (err) {
    toast('❌ ' + err.message, 'error');
  }
}

export async function setRktLogistics(id, step) {
  const DATA  = window.DATA  || {};
  const SB    = window.SB;
  const toast = window.toast || (() => {});
  const STEP_NAMES = {
    factory: 'На заводе', customs: 'Таможня', delivery: 'Доставка',
    installation: 'Монтаж', commissioning: 'Ввод в эксплуатацию',
  };

  const dir = (DATA.directions || []).find(d => (d['ID'] || d.id) === id);
  if (!dir) return;
  const dbId = dir['ID'] || dir._dbId || dir.id;
  dir['Статус логистики'] = step;
  try {
    const { error } = await SB.from('directions').update({ logistics_status: step }).eq('id', dbId);
    if (error) throw error;
    toast('🚚 ' + (STEP_NAMES[step] || step));
    if (window.currentDealId === id) window.openSlideOver?.(id);
  } catch (err) {
    toast('❌ ' + err.message, 'error');
  }
}

// ── Expose to window ──────────────────────────────────────────
window.buildRktCrmHtml  = buildRktCrmHtml;
window.saveRktCrm       = saveRktCrm;
window.setRktLogistics  = setRktLogistics;