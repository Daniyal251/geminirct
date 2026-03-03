import type { Metadata } from 'next'
import { Unbounded, Manrope } from 'next/font/google'
import './globals.css'

const unbounded = Unbounded({
  subsets: ['cyrillic', 'latin'],
  variable: '--font-display',
})

const manrope = Manrope({
  subsets: ['cyrillic', 'latin'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'RCT — Российские Компьютерные Технологии',
  description: 'Локализация медоборудования, разработка сайтов, AI-контент, ИИ-агенты. Казань, ОЭЗ «Иннополис».',
  keywords: ['RCT', 'медоборудование', 'сайты', 'AI', 'ИИ-агенты', 'Казань', 'Иннополис'],
  openGraph: {
    title: 'RCT — Российские Компьютерные Технологии',
    description: 'Группа компаний полного цикла',
    type: 'website',
    locale: 'ru_RU',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={`${unbounded.variable} ${manrope.variable} font-body`}>
        {children}
      </body>
    </html>
  )
}
