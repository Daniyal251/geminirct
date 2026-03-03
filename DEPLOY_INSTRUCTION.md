# 🚀 ИНСТРУКЦИЯ ПО ДЕПЛОЮ НА REG.RU VPS

## 📋 ТРЕБОВАНИЯ

- VPS на Reg.ru (Ubuntu 22.04)
- 3 домена pointing на IP VPS:
  - rct-hub.ru → IP VPS
  - www.rct-hub.ru → IP VPS
  - aiarchi.ru → IP VPS
  - www.aiarchi.ru → IP VPS
  - rct-med.ru → IP VPS
  - www.rct-med.ru → IP VPS

---

## 🎯 НАСТРОЙКА DNS (Reg.ru)

### 1. Зайти в панель Reg.ru

```
https://www.reg.ru/domains/my_domains/
```

### 2. Для каждого домена создать A-записи

**rct-hub.ru:**
```
Тип: A
Имя поддомена: @
IP-адрес: XXX.XXX.XXX.XXX (ваш VPS)

Тип: A
Имя поддомена: www
IP-адрес: XXX.XXX.XXX.XXX
```

**aiarchi.ru:**
```
Тип: A
Имя поддомена: @
IP-адрес: XXX.XXX.XXX.XXX

Тип: A
Имя поддомена: www
IP-адрес: XXX.XXX.XXX.XXX
```

**rct-med.ru:**
```
Тип: A
Имя поддомена: @
IP-адрес: XXX.XXX.XXX.XXX

Тип: A
Имя поддомена: www
IP-адрес: XXX.XXX.XXX.XXX
```

### 3. Подождать propagation (5-30 минут)

Проверить:
```bash
ping rct-hub.ru
ping aiarchi.ru
ping rct-med.ru
```

---

## 🚀 УСТАНОВКА НА VPS

### 1. Подключение к VPS

```bash
ssh root@XXX.XXX.XXX.XXX
```

### 2. Обновление системы

```bash
apt update && apt upgrade -y
```

### 3. Установка Docker

```bash
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker
```

### 4. Установка Docker Compose

```bash
apt install docker-compose-plugin -y
```

### 5. Клонирование проекта

```bash
cd /opt
git clone https://github.com/Daniyal251/geminirct.git rct-platform
cd rct-platform
```

### 6. Настройка .env

```bash
cp .env.example .env
nano .env
```

**Заполнить переменные:**
```env
# База данных
DB_USER=rkt_admin
DB_PASSWORD=SecurePassword123!

# AI Providers (получить ключи)
GROQ_API_KEY=gsk_...
GEMINI_API_KEY=AIza...
CLAUDE_API_KEY=sk-ant-...
GIGACHAT_API_KEY=...

# Telegram
TG_BOT_TOKEN=1234567890:ABCdef...
TG_CHAT_ID=-1001234567890

# N8N
N8N_USER=admin
N8N_PASSWORD=SecureN8NPassword!

# Домены
DOMAIN=rct-hub.ru
DOMAIN_AI=aiarchi.ru
DOMAIN_MED=rct-med.ru
```

### 7. Установка SSL сертификатов

```bash
apt install certbot -y

# Получить сертификаты для всех доменов
certbot certonly --standalone \
  -d rct-hub.ru -d www.rct-hub.ru \
  -d aiarchi.ru -d www.aiarchi.ru \
  -d rct-med.ru -d www.rct-med.ru \
  --email your@email.com \
  --agree-tos \
  --non-interactive
```

### 8. Копирование SSL сертификатов

```bash
mkdir -p nginx/ssl/rct-hub.ru
mkdir -p nginx/ssl/aiarchi.ru
mkdir -p nginx/ssl/rct-med.ru

# Копировать сертификаты
cp /etc/lets/live/rct-hub.ru/fullchain.pem nginx/ssl/rct-hub.ru/
cp /etc/lets/live/rct-hub.ru/privkey.pem nginx/ssl/rct-hub.ru/

cp /etc/lets/live/aiarchi.ru/fullchain.pem nginx/ssl/aiarchi.ru/
cp /etc/lets/live/aiarchi.ru/privkey.pem nginx/ssl/aiarchi.ru/

cp /etc/lets/live/rct-med.ru/fullchain.pem nginx/ssl/rct-med.ru/
cp /etc/lets/live/rct-med.ru/privkey.pem nginx/ssl/rct-med.ru/
```

### 9. Установка зависимостей

```bash
npm install
```

### 10. Запуск сервисов

```bash
docker compose up -d
```

### 11. Проверка статуса

```bash
docker compose ps
```

---

## ✅ ПРОВЕРКА РАБОТЫ

### 1. Проверить сайты

```
https://rct-hub.ru      — Главный сайт
https://aiarchi.ru      — AI Architect
https://rct-med.ru      — Медоборудование
https://rct-hub.ru/n8n/ — n8n админка
```

### 2. Проверить логи

```bash
# Все логи
docker compose logs -f

# Конкретный сервис
docker compose logs -f nextjs
docker compose logs -f nginx
```

### 3. Проверить БД

```bash
docker exec -it rkt-postgres psql -U rkt_admin -d rkt_hub -c "\dt"
```

---

## 🔧 УПРАВЛЕНИЕ

### Перезапуск

```bash
# Все сервисы
docker compose restart

# Конкретный сервис
docker compose restart nextjs
docker compose restart nginx
```

### Обновление

```bash
git pull
docker compose up -d --build
```

### Бэкап

```bash
./scripts/backup.sh
```

### Мониторинг

```bash
./scripts/monitor.sh
```

---

## 📊 АДРЕСА

| Сервис | URL |
|--------|-----|
| **Главный сайт** | https://rct-hub.ru |
| **AI Architect** | https://aiarchi.ru |
| **Медоборудование** | https://rct-med.ru |
| **n8n (админка)** | https://rct-hub.ru/n8n/ |
| **Клиентский портал** | https://rct-hub.ru/client/login |
| **Админка сотрудников** | https://rct-hub.ru/hub/login |

---

## 💰 СТОИМОСТЬ (Reg.ru)

| Компонент | Цена |
|-----------|------|
| VPS (4GB RAM, 2 ядра, 64GB) | ~500₽/мес |
| 3 домена (.ru) | ~600₽/год |
| SSL (Let's Encrypt) | Бесплатно |
| **ИТОГО** | **~550₽/мес** |

---

## 🆘 ТРАБЛШУТИНГ

### Сайты не открываются

```bash
# Проверить DNS
ping rct-hub.ru

# Проверить статус
docker compose ps

# Проверить логи
docker compose logs nginx
```

### SSL ошибка

```bash
# Проверить сертификаты
ls -la nginx/ssl/

# Обновить сертификаты
certbot renew
```

### БД не подключается

```bash
# Проверить статус БД
docker compose ps postgres

# Проверить логи
docker compose logs postgres
```

---

## 📞 ПОДДЕРЖКА

### Логи

```bash
# Ошибки
docker compose logs | grep -i error

# Последние 100 строк
docker compose logs --tail=100
```

### Статус

```bash
docker compose ps
```

### Перезапуск

```bash
docker compose restart
```

---

**Готово!** Все 3 сайта работают на одном сервере Reg.ru с разными доменами! 🎉
