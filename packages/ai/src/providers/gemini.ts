/**
 * Gemini Provider — Анализ от Google (бесплатно)
 * https://aistudio.google.com
 * Бесплатно: 1500 запросов/день, 10 запросов/мин
 */

import type { AIProvider, AIOptions, AIResponse, AIAnalysis, AICode } from '../types'

export class GeminiProvider implements AIProvider {
  name = 'gemini'
  enabled = true
  priority = 3 // Третий (хороший анализ, бесплатно)
  
  private apiKey: string
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models'
  
  constructor(apiKey: string) {
    this.apiKey = apiKey
  }
  
  async generate(prompt: string, options?: AIOptions): Promise<AIResponse> {
    const start = Date.now()
    
    const response = await fetch(
      `${this.baseUrl}/${options?.model || 'gemini-1.5-flash'}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            maxOutputTokens: options?.maxTokens || 2048,
            temperature: options?.temperature || 0.7
          }
        })
      }
    )
    
    if (!response.ok) {
      throw new Error(`Gemini error: ${response.status}`)
    }
    
    const data = await response.json()
    const duration = Date.now() - start
    
    return {
      text: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
      provider: this.name,
      model: options?.model || 'gemini-1.5-flash',
      tokens: {
        input: data.usageMetadata?.promptTokenCount || 0,
        output: data.usageMetadata?.candidatesTokenCount || 0
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
