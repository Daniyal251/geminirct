'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppStore } from '@/stores/appStore'
import { clsx } from 'clsx'

const navigation = [
  { name: 'Проекты', href: '/projects', icon: '📊' },
  { name: 'Задачи', href: '/tasks', icon: '✅' },
  { name: 'Сотрудники', href: '/staff', icon: '👥' },
  { name: 'Партнёры', href: '/partners', icon: '🤝' },
  { name: 'Админ-панель', href: '/admin', icon: '🛡️' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore()

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-full bg-bg2 border-r border-border transition-all duration-300 z-50',
        sidebarCollapsed ? 'w-[70px]' : 'w-64'
      )}
    >
      {/* Кнопка сворачивания */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="absolute -right-3 top-8 w-7 h-7 rounded-full bg-bg2 border border-border text-text2 hover:bg-accent hover:text-bg transition-colors"
      >
        {sidebarCollapsed ? '→' : '←'}
      </button>

      {/* Логотип */}
      <div className={clsx('p-6 border-b border-border', sidebarCollapsed && 'text-center px-3')}>
        <h1 className="font-display text-xl font-black bg-gradient-to-r from-accent to-blue bg-clip-text text-transparent">
          {!sidebarCollapsed ? 'RKT HUB' : 'RKT'}
        </h1>
        {!sidebarCollapsed && (
          <p className="text-xs text-text2 mt-1">v14 · Управление проектами</p>
        )}
      </div>

      {/* Навигация */}
      <nav className="p-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group',
                isActive
                  ? 'bg-accent-glow text-accent'
                  : 'text-text2 hover:bg-bg3 hover:text-text'
              )}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1 text-sm font-medium">{item.name}</span>
                  {item.name === 'Задачи' && (
                    <span className="text-xs bg-accent text-bg px-2 py-0.5 rounded-full font-bold">
                      3
                    </span>
                  )}
                </>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Пользователь */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t-2 border-red bg-bg3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-accent to-blue flex items-center justify-center text-lg font-bold text-bg flex-shrink-0">
            👤
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text truncate">Гость</p>
              <p className="text-xs text-text2 truncate">Сотрудник</p>
            </div>
          )}
        </div>
        <button
          className={clsx(
            'mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-glow text-red font-semibold text-sm transition-colors hover:bg-red hover:text-white',
            sidebarCollapsed && 'px-2'
          )}
        >
          <span>🚪</span>
          {!sidebarCollapsed && 'Выйти'}
        </button>
      </div>
    </aside>
  )
}
