-- ============================================================
-- AI ARCHITECT TABLES
-- ============================================================

-- AI Audits (аудиты сайтов)
CREATE TABLE IF NOT EXISTS ai_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Пользователь
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  
  -- Входные данные
  url TEXT NOT NULL,
  html TEXT,
  css TEXT,
  js TEXT,
  
  -- Результаты
  overall_score INTEGER,
  seo_score INTEGER,
  performance_score INTEGER,
  accessibility_score INTEGER,
  best_practices_score INTEGER,
  report JSONB,
  
  -- Статус
  status TEXT DEFAULT 'completed', -- pending, processing, completed, failed
  error_message TEXT,
  
  -- Временные метки
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- AI Generations (генерации сайтов)
CREATE TABLE IF NOT EXISTS ai_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Пользователь
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  
  -- Входные данные
  type TEXT NOT NULL, -- landing, business, portfolio, shop
  description TEXT NOT NULL,
  style TEXT,
  colors TEXT,
  
  -- Результаты
  html TEXT,
  css TEXT,
  js TEXT,
  files JSONB,
  
  -- Статус
  status TEXT DEFAULT 'draft', -- draft, preview, approved, exported
  export_format TEXT,
  export_url TEXT,
  
  -- Временные метки
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  exported_at TIMESTAMPTZ
);

-- Leads (заявки на разработку)
CREATE TABLE IF NOT EXISTS ai_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Контактные данные
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  company TEXT,
  
  -- Данные проекта
  type TEXT NOT NULL, -- landing, business, shop, corporate
  budget TEXT,
  description TEXT NOT NULL,
  deadline DATE,
  
  -- Статус
  status TEXT DEFAULT 'new', -- new, contacted, proposal, contract, paid, lost
  manager_id UUID REFERENCES staff(id),
  
  -- Временные метки
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_ai_audits_user ON ai_audits(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_audits_session ON ai_audits(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_audits_status ON ai_audits(status);
CREATE INDEX IF NOT EXISTS idx_ai_audits_created ON ai_audits(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_generations_user ON ai_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_session ON ai_generations(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_status ON ai_generations(status);
CREATE INDEX IF NOT EXISTS idx_ai_generations_created ON ai_generations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_leads_status ON ai_leads(status);
CREATE INDEX IF NOT EXISTS idx_ai_leads_manager ON ai_leads(manager_id);
CREATE INDEX IF NOT EXISTS idx_ai_leads_created ON ai_leads(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE ai_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_leads ENABLE ROW LEVEL SECURITY;

-- AI Audits политики
CREATE POLICY "Users can view own audits"
ON ai_audits FOR SELECT
USING (
  auth.uid() = user_id
  OR session_id = current_setting('app.session_id', true)
);

CREATE POLICY "Users can insert own audits"
ON ai_audits FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  OR session_id = current_setting('app.session_id', true)
);

CREATE POLICY "Admins can view all audits"
ON ai_audits FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM staff WHERE role IN ('CEO', 'Зам')
  )
);

-- AI Generations политики
CREATE POLICY "Users can view own generations"
ON ai_generations FOR SELECT
USING (
  auth.uid() = user_id
  OR session_id = current_setting('app.session_id', true)
);

CREATE POLICY "Users can insert own generations"
ON ai_generations FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  OR session_id = current_setting('app.session_id', true)
);

CREATE POLICY "Admins can view all generations"
ON ai_generations FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM staff WHERE role IN ('CEO', 'Зам')
  )
);

-- AI Leads политики
CREATE POLICY "Users can view own leads"
ON ai_leads FOR SELECT
USING (
  auth.uid() = user_id
);

CREATE POLICY "Users can insert own leads"
ON ai_leads FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Managers can view assigned leads"
ON ai_leads FOR SELECT
USING (
  manager_id = auth.uid()
);

CREATE POLICY "Admins can view all leads"
ON ai_leads FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM staff WHERE role IN ('CEO', 'Зам')
  )
);

-- Комментарии
COMMENT ON TABLE ai_audits IS 'AI-аудиты сайтов (оценки, рекомендации)';
COMMENT ON TABLE ai_generations IS 'AI-генерации сайтов (код, файлы)';
COMMENT ON TABLE ai_leads IS 'Заявки на индивидуальную разработку';
