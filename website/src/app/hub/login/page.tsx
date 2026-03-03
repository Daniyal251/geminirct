'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header, Footer } from '@/components/layout'

export default function HubLoginPage() {
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
      // Для демо просто редиректим
      if (phone && password) {
        localStorage.setItem('rkt_user', JSON.stringify({ name: 'Пользователь', role: 'Сотрудник' }))
        router.push('/hub')
      }
    } catch (err) {
      setError('Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.startsWith('7')) value = numbers.slice(1)
    if (value.length > 10) value = value.slice(0, 10)
    
    let formatted = '+7'
    if (value.length > 0) formatted += ' ' + value.slice(0, 3)
    if (value.length > 3) formatted += ' ' + value.slice(3, 6)
    if (value.length > 6) formatted += ' ' + value.slice(6, 8)
    if (value.length > 8) formatted += ' ' + value.slice(8, 10)
    
    return formatted
  }

  return (
    <>
      <Header />
      <main className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <div className="bg-bg2 border border-border rounded-2xl p-8">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🔐</div>
              <h1 className="font-display text-2xl font-black mb-2">RKT HUB</h1>
              <p className="text-text2 text-sm">Вход для сотрудников</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text2 uppercase tracking-wider mb-2">
                  📱 Телефон
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="+7 ___ ___ __ __"
                  className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-accent transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text2 uppercase tracking-wider mb-2">
                  🔒 Пароль
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-accent transition-colors"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red/10 text-red rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent text-bg py-3 rounded-lg font-bold hover:bg-white transition-colors disabled:opacity-50"
              >
                {loading ? 'Вход...' : 'Войти'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-text2 mb-2">Нет доступа?</p>
              <a href="https://t.me/AIhroject_bot" target="_blank" className="text-accent hover:underline text-sm">
                Обратитесь к администратору
              </a>
            </div>

            <div className="mt-6 text-center">
              <Link href="/" className="text-sm text-text2 hover:text-text transition-colors">
                ← На главную
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
