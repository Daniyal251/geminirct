# RKT HUB — ПОЛНАЯ БАЗА ЗНАНИЙ
## Версия: v15.1 + Master Plan v2 | Февраль 2026
## Для использования в Qwen как системный контекст

---

# ЧАСТЬ 1. СИСТЕМА И СТЕК

## 1.1 Стек технологий

| Компонент | Технология |
|---|---|
| Фронтенд | Мультистраничный сайт — чистый HTML+CSS+JS, БЕЗ фреймворков и сборки |
| БД | Supabase (PostgreSQL + Realtime + Storage) |
| Автоматизация | n8n Cloud v7.1 (45 узлов) |
| Telegram-бот | @AIhroject_bot |
| Хостинг | REG.RU → **rct-hub.ru** |

```
Supabase URL:  https://prparzgqevfelwsndmkc.supabase.co
Supabase Key:  sb_publishable_gFeXATQGYxKx08BpeOedZg_7buTwVJq
n8n Webhook:   https://daniyal2212.app.n8n.cloud/webhook/rkt-ai
Telegram Bot:  @AIhroject_bot
```

## 1.2 Структура файлов (актуальная)

```
rct-hub.ru/
├── index.html              — Публичный лендинг (591 строк)
├── hub/
│   ├── index.html          — Админ-панель SPA МОНОЛИТ (14 708 строк) ← основной файл
│   └── migration_phase1.sql — SQL-миграция (Мед поля + RLS + индексы)
├── login/index.html        — Вход (521 строк)
├── order/index.html        — Форма заявок + AI-анкета (1 411 строк)
├── sites/index.html        — Страница услуги Сайты (615 строк)
├── med/index.html          — Медоборудование (653 строк)
├── ai/index.html           — AI-ассистент публичный (567 строк)
├── client/index.html       — Личный кабинет клиента (1 033 строк)
├── content/index.html      — AI-контент (540 строк)
└── about/index.html        — О компании (538 строк)
```

**ПРАВИЛО:** `hub/index.html` — монолит, все правки ТОЛЬКО в нём.
Публичные страницы — каждая самодостаточна, подключает Supabase SDK сама.

---

# ЧАСТЬ 2. БИЗНЕС

## 2.1 РКТ (Российские Компьютерные Технологии)
Локализация производства медицинского диагностического оборудования. ОЭЗ «Иннополис», Татарстан. Инициатор: Данияль Арсланов.

- **КТ-сканеры:** 16, 32, 64, 128 срезов. OEM с Syno-Tech (Китай). **24 среза — НЕ в линейке.**
- **Следующие направления:** Рентген, С-дуга, хирургические роботы, PACS, УЗИ
- **Партнёр по генераторам:** Powersite (Китай)
- **Финансирование:** Минпромторг субсидии до 70% НИОКР, ФРП кредиты 1–5%
- **Госзакупки:** правило «второй лишний» — при наличии российского аналога иностранное блокируется из госзакупок
- **Регистрация:** Росздравнадзор ~14 мес., ~4–7 млн руб.

## 2.2 Сайты (веб-студия)
CRM-воронка 9 этапов. Клиенты: рестораны, салоны, автосервисы.
Активные клиенты: Пышки мира, Брежнев (рестоклуб), Кератин Агрыз.

## 2.3 AI-контент и ИИ-агенты
Дополнительные направления компании.

---

# ЧАСТЬ 3. БАЗА ДАННЫХ

## 3.1 Все таблицы

### Существующие:
```
staff           — сотрудники
directions      — клиенты / сделки / направления (главная CRM-таблица)
tasks           — задачи
partners        — партнёры
projects        — проекты
approvals       — согласования
documents       — документы
communications  — коммуникации
```

### Новые (создать через migration_phase1.sql):
```
client_requests — заявки с публичного сайта
ai_logs         — логи AI-чата
settings        — конфигурация (Bot Token, API ключи)
```

## 3.2 Схемы новых таблиц

