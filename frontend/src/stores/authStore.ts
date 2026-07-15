import { create } from 'zustand'
import type { User, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { rateLimitedSignin, rateLimitedSignup } from '@/lib/rateLimiter'
import { queryClient } from '@/lib/queryClient'

// Map Supabase auth errors to safe, user-friendly messages.
// Never expose raw backend error strings to the UI.
// IMPORTANT: Specific message checks must come BEFORE generic status checks.
function mapAuthError(error: AuthError | Error | unknown): string {
  const err = error as AuthError & Error
  const status = (err as any)?.status
  const raw = err?.message || ''
  const msg = raw.toLowerCase()

  // Rate-limit / throttle — always check status first for these
  if (status === 429) return 'Too many attempts. Please wait a moment and try again.'

  // Specific message checks (must come before generic status === 400 check)
  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials'))
    return 'Invalid email or password.'
  if (
    msg.includes('already been registered') ||
    msg.includes('already registered') ||
    msg.includes('user already registered')
  )
    return 'An account with this email already exists.'
  if (msg.includes('email not confirmed') || msg.includes('email not verified') || msg.includes('please verify'))
    return 'Please verify your email address before signing in.'
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch') || msg.includes('econnrefused'))
    return 'Network error. Please check your internet connection and try again.'
  if (msg.includes('expired') || msg.includes('session'))
    return 'Your session has expired. Please sign in again.'
  if (msg.includes('invalid api key') || msg.includes('api key') || msg.includes('publishable'))
    return 'Authentication service configuration error. Please contact support.'

  // Generic status-based fallbacks (order kept last so specific messages win)
  if (status === 400) return 'Authentication failed. Please check your email and password and try again.'
  if (status === 500)
    return 'The authentication service is temporarily unavailable. Please try again in a few moments.'

  return raw || 'Something went wrong. Please try again.'
}

interface Profile {
  id: string
  full_name: string
  email: string
  student_id: string
  avatar_url: string
  year: number
}

interface AuthState {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  initialize: () => () => void
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  fetchProfile: () => Promise<void>
  updateProfile: (data: Partial<Profile>) => Promise<{ error?: string }>
}

// Track the active auth subscription so we can clean it up (StrictMode-safe).
let authSubscription: { data: { subscription: { unsubscribe: () => void } } } | null = null

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: () => {
    // Prevent duplicate listeners: unsubscribe any previous instance first.
    if (authSubscription) {
      authSubscription.data.subscription.unsubscribe()
      authSubscription = null
    }

    const loadSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          set({ user: session.user, isAuthenticated: true })
          await get().fetchProfile()
        }
      } catch {
        // Not authenticated
      } finally {
        set({ isLoading: false })
      }
    }

    loadSession()

    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        set({ user: session.user, isAuthenticated: true })
        await get().fetchProfile()
      } else {
        set({ user: null, profile: null, isAuthenticated: false })
      }
    })
    authSubscription = { data }

    // Return cleanup so the caller (App useEffect) can unsubscribe on unmount.
    return () => {
      if (authSubscription) {
        authSubscription.data.subscription.unsubscribe()
        authSubscription = null
      }
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await rateLimitedSignin(() =>
        supabase.auth.signInWithPassword({ email, password })
      )
      if (error) return { error: mapAuthError(error) }
      if (!data.session) return { error: 'Please verify your email address before signing in.' }
      return {}
    } catch (err) {
      return { error: mapAuthError(err) }
    }
  },

  signUp: async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await rateLimitedSignup(() =>
        supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        })
      )
      if (error) return { error: mapAuthError(error) }
      if (!data.session)
        return { error: 'Account created. Please verify your email before signing in.' }
      return {}
    } catch (err) {
      return { error: mapAuthError(err) }
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    // Clear React Query cache so no stale user data persists after logout.
    queryClient.clear()
    set({ user: null, profile: null, isAuthenticated: false })
  },

  fetchProfile: async () => {
    const { user } = get()
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      set({ profile: data as Profile })
    }
  },

  updateProfile: async (data: Partial<Profile>) => {
    const { user } = get()
    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id)

    if (error) return { error: mapAuthError(error) }

    await get().fetchProfile()
    return {}
  },
}))