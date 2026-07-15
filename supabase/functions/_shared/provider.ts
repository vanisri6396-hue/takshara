import type { ChatMessage, AIMode } from './types'

export type ProviderChatInput = {
  mode: AIMode
  messages: ChatMessage[]
}

export type ProviderChatResult = {
  text: string
}

export interface AIProvider {
  id: string
  chat(input: ProviderChatInput): Promise<ProviderChatResult>
  chatStream?(input: ProviderChatInput): AsyncGenerator<string>
}

