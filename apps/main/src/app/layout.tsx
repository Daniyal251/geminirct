import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['cyrillic', 'latin'] })

export const metadata: Metadata = {
  title: 'RCT HUB — Российские Компьютерные Технологии',
  description: 'Группа компаний полного цикла: локализация медоборудования, разработка сайтов, AI-контент, ИИ-агенты. Казань, ОЭЗ «Иннополис».',
  keywords: ['RCT', 'медоборудование', 'сайты', 'AI', 'ИИ-агенты', 'Казань', 'Иннополис'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
