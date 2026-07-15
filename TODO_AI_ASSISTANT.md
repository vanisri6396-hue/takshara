# TODO — Production AI Assistant for Takshara StudentOS

## Phase 0 — Repo understanding
- [x] Read existing placeholder `frontend/src/features/ai-assistant/AIPage.tsx`.
- [x] Read auth/query client/supabase client/route guard files.
- [x] Inspect backend structure and identify existing Supabase Edge Functions.
- [x] Inspect current DB schema tables for timetable/assignments/reminders/study goals/notifications.

## Phase 1 — Frontend foundation
- [x] Add provider abstraction layer (frontend) that calls a single backend endpoint.
- [x] Implement Takshara vs General mode switching UI.
- [x] Replace placeholder AIPage with ChatGPT-like chat experience (streaming, stop/regenerate).
- [x] Cross-origin request support (CORS) for Edge Functions.
- [ ] Add quick action chips + suggestion prompts.
- [x] Wire conversationId from server response headers to persist conversation across messages.
- [x] Add API functions for conversation history (list, get messages, delete).

## Phase 2 — Backend foundation
- [x] Create Supabase Edge Function(s) for:
  - [x] `ai-chat` (supports streaming; handles General/Takshara context boundaries; GET/DELETE for history)
  - [x] `ai-action` (validates inputs; conversation_title, generate_file_artifact)
  - [x] `ai-files` (summarize/explain/quiz/flashcards)
- [x] Implement Gemini provider in Edge Function(s).
- [x] Implement xAI Grok provider in Edge Function(s) (optional via `AI_PROVIDER=grok`).
- [x] Add DB tables for conversations/messages/file artifacts.
- [x] Enforce auth + RLS: user can only access own data.

## Phase 3 — Takshara mode personalization
- [x] Implement context retrieval from Supabase (timetable/assignments/attendance/notes/goals/notifications/profile).
- [x] Implement action execution (generate artifact, rename conversation).
- [ ] Implement file Q&A UI that uses extracted content and/or summaries.
- [ ] Implement multi-conversation sidebar.

## Phase 4 — Verification
- [x] Run `frontend` typecheck.
- [x] Run `frontend` `vite build`.
- [x] Fix all build errors.

