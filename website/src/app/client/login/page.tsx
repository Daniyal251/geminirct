'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ClientPortal() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Demo login - в реальности будет API запрос
      if (phone && password) {
        const user = {
          id: 'client_1',
          name: 'Клиент',
          phone,
          email: '',
        }
        localStorage.setItem('rkt_client', JSON.stringify(user))
        router.push('/client/dashboard')
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
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <Link href="/" className="fixed top-6 left-6 text-text2 hover:text-text transition-colors flex items-center gap-2">
        ← На главную
      </Link>

      <div className="w-full max-w-md">
        <div className="bg-bg2 border border-border rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">🏢</div>
          <h1 className="font-display text-2xl font-black mb-2">Личный кабинет</h1>
          <p className="text-text2 text-sm mb-8">Клиентский портал RKT HUB</p>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-bg p-1 rounded-lg">
            <button
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                !isRegister ? 'bg-accent text-bg' : 'text-text2 hover:text-text'
              }`}
            >
              Вход
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                isRegister ? 'bg-accent text-bg' : 'text-text2 hover:text-text'
              }`}
            >
              Регистрация
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <input
                  type="text"
                  placeholder="Ваше имя"
                  className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-accent"
                  required
                />
                <input
                  type="email"
                  placeholder="Email (необязательно)"
                  className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-accent"
                />
              </>
            )}

            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="Телефон"
              className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-accent"
              required
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-accent"
              required
            />

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
              {loading ? 'Загрузка...' : isRegister ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </form>

          <Link href="/order" className="block mt-6 text-sm text-text2 hover:text-accent transition-colors">
            🚀 Заказать сайт
          </Link>
        </div>
      </div>
    </div>
  )
}
