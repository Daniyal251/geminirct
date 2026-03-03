/**
 * Groq Provider — Быстрые запросы (бесплатно)
 * https://console.groq.com
 * Бесплатно: 1000 запросов/день, 30 запросов/мин
 */

import type { AIProvider, AIOptions, AIResponse, AIAnalysis, AICode } from '../types'

export class GroqProvider implements AIProvider {
  name = 'groq'
  enabled = true
  priority = 2 // Второй после GigaChat (быстро, бесплатно)
  
  private apiKey: string
  private baseUrl = 'https://api.groq.com/openai/v1'
  
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
        model: options?.model || 'llama-3.1-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options?.maxTokens || 2048,
        temperature: options?.temperature || 0.7
      })
    })
    
    if (!response.ok) {
      throw new Error(`Groq error: ${response.status}`)
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
      cost: 0, // Бесплатно
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
    // Groq не предоставляет API статистики
    return {
      requestsToday: 0,
      tokensUsed: 0,
      costToday: 0,
      averageLatency: 0,
      successRate: 100
    }
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
