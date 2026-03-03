#!/bin/bash
# Скрипт установки RCT Platform на VPS

set -e

echo "🚀 Установка RCT Platform..."

# Обновление системы
echo "📦 Обновление системы..."
apt update && apt upgrade -y

# Установка Docker
echo "🐳 Установка Docker..."
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# Установка Docker Compose
echo "📋 Установка Docker Compose..."
apt install docker-compose-plugin -y

# Проверка установки
echo "✅ Проверка установки..."
docker --version
docker compose version

# Создание директорий
echo "📁 Создание директорий..."
mkdir -p /opt/rct-platform
cd /opt/rct-platform

# Копирование файлов (если не через git)
# echo "📋 Копирование файлов..."
# ...

# Клонирование репозитория
echo "📋 Клонирование репозитория..."
git clone https://github.com/Daniyal251/geminirct.git . || true

# Создание .env файла
echo "🔐 Создание .env файла..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️ Отредактируйте .env файл перед запуском!"
    echo "   nano .env"
fi

# Установка SSL сертификатов
echo "🔒 Установка SSL сертификатов..."
apt install certbot -y

# Домены (запрос у пользователя)
read -p "Введите основной домен (например, rct-hub.ru): " DOMAIN
read -p "Введите email для SSL: " EMAIL

# Получение SSL сертификатов
certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN -d aiarchi.ru -d www.aiarchi.ru -d rct-med.ru -d www.rct-med.ru --email $EMAIL --agree-tos --non-interactive

# Копирование SSL сертификатов
mkdir -p nginx/ssl
cp /etc/lets/live/$DOMAIN/fullchain.pem nginx/ssl/
cp /etc/lets/live/$DOMAIN/privkey.pem nginx/ssl/

# Запуск сервисов
echo "🚀 Запуск сервисов..."
docker compose up -d

# Проверка статуса
echo "📊 Статус сервисов..."
docker compose ps

echo ""
echo "✅ Установка завершена!"
echo ""
echo "📍 Адреса:"
echo "   Главный сайт: https://$DOMAIN"
echo "   AI Architect: https://aiarchi.ru"
echo "   Медоборудование: https://rct-med.ru"
echo "   n8n: https://$DOMAIN/n8n/"
echo ""
echo "📝 Логи:"
echo "   docker compose logs -f"
echo ""
echo "🔄 Перезапуск:"
echo "   docker compose restart"
echo ""
