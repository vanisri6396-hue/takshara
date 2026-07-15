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

export type ConversationListItem = {
  id: string
  mode: AiChatMode
  title: string
  created_at: string
  updated_at: string
}

export type ArtifactType = 'summary' | 'explanation' | 'quiz' | 'flashcards' | 'qa'

export type AiFilesPayload = {
  action: 'artifact'
  file_id?: string
  files?: Array<{ file_id: string; text?: string }>
  artifact_type?: ArtifactType
  prompt?: string
  extracted_text?: string
}

export type AiFilesResponse = {
  success: boolean
  artifact_id: string | null
  artifact_type: ArtifactType
  text: string
}

export type AiActionPayload =
  | {
      action: 'conversation_title'
      conversation_id: string
      first_user_text: string
    }
  | {
      action: 'generate_file_artifact'
      file_id?: string
      files?: Array<{ file_id: string; text?: string }>
      artifact_type?: ArtifactType
      prompt?: string
      extracted_text?: string
    }

export type AiActionResponse = {
  success: boolean
  title?: string
  artifact_id?: string | null
  artifact_type?: ArtifactType
  text?: string
}

// Vite dev server proxies /functions/v1/* to Supabase (see vite.config.ts).
// In production, ensure your hosting platform forwards these requests or
// set a reverse proxy. The full Supabase URL can be used for non-proxied deploys.
const AI_CHAT_URL = '/functions/v1/ai-chat'
const AI_FILES_URL = '/functions/v1/ai-files'
const AI_ACTION_URL = '/functions/v1/ai-action'

async function getAuthHeader(): Promise<string> {
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

  const res = await fetch(AI_CHAT_URL, {
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

export type AiChatStreamResult = {
  stream: ReadableStream<Uint8Array>
  conversationId: string | null
}

export async function sendAiChatStream(payload: AiChatSendPayload): Promise<AiChatStreamResult> {
  const authHeader = await getAuthHeader()

  const res = await fetch(AI_CHAT_URL, {
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

  const conversationId = res.headers.get('x-conversation-id') || null

  return { stream: res.body, conversationId }
}

/** Fetch all conversations for the authenticated user. */
export async function fetchConversations(): Promise<ConversationListItem[]> {
  const authHeader = await getAuthHeader()

  const res = await fetch(`${AI_CHAT_URL}?action=list_conversations`, {
    method: 'GET',
    headers: {
      authorization: authHeader,
      'content-type': 'application/json',
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `fetch conversations failed: ${res.status}`)
  }

  return (await res.json()) as ConversationListItem[]
}

/** Fetch messages for a specific conversation. */
export async function fetchConversationMessages(conversationId: string): Promise<ChatMessage[]> {
  const authHeader = await getAuthHeader()

  const res = await fetch(`${AI_CHAT_URL}?action=get_messages&conversation_id=${encodeURIComponent(conversationId)}`, {
    method: 'GET',
    headers: {
      authorization: authHeader,
      'content-type': 'application/json',
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `fetch messages failed: ${res.status}`)
  }

  return (await res.json()) as ChatMessage[]
}

/** Delete a conversation. */
export async function deleteConversation(conversationId: string): Promise<void> {
  const authHeader = await getAuthHeader()

  const res = await fetch(`${AI_CHAT_URL}?conversation_id=${encodeURIComponent(conversationId)}`, {
    method: 'DELETE',
    headers: {
      authorization: authHeader,
      'content-type': 'application/json',
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `delete conversation failed: ${res.status}`)
  }
}

/** Generate a file artifact (summary, quiz, flashcards, etc.). */
export async function generateFileArtifact(payload: AiFilesPayload): Promise<AiFilesResponse> {
  const authHeader = await getAuthHeader()

  const res = await fetch(AI_FILES_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: authHeader,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `ai-files failed: ${res.status}`)
  }

  return (await res.json()) as AiFilesResponse
}

/** Execute a structured AI action (e.g. rename conversation, generate artifact). */
export async function executeAiAction(payload: AiActionPayload): Promise<AiActionResponse> {
  const authHeader = await getAuthHeader()

  const res = await fetch(AI_ACTION_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: authHeader,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `ai-action failed: ${res.status}`)
  }

  return (await res.json()) as AiActionResponse
}


