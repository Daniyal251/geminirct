# RKT HUB — АРХИТЕКТУРА v3.0

## 📊 Гибридная архитектура (обновлено 27.02.2026)

### Что было (план v2.0)
```
❌ ES Modules (8 файлов по 500 строк)
❌ GitHub Pages без сборки
❌ Монолитный SPA
```

### Что стало (фактически)
```
✅ Next.js 14 App Router (серверный рендеринг + API Routes)
✅ Модульная структура (15+ файлов по 100-300 строк)
✅ Vercel/GitHub Pages с сборкой
✅ Разделение на 3 портала (Главный сайт, Клиенты, Сотрудники)
```

---

## 🏗 ПОЛНАЯ СТРУКТУРА ПРОЕКТА

```
geminirct/
│
├── website/                  ← ГЛАВНЫЙ САЙТ + ВСЕ ПОРТАЛЫ (Next.js 14)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                  # Главная визитка (4 направления)
│   │   │   ├── layout.tsx                # Корневой layout
│   │   │   ├── globals.css               # Глобальные стили
│   │   │   │
│   │   │   ├── med/                      # 🏥 МЕДОБОРУДОВАНИЕ (РКТ)
│   │   │   │   └── page.tsx              # Страница направления
│   │   │   │
│   │   │   ├── sites/                    # 🌐 САЙТЫ
│   │   │   │   └── page.tsx              # Страница направления
│   │   │   │
│   │   │   ├── content/                  # 🎬 AI-КОНТЕНТ
│   │   │   │   └── page.tsx              # Страница направления
│   │   │   │
│   │   │   ├── ai/                       # 🤖 ИИ-АГЕНТЫ
│   │   │   │   └── page.tsx              # Страница направления
│   │   │   │
│   │   │   ├── order/                    # 📝 ЗАЯВКИ (order-форма)
│   │   │   │   └── page.tsx              # Форма заказа
│   │   │   │
│   │   │   ├── client/                   # 👥 КЛИЕНТСКИЙ ПОРТАЛ
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx          # Вход / регистрация
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── page.tsx          # Личный кабинет
│   │   │   │   ├── projects/
│   │   │   │   │   └── page.tsx          # Проекты клиента
│   │   │   │   ├── requests/
│   │   │   │   │   └── page.tsx          # Заявки на правки
│   │   │   │   └── ai/
│   │   │   │       └── page.tsx          # ИИ-помощник
│   │   │   │
│   │   │   └── hub/                      # 🔐 АДМИНКА (сотрудники)
│   │   │       ├── login/
│   │   │       │   └── page.tsx          # Вход для сотрудников
│   │   │       ├── dashboard/
│   │   │       │   └── page.tsx          # Дашборд
│   │   │       ├── projects/
│   │   │       │   └── page.tsx          # Управление проектами
│   │   │       ├── tasks/
│   │   │       │   └── page.tsx          # Задачи
│   │   │       ├── crm/
│   │   │       │   ├── sites/            # CRM Сайты (воронка 9 этапов)
│   │   │       │   │   └── page.tsx
│   │   │       │   └── med/              # CRM Медоборудование (РЗН, ВЭД)
│   │   │       │       └── page.tsx
│   │   │       ├── staff/
│   │   │       │   └── page.tsx          # Сотрудники
│   │   │       ├── partners/
│   │   │       │   └── page.tsx          # Партнёры (OEM, Syno-Tech)
│   │   │       ├── approvals/
│   │   │       │   └── page.tsx          # Согласования
│   │   │       └── settings/
│   │   │           └── page.tsx          # Настройки (AI, каскад)
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx            # Шапка сайта
│   │   │   │   ├── Footer.tsx            # Подвал
│   │   │   │   ├── Sidebar.tsx           # Сайдбар админки
│   │   │   │   └── AIChat.tsx            # AI-чат (глобальный)
│   │   │   │
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx            # Кнопки (44×44px min)
│   │   │   │   ├── Card.tsx              # Карточки
│   │   │   │   ├── Table.tsx             # Таблицы
│   │   │   │   ├── Modal.tsx             # Модальные окна
│   │   │   │   ├── Kanban.tsx            # Канбан-доска
│   │   │   │   └── Pipeline.tsx          # Воронка (9 этапов)
│   │   │   │
│   │   │   └── crm/
│   │   │       ├── SitesCard.tsx         # Карточка сделки (сайты)
│   │   │       ├── MedCard.tsx           # Карточка сделки (мед)
│   │   │       ├── TouchHistory.tsx      # Таймлайн касаний
│   │   │       └── AITimeline.tsx        # AI-рекомендации
│   │   │
│   │   ├── lib/
│   │   │   ├── supabase-client.ts        # Supabase клиент (browser)
│   │   │   ├── supabase-server.ts        # Supabase клиент (server)
│   │   │   ├── config.ts                 # CONFIG (URLs, keys, COL_MAP)
│   │   │   ├── constants.ts              # ROLES, STAGES, SITE_PRICING
│   │   │   └── utils.ts                  # esc(), toast(), fmtMoney()
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts                # Авторизация
│   │   │   ├── useData.ts                # Загрузка данных
│   │   │   ├── useAI.ts                  # AI-каскад
│   │   │   └── useNotifications.ts       # Уведомления Telegram
│   │   │
│   │   ├── stores/
│   │   │   ├── appStore.ts               # Zustand (глобальный стейт)
│   │   │   └── crmStore.ts               # CRM-данные (сделки, этапы)
│   │   │
│   │   └── middleware.ts                 # Next.js middleware (RLS, auth)
│   │
│   ├── public/
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── .env.local                        # Переменные (не коммитить!)
│
├── hub-next/                 ← СТАРАЯ АДМИНКА (можно удалить)
│   └── ...
│
├── hub/                      ← СТАРЫЙ МОНОЛИТ (резервная копия)
│   ├── index.html            # 15k строк (архив)
│   └── src/                  # ES Modules версия (архив)
│
└── client/                   ← СТАРЫЙ КЛИЕНТСКИЙ ПОРТАЛ (резерв)
    └── index.html
```