```sql
-- client_requests
CREATE TABLE IF NOT EXISTS client_requests (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       text, phone text, company text, city text,
  direction  text, details text, message text, comment text,
  status     text DEFAULT 'new',
  source     text DEFAULT 'website',
  page       text, session_id text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE client_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY cr_anon_insert ON client_requests FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY cr_auth_all    ON client_requests FOR ALL   TO authenticated USING (true);
CREATE POLICY cr_anon_read   ON client_requests FOR SELECT TO anon USING (true);

-- ai_logs
CREATE TABLE IF NOT EXISTS ai_logs (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  type          text, source text, session_id text,
  user_message  text, bot_reply text,
  model         text, provider text,
  duration_ms   int, tokens_in int, tokens_out int,
  error_code    text, error_message text, page text,
  created_at    timestamptz DEFAULT now()
);
ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_logs_anon_insert ON ai_logs FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY ai_logs_anon_read   ON ai_logs FOR SELECT TO anon USING (true);

-- settings (конфигурация, Bot Token, API ключи)
CREATE TABLE IF NOT EXISTS settings (
  key        text PRIMARY KEY,
  value      text,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY settings_anon_all ON settings FOR ALL TO anon USING (true) WITH CHECK (true);

-- ОБЯЗАТЕЛЬНО вставить после создания:
INSERT INTO settings (key, value) VALUES ('tg_bot_token', '<РЕАЛЬНЫЙ_ТОКЕН>')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

## 3.3 Дополнения к таблице directions

```sql
-- CRM Сайты (базовые поля):
ALTER TABLE directions ADD COLUMN IF NOT EXISTS client_name   text;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS site_type     text;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS paid          numeric DEFAULT 0;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS source        text;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS next_contact  date;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS touches       int DEFAULT 0;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS reject_reason text;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS feedback      text;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS site_url      text;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS site_html     text;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS logo_url      text;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS photos        text;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS telegram_tag  text;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS created_at    timestamptz DEFAULT now();

