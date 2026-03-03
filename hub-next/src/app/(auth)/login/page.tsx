'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка входа')
      }

      // Сохраняем данные пользователя в localStorage (для простоты)
      localStorage.setItem('rkt_user', JSON.stringify(data.user))
      
      // Редирект на проекты
      router.push('/projects')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
    } finally {
      setLoading(false)
    }
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.startsWith('7')) {
      value = numbers.slice(1)
    }
    if (value.length > 10) value = value.slice(0, 10)
    
    let formatted = '+7'
    if (value.length > 0) formatted += ' ' + value.slice(0, 3)
    if (value.length > 3) formatted += ' ' + value.slice(3, 6)
    if (value.length > 6) formatted += ' ' + value.slice(6, 8)
    if (value.length > 8) formatted += ' ' + value.slice(8, 10)
    
    return formatted
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg">
      <div className="w-full max-w-md">
        {/* Карточка входа */}
        <div className="card p-8 md:p-12 text-center relative overflow-hidden">
          {/* Градиентная полоска сверху */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-blue to-purple to-accent animate-gradient" />
          
          {/* Иконка */}
          <div className="text-6xl mb-6">🔐</div>
          
          {/* Логотип */}
          <h1 className="font-display text-3xl font-black bg-gradient-to-r from-accent to-blue bg-clip-text text-transparent mb-2">
            RKT HUB
          </h1>
          <p className="text-text2 text-sm mb-8">Система управления проектами</p>

          {/* Форма */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="text-left">
              <label className="block text-xs font-semibold text-text2 uppercase tracking-wider mb-2">
                📱 Телефон
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="+7 ___ ___ __ __"
                maxLength={16}
                className="input text-center text-lg tracking-widest"
                required
              />
            </div>

            <div className="text-left">
              <label className="block text-xs font-semibold text-text2 uppercase tracking-wider mb-2">
                🔒 Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input text-center text-lg tracking-[0.25em]"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-glow text-red rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          {/* Подсказка */}
          <p className="text-text2 text-sm mt-6">
            Нет доступа?{' '}
            <Link 
              href="https://t.me/AIhroject_bot" 
              target="_blank"
              className="text-accent hover:underline"
            >
              @AIhroject_bot
            </Link>
          </p>
          
          {/* Демо кнопка */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-text3 mb-2">Для теста нажмите:</p>
            <button
              onClick={() => {
                setPhone('+7 999 999 99 99')
                setPassword('admin')
              }}
              className="text-xs text-accent hover:underline"
            >
              Заполнить демо-данными
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