---

## 🔄 ПОТОКИ ДАННЫХ

### 1. Заявка клиента (Order Form)
```
Клиент → /order (форма)
    ↓
Next.js API Route (/api/order)
    ↓
n8n Webhook (/rkt-ai)
    ├→ Supabase (client_requests)
    ├→ Telegram (@AIhroject_bot)
    └→ AI-ответ клиенту
```

### 2. Авторизация сотрудника
```
Сотрудник → /hub/login
    ↓
Next.js API Route (/api/auth/login)
    ↓
Supabase (staff table)
    ↓
Session cookie
    ↓
Доступ к /hub/* (по ролям)
```

### 3. AI-каскад
```
Запрос → /api/ai/chat
    ↓
API Route (сервер)
    ↓
Каскад: Groq → Gemini → Claude → DeepSeek
    ↓
Ответ + логирование (ai_logs)
```

### 4. CRM Медоборудование
```
Менеджер → /hub/crm/med
    ↓
Интерфейс: Спецификация OEM + РЗН + ВЭД + Госзакупки
    ↓
Supabase (directions + 9 полей)
    ↓
AI-рекомендации (/api/ai/assist)
```

---

## 📋 ТАБЛИЦЫ БАЗЫ ДАННЫХ (Supabase)

### Существующие
| Таблица | Назначение |
|---------|------------|
| `staff` | Сотрудники (роли, права) |
| `directions` | Направления/сделки (маппинг COL_MAP) |
| `tasks` | Задачи (исполнители, дедлайны) |
| `partners` | Партнёры (OEM, клиенты) |
| `projects` | Проекты (РКТ, Сайты, Контент, AI) |
| `approvals` | Согласования (CEO, Зам) |
| `communications` | Коммуникации (звонки, встречи) |
| `documents` | Документы (файлы, сертификаты) |

### Новые (миграция v3.0)
| Таблица | Назначение | RLS |
|---------|------------|-----|
| `client_requests` | Заявки с order-формы | anon INSERT |
| `ai_logs` | Логи AI-чата | anon INSERT |
| `settings` | Ключ-значение (токены) | anon ALL |
| `notifications` | Уведомления Telegram | authenticated SELECT |

### Дополнения к `directions`
```sql
-- Медоборудование (+9 полей)
ALTER TABLE directions ADD COLUMN IF NOT EXISTS equipment_type text;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS oem_partner text;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS rzn_status text;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS rzn_checklist jsonb;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS logistics_status text;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS contract_amount numeric;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS procurement_type text;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS procurement_deadline date;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS procurement_number text;

-- Сайты (+8 полей)
ALTER TABLE directions ADD COLUMN IF NOT EXISTS client_name text;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS site_type text;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS paid boolean DEFAULT false;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS source text;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS next_contact date;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS touches integer DEFAULT 0;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS reject_reason text;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS feedback text;
```

---

## 🔐 ROLES & PERMISSIONS (RLS)

### Роли (уровни доступа)
| Роль | Уровень | Доступ |
|------|---------|--------|
| CEO | 4 | Полный доступ (все таблицы, все записи) |
| Зам | 3 | Управление проектом, задачи, партнёры |
| Руководитель | 2 | Задачи направления, коммуникации |
| Менеджер | 1 | Свои сделки, касания, задачи |
| Сотрудник | 0 | Только просмотр своих задач |

### RLS-политики (пример)
```sql
-- directions: сотрудник видит только свои сделки
CREATE POLICY "Staff see own directions"
ON directions FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM staff WHERE project = directions.project
  )
);

-- tasks: менеджер видит задачи своего направления
CREATE POLICY "Manager see own tasks"
ON tasks FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM staff WHERE direction = tasks.direction
  )
);

-- client_requests: anon может создавать
CREATE POLICY "Anon create requests"
ON client_requests FOR INSERT
WITH CHECK (true);
```