-- CRM Медоборудование (новые поля из Master Plan):
ALTER TABLE directions ADD COLUMN IF NOT EXISTS equipment_type       text;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS oem_partner          text;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS rzn_status           text DEFAULT 'Не начато';
ALTER TABLE directions ADD COLUMN IF NOT EXISTS rzn_checklist        jsonb DEFAULT '{}';
ALTER TABLE directions ADD COLUMN IF NOT EXISTS logistics_status     text DEFAULT 'На заводе';
ALTER TABLE directions ADD COLUMN IF NOT EXISTS contract_amount      numeric DEFAULT 0;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS procurement_type     text;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS procurement_deadline date;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS procurement_number   text;
```

## 3.4 RLS-политики для существующих таблиц

```sql
ALTER TABLE directions   ENABLE ROW LEVEL SECURITY;
CREATE POLICY dir_auth_all   ON directions FOR ALL    TO authenticated USING (true);
CREATE POLICY dir_anon_read  ON directions FOR SELECT TO anon          USING (true);

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_auth_read ON staff FOR SELECT TO authenticated USING (true);
CREATE POLICY staff_anon_read ON staff FOR SELECT TO anon          USING (true);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tasks_auth_all  ON tasks FOR ALL    TO authenticated USING (true);
CREATE POLICY tasks_anon_read ON tasks FOR SELECT TO anon          USING (true);

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY partners_auth_all  ON partners FOR ALL    TO authenticated USING (true);
CREATE POLICY partners_anon_read ON partners FOR SELECT TO anon          USING (true);

ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY approvals_auth_all ON approvals FOR ALL TO authenticated USING (true);

ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
CREATE POLICY comms_auth_all ON communications FOR ALL TO authenticated USING (true);
```

## 3.5 Индексы

```sql
CREATE INDEX IF NOT EXISTS idx_directions_project      ON directions(project);
CREATE INDEX IF NOT EXISTS idx_directions_stage        ON directions(stage);
CREATE INDEX IF NOT EXISTS idx_client_requests_status  ON client_requests(status);
CREATE INDEX IF NOT EXISTS idx_client_requests_created ON client_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created         ON ai_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_type            ON ai_logs(type);
```

---

# ЧАСТЬ 4. COL_MAP — ПОЛНЫЙ МАППИНГ

```javascript
// В hub/index.html — единственный источник истины для БД ↔ UI
const COL_MAP = {
  directions: {
    id:'ID', name:'Название', project:'Проект', status:'Статус', stage:'stage',
    manager:'Менеджер', description:'Описание', link:'Ссылка', phone:'Телефон',
    city:'Город', site_type:'Тип сайта', price:'Цена', paid:'Оплачено',
    source:'Источник', next_contact:'Следующий контакт', touches:'Касания',
    reject_reason:'Причина отказа', feedback:'Фидбек', created:'Создан',
    site_html:'site_html', site_url:'site_url', logo_url:'logo_url',
    photos:'photos', telegram_tag:'Telegram', client_name:'Имя клиента',
    created_at:'Дата_добавления',
    // CRM Медоборудование:
    equipment_type:'Тип оборудования', oem_partner:'OEM-партнёр',
    rzn_status:'Статус РЗН', rzn_checklist:'Чеклист РЗН',
    logistics_status:'Статус логистики', contract_amount:'Сумма контракта',
    procurement_type:'Тип закупки', procurement_deadline:'Дедлайн закупки',
    procurement_number:'Номер закупки'
  },
  staff: {
    id:'ID', name:'Имя', role:'Роль', project:'Проект', direction:'Направление',
    telegram_id:'Telegram_ID', username:'Username', phone:'Телефон',
    email:'Email', status:'Статус', pin_hash:'pin_hash'
  },
  tasks: {
    id:'ID', description:'Описание', direction:'Направление', project:'Проект',
    priority:'Приоритет', status:'Статус', deadline:'Дедлайн',
    assignee:'Ответственный', notes:'Примечания', link:'Ссылка',
    comment:'Комментарий', created_at:'Дата_добавления'
  },
  projects: {
    id:'ID', name:'Название', direction:'Направление', status:'Статус',
    priority:'Приоритет', progress:'Прогресс', partner:'Партнёр',
    budget:'Бюджет', deadline:'Дедлайн', description:'Описание',
    created_at:'Создано', updated_at:'Обновлено'
  },
  approvals: {
    id:'ID', type:'Тип', description:'Описание', from_name:'От_кого',
    from_role:'Роль', telegram_id:'Telegram_ID', direction:'Направление',
    project:'Проект', sheet:'Лист', status:'Статус',
    request_date:'Дата_запроса', decision_date:'Дата_решения',
    ceo_decision:'Решение_CEO', data:'Данные', created_at:'Дата_добавления'
  },
  partners: {
    id:'ID', name:'Название', country:'Страна', direction:'Направление',
    product:'Продукт', status:'Статус', contact:'Контакт'
  },
  communications: {
    id:'ID', partner:'Партнёр', type:'Тип', subject:'Тема',
    comm_date:'Дата', author:'Автор', result:'Результат',
    created_at:'Дата_добавления'
  },
  documents: {
    id:'ID', filename:'Название файла', folder:'Папка',
    uploaded_by:'Загрузил', upload_date:'Дата', link:'Ссылка',
    drive_id:'Drive_ID', size:'Размер', created_at:'Дата_добавления',
    project:'Проект', file_type:'Тип'
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
```

**Использование:**
```javascript
mapToDb('directions', { 'Название': 'ООО Ромашка', 'Статус': 'Новый' })
// → { name: 'ООО Ромашка', status: 'Новый' }

mapFromDb('directions', rows)
// → [{ 'Название': '...', 'Статус': '...', ... }]
```

---

# ЧАСТЬ 5. РОЛИ И ПРАВА

## 5.1 Иерархия ролей

```javascript
const ROLES = {
  'CEO': {
    emoji: '👑', level: 4,
    canWrite: true, canDelete: true, canApprove: true, canManageStaff: true,
    seeAll: true, canViewFinance: true, canSettings: true, canExport: true,
    writeSheets: ['Партнёры','Задачи','Направления','Сотрудники','Проекты','Согласования','Коммуникации'],
    desc: 'Полный доступ ко всей системе'
  },
  'Зам': {
    emoji: '⭐', level: 3,
    canWrite: true, canDelete: false, canManageStaff: true, canViewFinance: true,
    writeSheets: ['Партнёры','Задачи','Коммуникации','Направления'],
    needsApproval: ['Сотрудники','Проекты'],
    desc: 'Управление своим проектом: задачи, партнёры, команда'
  },
  'Руководитель': {
    emoji: '📋', level: 2,
    canWrite: true, canEditTasks: true, canAssignTasks: true,
    writeSheets: ['Задачи','Коммуникации'],
    needsApproval: ['Партнёры','Направления','Сотрудники','Проекты'],
    desc: 'Управление задачами в своём направлении'
  },
  'Менеджер': {
    emoji: '💼', level: 1,
    canWrite: true, canEditTasks: true,
    writeSheets: ['Задачи','Коммуникации'],
    needsApproval: ['Партнёры','Направления'],
    desc: 'Работа с клиентами и выполнение задач'
  },
  'Сотрудник': {
    emoji: '👤', level: 0,
    canWrite: false, canDelete: false,
    writeSheets: [],
    needsApproval: ['Задачи','Партнёры','Коммуникации'],
    desc: 'Просмотр и выполнение своих задач'
  }
};
```

## 5.2 Система согласований

```javascript
function canDirectWrite(sheet) {
  const p = getUserPerms();
  if (p.writeSheets && p.writeSheets.includes(sheet)) return 'direct';
  if (p.needsApproval && p.needsApproval.includes(sheet)) return 'approval';
  return 'denied';
}
// 'direct'   → сразу пишем в Supabase
// 'approval' → создаём запись в approvals, CEO решает
// 'denied'   → показываем ошибку
```

## 5.3 Видимость в UI по ролям

- Настройки и Админ — только CEO
- Сотрудники (управление) — CEO и Зам
- Все задачи — CEO, Зам, Руководитель; Менеджер/Сотрудник — только свои

---

# ЧАСТЬ 6. ПРОЕКТЫ И НАПРАВЛЕНИЯ

## 6.1 Структура PROJECTS

```javascript
const PROJECTS = {
  rkt: {
    name: 'РКТ', emoji: '🏥',
    subprojects: {
      'КТ':       { emoji: '🔬', desc: 'Компьютерные томографы — OEM Syno-Tech' },
      'Рентген':  { emoji: '📡', desc: 'Рентгеновские аппараты' },
      'Роботы':   { emoji: '🤖', desc: 'Хирургические роботы' },
      'Урология': { emoji: '💊', desc: 'Урологическое оборудование' },
      'PACS':     { emoji: '💻', desc: 'Архивация медизображений' },
      'УЗИ':      { emoji: '🩺', desc: 'Ультразвуковая диагностика' }
    }
  },
  sites: {
    name: 'Сайты', emoji: '🌐', canAddSub: true,
    subprojects: {
      'Пышки мира':    { emoji: '🍩', desc: 'Ресторан' },
      'Брежнев':       { emoji: '🏛', desc: 'Рестоклуб' },
      'Кератин Агрыз': { emoji: '💇', desc: 'Кератиновое выпрямление' }
    }
  },
  content: { name: 'AI-контент', emoji: '🎬', subprojects: {} },
  ai_agents: { name: 'ИИ-агенты', emoji: '🤖', subprojects: {} }
};
```

## 6.2 Прайс-лист (Сайты)

```javascript
const SITE_PRICING = {
  'Визитка':       { price: 5000,  emoji: '📄', desc: '1-3 страницы, базовый дизайн' },
  'Лендинг':       { price: 10000, emoji: '🎯', desc: '1 продающая страница, анимации' },
  'Каталог':       { price: 15000, emoji: '🛒', desc: '5+ страниц, каталог товаров' },
  'Премиум':       { price: 25000, emoji: '⭐', desc: 'Индивидуальный дизайн, SEO, CRM' },
  'Свадебный':     { price: 8000,  emoji: '💍' },
  'Портфолио':     { price: 7000,  emoji: '🎨' },
  'Мероприятие':   { price: 8000,  emoji: '🎉' },
  'Блог/Медиа':    { price: 10000, emoji: '📰' },
  'Другое':        { price: 0,     emoji: '📌' },
  'Домен+хостинг': { price: 3000,  emoji: '🌐', desc: 'Домен .ru + хостинг на год' }
};
// Зарплатный процент: Менеджер 10%, Разработчик 10%
```

---

# ЧАСТЬ 7. CRM ВОРОНКА ПРОДАЖ

## 7.1 Этапы (таблица directions, поле stage)

| Ключ | Этап | % |
|---|---|---|
| `prospect` | 🔍 Поиск | 5% |
| `contact` | 📞 Первый контакт | 10% |
| `interest` | ✅ Интерес | 20% |
| `proto` | 🎨 Прототип | 40% |
| `proposal` | 📋 КП отправлено | 60% |
| `negotiation` | 🤝 Переговоры | 75% |
| `payment` | 💰 Оплата | 90% |
| `done` | ✅ Сдан | 100% |
| `lost` | ❌ Отказ | 0% |

## 7.2 Follow-up расписание

| Касание | Следующий контакт |
|---|---|
| 1-й звонок | через +2 дня |
| 2-й | через +3 дня |
| 3-й | через +5 дней |
| 4-й | через +7 дней |
| 5-й | через +14 дней |
| 6-й | через +21 день |
| 7-й | через +30 дней |
| 8-й | через +90 дней |

**Факт:** 80% сделок — после 5+ касаний. 48% менеджеров бросают после 1-го.

## 7.3 Причины отказа
Дорого / Не нужен сайт / Выбрал конкурента / Сделает сам (Tilda/Wix) / Не отвечает / Нет бюджета / Другое

## 7.4 Pipeline воронки Сайты (12 шагов)

```javascript
const SITE_PIPELINE = [
  { step: 1,  name: '🔍 Найти лида на картах',       role: 'Менеджер',    days: 0  },
  { step: 2,  name: '📞 Первый звонок/сообщение',    role: 'Менеджер',    days: 0  },
  { step: 3,  name: '📞 Follow-up #2',               role: 'Менеджер',    days: 2  },
  { step: 4,  name: '📞 Follow-up #3',               role: 'Менеджер',    days: 5  },
  { step: 5,  name: '🎨 Создать демо-прототип',      role: 'Разработчик', days: 3  },
  { step: 6,  name: '📤 Отправить прототип клиенту', role: 'Менеджер',    days: 4  },
  { step: 7,  name: '📋 Подготовить КП',             role: 'Менеджер',    days: 5  },
  { step: 8,  name: '💬 Собрать обратную связь',     role: 'Менеджер',    days: 7  },
  { step: 9,  name: '💰 Выставить счёт + оплата',   role: 'Менеджер',    days: 10 },
  { step: 10, name: '🔧 Залить на хостинг',          role: 'Разработчик', days: 12 },
  { step: 11, name: '✅ Сдача клиенту',              role: 'Зам',         days: 14 },
  { step: 12, name: '👑 Утверждение CEO',             role: 'CEO',         days: 15 }
];
```

---

# ЧАСТЬ 8. CSS ПЕРЕМЕННЫЕ

## hub/index.html:
```css
:root {
  --bg: #0a0e17;    --bg2: #111827;   --bg3: #1a2234;  --bg4: #1f2b3d;
  --accent: #00d4aa; --accent2: #00b894; --accent-glow: rgba(0,212,170,.15);
  --red: #ff6b6b;   --orange: #ffa94d; --yellow: #ffd43b;
  --blue: #4dabf7;  --purple: #b197fc; --green: #51cf66; --pink: #f06595;
  --text: #e8ecf1;  --text2: #94a3b8;  --text3: #64748b;
  --border: rgba(255,255,255,0.08);
  --radius: 12px;   --radius-sm: 8px;
}
/* ⚠️ БАГИ: --bg1 НЕ ОПРЕДЕЛЕНА (используется 17 раз — заменить на --bg) */
```

## Публичные страницы (index, order, sites, med...):
```css
:root {
  --bg: #060a14;   --bg2: #0c1220;  --bg3: #121a2c;  --bg4: #1a2540;
  --accent: #00e5a0; --accent2: #00c48c;
  --text: #edf2f7; --text2: #94a3b8; --text3: #64748b;
  --border: rgba(255,255,255,.06); --border2: rgba(255,255,255,.1);
  --font-d: 'Unbounded', sans-serif;
  --font-b: 'Manrope', sans-serif;
}
```

---

# ЧАСТЬ 9. N8N WORKFLOW v7.1

## 9.1 Архитектура (45 узлов)

```
Webhook /rkt-ai
  │
  ├─ Quick Route (action = notify/telegram_notify)  ← БЫСТРЫЙ МАРШРУТ
  │     → Fast Notify (сам читает tg_bot_token из Supabase settings)
  │     → Fast Respond
  │     ✅ Рекурсия устранена. ~2 сек.
  │
  └─ Основной маршрут (Telegram/AI):
       Parse Web / Parse Telegram
       → Auth User (Supabase)
       → Load Clients / Load Tasks / Load Partners (3× Supabase)
       → Route & Format (code — все команды)
           ├── /start → приветствие + клавиатура
           ├── /me → профиль из staff
           ├── /tasks → задачи assignee=telegram_id
           ├── /clients → клиенты по project/manager
           ├── /hub → ссылка rct-hub.ru/hub/
           ├── /help → команды по роли
           ├── /register → Create Staff (статус "Ожидает")
           ├── /login → Save Login Token
           ├── /add → Create Task
           ├── Do File? → Save File Meta
           └── Do Client Order? → Create Direction + Load Leadership
                                 + Send Order Notifications (через Fast Notify!)
       → Skip AI? → Mark Task Done / Format Done
       → Cascade LLM (Claude/Groq/Gemini/DeepSeek — каскад)
       → Format AI Reply
       → Is Telegram? → Send Telegram / Prepare Web Response
       → Save Chat History
       → Log AI Usage (ai_logs)
```

## 9.2 Критические правила n8n
- **НЕ вызывать `/rkt-ai` внутри n8n** — рекурсия, задержка 5+ мин
- **Bot Token** — всегда из Supabase `settings` (key=`tg_bot_token`), не хардкод
- Уведомления — через `action: 'telegram_notify'` → Quick Route → Fast Notify

## 9.3 Планируемые новые команды (НЕ реализованы)
```
/audit <url>  — AI-аудит сайта клиента
/report       — еженедельная сводка по сделкам и задачам
/status <id>  — статус конкретной сделки
action: 'ai_assist' — AI Action Button (Итог/Следующий шаг)
```

---

# ЧАСТЬ 10. АВТОРИЗАЦИЯ

```
1. rct-hub.ru/login/ → ввод имя / телефон / @тег
2. Поиск в staff по name, phone, username
3. Ввод пароля → SHA-256 сравнение с pin_hash
4. Альтернатива: /login в боте → код → ввести на сайте
5. Регистрация → staff.status = "Ожидает" → CEO утверждает в approvals
```

---

# ЧАСТЬ 11. ORDER/INDEX.HTML

Что внутри (1 411 строк):
- Выбор направления: Сайты / AI-контент / ИИ-агент / Медоборудование
- Поле URL сайта (появляется при «Аудит»)
- После отправки запускается **AI-анкета** (~400 строк) — квалификатор лидов через диалог
- `quickRegister()` — регистрация сотрудника из анкеты
- Прямые Telegram-уведомления (читает token из Supabase settings)
- Данные → `client_requests` + `directions` + n8n webhook

---

# ЧАСТЬ 12. ИЗВЕСТНЫЕ БАГИ

| # | Баг | Файл | Приоритет |
|---|---|---|---|
| 1 | `var(--bg1)` не определена в `:root` — 17 мест | hub/index.html | 🔴 P0 |
| 2 | Дубль `sendTelegramNotification` (~6355 и ~10582) | hub/index.html | 🔴 P0 |
| 3 | Планшет 900–1200px: sidebar перекрывает контент | hub/index.html | 🟡 P1 |
| 4 | D&D каскада AI-провайдеров — CSS есть, JS-обработчики нет | hub/index.html | 🟡 P1 |
| 5 | Автосохранение API-ключей (debounce) не реализовано | hub/index.html | 🟡 P1 |
| 6 | Несогласованность Supabase anon key в разных файлах | все | 🟡 P1 |
| 7 | client_requests, ai_logs, settings не созданы в Supabase | Supabase | 🔴 P0 |
| 8 | n8n_workflow_v7.1 не задеплоен (рекурсия активна) | n8n Cloud | 🔴 P0 |

---

# ЧАСТЬ 13. MASTER PLAN v2 — ПОЛНЫЙ ПЛАН РАЗРАБОТКИ

## Этап 0: Критические исправления (P0)

### 0.1 Заявки не приходят (3 причины)
**A.** `order/index.html` — `mode: 'no-cors'` в fetch → удалить, добавить `headers: {'Content-Type':'application/json'}`
**B.** Таблица `client_requests` не существует → запустить SQL-миграцию
**C.** Bot Token в Fast Notify — из параллельной ветки n8n → Fast Notify сам читает из Supabase settings
✅ **Статус:** исправлено в filemgr.zip + n8n_workflow_v7.1.json

### 0.2 Рекурсивный цикл n8n
Send Order Notifications вызывал тот же `/rkt-ai` → 5+ минут.
**Решение:** Quick Route → Fast Notify → Fast Respond (5 узлов вместо 45)
✅ **Статус:** исправлено в n8n_workflow_v7.1.json

### 0.3 Планшетный layout (768–1024px)
Конфликт 3 медиа-запросов, сайдбар перекрывает контент.
**Решение:** breakpoints 1200px / 900px / 480px
⚠️ **Статус:** частично, нужно доделать

### 0.4 Прочие баги P1
- Дубль `sendTelegramNotification` → удалить строку ~6355 ❌ не исправлено
- `--bg1` → `--bg` (17 мест) ❌ не исправлено
- Автосохранение ключей AI (debounce onChange) ❌ не реализовано
- D&D каскада провайдеров ❌ CSS есть, JS нет
- Унифицировать anon key ❌ не сделано

---

## Этап 1: Миграция архитектуры на ES Modules (НЕ НАЧАТО)

**Цель:** hub/index.html (14 708 строк) → набор модулей по 200–500 строк каждый.
ES Modules работают нативно в браузере, без сборки. GitHub Pages раздаёт как есть.

### Целевая структура:
```
hub/
├── index.html          ← ~150 строк (только подключение)
├── js/
│   ├── config.js       ← COL_MAP, mapToDb, mapFromDb, Supabase credentials
│   ├── auth.js         ← логин, регистрация, SHA-256, Telegram auth
│   ├── data.js         ← loadData(), DATA{}, Realtime подписки
│   ├── router.js       ← showPage(), навигация, история
│   ├── sidebar.js      ← сайдбар, бейджи, renderSidebarProjects
│   ├── dashboard.js    ← главная страница, метрики
│   ├── tasks.js        ← задачи, канбан задач
│   ├── staff.js        ← сотрудники, управление
│   ├── crm-sites.js    ← CRM воронка сайтов (9 этапов, касания, follow-up)
│   ├── crm-med.js      ← CRM медоборудования НОВЫЙ (РЗН, ВЭД, госзакупки)
│   ├── kanban.js       ← канбан, drag-and-drop
│   ├── ai-chat.js      ← AI-ассистент, каскад LLM
│   └── site-generator.js ← генератор сайтов
└── css/
    ├── variables.css   ← все CSS-переменные
    ├── layout.css      ← сайдбар, grid, responsive
    └── components.css  ← кнопки, карточки, модалки
```

### Точка входа (hub/index.html ~150 строк):
```html
<link rel="stylesheet" href="css/variables.css">
<link rel="stylesheet" href="css/layout.css">
<link rel="stylesheet" href="css/components.css">
<script type="module">
  import { initAuth } from './js/auth.js';
  import { loadData } from './js/data.js';
  import { initRouter } from './js/router.js';
  await initAuth();
  await loadData();
  initRouter();
</script>
```

### config.js экспортирует:
```javascript
export const CONFIG = { SUPABASE_URL, SUPABASE_KEY, AI_URL, TG_BOT };
export const COL_MAP = { ... };  // единственный источник маппинга
export function mapToDb(table, row) { ... }
export function mapFromDb(table, rows) { ... }
export const SB = supabase.createClient(...);
```

### Порядок миграции (постепенный, старый файл работает параллельно):
1. `config.js + auth.js + data.js` — ядро. Проверка: логин, данные
2. `router.js + sidebar.js` — навигация
3. `dashboard.js + tasks.js + staff.js` — основные страницы
4. `crm-sites.js + kanban.js` — CRM (самый сложный)
5. `crm-med.js` — новый модуль медоборудования
6. `ai-chat.js + site-generator.js` — AI

**Принцип:** никакой потери функционала — всё переносится 1-в-1.

---

## Этап 2: Редизайн UX (частично не сделано)

### 2.1 Навигация
**Сейчас:** Главное / Данные / Управление / Система (есть, но не «РАБОТА/СИСТЕМА»)
**По плану — сделать:**
```
РАБОТА:   🔄 Сделки | ✅ Задачи | 👥 Клиенты | 📝 Заявки
СИСТЕМА:  👤 Сотрудники | ✅ Согласования | ⚙️ Настройки | 🔧 Админ
```
- Бейдж просроченных задач (сейчас — все задачи, нужно: только просроченные)
- Бейдж ожидающих согласований

### 2.2 Кнопки
- Минимум 44×44px — ✅ в мобильном CSS есть
- Подтверждение удаления с НАЗВАНИЕМ объекта — ⚠️ не везде
- Текстовые подписи к иконкам — ⚠️ не везде

### 2.3 Воронка / Канбан (НЕ СДЕЛАНО):
```
Нужно добавить:
- Нумерация этапов: «1. Поиск → 2. Контакт → 3. Интерес → ...»
- border-left: 4px — цветовая маркировка карточек по статусу
- scroll-snap на мобильном (горизонтальный скролл колонок)
- Подсказка при первом входе: «Перетащите карточку вправо»
```

---

## Этап 3: Полиморфный интерфейс (НЕ СДЕЛАНО в UI)

### 3.1 CRM Сайты — улучшения (НЕ СДЕЛАНО)
Текущий функционал сохраняется (9 этапов, касания, follow-up, прайс).
**Добавить:**
```
- Визуальный прогресс-бар этапов в карточке (prospect → done)
  Реализация: 9 кружков с линиями, активный — filled accent
- Кнопка «Следующий этап →» с confirm-диалогом (не просто select)
- Таймлайн касаний — хронология: дата | тип | результат
- KPI-блок: конверсия по этапам, средний цикл сделки в днях
```

### 3.2 CRM Медоборудование — НОВЫЙ МОДУЛЬ (НЕ СДЕЛАНО)
**Поля в COL_MAP и SQL уже готовы. Нужен только UI.**

При открытии сделки с проектом «РКТ» — специальный интерфейс вместо стандартного:

**Блок «Спецификация OEM»:**
```html
<select> КТ 16 срезов / КТ 32 / КТ 64 / КТ 128 / Рентген / С-дуга </select>
<select> Syno-Tech / Powersite / Varex / Canon </select>
<input>  Локализация: ОЭЗ Иннополис </input>
```
БД поля: `equipment_type`, `oem_partner`

**Блок «Регистрация РЗН»:**
```html
☐ Тех. файл переведён (CN→RU)
☐ Токсикология пройдена
☐ Досье подано в Росздравнадзор
☐ РУ (Регистрационное удостоверение) получено
```
БД поле: `rzn_checklist` (jsonb), `rzn_status`

**Блок «Логистика ВЭД»:**
```
[На заводе] → [Таможня] → [Доставка] → [Монтаж] → [Ввод в эксплуатацию]
  ● ──────────── ○ ────────── ○ ──────── ○ ──────── ○
```
БД поле: `logistics_status`, `contract_amount`

**Блок «Госзакупки»:**
```html
<select> ФЗ-44 / ФЗ-223 / Прямой договор </select>
<input type="date"> Дедлайн подачи </input>
<input> Номер закупки </input>
```
БД поля: `procurement_type`, `procurement_deadline`, `procurement_number`

**Прикрепление документов:** кнопка загрузки → Supabase Storage bucket `documents`

### 3.3 AI Action Button (НЕ СДЕЛАНО)
На каждой карточке в Канбане и в карточке сделки — две кнопки:

```javascript
// Кнопка «🤖 Итог»
async function aiSummary(leadId) {
  const lead = DATA.directions.find(d => d.ID == leadId);
  await fetch(CONFIG.AI_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      action: 'ai_assist',
      type: 'summary',
      lead_id: leadId,
      message: 'Дай краткую сводку по клиенту: ' + JSON.stringify(lead)
    })
  });
}

