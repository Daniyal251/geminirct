/**
 * Тесты для API endpoints AI Architect
 * Запуск: npm test
 */

import { describe, it, expect, beforeEach } from 'vitest'

const API_BASE = 'http://localhost:3002/api'

describe('AI Architect API', () => {
  
  describe('POST /api/audit', () => {
    it('should audit a website', async () => {
      const response = await fetch(`${API_BASE}/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: 'https://example.com'
        })
      })
      
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.overall).toBeDefined()
      expect(data.data.scores).toBeDefined()
      expect(data.data.recommendations).toBeDefined()
    })
    
    it('should return error for invalid URL', async () => {
      const response = await fetch(`${API_BASE}/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
    })
  })
  
  describe('POST /api/generate', () => {
    it('should generate a website', async () => {
      const response = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'landing',
          description: 'Сайт для стоматологии'
        })
      })
      
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.html).toBeDefined()
      expect(data.data.css).toBeDefined()
      expect(data.data.js).toBeDefined()
    })
    
    it('should return error for missing description', async () => {
      const response = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'landing'
        })
      })
      
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
    })
  })
  
  describe('POST /api/chat', () => {
    it('should respond to a message', async () => {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Сколько стоит сайт?'
        })
      })
      
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.text).toBeDefined()
      expect(data.data.provider).toBeDefined()
    })
    
    it('should return error for empty message', async () => {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
    })
  })
  
  describe('POST /api/detect-ai', () => {
    it('should detect AI text', async () => {
      const response = await fetch(`${API_BASE}/detect-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Этот текст был сгенерирован искусственным интеллектом для тестирования системы детекции AI-контента.'
        })
      })
      
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.isAI).toBeDefined()
      expect(data.data.confidence).toBeDefined()
    })
    
    it('should return error for short text', async () => {
      const response = await fetch(`${API_BASE}/detect-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Короткий текст'
        })
      })
      
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
    })
  })
  
  describe('POST /api/export', () => {
    it('should export website to ZIP', async () => {
      const response = await fetch(`${API_BASE}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: '<!DOCTYPE html><html><head><title>Test</title></head><body><h1>Test</h1></body></html>',
          css: 'body { font-family: Arial; }',
          js: 'console.log("Hello")',
          filename: 'test-website'
        })
      })
      
      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('application/zip')
      expect(response.headers.get('Content-Disposition')).toContain('attachment')
    })
    
    it('should return error for missing HTML', async () => {
      const response = await fetch(`${API_BASE}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          css: 'body {}',
          js: ''
        })
      })
      
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
    })
  })
})

describe('AI Logs API', () => {
  
  it('should log audit request', async () => {
    // TODO: Интеграция с Supabase
    expect(true).toBe(true)
  })
  
  it('should log generate request', async () => {
    // TODO: Интеграция с Supabase
    expect(true).toBe(true)
  })
  
  it('should get AI stats', async () => {
    // TODO: Интеграция с Supabase
    expect(true).toBe(true)
  })
})
