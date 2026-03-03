# RCT Platform — Инструкция по интеграции

## 📊 Архитектура

```
3 домена на одном сервере:
├── rct-hub.ru      — Главная компания + порталы
├── rct-med.ru      — Медоборудование
└── aiarchi.ru      — AI Architect (готовый проект)
```

---

## 🚀 БЫСТРЫЙ СТАРТ

### 1. Установка зависимостей

```bash
cd c:\Users\wuqqr\Desktop\РКТ\geminirct
npm install
```

### 2. Запуск (локальная разработка)

```bash
# Все 3 приложения одновременно
npm run dev

# Или по отдельности:
npm run dev:main       # rct-hub.ru:3000
npm run dev:med        # rct-med.ru:3001
npm run dev:ai         # aiarchi.ru:3002
```

### 3. Проверка

- **rct-hub.ru** → http://localhost:3000
- **rct-med.ru** → http://localhost:3001
- **aiarchi.ru** → http://localhost:3002

---

## 📁 СТРУКТУРА ПРОЕКТА

```
geminirct/
├── apps/
│   ├── main/              # rct-hub.ru
│   │   ├── src/
│   │   │   └── app/
│   │   │       ├── page.tsx
│   │   │       └── ...
│   │   └── package.json
│   │
│   ├── med/               # rct-med.ru
│   │   ├── src/
│   │   │   └── app/
│   │   └── package.json
│   │
│   └── ai-architect/      # aiarchi.ru
│       ├── src/
│       │   └── app/
│       └── package.json
│
├── packages/
│   ├── ui/                # UI компоненты
│   ├── lib/               # Утилиты
│   ├── db/                # База данных
│   └── ai/                # AI-каскад
│
├── docker/
│   └── docker-compose.yml
│
└── nginx/
    └── nginx.conf         # 3 домена
```

---

## 🔧 DOCKER (VPS)

### Запуск всех сервисов

```bash
docker compose up -d
```

### Сервисы:

| Сервис | Порт | Описание |
|--------|------|----------|
| **nextjs** | 3000 | Next.js (3 сайта) |
| **postgres** | 5432 | PostgreSQL |
| **n8n** | 5678 | n8n (автоматизация) |
| **nginx** | 80, 443 | Reverse proxy |

---

## 🌐 НАСТРОЙКА ДОМЕНОВ

### 1. DNS записи

```
A   rct-hub.ru      →  IP вашего VPS
A   www.rct-hub.ru  →  IP вашего VPS

A   rct-med.ru      →  IP вашего VPS
A   www.rct-med.ru  →  IP вашего VPS

A   aiarchi.ru      →  IP вашего VPS
A   www.aiarchi.ru  →  IP вашего VPS
```

### 2. SSL сертификаты (Let's Encrypt)

```bash
# rct-hub.ru
certbot certonly --standalone -d rct-hub.ru -d www.rct-hub.ru

# rct-med.ru
certbot certonly --standalone -d rct-med.ru -d www.rct-med.ru

# aiarchi.ru
certbot certonly --standalone -d aiarchi.ru -d www.aiarchi.ru
```

### 3. Копирование сертификатов

```bash
mkdir -p /opt/geminirct/nginx/ssl/rct-hub.ru
mkdir -p /opt/geminirct/nginx/ssl/rct-med.ru
mkdir -p /opt/geminirct/nginx/ssl/aiarchi.ru

cp /etc/lets/live/rct-hub.ru/fullchain.pem /opt/geminirct/nginx/ssl/rct-hub.ru/
cp /etc/lets/live/rct-hub.ru/privkey.pem /opt/geminirct/nginx/ssl/rct-hub.ru/

cp /etc/lets/live/rct-med.ru/fullchain.pem /opt/geminirct/nginx/ssl/rct-med.ru/
cp /etc/lets/live/rct-med.ru/privkey.pem /opt/geminirct/nginx/ssl/rct-med.ru/

cp /etc/lets/live/aiarchi.ru/fullchain.pem /opt/geminirct/nginx/ssl/aiarchi.ru/
cp /etc/lets/live/aiarchi.ru/privkey.pem /opt/geminirct/nginx/ssl/aiarchi.ru/
```

---

## 💰 СТОИМОСТЬ

| Компонент | Цена |
|-----------|------|
| VPS (4GB RAM) | 500₽/мес |
| 3 домена | 600₽/год |
| 3 SSL (Let's Encrypt) | Бесплатно |
| **ИТОГО** | **~550₽/мес** |

---

## 📞 ПОДДЕРЖКА

- Логи: `docker compose logs -f`
- Статус: `docker compose ps`
- Бэкапы: `/opt/geminirct/backups/`

---

**Версия:** 1.0  
**Дата:** 27 февраля 2026
