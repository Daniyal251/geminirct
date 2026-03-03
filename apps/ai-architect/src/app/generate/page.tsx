'use client'

import { useState } from 'react'

export default function GeneratePage() {
  const [type, setType] = useState('landing')
  const [description, setDescription] = useState('')
  const [style, setStyle] = useState('minimal')
  const [colors, setColors] = useState('')
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState<any>(null)
  const [error, setError] = useState('')

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, description, style, colors })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка генерации')
      }
      
      setGenerated(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!generated) return
    
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: generated.html,
          css: generated.css,
          js: generated.js,
          filename: 'website'
        })
      })
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'website.zip'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('Ошибка скачивания')
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">
          ✨ AI-генерация сайта
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Опишите какой сайт вам нужен — AI создаст его за минуты
        </p>

        {/* Форма */}
        <form onSubmit={handleGenerate} className="mb-8">
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Тип сайта *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="landing">Лендинг (1 страница)</option>
                  <option value="business">Бизнес-сайт (5-10 страниц)</option>
                  <option value="portfolio">Портфолио</option>
                  <option value="shop">Интернет-магазин</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Стиль
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="minimal">Минимализм</option>
                  <option value="corporate">Корпоративный</option>
                  <option value="creative">Креативный</option>
                  <option value="modern">Современный</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Цветовая схема
              </label>
              <input
                type="text"
                value={colors}
                onChange={(e) => setColors(e.target.value)}
                placeholder="напр. синий, белый, серый"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Описание сайта *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Нужен сайт для стоматологии. Светлый дизайн, форма записи на приём, отзывы, цены, контакты..."
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[150px]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-bold text-lg"
            >
              {loading ? 'Генерация...' : 'Сгенерировать сайт'}
            </button>
          </div>
        </form>

        {/* Ошибка */}
        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">
            ❌ {error}
          </div>
        )}

        {/* Результат */}
        {generated && (
          <div className="space-y-6">
            {/* Превью */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Сгенерированный сайт</h2>
              
              <div className="border rounded-lg overflow-hidden mb-4">
                <iframe
                  srcDoc={`
                    <style>${generated.css}</style>
                    ${generated.html}
                    <script>${generated.js}<\/script>
                  `}
                  className="w-full h-[500px]"
                  title="Preview"
                />
              </div>

              {/* Кнопки */}
              <div className="flex gap-4">
                <button
                  onClick={handleDownload}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  📥 Скачать ZIP
                </button>
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  ✏️ Редактировать
                </button>
                <a
                  href="/generate/manual"
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-center"
                >
                  🚀 Заказать разработку
                </a>
              </div>
            </div>

            {/* Информация */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-bold mb-4">Информация</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div><strong>Тип:</strong> {type}</div>
                <div><strong>Стиль:</strong> {style}</div>
                <div><strong>Время генерации:</strong> {generated.duration}ms</div>
                <div><strong>AI провайдер:</strong> {generated.provider}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
