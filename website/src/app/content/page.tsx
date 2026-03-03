import Link from 'next/link'
import { Header, Footer } from '@/components/layout'

export default function ContentPage() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange/10 border border-orange/20 rounded-full text-xs font-bold text-orange uppercase tracking-wider mb-6">
              🎬 AI-контент
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-black mb-6">
              Контент на <span className="gradient-text">нейросетях</span>
            </h1>
            <p className="text-xl text-text2 max-w-3xl mx-auto">
              Рекламные видео, фото для маркетплейсов, виртуальные инфлюенсеры. 
              В 3-5 раз дешевле традиционной съёмки.
            </p>
          </div>

          {/* Services */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <ServiceCard 
              emoji="🎥"
              title="Рекламные видео"
              description="Создаём промо-ролики, рекламные креативы, сторис с AI-персонажами"
              price="от 3 000₽"
            />
            <ServiceCard 
              emoji="📸"
              title="Фото для маркетплейсов"
              description="Генерируем изображения товаров, инфографику, lifestyle-фото"
              price="от 500₽ / шт"
            />
            <ServiceCard 
              emoji="👤"
              title="Виртуальные инфлюенсеры"
              description="Создаём AI-моделей для продвижения брендов в соцсетях"
              price="от 15 000₽"
            />
            <ServiceCard 
              emoji="📱"
              title="Контент для соцсетей"
              description="Посты, сторис, reels — всё на нейросетях, быстро и дёшево"
              price="от 5 000₽ / мес"
            />
          </div>

          {/* Comparison */}
          <div className="bg-bg2 border border-border rounded-2xl p-8 mb-16">
            <h2 className="font-display text-2xl font-bold mb-6 text-center">AI vs Традиционная съёмка</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-orange mb-4">🤖 AI-контент</h3>
                <ul className="space-y-2 text-text2">
                  <li className="flex items-center gap-2"><span className="text-accent">✓</span> В 3-5 раз дешевле</li>
                  <li className="flex items-center gap-2"><span className="text-accent">✓</span> Готово за 1-3 дня</li>
                  <li className="flex items-center gap-2"><span className="text-accent">✓</span> Без студии и актёров</li>
                  <li className="flex items-center gap-2"><span className="text-accent">✓</span> Любые правки</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-text3 mb-4">📹 Традиционная съёмка</h3>
                <ul className="space-y-2 text-text2">
                  <li className="flex items-center gap-2"><span className="text-text3">✗</span> Дорого (от 50 000₽)</li>
                  <li className="flex items-center gap-2"><span className="text-text3">✗</span> 1-2 недели</li>
                  <li className="flex items-center gap-2"><span className="text-text3">✗</span> Студия, команда, актёры</li>
                  <li className="flex items-center gap-2"><span className="text-text3">✗</span> Правки сложно и дорого</li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-bg3 border border-border rounded-2xl p-8 text-center">
            <h3 className="font-display text-2xl font-bold mb-4">Нужен контент?</h3>
            <p className="text-text2 mb-6">
              Присылайте задачу — рассчитаем стоимость
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
    <div className="bg-bg2 border border-border rounded-xl p-6 hover:border-orange/50 transition-colors">
      <div className="text-4xl mb-4">{emoji}</div>
      <h3 className="font-display text-lg font-bold mb-2">{title}</h3>
      <p className="text-text2 text-sm mb-4">{description}</p>
      <div className="font-bold text-orange">{price}</div>
    </div>
  )
}
