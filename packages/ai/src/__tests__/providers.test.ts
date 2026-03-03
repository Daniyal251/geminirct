/**
 * Тесты для AI провайдеров
 * Запуск: npm test
 */

import { GigaChatProvider } from './providers/gigachat'
import { GroqProvider } from './providers/groq'
import { GeminiProvider } from './providers/gemini'
import { ClaudeProvider } from './providers/claude'
import { DeepSeekProvider } from './providers/deepseek'
import { GigaCheckProvider } from './providers/gigacheck'
import { YandexGPTProvider } from './providers/yandexgpt'
import { CascadeManager, createCascade } from './cascade-manager'

// Mock API keys (для тестов)
const MOCK_KEYS = {
  gigachat: process.env.GIGACHAT_API_KEY || 'mock-key',
  groq: process.env.GROQ_API_KEY || 'mock-key',
  gemini: process.env.GEMINI_API_KEY || 'mock-key',
  claude: process.env.CLAUDE_API_KEY || 'mock-key',
  deepseek: process.env.DEEPSEEK_API_KEY || 'mock-key',
  gigacheck: process.env.GIGACHECK_API_KEY || 'mock-key',
  yandexgpt: process.env.YANDEXGPT_IAM_TOKEN || 'mock-key'
}

// Тестовые данные
const TEST_PROMPT = 'Привет! Напиши короткий текст о себе.'
const TEST_CODE_PROMPT = 'Создай простой HTML сайт с заголовком "Привет"'
const TEST_ANALYSIS_DATA = {
  url: 'https://example.com',
  html: '<html><head><title>Test</title></head><body><h1>Test</h1></body></html>'
}

