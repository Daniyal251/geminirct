'use client'

import { useState } from 'react'

export default function AuditPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<any>(null)

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // TODO: Вызов API для аудита
    setTimeout(() => {
      setReport({
        overall: 75,
        seo: 80,
        performance: 65,
        accessibility: 85,
        recommendations: [
          'Сжать изображения (экономия 1.2MB)',
          'Добавить meta description',
          'Оптимизировать CSS'
        ]
      })
      setLoading(false)
    }, 2000)
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">
          🔍 AI-аудит сайта
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Получите подробный отчёт о качестве вашего сайта
        </p>

        {/* Форма */}
        <form onSubmit={handleAudit} className="mb-8">
          <div className="flex gap-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://mysite.ru"
              className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Анализ...' : 'Аудировать'}
            </button>
          </div>
        </form>

        {/* Отчёт */}
        {report && (
          <div className="space-y-6">
            {/* Общие оценки */}
            <div className="grid grid-cols-4 gap-4">
              <ScoreCard label="Общий" score={report.overall} />
              <ScoreCard label="SEO" score={report.seo} />
              <ScoreCard label="Скорость" score={report.performance} />
              <ScoreCard label="Доступность" score={report.accessibility} />
            </div>

            {/* Рекомендации */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Рекомендации</h2>
              <ul className="space-y-2">
                {report.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-red-500">❌</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

function ScoreCard({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500'
  
  return (
    <div className="bg-white rounded-lg p-6 shadow-lg text-center">
      <div className={`text-4xl font-bold ${color} mb-2`}>{score}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  )
}
