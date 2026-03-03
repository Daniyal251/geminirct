/**
 * GigaChat Provider — основной AI от Сбера
 */

import type { AIProvider, AIOptions, AIResponse, AIAnalysis, AICode } from '../types'

export class GigaChatProvider implements AIProvider {
  name = 'gigachat'
  enabled = true
  priority = 1 // Высокий приоритет (дешёвый, РФ)
  
  private apiKey: string
  private baseUrl = 'https://gigachat.devices.sberbank.ru/api/v2'
  
  constructor(apiKey: string) {
    this.apiKey = apiKey
  }
  
  async generate(prompt: string, options?: AIOptions): Promise<AIResponse> {
    const start = Date.now()
    
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: options?.model || 'GigaChat-Pro',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options?.maxTokens || 2048,
        temperature: options?.temperature || 0.7
      })
    })
    
    if (!response.ok) {
      throw new Error(`GigaChat error: ${response.status}`)
    }
    
    const data = await response.json()
    const duration = Date.now() - start
    
    return {
      text: data.choices[0].message.content,
      provider: this.name,
      model: data.model,
      tokens: {
        input: data.usage?.prompt_tokens || 0,
        output: data.usage?.completion_tokens || 0
      },
      cost: this.calculateCost(data.usage),
      duration
    }
  }
  
  async analyze(data: any, options?: AIOptions): Promise<AIAnalysis> {
    // Анализ сайта, документа и т.д.
    const prompt = this.buildAnalysisPrompt(data)
    const response = await this.generate(prompt, options)
    
    // Парсим JSON из ответа
    try {
      const analysis = JSON.parse(response.text)
      return {
        overall: analysis.overall || 0,
        scores: analysis.scores || {},
        recommendations: analysis.recommendations || [],
        raw: analysis
      }
    } catch (e) {
      throw new Error('Failed to parse analysis result')
    }
  }
  
  async getCode(prompt: string, options?: AIOptions): Promise<AICode> {
    const codePrompt = `Создай код сайта. Верни JSON: {html, css, js}.\n\n${prompt}`
    const response = await this.generate(codePrompt, options)
    
    try {
      const code = JSON.parse(response.text)
      return {
        html: code.html,
        css: code.css,
        js: code.js,
        files: {
          'index.html': code.html,
          'styles.css': code.css,
          'script.js': code.js
        }
      }
    } catch (e) {
      throw new Error('Failed to parse code result')
    }
  }
  
  async detectAI(text: string): Promise<any> {
    // GigaCheck — определение AI-текста
    const response = await fetch('https://gigacheck.devices.sberbank.ru/api/v1/detect', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    })
    
    const data = await response.json()
    
    return {
      isAI: data.is_ai || false,
      confidence: data.confidence || 0,
      model: data.model
    }
  }
  
  async getStats(): Promise<any> {
    // TODO: Получить статистику использования из API Сбера
    return {
      requestsToday: 0,
      tokensUsed: 0,
      costToday: 0,
      averageLatency: 0,
      successRate: 100
    }
  }
  
  private calculateCost(usage?: { prompt_tokens: number; completion_tokens: number }): number {
    if (!usage) return 0
    
    // Тарифы GigaChat (примерные)
    const inputCost = 0.05 // ₽ за 1K токенов
    const outputCost = 0.15 // ₽ за 1K токенов
    
    return (usage.prompt_tokens / 1000 * inputCost) + 
           (usage.completion_tokens / 1000 * outputCost)
  }
  
  private buildAnalysisPrompt(data: any): string {
    return `Проанализируй данные и верни JSON:
{
  "overall": 0-100,
  "scores": {"seo": 0-100, "performance": 0-100, ...},
  "recommendations": ["список"]
}

Данные: ${JSON.stringify(data)}`
  }
}
