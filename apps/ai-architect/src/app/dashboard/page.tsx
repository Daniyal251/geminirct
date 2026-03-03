'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [audits, setAudits] = useState([])
  const [generations, setGenerations] = useState([])
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Загрузка данных (TODO: реализовать API)
    const loadData = async () => {
      try {
        // Получаем пользователя
        const userStr = localStorage.getItem('rkt_client')
        if (userStr) {
          setUser(JSON.parse(userStr))
        }
        
        // TODO: Загрузить аудиты, генерации, заявки из API
        setAudits([])
        setGenerations([])
        setLeads([])
      } catch (error) {
        console.error('Load data error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-xl text-gray-600">Загрузка...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Приветствие */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            👋 Добро пожаловать, {user?.name || 'Клиент'}!
          </h1>
          <p className="text-xl text-gray-600">
            Личный кабинет AI Architect
          </p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon="🔍"
            label="Аудиты"
            value={audits.length}
            color="bg-blue-100"
          />
          <StatCard
            icon="✨"
            label="Генерации"
            value={generations.length}
            color="bg-purple-100"
          />
          <StatCard
            icon="📋"
            label="Заявки"
            value={leads.length}
            color="bg-green-100"
          />
          <StatCard
            icon="💰"
            label="Потрачено"
            value="0₽"
            color="bg-yellow-100"
          />
        </div>

        {/* Быстрые действия */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/audit"
            className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">AI-аудит сайта</h3>
            <p className="text-gray-600">Проанализировать существующий сайт</p>
          </Link>

          <Link
            href="/generate"
            className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-bold mb-2">AI-генерация</h3>
            <p className="text-gray-600">Создать новый сайт с помощью AI</p>
          </Link>

          <Link
            href="/generate/manual"
            className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold mb-2">Заказать разработку</h3>
            <p className="text-gray-600">Индивидуальная разработка командой</p>
          </Link>
        </div>

        {/* История аудитов */}
        <div className="bg-white rounded-lg p-6 shadow-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Последние аудиты</h2>
            <Link href="/dashboard/audits" className="text-purple-600 hover:underline">
              Все →
            </Link>
          </div>
          
          {audits.length > 0 ? (
            <div className="space-y-4">
              {audits.map((audit: any, i: number) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold">{audit.url}</div>
                      <div className="text-sm text-gray-600">
                        Оценка: {audit.overall}/100
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(audit.date).toLocaleDateString('ru')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              <div className="text-4xl mb-2">📭</div>
              <p>Пока нет аудитов</p>
              <Link href="/audit" className="text-purple-600 hover:underline">
                Сделать первый аудит
              </Link>
            </div>
          )}
        </div>

        {/* История генераций */}
        <div className="bg-white rounded-lg p-6 shadow-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Последние генерации</h2>
            <Link href="/dashboard/generations" className="text-purple-600 hover:underline">
              Все →
            </Link>
          </div>
          
          {generations.length > 0 ? (
            <div className="space-y-4">
              {generations.map((gen: any, i: number) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold">{gen.type}</div>
                      <div className="text-sm text-gray-600">
                        {gen.description?.slice(0, 50)}...
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(gen.date).toLocaleDateString('ru')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              <div className="text-4xl mb-2">📭</div>
              <p>Пока нет генераций</p>
              <Link href="/generate" className="text-purple-600 hover:underline">
                Создать первый сайт
              </Link>
            </div>
          )}
        </div>

        {/* Заявки на разработку */}
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Мои заявки</h2>
            <Link href="/dashboard/leads" className="text-purple-600 hover:underline">
              Все →
            </Link>
          </div>
          
          {leads.length > 0 ? (
            <div className="space-y-4">
              {leads.map((lead: any, i: number) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold">{lead.type}</div>
                      <div className="text-sm text-gray-600">
                        Статус: {lead.status}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(lead.date).toLocaleDateString('ru')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              <div className="text-4xl mb-2">📭</div>
              <p>Пока нет заявок</p>
              <Link href="/generate/manual" className="text-purple-600 hover:underline">
                Оставить заявку
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className={`${color} rounded-lg p-6 text-center`}>
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-3xl font-black mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  )
}
