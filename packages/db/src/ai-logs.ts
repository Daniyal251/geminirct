/**
 * Логирование AI-запросов в БД (Supabase)
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface AILog {
  type: 'audit' | 'generate' | 'chat' | 'speech-to-text' | 'detect-ai'
  source: 'ai-architect' | 'hub' | 'website'
  user_id?: string
  session_id?: string
  
  // Входные данные
  input?: any
  
  // Результаты
  output?: any
  provider?: string
  model?: string
  
  // Метрики
  duration_ms?: number
  tokens_in?: number
  tokens_out?: number
  
  // Ошибки
  error_code?: string
  error_message?: string
  
  // Временные метки
  timestamp: string
}

/**
 * Сохранить лог в БД
 */
export async function logAIRequest(log: AILog) {
  try {
    const { error } = await supabase
      .from('ai_logs')
      .insert({
        type: log.type,
        source: log.source,
        user_id: log.user_id,
        session_id: log.session_id,
        input: log.input ? JSON.stringify(log.input) : null,
        output: log.output ? JSON.stringify(log.output) : null,
        provider: log.provider,
        model: log.model,
        duration_ms: log.duration_ms,
        tokens_in: log.tokens_in,
        tokens_out: log.tokens_out,
        error_code: log.error_code,
        error_message: log.error_message,
        timestamp: log.timestamp
      })
    
    if (error) {
      console.error('[DB] Log error:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('[DB] Log exception:', error)
    return false
  }
}

/**
 * Получить логи за период
 */
export async function getAILogs(options: {
  type?: string
  source?: string
  user_id?: string
  from?: string
  to?: string
  limit?: number
}) {
  try {
    let query = supabase
      .from('ai_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(options.limit || 100)
    
    if (options.type) {
      query = query.eq('type', options.type)
    }
    
    if (options.source) {
      query = query.eq('source', options.source)
    }
    
    if (options.user_id) {
      query = query.eq('user_id', options.user_id)
    }
    
    if (options.from) {
      query = query.gte('timestamp', options.from)
    }
    
    if (options.to) {
      query = query.lte('timestamp', options.to)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('[DB] Get logs error:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('[DB] Get logs exception:', error)
    return []
  }
}

/**
 * Получить статистику по AI-запросам
 */
export async function getAIStats(options: {
  from?: string
  to?: string
}) {
  try {
    const logs = await getAILogs(options)
    
    const stats = {
      total: logs.length,
      byType: {} as Record<string, number>,
      byProvider: {} as Record<string, number>,
      totalDuration: 0,
      totalTokens: 0,
      errors: 0
    }
    
    logs.forEach(log => {
      // По типам
      stats.byType[log.type] = (stats.byType[log.type] || 0) + 1
      
      // По провайдерам
      if (log.provider) {
        stats.byProvider[log.provider] = (stats.byProvider[log.provider] || 0) + 1
      }
      
      // Длительность
      stats.totalDuration += log.duration_ms || 0
      
      // Токены
      stats.totalTokens += (log.tokens_in || 0) + (log.tokens_out || 0)
      
      // Ошибки
      if (log.error_code) {
        stats.errors++
      }
    })
    
    return {
      ...stats,
      avgDuration: stats.total.length ? Math.round(stats.totalDuration / stats.total) : 0,
      errorRate: stats.total.length ? Math.round((stats.errors / stats.total) * 100) : 0
    }
  } catch (error) {
    console.error('[DB] Get stats exception:', error)
    return null
  }
}
