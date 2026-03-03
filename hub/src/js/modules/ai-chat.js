/**
 * AI Chat Module
 * Multi-LLM cascade: Groq → Gemini → Claude → DeepSeek
 */

import { Config } from './config.js';

export class AIChat {
  constructor(appState) {
    this.state = appState;
    this.messages = [];
    this.sessionId = 'web_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    this.isReady = false;
    
    this.init();
  }

  async init() {
    await Config.load();
    const cascade = Config.getAICascade();
    this.isReady = cascade.length > 0;
    
    console.log('[AIChat] Initialized with cascade:', cascade);
  }

  // Get system prompt for RCT assistant
  getSystemPrompt() {
    return `Ты ИИ-ассистент компании RCT (Российские Компьютерные Технологии).

КОМПАНИЯ:
- Локализация: Казань, ОЭЗ «Иннополис», Республика Татарстан
- 4 направления: Медоборудование, Сайты, AI-контент, ИИ-агенты

НАПРАВЛЕНИЯ:

1. 🏥 МЕДОБОРУДОВАНИЕ (РКТ)
   - КТ-сканеры 16-128 срезов (OEM с Syno-Tech)
   - Рентген, ПЭТ/КТ, маммографы
   - Производство в Иннополисе
   - План: 155 КТ/год к 2028
   - Инвестиции: 6.3 млрд ₽

2. 🌐 САЙТЫ
   - Визитка: 5 000₽ (1-3 страницы)
   - Лендинг: 10 000₽
   - Каталог: 15 000₽
   - Премиум: 25 000₽
   - Срок: 3-7 дней
   - AI-ассистент в комплекте

3. 🎬 AI-КОНТЕНТ
   - Рекламные видео
   - Фото для маркетплейсов
   - Виртуальные инфлюенсеры
   - SMM контент
   - В 3-5 раз дешевле съёмки

4. 🤖 ИИ-АГЕНТЫ
   - Telegram-боты с Claude AI
   - CRM-автоматизация
   - n8n workflows
   - Новостные боты

КОНТАКТЫ:
- Email: info@rct-hub.ru, info@rct-med.ru
- Telegram: @AIhroject_bot
- Сайты: rct-hub.ru, rct-med.ru

ОТВЕЧАЙ:
- Кратко и по делу
- На русском языке
- Используй эмодзи для наглядности
- Предлагай связаться для деталей`;
  }

  // Main call method with cascade
  async call(text) {
    if (!this.isReady) {
      await this.init();
      if (!this.isReady) {
        return {
          text: '⚠️ AI не настроен. Добавьте API ключи в админ-панели.',
          provider: 'none',
          model: 'none'
        };
      }
    }

    const cascade = Config.getAICascade();
    const timeout = Config.get('AI_TIMEOUT_MS') || 15000;
    const systemPrompt = this.getSystemPrompt();

    let lastError = null;

    for (const provider of cascade) {
      try {
        const result = await this.callProvider(provider, text, systemPrompt, timeout);
        
        // Log success
        this.log('success', text, result.text, provider, result.model);
        
        return result;
      } catch (error) {
        lastError = error;
        console.warn(`[AIChat] ${provider} failed:`, error.message);
        this.log('error', text, '', provider, '', error.message);
      }
    }

    // All providers failed
    return {
      text: `⚠️ Все AI сервисы недоступны.\nПоследняя ошибка: ${lastError?.message}\n\nПопробуйте позже или напишите нам: @AIhroject_bot`,
      provider: 'none',
      model: 'none'
    };
  }

  // Call specific provider
  async callProvider(provider, text, systemPrompt, timeout) {
    const config = Config.getAll();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      let response;
      let data;

      if (provider === 'groq') {
        response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.GROQ_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.1-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              ...this.messages,
              { role: 'user', content: text }
            ],
            max_tokens: 1024,
            temperature: 0.7
          }),
          signal: controller.signal
        });

        if (!response.ok) throw new Error(`Groq: ${response.status}`);
        data = await response.json();
        
        return {
          text: data.choices[0].message.content,
          provider: 'groq',
          model: 'llama-3.1-70b',
          tokens: data.usage
        };

      } else if (provider === 'gemini') {
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.GEMINI_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `${systemPrompt}\n\nUser: ${text}`
                }]
              }],
              generationConfig: {
                maxOutputTokens: 1024,
                temperature: 0.7
              }
            }),
            signal: controller.signal
          }
        );

        if (!response.ok) throw new Error(`Gemini: ${response.status}`);
        data = await response.json();
        
        return {
          text: data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response',
          provider: 'gemini',
          model: 'gemini-1.5-flash'
        };

      } else if (provider === 'claude') {
        response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': config.CLAUDE_KEY,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1024,
            system: systemPrompt,
            messages: [
              ...this.messages.map(m => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.content
              })),
              { role: 'user', content: text }
            ]
          }),
          signal: controller.signal
        });

        if (!response.ok) throw new Error(`Claude: ${response.status}`);
        data = await response.json();
        
        return {
          text: data.content?.[0]?.text || 'No response',
          provider: 'claude',
          model: 'claude-3-haiku',
          tokens: data.usage
        };

      } else if (provider === 'deepseek') {
        response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.DEEPSEEK_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: systemPrompt },
              ...this.messages,
              { role: 'user', content: text }
            ],
            max_tokens: 1024,
            temperature: 0.7
          }),
          signal: controller.signal
        });

        if (!response.ok) throw new Error(`DeepSeek: ${response.status}`);
        data = await response.json();
        
        return {
          text: data.choices[0].message.content,
          provider: 'deepseek',
          model: 'deepseek-chat',
          tokens: data.usage
        };
      }

      throw new Error(`Unknown provider: ${provider}`);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Add message to history
  addMessage(role, content) {
    this.messages.push({ role, content });
    
    // Keep last 20 messages
    if (this.messages.length > 20) {
      this.messages = this.messages.slice(-20);
    }
  }

  // Clear conversation
  clear() {
    this.messages = [];
  }

  // Log chat to database
  async log(type, userText, botText, provider, model, error = '') {
    const config = Config.getAll();
    
    try {
      await fetch(`${config.API_URL}/rest/v1/ai_logs`, {
        method: 'POST',
        headers: {
          'apikey': config.API_KEY,
          'Authorization': `Bearer ${config.API_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          session_id: this.sessionId,
          timestamp: new Date().toISOString(),
          type,
          user_text: userText.slice(0, 500),
          bot_text: botText.slice(0, 1000),
          provider,
          model,
          error,
          user_id: this.state.user?.id || 'anonymous'
        })
      });
    } catch (e) {
      console.error('[AIChat] Log error:', e);
    }
  }
}
