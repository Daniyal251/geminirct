import { NextRequest, NextResponse } from 'next/server'
import { SaluteSpeechProvider } from '@rct/ai'

/**
 * POST /api/speech-to-text
 * Распознавание речи (SaluteSpeech)
 * 
 * Request: FormData с аудиофайлом
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
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    
    // Валидация
    if (!audioFile) {
      return NextResponse.json(
        { error: 'Аудиофайл обязателен' },
        { status: 400 }
      )
    }
    
    // Создаём провайдер
    const provider = new SaluteSpeechProvider(
      process.env.SALUTESPEECH_API_KEY || ''
    )
    
    // Конвертируем в Blob
    const audioBlob = await audioFile.arrayBuffer()
    
    // Запускаем распознавание
    const start = Date.now()
    const text = await provider.speechToText(new Blob([audioBlob]))
    const duration = Date.now() - start
    
    // Логируем в БД (TODO: реализовать)
    await logSpeechToText({
      filename: audioFile.name,
      size: audioFile.size,
      text,
      duration,
      timestamp: new Date().toISOString()
    })
    
    // Возвращаем результат
    return NextResponse.json({
      success: true,
      data: {
        text,
        provider: 'salutespeech',
        duration
      }
    })
    
  } catch (error) {
    console.error('[API /speech-to-text] Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Ошибка распознавания',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Логирование распознавания в БД
async function logSpeechToText(data: any) {
  try {
    // TODO: Сохранение в Supabase
    console.log('[API /speech-to-text] Logged:', data)
  } catch (error) {
    console.error('[API /speech-to-text] Log error:', error)
  }
}
