import { NextRequest, NextResponse } from 'next/server'
import { GigaCheckProvider } from '@rct/ai'

/**
 * POST /api/detect-ai
 * Детекция AI-текста (GigaCheck)
 * 
 * Request:
 * {
 *   text: string
 * }
 * 
 * Response:
 * {
 *   isAI: boolean,
 *   confidence: number,
 *   model?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text } = body
    
    // Валидация
    if (!text || text.length < 50) {
      return NextResponse.json(
        { error: 'Текст должен быть не менее 50 символов' },
        { status: 400 }
      )
    }
    
    // Создаём провайдер
    const provider = new GigaCheckProvider(
      process.env.GIGACHECK_API_KEY || ''
    )
    
    // Запускаем детекцию
    const start = Date.now()
    const result = await provider.detectAI(text)
    const duration = Date.now() - start
    
    // Логируем в БД (TODO: реализовать)
    await logDetection({
      text: text.slice(0, 200),
      result,
      duration,
      timestamp: new Date().toISOString()
    })
    
    // Возвращаем результат
    return NextResponse.json({
      success: true,
      data: result
    })
    
  } catch (error) {
    console.error('[API /detect-ai] Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Ошибка детекции',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Логирование детекции в БД
async function logDetection(data: any) {
  try {
    // TODO: Сохранение в Supabase
    console.log('[API /detect-ai] Logged:', data)
  } catch (error) {
    console.error('[API /detect-ai] Log error:', error)
  }
}
