import type { AIProvider, ProviderChatInput, ProviderChatResult } from './provider'
import type { ChatMessage } from './types'

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

export interface GeminiConfig {
  apiKey: string
  model: string
  temperature: number
  maxTokens: number
}

function toGeminiContents(messages: ChatMessage[]) {
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = []
  let systemInstruction: string | null = null

  for (const m of messages) {
    if (m.role === 'system') {
      systemInstruction = m.content
      continue
    }
    if (!m.content?.trim()) continue
    contents.push({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })
  }

  // Gemini requires at least one user turn.
  if (contents.length === 0) {
    contents.push({ role: 'user', parts: [{ text: 'Hello.' }] })
  }

  return { contents, systemInstruction }
}

function safeTrim(s: string, maxLen: number) {
  const t = s ?? ''
  return t.length > maxLen ? t.slice(0, maxLen) : t
}

export function createGeminiProvider(config: GeminiConfig): AIProvider {
  const { apiKey, model, temperature, maxTokens } = config

  async function callNonStream(input: ProviderChatInput): Promise<string> {
    const { contents, systemInstruction } = toGeminiContents(input.messages)

    const body: any = {
      contents,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    }
    if (systemInstruction) {
      body.systemInstruction = { parts: [{ text: systemInstruction }] }
    }

    const url = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 25000)

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`Gemini request failed: ${res.status} ${safeTrim(text, 1200)}`)
      }

      const data = (await res.json().catch(() => null)) as any
      const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('') ?? ''
      return String(text)
    } catch (e: any) {
      clearTimeout(timeoutId)
      console.error('[gemini] Non-stream error:', e?.message || e)
      throw e
    }
  }

  async function* callStream(input: ProviderChatInput): AsyncGenerator<string> {
    const { contents, systemInstruction } = toGeminiContents(input.messages)

    const body: any = {
      contents,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    }
    if (systemInstruction) {
      body.systemInstruction = { parts: [{ text: systemInstruction }] }
    }

    const url = `${GEMINI_BASE}/${model}:streamGenerateContent?alt=sse&key=${apiKey}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 25000)

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`Gemini stream failed: ${res.status} ${safeTrim(text, 1200)}`)
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
            const parts = j?.candidates?.[0]?.content?.parts
            if (Array.isArray(parts)) {
              for (const p of parts) {
                if (p?.text) yield String(p.text)
              }
            }
          } catch {
            // ignore non-json chunks
          }
        }
      }
    } catch (e: any) {
      clearTimeout(timeoutId)
      console.error('[gemini] Stream error:', e?.message || e)
      throw e
    }
  }

  return {
    id: 'gemini',
    async chat(input: ProviderChatInput): Promise<ProviderChatResult> {
      const text = await callNonStream(input)
      return { text }
    },
    chatStream: callStream,
  }
}
