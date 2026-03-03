'use client'

export default function AISettingsPage() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">⚙️ Настройки AI</h1>
        
        <div className="bg-white rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">AI Провайдеры</h2>
          
          <div className="space-y-6">
            <ProviderField name="GigaChat (Сбер)" status="active" />
            <ProviderField name="Groq" status="active" />
            <ProviderField name="Gemini (Google)" status="active" />
            <ProviderField name="Claude (Anthropic)" status="warning" />
            <ProviderField name="DeepSeek" status="active" />
            <ProviderField name="YandexGPT" status="inactive" />
          </div>
        </div>
      </div>
    </main>
  )
}

function ProviderField({ name, status }: any) {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    inactive: 'bg-gray-100 text-gray-800'
  }
  
  const statusLabels = {
    active: '✓ Активен',
    warning: '⚠ Платно',
    inactive: '○ Отключен'
  }
  
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="font-bold">{name}</div>
      <div className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[status as keyof typeof statusColors]}`}>
        {statusLabels[status as keyof typeof statusLabels]}
      </div>
    </div>
  )
}
