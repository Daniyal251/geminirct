import { NextRequest, NextResponse } from 'next/server'
import { 
  CascadeManager, 
  createCascade,
  GigaChatProvider,
  GroqProvider,
  GeminiProvider
} from '@rct/ai'

/**
 * POST /api/chat
 * AI-чат (общий диалог)
 * 
 * Request:
 * {
 *   message: string,
 *   sessionId?: string,
 *   context?: any[]
 * }
 * 
 * Response:
 * {
 *   text: string,
 *   provider: string,
 *   duration: number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, sessionId, context = [] } = body
    
    // Валидация
    if (!message) {
      return NextResponse.json(
        { error: 'Сообщение обязательно' },
        { status: 400 }
      )
    }
    
    // Создаём каскад провайдеров (быстрые для чата)
    const cascade = createCascade([
      new GigaChatProvider(process.env.GIGACHAT_API_KEY || ''), // Дёшево, РФ
      new GroqProvider(process.env.GROQ_API_KEY || ''), // Быстро
      new GeminiProvider(process.env.GEMINI_API_KEY || '') // Бесплатно
    ], 'fastest')
    
    // Системный промпт для RCT
    const systemPrompt = `Ты ИИ-ассистент RCT (Российские Компьютерные Технологии).

Компания:
- Локализация: Казань, ОЭЗ «Иннополис»
- 4 направления: Медоборудование, Сайты, AI-контент, ИИ-агенты

Направления:
1. 🏥 Медоборудование — КТ-сканеры, рентген, ПЭТ/КТ (OEM с Syno-Tech)
2. 🌐 Сайты — от 5 000₽, 3-7 дней, AI-ассистент в комплекте
3. 🎬 AI-контент — видео, фото, виртуальные инфлюенсеры
4. 🤖 ИИ-агенты — Telegram-боты, CRM-автоматизация, n8n

Контакты:
- Email: info@rct-hub.ru, info@rct-med.ru
- Telegram: @AIhroject_bot

Отвечай:
- Кратко и по делу
- На русском языке
- Используй эмодзи
- Предлагай связаться для деталей`

    // Запускаем генерацию ответа
    const start = Date.now()
    const fullPrompt = `${systemPrompt}\n\nUser: ${message}`
    const result = await cascade.generate(fullPrompt)
    const duration = Date.now() - start
    
    // Логируем в БД (TODO: реализовать)
    await logChat({
      sessionId: sessionId || 'anonymous',
      message,
      response: result.text,
      provider: result.provider,
      duration,
      timestamp: new Date().toISOString()
    })
    
    // Возвращаем ответ
    return NextResponse.json({
      success: true,
      data: {
        text: result.text,
        provider: result.provider,
        duration
      }
    })
    
  } catch (error) {
    console.error('[API /chat] Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Ошибка чата',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Логирование чата в БД
async function logChat(data: any) {
  try {
    // TODO: Сохранение в Supabase (таблица ai_logs)
    console.log('[API /chat] Logged:', data)
  } catch (error) {
    console.error('[API /chat] Log error:', error)
  }
}
