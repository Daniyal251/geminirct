-- ============================================================
-- RKT HUB — SQL МИГРАЦИИ v3.0
-- ============================================================
-- Дата: 27 февраля 2026
-- Цель: Новые таблицы, поля для медоборудования и CRM Сайты
-- Все миграции идемпотентные (DO-блоки, IF NOT EXISTS)
-- ============================================================

-- ============================================================
-- 1. НОВЫЕ ТАБЛИЦЫ
-- ============================================================

-- 1.1 Заявки клиентов (client_requests)
CREATE TABLE IF NOT EXISTS client_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  phone TEXT NOT NULL,
  company TEXT,
  city TEXT,
  direction TEXT, -- 'Сайты', 'AI-контент', 'ИИ-агенты', 'Медоборудование'
  service_type TEXT, -- 'Новый сайт', 'Аудит', 'ИИ-агент', 'Медоборудование'
  site_url TEXT, -- URL для аудита
  details TEXT,
  message TEXT,
  comment TEXT,
  status TEXT DEFAULT 'new', -- 'new', 'seen', 'in_progress', 'done', 'closed'
  source TEXT DEFAULT 'website', -- 'website', 'telegram', 'referral'
  page TEXT, -- URL страницы где оставлена заявка
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_client_requests_status ON client_requests(status);
CREATE INDEX IF NOT EXISTS idx_client_requests_created ON client_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_requests_phone ON client_requests(phone);

-- RLS
ALTER TABLE client_requests ENABLE ROW LEVEL SECURITY;

-- Анонимы могут создавать заявки
CREATE POLICY "Anon insert requests"
ON client_requests FOR INSERT
WITH CHECK (true);

-- Анонимы и авторизованные могут читать свои (по session_id)
CREATE POLICY "Anon read own requests"
ON client_requests FOR SELECT
USING (session_id = current_setting('app.session_id', true));

-- Авторизованные (staff) видят все
CREATE POLICY "Staff read all requests"
ON client_requests FOR SELECT
USING (auth.uid() IN (SELECT id FROM staff));

-- ============================================================

-- 1.2 Логи AI-чата (ai_logs)
CREATE TABLE IF NOT EXISTS ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  type TEXT, -- 'chat', 'summary', 'next_step', 'audit'
  source TEXT, -- 'client_portal', 'hub', 'website'
  user_message TEXT,
  bot_reply TEXT,
  model TEXT, -- 'llama-3.1-70b', 'gemini-1.5-flash', 'claude-3-haiku'
  provider TEXT, -- 'groq', 'gemini', 'claude', 'deepseek'
  duration_ms INTEGER,
  tokens_in INTEGER,
  tokens_out INTEGER,
  error_code TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_ai_logs_created ON ai_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_type ON ai_logs(type);
CREATE INDEX IF NOT EXISTS idx_ai_logs_session ON ai_logs(session_id);

-- RLS
ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;

-- Анонимы могут писать логи
CREATE POLICY "Anon insert logs"
ON ai_logs FOR INSERT
WITH CHECK (true);

-- Авторизованные видят все
CREATE POLICY "Staff read logs"
ON ai_logs FOR SELECT
USING (auth.uid() IN (SELECT id FROM staff));

-- ============================================================

-- 1.3 Настройки (settings) — ключ-значение
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Начальные данные
INSERT INTO settings (key, value) VALUES
  ('tg_bot_token', '{"value": ""}'),
  ('ai_cascade', '{"value": ["groq", "gemini", "claude", "deepseek"]}'),
  ('ai_timeout_ms', '{"value": 15000}'),
  ('ai_chat_greeting', '{"value": "Здравствуйте! 👋 Я ИИ-ассистент RCT. Спрашивайте!"}')
ON CONFLICT (key) DO NOTHING;

-- RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Анонимы могут читать и писать (для токенов бота)
CREATE POLICY "Anon all settings"
ON settings FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================================

