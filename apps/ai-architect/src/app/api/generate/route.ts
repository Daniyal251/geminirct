import { NextRequest, NextResponse } from 'next/server'
import { 
  CascadeManager, 
  createCascade,
  ClaudeProvider,
  GigaChatProvider,
  GroqProvider
} from '@rct/ai'

/**
 * POST /api/generate
 * Генерация сайта с помощью AI
 * 
 * Request:
 * {
 *   type: 'landing' | 'business' | 'portfolio' | 'shop',
 *   description: string,
 *   style?: 'minimal' | 'corporate' | 'creative',
 *   colors?: string
 * }
 * 
 * Response:
 * {
 *   html: string,
 *   css: string,
 *   js: string,
 *   files: { 'index.html': string, ... },
 *   provider: string,
 *   duration: number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, description, style, colors } = body
    
    // Валидация
    if (!type || !description) {
      return NextResponse.json(
        { error: 'Тип и описание обязательны' },
        { status: 400 }
      )
    }
    
    // Создаём каскад провайдеров (Claude лучший для кода)
    const cascade = createCascade([
      new ClaudeProvider(process.env.CLAUDE_API_KEY || ''), // Лучший для кода
      new GigaChatProvider(process.env.GIGACHAT_API_KEY || ''),
      new GroqProvider(process.env.GROQ_API_KEY || '')
    ], 'best')
    
    // Формируем промпт
    const prompt = `Создай сайт типа "${type}".
    
Стиль: ${style || 'современный'}
Цвета: ${colors || 'нейтральные'}

Описание: ${description}

Верни ТОЛЬКО JSON без лишнего текста:
{
  "html": "<!DOCTYPE html><html>...</html>",
  "css": "body { ... }",
  "js": "..."
}`
    
    // Запускаем генерацию
    const start = Date.now()
    const result = await cascade.getCode(prompt)
    const duration = Date.now() - start
    
    // Логируем в БД (TODO: реализовать)
    await logGeneration({
      type,
      description,
      result,
      duration,
      timestamp: new Date().toISOString()
    })
    
    // Возвращаем результат
    return NextResponse.json({
      success: true,
      data: {
        ...result,
        provider: 'ai-cascade',
        duration
      }
    })
    
  } catch (error) {
    console.error('[API /generate] Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Ошибка генерации',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Логирование генерации в БД
async function logGeneration(data: any) {
  try {
    // TODO: Сохранение в Supabase (таблица ai_generations)
    console.log('[API /generate] Logged:', data)
  } catch (error) {
    console.error('[API /generate] Log error:', error)
  }
}
