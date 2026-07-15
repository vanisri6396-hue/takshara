# AI Assistant — Total Audit Report

**Takshara StudentOS** · Generated: 2026-07-14

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                            │
│  AIPage.tsx  →  api.ts  →  SEND FETCH                          │
└─────────────────────────────┬───────────────────────────────────┘
                              │ POST /functions/v1/ai-chat
                              │ (Bearer Supabase JWT)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              SUPABASE EDGE FUNCTIONS (Deno)                     │
│                                                                 │
│  ┌──────────┐  ┌─────────┐  ┌──────────┐  ┌────────────┐      │
│  │ ai-chat  │  │ai-files │  │ai-action │  │ai-gateway  │      │
│  │ (active) │  │(active) │  │(active)  │  │(legacy)    │      │
│  └────┬─────┘  └────┬────┘  └────┬─────┘  └────────────┘      │
│       ├──────────────┴────────────┤                             │
│       │     _shared/              │                             │
│       ├── provider.ts             │                             │
│       ├── geminiProvider.ts       │                             │
│       ├── xaiProvider.ts          │                             │
│       ├── providerSelector.ts     │                             │
│       ├── types.ts                │                             │
│       └── validators.ts           │                             │
└──────────────┬──────────────────────────────────────────────────┘
               │ Supabase REST (Caller JWT + Service Role Key)
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                 DATABASE (PostgreSQL + RLS)                     │
│                                                                 │
│  ai_conversations   │   ai_messages   │   ai_file_artifacts     │
│  (id, user_id, mode,│  (id, conv_id,  │  (id, user_id, file_id, │
│   title, timestamps)│   user_id, role,│   artifact_type,        │
│                      │   content, ts)  │   payload, ts)          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend — Assessment

### 2.1 `AIPage.tsx` — Chat UI
| Item | Status | Notes |
|------|--------|-------|
| Chat message display | ✅ Complete | User & assistant bubbles with Bot avatar |
| Streaming | ✅ Complete | Uses ReadableStream + TextDecoder |
| Stop generation | ✅ Complete | AbortController wired |
| Regenerate | ✅ Complete | Finds last user message, removes last assistant, resends |
| Mode switching | ✅ Complete | Takshara vs General toggle buttons |
| Error display | ✅ Complete | Error banner inside chat area |
| Auto-scroll | ✅ Complete | scrollAnchorRef usage |
| Keyboard submit (Enter) | ✅ Complete | onKeyDown handler |
| Input disabled during send | ✅ Complete | isSending state |
| 🔴 Multi-conversation UI | ❌ **MISSING** | Single conversation only; no sidebar/history list |
| 🔴 Conversation history list | ❌ **MISSING** | No endpoint called to fetch past conversations |
| 🔴 Quick action chips / suggestions | ❌ **MISSING** | Not implemented |
| 🔴 File upload / artifact UI | ❌ **MISSING** | No UI to call ai-files or ai-action endpoints |
| Unused code (`appendUserMessage`) | ⚠️ Commented out | Intentionally left unused to avoid build break |

### 2.2 `api.ts` — API Client
| Item | Status | Notes |
|------|--------|-------|
| Auth token retrieval | ✅ Complete | Uses supabase.auth.getSession() |
| Non-streaming chat | ✅ Complete | sendAiChatNonStream |
| Streaming chat | ✅ Complete | sendAiChatStream |
| 🔴 File artifact API | ❌ **MISSING** | No API wrapper for ai-files or ai-action |
| 🔴 Conversation history API | ❌ **MISSING** | No endpoint to list conversations |
| Error handling | ⚠️ Basic | Throws Error with response text |

### 2.3 `types.ts`
| Item | Status | Notes |
|------|--------|-------|
| ChatMessage type | ✅ Complete | role: 'user' \| 'assistant' \| 'system' |
| AiChatMode | ✅ Complete | 'general' \| 'takshara' |

### 2.4 Routing
| Item | Status | Notes |
|------|--------|-------|
| Route registered | ✅ Complete | `ROUTES.AI` → `AIPage` |
| Protected behind auth | ✅ Complete | Inside ProtectedRoute/AppLayout |

---

## 3. Backend (Edge Functions) — Assessment

### 3.1 `ai-chat/index.ts` — Main Chat Endpoint
| Item | Status | Notes |
|------|--------|-------|
| JWT authentication | ✅ Complete | Verifies via `/auth/v1/user` |
| Request validation | ✅ Complete | Messages format, mode check |
| General mode | ✅ Complete | Passes messages directly to provider |
| Takshara mode context | ✅ Complete | Fetches subjects, schedules, assignments, notes, attendance, goals, notifications, profile |
| Context bounding (12K chars) | ✅ Complete | `slice(0, 12000)` |
| Conversation creation | ✅ Complete | `supabaseUpsertConversationIfNeeded` |
| Message persistence | ✅ Complete | Persists user + assistant messages |
| Title auto-generation | ✅ Complete | First user message truncated to 60 chars |
| Non-streaming response | ✅ Complete | Returns JSON with text |
| Streaming response | ✅ Complete | ReadableStream with TextEncoder |
| Error handling | ⚠️ Basic | Catches errors, logs, returns generic message |
| 🟡 System prompt placement | ⚠️ **OK but fragile** | Relies on index position for system message at `[0]` |
| Provider selection | ✅ Complete | Uses `getProviderFromEnv()` |
| CORS | ✅ Complete | OPTIONS + headers |

