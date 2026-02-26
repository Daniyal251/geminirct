-- ============================================
-- RKT HUB — Master Plan v2, Phase 1 Migration
-- Этап 0.4: Мед-оборудование поля + Индексы
-- Этап 0.6: RLS политики
-- ============================================

-- =====================
-- ЭТАП 0.4: Новые колонки для CRM Мед
-- =====================

ALTER TABLE directions ADD COLUMN IF NOT EXISTS equipment_type TEXT;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS oem_partner TEXT;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS rzn_status TEXT DEFAULT 'Не начато';
ALTER TABLE directions ADD COLUMN IF NOT EXISTS rzn_checklist JSONB DEFAULT '{}';
ALTER TABLE directions ADD COLUMN IF NOT EXISTS logistics_status TEXT DEFAULT 'На заводе';
ALTER TABLE directions ADD COLUMN IF NOT EXISTS contract_amount NUMERIC DEFAULT 0;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS procurement_type TEXT;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS procurement_deadline DATE;
ALTER TABLE directions ADD COLUMN IF NOT EXISTS procurement_number TEXT;

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_directions_project ON directions(project);
CREATE INDEX IF NOT EXISTS idx_directions_stage ON directions(stage);
CREATE INDEX IF NOT EXISTS idx_client_requests_status ON client_requests(status);
CREATE INDEX IF NOT EXISTS idx_client_requests_created ON client_requests(created_at);

-- =====================
-- ЭТАП 0.6: RLS политики
-- =====================

-- directions: authenticated staff — full access, anon — read only
ALTER TABLE directions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "directions_auth_all" ON directions FOR ALL TO authenticated USING (true);
CREATE POLICY "directions_anon_read" ON directions FOR SELECT TO anon USING (true);

-- staff: authenticated — read, anon — read
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff_auth_read" ON staff FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff_anon_read" ON staff FOR SELECT TO anon USING (true);

-- client_requests: anon — insert + read, authenticated — all
ALTER TABLE client_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cr_anon_insert" ON client_requests FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "cr_auth_all" ON client_requests FOR ALL TO authenticated USING (true);
CREATE POLICY "cr_anon_read" ON client_requests FOR SELECT TO anon USING (true);

-- tasks: authenticated — all, anon — read
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks_auth_all" ON tasks FOR ALL TO authenticated USING (true);
CREATE POLICY "tasks_anon_read" ON tasks FOR SELECT TO anon USING (true);

-- partners: authenticated — all, anon — read
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "partners_auth_all" ON partners FOR ALL TO authenticated USING (true);
CREATE POLICY "partners_anon_read" ON partners FOR SELECT TO anon USING (true);

-- approvals: authenticated — all
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "approvals_auth_all" ON approvals FOR ALL TO authenticated USING (true);

-- communications: authenticated — all
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comms_auth_all" ON communications FOR ALL TO authenticated USING (true);

-- =====================
-- ПРОВЕРКА
-- =====================
-- После выполнения проверьте:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'directions' AND column_name LIKE '%equipment%';
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
