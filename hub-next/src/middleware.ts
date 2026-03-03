import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Защищённые роуты — требуют авторизации
const protectedRoutes = [
  '/projects',
  '/tasks',
  '/staff',
  '/partners',
  '/admin',
  '/settings',
]

// Публичные роуты
const publicRoutes = ['/login', '/test', '/']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Получаем сессию из localStorage (через cookie)
  const userCookie = request.cookies.get('rkt_user')?.value
  
  const isAuthenticated = !!userCookie
  
  // Проверяем, является ли роут защищённым
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Проверяем, является ли роут публичным
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Если защищённый роут и нет авторизации — редирект на логин
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // Если логин и есть авторизация — редирект на проекты
  if (pathname.startsWith('/login') && isAuthenticated) {
    return NextResponse.redirect(new URL('/projects', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
