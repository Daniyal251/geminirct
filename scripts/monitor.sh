#!/bin/bash
# Скрипт мониторинга

echo "📊 RCT Platform — Мониторинг"
echo "=============================="
echo ""

# Статус контейнеров
echo "🐳 Контейнеры:"
docker compose ps
echo ""

# Использование ресурсов
echo "💻 Использование ресурсов:"
docker stats --no-stream
echo ""

# Место на диске
echo "💽 Место на диске:"
df -h
echo ""

# Логи ошибок (последние 10)
echo "❌ Последние ошибки:"
docker compose logs --tail=100 | grep -i error || echo "Ошибок нет"
echo ""

# Статус PostgreSQL
echo "📊 PostgreSQL:"
docker exec rkt-postgres psql -U rkt_admin -d rkt_hub -c "SELECT COUNT(*) as audits FROM ai_audits;" 2>/dev/null || echo "Не доступно"
docker exec rkt-postgres psql -U rkt_admin -d rkt_hub -c "SELECT COUNT(*) as generations FROM ai_generations;" 2>/dev/null || echo "Не доступно"
docker exec rkt-postgres psql -U rkt_admin -d rkt_hub -c "SELECT COUNT(*) as leads FROM ai_leads;" 2>/dev/null || echo "Не доступно"
echo ""

# n8n статус
echo "📋 n8n:"
curl -s https://localhost/n8n/healthz > /dev/null && echo "✅ Работает" || echo "❌ Не работает"
echo ""

# SSL сертификаты
echo "🔒 SSL сертификаты:"
certbot certificates 2>/dev/null || echo "Не доступно"
echo ""