// Кнопка «💡 Следующий шаг»
async function aiNextStep(leadId) {
  // action: 'ai_assist', type: 'next_step'
  // AI анализирует stage, touches, next_contact
  // Рекомендует: позвонить / отправить КП / закрыть
}
```

В n8n добавить обработку `action: 'ai_assist'`:
- Загрузить данные по `lead_id` из directions
- Отправить в AI-агент с контекстом
- Результат → в Telegram CEO/менеджеру + показать в HUB

---

## Этап 4: Безопасность (НЕ СДЕЛАНО)

### Rate-limit логина:
```javascript
// В функции doPasswordLogin():
const attempts = parseInt(sessionStorage.getItem('login_attempts') || '0');
if (attempts >= 5) {
  const blockedUntil = parseInt(sessionStorage.getItem('login_blocked_until') || '0');
  if (Date.now() < blockedUntil) {
    toast('Слишком много попыток. Подождите ' + Math.ceil((blockedUntil-Date.now())/60000) + ' мин.', 'error');
    return;
  }
  sessionStorage.removeItem('login_attempts');
}
// При неудаче: sessionStorage.setItem('login_attempts', attempts+1)
// При 5+ попытках: sessionStorage.setItem('login_blocked_until', Date.now()+300000)
```

### RLS по ролям (полное):
```sql
-- Сотрудник видит только свои задачи:
CREATE POLICY tasks_own ON tasks FOR SELECT TO authenticated
  USING (assignee = current_setting('app.user_name', true));

