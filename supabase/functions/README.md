# Supabase Edge Functions — AI Assistant

This folder contains the server-side implementation for the production AI Assistant.

## Endpoints

### `ai-chat` (active)
Main chat endpoint. Supports streaming, General and Takshara modes, conversation
persistence, and history management.

- `POST /functions/v1/ai-chat` — send a chat message.
  - Body: `{ mode: 'general' | 'takshara', conversation_id: string | null, messages: ChatMessage[], stream?: boolean }`
  - Streaming: returns `text/plain` chunks; the conversation id is returned in the
    `x-conversation-id` response header.
  - Non-streaming: returns `{ conversation_id, text }`.
- `GET /functions/v1/ai-chat?action=list_conversations` — list the user's conversations
  (returns `id, mode, title, created_at, updated_at`).
- `GET /functions/v1/ai-chat?action=get_messages&conversation_id=...` — list messages for a
  conversation (`role, content`).
- `DELETE /functions/v1/ai-chat?conversation_id=...` — delete a conversation and its messages.

### `ai-files` (active)
Generate study artifacts (summary, explanation, quiz, flashcards, qa) from provided text.

- `POST /functions/v1/ai-files`
  - Body: `{ action: 'artifact', artifact_type?, file_id?, files?: [{file_id, text?}], extracted_text?, prompt? }`
  - Returns `{ success, artifact_id, artifact_type, text }`.
  - `file_id` of `'unknown'` is rejected with `400`. Storage-backed extraction is not yet
    implemented; provide `extracted_text` or `files[].text` (returns `501` otherwise).

### `ai-action` (active)
Structured actions with validation.

- `POST /functions/v1/ai-action`
  - `conversation_title`: `{ action: 'conversation_title', conversation_id, first_user_text }`
  - `generate_file_artifact`: same shape as `ai-files` `artifact` action.

### `ai-gateway` (deprecated)
Legacy non-streaming gateway. Superseded by `ai-chat` (set `AI_PROVIDER=grok` to use Grok
there). Kept only for backward compatibility.

## Provider Abstraction
Providers implement a shared `AIProvider` interface (`_shared/provider.ts`) with
`chat()` and optional `chatStream()`. Implemented providers:

- `groqProvider.ts` (default)
- `geminiProvider.ts`
- `xaiProvider.ts` (xAI Grok)

`AI_PROVIDER` selects the provider at runtime (`groq` | `gemini` | `xai`). Each provider reads
its own API key / model / temperature / max-tokens from environment variables.

## Security Requirements
- Never expose API keys to the client.
- Authenticate every request using the Supabase JWT (`authorization: Bearer <jwt>`).
- Enforce RLS and user scoping for all Takshara Mode queries and artifact persistence.