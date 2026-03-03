/**
 * AI Provider Interface — Единый интерфейс для всех AI-провайдеров
 */

export interface AIProvider {
  name: string
  enabled: boolean
  priority: number
  
  // Основные методы
  generate(prompt: string, options?: AIOptions): Promise<AIResponse>
  analyze(data: any, options?: AIOptions): Promise<AIAnalysis>
  getCode(prompt: string, options?: AIOptions): Promise<AICode>
  
  // Методы для речи (SaluteSpeech)
  speechToText?(audio: Blob): Promise<string>
  textToSpeech?(text: string): Promise<Blob>
  
  // Методы для детекции (GigaCheck)
  detectAI?(text: string): Promise<AIDetection>
  
  // Статистика
  getStats?(): Promise<ProviderStats>
}

export interface AIOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  timeout?: number
  retryCount?: number
}

export interface AIResponse {
  text: string
  provider: string
  model: string
  tokens?: {
    input: number
    output: number
  }
  cost?: number
  duration?: number
}

export interface AIAnalysis {
  overall: number
  scores: Record<string, number>
  recommendations: string[]
  raw?: any
}

export interface AICode {
  html?: string
  css?: string
  js?: string
  files?: Record<string, string>
}

export interface AIDetection {
  isAI: boolean
  confidence: number
  model?: string
}

export interface ProviderStats {
  requestsToday: number
  tokensUsed: number
  costToday: number
  averageLatency: number
  successRate: number
}
