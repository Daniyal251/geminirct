# RKT HUB v14 — Next.js Edition

## 🚀 Архитектура

```
Статическая генерация (SSG)
├── Публичные страницы
└── Маркетинговые материалы

Серверный рендеринг (SSR)
├── Дашборд
├── Проекты
└── Задачи

API Routes (Serverless)
├── /api/auth/login — авторизация
├── /api/ai/chat — AI каскад
└── /api/data/* — работа с данными
```

## 📦 Установка

```bash
cd hub-next
npm install
```

## 🏃 Запуск

```bash
# Разработка
npm run dev

# Сборка
npm run build

# Продакшен
npm start
```

## 🔐 Переменные окружения

Создайте `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AI Providers (серверные, не попадают в клиент)
GROQ_API_KEY=gsk_...
GEMINI_API_KEY=AIza...
CLAUDE_API_KEY=sk-ant-...
DEEPSEEK_API_KEY=sk-...
```

## 📁 Структура

```
src/
├── app/
│   ├── (auth)/          # Группа роутов: логин
│   │   └── login/
│   ├── (dashboard)/     # Группа роутов: дашборд
│   │   ├── projects/
│   │   ├── tasks/
│   │   └── layout.tsx
│   ├── api/             # API Routes
│   │   ├── auth/
│   │   └── ai/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── layout/          # Layout компоненты
│   └── ui/              # UI компоненты
├── hooks/               # React hooks
├── lib/                 # Утилиты, клиенты
├── stores/              # Zustand stores
└── middleware.ts        # Next.js middleware
```

## 🎯 Преимущества vs статической версии

| Характеристика | Статика | Next.js |
|---------------|---------|---------|
| **SEO** | ❌ | ✅ SSR |
| **Безопасность API ключей** | ❌ На клиенте | ✅ На сервере |
| **Первая загрузка** | ⚡ Быстро | ⚡⚡ Ещё быстрее (SSR) |
| **API запросы** | Прямые с клиента | Через сервер |
| **Кэширование** | Браузер | SSR + ISR |
| **Масштабирование** | Ограничено | Auto-scaling |

## 🚀 Деплой

### Vercel (рекомендуется)

```bash
npm install -g vercel
vercel login
vercel
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### VPS (PM2)

```bash
npm run build
pm2 start npm --name "rkt-hub" -- start
```

## 📊 Производительность

- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

## 🔒 Безопасность

- ✅ API ключи на сервере
- ✅ Middleware защита роутов
- ✅ Server-side сессии
- ✅ Rate limiting (настроить)

---

**Версия:** 14.0.0 (Next.js)  
**Лицензия:** MIT