-- Менеджер видит только свой проект:
CREATE POLICY dirs_own_project ON directions FOR SELECT TO authenticated
  USING (project = current_setting('app.user_project', true));
```

---

## Этап 5: Order-форма (выполнено частично)

✅ Удалён `mode: 'no-cors'`
✅ Select «Тип услуги» (Сайты / AI-контент / ИИ-агент / Медоборудование)
✅ Поле URL сайта при выборе «Аудит»
✅ AI-анкета-квалификатор
❌ `action: 'ai_assist'` для аудита сайта через n8n

---

## Дорожная карта

| Этап | Что | Оценка | Статус |
|---|---|---|---|
| 0 | Критические баги | 1 день | ⚠️ Частично |
| 1 | ES Modules миграция | 10–15 дней | ❌ Не начато |
| 2 | UX Редизайн | 3–5 дней | ⚠️ Частично |
| 3 | Полиморфный UI (CRM Мед + AI кнопки) | 5 дней | ❌ Не начато |
| 4 | Безопасность | 2 дня | ❌ Не начато |

**Принципы:**
- Никакой потери функционала — всё переносится 1-в-1
- COL_MAP — единственный источник маппинга, никогда не обращаться к полям БД напрямую
- SQL-миграции всегда идемпотентные (DO-блоки, IF NOT EXISTS)
- Деплой = git push (без сборки)

---

# ЧАСТЬ 14. ПРАВИЛА РАЗРАБОТКИ

```
✅ hub/index.html — монолит, ВСЕ правки только в нём (до ES Modules)
✅ Публичные страницы — каждый файл отдельный, самодостаточный
✅ Новые колонки → SQL DO-блоки (идемпотентная миграция)
✅ При работе с БД — ВСЕГДА mapToDb() / mapFromDb()
✅ CSS: только var(--accent), var(--bg2), var(--text) и т.д.
✅ Интерфейс на РУССКОМ языке
✅ Изменения бота → полный JSON workflow для n8n
✅ НЕ рефакторить без явного запроса
✅ НЕ вызывать /rkt-ai внутри n8n (рекурсия!)
✅ Bot Token — из Supabase settings ('tg_bot_token'), не хардкод
✅ Код сразу рабочий — без заглушек и TODO
✅ var(--bg1) не существует — использовать var(--bg)
```

---

# ЧАСТЬ 15. ПОРЯДОК ДЕПЛОЯ

```
Шаг 1: Supabase SQL Editor
  → migration_phase1.sql (Мед поля + RLS + индексы)
  → Создать client_requests, ai_logs, settings
  → INSERT INTO settings VALUES ('tg_bot_token', '<РЕАЛЬНЫЙ_ТОКЕН>')
  → Проверка: SELECT * FROM client_requests; — без ошибок

