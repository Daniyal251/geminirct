'use client'

import Link from 'next/link'

export default function AIArchitectDashboard() {
  // Заглушки данных (будут из API)
  const stats = {
    auditsToday: 12,
    generationsToday: 5,
    leadsToday: 3,
    revenueToday: '25 000₽',
    auditsTotal: 156,
    generationsTotal: 89,
    leadsTotal: 34,
    revenueTotal: '1 250 000₽'
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            🤖 AI Architect — Управление
          </h1>
          <p className="text-xl text-gray-600">
            Панель управления AI-аудитами и генерациями
          </p>
        </div>

        {/* Статистика за сегодня */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Аудитов сегодня"
            value={stats.auditsToday}
            icon="🔍"
            color="text-blue-600"
            bgColor="bg-blue-100"
          />
          <StatCard
            label="Генераций сегодня"
            value={stats.generationsToday}
            icon="✨"
            color="text-purple-600"
            bgColor="bg-purple-100"
          />
          <StatCard
            label="Заявок сегодня"
            value={stats.leadsToday}
            icon="📋"
            color="text-green-600"
            bgColor="bg-green-100"
          />
          <StatCard
            label="Доход сегодня"
            value={stats.revenueToday}
            icon="💰"
            color="text-yellow-600"
            bgColor="bg-yellow-100"
          />
        </div>

        {/* Статистика всего */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Всего аудитов"
            value={stats.auditsTotal}
            icon="🔍"
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <StatCard
            label="Всего генераций"
            value={stats.generationsTotal}
            icon="✨"
            color="text-purple-600"
            bgColor="bg-purple-50"
          />
          <StatCard
            label="Всего заявок"
            value={stats.leadsTotal}
            icon="📋"
            color="text-green-600"
            bgColor="bg-green-50"
          />
          <StatCard
            label="Всего доход"
            value={stats.revenueTotal}
            icon="💰"
            color="text-yellow-600"
            bgColor="bg-yellow-50"
          />
        </div>

        {/* Навигация */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Link
            href="/hub/ai-architect/audits"
            className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Аудиты</h3>
            <p className="text-gray-600">Все AI-аудиты сайтов</p>
          </Link>

          <Link
            href="/hub/ai-architect/generations"
            className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-bold mb-2">Генерации</h3>
            <p className="text-gray-600">Все AI-генерации сайтов</p>
          </Link>

          <Link
            href="/hub/ai-architect/leads"
            className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-bold mb-2">Заявки</h3>
            <p className="text-gray-600">Заявки на разработку</p>
          </Link>

          <Link
            href="/hub/ai-architect/settings"
            className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-xl font-bold mb-2">Настройки</h3>
            <p className="text-gray-600">AI провайдеры, лимиты</p>
          </Link>
        </div>

        {/* Последние аудиты */}
        <div className="bg-white rounded-lg p-6 shadow-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Последние аудиты</h2>
            <Link href="/hub/ai-architect/audits" className="text-purple-600 hover:underline">
              Все →
            </Link>
          </div>
          
          <div className="space-y-4">
            <AuditRow url="mysite.ru" score={65} date="Сегодня, 14:30" />
            <AuditRow url="shop-example.ru" score={45} date="Сегодня, 12:15" />
            <AuditRow url="new-client.ru" score={80} date="Сегодня, 10:00" />
          </div>
        </div>

        {/* Последние генерации */}
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Последние генерации</h2>
            <Link href="/hub/ai-architect/generations" className="text-purple-600 hover:underline">
              Все →
            </Link>
          </div>
          
          <div className="space-y-4">
            <GenerationRow type="Лендинг" desc="Сайт для стоматологии..." status="ready" date="Сегодня" />
            <GenerationRow type="Бизнес" desc="Корпоративный сайт..." status="processing" date="Вчера" />
          </div>
        </div>
      </div>
    </main>
  )
}

function StatCard({ label, value, icon, color, bgColor }: any) {
  return (
    <div className={`${bgColor} rounded-lg p-6`}>
      <div className="text-4xl mb-2">{icon}</div>
      <div className={`text-3xl font-black ${color} mb-1`}>{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  )
}

function AuditRow({ url, score, date }: any) {
  const scoreColor = score >= 80 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600'
  
  return (
    <div className="flex justify-between items-center border-b pb-4 last:border-0">
      <div>
        <div className="font-bold">{url}</div>
        <div className="text-sm text-gray-600">{date}</div>
      </div>
      <div className={`text-xl font-bold ${scoreColor}`}>
        {score}/100
      </div>
    </div>
  )
}

function GenerationRow({ type, desc, status, date }: any) {
  const statusColor = status === 'ready' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
  const statusLabel = status === 'ready' ? 'Готово' : 'В работе'
  
  return (
    <div className="flex justify-between items-center border-b pb-4 last:border-0">
      <div>
        <div className="font-bold">{type}</div>
        <div className="text-sm text-gray-600">{desc}</div>
      </div>
      <div className="text-right">
        <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>
          {statusLabel}
        </div>
        <div className="text-sm text-gray-600 mt-1">{date}</div>
      </div>
    </div>
  )
}
