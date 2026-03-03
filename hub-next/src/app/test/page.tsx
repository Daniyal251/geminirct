export default function TestPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-4xl font-black text-text mb-4">
          ✅ Next.js работает!
        </h1>
        <p className="text-text2 mb-6">
          Сервер запущен и готов к работе
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/login" className="btn btn-primary">
            🔐 Войти
          </a>
          <a href="/projects" className="btn btn-secondary">
            📊 Проекты
          </a>
        </div>
      </div>
    </div>
  )
}