-- 1.4 Уведомления (notifications)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES staff(id),
  type TEXT, -- 'task_assigned', 'deal_stage', 'new_request', 'approval'
  title TEXT,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  data JSONB, -- дополнительные данные (task_id, deal_id, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Пользователь видит только свои уведомления
CREATE POLICY "User read own notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid());

-- Система может создавать уведомления
CREATE POLICY "System insert notifications"
ON notifications FOR INSERT
WITH CHECK (true);

-- Пользователь может отмечать прочитанными
CREATE POLICY "User update own notifications"
ON notifications FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================================

-- 2. ДОПОЛНЕНИЯ К СУЩЕСТВУЮЩИМ ТАБЛИЦАМ
-- ============================================================

-- 2.1 directions: +9 полей для медоборудования
DO $$ BEGIN
  ALTER TABLE directions ADD COLUMN IF NOT EXISTS equipment_type TEXT;
  ALTER TABLE directions ADD COLUMN IF NOT EXISTS oem_partner TEXT;
  ALTER TABLE directions ADD COLUMN IF NOT EXISTS rzn_status TEXT;
  ALTER TABLE directions ADD COLUMN IF NOT EXISTS rzn_checklist JSONB DEFAULT '{}';
  ALTER TABLE directions ADD COLUMN IF NOT EXISTS logistics_status TEXT;
  ALTER TABLE directions ADD COLUMN IF NOT EXISTS contract_amount NUMERIC;
  ALTER TABLE directions ADD COLUMN IF NOT EXISTS procurement_type TEXT;
  ALTER TABLE directions ADD COLUMN IF NOT EXISTS procurement_deadline DATE;
  ALTER TABLE directions ADD COLUMN IF NOT EXISTS procurement_number TEXT;
END $$;

-- 2.2 directions: +8 полей для CRM Сайты
DO $$ BEGIN
  ALTER TABLE directions ADD COLUMN IF NOT EXISTS client_name TEXT;
  ALTER TABLE directions ADD COLUMN IF NOT EXISTS site_type TEXT;
  ALTER TABLE directions ADD COLUMN IF NOT EXISTS paid BOOLEAN DEFAULT FALSE;
  ALTER TABLE directions ADD COLUMN IF NOT EXISTS source TEXT;
  ALTER TABLE directions ADD COLUMN IF NOT EXISTS next_contact DATE;
  ALTER TABLE directions ADD COLUMN IF NOT EXISTS touches INTEGER DEFAULT 0;
  ALTER TABLE directions ADD COLUMN IF NOT EXISTS reject_reason TEXT;
  ALTER TABLE directions ADD COLUMN IF NOT EXISTS feedback TEXT;
  ALTER TABLE directions ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'prospect';
END $$;

-- Индексы для directions
CREATE INDEX IF NOT EXISTS idx_directions_project ON directions(project);
CREATE INDEX IF NOT EXISTS idx_directions_stage ON directions(stage);
CREATE INDEX IF NOT EXISTS idx_directions_manager ON directions(manager);

-- ============================================================

-- 2.3 staff: дополнительные поля
DO $$ BEGIN
  ALTER TABLE staff ADD COLUMN IF NOT EXISTS telegram_id TEXT;
  ALTER TABLE staff ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}';
  ALTER TABLE staff ADD COLUMN IF NOT EXISTS extra_projects JSONB DEFAULT '[]';
  ALTER TABLE staff ADD COLUMN IF NOT EXISTS salary_pct INTEGER DEFAULT 0; -- % от сделки
END $$;

-- ============================================================

-- 2.4 tasks: дополнительные поля
DO $$ BEGIN
  ALTER TABLE tasks ADD COLUMN IF NOT EXISTS ai_summary TEXT;
  ALTER TABLE tasks ADD COLUMN IF NOT EXISTS ai_next_step TEXT;
  ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_steps JSONB DEFAULT '[]';
END $$;

-- ============================================================

-- 3. RLS ПОЛИТИКИ ДЛЯ СУЩЕСТВУЮЩИХ ТАБЛИЦ
-- ============================================================

-- 3.1 directions: фильтрация по ролям
DO $$ BEGIN
  -- Сотрудник видит только свои направления
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'directions' AND policyname = 'Staff see own directions'
  ) THEN
    CREATE POLICY "Staff see own directions"
    ON directions FOR SELECT
    USING (
      auth.uid() IN (
        SELECT id FROM staff
        WHERE project = directions.project
           OR id = auth.uid()
      )
    );
  END IF;
  
  -- CEO и Зам видят всё
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'directions' AND policyname = 'Admin all directions'
  ) THEN
    CREATE POLICY "Admin all directions"
    ON directions FOR ALL
    USING (
      auth.uid() IN (
        SELECT id FROM staff WHERE role IN ('CEO', 'Зам')
      )
    );
  END IF;
END $$;

-- 3.2 tasks: фильтрация по исполнителю
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Staff see own tasks'
  ) THEN
    CREATE POLICY "Staff see own tasks"
    ON tasks FOR SELECT
    USING (
      assignee = (SELECT name FROM staff WHERE id = auth.uid())
      OR project IN (
        SELECT project FROM staff WHERE id = auth.uid()
      )
    );
  END IF;
END $$;

-- 3.3 staff: читать всем, писать только CEO
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'staff' AND policyname = 'Staff read all'
  ) THEN
    CREATE POLICY "Staff read all"
    ON staff FOR SELECT
    USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'staff' AND policyname = 'CEO write staff'
  ) THEN
    CREATE POLICY "CEO write staff"
    ON staff FOR ALL
    USING (
      auth.uid() IN (
        SELECT id FROM staff WHERE role = 'CEO'
      )
    );
  END IF;
