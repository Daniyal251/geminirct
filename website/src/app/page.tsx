import { Header, Footer } from '@/components/layout'
import Link from 'next/link'

const directions = [
  {
    id: 'med',
    emoji: '🏥',
    title: 'Медоборудование',
    description: 'Локализация производства КТ-сканеров, рентген-аппаратов, ПЭТ/КТ. OEM с Syno-Tech, производство в ОЭЗ «Иннополис».',
    tags: ['КТ 16-128 срезов', 'Рентген', 'ПЭТ/КТ', 'PACS', '44-ФЗ'],
    color: 'from-accent to-cyan',
    link: '/med',
  },
  {
    id: 'sites',
    emoji: '🌐',
    title: 'Разработка сайтов',
    description: 'Сайты для бизнеса от 5 000₽ — визитки, лендинги, каталоги. ИИ-ассистент, адаптивный дизайн, SEO. Готово за 3-7 дней.',
    tags: ['от 5 000₽', '3-7 дней', 'AI-ассистент', 'SEO'],
    color: 'from-blue to-purple',
    link: '/sites',
  },
  {
    id: 'content',
    emoji: '🎬',
    title: 'AI-контент',
    description: 'Рекламные видео, фото для маркетплейсов, виртуальные инфлюенсеры, контент для соцсетей — всё на нейросетях.',
    tags: ['Видео', 'Фото', 'Маркетплейсы', 'SMM'],
    color: 'from-orange to-pink',
    link: '/content',
  },
  {
    id: 'ai',
    emoji: '🤖',
    title: 'ИИ-агенты',
    description: 'Telegram-боты с Claude AI, CRM-автоматизация, новостные боты, n8n workflows. Готовые решения и кастомная разработка.',
    tags: ['Telegram-боты', 'CRM', 'News Bot', 'n8n'],
    color: 'from-purple to-pink',
    link: '/ai',
  },
]

