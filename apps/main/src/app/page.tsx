import Link from 'next/link'

export default function MainHome() {
  const directions = [
    {
      icon: '🏥',
      title: 'Медоборудование',
      description: 'Локализация производства КТ-сканеров, рентген-аппаратов, ПЭТ/КТ. OEM с Syno-Tech, производство в ОЭЗ «Иннополис».',
      tags: ['КТ 16-128 срезов', 'Рентген', 'ПЭТ/КТ', 'PACS', '44-ФЗ'],
      href: 'https://rct-med.ru',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '🌐',
      title: 'Разработка сайтов',
      description: 'Сайты для бизнеса от 5 000₽ — визитки, лендинги, каталоги. ИИ-ассистент, адаптивный дизайн, SEO. Готово за 3-7 дней.',
      tags: ['от 5 000₽', '3-7 дней', 'AI-ассистент', 'SEO'],
      href: '/sites',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: '🎬',
      title: 'AI-контент',
      description: 'Рекламные видео, фото для маркетплейсов, виртуальные инфлюенсеры, контент для соцсетей — всё на нейросетях.',
      tags: ['Видео', 'Фото', 'Маркетплейсы', 'SMM'],
      href: '/content',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: '🤖',
      title: 'ИИ-агенты',
      description: 'Telegram-боты с Claude AI, CRM-автоматизация, новостные боты, n8n workflows. Готовые решения и кастомная разработка.',
      tags: ['Telegram-боты', 'CRM', 'News Bot', 'n8n'],
      href: '/ai-agents',
      color: 'from-green-500 to-emerald-500'
    }
  ]

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-bg2 border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent"></span>
              <span className="font-display font-bold text-xl">RCT</span>
              <span className="text-xs text-text3 hidden sm:inline">группа компаний</span>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="#directions" className="text-sm text-text2 hover:text-text transition-colors">
                Направления
              </Link>
              <Link href="#about" className="text-sm text-text2 hover:text-text transition-colors">
                О компании
              </Link>
              <Link href="#contacts" className="text-sm text-text2 hover:text-text transition-colors">
                Контакты
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/client/login"
                className="text-sm text-text2 hover:text-text transition-colors hidden sm:block"
              >
                🏢 Клиентам
              </Link>
              <Link
                href="/hub/login"
                className="text-sm text-text2 hover:text-text transition-colors hidden sm:block"
              >
                👤 Сотрудникам
              </Link>
              <Link
                href="#contacts"
                className="bg-accent text-bg px-4 py-2 rounded-lg text-sm font-bold hover:bg-white transition-colors"
              >
                Заказать
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-bg">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-[-10%] right-[-5%] w-[420px] h-[420px] bg-accent rounded-full blur-[100px] opacity-10"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[340px] h-[340px] bg-blue rounded-full blur-[100px] opacity-10"></div>
          <div className="absolute top-[40%] left-[30%] w-[180px] h-[180px] bg-purple rounded-full blur-[80px] opacity-10"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-xs font-bold text-accent uppercase tracking-wider mb-6">
            📍 Казань · ОЭЗ «Иннополис» · Республика Татарстан
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
            Российские Компьютерные{' '}
            <span className="bg-gradient-to-r from-accent to-blue bg-clip-text text-transparent">
              Технологии
            </span>
          </h1>

          <p className="text-lg text-text2 max-w-3xl mx-auto mb-8 leading-relaxed">
            Группа компаний полного цикла: локализация медицинского оборудования, разработка IT-решений, 
            производство AI-контента, автоматизация бизнес-процессов.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="#directions"
              className="px-8 py-4 bg-accent text-bg rounded-lg font-bold text-lg hover:bg-white hover:-translate-y-1 transition-all shadow-lg shadow-accent/20"
            >
              Направления работы
            </Link>
            <Link
              href="/hub/login"
              className="px-8 py-4 bg-bg3 text-text rounded-lg font-bold text-lg border border-border hover:border-accent hover:text-accent transition-all"
            >
              RKT HUB →
            </Link>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto">
            <StatCard value="6.3 млрд ₽" label="Инвестиции в КТ-проект" color="text-accent" />
            <StatCard value="155" label="КТ-сканеров/год (план)" color="text-blue" />
            <StatCard value="4" label="Направления бизнеса" color="text-purple" />
            <StatCard value="60%" label="Доля рынка КТ к 2030" color="text-orange" />
          </div>
        </div>
      </section>

      {/* Directions */}
      <section id="directions" className="py-20 bg-bg2">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-black mb-4">
              Направления работы
            </h2>
            <p className="text-text2 max-w-2xl mx-auto">
              Каждое направление — самостоятельный бизнес с отдельной командой и продуктом
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {directions.map((dir, i) => (
              <Link
                key={i}
                href={dir.href}
                className="group relative bg-bg3 border border-border rounded-2xl p-8 hover:border-accent/50 transition-all hover:-translate-y-1 overflow-hidden"
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${dir.color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                
                <div className="text-4xl mb-4">{dir.icon}</div>
                <h3 className="font-display text-xl font-bold mb-3 group-hover:text-accent transition-colors">
                  {dir.title}
                </h3>
                <p className="text-text2 mb-6 leading-relaxed">
                  {dir.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {dir.tags.map((tag, j) => (
                    <span key={j} className="px-3 py-1 bg-bg2 rounded-full text-xs text-text3">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-sm font-bold text-text3 group-hover:text-accent transition-colors flex items-center gap-2">
                  Подробнее <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-black mb-6">
                Технологический суверенитет в медицине
              </h2>
              <div className="space-y-4 text-text2 leading-relaxed">
                <p>
                  RCT — группа компаний полного цикла. Управляющая компания обеспечивает инфраструктуру 
                  (регуляторика, GR, финансирование, площадка ОЭЗ), каждое направление развивается как 
                  самостоятельный проект.
                </p>
                <p>
                  Не дистрибуция импортного оборудования — трансфер технологий и создание собственного 
                  производства. Параллельно развиваем цифровые продукты: сайты для бизнеса, AI-контент, 
                  автоматизация на ИИ-агентах.
                </p>
              </div>

              <div className="mt-8 space-y-3">
                <TimelineItem year="2025" text="Старт: регистрация ООО, OEM-договор с Syno-Tech" />
                <TimelineItem year="2026" text="Пилот: первые поставки КТ, резидентство ОЭЗ" />
                <TimelineItem year="2027" text="Производство: сборка КТ в Иннополисе (50-70 ед./год)" />
                <TimelineItem year="2030+" text="Кластер: ПЭТ/КТ, хирургические роботы, до 800 рабочих мест" />
              </div>
            </div>

            <div className="bg-bg2 border border-border rounded-2xl p-8">
              <h3 className="font-display text-xl font-bold mb-6">Контакты</h3>
              <div className="space-y-4">
                <ContactItem emoji="📧" value="info@rct-hub.ru" href="mailto:info@rct-hub.ru" />
                <ContactItem emoji="📧" value="info@rct-med.ru" href="mailto:info@rct-med.ru" />
                <ContactItem emoji="💬" value="@AIhroject_bot" href="https://t.me/AIhroject_bot" />
                <ContactItem emoji="🌐" value="rct-hub.ru" />
                <ContactItem emoji="🌐" value="rct-med.ru" />
                <ContactItem emoji="📍" value="Казань, Республика Татарстан · ОЭЗ «Иннополис»" />
              </div>

              <div className="mt-8 pt-8 border-t border-border">
                <Link
                  href="#contacts"
                  className="w-full bg-accent text-bg py-4 rounded-xl text-sm font-bold hover:bg-white transition-colors block text-center"
                >
                  Связаться с нами
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contacts" className="py-20 bg-bg2">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-bg3 border border-border rounded-3xl p-8 md:p-12">
            <h2 className="font-display text-2xl md:text-3xl font-black mb-4">
              Нужна консультация?
            </h2>
            <p className="text-text2 mb-8 max-w-xl mx-auto">
              Расскажите задачу — подберём решение. Сайт, медтехника, AI-автоматизация или контент.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://t.me/AIhroject_bot"
                target="_blank"
                className="px-8 py-4 bg-accent text-bg rounded-xl font-bold hover:bg-white hover:-translate-y-1 transition-all shadow-lg shadow-accent/20"
              >
                💬 Telegram
              </a>
              <a
                href="mailto:info@rct-hub.ru"
                className="px-8 py-4 bg-bg3 text-text rounded-xl font-bold border border-border hover:border-accent hover:text-accent transition-all"
              >
                📧 info@rct-hub.ru
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bg2 border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent"></span>
              <span className="font-display font-bold">RCT</span>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-sm text-text2">
              <Link href="https://rct-med.ru" className="hover:text-accent transition-colors">Медоборудование</Link>
              <Link href="/sites" className="hover:text-accent transition-colors">Сайты</Link>
              <Link href="/content" className="hover:text-accent transition-colors">AI-контент</Link>
              <Link href="/ai-agents" className="hover:text-accent transition-colors">ИИ-агенты</Link>
            </div>

            <div className="text-sm text-text3">
              © 2025-2026 RCT · Казань · ОЭЗ «Иннополис»
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

function StatCard({ value, label, color }: any) {
  return (
    <div className="text-center p-4">
      <div className={`font-display text-2xl md:text-3xl font-black ${color} mb-1`}>{value}</div>
      <div className="text-xs text-text3 uppercase tracking-wider">{label}</div>
    </div>
  )
}

function TimelineItem({ year, text }: any) {
  return (
    <div className="flex gap-4">
      <span className="font-display font-bold text-accent min-w-[60px]">{year}</span>
      <span className="text-text2">{text}</span>
    </div>
  )
}

function ContactItem({ emoji, value, href }: any) {
  const content = (
    <div className="flex items-center gap-3">
      <span className="text-xl">{emoji}</span>
      <span className={href ? 'text-accent hover:underline' : 'text-text2'}>{value}</span>
    </div>
  )
  
  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    )
  }
  
  return content
}
