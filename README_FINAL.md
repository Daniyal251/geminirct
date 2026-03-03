# 🎉 RCT PLATFORM — ГОТОВО К ДЕПЛОЮ!

## 📊 ОБЩИЙ ПРОГРЕСС: 100% (100/100%)

```
✅ Этап 0: Структура проекта
✅ Этап 1: AI-пакет (8 провайдеров)
✅ Этап 2: API (8 endpoints)
✅ Этап 3: AI Architect (фронтенд)
✅ Этап 4: RCT HUB (управление AI)
✅ Этап 5: База данных
✅ Этап 6: rct-med.ru
✅ Этап 7: rct-hub.ru (визитка)
✅ Этап 8: n8n (автоматизация)
✅ Этап 9: Деплой на VPS
```

---

## 🚀 БЫСТРЫЙ СТАРТ

### 1. Установка на VPS

```bash
# Подключение к VPS
ssh root@your-vps-ip

# Переход в директорию
cd /opt

# Клонирование
git clone https://github.com/Daniyal251/geminirct.git rct-platform
cd rct-platform

# Запуск установки
chmod +x scripts/install.sh
./scripts/install.sh
```

### 2. Настройка .env

```bash
nano .env
```

**Заполнить переменные:**
```env
# База данных
DB_PASSWORD=your_secure_password

# AI Providers
GROQ_API_KEY=gsk_...
GEMINI_API_KEY=AIza...
CLAUDE_API_KEY=sk-ant-...
GIGACHAT_API_KEY=...

# Telegram
TG_BOT_TOKEN=...
TG_CHAT_ID=...

# Домены
DOMAIN=rct-hub.ru
```

### 3. Запуск

```bash
docker compose up -d
```

### 4. Проверка

```bash
docker compose ps
```

---

## 📍 АДРЕСА

| Сервис | URL |
|--------|-----|
| **Главный сайт** | https://rct-hub.ru |
| **AI Architect** | https://aiarchi.ru |
| **Медоборудование** | https://rct-med.ru |
| **n8n (админка)** | https://rct-hub.ru/n8n/ |

---

## 📊 МОНИТОРИНГ

### Статус сервисов

```bash
docker compose ps
```

### Логи

```bash
# Все логи
docker compose logs -f

# Конкретный сервис
docker compose logs -f nextjs
```

### Бэкап

```bash
# Ручной бэкап
./scripts/backup.sh

# Автоматический (cron)
crontab -e
0 3 * * * /opt/rct-platform/scripts/backup.sh
```

### Мониторинг

```bash
./scripts/monitor.sh
```

---

## 💰 СТОИМОСТЬ

| Компонент | Цена |
|-----------|------|
| VPS (4GB RAM, 2 ядра, 64GB SSD) | ~500₽/мес |
| 3 домена (.ru) | ~600₽/год |
| SSL (Let's Encrypt) | Бесплатно |
| **ИТОГО** | **~550₽/мес** |

**Экономия vs облака:** 6,500₽ → 550₽/мес (в 12 раз дешевле!)

---

## 📁 СТРУКТУРА ПРОЕКТА

```
geminirct/
├── apps/
│   ├── main/           # rct-hub.ru
│   ├── med/            # rct-med.ru
│   └── ai-architect/   # aiarchi.ru
├── packages/
│   ├── ai/             # AI-пакет (8 провайдеров)
│   └── db/             # БД функции
├── database/
│   └── ai_architect_tables.sql
├── n8n/workflows/      # 4 воркфлоу
├── nginx/
│   └── nginx.conf
├── scripts/
│   ├── install.sh
│   ├── backup.sh
│   └── monitor.sh
├── docker-compose.yml
└── .env.example
```

---

## 🎯 ФУНКЦИОНАЛ

### AI Architect (aiarchi.ru)
- 🔍 AI-аудит сайтов
- ✨ AI-генерация сайтов
- 📋 Заявки на разработку
- 👤 Личный кабинет

### RCT HUB (rct-hub.ru/hub)
- 📊 Управление аудитами
- ✨ Управление генерациями
- 📋 Управление заявками
- ⚙️ Настройки AI

### rct-med.ru
- 🏥 Визитка медоборудования
- 📋 Форма заявки
- 📞 Контакты

### n8n (Автоматизация)
- 📝 Заявки с сайта → БД → Telegram
- 🔍 AI-аудит через GigaChat
- ✨ AI-генерация через Claude
- 💬 Telegram-бот с AI

---

## 📞 ПОДДЕРЖКА

### Логи

```bash
# Ошибки
docker compose logs | grep -i error

# Последние 100 строк
docker compose logs --tail=100
```

### Перезапуск

```bash
# Все сервисы
docker compose restart

# Конкретный сервис
docker compose restart nextjs
```

### Обновление

```bash
git pull
docker compose up -d --build
```

---

## ✅ ГОТОВО К ПРОДАКШЕНУ!

**Дата:** 27 февраля 2026  
**Статус:** ✅ 100% ГОТОВО  
**Прогресс:** 100/100 этапов

🚀 **МОЖНО ДЕПЛОИТЬ!**
