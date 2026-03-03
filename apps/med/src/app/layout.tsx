import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['cyrillic', 'latin'] })

export const metadata: Metadata = {
  title: 'RCT MED — Медицинское оборудование',
  description: 'Локализация производства КТ-сканеров, рентген-аппаратов, ПЭТ/КТ в России. Казань, ОЭЗ «Иннополис».',
  keywords: ['КТ', 'рентген', 'ПЭТ/КТ', 'медоборудование', 'локализация', 'Иннополис'],
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
