import type { ChatMessage } from '../_shared/types.ts'
import { getProviderFromEnv } from '../_shared/providerSelector.ts'

// NOTE: DEPRECATED — This endpoint is superseded by `ai-chat`.
// It is kept for backward compatibility only.


declare const Deno: { env: { get: (key: string) => string | undefined } } | undefined

type AiGatewayRequestBody = {
  mode: 'general' | 'takshara'
  conversation_id: string | null
  messages: ChatMessage[]
}

type SupabaseRestError = { error?: string; details?: string }

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function assertIsChatMessages(v: any): v is ChatMessage[] {
  if (!Array.isArray(v)) return false
  return v.every(
    (m) =>
      m &&
      typeof m === 'object' &&
      (m.role === 'user' || m.role === 'assistant' || m.role === 'system') &&
      typeof m.content === 'string',
  )
}

function safeString(v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v)
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }

  const authHeader = req.headers.get('authorization') || ''
  if (!authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }

  const supabaseUrl = (globalThis as any)?.Deno?.env?.get?.('SUPABASE_URL') as string | undefined
  const supabaseServiceRoleKey = (globalThis as any)?.Deno?.env?.get?.('SUPABASE_SERVICE_ROLE_KEY') as string | undefined

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('[ai-gateway] missing env vars')
    return new Response(JSON.stringify({ error: 'Server misconfiguration' }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }

  const jwt = authHeader.replace(/^Bearer\s+/i, '')

  // Verify user and get userId
  const meRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: 'GET',
    headers: {
      authorization: `Bearer ${jwt}`,
      apikey: supabaseServiceRoleKey,
      'content-type': 'application/json',
    },
  })

  if (!meRes.ok) {
    const text = await meRes.text().catch(() => '')
    return new Response(JSON.stringify({ error: 'Unauthorized', details: text || undefined }), {
      status: 401,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }

  const me = (await meRes.json().catch(() => null)) as any
  const userId = me?.id as string | undefined
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized: missing user id' }), {
      status: 401,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }

  // Parse request body
  const body = (await req.json().catch(() => null)) as Partial<AiGatewayRequestBody> | null
  if (!body || !body.messages) {
    return new Response(JSON.stringify({ error: 'Invalid payload' }), {
      status: 400,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }

  if (!assertIsChatMessages(body.messages)) {
    return new Response(JSON.stringify({ error: 'Invalid payload: messages must be ChatMessage[]' }), {
      status: 400,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }

  const mode = body.mode
  if (mode !== 'general' && mode !== 'takshara') {
    return new Response(JSON.stringify({ error: 'Invalid mode' }), {
      status: 400,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }

  // NOTE: We intentionally do NOT implement Takshara context retrieval / persistence here,
  // because this phase is only the secure backend gateway using Grok via xAI.
  const messages = body.messages

  try {
    const provider = await getProviderFromEnv()


    // Build prompt shape: provider abstraction accepts ProviderChatInput.
    // In future we can inject Takshara system prompts + chat history.
    const providerMessages: ChatMessage[] = messages

    const result = await provider.chat({
      mode,
      messages: providerMessages,
    })


    return new Response(
      JSON.stringify({
        success: true,
        response: result.text,
        model: provider.id,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      },
    )
  } catch (e: any) {
    console.error('[ai-gateway] error', e)

    // Never return raw provider errors.
    const userMessage =
      typeof e?.message === 'string' && e.message.toLowerCase().includes('rate')
        ? 'Rate limit exceeded. Please try again shortly.'
        : 'AI request failed. Please try again.'

    return new Response(JSON.stringify({ success: false, error: userMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }
}

