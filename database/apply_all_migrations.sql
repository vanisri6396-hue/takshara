-- ============================================================
-- Takshara — Consolidated Database Setup
-- ============================================================
-- Run this ENTIRE file once in the Supabase Dashboard
-- (SQL Editor -> New query -> paste -> Run).
--
-- It applies migrations 001 -> 006 in order:
--   001_schema.sql            (core tables + RLS + triggers)
--   002_storage.sql           (avatars bucket + policies)
--   003_features.sql          (exams, projects, notifications, activity_log)
--   004_timetable_extended.sql(schedules extra columns)
--   005_assignments_extended.sql (assignments extra columns)
--   006_notifications_extended.sql (notifications priority/type update)
--
-- The 404 errors on /rest/v1/<table> happen because these
-- tables did not exist in the remote project. Running this
-- file creates them and resolves the errors.
-- ============================================================


-- ============================================================
-- Migration 001: Core Tables, RLS, and Indexes
-- ============================================================

-- ─── Profiles (extends auth.users) ──────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL DEFAULT '',
  email       TEXT NOT NULL,
  student_id  TEXT UNIQUE DEFAULT '',
  avatar_url  TEXT DEFAULT '',
  year        INT DEFAULT 1,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ─── Subjects ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS subjects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  code        TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT '#059669',
  credits     INT NOT NULL DEFAULT 3,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subjects_user ON subjects(user_id);

-- ─── Timetable / Schedule ───────────────────────────────────

