import { NextRequest, NextResponse } from 'next/server'
import JSZip from 'jszip'

/**
 * POST /api/export
 * Экспорт сайта в ZIP
 * 
 * Request:
 * {
 *   html: string,
 *   css: string,
 *   js: string,
 *   filename?: string
 * }
 * 
 * Response: Blob (ZIP файл)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { html, css, js, filename = 'website' } = body
    
    // Валидация
    if (!html) {
      return NextResponse.json(
        { error: 'HTML обязателен' },
        { status: 400 }
      )
    }
    
    // Создаём ZIP
    const zip = new JSZip()
    
    // Добавляем файлы
    zip.file('index.html', html)
    zip.file('css/styles.css', css || '/* Стили */')
    zip.file('js/script.js', js || '// Скрипт')
    
    // Добавляем README
    zip.file('README.txt', `Сайт сгенерирован AI Architect
Дата: ${new Date().toISOString()}

Файлы:
- index.html - главная страница
- css/styles.css - стили
- js/script.js - скрипты

RCT Platform - https://rct-hub.ru
`)
    
    // Генерируем ZIP
    const start = Date.now()
    const content = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE'
    })
    const duration = Date.now() - start
    
    // Возвращаем файл
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}.zip"`
      }
    })
    
  } catch (error) {
    console.error('[API /export] Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Ошибка экспорта',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
