// Simple rate limiter for Supabase auth endpoints
// Prevents 429 errors by adding minimum delay between requests

const MIN_DELAY = 1000
const lastCall = { signup: 0, signin: 0 }

export async function rateLimitedSignup(
  fn: () => Promise<{ data?: any; error?: any }>
): Promise<{ data?: any; error?: any }> {
  const now = Date.now()
  const elapsed = now - lastCall.signup
  if (elapsed < MIN_DELAY) {
    await sleep(MIN_DELAY - elapsed)
  }
  lastCall.signup = Date.now()
  return fn()
}

export async function rateLimitedSignin(
  fn: () => Promise<{ data?: any; error?: any }>
): Promise<{ data?: any; error?: any }> {
  const now = Date.now()
  const elapsed = now - lastCall.signin
  if (elapsed < MIN_DELAY) {
    await sleep(MIN_DELAY - elapsed)
  }
  lastCall.signin = Date.now()
  return fn()
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}