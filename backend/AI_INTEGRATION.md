# AI Integration Notes (Backend)

- Frontend currently calls Supabase Edge Function: `/functions/v1/ai-chat`.
- To enable secure Grok (xAI) integration, set the Edge Function env var `AI_PROVIDER=grok`.
- Auth: all endpoints require `Authorization: Bearer <supabase_jwt>`.
- User identity is verified via `GET {SUPABASE_URL}/auth/v1/user` using the caller JWT.
- RLS safety: DB reads/writes are executed via Supabase REST with caller JWT in `authorization` header; `apikey` uses `SUPABASE_SERVICE_ROLE_KEY`.
- Stubs to complete: `supabase/functions/ai-files` and `supabase/functions/ai-action`.