### 3.2 `ai-files/index.ts` — File Artifact Generation
| Item | Status | Notes |
|------|--------|-------|
| JWT authentication | ✅ Complete | |
| Request validation | ✅ Complete | action, artifact_type, files format |
| Artifact types | ✅ Complete | summary, explanation, quiz, flashcards, qa |
| Text extraction from body | ✅ Complete | `extracted_text` or `files[].text` |
| 🔴 Storage-backed extraction | ❌ **501 Not Implemented** | Only client-provided text; no Supabase Storage fetch |
| Provider AI call | ✅ Complete | Uses `getProviderFromEnv()` |
| DB persistence | ✅ Complete | Inserts into `ai_file_artifacts` |
| CORS | ✅ Complete | |

### 3.3 `ai-action/index.ts` — Structured Actions
| Item | Status | Notes |
|------|--------|-------|
| JWT authentication | ✅ Complete | |
| Action: `conversation_title` | ✅ Complete | PATCH ai_conversations with title |
| Action: `generate_file_artifact` | ✅ Complete | Same logic as ai-files |
| Validation | ✅ Complete | `assertIsActionBody` with full type checking |
| Safe title trimming | ✅ Complete | 60 char max |
| Text joining (20K bound) | ✅ Complete | safeJoinText with .slice(0, 20000) |

### 3.4 `ai-gateway/index.ts` — Legacy Gateway
| Item | Status | Notes |
|------|--------|-------|
| Status | ⚠️ **REDUNDANT** | Duplicates ai-chat logic with xAI only |
| JWT auth | ✅ Complete | |
| No context retrieval | ✅ Intentional | Comment says "intentionally NOT implemented" |
| No streaming | ❌ **MISSING** | Non-stream only |
| 🟡 Should be deprecated | ⚠️ | ai-chat with `AI_PROVIDER=grok` already does this |

### 3.5 Shared Modules

#### `provider.ts` — Interface
| Item | Status | Notes |
|------|--------|-------|
| AIProvider interface | ✅ Complete | `chat()` + optional `chatStream()` |
| Input/Result types | ✅ Complete | |

#### `geminiProvider.ts` — Gemini Provider
| Item | Status | Notes |
|------|--------|-------|
| Non-stream chat | ✅ Complete | |
| Streaming | ✅ Complete | SSE-ish line-by-line JSON parsing |
| Temperature config | ✅ Complete | 0.4 default |
| Max output tokens | ✅ Complete | 1024 default |
| 🟡 Role mapping | ⚠️ OK | Maps assistant→model, user→user |
| 🟡 Streaming JSON parsing | ⚠️ Heuristic | Simplified; may miss edge cases in Gemini response format |

#### `xaiProvider.ts` — xAI Grok Provider
| Item | Status | Notes |
|------|--------|-------|
| Non-stream chat | ✅ Complete | |
| Streaming | ✅ Complete | OpenAI-compatible SSE parsing |
| Model config | ✅ Complete | Default `grok-beta`, configurable |
| Temperature | ✅ Complete | Configurable via env |
| Base URL config | ✅ Complete | Default `https://api.x.ai` |
| Safe error trimming | ✅ Complete | 1200 char limit on error messages |

#### `providerSelector.ts` — Provider Selection
| Item | Status | Notes |
|------|--------|-------|
| Env var driven | ✅ Complete | `AI_PROVIDER` → checks for 'grok' |
| Fallback to Gemini | ✅ Complete | |
| Dynamic import | ✅ Complete | xAI provider is lazy-imported |

#### `validators.ts`
| Item | Status | Notes |
|------|--------|-------|
| `requireEnv` | ✅ Complete | |
| `getOptionalEnv` | ✅ Complete | |

#### `types.ts` — Shared Types
| Item | Status | Notes |
|------|--------|-------|
| AIMode | ✅ Complete | 'general' \| 'takshara' |
| ChatRole | ✅ Complete | 'user' \| 'assistant' \| 'system' |
| ChatMessage | ✅ Complete | |
| ChatRequest | ✅ Complete | |
| ChatResponse | ✅ Complete | |
| StreamChunk/StreamDone | ✅ Complete | |

---

## 4. Database Schema — Assessment

