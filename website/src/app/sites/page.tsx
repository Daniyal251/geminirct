import Link from 'next/link'
import { Header, Footer } from '@/components/layout'

export default function SitesPage() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue/10 border border-blue/20 rounded-full text-xs font-bold text-blue uppercase tracking-wider mb-6">
              🌐 Разработка сайтов
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-black mb-6">
              Сайты для бизнеса <span className="gradient-text">от 5 000₽</span>
            </h1>
            <p className="text-xl text-text2 max-w-3xl mx-auto">
              Визитки, лендинги, каталоги. ИИ-ассистент в комплекте. 
              Адаптивный дизайн, SEO-оптимизация. Готово за 3-7 дней.
            </p>
          </div>

          {/* Pricing */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <PricingCard 
              title="Визитка"
              price="5 000₽"
              features={['1-3 страницы', 'Адаптивный дизайн', 'Базовое SEO', 'AI-ассистент']}
              popular={false}
            />
            <PricingCard 
              title="Лендинг"
              price="10 000₽"
              features={['1 продающая страница', 'Анимации', 'Формы заявок', 'AI-ассистент', 'SEO']}
              popular={true}
            />
            <PricingCard 
              title="Каталог"
              price="15 000₽"
              features={['5+ страниц', 'Карточки товаров', 'Фильтры', 'Корзина', 'AI-ассистент', 'SEO']}
              popular={false}
            />
          </div>

          {/* Process */}
          <div className="mb-16">
            <h2 className="font-display text-2xl font-bold mb-8 text-center">Как мы работаем</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <ProcessStep number="01" title="Бриф" description="Обсуждаем задачу, собираем требования" />
              <ProcessStep number="02" title="Прототип" description="Создаём демо-версию сайта" />
              <ProcessStep number="03" title="Дизайн" description="Утверждаем визуальный стиль" />
              <ProcessStep number="04" title="Запуск" description="Размещаем на хостинге, сдаём клиенту" />
            </div>
          </div>

          {/* CTA */}
          <div className="bg-bg2 border border-border rounded-2xl p-8 text-center">
            <h3 className="font-display text-2xl font-bold mb-4">Хотите сайт?</h3>
            <p className="text-text2 mb-6">
              Расскажите о проекте — подготовим предложение
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

function PricingCard({ title, price, features, popular }: { title: string; price: string; features: string[]; popular: boolean }) {
  return (
    <div className={`bg-bg3 border rounded-xl p-6 ${popular ? 'border-accent shadow-lg shadow-accent/10' : 'border-border'}`}>
      {popular && <div className="text-xs font-bold text-accent mb-2">ПОПУЛЯРНОЕ</div>}
      <h3 className="font-display text-xl font-bold mb-2">{title}</h3>
      <div className="font-display text-3xl font-black text-accent mb-6">{price}</div>
      <ul className="space-y-3 mb-6">
        {features.map((f, i) => (
          <li key={i} className="text-sm text-text2 flex items-center gap-2">
            <span className="text-accent">✓</span> {f}
          </li>
        ))}
      </ul>
      <a href="https://t.me/AIhroject_bot" target="_blank" className={`w-full block text-center py-3 rounded-lg font-bold text-sm ${popular ? 'bg-accent text-bg hover:bg-white' : 'bg-bg2 text-text border border-border hover:border-accent'} transition-colors`}>
        Заказать
      </a>
    </div>
  )
}

function ProcessStep({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-4xl font-black text-accent mb-4">{number}</div>
      <h4 className="font-bold mb-2">{title}</h4>
      <p className="text-sm text-text2">{description}</p>
    </div>
  )
}
