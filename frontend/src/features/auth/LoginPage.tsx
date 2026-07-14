import { useState, useCallback, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { AuthInput } from '@/features/auth/components/AuthInput'
import { useAuthStore } from '@/stores/authStore'
import { APP_NAME, APP_TAGLINE } from '@/lib/constants'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
  email: z.string().min(1, 'Please enter your email address.').email('Please enter a valid email address.'),
  password: z.string().min(1, 'Please enter your password.'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [capsLockOn, setCapsLockOn] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const navigate = useNavigate()
  const signIn = useAuthStore((s) => s.signIn)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  })

  const email = watch('email', '')
  const password = watch('password', '')
  const isFormValid = isValid && email.length > 0 && password.length > 0
  const isPending = isSubmitting

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && isFormValid && !isPending) {
        handleSubmit(async (data) => {
          try {
            const { error } = await signIn(data.email, data.password)
            if (error) {
              toast.error(error)
            } else {
              toast.success('Signed in successfully.')
              navigate('/dashboard')
            }
          } catch {
            toast.error('Something went wrong. Please try again.')
          }
        })()
      }
    },
    [handleSubmit, isFormValid, isPending, navigate, signIn]
  )


  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.getModifierState && setCapsLockOn(e.getModifierState('CapsLock'))
    window.addEventListener('keydown', handler)
    window.addEventListener('keyup', handler)
    return () => {
      window.removeEventListener('keydown', handler)
      window.removeEventListener('keyup', handler)
    }
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <GlassCard className="p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-radius-xl bg-primary-container text-headline-lg font-bold text-on-primary-container">
              T
            </div>
            <h1 className="mt-4 font-headline text-headline-lg text-on-surface">{APP_NAME}</h1>
            <p className="mt-1 text-body-md text-on-surface-variant">{APP_TAGLINE}</p>
          </div>

          <form
            className="space-y-5"
            noValidate
            onSubmit={handleSubmit(async (data) => {
              try {
                const { error } = await signIn(data.email, data.password)
                if (error) {
                  toast.error(error)
                } else {
                  toast.success('Signed in successfully.')
                  navigate('/dashboard')
                }
              } catch {
                toast.error('Something went wrong. Please try again.')
              }
            })}
          >
            <AuthInput label="Email Address" {...register('email')} error={errors.email?.message} autoComplete="email" />

            <div>
              <label htmlFor="password" className="text-label-sm text-on-surface-variant">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={cn(
                    'mt-1 w-full rounded-radius-lg border bg-surface-container-low px-4 py-2.5 text-body-md text-on-surface outline-none transition-all duration-200',
                    errors.password
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                      : 'border-outline-variant/20 focus:border-primary-container focus:ring-2 focus:ring-primary-container/20'
                  )}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'login-password-error' : undefined}
                  onKeyDown={handleKeyDown}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-[38px] text-on-surface-variant transition-colors hover:text-on-surface"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p id="login-password-error" className="mt-1 text-label-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
              {capsLockOn && <p className="mt-1 text-label-sm text-yellow-600">Caps Lock is on</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-label-sm text-on-surface-variant">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-outline-variant bg-surface-container-low text-primary-container focus:ring-primary-container"
                />
                Remember me
              </label>
              <button
                type="button"
                className="text-label-sm text-primary-container transition-colors hover:text-primary"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!isFormValid || isPending}
              icon={<LogIn className="h-4 w-4" />}
            >
              {isPending ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-6 text-center text-body-md text-on-surface-variant">
            Don't have an account?{' '}
            <Link to="/auth/register" className="text-primary-container font-medium transition-colors hover:text-primary">
              Create one
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  )
}