import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { phone, password } = await request.json()

    if (!phone || !password) {
      return NextResponse.json(
        { error: 'Введите телефон и пароль' },
        { status: 400 }
      )
    }

    // Создаём клиент для серверного запроса
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Ищем пользователя по телефону
    const { data: staff, error } = await supabase
      .from('Сотрудники')
      .select('*')
      .eq('Телефон', phone.replace(/\D/g, ''))
      .single()

    if (error || !staff) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    // Проверяем пароль
    const storedPassword = staff['Пароль'] || staff['password']
    if (storedPassword !== password) {
      return NextResponse.json(
        { error: 'Неверный пароль' },
        { status: 401 }
      )
    }

    // Возвращаем данные пользователя (без пароля)
    const { password: _, ...userSafe } = staff
    
    return NextResponse.json({
      user: {
        id: staff.id,
        name: staff['Имя'],
        role: staff['Роль'] || 'Сотрудник',
        project: staff['Проект'],
        direction: staff['Направление'],
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
