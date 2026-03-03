'use client'

export default function AuditsPage() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">🔍 История аудитов</h1>
        
        {/* Заглушка - будет заполнено из API */}
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-xl text-gray-600 mb-4">История аудитов пуста</p>
          <a href="/audit" className="text-purple-600 hover:underline">
            Сделать первый аудит →
          </a>
        </div>
      </div>
    </main>
  )
}
