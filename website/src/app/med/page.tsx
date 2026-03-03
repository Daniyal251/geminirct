import Link from 'next/link'
import { Header, Footer } from '@/components/layout'

export default function MedPage() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-xs font-bold text-accent uppercase tracking-wider mb-6">
              🏥 РКТ — Медицинское оборудование
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-black mb-6">
              Локализация <span className="gradient-text">медоборудования</span>
            </h1>
            <p className="text-xl text-text2 max-w-3xl mx-auto">
              Производство КТ-сканеров, рентген-аппаратов, ПЭТ/КТ в ОЭЗ «Иннополис». 
              OEM-партнёрство с Syno-Tech. Полный цикл от разработки до сервиса.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            <StatCard value="6.3 млрд ₽" label="Инвестиции" />
            <StatCard value="155 ед/год" label="Плановая мощность" />
            <StatCard value="16-128 срезов" label="КТ-сканеры" />
            <StatCard value="60%" label="Доля рынка к 2030" />
          </div>

          {/* Products */}
          <div className="mb-16">
            <h2 className="font-display text-2xl font-bold mb-8">Продукция</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ProductCard 
                emoji="🔬"
                title="КТ-сканеры 16-128 срезов"
                features={['OEM с Syno-Tech', 'Производство в Иннополисе', 'Полный цикл сервиса']}
              />
              <ProductCard 
                emoji="📷"
                title="Рентген-аппараты"
                features={['Цифровые', 'Мобильные и стационарные', 'Регистрационное удостоверение']}
              />
              <ProductCard 
                emoji="⚛️"
                title="ПЭТ/КТ"
                features={['Высокая точность', 'Онкодиагностика', 'Сервис 24/7']}
              />
              <ProductCard 
                emoji="💻"
                title="PACS-системы"
                features={['Архивирование снимков', 'Удалённые консультации', 'Интеграция с МИС']}
              />
              <ProductCard 
                emoji="🏥"
                title="Хирургические роботы"
                features=['Высокоточные операции', 'Минимальная инвазивность', 'Обучение персонала']}
              />
              <ProductCard 
                emoji="📋"
                title="44-ФЗ и тендеры"
                features={['Работа с госзаказом', 'Полный пакет документов', 'Лизинг']}
              />
            </div>
          </div>

          {/* CTA */}
          <div className="bg-bg2 border border-border rounded-2xl p-8 text-center">
            <h3 className="font-display text-2xl font-bold mb-4">Заинтересовало?</h3>
            <p className="text-text2 mb-6">
              Оставьте заявку — подготовим коммерческое предложение
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="mailto:info@rct-med.ru" className="btn-primary">
                📧 info@rct-med.ru
              </a>
              <a href="https://t.me/AIhroject_bot" target="_blank" className="btn-secondary">
                💬 Telegram
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-bg2 border border-border rounded-xl p-6 text-center">
      <div className="font-display text-2xl font-black text-accent mb-2">{value}</div>
      <div className="text-sm text-text2">{label}</div>
    </div>
  )
}

function ProductCard({ emoji, title, features }: { emoji: string; title: string; features: string[] }) {
  return (
    <div className="bg-bg3 border border-border rounded-xl p-6 hover:border-accent/50 transition-colors">
      <div className="text-4xl mb-4">{emoji}</div>
      <h3 className="font-display text-lg font-bold mb-3">{title}</h3>
      <ul className="space-y-2">
        {features.map((f, i) => (
          <li key={i} className="text-sm text-text2 flex items-center gap-2">
            <span className="text-accent">✓</span> {f}
          </li>
        ))}
      </ul>
    </div>
  )
}
