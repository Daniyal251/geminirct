import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/lead
 * Заявка на разработку сайта
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, email, company, type, budget, description, deadline } = body
    
    // Валидация
    if (!name || !phone || !description) {
      return NextResponse.json(
        { error: 'Имя, телефон и описание обязательны' },
        { status: 400 }
      )
    }
    
    // Создаём лид в CRM (TODO: реализовать)
    const lead = {
      id: `lead_${Date.now()}`,
      name,
      phone,
      email,
      company,
      type,
      budget,
      description,
      deadline,
      status: 'new',
      source: 'ai-architect',
      created_at: new Date().toISOString()
    }
    
    // Логируем в БД
    await logLead(lead)
    
    // TODO: Отправить уведомление менеджеру в Telegram
    
    return NextResponse.json({
      success: true,
      data: lead
    })
    
  } catch (error) {
    console.error('[API /lead] Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Ошибка создания заявки',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function logLead(lead: any) {
  try {
    // TODO: Сохранение в Supabase (таблица leads)
    console.log('[API /lead] Logged:', lead)
  } catch (error) {
    console.error('[API /lead] Log error:', error)
  }
}
