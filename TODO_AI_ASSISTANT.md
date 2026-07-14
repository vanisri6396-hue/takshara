# TODO — Production AI Assistant for Takshara StudentOS

## Phase 0 — Repo understanding
- [x] Read existing placeholder `frontend/src/features/ai-assistant/AIPage.tsx`.
- [x] Read auth/query client/supabase client/route guard files.
- [ ] Inspect backend structure and identify existing Supabase Edge Functions.
- [ ] Inspect current DB schema tables for timetable/assignments/reminders/study goals/notifications.

## Phase 1 — Frontend foundation
- [ ] Add provider abstraction layer (frontend) that calls a single backend endpoint.
- [ ] Implement Takshara vs General mode switching UI.
- [ ] Replace placeholder AIPage with ChatGPT-like chat experience (multi-convo, history, streaming, stop/regenerate).
- [ ] Add quick action chips + suggestion prompts.

## Phase 2 — Backend foundation
- [ ] Create Supabase Edge Function(s) for:
  - [ ] `ai-chat` (supports streaming; handles General/Takshara context boundaries)
  - [ ] `ai-actions` (validates inputs; confirmations for destructive)
  - [ ] `ai-files` (summarize/explain/quiz/flashcards)
- [ ] Implement Gemini provider in Edge Function(s).
- [ ] Add DB tables (if missing) for conversations/messages/file artifacts.
- [ ] Enforce auth + RLS: user can only access own data.

## Phase 3 — Takshara mode personalization
- [ ] Implement context retrieval from Supabase (timetable/assignments/attendance/notes/goals/notifications/profile).
- [ ] Implement action execution + cache invalidation hooks.
- [ ] Implement file Q&A that uses extracted content and/or summaries.

## Phase 4 — Verification
- [ ] Run `frontend` typecheck.
- [ ] Run `frontend` `vite build`.
- [ ] Fix all build errors.
- [ ] Update `TODO.md` with completion markers.

