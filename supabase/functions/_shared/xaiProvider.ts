import type { AIProvider, ProviderChatInput, ProviderChatResult } from './provider'
import type { ChatMessage } from './types'

const XAI_BASE = 'https://api.x.ai/v1/chat/completions'

export interface XaiConfig {
  apiKey: string
  model: string
  temperature: number
  maxTokens: number
  baseUrl?: string
}

function toXaiMessages(messages: ChatMessage[]) {
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

export function createXaiProvider(config: XaiConfig): AIProvider {
  const { apiKey, model, temperature, maxTokens } = config
  const baseUrl = config.baseUrl || XAI_BASE

  async function callNonStream(input: ProviderChatInput): Promise<string> {
    const body = {
      model,
      messages: toXaiMessages(input.messages),
      temperature,
      max_tokens: maxTokens,
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 25000)

    try {
      const res = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`xAI request failed: ${res.status} ${safeTrim(text, 1200)}`)
      }

      const data = (await res.json().catch(() => null)) as any
      const content = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? ''
      return String(content)
    } catch (e: any) {
      clearTimeout(timeoutId)
      console.error('[xai] Non-stream error:', e?.message || e)
      throw e
    }
  }

  async function* callStream(input: ProviderChatInput): AsyncGenerator<string> {
    const body = {
      model,
      messages: toXaiMessages(input.messages),
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 25000)

    try {
      const res = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`xAI stream failed: ${res.status} ${safeTrim(text, 1200)}`)
      }

      if (!res.body) return

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() || ''

        for (const rawLine of lines) {
          const line = rawLine.trim()
          if (!line.startsWith('data:')) continue
          const dataStr = line.slice('data:'.length).trim()
          if (!dataStr || dataStr === '[DONE]') continue

          try {
            const j = JSON.parse(dataStr) as any
            const delta = j?.choices?.[0]?.delta?.content ?? j?.choices?.[0]?.message?.content ?? ''
            if (delta) yield String(delta)
          } catch {
            // ignore non-json chunks
          }
        }
      }
    } catch (e: any) {
      clearTimeout(timeoutId)
      console.error('[xai] Stream error:', e?.message || e)
      throw e
    }
  }

  return {
    id: 'xai',
    async chat(input: ProviderChatInput): Promise<ProviderChatResult> {
      const text = await callNonStream(input)
      return { text }
    },
    chatStream: callStream,
  }
}
