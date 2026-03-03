# 📋 Миграция на Next.js — Полное руководство

## 🎯 Что изменилось

### До (статический сайт)
```
❌ 15,184 строк в одном файле
❌ API ключи на клиенте (небезопасно)
❌ Нет SSR/SEO
❌ Прямые запросы к Supabase с клиента
❌ Нет серверной логики
```

### После (Next.js 14)
```
✅ Модульная архитектура (~100 строк на компонент)
✅ API ключи на сервере (безопасно)
✅ SSR + SSG + ISR
✅ API Routes для запросов
✅ Middleware для защиты роутов
✅ Оптимизация изображений
✅ Встроенная минификация
```

---

## 📦 Установка и запуск

### 1. Установка зависимостей

```bash
cd hub-next
npm install
```

### 2. Настройка переменных окружения

```bash
# Скопируйте пример
cp .env.example .env.local

# Отредактируйте .env.local
nano .env.local
```

### 3. Запуск

```bash
# Разработка (http://localhost:3000)
npm run dev

# Сборка
npm run build

# Продакшен
npm start
```

---

## 🏗 Архитектура

### Роутинг (App Router)

```
src/app/
├── page.tsx              # Главная /
├── layout.tsx            # Корневой layout
├── globals.css           # Глобальные стили
│
├── (auth)/               # Группа: авторизация
│   └── login/
│       └── page.tsx      # /login
│
├── (dashboard)/          # Группа: дашборд
│   ├── layout.tsx        # Layout с sidebar
│   ├── projects/
│   │   └── page.tsx      # /projects
│   ├── tasks/
│   │   └── page.tsx      # /tasks
│   └── ...
│
└── api/                  # API Routes
    ├── auth/
    │   └── login/route.ts    # POST /api/auth/login
    └── ai/
        └── chat/route.ts     # POST /api/ai/chat
```

### Компоненты

```
src/components/
├── layout/
│   ├── Sidebar.tsx       # Боковая панель
│   ├── AIChat.tsx        # AI-чат
│   └── Header.tsx        # Шапка
└── ui/
    ├── Button.tsx        # Кнопки
    ├── Card.tsx          # Карточки
    ├── Table.tsx         # Таблицы
    └── Modal.tsx         # Модальные окна
```

---

## 🔐 Авторизация

### Серверная проверка (middleware.ts)

```typescript
export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('auth-token')?.value
  const isAuthenticated = !!sessionCookie
  
  // Защищённые роуты
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect('/login')
  }
  
  return NextResponse.next()
}
```

### Вход через API

```typescript
// POST /api/auth/login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ phone, password }),
})

const data = await response.json()
// data.user = { id, name, role, ... }
```

---

## 🤖 AI-чат через API

### Клиент (AIChat.tsx)

```typescript
const sendMessage = async () => {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({
      messages: [{ role: 'user', content: text }],
      sessionId: 'web_123',
    }),
  })
  
  const data = await response.json()
  // data.text, data.provider, data.model
}
```

### Сервер (route.ts)

```typescript
export async function POST(request: Request) {
  // Каскад: Groq → Gemini → Claude → DeepSeek
  for (const provider of AI_PROVIDERS) {
    try {
      const result = await callProvider(provider, messages)
      return NextResponse.json({ text: result, provider })
    } catch (e) {
      // Пробуем следующего
    }
  }
}
```

---

## 📊 Работа с данными

### Серверный компонент (SSR)

```typescript
// app/(dashboard)/projects/page.tsx
export default async function Projects() {
  const supabase = createServerClient()
  
  const { data: projects } = await supabase
    .from('Проекты')
    .select('*')
  
  return <ProjectsList projects={projects} />
}
```

### Клиентский компонент (SWR/React Query)

```typescript
'use client'
import useSWR from 'swr'

function TasksList() {
  const { data: tasks } = useSWR('/api/data/tasks', fetcher)
  
  return <div>{/* ... */}</div>
}
```

---

## 🚀 Деплой

### Vercel (рекомендуется)

1. Push в GitHub
2. Import project в Vercel
3. Добавить переменные окружения
4. Deploy автоматически

```bash
# Или через CLI
npm install -g vercel
vercel login
vercel
```

### VPS (Docker)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t rkt-hub .
docker run -p 3000:3000 rkt-hub
```

---

## 📈 Производительность

### Оптимизация

```typescript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [{ hostname: '**.supabase.co' }],
  },
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
}
```

### Кэширование

```typescript
// Статическая генерация
export const dynamic = 'force-static'

// SSR для каждой запроса
export const dynamic = 'force-dynamic'

// ISR (регенерация каждые 60 секунд)
export const revalidate = 60
```

---

## 🔒 Безопасность

### API ключи

```env
# ✅ Правильно: серверные переменные
GROQ_API_KEY=sk_xxx
CLAUDE_API_KEY=sk_xxx

# ✅ Правильно: клиентские переменные
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# ❌ Неправильно: ключи на клиенте
NEXT_PUBLIC_GROQ_API_KEY=...
```

### Rate Limiting

```typescript
// middleware.ts (с vercel/rate-limit)
import { Ratelimit } from '@vercel/ratelimit'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export async function middleware(request: NextRequest) {
  const { success } = await ratelimit.limit(request.ip)
  if (!success) {
    return new Response('Too Many Requests', { status: 429 })
  }
}
```

---

## 📝 Чек-лист миграции

- [ ] Создать `.env.local` с переменными
- [ ] Установить зависимости (`npm install`)
- [ ] Проверить локально (`npm run dev`)
- [ ] Настроить API ключи в `.env.local`
- [ ] Протестировать авторизацию
- [ ] Протестировать AI-чат
- [ ] Задеплоить на Vercel
- [ ] Настроить домен
- [ ] Включить HTTPS

---

## 🆘 Troubleshooting

### Ошибка: "Module not found"
```bash
npm install
rm -rf node_modules .next
npm install
npm run dev
```

### Ошибка: "Missing environment variables"
```bash
cp .env.example .env.local
# Отредактируйте .env.local
```

### Ошибка CORS
```typescript
// API Routes уже на сервере, CORS не нужен
// Уберите fetch с клиента, используйте API Routes
```

---

**Документация:** Next.js [nextjs.org/docs](https://nextjs.org/docs)  
**Поддержка:** @AIhroject_bot
