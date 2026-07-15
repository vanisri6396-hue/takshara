# TODO_AI_ASSISTANT_BACKEND (progress)

## Audit/Fix Plan

### Step 0: Investigate current integration paths
- [x] Read edge function endpoints: ai-chat, ai-files, ai-action, ai-gateway
- [x] Read shared provider abstraction + frontend api/page usage
- [x] Read DB migrations for ai_conversations/ai_messages/ai_file_artifacts

### Step 1: Implement fixes
- [x] Recreate empty provider files: `geminiProvider.ts`, `xaiProvider.ts`, `providerSelector.ts` (were 0 bytes)
- [x] Fix `groqProvider.ts` to implement the `AIProvider` interface (`chat`/`chatStream`)
- [x] Update `ai-chat/index.ts` to use `provider.chat()` / `provider.chatStream()`
- [x] Unify artifact generation logic across `ai-files` and `ai-action` (remove divergence)
- [x] Enforce `file_id` handling: do not insert `'unknown'`; validate and return 400
- [x] Align provider routing: use `getProviderFromEnv()` in `ai-gateway`


### Step 2: Docs + verification
- [x] Update `supabase/functions/README.md` about contracts/actions
- [x] Syntax-check all `_shared` provider modules (`node --check` passes)
- [x] Frontend `tsc -b && vite build` passes
- [ ] Smoke test: streaming chat, regenerate, artifact generation paths (requires deployed env + keys)

