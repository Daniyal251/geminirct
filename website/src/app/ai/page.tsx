import Link from 'next/link'
import { Header, Footer } from '@/components/layout'

export default function AIPage() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple/10 border border-purple/20 rounded-full text-xs font-bold text-purple uppercase tracking-wider mb-6">
              🤖 ИИ-агенты
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-black mb-6">
              Автоматизация на <span className="gradient-text">AI</span>
            </h1>
            <p className="text-xl text-text2 max-w-3xl mx-auto">
              Telegram-боты с Claude AI, CRM-автоматизация, n8n workflows. 
              Готовые решения и кастомная разработка.
            </p>
          </div>

          {/* Services */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <ServiceCard 
              emoji="💬"
              title="Telegram-боты"
              description="Чат-боты с интеграцией Claude AI для поддержки клиентов"
              price="от 25 000₽"
            />
            <ServiceCard 
              emoji="📊"
              title="CRM-автоматизация"
              description="Настройка воронок, автоследования, интеграции"
              price="от 15 000₽"
            />
            <ServiceCard 
              emoji="⚙️"
              title="n8n workflows"
              description="Автоматизация бизнес-процессов через n8n"
              price="от 20 000₽"
            />
            <ServiceCard 
              emoji="📰"
              title="Новостные боты"
              description="Автоматическая публикация новостей из RSS, Telegram"
              price="от 10 000₽"
            />
            <ServiceCard 
              emoji="🎯"
              title="AI-ассистенты"
              description="Виртуальные помощники для сайта или приложения"
              price="от 30 000₽"
            />
            <ServiceCard 
              emoji="🔌"
              title="Интеграции"
              description="Подключение AI к вашим системам через API"
              price="от 15 000₽"
            />
          </div>

          {/* Tech Stack */}
          <div className="bg-bg2 border border-border rounded-2xl p-8 mb-16">
            <h2 className="font-display text-2xl font-bold mb-6 text-center">Технологии</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <TechBadge name="Claude AI" emoji="🧠" />
              <TechBadge name="Groq" emoji="⚡" />
              <TechBadge name="Gemini" emoji="✨" />
              <TechBadge name="n8n" emoji="⚙️" />
              <TechBadge name="Telegram Bot API" emoji="💬" />
              <TechBadge name="Python" emoji="🐍" />
              <TechBadge name="Node.js" emoji="📦" />
              <TechBadge name="Supabase" emoji="🗄️" />
            </div>
          </div>

          {/* CTA */}
          <div className="bg-bg3 border border-border rounded-2xl p-8 text-center">
            <h3 className="font-display text-2xl font-bold mb-4">Нужна автоматизация?</h3>
            <p className="text-text2 mb-6">
              Расскажите о задаче — подберём решение
            </p>
            <a href="https://t.me/AIhroject_bot" target="_blank" className="btn-primary inline-block">
              💬 Обсудить в Telegram
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

function ServiceCard({ emoji, title, description, price }: { emoji: string; title: string; description: string; price: string }) {
  return (
    <div className="bg-bg2 border border-border rounded-xl p-6 hover:border-purple/50 transition-colors">
      <div className="text-4xl mb-4">{emoji}</div>
      <h3 className="font-display text-lg font-bold mb-2">{title}</h3>
      <p className="text-text2 text-sm mb-4">{description}</p>
      <div className="font-bold text-purple">{price}</div>
    </div>
  )
}

function TechBadge({ name, emoji }: { name: string; emoji: string }) {
  return (
    <div className="px-4 py-2 bg-bg3 border border-border rounded-full text-sm flex items-center gap-2">
      <span>{emoji}</span>
      <span>{name}</span>
    </div>
  )
}
