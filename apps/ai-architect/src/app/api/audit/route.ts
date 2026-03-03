import { NextRequest, NextResponse } from 'next/server'
import { 
  CascadeManager, 
  createCascade,
  GigaChatProvider,
  GroqProvider,
  GeminiProvider,
  ClaudeProvider
} from '@rct/ai'

/**
 * POST /api/audit
 * Аудит сайта с помощью AI
 * 
 * Request:
 * {
 *   url: string,
 *   html?: string,
 *   css?: string,
 *   js?: string
 * }
 * 
 * Response:
 * {
 *   overall: number,
 *   scores: { seo, performance, accessibility, best_practices },
 *   recommendations: string[],
 *   provider: string,
 *   duration: number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, html, css, js } = body
    
    // Валидация
    if (!url) {
      return NextResponse.json(
        { error: 'URL обязателен' },
        { status: 400 }
      )
    }
    
    // Создаём каскад провайдеров
    const cascade = createCascade([
      new GeminiProvider(process.env.GEMINI_API_KEY || ''), // Лучший для анализа
      new GigaChatProvider(process.env.GIGACHAT_API_KEY || ''),
      new GroqProvider(process.env.GROQ_API_KEY || ''),
      new ClaudeProvider(process.env.CLAUDE_API_KEY || '')
    ], 'best')
    
    // Данные для анализа
    const analysisData = {
      url,
      html: html || '',
      css: css || '',
      js: js || ''
    }
    
    // Запускаем аудит
    const start = Date.now()
    const result = await cascade.analyze(analysisData)
    const duration = Date.now() - start
    
    // Логируем в БД (TODO: реализовать)
    await logAudit({
      url,
      result,
      duration,
      timestamp: new Date().toISOString()
    })
    
    // Возвращаем результат
    return NextResponse.json({
      success: true,
      data: {
        url,
        overall: result.overall,
        scores: result.scores,
        recommendations: result.recommendations,
        provider: 'ai-cascade',
        duration
      }
    })
    
  } catch (error) {
    console.error('[API /audit] Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Ошибка аудита',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Логирование аудита в БД
async function logAudit(data: any) {
  try {
    // TODO: Сохранение в Supabase (таблица ai_audits)
    console.log('[API /audit] Logged:', data)
  } catch (error) {
    console.error('[API /audit] Log error:', error)
  }
}
