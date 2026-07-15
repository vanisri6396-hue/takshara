import type { AIProvider, ProviderChatInput, ProviderChatResult } from './provider'
import type { ChatMessage } from './types'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

function toGroqMessages(messages: ChatMessage[]) {
  return messages
    .filter((m) => m.content?.trim())
    .map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : m.role === 'user' ? 'user' : 'system',
      content: m.content,
    }))
}

function safeTrim(s: string, maxLen: number) {
  const t = s ?? ''
  return t.length > maxLen ? t.slice(0, maxLen) : t
}

export interface GroqConfig {
  apiKey: string
  model: string
  temperature: number
  maxTokens: number
}

export function createGroqProvider(config: GroqConfig): AIProvider {
  const { apiKey, model, temperature, maxTokens } = config

  async function callNonStream(input: ProviderChatInput): Promise<string> {
    console.log('[groq] Non-stream request started, messages:', input.messages.length)
    const body = {
      model,
      messages: toGroqMessages(input.messages),
      temperature,
      max_tokens: maxTokens,
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 25000)

    try {
      const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      console.log('[groq] Non-stream response status:', res.status)

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`Groq request failed: ${res.status} ${safeTrim(text, 1200)}`)
      }

      const data = await res.json().catch(() => null) as any
      const content = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? ''

      console.log('[groq] Non-stream response received, length:', String(content).length)
      return String(content)
    } catch (e: any) {
      clearTimeout(timeoutId)
      console.error('[groq] Non-stream error:', e?.message || e)
      throw e
    }
  }

  async function* callStream(input: ProviderChatInput): AsyncGenerator<string> {
    console.log('[groq] Stream request started, messages:', input.messages.length)
    const body = {
      model,
      messages: toGroqMessages(input.messages),
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 25000)

    try {
      const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      console.log('[groq] Stream response status:', res.status)

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`Groq stream failed: ${res.status} ${safeTrim(text, 1200)}`)
      }

      if (!res.body) {
        console.log('[groq] Stream response has no body')
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''
      let chunkCount = 0

      while (true) {
        const { value, done } = await reader.read()
        if (done) {
          console.log('[groq] Stream completed, total chunks:', chunkCount)
          break
        }

        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() || ''

        for (const rawLine of lines) {
          const line = rawLine.trim()
          if (!line) continue
          if (!line.startsWith('data:')) continue

          const dataStr = line.slice('data:'.length).trim()
          if (!dataStr || dataStr === '[DONE]') {
            if (dataStr === '[DONE]') console.log('[groq] Received [DONE] signal')
            continue
          }

          try {
            const j = JSON.parse(dataStr) as any
            const delta = j?.choices?.[0]?.delta?.content ?? j?.choices?.[0]?.message?.content ?? ''
            if (delta) {
              chunkCount++
              yield String(delta)
            }
          } catch {
            // ignore non-json chunks
          }
        }
      }
    } catch (e: any) {
      clearTimeout(timeoutId)
      console.error('[groq] Stream error:', e?.message || e)
      throw e
    }
  }

  return {
    id: 'groq',
    async chat(input: ProviderChatInput): Promise<ProviderChatResult> {
      const text = await callNonStream(input)
      return { text }
    },
    chatStream: callStream,
  }
}
