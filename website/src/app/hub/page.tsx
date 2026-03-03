'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function HubDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('rkt_user')
    if (!userData) {
      router.push('/hub/login')
      return
    }
    setUser(JSON.parse(userData))
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
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-bg2 border-r border-border p-6">
        <div className="mb-8">
          <h1 className="font-display text-xl font-black gradient-text">RKT HUB</h1>
          <p className="text-xs text-text2 mt-1">v14 · Управление проектами</p>
        </div>

        <nav className="space-y-2">
          <NavItem icon="📊" label="Проекты" href="/hub" active />
          <NavItem icon="✅" label="Задачи" href="/hub/tasks" />
          <NavItem icon="👥" label="Сотрудники" href="/hub/staff" />
          <NavItem icon="🤝" label="Партнёры" href="/hub/partners" />
          <NavItem icon="💬" label="Коммуникации" href="/hub/comms" />
          <NavItem icon="🛡️" label="Админ-панель" href="/hub/admin" />
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-accent to-blue flex items-center justify-center text-bg font-bold">
              {user?.name?.charAt(0) || '👤'}
            </div>
            <div>
              <div className="text-sm font-bold">{user?.name || 'Пользователь'}</div>
              <div className="text-xs text-text2">{user?.role || 'Сотрудник'}</div>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('rkt_user')
              router.push('/hub/login')
            }}
            className="w-full bg-red/10 text-red py-2 rounded-lg text-sm font-bold hover:bg-red hover:text-white transition-colors"
          >
            🚪 Выйти
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-black mb-2">
            👋 Добро пожаловать, {user?.name || 'Пользователь'}!
          </h1>
          <p className="text-text2">Система управления проектами RCT</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard emoji="📦" label="Проекты" value="0" color="from-accent to-accent2" />
          <StatCard emoji="✅" label="Задачи" value="0" color="from-blue to-blue" />
          <StatCard emoji="👥" label="Сотрудники" value="0" color="from-purple to-purple" />
          <StatCard emoji="🤝" label="Партнёры" value="0" color="from-orange to-orange" />
        </div>

        {/* Info */}
        <div className="bg-bg2 border border-border rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="font-display text-xl font-bold mb-2">В разработке</h2>
          <p className="text-text2 mb-6">
            Полная версия админ-панели будет доступна скоро
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/" className="btn-secondary inline-block">
              🏠 На главный сайт
            </Link>
            <a href="https://t.me/AIhroject_bot" target="_blank" className="btn-primary inline-block">
              💬 Сообщить об ошибке
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}

function NavItem({ icon, label, href, active }: { icon: string; label: string; href: string; active?: boolean }) {
  return (
    <a
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
        active ? 'bg-accent-glow text-accent' : 'text-text2 hover:bg-bg3 hover:text-text'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </a>
  )
}

function StatCard({ emoji, label, value, color }: { emoji: string; label: string; value: string; color: string }) {
  return (
    <div className="bg-bg2 border border-border rounded-xl p-5 relative overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${color}`}></div>
      <div className="text-2xl mb-2">{emoji}</div>
      <div className="font-display text-2xl font-black mb-1">{value}</div>
      <div className="text-xs text-text2 uppercase">{label}</div>
    </div>
  )
}
