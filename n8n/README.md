# N8N — ИНСТРУКЦИЯ ПО НАСТРОЙКЕ

## 📊 Архитектура на VPS

```
┌─────────────────────────────────────────┐
│  n8n (на VPS, порт 5678)                │
│                                         │
│  Воркфлоу:                              │
│  1. /webhook/rkt-ai (заявки)           │
│  2. /webhook/ai-assist (AI помощь)     │
│  3. /webhook/telegram (бот)            │
│  4. Daily Report (cron, 9:00 MSK)      │
└─────────────────────────────────────────┘
```

---

## 🚀 ПЕРВЫЙ ЗАПУСК

### 1. Вход в n8n

```
URL: https://rct-hub.ru/n8n/
Логин: admin
Пароль: (из .env)
```

### 2. Импорт старого воркфлоу

1. Экспорт из n8n Cloud:
   - Зайти в старый n8n Cloud
   - Workflow → ⋮ → Export
   - Сохранить JSON файл

2. Импорт в новый n8n:
   - Workflows → Add Workflow → Import from File
   - Выбрать JSON файл
   - Сохранить

### 3. Обновить credentials

**Supabase:**
- Старый: `https://prparzgqevfelwsndmkc.supabase.co`
- Новый: `http://postgres:5432` (или через Next.js API)

**Telegram Bot:**
- Credentials → Telegram → Обновить токен (из .env)

**Webhook URL:**
- Старый: `https://daniyal2212.app.n8n.cloud/webhook/...`
- Новый: `https://rct-hub.ru/n8n/webhook/...`

---

## 🔧 НАСТРОЙКА ВОРКФЛОУ

### 1. Заявки с сайта (Order Form)

```
Webhook (POST /rkt-ai)
    ↓
Switch (type: 'order'|'ai_assist'|'telegram')
    ├→ Order: Supabase (insert client_requests)
    │         ↓
    │      Telegram (notify CEO/Зам)
    │
    ├→ AI Assist: HTTP Request (Groq/Gemini/Claude)
    │             ↓
    │          Supabase (insert ai_logs)
    │
    └→ Telegram: Process message
                  ↓
               Supabase (query)
```

### 2. AI Action Button (из CRM)

```
Webhook (POST /ai-assist)
    ↓
Function (подготовка промпта)
    ↓
HTTP Request (AI каскад)
    ├→ Groq (попробовать первым)
    ├→ Gemini (если Groq упал)
    ├→ Claude (если Gemini упал)
    └→ DeepSeek (запасной)
    ↓
Supabase (log ai_logs)
    ↓
Telegram (отправить менеджеру)
    ↓
Respond to Webhook (ответ)
```

### 3. Ежедневный отчёт (cron)

```
Schedule Trigger (каждый день 9:00 MSK)
    ↓
PostgreSQL (query: сделки за вчера)
    ↓
PostgreSQL (query: задачи на сегодня)
    ↓
Function (форматирование отчёта)
    ↓
Telegram (отправить CEO/Зам)
```

---

## 📝 ПРИМЕРЫ ВОРКФЛОУ (JSON)

### 1. Обработка заявок (webhook-rkt-ai.json)

```json
{
  "name": "RKT AI Webhook",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "rkt-ai",
        "responseMode": "responseNode",
        "options": {}
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2,
      "position": [250, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{ $json.body.action }}",
              "value2": "order"
            }
          ]
        }
      },
      "name": "Switch by Action",
      "type": "n8n-nodes-base.switch",
      "typeVersion": 3,
      "position": [450, 300]
    },
    {
      "parameters": {
        "operation": "execute",
        "query": "INSERT INTO client_requests (name, phone, direction, details) VALUES ('{{ $json.body.name }}', '{{ $json.body.phone }}', '{{ $json.body.direction }}', '{{ $json.body.details }}')"
      },
      "name": "Save to DB",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2,
      "position": [650, 200],
      "credentials": {
        "postgres": "RKT PostgreSQL"
      }
    },
    {
      "parameters": {
        "chatId": "={{ $env.TG_CHAT_ID }}",
        "text": "={{ `📝 Новая заявка\\n\\nКлиент: ${$json.body.name}\\nТелефон: ${$json.body.phone}\\nНаправление: ${$json.body.direction}` }}",
        "additionalFields": {}
      },
      "name": "Telegram Notify",
      "type": "n8n-nodes-base.telegram",
      "typeVersion": 1,
      "position": [850, 200],
      "credentials": {
        "telegramApi": "RKT Telegram Bot"
      }
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{ "node": "Switch by Action", "type": "main", "index": 0 }]]
    },
    "Switch by Action": {
      "main": [
        [{ "node": "Save to DB", "type": "main", "index": 0 }],
        [{ "node": "AI Assist", "type": "main", "index": 0 }]
      ]
    },
    "Save to DB": {
      "main": [[{ "node": "Telegram Notify", "type": "main", "index": 0 }]]
    }
  }
}
```

