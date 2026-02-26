// ============================================================
// hub/js/config.js — Configuration, Supabase client, column mapping
// ES Module: export all public symbols
// ============================================================

// ---- App Config ----
export const CONFIG = {
  SUPABASE_URL: 'https://prparzgqevfelwsndmkc.supabase.co',
  SUPABASE_KEY: 'sb_publishable_gFeXATQGYxKx08BpeOedZg_7buTwVJq',
  AI_URL: 'https://daniyal2212.app.n8n.cloud/webhook/rkt-ai',
  TG_BOT: 'AIhroject_bot',    // @username бота без @
  TG_BOT_TOKEN: '',           // Токен бота для отправки сообщений
  GROQ_KEY: '',               // Groq API Key (бесплатно, console.groq.com)
  GEMINI_KEY: '',             // Gemini API Key (бесплатно, aistudio.google.com)
  GITHUB_REPO: 'daniyal251/rkt-sites', // GitHub Pages repo for client sites
  REFRESH: 120000,
  VERSION: '15.1.0'
};

// ---- Debounce utility ----
export function debounce(fn, delay) {
  let timer = null;
  let running = false;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      if (running) return;
      running = true;
      try { await fn.apply(this, args); } finally { running = false; }
    }, delay);
  };
}

// ---- Supabase client ----
export let SB = null;
try {
  if (window.supabase) {
    SB = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
  } else {
    console.error('Supabase library not loaded! Check CDN or internet connection.');
    document.title = 'RKT HUB — Ошибка подключения';
  }
} catch(e) {
  console.error('Supabase init error:', e);
  document.title = 'RKT HUB — Ошибка подключения';
}

// ============================================================
// COLUMN MAPPING: Supabase (English) ↔ Frontend (Russian)
// ============================================================
export const COL_MAP = {
  staff: {
    id:'ID', name:'Имя', role:'Роль', project:'Проект', direction:'Направление',
    telegram_id:'Telegram_ID', username:'Username', phone:'Телефон', email:'Email', hire_date:'Дата_найма',
    status:'Статус', created_at:'Дата_добавления', updated_at:'Обновлено', pin_hash:'pin_hash',
    salary_pct:'Процент_ЗП', extra_projects:'Доп_проекты', permissions:'Права'
  },
  partners: {
    id:'ID', name:'Название', country:'Страна', direction:'Направление', product:'Продукт',
    status:'Статус', contact:'Контакт', website:'Сайт', notes:'Примечания',
    created_at:'Дата_добавления'
  },
  directions: {
    id:'ID', name:'Название', project:'Проект', status:'Статус', stage:'stage',
    manager:'Менеджер', description:'Описание', link:'Ссылка', phone:'Телефон', city:'Город',
    site_type:'Тип сайта', price:'Цена', paid:'Оплачено', business_type:'Тип бизнеса',
    style:'Стиль', questionnaire:'Анкета', client_name:'Клиент', created_at:'Дата добавления',
    services:'Услуги', comment:'Комментарий', address:'Адрес', social:'Соцсети',
    work_hours:'Режим работы', prices:'Цены',
    source:'Источник', next_contact:'Следующий контакт', touches:'Касания',
    reject_reason:'Причина отказа', feedback:'Фидбек', created:'Создан',
    site_html:'site_html', site_url:'site_url',
    logo_url:'logo_url', photos:'photos',
    telegram_tag:'Telegram',
    equipment_type:'Тип оборудования',
    oem_partner:'OEM-партнёр',
    rzn_status:'Статус РЗН',
    rzn_checklist:'Чеклист РЗН',
    logistics_status:'Статус логистики',
    contract_amount:'Сумма контракта',
    procurement_type:'Тип закупки',
    procurement_deadline:'Дедлайн закупки',
    procurement_number:'Номер закупки',
    touch_log:'История касаний'
  },
  tasks: {
    id:'ID', description:'Описание', direction:'Направление', project:'Проект',
    priority:'Приоритет', status:'Статус', deadline:'Дедлайн', assignee:'Ответственный',
    notes:'Примечания', link:'Ссылка', comment:'Комментарий', created_at:'Дата_добавления'
  },
  projects: {
    id:'ID', name:'Название', direction:'Направление', status:'Статус', priority:'Приоритет',
    progress:'Прогресс', partner:'Партнёр', budget:'Бюджет', deadline:'Дедлайн',
    description:'Описание', created_at:'Создано', updated_at:'Обновлено'
  },
  approvals: {
    id:'ID', type:'Тип', description:'Описание', from_name:'От_кого', from_role:'Роль',
    telegram_id:'Telegram_ID', direction:'Направление', project:'Проект', sheet:'Лист',
    status:'Статус', request_date:'Дата_запроса', decision_date:'Дата_решения',
    ceo_decision:'Решение_CEO', data:'Данные', created_at:'Дата_добавления'
  },
  communications: {
    id:'ID', partner:'Партнёр', type:'Тип', subject:'Тема', comm_date:'Дата',
    author:'Автор', result:'Результат', created_at:'Дата_добавления'
  },
  documents: {
    id:'ID', filename:'Название файла', folder:'Папка', uploaded_by:'Загрузил',
    upload_date:'Дата', link:'Ссылка', drive_id:'Drive_ID', size:'Размер',
    created_at:'Дата_добавления', project:'Проект', file_type:'Тип'
  },
  client_requests: {
    id:'ID', name:'Имя', phone:'Телефон', company:'Компания', city:'Город',
    direction:'Направление', details:'Детали', message:'Сообщение',
    status:'Статус', source:'Источник', created_at:'Дата'
  },
  settings: {
    key:'Ключ', value:'Значение', updated_at:'Обновлено'
  }
};

// Reverse maps (Russian → English) for writing
export const COL_MAP_REV = {};
for (const [table, map] of Object.entries(COL_MAP)) {
  COL_MAP_REV[table] = {};
  for (const [en, ru] of Object.entries(map)) { COL_MAP_REV[table][ru] = en; }
}

export function mapFromDb(table, rows) {
  const map = COL_MAP[table];
  if (!map) return rows;
  return rows.map(row => {
    const out = {};
    for (const [key, val] of Object.entries(row)) {
      out[map[key] || key] = val;
    }
    return out;
  });
}

export function mapToDb(table, row) {
  const map = COL_MAP_REV[table];
  if (!map) return row;
  const out = {};
  for (const [key, val] of Object.entries(row)) {
    const dbKey = map[key] || key.toLowerCase();
    if (dbKey !== 'дата_добавления' && dbKey !== 'обновлено') { // auto-managed
      out[dbKey] = val;
    }
  }
  return out;
}

export function tableForSheet(sheet) {
  const m = {'Партнёры':'partners','Задачи':'tasks','Направления':'directions',
    'Сотрудники':'staff','Проекты':'projects','Согласования':'approvals',
    'Коммуникации':'communications','Документы':'documents'};
  return m[sheet] || sheet;
}
