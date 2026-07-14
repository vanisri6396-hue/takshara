-- ============================================================
-- Takshara — AI Assistant
-- Migration 008: File artifacts metadata (optional)
-- ============================================================

-- This migration sets up a place to persist generated artifacts.
-- Full extraction + generation will be wired in `ai-files`.

CREATE TABLE IF NOT EXISTS ai_file_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_id TEXT NOT NULL DEFAULT '',
  artifact_type TEXT NOT NULL DEFAULT 'summary' CHECK (artifact_type IN ('summary','explanation','quiz','flashcards','qa')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_file_artifacts_user ON ai_file_artifacts(user_id);

ALTER TABLE ai_file_artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY ai_file_artifacts_select_own ON ai_file_artifacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY ai_file_artifacts_insert_own ON ai_file_artifacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

