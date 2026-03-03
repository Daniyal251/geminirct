'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProjectsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Проверяем авторизацию
    const userData = localStorage.getItem('rkt_user')
    if (!userData) {
      router.push('/login')
      return
    }
    
    setUser(JSON.parse(userData))
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-text2">Загрузка проектов...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black flex items-center gap-3">
          📊 Проекты
        </h1>
        <p className="text-text2 mt-1">
          Добро пожаловать, {user?.name || 'Пользователь'}!
        </p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          emoji="📦"
          label="Всего проектов"
          value={0}
          color="from-accent to-accent2"
        />
        <StatCard
          emoji="🎯"
          label="Направления"
          value={4}
          color="from-blue to-blue"
        />
        <StatCard
          emoji="⏳"
          label="Активные задачи"
          value={0}
          color="from-orange to-orange"
        />
        <StatCard
          emoji="✅"
          label="Готовые задачи"
          value={0}
          color="from-green to-green"
        />
      </div>

      {/* Карточки проектов */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Пустое состояние */}
        <div className="card p-8 text-center col-span-full">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="font-display text-xl font-bold text-text mb-2">
            Проекты не загружены
          </h3>
          <p className="text-text2 mb-4">
            Для отображения проектов нужно подключить Supabase и добавить данные
          </p>
          <div className="text-sm text-text3 bg-bg3 inline-block px-4 py-2 rounded-lg">
            API ключ: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 20)}...
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ emoji, label, value, color }: {
  emoji: string
  label: string
  value: number
  color: string
}) {
  return (
    <div className="card p-5 relative overflow-hidden group hover:border-accent/50 transition-colors">
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${color}`} />
      <div className="text-3xl mb-2">{emoji}</div>
      <div className="font-display text-2xl font-black text-text mb-1">
        {value.toLocaleString('ru')}
      </div>
      <div className="text-xs text-text2 uppercase tracking-wider">{label}</div>
    </div>
  )
}
