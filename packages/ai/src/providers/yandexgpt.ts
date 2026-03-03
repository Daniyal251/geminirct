/**
 * YandexGPT Provider — Российский резерв (Яндекс)
 * https://cloud.yandex.ru/services/yandexgpt
 * Российская модель, данные в РФ
 */

import type { AIProvider, AIOptions, AIResponse, AIAnalysis, AICode } from '../types'

export class YandexGPTProvider implements AIProvider {
  name = 'yandexgpt'
  enabled = true
  priority = 4 // Четвёртый (российский резерв)
  
  private iamToken: string
  private folderId: string
  private baseUrl = 'https://llm.api.cloud.yandex.net/foundationModels/v1'
  
  constructor(iamToken: string, folderId: string) {
    this.iamToken = iamToken
    this.folderId = folderId
  }
  
  async generate(prompt: string, options?: AIOptions): Promise<AIResponse> {
    const start = Date.now()
    
    const response = await fetch(`${this.baseUrl}/completion`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.iamToken}`,
        'x-cloud-folder-id': this.folderId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        modelUri: `gpt://${this.folderId}/yandexgpt/latest`,
        completionOptions: {
          stream: false,
          temperature: options?.temperature || 0.7,
          maxTokens: options?.maxTokens || 2048
        },
        messages: [{ role: 'user', text: prompt }]
      })
    })
    
    if (!response.ok) {
      throw new Error(`YandexGPT error: ${response.status}`)
    }
    
    const data = await response.json()
    const duration = Date.now() - start
    
    return {
      text: data.result?.alternatives?.[0]?.message?.text || '',
      provider: this.name,
      model: 'yandexgpt',
      tokens: {
        input: data.result?.usage?.inputTextTokens || 0,
        output: data.result?.usage?.completionTokens || 0
      },
      cost: this.calculateCost(data.result?.usage),
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
  
  async getStats(): Promise<any> {
    return {
      requestsToday: 0,
      tokensUsed: 0,
      costToday: 0,
      averageLatency: 0,
      successRate: 100
    }
  }
  
  private calculateCost(usage?: { inputTextTokens: number; completionTokens: number }): number {
    if (!usage) return 0
    
    // Тарифы YandexGPT (примерные)
    const inputCost = 0.05 // ₽ за 1K токенов
    const outputCost = 0.15 // ₽ за 1K токенов
    
    return (usage.inputTextTokens / 1000 * inputCost) + 
           (usage.completionTokens / 1000 * outputCost)
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
