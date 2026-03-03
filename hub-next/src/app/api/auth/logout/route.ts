import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  // Очищаем cookie сессии
  response.cookies.set('auth-token', '', { maxAge: 0 })
  return response
}
