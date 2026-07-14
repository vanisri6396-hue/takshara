-- ============================================================
-- Takshara — AI Assistant
-- Migration 007: Conversations + Messages + RLS
-- ============================================================

-- Conversations
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('general','takshara')),
  title TEXT NOT NULL DEFAULT 'New conversation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id);

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY ai_conversations_select_own ON ai_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY ai_conversations_insert_own ON ai_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY ai_conversations_update_own ON ai_conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY ai_conversations_delete_own ON ai_conversations
  FOR DELETE USING (auth.uid() = user_id);

-- Messages
CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('system','user','assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_user ON ai_messages(user_id);

ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY ai_messages_select_own ON ai_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY ai_messages_insert_own ON ai_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- updated_at trigger for conversations
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ai_conversations_updated_at ON ai_conversations;
CREATE TRIGGER ai_conversations_updated_at
  BEFORE UPDATE ON ai_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

