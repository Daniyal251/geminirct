/**
 * Configuration Module
 * Управление настройками приложения и API ключами
 */

const STORAGE_KEY = 'rkt_hub_config';

const DEFAULT_CONFIG = {
  API_URL: 'https://prparzgqevfelwsndmkc.supabase.co',
  API_KEY: 'sb_publishable_gFeXATQGYxKx08BpeOedZg_7buTwVJq',
  AI_URL: '',
  GROQ_KEY: '',
  GEMINI_KEY: '',
  CLAUDE_KEY: '',
  DEEPSEEK_KEY: '',
  TG_BOT: '',
  TG_BOT_TOKEN: '',
  GITHUB_TOKEN: '',
  GITHUB_REPO: '',
  AI_CASCADE: ['groq', 'gemini', 'claude', 'deepseek'],
  AI_TIMEOUT_MS: 15000
};

export const Config = {
  config: { ...DEFAULT_CONFIG },

  async load() {
    // Try localStorage first
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
        return;
      } catch (e) {
        console.error('[Config] Failed to parse saved config:', e);
      }
    }

    // Load from Supabase settings table
    try {
      const response = await fetch(
        `${this.config.API_URL}/rest/v1/settings?select=key,value`,
        {
          headers: {
            'apikey': this.config.API_KEY,
            'Authorization': `Bearer ${this.config.API_KEY}`
          }
        }
      );
      
      if (response.ok) {
        const rows = await response.json();
        if (Array.isArray(rows)) {
          rows.forEach(row => {
            if (row.key && row.value !== undefined) {
              this.config[row.key] = row.value;
            }
          });
          this.save();
        }
      }
    } catch (e) {
      console.error('[Config] Failed to load from Supabase:', e);
    }
  },

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
  },

  get(key) {
    return this.config[key] || DEFAULT_CONFIG[key];
  },

  set(key, value) {
    this.config[key] = value;
    this.save();
  },

  getAll() {
    return { ...this.config };
  },

  async update(key, value) {
    this.set(key, value);
    
    // Sync to Supabase if settings table exists
    try {
      await fetch(`${this.config.API_URL}/rest/v1/settings`, {
        method: 'POST',
        headers: {
          'apikey': this.config.API_KEY,
          'Authorization': `Bearer ${this.config.API_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({ key, value })
      });
    } catch (e) {
      console.error('[Config] Failed to sync to Supabase:', e);
    }
  },

  // Get cascade of AI providers (only those with keys)
  getAICascade() {
    const order = this.get('AI_CASCADE');
    return order.filter(provider => {
      if (provider === 'groq') return !!this.config.GROQ_KEY;
      if (provider === 'gemini') return !!this.config.GEMINI_KEY;
      if (provider === 'claude') return !!this.config.CLAUDE_KEY;
      if (provider === 'deepseek') return !!this.config.DEEPSEEK_KEY;
      return false;
    });
  },

  // Test connection to Supabase
  async testConnection() {
    try {
      const response = await fetch(
        `${this.config.API_URL}/rest/v1/projects?limit=1`,
        {
          headers: {
            'apikey': this.config.API_KEY,
            'Authorization': `Bearer ${this.config.API_KEY}`
          }
        }
      );
      return response.ok;
    } catch (e) {
      console.error('[Config] Connection test failed:', e);
      return false;
    }
  },

  // Test AI provider
  async testProvider(provider) {
    const key = this.config[`${provider.toUpperCase()}_KEY`];
    if (!key) return { ok: false, error: 'No API key' };

    try {
      let response;
      
      if (provider === 'groq') {
        response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.1-70b-versatile',
            messages: [{ role: 'user', content: 'Hi' }],
            max_tokens: 10
          })
        });
      } else if (provider === 'gemini') {
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Hi' }] }]
            })
          }
        );
      } else if (provider === 'claude') {
        response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Hi' }]
          })
        });
      } else if (provider === 'deepseek') {
        response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [{ role: 'user', content: 'Hi' }],
            max_tokens: 10
          })
        });
      }

      return { ok: response?.ok, status: response?.status };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }
};
