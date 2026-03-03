/**
 * Claude Provider — Генерация кода от Anthropic (платно, лучшее качество)
 * https://console.anthropic.com
 * Платно: $0.3/1M токенов (вход), $1.5/1M токенов (выход)
 */

import type { AIProvider, AIOptions, AIResponse, AIAnalysis, AICode } from '../types'

export class ClaudeProvider implements AIProvider {
  name = 'claude'
  enabled = true
  priority = 1 // Первый для генерации кода (лучшее качество)
  
  private apiKey: string
  private baseUrl = 'https://api.anthropic.com/v1'
  
  constructor(apiKey: string) {
    this.apiKey = apiKey
  }
  
  async generate(prompt: string, options?: AIOptions): Promise<AIResponse> {
    const start = Date.now()
    
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: options?.model || 'claude-3-5-sonnet-20241022',
        max_tokens: options?.maxTokens || 2048,
        system: 'Ты полезный ассистент.',
        messages: [{ role: 'user', content: prompt }]
      })
    })
    
    if (!response.ok) {
      throw new Error(`Claude error: ${response.status}`)
    }
    
    const data = await response.json()
    const duration = Date.now() - start
    
    return {
      text: data.content?.[0]?.text || '',
      provider: this.name,
      model: data.model,
      tokens: {
        input: data.usage?.input_tokens || 0,
        output: data.usage?.output_tokens || 0
      },
      cost: this.calculateCost(data.usage),
      duration
    }
  }
  
  async analyze(data: any, options?: AIOptions): Promise<AIAnalysis> {
    const prompt = this.buildAnalysisPrompt(data)
    const response = await this.generate(prompt, options)
    
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
    const codePrompt = `Создай профессиональный код сайта. Верни ТОЛЬКО JSON без лишнего текста:
{
  "html": "<!DOCTYPE html>...",
  "css": "body { ... }",
  "js": "..."
}

Описание: ${prompt}`
    
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
  
  async getStats(): Promise<any> {
    return {
      requestsToday: 0,
      tokensUsed: 0,
      costToday: 0,
      averageLatency: 0,
      successRate: 100
    }
  }
  
  private calculateCost(usage?: { input_tokens: number; output_tokens: number }): number {
    if (!usage) return 0
    
    // Тарифы Claude 3.5 Sonnet
    const inputCost = 0.003 // $ за 1K токенов
    const outputCost = 0.015 // $ за 1K токенов
    
    const costInUSD = (usage.input_tokens / 1000 * inputCost) + 
                      (usage.output_tokens / 1000 * outputCost)
    
    return costInUSD * 90 // Конвертация в рубли
  }
  
  private buildAnalysisPrompt(data: any): string {
    return `Проанализируй данные и верни JSON:
{
  "overall": 0-100,
  "scores": {"seo": 0-100, "performance": 0-100, "accessibility": 0-100, "best_practices": 0-100},
  "recommendations": ["список рекомендаций"]
}

Данные: ${JSON.stringify(data)}`
  }
}
