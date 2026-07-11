import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from './routePaths'

/**
 * Protected route wrapper.
 * Currently allows all access (auth not yet implemented).
 * Will redirect to login when auth is configured.
 */
export function ProtectedRoute() {
  // TODO: Replace with actual auth check when Supabase auth is configured
  const isAuthenticated = true

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH.LOGIN} replace />
  }

  return <Outlet />
}