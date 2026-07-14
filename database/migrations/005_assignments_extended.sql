-- ============================================================
-- Takshara — Extend Assignments Table
-- Migration 005: Add priority, estimated_study_time, attachment_link
-- ============================================================

-- ─── Extend Assignments Table ────────────────────────────────────

ALTER TABLE assignments
  ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  ADD COLUMN IF NOT EXISTS estimated_study_time INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS attachment_link TEXT DEFAULT '';

-- Update existing records to have default values
UPDATE assignments
SET
  priority = COALESCE(priority, 'medium'),
  estimated_study_time = COALESCE(estimated_study_time, 0),
  attachment_link = COALESCE(attachment_link, '')
WHERE priority IS NULL OR estimated_study_time IS NULL OR attachment_link IS NULL;

-- Make columns NOT NULL after updating
ALTER TABLE assignments
  ALTER COLUMN priority SET NOT NULL,
  ALTER COLUMN estimated_study_time SET NOT NULL;