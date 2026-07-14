import type { ChatMessage } from '../_shared/types'
import { createGeminiProvider } from '../_shared/geminiProvider'

// NOTE: Supabase Edge Functions runtime provides `Deno` and fetch-compatible APIs.
// This repo's TypeScript checker may not include Deno typings, so we add a minimal shim.
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

function normalizeRoleForGemini(messages: ChatMessage[]) {
  // Provider maps roles internally; keep messages as-is.
  return messages
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

  // ---- Auth header ----
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
    console.error('[ai-chat] Server misconfiguration: missing env vars')
    return new Response(JSON.stringify({ error: 'Server misconfiguration' }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }

  const jwt = authHeader.replace(/^Bearer\s+/i, '')

  // ---- User identity (verify JWT + get userId) ----
  // Production-grade note: we use Supabase service role key for auth/v1/user.
  // We still pass the caller JWT so any RLS-scoped selects/inserts can be enforced.
  let userId: string
  {
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
      console.error('[ai-chat] Unauthorized: /auth/v1/user failed', { status: meRes.status })
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
  const messages: ChatMessage[] = extractMessages(body.messages)
  const provider = createGeminiProvider()
  const stream = body.stream === true

  const rlsHeaders = {
    // Pass caller JWT so any RLS-scoped operations are enforced.
    authorization: `Bearer ${jwt}`,
    apikey: supabaseServiceRoleKey,
    'content-type': 'application/json',
  }

  async function supabaseGet<T>(path: string): Promise<T> {
    const res = await fetch(`${supabaseUrl}${path}`, {
      method: 'GET',
      headers: rlsHeaders,
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      const err: SupabaseRestError = { error: errText }
      // Surface missing-table/column errors verbatim.
      throw new Error(errText || err.details || 'Supabase GET failed')
    }

    return (await res.json()) as T
  }

  async function supabasePostJson<T>(path: string, payload: any): Promise<T> {
    const res = await fetch(`${supabaseUrl}${path}`, {
      method: 'POST',
      headers: rlsHeaders,
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.error('[ai-chat] Supabase POST failed', { path, status: res.status })
      throw new Error(errText || 'Supabase POST failed')
    }

    return (await res.json()) as T
  }

  async function supabasePatchJson<T>(path: string, payload: any): Promise<T> {
    const res = await fetch(`${supabaseUrl}${path}`, {
      method: 'PATCH',
      headers: rlsHeaders,
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.error('[ai-chat] Supabase PATCH failed', { path, status: res.status })
      throw new Error(errText || 'Supabase PATCH failed')
    }

    return (await res.json()) as T
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
    // RLS on ai_messages enforces user_id scoping; include user_id explicitly.
    await supabasePostJson<Array<any>>('/rest/v1/ai_messages?select=id', {
      conversation_id,
      user_id: userId,
      role,
      content,
    })
  }

  async function persistConversationTitle(conversation_id: string, firstUserText: string) {
    // Keep safe: do not leak data, only set title to truncated first message.
    const title = firstUserText.trim().slice(0, 60) || 'New conversation'
    await supabasePatchJson<Array<any>>(`/rest/v1/ai_conversations?id=eq.${encodeURIComponent(conversation_id)}&select=id`, {
      title,
    })
  }

  async function buildTaksharaContext(): Promise<string> {
    // Fetch authenticated user data using the caller JWT.
    // We use RLS-scoped queries by passing the user's JWT.

    // Subjects
    const subjects = await supabaseGet<Array<any>>(
      `/rest/v1/subjects?select=id,name,code,color&user_id=eq.${encodeURIComponent(userId)}`,
    )
    const subjectById = new Map<string, any>(subjects.map((s) => [safeString(s.id), s]))

    const schedules = await supabaseGet<Array<any>>(
      `/rest/v1/schedules?select=day,start_time,end_time,room,subject_id,faculty_name,class_type,notes,subject_color&user_id=eq.${encodeURIComponent(userId)}&order=day,start_time`,
    )

    const assignments = await supabaseGet<Array<any>>(
      `/rest/v1/assignments?select=title,description,due_date,status,priority,estimated_study_time,attachment_link,subject_id&user_id=eq.${encodeURIComponent(userId)}&order=due_date.asc`,
    )

    const notes = await supabaseGet<Array<any>>(
      `/rest/v1/notes?select=title,content,tags,subject_id&user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc&limit=20`,
    )

    const attendance = await supabaseGet<Array<any>>(
      `/rest/v1/attendance?select=date,status,subject_id&user_id=eq.${encodeURIComponent(userId)}&order=date.desc&limit=30`,
    )

    const studyGoals = await supabaseGet<Array<any>>(
      `/rest/v1/study_goals?select=title,target,current,unit,subject_id&user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc`,
    )

    const notifications = await supabaseGet<Array<any>>(
      `/rest/v1/notifications?select=type,title,message,read,link,created_at&user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc&limit=20`,
    )

    const profiles = await supabaseGet<Array<any>>(
      `/rest/v1/profiles?select=full_name,student_id,year&id=eq.${encodeURIComponent(userId)}`,
    )
    const profile = profiles?.[0] || {}

    function subjectName(subjectId: string | null | undefined) {
      const key = subjectId ? safeString(subjectId) : ''
      if (!key) return 'Unknown subject'
      return subjectById.get(key)?.name || 'Unknown subject'
    }

    const scheduleLines = schedules
      .slice(0, 30)
      .map((s) => {
        const subj = subjectName(s.subject_id)
        const day = safeString(s.day)
        const startTime = safeString(s.start_time)
        const endTime = safeString(s.end_time)
        const details = [`${day}`, `${startTime}-${endTime}`]
        const room = s.room ? `Room: ${safeString(s.room)}` : ''
        const extra = s.faculty_name ? `Faculty: ${safeString(s.faculty_name)}` : ''
        const type = s.class_type ? `Type: ${safeString(s.class_type)}` : ''
        const notesLine = s.notes ? `Notes: ${safeString(s.notes).slice(0, 220)}` : ''
        return `- ${subj}: ${details.join(' ')}${room ? ' | ' + room : ''}${extra ? ' | ' + extra : ''}${type ? ' | ' + type : ''}${notesLine ? ' | ' + notesLine : ''}`
      })
      .join('\n')

    const assignmentLines = assignments
      .slice(0, 15)
      .map((a) => {
        const subj = subjectName(a.subject_id)
        const desc = a.description ? ` ${safeString(a.description).slice(0, 180)}` : ''
        const due = a.due_date ? ` Due: ${safeString(a.due_date)}` : ''
        const pr = a.priority ? ` Priority: ${safeString(a.priority)}` : ''
        const estNum = Number(a.estimated_study_time)
        const est = Number.isFinite(estNum) ? ` Est: ${estNum}h` : ''
        return `- ${subj}: ${safeString(a.title)}${desc}${due} | Status: ${safeString(a.status)}${pr}${est}`
      })
      .join('\n')

    const noteLines = notes
      .slice(0, 10)
      .map((n) => {
        const subj = subjectName(n.subject_id)
        const snippet = n.content ? ` ${safeString(n.content).slice(0, 260)}` : ''
        const tags = Array.isArray(n.tags) && n.tags.length ? ` Tags: ${n.tags.slice(0, 5).join(', ')}` : ''
        return `- ${subj}: ${safeString(n.title)}${tags} |${snippet}`
      })
      .join('\n')

    const attendanceLines = attendance
      .slice(0, 12)
      .map((at) => {
        const subj = subjectName(at.subject_id)
        return `- ${subj}: ${safeString(at.date)} -> ${safeString(at.status)}`
      })
      .join('\n')

    const goalLines = studyGoals
      .slice(0, 8)
      .map((g) => {
        const subj = subjectName(g.subject_id)
        return `- ${subj}: ${safeString(g.title)} (${safeString(g.current)}/${safeString(g.target)} ${safeString(g.unit)})`
      })
      .join('\n')

    const notifLines = notifications
      .slice(0, 10)
      .map((n) => {
        const unread = n.read === false ? 'UNREAD' : 'READ'
        const msg = n.message ? safeString(n.message).slice(0, 180) : ''
        return `- [${unread}] ${safeString(n.type)}: ${safeString(n.title)}${msg ? ' — ' + msg : ''}`
      })
      .join('\n')

    const header = `Takshara context for ${safeString(profile.full_name) || 'student'} (year: ${profile.year ?? 'N/A'}).`

    const contextPack = [
      header,
      '\n## Timetable / Schedules\n',
      scheduleLines || '- (no schedules found)',
      '\n\n## Assignments\n',
      assignmentLines || '- (no assignments found)',
      '\n\n## Notes (recent)\n',
      noteLines || '- (no notes found)',
      '\n\n## Attendance (recent)\n',
      attendanceLines || '- (no attendance records found)',
      '\n\n## Study Goals\n',
      goalLines || '- (no study goals found)',
      '\n\n## Notifications (recent)\n',
      notifLines || '- (no notifications found)',
    ].join('')

    // Keep context bounded.
    return contextPack.slice(0, 12000)
  }

  const firstUserText = messages.find((m) => m.role === 'user')?.content || ''

  // Ensure conversation exists before we call provider (so persistence can reference it)
  const activeConversationId = await supabaseUpsertConversationIfNeeded()

  // Persist user message(s) (we persist all user messages in the request for determinism)
  for (const m of messages) {
    if (m.role === 'user') {
      await persistMessage(activeConversationId, 'user', m.content)
    }
  }

  if (firstUserText.trim()) {
    // Best-effort title update
    persistConversationTitle(activeConversationId, firstUserText).catch(() => undefined)
  }

  const taksharaContext = mode === 'takshara' ? await buildTaksharaContext() : ''

  const geminiMessages: ChatMessage[] = (() => {
    if (mode !== 'takshara') return normalizeRoleForGemini(messages)

    const systemPrompt: ChatMessage = {
      role: 'system',
      content:
        'You are a study companion for Takshara StudentOS. Use the provided student context to answer.\n' +
        'Follow the user request precisely. If the user asks something that depends on context, reference relevant items from the context pack.\n\n' +
        '--- STUDENT CONTEXT PACK START ---\n' +
        taksharaContext +
        '\n--- STUDENT CONTEXT PACK END ---',
    }

    // Keep system prompt at the front.
    return [systemPrompt, ...normalizeRoleForGemini(messages)]
  })()

  if (!stream) {
    try {
      const result = await provider.chat({ mode, messages: geminiMessages })
      await persistMessage(activeConversationId, 'assistant', result.text)
      return new Response(JSON.stringify({ conversation_id: activeConversationId, text: result.text }), {
        status: 200,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    } catch (e: any) {
      console.error('[ai-chat] Non-stream error', { message: e?.message || e })
      return new Response(JSON.stringify({ error: 'ai-chat failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }
  }

  // Streaming response
  const encoder = new TextEncoder()
  let fullText = ''

  const readable = new ReadableStream({
    async start(controller) {
      try {
        if (!provider.chatStream) throw new Error('Streaming not supported by provider')

        for await (const delta of provider.chatStream({ mode, messages: geminiMessages })) {
          fullText += delta
          controller.enqueue(encoder.encode(delta))
        }

        controller.close()

        // Persist after completion
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
    },
  })
}

