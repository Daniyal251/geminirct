import Link from 'next/link'

export default function AIArchitectHome() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-900 to-blue-900 text-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black mb-4">
              🤖 AI Architect
            </h1>
            <p className="text-2xl mb-6">
              Создавайте сайты с помощью искусственного интеллекта
            </p>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto">
              AI-аудит существующих сайтов и AI-генерация новых за считанные минуты
            </p>
          </div>

          <div className="flex justify-center gap-6">
            <Link
              href="/audit"
              className="px-8 py-4 bg-white text-purple-900 rounded-lg font-bold text-lg hover:bg-purple-100 transition-colors"
            >
              🔍 AI-аудит сайта
            </Link>
            <Link
              href="/generate"
              className="px-8 py-4 bg-purple-600 text-white rounded-lg font-bold text-lg hover:bg-purple-700 transition-colors"
            >
              ✨ AI-генерация сайта
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-black text-center mb-12">
            Возможности AI Architect
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🔍"
              title="AI-аудит"
              description="Полный анализ вашего сайта: SEO, скорость, доступность, best practices"
              features={[
                'Оценка по 4 критериям',
                'Подробные рекомендации',
                'Сравнение с конкурентами'
              ]}
            />

            <FeatureCard
              icon="✨"
              title="AI-генерация"
              description="Создание сайта по описанию: просто расскажите что нужно"
              features={[
                'Готовый код за 2 минуты',
                'Адаптивный дизайн',
                'SEO-оптимизация'
              ]}
            />

            <FeatureCard
              icon="📦"
              title="Экспорт"
              description="Скачайте готовый сайт в ZIP или опубликуюйте на хостинге"
              features={[
                'Чистый код',
                'Готов к публикации',
                'Легко редактировать'
              ]}
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-black text-center mb-4">
            Прозрачные цены
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Платите только за результат
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <PricingCard
              title="AI-аудит"
              price="1 000₽"
              description="Разовый анализ сайта"
              features={[
                'Полный анализ сайта',
                'Оценка по 4 критериям',
                'Список рекомендаций',
                'PDF отчёт'
              ]}
              cta="Попробовать"
              href="/audit"
            />

            <PricingCard
              title="AI-генерация"
              price="5 000₽"
              description="Создание лендинга"
              features={[
                'Генерация по описанию',
                'Адаптивный дизайн',
                'HTML + CSS + JS',
                'Экспорт в ZIP',
                '3 правки бесплатно'
              ]}
              cta="Создать сайт"
              href="/generate"
              popular={true}
            />

            <PricingCard
              title="Разработка"
              price="от 50 000₽"
              description="Индивидуальная разработка"
              features={[
                'Бриф с менеджером',
                'Дизайн-прототип',
                'Разработка командой',
                'Тестирование',
                'Публикация на хостинге',
                'Поддержка 1 месяц'
              ]}
              cta="Оставить заявку"
              href="/generate/manual"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-black text-center mb-12">
            Как это работает
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            <StepCard
              number="01"
              title="Опишите задачу"
              description="Расскажите какой сайт вам нужен или отправьте URL на аудит"
            />

            <StepCard
              number="02"
              title="AI анализирует"
              description="Нейросеть анализирует требования и создаёт решение"
            />

            <StepCard
              number="03"
              title="Просмотр"
              description="Просмотрите результат и внесите правки если нужно"
            />

            <StepCard
              number="04"
              title="Готово!"
              description="Скачайте готовый сайт или опубликуюйте на хостинге"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-purple-900 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-black mb-6">
            Готовы создать сайт?
          </h2>
          <p className="text-xl mb-8 text-purple-200">
            Попробуйте AI Architect прямо сейчас — это быстро и недорого
          </p>
          <div className="flex justify-center gap-6">
            <Link
              href="/audit"
              className="px-8 py-4 bg-white text-purple-900 rounded-lg font-bold text-lg hover:bg-purple-100 transition-colors"
            >
              🔍 Начать с аудита
            </Link>
            <Link
              href="/generate"
              className="px-8 py-4 bg-purple-600 text-white rounded-lg font-bold text-lg hover:bg-purple-700 transition-colors"
            >
              ✨ Создать сайт
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

function FeatureCard({ icon, title, description, features }: any) {
  return (
    <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <ul className="space-y-2">
        {features.map((feature: string, i: number) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PricingCard({ title, price, description, features, cta, href, popular }: any) {
  return (
    <div className={`bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow ${popular ? 'border-2 border-purple-500 scale-105' : ''}`}>
      {popular && (
        <div className="text-purple-500 font-bold text-sm mb-2">ПОПУЛЯРНОЕ</div>
      )}
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <div className="text-4xl font-black text-purple-600 mb-2">{price}</div>
      <p className="text-gray-600 mb-6">{description}</p>
      <ul className="space-y-2 mb-8">
        {features.map((feature: string, i: number) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`block text-center py-3 rounded-lg font-bold ${popular ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
      >
        {cta}
      </Link>
    </div>
  )
}

function StepCard({ number, title, description }: any) {
  return (
    <div className="text-center">
      <div className="text-6xl font-black text-purple-200 mb-4">{number}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
