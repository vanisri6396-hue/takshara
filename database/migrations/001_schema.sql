-- ============================================================
-- Takshara — Supabase Database Schema
-- Migration 001: Core Tables, RLS, and Indexes
-- ============================================================

-- ─── Profiles (extends auth.users) ──────────────────────────

CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL DEFAULT '',
  email       TEXT NOT NULL,
  student_id  TEXT UNIQUE DEFAULT '',
  avatar_url  TEXT DEFAULT '',
  year        INT DEFAULT 1,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_email ON profiles(email);

-- ─── Subjects ───────────────────────────────────────────────

CREATE TABLE subjects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  code        TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT '#059669',
  credits     INT NOT NULL DEFAULT 3,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subjects_user ON subjects(user_id);

-- ─── Timetable / Schedule ───────────────────────────────────

CREATE TABLE schedules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id  UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  day         TEXT NOT NULL CHECK (day IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
  start_time  TIME NOT NULL,
  end_time    TIME NOT NULL,
  room        TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_schedules_user ON schedules(user_id);
CREATE INDEX idx_schedules_day ON schedules(day);

-- ─── Notes ──────────────────────────────────────────────────

CREATE TABLE notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id  UUID REFERENCES subjects(id) ON DELETE SET NULL,
  title       TEXT NOT NULL DEFAULT 'Untitled',
  content     TEXT NOT NULL DEFAULT '',
  tags        TEXT[] NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notes_user ON notes(user_id);
CREATE INDEX idx_notes_subject ON notes(subject_id);

-- ─── Assignments ────────────────────────────────────────────

CREATE TABLE assignments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id  UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  due_date    TIMESTAMPTZ NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','submitted','graded')),
  grade       INT CHECK (grade >= 0 AND grade <= 100),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_assignments_user ON assignments(user_id);
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_assignments_due ON assignments(due_date);

-- ─── Attendance ─────────────────────────────────────────────

CREATE TABLE attendance (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id  UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('present','absent','late')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, subject_id, date)
);

CREATE INDEX idx_attendance_user ON attendance(user_id);
CREATE INDEX idx_attendance_subject ON attendance(subject_id);

-- ─── Study Goals ────────────────────────────────────────────

CREATE TABLE study_goals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  target      INT NOT NULL DEFAULT 10,
  current     INT NOT NULL DEFAULT 0,
  unit        TEXT NOT NULL DEFAULT 'items',
  subject_id  UUID REFERENCES subjects(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_goals_user ON study_goals(user_id);

-- ─── User Settings ──────────────────────────────────────────

CREATE TABLE user_settings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme                 TEXT NOT NULL DEFAULT 'dark',
  accent_color          TEXT NOT NULL DEFAULT '#d4af37',
  font_size             TEXT NOT NULL DEFAULT 'medium',
  push_notifications    BOOLEAN NOT NULL DEFAULT true,
  email_reminders       BOOLEAN NOT NULL DEFAULT true,
  assignment_alerts     TEXT NOT NULL DEFAULT '24h',
  two_factor_auth       BOOLEAN NOT NULL DEFAULT false,
  session_timeout       TEXT NOT NULL DEFAULT '30m',
  data_sharing          TEXT NOT NULL DEFAULT 'limited',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_settings_user ON user_settings(user_id);

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Profiles: users can read/update their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Subjects: users can CRUD their own subjects
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY subjects_select_own ON subjects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY subjects_insert_own ON subjects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY subjects_update_own ON subjects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY subjects_delete_own ON subjects
  FOR DELETE USING (auth.uid() = user_id);

-- Schedules: users can CRUD their own schedules
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY schedules_select_own ON schedules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY schedules_insert_own ON schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY schedules_update_own ON schedules
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY schedules_delete_own ON schedules
  FOR DELETE USING (auth.uid() = user_id);

-- Notes: users can CRUD their own notes
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY notes_select_own ON notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY notes_insert_own ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY notes_update_own ON notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY notes_delete_own ON notes
  FOR DELETE USING (auth.uid() = user_id);

-- Assignments: users can CRUD their own assignments
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY assignments_select_own ON assignments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY assignments_insert_own ON assignments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY assignments_update_own ON assignments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY assignments_delete_own ON assignments
  FOR DELETE USING (auth.uid() = user_id);

-- Attendance: users can CRUD their own attendance
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY attendance_select_own ON attendance
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY attendance_insert_own ON attendance
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY attendance_update_own ON attendance
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY attendance_delete_own ON attendance
  FOR DELETE USING (auth.uid() = user_id);

-- Study Goals: users can CRUD their own goals
ALTER TABLE study_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY goals_select_own ON study_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY goals_insert_own ON study_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY goals_update_own ON study_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY goals_delete_own ON study_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Settings: users can CRUD their own settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY settings_select_own ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY settings_insert_own ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY settings_update_own ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, '')
  );

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER subjects_updated_at BEFORE UPDATE ON subjects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER schedules_updated_at BEFORE UPDATE ON schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER assignments_updated_at BEFORE UPDATE ON assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER goals_updated_at BEFORE UPDATE ON study_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();