-- ============================================================
-- Takshara — Extend Notifications Table
-- Migration 006: Add priority and update notification types
-- ============================================================

-- ─── Extend Notifications Table ─────────────────────────────────

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high'));

-- Update existing records to have default priority
UPDATE notifications
SET priority = 'medium'
WHERE priority IS NULL;

-- Drop the old type constraint
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add new type constraint with updated categories
ALTER TABLE notifications
  ADD CONSTRAINT notifications_type_check CHECK (type IN ('assignment','timetable','attendance','reminder','system','achievement'));

-- Update existing notification types to match new categories
UPDATE notifications
SET type = 'assignment'
WHERE type IN ('assignment_due', 'assignment_graded');

UPDATE notifications
SET type = 'reminder'
WHERE type = 'exam_reminder';

UPDATE notifications
SET type = 'attendance'
WHERE type = 'low_attendance';

UPDATE notifications
SET type = 'timetable'
WHERE type = 'upcoming_class';

UPDATE notifications
SET type = 'achievement'
WHERE type = 'goal_completed';