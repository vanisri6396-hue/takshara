-- ============================================================
-- Takshara — Extend Schedules Table
-- Migration 004: Add faculty_name, class_type, notes, subject_color
-- ============================================================

-- ─── Extend Schedules Table ────────────────────────────────────

ALTER TABLE schedules
  ADD COLUMN IF NOT EXISTS faculty_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS class_type TEXT NOT NULL DEFAULT 'theory' CHECK (class_type IN ('theory','lab','tutorial','seminar')),
  ADD COLUMN IF NOT EXISTS notes TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS subject_color TEXT NOT NULL DEFAULT '#059669';

-- Update existing records to have default values
UPDATE schedules
SET
  faculty_name = COALESCE(faculty_name, ''),
  class_type = COALESCE(class_type, 'theory'),
  notes = COALESCE(notes, ''),
  subject_color = COALESCE(subject_color, '#059669')
WHERE faculty_name IS NULL OR class_type IS NULL OR notes IS NULL OR subject_color IS NULL;

-- Make columns NOT NULL after updating
ALTER TABLE schedules
  ALTER COLUMN faculty_name SET NOT NULL,
  ALTER COLUMN class_type SET NOT NULL,
  ALTER COLUMN notes SET NOT NULL,
  ALTER COLUMN subject_color SET NOT NULL;