CREATE TABLE IF NOT EXISTS schedules (
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

CREATE INDEX IF NOT EXISTS idx_schedules_user ON schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_day ON schedules(day);

-- ─── Notes ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id  UUID REFERENCES subjects(id) ON DELETE SET NULL,
  title       TEXT NOT NULL DEFAULT 'Untitled',
  content     TEXT NOT NULL DEFAULT '',
  tags        TEXT[] NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_subject ON notes(subject_id);

-- ─── Assignments ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS assignments (
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

CREATE INDEX IF NOT EXISTS idx_assignments_user ON assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_due ON assignments(due_date);

-- ─── Attendance ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS attendance (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id  UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('present','absent','late')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, subject_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_user ON attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_subject ON attendance(subject_id);

-- ─── Study Goals ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS study_goals (
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

CREATE INDEX IF NOT EXISTS idx_goals_user ON study_goals(user_id);

-- ─── User Settings ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_settings (
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

CREATE INDEX IF NOT EXISTS idx_settings_user ON user_settings(user_id);

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own ON profiles;
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS profiles_insert_own ON profiles;
CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS profiles_update_own ON profiles;
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Subjects
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS subjects_select_own ON subjects;
CREATE POLICY subjects_select_own ON subjects
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS subjects_insert_own ON subjects;
CREATE POLICY subjects_insert_own ON subjects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS subjects_update_own ON subjects;
CREATE POLICY subjects_update_own ON subjects
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS subjects_delete_own ON subjects;
CREATE POLICY subjects_delete_own ON subjects
  FOR DELETE USING (auth.uid() = user_id);

-- Schedules
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS schedules_select_own ON schedules;
CREATE POLICY schedules_select_own ON schedules
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS schedules_insert_own ON schedules;
CREATE POLICY schedules_insert_own ON schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS schedules_update_own ON schedules;
CREATE POLICY schedules_update_own ON schedules
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS schedules_delete_own ON schedules;
CREATE POLICY schedules_delete_own ON schedules
  FOR DELETE USING (auth.uid() = user_id);

-- Notes
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notes_select_own ON notes;
CREATE POLICY notes_select_own ON notes
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS notes_insert_own ON notes;
CREATE POLICY notes_insert_own ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS notes_update_own ON notes;
CREATE POLICY notes_update_own ON notes
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS notes_delete_own ON notes;
CREATE POLICY notes_delete_own ON notes
  FOR DELETE USING (auth.uid() = user_id);

-- Assignments
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS assignments_select_own ON assignments;
CREATE POLICY assignments_select_own ON assignments
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS assignments_insert_own ON assignments;
CREATE POLICY assignments_insert_own ON assignments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS assignments_update_own ON assignments;
CREATE POLICY assignments_update_own ON assignments
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS assignments_delete_own ON assignments;
CREATE POLICY assignments_delete_own ON assignments
  FOR DELETE USING (auth.uid() = user_id);

-- Attendance
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS attendance_select_own ON attendance;
CREATE POLICY attendance_select_own ON attendance
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS attendance_insert_own ON attendance;
CREATE POLICY attendance_insert_own ON attendance
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS attendance_update_own ON attendance;
CREATE POLICY attendance_update_own ON attendance
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS attendance_delete_own ON attendance;
CREATE POLICY attendance_delete_own ON attendance
  FOR DELETE USING (auth.uid() = user_id);

-- Study Goals
ALTER TABLE study_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS goals_select_own ON study_goals;
CREATE POLICY goals_select_own ON study_goals
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS goals_insert_own ON study_goals;
CREATE POLICY goals_insert_own ON study_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS goals_update_own ON study_goals;
CREATE POLICY goals_update_own ON study_goals
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS goals_delete_own ON study_goals;
CREATE POLICY goals_delete_own ON study_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS settings_select_own ON user_settings;
CREATE POLICY settings_select_own ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS settings_insert_own ON user_settings;
CREATE POLICY settings_insert_own ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS settings_update_own ON user_settings;
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
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

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS subjects_updated_at ON subjects;
CREATE TRIGGER subjects_updated_at BEFORE UPDATE ON subjects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS schedules_updated_at ON schedules;
CREATE TRIGGER schedules_updated_at BEFORE UPDATE ON schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS notes_updated_at ON notes;
CREATE TRIGGER notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS assignments_updated_at ON assignments;
CREATE TRIGGER assignments_updated_at BEFORE UPDATE ON assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS goals_updated_at ON study_goals;
CREATE TRIGGER goals_updated_at BEFORE UPDATE ON study_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS settings_updated_at ON user_settings;
CREATE TRIGGER settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- Migration 002: Storage buckets and policies
-- ============================================================

-- Create avatar storage bucket (ignore if it already exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'avatars', 'avatars', true, 5242880,
       ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'avatars'
);

-- Avatar upload policy
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Avatar update policy
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Avatar delete policy
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Avatar read policy (public)
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');


-- ============================================================
-- Migration 003: Exams, Projects, Notifications, Activity
-- ============================================================

-- ─── Exams ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS exams (
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

CREATE INDEX IF NOT EXISTS idx_exams_user ON exams(user_id);
CREATE INDEX IF NOT EXISTS idx_exams_date ON exams(date);
CREATE INDEX IF NOT EXISTS idx_exams_status ON exams(status);

-- ─── Projects ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS projects (
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

CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- ─── Notifications ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('assignment_due','exam_reminder','low_attendance','upcoming_class','goal_completed','assignment_graded','general')),
  title       TEXT NOT NULL,
  message     TEXT NOT NULL DEFAULT '',
  read        BOOLEAN NOT NULL DEFAULT false,
  link        TEXT DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- ─── Activity Log ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS activity_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('assignment_created','assignment_submitted','assignment_graded','note_created','attendance_marked','exam_created','project_created','goal_created','goal_completed')),
  message     TEXT NOT NULL,
  subject_id  UUID REFERENCES subjects(id) ON DELETE SET NULL,
  link        TEXT DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY POLICIES (003)
-- ============================================================

-- Exams
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS exams_select_own ON exams;
CREATE POLICY exams_select_own ON exams
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS exams_insert_own ON exams;
CREATE POLICY exams_insert_own ON exams
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS exams_update_own ON exams;
CREATE POLICY exams_update_own ON exams
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS exams_delete_own ON exams;
CREATE POLICY exams_delete_own ON exams
  FOR DELETE USING (auth.uid() = user_id);

-- Projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS projects_select_own ON projects;
CREATE POLICY projects_select_own ON projects
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS projects_insert_own ON projects;
CREATE POLICY projects_insert_own ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS projects_update_own ON projects;
CREATE POLICY projects_update_own ON projects
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS projects_delete_own ON projects;
CREATE POLICY projects_delete_own ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notifications_select_own ON notifications;
CREATE POLICY notifications_select_own ON notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS notifications_insert_own ON notifications;
CREATE POLICY notifications_insert_own ON notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS notifications_update_own ON notifications;
CREATE POLICY notifications_update_own ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS notifications_delete_own ON notifications;
CREATE POLICY notifications_delete_own ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Activity Log
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS activity_select_own ON activity_log;
CREATE POLICY activity_select_own ON activity_log
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS activity_insert_own ON activity_log;
CREATE POLICY activity_insert_own ON activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS (003)
-- ============================================================

DROP TRIGGER IF EXISTS exams_updated_at ON exams;
CREATE TRIGGER exams_updated_at BEFORE UPDATE ON exams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS projects_updated_at ON projects;
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- Migration 004: Extend Schedules Table
-- ============================================================

ALTER TABLE schedules
  ADD COLUMN IF NOT EXISTS faculty_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS class_type TEXT NOT NULL DEFAULT 'theory' CHECK (class_type IN ('theory','lab','tutorial','seminar')),
  ADD COLUMN IF NOT EXISTS notes TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS subject_color TEXT NOT NULL DEFAULT '#059669';

UPDATE schedules
SET
  faculty_name = COALESCE(faculty_name, ''),
  class_type = COALESCE(class_type, 'theory'),
  notes = COALESCE(notes, ''),
  subject_color = COALESCE(subject_color, '#059669')
WHERE faculty_name IS NULL OR class_type IS NULL OR notes IS NULL OR subject_color IS NULL;

ALTER TABLE schedules
  ALTER COLUMN faculty_name SET NOT NULL,
  ALTER COLUMN class_type SET NOT NULL,
  ALTER COLUMN notes SET NOT NULL,
  ALTER COLUMN subject_color SET NOT NULL;


-- ============================================================
-- Migration 005: Extend Assignments Table
-- ============================================================

ALTER TABLE assignments
  ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  ADD COLUMN IF NOT EXISTS estimated_study_time INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS attachment_link TEXT DEFAULT '';

UPDATE assignments
SET
  priority = COALESCE(priority, 'medium'),
  estimated_study_time = COALESCE(estimated_study_time, 0),
  attachment_link = COALESCE(attachment_link, '')
WHERE priority IS NULL OR estimated_study_time IS NULL OR attachment_link IS NULL;

ALTER TABLE assignments
  ALTER COLUMN priority SET NOT NULL,
  ALTER COLUMN estimated_study_time SET NOT NULL;


-- ============================================================
-- Migration 006: Extend Notifications Table
-- ============================================================

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high'));

UPDATE notifications
SET priority = 'medium'
WHERE priority IS NULL;

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications
  ADD CONSTRAINT notifications_type_check CHECK (type IN ('assignment','timetable','attendance','reminder','system','achievement'));

UPDATE notifications SET type = 'assignment' WHERE type IN ('assignment_due', 'assignment_graded');
UPDATE notifications SET type = 'reminder' WHERE type = 'exam_reminder';
UPDATE notifications SET type = 'attendance' WHERE type = 'low_attendance';
UPDATE notifications SET type = 'timetable' WHERE type = 'upcoming_class';
UPDATE notifications SET type = 'achievement' WHERE type = 'goal_completed';


-- ============================================================
-- Done. All tables now exist in the public schema.
-- The 404 errors on /rest/v1/<table> will be resolved.
-- ============================================================