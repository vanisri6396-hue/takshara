import type { ChatMessage } from '../_shared/types.ts'
import { getProviderFromEnv } from '../_shared/providerSelector.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function requireEnv(name: string): Promise<string> {
  const v = (globalThis as any)?.Deno?.env?.get?.(name) as string | undefined
  if (!v) throw new Error(`Missing ${name} in Edge Function environment variables`)
  return v
}

type AiActionRequestBody =
  | {
      action: 'conversation_title'
      conversation_id: string
      first_user_text: string
    }
  | {
      action: 'generate_file_artifact'
      file_id?: string
      files?: Array<{ file_id: string; text?: string }>
      artifact_type?: 'summary' | 'explanation' | 'quiz' | 'flashcards' | 'qa'
      prompt?: string
      extracted_text?: string
    }

function assertIsActionBody(body: any): body is AiActionRequestBody {
  if (!body || typeof body !== 'object') return false

  if (body.action === 'conversation_title') {
    return typeof body.conversation_id === 'string' && typeof body.first_user_text === 'string'
  }

  if (body.action === 'generate_file_artifact') {
    if (body.files) {
      if (!Array.isArray(body.files)) return false
      for (const f of body.files) {
        if (!f || typeof f.file_id !== 'string') return false
        if ('text' in f && f.text !== undefined && typeof f.text !== 'string') return false
      }
    }

    if (body.file_id !== undefined && typeof body.file_id !== 'string') return false

    if (body.artifact_type !== undefined) {
      const allowed = new Set(['summary', 'explanation', 'quiz', 'flashcards', 'qa'])
      if (!allowed.has(body.artifact_type)) return false
    }

    if (body.prompt !== undefined && typeof body.prompt !== 'string') return false
    if (body.extracted_text !== undefined && typeof body.extracted_text !== 'string') return false

    return true
  }

  return false
}

function safeTrimTitle(s: string): string {
  const t = (s ?? '').trim().slice(0, 60)
  return t || 'New conversation'
}

function safeJoinText(texts: string[]): string {
  return texts.map((t) => (t ?? '').toString()).filter(Boolean).join('\n\n').slice(0, 20000)
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

  const supabaseUrl = await requireEnv('SUPABASE_URL')
  const supabaseServiceRoleKey = await requireEnv('SUPABASE_SERVICE_ROLE_KEY')
  const jwt = authHeader.replace(/^Bearer\s+/i, '')

  // Verify user identity
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

  const body = (await req.json().catch(() => null)) as any
  if (!assertIsActionBody(body)) {
    return new Response(JSON.stringify({ error: 'Invalid payload' }), {
      status: 400,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }

  const rlsHeaders = {
    authorization: `Bearer ${jwt}`,
    apikey: supabaseServiceRoleKey,
    'content-type': 'application/json',
  }

  try {
    if (body.action === 'conversation_title') {
      const title = safeTrimTitle(body.first_user_text)

      const patchRes = await fetch(
        `${supabaseUrl}/rest/v1/ai_conversations?id=eq.${encodeURIComponent(body.conversation_id)}&select=id`,
        {
          method: 'PATCH',
          headers: rlsHeaders,
          body: JSON.stringify({ title }),
        },
      )

      if (!patchRes.ok) {
        const text = await patchRes.text().catch(() => '')
        throw new Error(text || 'Failed to update conversation title')
      }

      return new Response(JSON.stringify({ success: true, title }), {
        status: 200,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }

    if (body.action === 'generate_file_artifact') {
      const artifact_type = (body.artifact_type || 'summary') as any
      const allowed = new Set(['summary', 'explanation', 'quiz', 'flashcards', 'qa'])
      if (!allowed.has(artifact_type)) {
        return new Response(JSON.stringify({ error: 'Invalid artifact_type' }), {
          status: 400,
          headers: { ...corsHeaders, 'content-type': 'application/json' },
        })
      }

      const texts: string[] = []
      if (typeof body.extracted_text === 'string') texts.push(body.extracted_text)
      if (body.files) {
        for (const f of body.files) {
          if (f.text) texts.push(f.text)
        }
      }

      if (!texts.length) {
        return new Response(JSON.stringify({ error: 'Extraction not implemented. Provide extracted_text or files[].text' }), {
          status: 501,
          headers: { ...corsHeaders, 'content-type': 'application/json' },
        })
      }

      const extracted_text = safeJoinText(texts)

      const system: ChatMessage = {
        role: 'system',
        content: 'You are an AI study assistant. Produce the requested artifact type in a clear format.',
      }

      const user: ChatMessage = {
        role: 'user',
        content:
          `${body.prompt ? `Instruction: ${body.prompt}\n\n` : ''}` +
          `Artifact type: ${artifact_type}\n\n` +
          `Source text (may be truncated):\n${extracted_text}`,
      }

      const provider = await getProviderFromEnv()
      const result = await provider.chat({
        mode: 'general',
        messages: [system, user],
      })

      const payload = {
        text: result.text,
        artifact_type,
        prompt: body.prompt || null,
      }

      const fileIdForRow = body.file_id || body.files?.[0]?.file_id || null
      if (fileIdForRow && fileIdForRow === 'unknown') {
        return new Response(JSON.stringify({ error: 'Invalid file_id: "unknown" is not allowed' }), {
          status: 400,
          headers: { ...corsHeaders, 'content-type': 'application/json' },
        })
      }

      const insertRes = await fetch(`${supabaseUrl}/rest/v1/ai_file_artifacts`, {
        method: 'POST',
        headers: rlsHeaders,
        body: JSON.stringify({
          user_id: userId,
          file_id: fileIdForRow,
          artifact_type,
          payload,
        }),
      })

      if (!insertRes.ok) {
        const text = await insertRes.text().catch(() => '')
        throw new Error(text || 'Failed to persist artifact')
      }

      const inserted = (await insertRes.json().catch(() => null)) as any
      const artifactId = inserted?.[0]?.id as string | undefined

      return new Response(
        JSON.stringify({
          success: true,
          artifact_id: artifactId || null,
          artifact_type,
          text: result.text,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'content-type': 'application/json' },
        },
      )
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  } catch (e: any) {
    console.error('[ai-action] error', e)
    return new Response(JSON.stringify({ error: e?.message ? String(e.message) : 'ai-action failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }
}