END $$;

-- ============================================================

-- 4. ФУНКЦИИ И ТРИГГЕРЫ
-- ============================================================

-- 4.1 Автообновление updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для client_requests
DROP TRIGGER IF EXISTS update_client_requests_updated_at ON client_requests;
CREATE TRIGGER update_client_requests_updated_at
  BEFORE UPDATE ON client_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Триггер для settings
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================

-- 4.2 Уведомление о новой заявке (Telegram)
CREATE OR REPLACE FUNCTION notify_new_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Вставка уведомления в таблицу
  INSERT INTO notifications (user_id, type, title, message, data)
  SELECT
    id,
    'new_request',
    '📝 Новая заявка',
    'Заявка от ' || COALESCE(NEW.name, NEW.phone) || ' (' || NEW.direction || ')',
    jsonb_build_object('request_id', NEW.id, 'direction', NEW.direction)
  FROM staff
  WHERE role IN ('CEO', 'Зам');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер на новую заявку
DROP TRIGGER IF EXISTS trigger_new_request ON client_requests;
CREATE TRIGGER trigger_new_request
  AFTER INSERT ON client_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_request();

-- ============================================================

-- 5. ПРЕДСТАВЛЕНИЯ (VIEWS) ДЛЯ ОТЧЁТНОСТИ
-- ============================================================

-- 5.1 KPI по направлениям
CREATE OR REPLACE VIEW kpi_by_direction AS
SELECT
  project,
  COUNT(*) as total_deals,
  COUNT(*) FILTER (WHERE stage = 'done') as completed_deals,
  COUNT(*) FILTER (WHERE stage = 'lost') as lost_deals,
  ROUND(100.0 * COUNT(*) FILTER (WHERE stage = 'done') / NULLIF(COUNT(*), 0), 2) as conversion_rate,
  SUM(contract_amount) FILTER (WHERE paid = true) as revenue,
  AVG(EXTRACT(EPOCH FROM (created_at - created_at))) as avg_cycle_days
FROM directions
GROUP BY project;

-- 5.2 Активные задачи по сотрудникам
CREATE OR REPLACE VIEW active_tasks_by_staff AS
SELECT
  s.name as employee_name,
  s.role,
  s.project,
  COUNT(t.id) as total_tasks,
  COUNT(t.id) FILTER (WHERE t.deadline < NOW()) as overdue_tasks,
  COUNT(t.id) FILTER (WHERE t.status LIKE '%Готово%') as completed_tasks
FROM staff s
LEFT JOIN tasks t ON t.assignee = s.name AND t.status NOT LIKE '%Готово%'
WHERE s.status = 'Активный'
GROUP BY s.id, s.name, s.role, s.project;

-- ============================================================

-- 6. НАЧАЛЬНЫЕ ДАННЫЕ
-- ============================================================

-- 6.1 Проекты (если нет)
INSERT INTO projects (name, description, status, priority, progress) VALUES
  ('РКТ', 'Медоборудование, локализация, ВЭД', 'В работе', 'P1', 60),
  ('Сайты', 'Разработка сайтов', 'В работе', 'P2', 40),
  ('AI-контент', 'Генерация контента на нейросетях', 'В работе', 'P3', 20),
  ('ИИ-агенты', 'Telegram-боты, CRM-автоматизация', 'В работе', 'P2', 30)
ON CONFLICT (name) DO NOTHING;

-- ============================================================

-- 7. КОММЕНТАРИИ К ПОЛЯМ (для документации)
-- ============================================================

COMMENT ON TABLE client_requests IS 'Заявки клиентов с order-формы на сайте';
COMMENT ON TABLE ai_logs IS 'Логи запросов к AI-провайдерам (Groq, Gemini, Claude, DeepSeek)';
COMMENT ON TABLE settings IS 'Настройки системы (токены, конфиги AI-каскада)';
COMMENT ON TABLE notifications IS 'Уведомления для сотрудников (Telegram, in-app)';

COMMENT ON COLUMN directions.equipment_type IS 'Тип оборудования: КТ 16/32/64/128 срезов, Рентген, С-дуга';
COMMENT ON COLUMN directions.oem_partner IS 'OEM-партнёр: Syno-Tech, Powersite, Varex, Canon';
COMMENT ON COLUMN directions.rzn_checklist IS 'Чеклист РЗН: {tech_file, toxicology, dossier, ru_received}';
COMMENT ON COLUMN directions.logistics_status IS 'Статус логистики: factory, customs, delivery, installation, commissioning';
COMMENT ON COLUMN directions.procurement_type IS 'Тип закупки: ФЗ-44, ФЗ-223, Прямой договор';

-- ============================================================
-- КОНЕЦ МИГРАЦИИ
-- ============================================================
