'use client'

export default function GenerationsPage() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">✨ История генераций</h1>
        
        {/* Заглушка - будет заполнено из API */}
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-xl text-gray-600 mb-4">История генераций пуста</p>
          <a href="/generate" className="text-purple-600 hover:underline">
            Создать первый сайт →
          </a>
        </div>
      </div>
    </main>
  )
}
