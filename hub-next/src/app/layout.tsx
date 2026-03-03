import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Unbounded } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['cyrillic', 'latin'],
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['cyrillic', 'latin'],
  variable: '--font-mono',
})

const unbounded = Unbounded({ 
  subsets: ['cyrillic', 'latin'],
  variable: '--font-display',
})

export const metadata: Metadata = {
  title: 'RKT HUB v14 — Управление проектами',
  description: 'Система управления проектами для RCT (Российские Компьютерные Технологии)',
  keywords: ['RKT', 'управление проектами', 'CRM', '/task management'],
  authors: [{ name: 'RCT', url: 'https://rct-hub.ru' }],
  openGraph: {
    title: 'RKT HUB v14',
    description: 'Система управления проектами',
    type: 'website',
    locale: 'ru_RU',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${unbounded.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