Шаг 2: n8n Cloud
  → Деактивировать текущий workflow
  → Импортировать n8n_workflow_v7.1.json
  → Активировать. Webhook /rkt-ai должен остаться тем же

Шаг 3: hub/index.html
  → Заменить var(--bg1) → var(--bg) (17 мест)
  → Удалить первый дубль sendTelegramNotification (~строка 6355)
  → Загрузить на rct-hub.ru/hub/

Шаг 4: Тест
  → Заявка через /order/ → Telegram + client_requests ✓
  → /start в @AIhroject_bot ✓
  → Вход в hub/ как CEO ✓
```

---

# ЧАСТЬ 16. ИСТОРИЯ ВЕРСИЙ

| Версия | Что добавлено |
|---|---|
| v4–v7 | База: Supabase, задачи, партнёры, Gantt, воронка |
| v8–v10 | CRM, бюджеты, согласования, канбан, 12-точечные права |
| v11 | UX, PIN→пароль, Telegram auth |
| v12–v13 | File upload bot, AI база знаний, vertical pipeline |
| v14 | CRM 9 этапов, follow-up, KPI, фидбек |
| v15.1 | Мультистраничность rct-hub.ru, AI-анкета, новые таблицы, n8n v7.1, сворачиваемый сайдбар, страницы Клиентов/Заявок, 152-ФЗ |

**Текущее состояние:** hub/index.html = 14 708 строк | 10+ HTML-файлов | 8+3 таблицы | 45 узлов n8n
