import type { AIProvider } from './provider'

declare const Deno: { env: { get: (key: string) => string | undefined } } | undefined

function getEnv(name: string): string | undefined {
  return (globalThis as any)?.Deno?.env?.get?.(name) as string | undefined
}

/**
 * Selects an AI provider based on the AI_PROVIDER environment variable.
 *
 * Supported values:
 *   - "groq"  → Groq (default)
 *   - "gemini" → Google Gemini
 *   - "xai"   → xAI Grok
 *
 * Falls back to Groq when the variable is unset or unrecognized.
 */
export async function getProviderFromEnv(): Promise<AIProvider> {
  const provider = (getEnv('AI_PROVIDER') || 'groq').toLowerCase()

  if (provider === 'gemini') {
    const { createGeminiProvider } = await import('./geminiProvider.ts')
    return createGeminiProvider({
      apiKey: getEnv('GEMINI_API_KEY') || '',
      model: getEnv('GEMINI_MODEL') || 'gemini-1.5-flash',
      temperature: Number(getEnv('GEMINI_TEMPERATURE') || '0.4'),
      maxTokens: Number(getEnv('GEMINI_MAX_TOKENS') || '1024'),
    })
  }

  if (provider === 'xai') {
    const { createXaiProvider } = await import('./xaiProvider.ts')
    return createXaiProvider({
      apiKey: getEnv('XAI_API_KEY') || '',
      model: getEnv('XAI_MODEL') || 'grok-beta',
      temperature: Number(getEnv('XAI_TEMPERATURE') || '0.4'),
      maxTokens: Number(getEnv('XAI_MAX_TOKENS') || '1024'),
      baseUrl: getEnv('XAI_BASE_URL') || 'https://api.x.ai/v1/chat/completions',
    })
  }

  // Default: Groq
  const { createGroqProvider } = await import('./groqProvider.ts')
  return createGroqProvider({
    apiKey: getEnv('GROQ_API_KEY') || '',
    model: getEnv('GROQ_MODEL') || 'llama-3.3-70b-versatile',
    temperature: Number(getEnv('GROQ_TEMPERATURE') || '0.4'),
    maxTokens: Number(getEnv('GROQ_MAX_TOKENS') || '1024'),
  })
}