export default function HomePage() {
  return (
    <>
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          {/* Фон */}
          <div className="absolute inset-0">
            <div className="absolute top-[-10%] right-[-5%] w-[420px] h-[420px] bg-accent rounded-full blur-[100px] opacity-10 animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[340px] h-[340px] bg-blue rounded-full blur-[100px] opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-[40%] left-[30%] w-[180px] h-[180px] bg-purple rounded-full blur-[80px] opacity-10 animate-pulse" style={{ animationDelay: '4s' }}></div>
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)', backgroundSize: '56px 56px' }}></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Бейдж */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-xs font-bold text-accent uppercase tracking-wider mb-6 animate-fade-in">
              📍 Казань · ОЭЗ «Иннополис» · Республика Татарстан
            </div>

            {/* Заголовок */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              Российские Компьютерные{' '}
              <span className="gradient-text">Технологии</span>
            </h1>

            {/* Подзаголовок */}
            <p className="text-lg text-text2 max-w-3xl mx-auto mb-8 leading-relaxed">
              Группа компаний полного цикла: локализация медицинского оборудования, разработка IT-решений, производство AI-контента, автоматизация бизнес-процессов.
            </p>

            {/* Кнопки */}
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/#directions"
                className="bg-accent text-bg px-8 py-4 rounded-xl text-sm font-bold hover:bg-white hover:-translate-y-1 transition-all shadow-lg shadow-accent/20"
              >
                Направления работы
              </Link>
              <Link 
                href="/hub/login"
                className="bg-bg3 text-text px-8 py-4 rounded-xl text-sm font-bold border border-border hover:border-accent hover:text-accent transition-all"
              >
                RKT HUB →
              </Link>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto">
              <StatCard value="6.3 млрд ₽" label="Инвестиции в КТ-проект" color="text-accent" />
              <StatCard value="155" label="КТ-сканеров/год (план)" color="text-blue" />
              <StatCard value="4" label="Направления бизнеса" color="text-purple" />
              <StatCard value="60%" label="Доля рынка КТ к 2030" color="text-orange" />
            </div>
          </div>
        </section>

        {/* Направления */}
        <section id="directions" className="py-20 bg-bg2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-black mb-4">
                Направления работы
              </h2>
              <p className="text-text2 max-w-2xl mx-auto">
                Каждое направление — самостоятельный бизнес с отдельной командой и продуктом
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {directions.map((dir) => (
                <Link 
                  key={dir.id}
                  href={dir.link}
                  className="group relative bg-bg3 border border-border rounded-2xl p-8 hover:border-accent/50 transition-all hover:-translate-y-1 overflow-hidden"
                >
                  {/* Градиент сверху */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${dir.color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                  
                  {/* Иконка */}
                  <div className="text-4xl mb-4">{dir.emoji}</div>
                  
                  {/* Заголовок */}
                  <h3 className="font-display text-xl font-bold mb-3 group-hover:text-accent transition-colors">
                    {dir.title}
                  </h3>
                  
                  {/* Описание */}
                  <p className="text-text2 mb-6 leading-relaxed">
                    {dir.description}
                  </p>
                  
                  {/* Теги */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {dir.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-bg2 rounded-full text-xs text-text3">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Ссылка */}
                  <div className="text-sm font-bold text-text3 group-hover:text-accent transition-colors flex items-center gap-2">
                    Подробнее <span>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* О компании */}
        <section id="about" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-black mb-6">
                  Технологический суверенитет в медицине
                </h2>
                <div className="space-y-4 text-text2 leading-relaxed">
                  <p>
                    RCT — группа компаний полного цикла. Управляющая компания обеспечивает инфраструктуру (регуляторика, GR, финансирование, площадка ОЭЗ), каждое направление развивается как самостоятельный проект.
                  </p>
                  <p>
                    Не дистрибуция импортного оборудования — трансфер технологий и создание собственного производства. Параллельно развиваем цифровые продукты: сайты для бизнеса, AI-контент, автоматизация на ИИ-агентах.
                  </p>
                </div>
                
                {/* Дорожная карта */}
                <div className="mt-8 space-y-4">
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
                  <ContactItem emoji="🌐" value="rct-hub.ru" href="https://rct-hub.ru" />
                  <ContactItem emoji="🌐" value="rct-med.ru" href="https://rct-med.ru" />
                  <ContactItem emoji="📍" value="Казань, Республика Татарстан · ОЭЗ «Иннополис»" />
                </div>
                
                <div className="mt-8 pt-8 border-t border-border">
                  <Link 
                    href="/#contacts"
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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
                  className="bg-accent text-bg px-8 py-4 rounded-xl text-sm font-bold hover:bg-white hover:-translate-y-1 transition-all shadow-lg shadow-accent/20"
                >
                  💬 Telegram
                </a>
                <a 
                  href="mailto:info@rct-hub.ru"
                  className="bg-bg3 text-text px-8 py-4 rounded-xl text-sm font-bold border border-border hover:border-accent hover:text-accent transition-all"
                >
                  📧 info@rct-hub.ru
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}

function StatCard({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="text-center p-4">
      <div className={`font-display text-2xl md:text-3xl font-black ${color} mb-1`}>{value}</div>
      <div className="text-xs text-text3 uppercase tracking-wider">{label}</div>
    </div>
  )
}

function TimelineItem({ year, text }: { year: string; text: string }) {
  return (
    <div className="flex gap-4">
      <span className="font-display font-bold text-accent min-w-[60px]">{year}</span>
      <span className="text-text2">{text}</span>
    </div>
  )
}

function ContactItem({ emoji, value, href }: { emoji: string; value: string; href?: string }) {
  const content = (
    <div className="flex items-center gap-3">
      <span className="text-xl">{emoji}</span>
      <span className={href ? 'text-accent hover:underline' : 'text-text2'}>{value}</span>
    </div>
  )
  
  if (href) {
    return <a href={href} className="block">{content}</a>
  }
  return <div className="block">{content}</div>
}
