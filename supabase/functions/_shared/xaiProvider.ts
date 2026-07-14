import type { AIProvider, ProviderChatInput, ProviderChatResult } from './provider'
import type { ChatMessage } from './types'

function toXaiMessages(messages: ChatMessage[]) {
  // xAI Grok chat API expects a flat message list with roles.
  // We map app roles directly.
  return messages
    .filter((m) => m.content?.trim())
    .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : m.role === 'user' ? 'user' : 'system', content: m.content }))
}

function safeTrim(s: string, maxLen: number) {
  const t = s ?? ''
  return t.length > maxLen ? t.slice(0, maxLen) : t
}

export function createXaiProvider(): AIProvider {
  const xaiApiKey = (globalThis as any)?.Deno?.env?.get?.('XAI_API_KEY') as string | undefined
  if (!xaiApiKey) {
    throw new Error('Missing XAI_API_KEY in Edge Function environment variables')
  }

  // xAI model defaults: keep configurable.
  const model = ((globalThis as any)?.Deno?.env?.get?.('XAI_MODEL') as string | undefined) || 'grok-beta'
  const temperature = Number(((globalThis as any)?.Deno?.env?.get?.('XAI_TEMPERATURE') as string | undefined) || '0.4')

  const baseUrl = ((globalThis as any)?.Deno?.env?.get?.('XAI_BASE_URL') as string | undefined) || 'https://api.x.ai'

  async function callNonStream(input: ProviderChatInput): Promise<ProviderChatResult> {
    const body = {
      model,
      messages: toXaiMessages(input.messages),
      temperature,
    }

    const res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${xaiApiKey}`,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`xAI request failed: ${res.status} ${safeTrim(text, 1200)}`)
    }

    const data = await res.json().catch(() => null) as any

    // Expected shape similar to OpenAI-style:
    // { choices: [ { message: { content: '...' } } ] }
    const content =
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.text ??
      data?.output ??
      ''

    return { text: String(content) }
  }

  async function* callStream(input: ProviderChatInput): AsyncGenerator<string> {
    // Prepare request for streaming.
    // Many xAI endpoints stream Server-Sent Events when stream=true.
    // We'll request stream=true and attempt SSE-ish parsing.
    const body = {
      model,
      messages: toXaiMessages(input.messages),
      temperature,
      stream: true,
    }

    const res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${xaiApiKey}`,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`xAI stream failed: ${res.status} ${safeTrim(text, 1200)}`)
    }

    if (!res.body) return

    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    let buf = ''

    // Best-effort SSE parsing:
    // - split by "\n"
    // - look for lines starting with "data:"
    // - parse JSON payload and extract delta text
    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      buf += decoder.decode(value, { stream: true })
      const lines = buf.split('\n')
      buf = lines.pop() || ''

      for (const rawLine of lines) {
        const line = rawLine.trim()
        if (!line) continue
        if (!line.startsWith('data:')) continue

        const dataStr = line.slice('data:'.length).trim()
        if (!dataStr || dataStr === '[DONE]') continue

        try {
          const j = JSON.parse(dataStr) as any
          const delta = j?.choices?.[0]?.delta?.content ?? j?.choices?.[0]?.message?.content ?? j?.delta?.content
          if (delta) yield String(delta)
        } catch {
          // ignore non-json chunks
        }
      }
    }
  }

  return {
    id: 'xai-grok',
    async chat(input: ProviderChatInput) {
      return callNonStream(input)
    },
    async *chatStream(input: ProviderChatInput) {
      yield* callStream(input)
    },
  }
}

