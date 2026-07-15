import type { AIProvider } from './provider'

function getEnv(name: string): string | undefined {
  return (globalThis as any)?.Deno?.env?.get?.(name) as string | undefined
}

/**
 * AI Provider selector
 *
 * Supported:
 * - groq   → Groq Llama models (default)
 * - gemini → Google Gemini models
 *
 * Falls back to Groq.
 */
export async function getProviderFromEnv(): Promise<AIProvider> {
  const provider = (getEnv('AI_PROVIDER') || 'groq').toLowerCase()

  if (provider === 'gemini') {
    const apiKey = getEnv('GEMINI_API_KEY')

    if (!apiKey) {
      throw new Error('Missing GEMINI_API_KEY environment variable')
    }

    const { createGeminiProvider } = await import('./geminiProvider.ts')

    return createGeminiProvider({
      apiKey,
      model:
        getEnv('GEMINI_MODEL') ||
        'gemini-2.5-flash',
      temperature: Number(
        getEnv('GEMINI_TEMPERATURE') || '0.4'
      ),
      maxTokens: Number(
        getEnv('GEMINI_MAX_TOKENS') || '2048'
      ),
    })
  }


  // Default: Groq
  const apiKey = getEnv('GROQ_API_KEY')

  if (!apiKey) {
    throw new Error('Missing GROQ_API_KEY environment variable')
  }

  const { createGroqProvider } = await import('./groqProvider.ts')

  return createGroqProvider({
    apiKey,
    model:
      getEnv('GROQ_MODEL') ||
      'llama-3.3-70b-versatile',

    temperature: Number(
      getEnv('GROQ_TEMPERATURE') || '0.4'
    ),

    maxTokens: Number(
      getEnv('GROQ_MAX_TOKENS') || '2048'
    ),
  })
}