### 4.1 Migration 007: `ai_conversations` + `ai_messages`
| Item | Status | Notes |
|------|--------|-------|
| `ai_conversations` table | ✅ Complete | id, user_id, mode, title, created_at, updated_at |
| `ai_messages` table | ✅ Complete | id, conversation_id, user_id, role, content, created_at |
| Indexes | ✅ Complete | On user_id and conversation_id |
| RLS policies | ✅ Complete | SELECT, INSERT, UPDATE, DELETE for own records |
| updated_at trigger | ✅ Complete | `update_updated_at()` function + trigger |

### 4.2 Migration 008: `ai_file_artifacts`
| Item | Status | Notes |
|------|--------|-------|
| Table | ✅ Complete | id, user_id, file_id, artifact_type, payload (JSONB), created_at |
| Index | ✅ Complete | On user_id |
| RLS policies | ✅ Complete | SELECT, INSERT for own records |

---

## 5. Documentation — Assessment

| File | Status | Notes |
|------|--------|-------|
| `backend/AI_INTEGRATION.md` | ✅ Complete | 9 lines covering setup + stubs |
| `TODO_AI_ASSISTANT.md` | ⚠️ **Outdated** | Phase 0-4 checklist; most items now done but marked incomplete |
| `TODO_AI_ASSISTANT_BACKEND.md` | ✅ Complete | Steps 1-5 all marked done |
| `supabase/functions/README.md` | ✅ Complete | 17 lines overview |
| `TODO.md` | ⚠️ **Nearly complete** | 1 item left: Vite build |

---

## 6. Issues & Gaps — Summary

### 🟥 Critical Gaps
1. **No frontend for file artifacts** — `ai-files` and `ai-action` endpoints are fully implemented but have zero frontend integration. Users cannot upload files, generate summaries/quiz/flashcards, or view artifacts.
2. **No multi-conversation UI** — Only a single conversation view. No sidebar, no history list, no conversation switching.
3. **No conversation history API on frontend** — The frontend `api.ts` has no function to fetch `ai_conversations` or `ai_messages` from a previous session.
4. **`conversationId` is always `null`** — On line 30 of AIPage.tsx, `conversationId` is initialized as `useState<string | null>(null)` and never updated from the server response, so each page visit starts a new conversation.

### 🟡 Moderate Issues
1. **`ai-gateway` is redundant** — The `ai-chat` endpoint + `AI_PROVIDER=grok` env var already provides the same functionality. `ai-gateway` should be deprecated/removed.
2. **Gemini provider streaming is fragile** — Uses heuristic line-by-line JSON parsing which may break with Gemini response format changes.
3. **No retry logic** — Frontend does not retry on network failure; single attempt only.
4. **System prompt position fragile** — ai-chat depends on the system message being at index `[0]` of the messages array, which is set locally but not enforced by the provider interface.
5. **TODO_AI_ASSISTANT.md is out of date** — Most Phase 2/3 items are complete but not marked as done.
6. **Build not verified** — TODO.md still lists "Run frontend TypeScript + Vite build" as incomplete.

### 🟢 Strengths
1. Clean provider abstraction pattern — easy to add OpenAI, Claude, Ollama, etc.
2. Strong RLS enforcement — all DB operations scoped to authenticated user.
3. Both providers support streaming — Gemini and xAI both have `chatStream` implementations.
4. Comprehensive Takshara context — fetches 7 different data sources for personalization.
5. JWT auth in every endpoint — consistent pattern across all 4 edge functions.
6. Environment variable validation — each endpoint validates required vars before use.

---

## 7. Recommendation Priority

| Priority | Item | Effort |
|----------|------|--------|
| 🔴 P0 | Frontend: Wire `conversationId` from server response | ~30 min |
| 🔴 P0 | Frontend: Verify build passes (TypeScript + Vite) | ~15 min |
| 🟡 P1 | Frontend: Add conversation history sidebar | ~4-6 hours |
| 🟡 P1 | Deprecate `ai-gateway` endpoint | ~1 hour |
| 🟡 P2 | Frontend: Add file artifact UI (upload + summary/quiz generation) | ~8-12 hours |
| 🟢 P3 | Frontend: Add quick action chips | ~2-3 hours |
| 🟢 P3 | Update TODO_AI_ASSISTANT.md to reflect current state | ~15 min |
| 🟢 P3 | Add retry logic to api.ts | ~1 hour |

---

## 8. Files Count

| Category | Count |
|----------|-------|
| Frontend components | 2 (`AIPage.tsx`, `api.ts`, `types.ts`) |
| Edge functions | 4 (`ai-chat`, `ai-files`, `ai-action`, `ai-gateway`) |
| Shared modules | 6 (`provider.ts`, `geminiProvider.ts`, `xaiProvider.ts`, `providerSelector.ts`, `validators.ts`, `types.ts`) |
| Database migrations | 2 (007_ai_chat.sql, 008_ai_files.sql) |
| Documentation files | 5 |

**Total AI-related files: ~19**