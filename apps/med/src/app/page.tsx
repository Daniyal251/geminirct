import Link from 'next/link'

export default function MedHome() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-cyan-900 text-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="text-6xl mb-4">🏥</div>
            <h1 className="text-5xl font-black mb-4">
              RCT MED
            </h1>
            <p className="text-2xl mb-6">
              Локализация медицинского оборудования
            </p>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Производство КТ-сканеров, рентген-аппаратов, ПЭТ/КТ в ОЭЗ «Иннополис». 
              OEM-партнёрство с Syno-Tech. Полный цикл от разработки до сервиса.
            </p>
          </div>

          <div className="flex justify-center gap-6">
            <Link
              href="#equipment"
              className="px-8 py-4 bg-white text-blue-900 rounded-lg font-bold text-lg hover:bg-blue-100 transition-colors"
            >
              Оборудование
            </Link>
            <Link
              href="#contacts"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors"
            >
              Контакты
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard
              value="6.3 млрд ₽"
              label="Инвестиции"
              icon="💰"
            />
            <StatCard
              value="155 ед/год"
              label="Плановая мощность"
              icon="📊"
            />
            <StatCard
              value="16-128 срезов"
              label="КТ-сканеры"
              icon="🔬"
            />
            <StatCard
              value="60%"
              label="Доля рынка к 2030"
              icon="📈"
            />
          </div>
        </div>
      </section>

      {/* Equipment */}
      <section id="equipment" className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-black text-center mb-12">
            Оборудование
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <EquipmentCard
              icon="🔬"
              title="КТ-сканеры 16-128 срезов"
              features={[
                'OEM с Syno-Tech',
                'Производство в Иннополисе',
                'Полный цикл сервиса',
                'Регистрационное удостоверение'
              ]}
            />

            <EquipmentCard
              icon="📷"
              title="Рентген-аппараты"
              features={[
                'Цифровые',
                'Мобильные и стационарные',
                'Регистрационное удостоверение',
                'Сервис 24/7'
              ]}
            />

            <EquipmentCard
              icon="⚛️"
              title="ПЭТ/КТ"
              features={[
                'Высокая точность',
                'Онкодиагностика',
                'Сервис 24/7',
                'Обучение персонала'
              ]}
            />

            <EquipmentCard
              icon="💻"
              title="PACS-системы"
              features={[
                'Архивирование снимков',
                'Удалённые консультации',
                'Интеграция с МИС',
                'DICOM совместимость'
              ]}
            />

            <EquipmentCard
              icon="🏥"
              title="Хирургические роботы"
              features={[
                'Высокоточные операции',
                'Минимальная инвазивность',
                'Обучение хирургов',
                'Техподдержка'
              ]}
            />

            <EquipmentCard
              icon="📋"
              title="44-ФЗ и тендеры"
              features={[
                'Работа с госзаказом',
                'Полный пакет документов',
                'Лизинг',
                'Консультации'
              ]}
            />
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-black text-center mb-12">
            О компании
          </h2>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">
                Технологический суверенитет в медицине
              </h3>
              <p className="text-gray-700 mb-4 leading-relaxed">
                RCT — группа компаний полного цикла. Управляющая компания обеспечивает инфраструктуру 
                (регуляторика, GR, финансирование, площадка ОЭЗ), каждое направление развивается как 
                самостоятельный проект.
              </p>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Не дистрибуция импортного оборудования — трансфер технологий и создание собственного 
                производства в ОЭЗ «Иннополис», Казань.
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Резидент ОЭЗ «Иннополис»</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Постановление Правительства №719</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Регистрационное удостоверение Росздравнадзора</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h4 className="text-xl font-bold mb-4">Дорожная карта</h4>
              <TimelineItem year="2025" text="Старт: регистрация ООО, OEM-договор с Syno-Tech" />
              <TimelineItem year="2026" text="Пилот: первые поставки КТ, резидентство ОЭЗ" />
              <TimelineItem year="2027" text="Производство: сборка КТ в Иннополисе (50-70 ед./год)" />
              <TimelineItem year="2030+" text="Кластер: ПЭТ/КТ, хирургические роботы, до 800 рабочих мест" />
            </div>
          </div>
        </div>
      </section>

      {/* Contacts */}
      <section id="contacts" className="py-20 bg-gradient-to-r from-blue-900 to-cyan-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-black mb-8">
            Контакты
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <ContactCard
              icon="📧"
              label="Email"
              value="info@rct-med.ru"
              href="mailto:info@rct-med.ru"
            />
            <ContactCard
              icon="💬"
              label="Telegram"
              value="@AIhroject_bot"
              href="https://t.me/AIhroject_bot"
            />
            <ContactCard
              icon="🌐"
              label="Сайт"
              value="rct-med.ru"
              href="https://rct-med.ru"
            />
            <ContactCard
              icon="📍"
              label="Адрес"
              value="Казань, ОЭЗ «Иннополис»"
            />
          </div>

          <Link
            href="mailto:info@rct-med.ru"
            className="inline-block px-8 py-4 bg-white text-blue-900 rounded-lg font-bold text-lg hover:bg-blue-100 transition-colors"
          >
            Связаться с нами
          </Link>
        </div>
      </section>
    </main>
  )
}

function StatCard({ value, label, icon }: any) {
  return (
    <div className="bg-white rounded-xl p-6 text-center shadow-lg">
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-3xl font-black text-blue-600 mb-1">{value}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  )
}

function EquipmentCard({ icon, title, features }: any) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <ul className="space-y-2">
        {features.map((feature: string, i: number) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TimelineItem({ year, text }: any) {
  return (
    <div className="flex gap-4 mb-4 last:mb-0">
      <span className="font-bold text-blue-600 min-w-[60px]">{year}</span>
      <span className="text-gray-700">{text}</span>
    </div>
  )
}

function ContactCard({ icon, label, value, href }: any) {
  const content = (
    <div className="bg-white/10 rounded-lg p-6 text-center">
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-sm mb-1">{label}</div>
      <div className="font-bold">{value}</div>
    </div>
  )
  
  if (href) {
    return (
      <a href={href} className="block hover:bg-white/20 transition-colors">
        {content}
      </a>
    )
  }
  
  return content
}
