import type { ChatMessage } from './types'
import { supabase } from '@/lib/supabase/client'

export type AiChatMode = 'general' | 'takshara'

export type AiChatSendPayload = {
  mode: AiChatMode
  conversation_id: string | null
  messages: ChatMessage[]
  regenerate?: boolean
  client_message_id?: string
  stream?: boolean
}

export type AiChatNonStreamResponse = {
  conversation_id: string | null
  text: string
}

const FUNCTION_URL = '/functions/v1/ai-chat'

async function getAuthHeader(): Promise<string> {
  // Pull token from the current Supabase browser session.
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    throw new Error('Missing Supabase session')
  }

  const token = session?.access_token
  if (!token) {
    throw new Error('Missing Supabase access token')
  }

  return `Bearer ${token}`
}

export async function sendAiChatNonStream(payload: AiChatSendPayload): Promise<AiChatNonStreamResponse> {
  const authHeader = await getAuthHeader()

  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: authHeader,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `ai-chat failed: ${res.status}`)
  }

  return (await res.json()) as AiChatNonStreamResponse
}

export async function sendAiChatStream(payload: AiChatSendPayload): Promise<ReadableStream<Uint8Array>> {
  const authHeader = await getAuthHeader()

  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: authHeader,
    },
    body: JSON.stringify({ ...payload, stream: true }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `ai-chat failed: ${res.status}`)
  }

  if (!res.body) {
    throw new Error('ai-chat streaming response missing body')
  }

  return res.body
}


