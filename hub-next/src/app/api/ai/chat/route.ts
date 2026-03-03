import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

// AI каскад: Groq → Gemini → Claude → DeepSeek
const AI_PROVIDERS = ['groq', 'gemini', 'claude', 'deepseek']

const AI_CONFIG = {
  groq: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.1-70b-versatile',
    key: process.env.GROQ_API_KEY,
  },
  gemini: {
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    model: 'gemini-1.5-flash',
    key: process.env.GEMINI_API_KEY,
  },
  claude: {
    url: 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-haiku-20240307',
    key: process.env.CLAUDE_API_KEY,
  },
  deepseek: {
    url: 'https://api.deepseek.com/chat/completions',
    model: 'deepseek-chat',
    key: process.env.DEEPSEEK_API_KEY,
  },
}

const SYSTEM_PROMPT = `Ты ИИ-ассистент компании RCT (Российские Компьютерные Технологии).

КОМПАНИЯ:
- Локализация: Казань, ОЭЗ «Иннополис», Республика Татарстан
- 4 направления: Медоборудование, Сайты, AI-контент, ИИ-агенты

НАПРАВЛЕНИЯ:

1. 🏥 МЕДОБОРУДОВАНИЕ (РКТ)
   - КТ-сканеры 16-128 срезов (OEM с Syno-Tech)
   - Рентген, ПЭТ/КТ, маммографы
   - Производство в Иннополисе
   - План: 155 КТ/год к 2028
   - Инвестиции: 6.3 млрд ₽

2. 🌐 САЙТЫ
   - Визитка: 5 000₽ (1-3 страницы)
   - Лендинг: 10 000₽
   - Каталог: 15 000₽
   - Премиум: 25 000₽
   - Срок: 3-7 дней
   - AI-ассистент в комплекте

3. 🎬 AI-КОНТЕНТ
   - Рекламные видео
   - Фото для маркетплейсов
   - Виртуальные инфлюенсеры
   - SMM контент
   - В 3-5 раз дешевле съёмки

4. 🤖 ИИ-АГЕНТЫ
   - Telegram-боты с Claude AI
   - CRM-автоматизация
   - n8n workflows
   - Новостные боты

КОНТАКТЫ:
- Email: info@rct-hub.ru, info@rct-med.ru
- Telegram: @AIhroject_bot
- Сайты: rct-hub.ru, rct-med.ru

ОТВЕЧАЙ:
- Кратко и по делу
- На русском языке
- Используй эмодзи для наглядности
- Предлагай связаться для деталей`

export async function POST(request: Request) {
  try {
    const { messages, sessionId } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Неверный формат сообщений' },
        { status: 400 }
      )
    }

    const lastMessage = messages[messages.length - 1]?.content

    // Пробуем провайдеры по очереди
    let lastError: Error | null = null

    for (const provider of AI_PROVIDERS) {
      const config = AI_CONFIG[provider as keyof typeof AI_CONFIG]
      
      if (!config.key) {
        console.log(`[AI] Skipping ${provider} - no key`)
        continue
      }

      try {
        const result = await callAIProvider(provider, config, messages, lastMessage)
        
        // Логируем успешный запрос
        await logAIRequest(sessionId, provider, config.model, lastMessage, result, 'success')
        
        return NextResponse.json({
          text: result,
          provider,
          model: config.model,
        })
      } catch (error) {
        lastError = error as Error
        console.warn(`[AI] ${provider} failed:`, error)
        await logAIRequest(sessionId, provider, config.model, lastMessage, '', 'error', (error as Error).message)
      }
    }

    // Все провайдеры не сработали
    return NextResponse.json({
      text: `⚠️ Все AI сервисы недоступны.\nПоследняя ошибка: ${lastError?.message}\n\nПопробуйте позже или напишите нам: @AIhroject_bot`,
      provider: 'none',
      model: 'none',
    })
  } catch (error) {
    console.error('[AI] Critical error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

async function callAIProvider(
  provider: string,
  config: any,
  messages: any[],
  userMessage: string
): Promise<string> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)

  try {
    if (provider === 'groq') {
      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages,
          ],
          max_tokens: 1024,
          temperature: 0.7,
        }),
        signal: controller.signal,
      })

      if (!response.ok) throw new Error(`Groq: ${response.status}`)
      const data = await response.json()
      return data.choices[0].message.content
    }

    if (provider === 'gemini') {
      const response = await fetch(`${config.url}?key=${config.key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nUser: ${userMessage}` }] }],
          generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
        }),
        signal: controller.signal,
      })

      if (!response.ok) throw new Error(`Gemini: ${response.status}`)
      const data = await response.json()
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response'
    }

    if (provider === 'claude') {
      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'x-api-key': config.key,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.model,
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
          })),
        }),
        signal: controller.signal,
      })

      if (!response.ok) throw new Error(`Claude: ${response.status}`)
      const data = await response.json()
      return data.content?.[0]?.text || 'No response'
    }

    if (provider === 'deepseek') {
      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages,
          ],
          max_tokens: 1024,
          temperature: 0.7,
        }),
        signal: controller.signal,
      })

      if (!response.ok) throw new Error(`DeepSeek: ${response.status}`)
      const data = await response.json()
      return data.choices[0].message.content
    }

    throw new Error(`Unknown provider: ${provider}`)
  } finally {
    clearTimeout(timeoutId)
  }
}

async function logAIRequest(
  sessionId: string,
  provider: string,
  model: string,
  userText: string,
  botText: string,
  type: string,
  error?: string
) {
  try {
    const supabase = createServerClient()
    await supabase.from('ai_logs').insert({
      session_id: sessionId,
      timestamp: new Date().toISOString(),
      type,
      user_text: userText.slice(0, 500),
      bot_text: botText.slice(0, 1000),
      provider,
      model,
      error: error || null,
    })
  } catch (e) {
    console.error('[AI] Log error:', e)
  }
}
