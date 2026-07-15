export function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing ${name} in Edge Function environment variables`)
  }
  return value
}

export function getOptionalEnv(name: string): string | undefined {
  return (globalThis as any)?.Deno?.env?.get?.(name) as string | undefined
}

