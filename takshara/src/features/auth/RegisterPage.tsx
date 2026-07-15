import { useState, useCallback, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { Logo } from '@/components/ui/Logo'
import { AuthInput } from '@/features/auth/components/AuthInput'
import { PasswordStrength } from '@/features/auth/components/PasswordStrength'
import { PasswordChecklist } from '@/features/auth/components/PasswordChecklist'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

const registerSchema = z.object({
  fullName: z
   .string()
   .min(1, 'Please enter your full name.')
   .transform((v) => v.trim())
   .pipe(
      z
       .string()
       .min(3, 'Full name must be at least 3 characters.')
       .regex(/^[A-Za-z\s'-]+$/, 'Only letters, spaces, apostrophes, and hyphens are allowed.')
    ),
  email: z.string().min(1, 'Please enter your email address.').email('Please enter a valid email address.'),
  password: z
   .string()
   .min(1, 'Please enter your password.')
   .min(8, 'Password must be at least 8 characters.')
   .max(64, 'Password must be at most 64 characters.')
   .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
   .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
   .regex(/[0-9]/, 'Password must contain at least one number.')
   .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character.'),
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [capsLockOn, setCapsLockOn] = useState(false)
  const navigate = useNavigate()
  const signUp = useAuthStore((s) => s.signUp)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  })

  const password = watch('password', '')
  const fullName = watch('fullName', '')
  const email = watch('email', '')

  const isFormValid = isValid && fullName.trim().length >= 3 && email.length > 0 && password.length >= 8
  const isPending = isSubmitting

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && isFormValid && !isPending) {
        handleSubmit(async (data) => {
          try {
            const trimmedName = data.fullName.trim()
            const { error } = await signUp(data.email, data.password, trimmedName)
            if (error) {
              toast.error(error)
            } else {
              toast.success('Account created successfully.')
              setTimeout(() => navigate('/dashboard'), 800)
            }
          } catch {
            toast.error('Something went wrong. Please try again.')
          }
        })()
      }
    },
    [handleSubmit, isFormValid, isPending, navigate, signUp]
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
          <div className="mb-8 flex flex-col items-center gap-4">
            <Logo size="xl" />
          </div>

          <form
            className="space-y-5"
            noValidate
            onSubmit={handleSubmit(async (data) => {
              try {
                const trimmedName = data.fullName.trim()
                const { error } = await signUp(data.email, data.password, trimmedName)
                if (error) {
                  toast.error(error)
                } else {
                  toast.success('Account created successfully.')
                  setTimeout(() => navigate('/dashboard'), 800)
                }
              } catch {
                toast.error('Something went wrong. Please try again.')
              }
            })}
          >
            <AuthInput label="Full Name" {...register('fullName')} error={errors.fullName?.message} autoComplete="name" />
            <AuthInput label="Email Address" {...register('email')} error={errors.email?.message} autoComplete="email" />


            <div>
              <label htmlFor="password" className="text-label-sm text-on-surface-variant">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword? 'text' : 'password'}
                  className={cn(
                    'mt-1 w-full rounded-radius-lg border bg-surface-container-low px-4 py-2.5 text-body-md text-on-surface outline-none transition-all duration-200',
                    errors.password
                     ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                      : 'border-outline-variant/20 focus:border-primary-container focus:ring-2 focus:ring-primary-container/20'
                  )}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password? 'password-error' : 'password-hint'}
                  onKeyDown={handleKeyDown}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) =>!v)}
                  className="absolute right-3 top-[38px] text-on-surface-variant transition-colors hover:text-on-surface"
                  aria-label={showPassword? 'Hide password' : 'Show password'}
                >
                  {showPassword? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="mt-1 text-label-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
              {capsLockOn && (
                <p className="mt-1 text-label-sm text-yellow-600">Caps Lock is on</p>
              )}
              <PasswordStrength password={password} />
              <PasswordChecklist password={password} />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!isFormValid || isPending}
              icon={<UserPlus className="h-4 w-4" />}
            >
              {isPending? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-body-md text-on-surface-variant">
            Already have an account?{' '}
<Link to="/login" className="text-primary-container font-medium transition-colors hover:text-primary">
              Sign in
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  )
}