---

## 🎨 UX/UI ТРЕБОВАНИЯ (из мастер-плана)

### 4.1 Навигация
✅ **Группировка пунктов:**
- **РАБОТА** (Сделки, Задачи, Клиенты)
- **СИСТЕМА** (Сотрудники, Настройки, Согласования)

✅ **Фильтрация по ролям:**
- Сотрудник не видит «Настройки»
- Менеджер не видит «Сотрудники»

✅ **Бейджи со счётчиками:**
- 🔴 3 новых заявки
- 🟡 5 просроченных задач

### 4.2 Кнопки (Apple HIG)
✅ **Минимальный размер:** 44×44px
✅ **Главное действие:** большая кнопка
✅ **Подписи:** «✏️ Изм.», «🗑 Удал.»
✅ **Подтверждение:** перед удалением

### 4.3 Воронка / Канбан
✅ **Нумерация этапов:** 1→2→3→4
✅ **Цветовая маркировка:** border-left по статусу
✅ **Scroll-snap:** на мобильном
✅ **Подсказка:** при первом входе

---

## 🤖 AI ACTION BUTTON

На каждой карточке сделки (Канбан + детальная):

```tsx
<div className="ai-actions">
  <button onClick={() => aiSummary(leadId)}>
    🤖 Итог
  </button>
  <button onClick={() => aiNextStep(leadId)}>
    💡 Следующий шаг
  </button>
</div>
```

**Реализация:**
```typescript
// /api/ai/assist
POST { action: 'ai_assist', type: 'summary'|'next_step', lead_id }
↓
AI-каскад (Groq → Gemini → Claude)
↓
Ответ + логирование в ai_logs
↓
Telegram-уведомление менеджеру
```

---

## 📊 CRM МЕДБОРУДОВАНИЕ (crm-med.js)

### Блок 1: Спецификация OEM
```tsx
<select name="equipment_type">
  <option>КТ 16 срезов</option>
  <option>КТ 32 среза</option>
  <option>КТ 64 среза</option>
  <option>КТ 128 срезов</option>
  <option>Рентген</option>
  <option>С-дуга</option>
</select>

<select name="oem_partner">
  <option>Syno-Tech</option>
  <option>Powersite</option>
  <option>Varex</option>
  <option>Canon</option>
</select>
```

### Блок 2: Чеклист РЗН
```tsx
<checkbox name="rzn_checklist.tech_file">Тех.файл CN→RU</checkbox>
<checkbox name="rzn_checklist.toxicology">Токсикология</checkbox>
<checkbox name="rzn_checklist.dossier">Досье в РЗН</checkbox>
<checkbox name="rzn_checklist.ru_received">РУ получено</checkbox>
```

### Блок 3: Логистика ВЭД
```tsx
<status-tracker>
  На заводе → Таможня → Доставка → Монтаж → Ввод в эксплуатацию
</status-tracker>
```

### Блок 4: Госзакупки
```tsx
<select name="procurement_type">
  <option>ФЗ-44</option>
  <option>ФЗ-223</option>
  <option>Прямой договор</option>
</select>
<input name="procurement_number" />
<input name="procurement_deadline" type="date" />
```

---

## 🚀 ДОРОЖНАЯ КАРТА (обновлено)

| Этап | Срок | Что делаем | Результат |
|------|------|------------|-----------|
| **P0** | 1-2 дня | Критические баги (CORS, client_requests, n8n цикл) | Заявки приходят |
| **P0** | 2-3 дня | Миграция: ядро (config + auth + data) | Логин работает |
| **P1** | 3-4 дня | Миграция: страницы (dashboard, tasks, staff) | Основной функционал |
| **P1** | 2-3 дня | CRM Сайты + Мед + UX редизайн | Полиморфный интерфейс |
| **P2** | 2-3 дня | Order-форма + RLS | Новые лиды, защита |
| **P2** | 2-3 дня | AI Action Button + n8n | AI-ассистент |
| **P3** | далее | KPI, календарь, клиентский портал | Развитие |

**ИТОГО:** ~15 рабочих дней до полной версии

---

## 📦 ЗАВИСИМОСТИ

```json
{
  "next": "^14.0.4",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "@supabase/supabase-js": "^2.39.1",
  "@supabase/auth-helpers-nextjs": "^0.15.0",
  "zustand": "^4.4.7",
  "tailwindcss": "^3.4.0",
  "typescript": "^5.3.3"
}
```

---

## 🔗 ССЫЛКИ

- **GitHub:** github.com/.../geminirct
- **Supabase:** prparzgqevfelwsndmkc.supabase.co
- **n8n:** daniyal2212.app.n8n.cloud
- **Бот:** @AIhroject_bot
- **Сайт:** rct-hub.ru

---

**Версия:** 3.0 (Next.js гибридная)  
**Дата:** 27 февраля 2026  
**Статус:** В разработке
