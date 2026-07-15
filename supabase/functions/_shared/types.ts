export type AIMode = 'general' | 'takshara'

export type ChatRole = 'user' | 'assistant' | 'system'

export type ChatMessage = {
  role: ChatRole
  content: string
}

export type ChatRequest = {
  mode: AIMode
  conversation_id: string | null
  messages: ChatMessage[]
  // extra client hints
  regenerate?: boolean
  client_message_id?: string
}

export type ChatResponse = {
  conversation_id: string
}

export type ProviderId = 'gemini'

export type StreamChunk = {
  type: 'delta'
  content: string
}

export type StreamDone = {
  type: 'done'
}

