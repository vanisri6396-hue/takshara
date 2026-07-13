-- ============================================================
-- Takshara — Supabase Database Schema
-- Migration 003: Exams, Projects, Notifications, Activity
-- ============================================================

-- ─── Exams ────────────────────────────────────────────────────

CREATE TABLE exams (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id  UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  date        DATE NOT NULL,
  time        TIME NOT NULL DEFAULT '09:00',
  duration    TEXT NOT NULL DEFAULT '1 hour',
  room        TEXT NOT NULL DEFAULT '',
  syllabus    TEXT NOT NULL DEFAULT '',
  max_marks   INT NOT NULL DEFAULT 100,
  status      TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming','completed','cancelled')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_exams_user ON exams(user_id);
CREATE INDEX idx_exams_date ON exams(date);
CREATE INDEX idx_exams_status ON exams(status);

-- ─── Projects ─────────────────────────────────────────────────

CREATE TABLE projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id    UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  due_date      TIMESTAMPTZ NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed')),
  progress      INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  technologies  TEXT[] NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);

-- ─── Notifications ────────────────────────────────────────────

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('assignment_due','exam_reminder','low_attendance','upcoming_class','goal_completed','assignment_graded','general')),
  title       TEXT NOT NULL,
  message     TEXT NOT NULL DEFAULT '',
  read        BOOLEAN NOT NULL DEFAULT false,
  link        TEXT DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ─── Activity Log ─────────────────────────────────────────────

CREATE TABLE activity_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('assignment_created','assignment_submitted','assignment_graded','note_created','attendance_marked','exam_created','project_created','goal_created','goal_completed')),
  message     TEXT NOT NULL,
  subject_id  UUID REFERENCES subjects(id) ON DELETE SET NULL,
  link        TEXT DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_user ON activity_log(user_id);
CREATE INDEX idx_activity_created ON activity_log(created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Exams
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY exams_select_own ON exams
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY exams_insert_own ON exams
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY exams_update_own ON exams
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY exams_delete_own ON exams
  FOR DELETE USING (auth.uid() = user_id);

-- Projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY projects_select_own ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY projects_insert_own ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY projects_update_own ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY projects_delete_own ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_select_own ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY notifications_insert_own ON notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY notifications_update_own ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY notifications_delete_own ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Activity Log
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY activity_select_own ON activity_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY activity_insert_own ON activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER exams_updated_at BEFORE UPDATE ON exams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();