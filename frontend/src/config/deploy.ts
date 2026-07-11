// Deployment Configuration
// Update these values for your production environment

export const DEPLOY_CONFIG = {
  // Supabase Configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },

  // App Configuration
  app: {
    name: 'Takshara',
    version: '1.0.0',
    environment: import.meta.env.MODE || 'development',
  },

  // Feature Flags
  features: {
    enableAI: true,
    enableNotifications: false,
    enableAnalytics: false,
    enableOffline: false,
  },

  // API Configuration
  api: {
    timeout: 10000,
    retryAttempts: 3,
  },
} as const

// Type-safe environment check
export function assertEnv() {
  const missing = []
  if (!import.meta.env.VITE_SUPABASE_URL) missing.push('VITE_SUPABASE_URL')
  if (!import.meta.env.VITE_SUPABASE_ANON_KEY) missing.push('VITE_SUPABASE_ANON_KEY')

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        'Create a .env file with these variables.'
    )
  }
}