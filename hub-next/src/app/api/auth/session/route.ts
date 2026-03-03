import { NextResponse } from 'next/server'

// Простая проверка сессии
export async function GET() {
  // В реальной версии здесь будет проверка cookies
  // Для сейчас возвращаем null (не авторизован)
  return NextResponse.json({ user: null })
}
