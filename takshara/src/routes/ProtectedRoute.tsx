import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from './routePaths'
import { useAuthStore } from '@/stores/authStore'

import type { ReactNode } from 'react'

export function ProtectedRoute({ children }: { children?: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-container border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH.LOGIN} replace />
  }

  // When used as a route wrapper, children will be provided; otherwise we fall back to Outlet.
  return <>{children ?? <Outlet />}</>
}
