export type AiChatMode = 'general' | 'takshara'

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

