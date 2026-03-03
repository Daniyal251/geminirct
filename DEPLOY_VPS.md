# RKT HUB — БЫСТРЫЙ СТАРТ НА VPS

## 📋 ТРЕБОВАНИЯ

- VPS: 2 ядра, 4GB RAM, 64GB SSD (Ubuntu 22.04)
- Домен: rct-hub.ru (DNS направлен на VPS)
- Docker + Docker Compose

---

## 🚀 УСТАНОВКА (5 минут)

### 1. Подключение к VPS

```bash
ssh root@your-vps-ip
```

### 2. Установка Docker

```bash
# Обновление
apt update && apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# Установка Docker Compose
apt install docker-compose-plugin -y

# Проверка
docker --version
docker compose version
```

### 3. Загрузка проекта

```bash
# Клонирование репозитория
cd /opt
git clone https://github.com/your-username/geminirct.git
cd geminirct

# Копирование .env
cp .env.example .env
nano .env  # Заполните паролями!
```

### 4. SSL сертификаты (Let's Encrypt)

```bash
# Установка Certbot
apt install certbot -y

# Получение сертификатов
certbot certonly --standalone -d rct-hub.ru -d www.rct-hub.ru \
  --email admin@rct-hub.ru --agree-tos --non-interactive

# Копирование в nginx
mkdir -p nginx/ssl
cp /etc/lets/live/rct-hub.ru/fullchain.pem nginx/ssl/
cp /etc/lets/live/rct-hub.ru/privkey.pem nginx/ssl/
```

### 5. Запуск всех сервисов

```bash
# Запуск
docker compose up -d

# Проверка
docker compose ps

# Логи
docker compose logs -f
```

---

## 📊 ПРОВЕРКА РАБОТОСПОСОБНОСТИ

### 1. Сайт открыт

```
https://rct-hub.ru
```

### 2. n8n доступен

```
https://rct-hub.ru/n8n/
Логин: admin
Пароль: YourN8NPassword456!
```

### 3. База данных

```bash
# Подключение
docker exec -it rkt-postgres psql -U rkt_admin -d rkt_hub

# Проверка таблиц
\dt

# Выход
\q
```

### 4. PgAdmin (если нужен)

```
http://your-vps-ip:5050
Логин: admin@rct-hub.ru
Пароль: YourPgAdminPassword789!
```

---

## 🔧 УПРАВЛЕНИЕ

### Перезапуск

```bash
# Все сервисы
docker compose restart

# Конкретный сервис
docker compose restart nextjs
docker compose restart postgres
docker compose restart n8n
```

### Остановка

```bash
docker compose down
```

### Обновление

```bash
# Обновление кода
git pull

# Пересборка
docker compose up -d --build
```

### Логи

```bash
# Все логи
docker compose logs -f

# Конкретный сервис
docker compose logs -f nextjs
docker compose logs -f postgres
```

---

## 💾 БЭКАПЫ

### Скрипт бэкапа

```bash
# Создать файл
nano /usr/local/bin/backup-rkt.sh
```

```bash
#!/bin/bash
DATE=$(date +%F)
BACKUP_DIR="/opt/geminirct/backups"

# Бэкап БД
docker exec rkt-postgres pg_dump -U rkt_admin rkt_hub > $BACKUP_DIR/db_$DATE.sql

# Бэкап n8n
docker run --rm -v n8n_data:/data -v $BACKUP_DIR:/backup alpine \
  tar -czf /backup/n8n_$DATE.tar.gz /data

# Удалить старые бэкапы (>30 дней)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

```bash
# Сделать исполняемым
chmod +x /usr/local/bin/backup-rkt.sh

# Добавить в cron (ежедневно в 3:00)
crontab -e
0 3 * * * /usr/local/bin/backup-rkt.sh >> /var/log/rkt-backup.log 2>&1
```

### Восстановление из бэкапа

```bash
# БД
docker exec -i rkt-postgres psql -U rkt_admin -d rkt_hub < backups/db_2024-01-15.sql

# n8n
docker run --rm -v n8n_data:/data -v /opt/geminirct/backups:/backup alpine \
  tar -xzf /backup/n8n_2024-01-15.tar.gz -C /
```

---

## 🔐 БЕЗОПАСНОСТЬ

### Firewall (UFW)

```bash
# Установка
apt install ufw -y

# Разрешить SSH, HTTP, HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Включить
ufw enable
ufw status
```

### Обновление безопасности

```bash
# Автоматические обновления
apt install unattended-upgrades -y
dpkg-reconfigure --priority=low unattended-upgrades
```

### Мониторинг

```bash
# Установить htop
apt install htop -y

# Проверка использования ресурсов
docker stats

# Проверка места на диске
df -h
docker system df
```

---

## 📈 МАСШТАБИРОВАНИЕ

### Когда пора менять тариф?

| Метрика | Сейчас | Пора менять |
|---------|--------|-------------|
| RAM | 4GB | >80% постоянно |
| CPU | 2 ядра | >70% постоянно |
| Диск | 64GB | >80% заполнено |
| Пользователей | до 1000 | >1000 MAU |

### Следующий тариф

- 4 ядра, 8GB RAM, 128GB SSD (~1000₽/мес)
- Выделенный сервер для БД
- Репликация БД

---

## 🆘 ТРАБЛШУТИНГ

### Сайт не открывается

```bash
# Проверить статус
docker compose ps

# Проверить логи
docker compose logs nextjs
docker compose logs nginx

# Проверить порты
netstat -tlnp | grep :80
netstat -tlnp | grep :443
```

### База данных не подключается

```bash
# Проверить статус
docker compose ps postgres

# Проверить логи
docker compose logs postgres

# Перезапустить
docker compose restart postgres
```

### n8n не работает

```bash
# Проверить логи
docker compose logs n8n

# Проверить вебхуки
curl https://rct-hub.ru/api/webhook/test
```

### Мало места на диске

```bash
# Очистить старые образы
docker system prune -a

# Очистить логи
docker compose logs --tail=100
```

---

## 💰 СТОИМОСТЬ

| Компонент | Цена |
|-----------|------|
| VPS (4GB RAM) | ~500₽/мес |
| Домен | ~200₽/год |
| SSL (Let's Encrypt) | Бесплатно |
| **ИТОГО** | **~520₽/мес** |

**Экономия vs Supabase + n8n Cloud:** $25/мес → 520₽/мес (в 4 раза дешевле!)

---

## 📞 ПОДДЕРЖКА

- Логи: `docker compose logs -f`
- Статус: `docker compose ps`
- Бэкапы: `/opt/geminirct/backups/`
- Конфиги: `/opt/geminirct/.env`

---

**Версия:** 1.0  
**Дата:** 27 февраля 2026  
**Статус:** Готово к продакшену
