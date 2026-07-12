import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { rateLimitedSignin, rateLimitedSignup } from '@/lib/rateLimiter'

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
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  fetchProfile: () => Promise<void>
  updateProfile: (data: Partial<Profile>) => Promise<{ error?: string }>
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
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

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        set({ user: session.user, isAuthenticated: true })
        await get().fetchProfile()
      } else {
        set({ user: null, profile: null, isAuthenticated: false })
      }
    })
  },

  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await rateLimitedSignin(() => supabase.auth.signInWithPassword({ email, password }))
      if (error) {
        const code = (error as any).status
        const msg = error.message || 'Sign in failed'
        if (code === 400) return { error: `Auth rejected: ${msg}. Check Supabase Auth settings and site URL/email confirmations.` }
        if (code === 429) return { error: 'Too many attempts. Please wait a moment and try again.' }
        return { error: msg }
      }
      if (!data.session) {
        return { error: 'Please verify your email before signing in.' }
      }
      return {}
    } catch (err) {
      return { error: `Auth error: ${(err as any)?.message || err}` }
    }
  },

  signUp: async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await rateLimitedSignup(() => supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      }))
      if (error) {
        const code = (error as any).status
        const msg = error.message || 'Sign up failed'
        if (code === 400) return { error: `Signup rejected: ${msg}. Verify password length, allowed emails, and Auth settings in Supabase.` }
        if (code === 429) return { error: 'Too many attempts. Please wait a moment and try again.' }
        return { error: msg }
      }
      if (!data.session) {
        return { error: 'Account created. Please verify your email before signing in.' }
      }
      return {}
    } catch (err) {
      return { error: `Auth error: ${(err as any)?.message || err}` }
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
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

    if (error) return { error: error.message }

    await get().fetchProfile()
    return {}
  },
}))