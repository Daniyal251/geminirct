'use client'

import { useState } from 'react'

export default function ManualGeneratePage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    type: 'landing',
    budget: '',
    description: '',
    deadline: ''
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка отправки')
      }
      
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold mb-4">Заявка отправлена!</h1>
          <p className="text-xl text-gray-600 mb-8">
            Менеджер свяжется с вами в течение 15 минут
          </p>
          <div className="bg-white rounded-lg p-6 shadow-lg text-left">
            <h2 className="font-bold mb-4">Что дальше?</h2>
            <ol className="space-y-2 list-decimal list-inside">
              <li>Менеджер позвонит вам для уточнения деталей</li>
              <li>Составим подробное ТЗ</li>
              <li>Подготовим коммерческое предложение</li>
              <li>Заключим договор</li>
              <li>Приступим к разработке</li>
            </ol>
          </div>
          <a
            href="/"
            className="inline-block mt-8 px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Вернуться на главную
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">
          🚀 Заказать разработку сайта
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Индивидуальная разработка командой профессионалов
        </p>

        {/* Информация */}
        <div className="bg-white rounded-lg p-6 shadow-lg mb-8">
          <h2 className="font-bold mb-4">Преимущества разработки командой:</h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Индивидуальный дизайн под ваш бренд</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Профессиональная вёрстка и программирование</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Тестирование на всех устройствах</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>SEO-оптимизация с самого начала</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Поддержка после запуска</span>
            </li>
          </ul>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-8 shadow-lg">
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Ваше имя *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Телефон *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Компания
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Тип сайта *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="landing">Лендинг (от 50 000₽)</option>
                  <option value="business">Бизнес-сайт (от 100 000₽)</option>
                  <option value="shop">Интернет-магазин (от 150 000₽)</option>
                  <option value="corporate">Корпоративный (от 200 000₽)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Бюджет
                </label>
                <select
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Не указан</option>
                  <option value="50-100">50 000 - 100 000₽</option>
                  <option value="100-200">100 000 - 200 000₽</option>
                  <option value="200+">от 200 000₽</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Описание проекта *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Расскажите подробнее о проекте: какой сайт нужен, какие функции, примеры сайтов которые нравятся..."
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[150px]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Желаемый срок запуска
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {error && (
              <div className="bg-red-100 text-red-800 p-4 rounded-lg">
                ❌ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-bold text-lg"
            >
              {loading ? 'Отправка...' : 'Отправить заявку'}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Нажимая кнопку, вы соглашаетесь с политикой обработки персональных данных
            </p>
          </div>
        </form>
      </div>
    </main>
  )
}
