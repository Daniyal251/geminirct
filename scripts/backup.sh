#!/bin/bash
# Скрипт ежедневного бэкапа

set -e

DATE=$(date +%F)
BACKUP_DIR="/opt/rct-platform/backups"
RETENTION_DAYS=30

echo "💾 Начало бэкапа ($DATE)..."

# Создание директории
mkdir -p $BACKUP_DIR

# Бэкап PostgreSQL
echo "📊 Бэкап базы данных..."
docker exec rkt-postgres pg_dump -U rkt_admin rkt_hub > $BACKUP_DIR/db_$DATE.sql

# Бэкап n8n данных
echo "📋 Бэкап n8n..."
docker run --rm -v n8n_data:/data -v $BACKUP_DIR:/backup alpine \
  tar -czf /backup/n8n_$DATE.tar.gz /data

# Бэкап .env файла
echo "🔐 Бэкап конфигурации..."
cp /opt/rct-platform/.env $BACKUP_DIR/env_$DATE

# Удаление старых бэкапов
echo "🗑 Удаление старых бэкапов..."
find $BACKUP_DIR -name "*.sql" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "env_*" -mtime +$RETENTION_DAYS -delete

# Сжатие SQL бэкапа
echo "📦 Сжатие бэкапов..."
gzip $BACKUP_DIR/db_$DATE.sql

echo "✅ Бэкап заверён!"
echo "📁 Путь: $BACKUP_DIR"
echo "📊 Размер:"
du -sh $BACKUP_DIR

# Логирование
echo "$DATE - Backup completed" >> $BACKUP_DIR/backup.log
