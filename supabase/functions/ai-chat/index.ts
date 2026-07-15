import type { ChatMessage } from '../_shared/types.ts'
import { createGroqProvider } from '../_shared/groqProvider.ts'

declare const Deno: { env: { get: (key: string) => string | undefined } } | undefined

type AiChatRequestBody = {
  mode: 'general' | 'takshara'
  conversation_id: string | null
  messages: ChatMessage[]
  regenerate?: boolean
  client_message_id?: string
  stream?: boolean
}

type SupabaseRestError = {
  error?: string
  details?: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function extractMessages(messages: ChatMessage[]) {
  return messages
}

function safeString(v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v)
}

function assertIsChatMessages(v: any): v is ChatMessage[] {
  if (!Array.isArray(v)) return false
  return v.every((m) => m && typeof m === 'object' && (m.role === 'user' || m.role === 'assistant' || m.role === 'system') && typeof m.content === 'string')
}

export default async function handler(req: Request): Promise<Response> {
  const requestStart = Date.now()
  console.log('[ai-chat] Request started, method:', req.method)

  if (req.method === 'OPTIONS') {
    console.log('[ai-chat] OPTIONS request, returning CORS headers')
    return new Response('ok', { status: 200, headers: corsHeaders })
  }

  // ---- Auth header ----
  const authHeader = req.headers.get('authorization') || ''
  if (!authHeader.startsWith('Bearer ')) {
    console.log('[ai-chat] Unauthorized: missing or invalid auth header')
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }

  const supabaseUrl = (globalThis as any)?.Deno?.env?.get?.('SUPABASE_URL') as string | undefined
  const supabaseServiceRoleKey = (globalThis as any)?.Deno?.env?.get?.('SUPABASE_SERVICE_ROLE_KEY') as string | undefined
  const groqApiKey = (globalThis as any)?.Deno?.env?.get?.('GROQ_API_KEY') as string | undefined

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('[ai-chat] Server misconfiguration: missing env vars', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseServiceRoleKey,
    })
    return new Response(JSON.stringify({ error: 'Server misconfiguration' }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }

  if (!groqApiKey) {
    console.error('[ai-chat] Missing GROQ_API_KEY')
    return new Response(JSON.stringify({ error: 'AI service not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }

  const jwt = authHeader.replace(/^Bearer\s+/i, '')
  console.log('[ai-chat] JWT extracted, validating user...')

  // ---- User identity ----
  let userId: string
  {
    const authStart = Date.now()
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
      console.error('[ai-chat] Unauthorized: /auth/v1/user failed', {
        status: meRes.status,
        duration: Date.now() - authStart,
      })
      return new Response(JSON.stringify({ error: 'Unauthorized', details: text || undefined }), {
        status: 401,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }

    const me = await meRes.json().catch(() => null)
    userId = me?.id
    if (!userId) {
      console.error('[ai-chat] Unauthorized: missing user id in /auth/v1/user response')
      return new Response(JSON.stringify({ error: 'Unauthorized: missing user id' }), {
        status: 401,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }

    console.log('[ai-chat] User authenticated:', userId, 'duration:', Date.now() - authStart)
  }

  const rlsHeaders = {
    authorization: `Bearer ${jwt}`,
    apikey: supabaseServiceRoleKey,
    'content-type': 'application/json',
  }

  // ---- GET: list conversations or get messages ----
  if (req.method === 'GET') {
    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    if (action === 'list_conversations') {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/ai_conversations?select=id,mode,title,created_at,updated_at&user_id=eq.${encodeURIComponent(userId)}&order=updated_at.desc`,
        { headers: rlsHeaders },
      )

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        return new Response(JSON.stringify({ error: text || 'Failed to fetch conversations' }), {
          status: 500,
          headers: { ...corsHeaders, 'content-type': 'application/json' },
        })
      }

      const data = await res.json()
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }

    if (action === 'get_messages') {
      const conversationId = url.searchParams.get('conversation_id')
      if (!conversationId) {
        return new Response(JSON.stringify({ error: 'Missing conversation_id' }), {
          status: 400,
          headers: { ...corsHeaders, 'content-type': 'application/json' },
        })
      }

      const res = await fetch(
        `${supabaseUrl}/rest/v1/ai_messages?select=role,content&conversation_id=eq.${encodeURIComponent(conversationId)}&user_id=eq.${encodeURIComponent(userId)}&order=created_at.asc`,
        { headers: rlsHeaders },
      )

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        return new Response(JSON.stringify({ error: text || 'Failed to fetch messages' }), {
          status: 500,
          headers: { ...corsHeaders, 'content-type': 'application/json' },
        })
      }

      const data = await res.json()
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }

  // ---- DELETE: delete a conversation ----
  if (req.method === 'DELETE') {
    const url = new URL(req.url)
    const conversationId = url.searchParams.get('conversation_id')
    if (!conversationId) {
      return new Response(JSON.stringify({ error: 'Missing conversation_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }

    await fetch(
      `${supabaseUrl}/rest/v1/ai_messages?conversation_id=eq.${encodeURIComponent(conversationId)}&user_id=eq.${encodeURIComponent(userId)}`,
      { method: 'DELETE', headers: rlsHeaders },
    )

    const res = await fetch(
      `${supabaseUrl}/rest/v1/ai_conversations?id=eq.${encodeURIComponent(conversationId)}&user_id=eq.${encodeURIComponent(userId)}`,
      { method: 'DELETE', headers: rlsHeaders },
    )

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return new Response(JSON.stringify({ error: text || 'Failed to delete conversation' }), {
        status: 500,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }

  // ---- Parse + validate request body ----
  const body = (await req.json().catch(() => null)) as Partial<AiChatRequestBody> | null
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

  const conversationId = (body.conversation_id ?? null) as string | null
  let messages: ChatMessage[] = extractMessages(body.messages)

  // CRITICAL: Trim message history to prevent excessive token usage
  const MAX_MESSAGES = 15
  if (messages.length > MAX_MESSAGES) {
    messages = messages.slice(-MAX_MESSAGES)
  }

  const stream = body.stream === true

  // Initialize Groq provider
  const groqModel = (globalThis as any)?.Deno?.env?.get?.('GROQ_MODEL') as string | undefined || 'llama-3.3-70b-versatile'
  const groqTemperature = Number(((globalThis as any)?.Deno?.env?.get?.('GROQ_TEMPERATURE') as string | undefined) || '0.4')
  const groqMaxTokens = Number(((globalThis as any)?.Deno?.env?.get?.('GROQ_MAX_TOKENS') as string | undefined) || '1024')

  const provider = createGroqProvider({
    apiKey: groqApiKey,
    model: groqModel,
    temperature: groqTemperature,
    maxTokens: groqMaxTokens,
  })

  async function supabaseGet<T>(path: string): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    try {
      const res = await fetch(`${supabaseUrl}${path}`, {
        method: 'GET',
        headers: rlsHeaders,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        const errText = await res.text().catch(() => '')
        const err: SupabaseRestError = { error: errText }
        throw new Error(errText || err.details || 'Supabase GET failed')
      }

      return (await res.json()) as T
    } catch (e: any) {
      clearTimeout(timeoutId)
      console.error('[ai-chat] Supabase GET failed', { path, error: e?.message || e })
      throw e
    }
  }

  async function supabasePostJson<T>(path: string, payload: any): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    try {
      const res = await fetch(`${supabaseUrl}${path}`, {
        method: 'POST',
        headers: rlsHeaders,
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        const errText = await res.text().catch(() => '')
        console.error('[ai-chat] Supabase POST failed', { path, status: res.status })
        throw new Error(errText || 'Supabase POST failed')
      }

      return (await res.json()) as T
    } catch (e: any) {
      clearTimeout(timeoutId)
      console.error('[ai-chat] Supabase POST error', { path, error: e?.message || e })
      throw e
    }
  }

  async function supabasePatchJson<T>(path: string, payload: any): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    try {
      const res = await fetch(`${supabaseUrl}${path}`, {
        method: 'PATCH',
        headers: rlsHeaders,
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        const errText = await res.text().catch(() => '')
        console.error('[ai-chat] Supabase PATCH failed', { path, status: res.status })
        throw new Error(errText || 'Supabase PATCH failed')
      }

      return (await res.json()) as T
    } catch (e: any) {
      clearTimeout(timeoutId)
      console.error('[ai-chat] Supabase PATCH error', { path, error: e?.message || e })
      throw e
    }
  }

  async function supabaseUpsertConversationIfNeeded(): Promise<string> {
    if (conversationId) return conversationId

    const convRows = await supabasePostJson<Array<{ id: string }>>('/rest/v1/ai_conversations?select=id', {
      user_id: userId,
      mode,
      title: 'New conversation',
    })

    const id = convRows?.[0]?.id
    if (!id) throw new Error('Failed to create ai_conversations row')
    return id
  }

  async function persistMessage(conversation_id: string, role: 'user' | 'assistant' | 'system', content: string) {
    await supabasePostJson<Array<any>>('/rest/v1/ai_messages?select=id', {
      conversation_id,
      user_id: userId,
      role,
      content,
    })
  }

  function pickLastUserMessage(messages: ChatMessage[]): string {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i]
      if (m?.role === 'user' && typeof m.content === 'string' && m.content.trim()) return m.content
    }
    return ''
  }

  function capText(s: string, maxChars: number) {
    const t = s ?? ''
    return t.length > maxChars ? t.slice(0, maxChars) : t
  }

  async function persistConversationTitle(conversation_id: string, firstUserText: string) {
    const title = firstUserText.trim().slice(0, 60) || 'New conversation'
    await supabasePatchJson<Array<any>>(`/rest/v1/ai_conversations?id=eq.${encodeURIComponent(conversation_id)}&select=id`, {
      title,
    })
  }

  const firstUserText = messages.find((m) => m.role === 'user')?.content || ''
  console.log('[ai-chat] First user text found:', !!firstUserText, 'mode:', mode)

  // Ensure conversation exists
  const convStart = Date.now()
  const activeConversationId = await supabaseUpsertConversationIfNeeded()
  console.log('[ai-chat] Conversation ready:', activeConversationId, 'duration:', Date.now() - convStart)

  // Persist only the latest user message
  const lastUserMessage = pickLastUserMessage(messages)
  if (lastUserMessage) {
    await persistMessage(activeConversationId, 'user', capText(lastUserMessage, 4000))
  }

  if (firstUserText.trim()) {
    persistConversationTitle(activeConversationId, firstUserText).catch(() => undefined)
  }

  // Build messages for Groq
  const groqMessages: ChatMessage[] = (() => {
    if (mode !== 'takshara') return messages

    const systemPrompt: ChatMessage = {
      role: 'system',
      content:
        'You are a study companion for Takshara StudentOS. Help the student with their academic questions, ' +
        'explain concepts clearly, help with problem-solving, and provide study guidance. ' +
        'Be supportive, educational, and concise in your responses.',
    }

    return [systemPrompt, ...messages]
  })()

  console.log('[ai-chat] Calling Groq, stream:', stream, 'messages:', groqMessages.length)
  const providerStart = Date.now()

  if (!stream) {
    try {
      const result = await provider.chat({ mode, messages: groqMessages })
      const text = result.text
      console.log('[ai-chat] Groq response received, duration:', Date.now() - providerStart, 'text length:', text.length)
      await persistMessage(activeConversationId, 'assistant', text)
      return new Response(JSON.stringify({ conversation_id: activeConversationId, text }), {
        status: 200,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    } catch (e: any) {
      console.error('[ai-chat] Non-stream error', { message: e?.message || e, duration: Date.now() - providerStart })
      return new Response(JSON.stringify({ error: e?.message || 'ai-chat failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }
  }

  // Streaming response
  const encoder = new TextEncoder()
  const maxAssistantPersistChars = 4000
  let fullText = ''

  const readable = new ReadableStream({
    async start(controller) {
      try {
        if (!provider.chatStream) {
          throw new Error('Streaming is not supported by the configured provider')
        }
        const streamGenerator = provider.chatStream({ mode, messages: groqMessages })

        for await (const delta of streamGenerator) {
          if (fullText.length < maxAssistantPersistChars) {
            const remaining = maxAssistantPersistChars - fullText.length
            fullText += delta.slice(0, remaining)
          }
          controller.enqueue(encoder.encode(delta))
        }

        controller.close()
        await persistMessage(activeConversationId, 'assistant', fullText)
      } catch (e: any) {
        console.error('[ai-chat] Stream error', { message: e?.message || e })
        controller.error(e)
      }
    },
  })

  return new Response(readable, {
    status: 200,
    headers: {
      ...corsHeaders,
      'content-type': 'text/plain; charset=utf-8',
      'x-conversation-id': activeConversationId,
    },
  })
}