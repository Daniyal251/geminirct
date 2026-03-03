/**
 * AI Cascade — Единый интерфейс для всех AI-провайдеров
 */

export type AIProvider = 'groq' | 'gemini' | 'claude' | 'gigachat' | 'deepseek'

export interface AIConfig {
  providers: AIProvider[]
  timeout: number
  maxRetries: number
}

export interface AIResponse {
  text: string
  provider: AIProvider
  model: string
  tokens?: {
    input: number
    output: number
  }
}

// Конфигурация каскада
export const DEFAULT_CASCADE: AIConfig = {
  providers: ['groq', 'gigachat', 'gemini', 'claude', 'deepseek'],
  timeout: 15000,
  maxRetries: 1
}

// Вызов AI-провайдера
export async function callAI(
  prompt: string,
  config: AIConfig = DEFAULT_CASCADE
): Promise<AIResponse> {
  let lastError: Error | null = null

  for (const provider of config.providers) {
    try {
      const result = await callProvider(provider, prompt, config.timeout)
      
      // Логирование успеха
      await logAI(provider, 'success', prompt, result.text)
      
      return result
    } catch (error) {
      lastError = error as Error
      console.warn(`[AI] ${provider} failed:`, error)
      await logAI(provider, 'error', prompt, '', (error as Error).message)
    }
  }

  // Все провайдеры упали
  throw new Error(`All AI providers failed. Last error: ${lastError?.message}`)
}

// Вызов конкретного провайдера
async function callProvider(
  provider: AIProvider,
  prompt: string,
  timeout: number
): Promise<AIResponse> {
  switch (provider) {
    case 'groq':
      return callGroq(prompt, timeout)
    case 'gigachat':
      return callGigaChat(prompt, timeout)
    case 'gemini':
      return callGemini(prompt, timeout)
    case 'claude':
      return callClaude(prompt, timeout)
    case 'deepseek':
      return callDeepSeek(prompt, timeout)
    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}

// GigaChat (Сбер) — российский AI
async function callGigaChat(prompt: string, timeout: number): Promise<AIResponse> {
  const apiKey = process.env.GIGACHAT_API_KEY
  if (!apiKey) throw new Error('GIGACHAT_API_KEY not configured')

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch('https://gigachat.devices.sberbank.ru/api/v2/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'GigaChat-Pro',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2048
      }),
      signal: controller.signal
    })

    if (!response.ok) {
      throw new Error(`GigaChat: ${response.status}`)
    }

    const data = await response.json()
    
    return {
      text: data.choices[0].message.content,
      provider: 'gigachat',
      model: 'GigaChat-Pro',
      tokens: {
        input: data.usage?.prompt_tokens || 0,
        output: data.usage?.completion_tokens || 0
      }
    }
  } finally {
    clearTimeout(timeoutId)
  }
}

// Заглушки для других провайдеров (будут реализованы)
async function callGroq(prompt: string, timeout: number): Promise<AIResponse> {
  throw new Error('Groq not implemented yet')
}

async function callGemini(prompt: string, timeout: number): Promise<AIResponse> {
  throw new Error('Gemini not implemented yet')
}

async function callClaude(prompt: string, timeout: number): Promise<AIResponse> {
  throw new Error('Claude not implemented yet')
}

async function callDeepSeek(prompt: string, timeout: number): Promise<AIResponse> {
  throw new Error('DeepSeek not implemented yet')
}

// Логирование
async function logAI(
  provider: AIProvider,
  type: 'success' | 'error',
  prompt: string,
  response: string,
  error?: string
) {
  console.log(`[AI] ${type.toUpperCase()} ${provider}:`, {
    prompt: prompt.slice(0, 100),
    response: response.slice(0, 100),
    error
  })
  
  // TODO: Сохранение в БД (ai_logs)
}