---

## 🔐 CREDENTIALS (настройки подключений)

### 1. PostgreSQL

```
Host: postgres
Port: 5432
Database: rkt_hub
User: rkt_admin
Password: (из .env)
SSL: disabled (локальная сеть)
```

### 2. Telegram Bot

```
Token: (из .env TG_BOT_TOKEN)
Chat ID: (ID чата куда отправлять уведомления)
```

### 3. AI Providers

**Groq:**
```
URL: https://api.groq.com/openai/v1/chat/completions
API Key: (из .env GROQ_API_KEY)
Model: llama-3.1-70b-versatile
```

**Gemini:**
```
URL: https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
API Key: (из .env GEMINI_API_KEY)
```

**Claude:**
```
URL: https://api.anthropic.com/v1/messages
API Key: (из .env CLAUDE_API_KEY)
```

---

## 📊 МОНИТОРИНГ N8N

### Логи

```bash
# В реальном времени
docker compose logs -f n8n

# Последние 100 строк
docker compose logs --tail=100 n8n

# Ошибки
docker compose logs n8n | grep -i error
```

### Статистика

```
n8n → Settings → Usage Statistics
• Executions today
• Executions this month
• Average execution time
• Failed executions
```

### Очистка старых данных

```
n8n → Settings → Pruning Data
• Delete data older than: 168 hours (7 days)
• Enable: true
```

---

## 🆘 ТРАБЛШУТИНГ

### n8n не запускается

```bash
# Проверить логи
docker compose logs n8n

# Проверить память
docker stats rkt-n8n

# Перезапустить
docker compose restart n8n
```

### Воркфлоу не работает

1. Проверить webhook URL (должен быть `https://rct-hub.ru/n8n/webhook/...`)
2. Проверить credentials (PostgreSQL, Telegram)
3. Проверить логи executions (Failed executions)

### Медленные выполнения

1. Включить pruning данных (Settings → Pruning Data)
2. Уменьшить лимит памяти (deploy.resources.limits.memory)
3. Проверить нагрузку на БД (`docker stats`)

---

## 💡 ОПТИМИЗАЦИЯ

### 1. Лимиты памяти (уже в docker-compose.yml)

```yaml
deploy:
  resources:
    limits:
      memory: 1G  # Максимум 1GB RAM
    reservations:
      memory: 512M  # Гарантия 512MB
```

### 2. Очистка старых данных

```
Settings → Pruning Data:
• Execution data: 168 hours (7 days)
• Binary data: 24 hours
```

### 3. Очереди (при большой нагрузке)

```yaml
environment:
  EXECUTIONS_MODE: regular  # Пока без очередей
  # При росте:
  # EXECUTIONS_MODE: queue
  # QUEUE_BULL_REDIS_HOST: redis
```

---

## 📈 МАСШТАБИРОВАНИЕ

### Когда пора выделять n8n на отдельный сервер?

| Метрика | Сейчас | Пора менять |
|---------|--------|-------------|
| Executions/day | до 1000 | >5000 |
| Avg execution time | <5s | >10s |
| RAM usage | <1GB | >3GB |
| Failed executions | <1% | >5% |

### Следующий шаг

1. Выделить n8n на отдельный VPS (2GB RAM)
2. Настроить Redis для очередей
3. Подключить несколько workers

---

**Версия:** 1.0  
**Дата:** 27 февраля 2026
