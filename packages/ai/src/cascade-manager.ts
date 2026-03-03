/**
 * AI Cascade Manager — Гибкое управление провайдерами
 */

import type { AIProvider, AIOptions, AIResponse, AIAnalysis, AICode } from '../types'

export interface CascadeConfig {
  providers: AIProvider[]
  strategy: 'cheapest' | 'fastest' | 'best' | 'fallback'
  maxRetries: number
  timeout: number
}

export class CascadeManager {
  private config: CascadeConfig
  
  constructor(config: CascadeConfig) {
    this.config = config
  }
  
  // Генерация текста с каскадом
  async generate(prompt: string, options?: AIOptions): Promise<AIResponse> {
    const providers = this.getProvidersByStrategy()
    let lastError: Error | null = null
    
    for (const provider of providers) {
      if (!provider.enabled) continue
      
      try {
        const result = await provider.generate(prompt, {
          ...options,
          timeout: this.config.timeout
        })
        
        // Логирование успеха
        await this.log('generate', provider.name, 'success', prompt, result)
        
        return result
      } catch (error) {
        lastError = error as Error
        console.warn(`[Cascade] ${provider.name} failed:`, error)
        await this.log('generate', provider.name, 'error', prompt, null, (error as Error).message)
      }
    }
    
    throw new Error(`All providers failed. Last error: ${lastError?.message}`)
  }
  
  // Анализ с каскадом
  async analyze(data: any, options?: AIOptions): Promise<AIAnalysis> {
    const providers = this.getProvidersByStrategy()
    
    for (const provider of providers) {
      if (!provider.enabled) continue
      
      try {
        const result = await provider.analyze(data, options)
        await this.log('analyze', provider.name, 'success', data, result)
        return result
      } catch (error) {
        console.warn(`[Cascade] ${provider.name} failed:`, error)
      }
    }
    
    throw new Error('All analysis providers failed')
  }
  
  // Генерация кода с каскадом
  async getCode(prompt: string, options?: AIOptions): Promise<AICode> {
    const providers = this.getProvidersByStrategy()
    
    for (const provider of providers) {
      if (!provider.enabled) continue
      
      try {
        const result = await provider.getCode(prompt, options)
        await this.log('getCode', provider.name, 'success', prompt, result)
        return result
      } catch (error) {
        console.warn(`[Cascade] ${provider.name} failed:`, error)
      }
    }
    
    throw new Error('All code generation providers failed')
  }
  
  // Детекция AI-текста
  async detectAI(text: string): Promise<any> {
    for (const provider of this.config.providers) {
      if (provider.detectAI && provider.enabled) {
        try {
          return await provider.detectAI(text)
        } catch (error) {
          console.warn(`[Cascade] ${provider.name} detectAI failed:`, error)
        }
      }
    }
    
    throw new Error('No AI detection providers available')
  }
  
  // Речь в текст
  async speechToText(audio: Blob): Promise<string> {
    for (const provider of this.config.providers) {
      if (provider.speechToText && provider.enabled) {
        try {
          return await provider.speechToText(audio)
        } catch (error) {
          console.warn(`[Cascade] ${provider.name} speechToText failed:`, error)
        }
      }
    }
    
    throw new Error('No speech-to-text providers available')
  }
  
  // Текст в речь
  async textToSpeech(text: string): Promise<Blob> {
    for (const provider of this.config.providers) {
      if (provider.textToSpeech && provider.enabled) {
        try {
          return await provider.textToSpeech(text)
        } catch (error) {
          console.warn(`[Cascade] ${provider.name} textToSpeech failed:`, error)
        }
      }
    }
    
    throw new Error('No text-to-speech providers available')
  }
  
  // Выбор провайдеров по стратегии
  private getProvidersByStrategy(): AIProvider[] {
    const { strategy, providers } = this.config
    
    switch (strategy) {
      case 'cheapest':
        // Сортировка по цене (дешёвые первыми)
        return [...providers].sort((a, b) => a.priority - b.priority)
      
      case 'fastest':
        // Сортировка по скорости (быстрые первыми)
        return [...providers].sort((a, b) => {
          // TODO: Получить latency из статистики
          return 0
        })
      
      case 'best':
        // Сортировка по качеству (качественные первыми)
        return [...providers].sort((a, b) => b.priority - a.priority)
      
      case 'fallback':
        // Порядок как задан
        return providers
      
      default:
        return providers
    }
  }
  
  // Логирование
  private async log(
    action: string,
    provider: string,
    status: 'success' | 'error',
    input: any,
    output: any,
    error?: string
  ) {
    console.log(`[Cascade] ${action} ${provider} ${status}:`, {
      input: typeof input === 'string' ? input.slice(0, 100) : input,
      output,
      error
    })
    
    // TODO: Сохранение в БД (ai_logs)
  }
}

// Фабрика для создания CascadeManager
export function createCascade(providers: AIProvider[], strategy: CascadeConfig['strategy'] = 'cheapest'): CascadeManager {
  return new CascadeManager({
    providers,
    strategy,
    maxRetries: 1,
    timeout: 15000
  })
}
