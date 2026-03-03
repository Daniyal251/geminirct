-- ============================================================
-- AI LOGS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Тип запроса
  type TEXT NOT NULL, -- 'audit', 'generate', 'chat', 'speech-to-text', 'detect-ai'
  source TEXT NOT NULL, -- 'ai-architect', 'hub', 'website'
  
  -- Пользователь
  user_id UUID,
  session_id TEXT,
  
  -- Входные данные
  input JSONB,
  
  -- Результаты
  output JSONB,
  provider TEXT,
  model TEXT,
  
  -- Метрики
  duration_ms INTEGER,
  tokens_in INTEGER,
  tokens_out INTEGER,
  
  -- Ошибки
  error_code TEXT,
  error_message TEXT,
  
  -- Временные метки
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Индексы
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_ai_logs_type ON ai_logs(type);
CREATE INDEX IF NOT EXISTS idx_ai_logs_source ON ai_logs(source);
CREATE INDEX IF NOT EXISTS idx_ai_logs_user ON ai_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_session ON ai_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_timestamp ON ai_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_provider ON ai_logs(provider);

-- RLS (Row Level Security)
ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;

-- Анонимы могут создавать логи
CREATE POLICY "Anon insert logs"
ON ai_logs FOR INSERT
WITH CHECK (true);

-- Авторизованные могут читать свои логи
CREATE POLICY "User read own logs"
ON ai_logs FOR SELECT
USING (
  auth.uid()::text = user_id::text
  OR session_id = current_setting('app.session_id', true)
);

-- Админы видят все логи
CREATE POLICY "Admin read all logs"
ON ai_logs FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM staff WHERE role IN ('CEO', 'Зам')
  )
);

-- Комментарий
COMMENT ON TABLE ai_logs IS 'Логи AI-запросов (аудит, генерация, чат, речь, детекция)';
