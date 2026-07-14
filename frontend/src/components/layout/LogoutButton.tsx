import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES } from '@/routes/routePaths'
import { Button } from '@/components/ui/Button'

export function LogoutButton() {
  const [loading, setLoading] = useState(false)
  const signOut = useAuthStore((s) => s.signOut)
  const navigate = useNavigate()

  return (
    <Button
      type="button"
      variant="ghost"
      size="md"
      loading={loading}
      disabled={loading}
      icon={<LogOut className="h-4 w-4" />}
      className="w-full justify-start"
      onClick={async () => {
        setLoading(true)
        try {
          await signOut()
          toast.success('Logged out successfully.')
          navigate(ROUTES.AUTH.LOGIN)
        } catch {
          toast.error('Logout failed. Please try again.')
        } finally {
          setLoading(false)
        }
      }}
    >
      Logout
    </Button>
  )
}

