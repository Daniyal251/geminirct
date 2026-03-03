'use client'

import { useState } from 'react'
import { clsx } from 'clsx'

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: 'assistant', content: 'Здравствуйте! 👋 Я ИИ-ассистент RCT.\n\nРасскажу об услугах, ценах, сроках — спрашивайте!' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          sessionId: `web_${Date.now()}`,
        }),
      })

      const data = await response.json()
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.text || 'Ошибка получения ответа' 
      }])
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '⚠️ Ошибка подключения к AI сервису' 
      }])
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    { label: '💰 Цены', text: 'Сколько стоит сайт?' },
    { label: '🏥 Мед', text: 'Расскажите о медоборудовании' },
    { label: '🎬 Контент', text: 'Что такое AI-контент?' },
    { label: '📝 Заказать', text: 'Хочу заказать' },
  ]

  return (
    <>
      {/* Кнопка */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-accent to-accent2 text-bg text-2xl font-bold shadow-lg shadow-accent-glow transition-all duration-300 z-50',
          isOpen && 'rotate-90 scale-110'
        )}
      >
        🤖
      </button>

      {/* Панель чата */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[520px] max-h-[calc(100vh-140px)] bg-bg2 border border-border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Заголовок */}
          <div className="p-4 bg-gradient-to-r from-accent/10 to-accent2/5 border-b border-border flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-text">🤖 ИИ‑ассистент RCT</h3>
              <p className="text-xs text-text2">Multi-AI · Groq + Gemini + Claude</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg text-text2 hover:bg-bg3 hover:text-text transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Сообщения */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={clsx(
                  'max-w-[85%] p-3 rounded-xl text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'ml-auto bg-accent-glow text-text'
                    : 'bg-bg3 text-text'
                )}
              >
                {msg.content.split('\n').map((line, j) => (
                  <p key={j}>{line}</p>
                ))}
              </div>
            ))}
            {loading && (
              <div className="flex gap-1 p-3 bg-bg3 rounded-xl w-fit">
                <span className="w-2 h-2 rounded-full bg-text3 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-text3 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-text3 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>

          {/* Быстрые действия */}
          {!loading && messages.length < 3 && (
            <div className="px-4 pb-3 flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => {
                    setInput(action.text)
                    setTimeout(() => sendMessage(), 10)
                  }}
                  className="px-3 py-1.5 text-xs bg-bg3 border border-border rounded-full text-text2 hover:bg-accent hover:text-bg transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Ввод */}
          <div className="p-3 border-t border-border bg-bg3/50 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Задайте вопрос..."
              disabled={loading}
              className="flex-1 px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text focus:outline-none focus:border-accent disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-lg bg-gradient-to-r from-accent to-accent2 text-bg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-105"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  )
}
