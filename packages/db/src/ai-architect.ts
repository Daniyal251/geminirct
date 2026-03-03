/**
 * Интеграция с БД для AI Architect
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * Получить все аудиты
 */
export async function getAudits(options?: { limit?: number; offset?: number }) {
  try {
    let query = supabase
      .from('ai_audits')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10))
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return data || []
  } catch (error) {
    console.error('Get audits error:', error)
    return []
  }
}

/**
 * Получить все генерации
 */
export async function getGenerations(options?: { limit?: number; offset?: number }) {
  try {
    let query = supabase
      .from('ai_generations')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10))
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return data || []
  } catch (error) {
    console.error('Get generations error:', error)
    return []
  }
}

/**
 * Получить все заявки
 */
export async function getLeads(options?: { status?: string; limit?: number }) {
  try {
    let query = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (options?.status) {
      query = query.eq('status', options.status)
    }
    
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return data || []
  } catch (error) {
    console.error('Get leads error:', error)
    return []
  }
}

/**
 * Получить статистику
 */
export async function getAIStats() {
  try {
    const [audits, generations, leads] = await Promise.all([
      getAudits({ limit: 1000 }),
      getGenerations({ limit: 1000 }),
      getLeads({ limit: 1000 })
    ])
    
    return {
      audits: {
        today: audits.filter(a => new Date(a.created_at).toDateString() === new Date().toDateString()).length,
        total: audits.length
      },
      generations: {
        today: generations.filter(g => new Date(g.created_at).toDateString() === new Date().toDateString()).length,
        total: generations.length
      },
      leads: {
        today: leads.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length,
        total: leads.length
      }
    }
  } catch (error) {
    console.error('Get stats error:', error)
    return null
  }
}
