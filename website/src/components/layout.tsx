import Link from 'next/link'

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bg/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Логотип */}
          <Link href="/" className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent"></span>
            <span className="font-display font-bold text-xl">RCT</span>
            <span className="text-xs text-text3 hidden sm:inline">группа компаний</span>
          </Link>

          {/* Навигация */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/#directions" className="text-sm text-text2 hover:text-text transition-colors">
              Направления
            </Link>
            <Link href="/#about" className="text-sm text-text2 hover:text-text transition-colors">
              О компании
            </Link>
            <Link href="/#contacts" className="text-sm text-text2 hover:text-text transition-colors">
              Контакты
            </Link>
            <a 
              href="https://t.me/AIhroject_bot" 
              target="_blank"
              className="text-sm text-text2 hover:text-accent transition-colors"
            >
              Telegram
            </a>
          </nav>

          {/* Кнопки */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <Link 
                href="/client/login" 
                className="text-sm text-text2 hover:text-text transition-colors"
                title="Клиентский портал"
              >
                🏢
              </Link>
              <Link 
                href="/hub/login" 
                className="text-sm text-text2 hover:text-text transition-colors"
                title="Сотрудникам"
              >
                👤
              </Link>
            </div>
            <Link 
              href="/#contacts" 
              className="bg-accent text-bg px-4 py-2 rounded-lg text-sm font-bold hover:bg-white transition-colors"
            >
              Заказать
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="bg-bg2 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent"></span>
            <span className="font-display font-bold">RCT</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm text-text2">
            <Link href="/med/" className="hover:text-accent transition-colors">Медоборудование</Link>
            <Link href="/sites/" className="hover:text-accent transition-colors">Сайты</Link>
            <Link href="/content/" className="hover:text-accent transition-colors">AI-контент</Link>
            <Link href="/ai/" className="hover:text-accent transition-colors">ИИ-агенты</Link>
          </div>
          
          <div className="text-sm text-text3">
            © 2025-2026 RCT · Казань · ОЭЗ «Иннополис»
          </div>
        </div>
      </div>
    </footer>
  )
}
