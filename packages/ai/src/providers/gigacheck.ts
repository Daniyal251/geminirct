/**
 * GigaCheck Provider — Определение AI-текста (Сбер)
 * https://gigacheck.devices.sberbank.ru
 * Российская технология детекции AI-контента
 */

import type { AIProvider, AIOptions, AIResponse, AIDetection } from '../types'

export class GigaCheckProvider implements AIProvider {
  name = 'gigacheck'
  enabled = true
  priority = 1 // Первый для детекции (российский)
  
  private apiKey: string
  private baseUrl = 'https://gigacheck.devices.sberbank.ru/api/v1'
  
  constructor(apiKey: string) {
    this.apiKey = apiKey
  }
  
  async generate(prompt: string, options?: AIOptions): Promise<AIResponse> {
    throw new Error('GigaCheck does not support text generation')
  }
  
  async analyze(data: any, options?: AIOptions): Promise<any> {
    throw new Error('GigaCheck is for AI detection only')
  }
  
  async getCode(prompt: string, options?: AIOptions): Promise<any> {
    throw new Error('GigaCheck does not support code generation')
  }
  
  async detectAI(text: string): Promise<AIDetection> {
    const response = await fetch(`${this.baseUrl}/detect`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    })
    
    if (!response.ok) {
      throw new Error(`GigaCheck error: ${response.status}`)
    }
    
    const data = await response.json()
    
    return {
      isAI: data.is_ai || false,
      confidence: data.confidence || 0,
      model: data.model
    }
  }
  
  async getStats(): Promise<any> {
    return {
      requestsToday: 0,
      textsChecked: 0,
      costToday: 0,
      averageLatency: 0,
      successRate: 100
    }
  }
}
