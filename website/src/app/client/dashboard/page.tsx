'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ClientDashboard() {
  const router = useRouter()
  const [client, setClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('rkt_client')
    if (!userData) {
      router.push('/client/login')
      return
    }
    setClient(JSON.parse(userData))
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">⏳</div>
          <p className="text-text2">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Topbar */}
      <header className="bg-bg2 border-b border-border sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-accent">RKT HUB</span>
            <span className="text-sm text-text2">Личный кабинет</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm text-text2 hover:text-text transition-colors">
              🔔 <span className="text-xs bg-red text-bg px-1.5 rounded">0</span>
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('rkt_client')
                router.push('/client/login')
              }}
              className="text-sm text-text2 hover:text-text transition-colors"
            >
              Выход
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-bg2 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 flex gap-1 overflow-x-auto">
          <NavItem label="📊 Главная" active />
          <NavItem label="📁 Проекты" />
          <NavItem label="📋 Заявки" />
          <NavItem label="🤖 ИИ-помощник" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-black mb-2">
            Добро пожаловать, {client?.name || 'Клиент'}!
          </h1>
          <p className="text-text2 text-sm">
            Здесь вы видите свои проекты и заявки
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard emoji="📦" label="Проектов" value="0" color="text-blue" />
          <StatCard emoji="✅" label="Активных" value="0" color="text-green" />
          <StatCard emoji="📋" label="Заявок" value="0" color="text-purple" />
          <StatCard emoji="⏳" label="Открытых" value="0" color="text-orange" />
        </div>

        {/* Empty State */}
        <div className="bg-bg2 border border-border rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="font-display text-xl font-bold mb-2">Нет проектов</h2>
          <p className="text-text2 mb-6 max-w-md mx-auto">
            Проекты появятся здесь после того, как менеджер обработает вашу заявку
          </p>
          <Link
            href="/order"
            className="inline-block bg-accent text-bg px-6 py-3 rounded-lg font-bold hover:bg-white transition-colors"
          >
            🚀 Оставить заявку
          </Link>
        </div>

        {/* AI Assistant CTA */}
        <div className="mt-8 bg-gradient-to-r from-purple/10 to-blue/10 border border-purple/20 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="font-display text-lg font-bold mb-2">ИИ-помощник</h3>
          <p className="text-text2 text-sm mb-4">
            Поможет составить ТЗ, рассчитать стоимость, ответить на вопросы
          </p>
          <button className="bg-purple text-bg px-6 py-3 rounded-lg font-bold hover:bg-purple/80 transition-colors">
              💬 Задать вопрос
          </button>
        </div>
      </main>
    </div>
  )
}

function NavItem({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
        active
          ? 'border-accent text-accent'
          : 'border-transparent text-text2 hover:text-text'
      }`}
    >
      {label}
    </button>
  )
}

function StatCard({ emoji, label, value, color }: { emoji: string; label: string; value: string; color: string }) {
  return (
    <div className="bg-bg3 border border-border rounded-xl p-5 text-center">
      <div className="text-2xl mb-2">{emoji}</div>
      <div className={`font-display text-2xl font-black ${color} mb-1`}>{value}</div>
      <div className="text-xs text-text2 uppercase">{label}</div>
    </div>
  )
}
