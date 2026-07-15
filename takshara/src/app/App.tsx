import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/routes'
import { AppProviders } from './AppProviders'
import { useAuthStore } from '@/stores/authStore'

export function App() {
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    const cleanup = initialize()
    return cleanup
  }, [initialize])

  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  )
}
