# RCT Platform — Единая экосистема

## 📊 Архитектура

```
geminirct/
├── apps/
│   ├── main/           # rct-hub.ru (главный сайт + порталы)
│   ├── med/            # rct-med.ru (медоборудование)
│   └── ai-architect/   # ai-architect.ru (AI продукт)
├── packages/
│   ├── ui/             # UI компоненты (общие)
│   ├── lib/            # Утилиты (общие)
│   ├── db/             # База данных (общая)
│   └── ai/             # AI-каскад (общий)
└── docker/
    └── docker-compose.yml
```

## 🚀 Быстрый старт

### Установка

```bash
npm install
```

### Запуск (все 3 приложения)

```bash
npm run dev
```

### Запуск по отдельности

```bash
# Главный сайт (rct-hub.ru)
npm run dev:main

# Медоборудование (rct-med.ru)
npm run dev:med

# AI Architect (ai-architect.ru)
npm run dev:ai
```

## 📁 Приложения

| Приложение | Домен | Порт | Описание |
|------------|-------|------|----------|
| **main** | rct-hub.ru | 3000 | Главная компания + порталы |
| **med** | rct-med.ru | 3001 | Медоборудование |
| **ai-architect** | ai-architect.ru | 3002 | AI-аудит + генерация |

## 📦 Пакеты

| Пакет | Описание |
|-------|----------|
| **ui** | UI компоненты (Button, Card, Modal, etc.) |
| **lib** | Утилиты (utils, config, constants) |
| **db** | База данных (схема, миграции) |
| **ai** | AI-каскад (Groq, Gemini, Claude, DeepSeek) |

## 🏗 Деплой

```bash
# Сборка всех приложений
npm run build

# Деплой на VPS
docker compose up -d
```

## 📋 Структура БД

```
PostgreSQL (общая для всех)
├── staff (сотрудники)
├── directions (сделки)
├── tasks (задачи)
├── ai_audits (AI-аудиты)
├── ai_generations (AI-генерации)
└── ...
```

---

**Версия:** 1.0  
**Дата:** 27 февраля 2026