describe('AI Providers', () => {
  
  describe('GigaChatProvider', () => {
    let provider: GigaChatProvider
    
    beforeEach(() => {
      provider = new GigaChatProvider(MOCK_KEYS.gigachat)
    })
    
    test('should create provider', () => {
      expect(provider.name).toBe('gigachat')
      expect(provider.enabled).toBe(true)
      expect(provider.priority).toBe(1)
    })
    
    test('should generate text', async () => {
      const result = await provider.generate(TEST_PROMPT)
      expect(result.provider).toBe('gigachat')
      expect(typeof result.text).toBe('string')
    })
    
    test('should analyze data', async () => {
      const result = await provider.analyze(TEST_ANALYSIS_DATA)
      expect(result.overall).toBeDefined()
      expect(result.scores).toBeDefined()
    })
    
    test('should generate code', async () => {
      const result = await provider.getCode(TEST_CODE_PROMPT)
      expect(result.html).toBeDefined()
      expect(result.css).toBeDefined()
      expect(result.js).toBeDefined()
    })
  })
  
  describe('GroqProvider', () => {
    let provider: GroqProvider
    
    beforeEach(() => {
      provider = new GroqProvider(MOCK_KEYS.groq)
    })
    
    test('should create provider', () => {
      expect(provider.name).toBe('groq')
      expect(provider.priority).toBe(2)
    })
    
    test('should generate text quickly', async () => {
      const start = Date.now()
      const result = await provider.generate(TEST_PROMPT)
      const duration = Date.now() - start
      
      expect(result.provider).toBe('groq')
      expect(duration).toBeLessThan(1000) // Быстро (< 1s)
    })
  })
  
  describe('GeminiProvider', () => {
    let provider: GeminiProvider
    
    beforeEach(() => {
      provider = new GeminiProvider(MOCK_KEYS.gemini)
    })
    
    test('should create provider', () => {
      expect(provider.name).toBe('gemini')
      expect(provider.priority).toBe(3)
    })
    
    test('should analyze data well', async () => {
      const result = await provider.analyze(TEST_ANALYSIS_DATA)
      expect(result.scores.seo).toBeDefined()
      expect(result.scores.performance).toBeDefined()
    })
  })
  
  describe('ClaudeProvider', () => {
    let provider: ClaudeProvider
    
    beforeEach(() => {
      provider = new ClaudeProvider(MOCK_KEYS.claude)
    })
    
    test('should create provider', () => {
      expect(provider.name).toBe('claude')
      expect(provider.priority).toBe(1) // Для кода
    })
    
    test('should generate high-quality code', async () => {
      const result = await provider.getCode(TEST_CODE_PROMPT)
      expect(result.html).toContain('<!DOCTYPE html>')
      expect(result.html).toContain('</html>')
    })
  })
  
  describe('DeepSeekProvider', () => {
    let provider: DeepSeekProvider
    
    beforeEach(() => {
      provider = new DeepSeekProvider(MOCK_KEYS.deepseek)
    })
    
    test('should create provider', () => {
      expect(provider.name).toBe('deepseek')
      expect(provider.priority).toBe(5) // Резерв
    })
    
    test('should be cheap', async () => {
      const result = await provider.generate(TEST_PROMPT)
      expect(result.cost).toBeLessThan(1) // Очень дёшево
    })
  })
  
  describe('GigaCheckProvider', () => {
    let provider: GigaCheckProvider
    
    beforeEach(() => {
      provider = new GigaCheckProvider(MOCK_KEYS.gigacheck)
    })
    
    test('should create provider', () => {
      expect(provider.name).toBe('gigacheck')
    })
    
    test('should detect AI text', async () => {
      const aiText = 'Это текст сгенерированный искусственным интеллектом'
      const result = await provider.detectAI(aiText)
      expect(result.isAI).toBeDefined()
      expect(result.confidence).toBeDefined()
    })
  })
  
  describe('YandexGPTProvider', () => {
    let provider: YandexGPTProvider
    
    beforeEach(() => {
      provider = new YandexGPTProvider(MOCK_KEYS.yandexgpt, 'mock-folder-id')
    })
    
    test('should create provider', () => {
      expect(provider.name).toBe('yandexgpt')
      expect(provider.priority).toBe(4) // Российский резерв
    })
    
    test('should generate text', async () => {
      const result = await provider.generate(TEST_PROMPT)
      expect(result.provider).toBe('yandexgpt')
    })
  })
  
  describe('CascadeManager', () => {
    let cascade: CascadeManager
    
    beforeEach(() => {
      const providers = [
        new GigaChatProvider(MOCK_KEYS.gigachat),
        new GroqProvider(MOCK_KEYS.groq),
        new GeminiProvider(MOCK_KEYS.gemini)
      ]
      cascade = createCascade(providers, 'cheapest')
    })
    
    test('should create cascade', () => {
      expect(cascade).toBeDefined()
    })
    
    test('should generate with fallback', async () => {
      const result = await cascade.generate(TEST_PROMPT)
      expect(result.text).toBeDefined()
      expect(result.provider).toBeDefined()
    })
    
    test('should analyze with fallback', async () => {
      const result = await cascade.analyze(TEST_ANALYSIS_DATA)
      expect(result.overall).toBeDefined()
    })
    
    test('should generate code with fallback', async () => {
      const result = await cascade.getCode(TEST_CODE_PROMPT)
      expect(result.html).toBeDefined()
    })
  })
})

// Integration tests
describe('Integration Tests', () => {
  
  test('should work with all providers', async () => {
    const providers = [
      new GigaChatProvider(MOCK_KEYS.gigachat),
      new GroqProvider(MOCK_KEYS.groq),
      new GeminiProvider(MOCK_KEYS.gemini),
      new ClaudeProvider(MOCK_KEYS.claude),
      new DeepSeekProvider(MOCK_KEYS.deepseek),
      new YandexGPTProvider(MOCK_KEYS.yandexgpt, 'mock-folder-id')
    ]
    
    for (const provider of providers) {
      const result = await provider.generate(TEST_PROMPT)
      expect(result.text).toBeDefined()
      expect(result.provider).toBeDefined()
    }
  })
  
  test('should detect AI text', async () => {
    const provider = new GigaCheckProvider(MOCK_KEYS.gigacheck)
    const result = await provider.detectAI('Test text')
    expect(result.isAI).toBeDefined()
  })
})
