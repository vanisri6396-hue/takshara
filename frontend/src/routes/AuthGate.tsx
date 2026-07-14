import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import type { ReactNode } from 'react'
import { ROUTES } from './routePaths'

export function AuthGate({ children }: { mode: 'login' | 'register'; children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)

  // Prevent UI flicker during session init
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-container border-t-transparent" />
      </div>
    )
  }

  // If already authenticated, keep them out of login/register
  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return <>{children}</>
}

