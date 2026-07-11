import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { GlassCard } from '@/components/ui/GlassCard'
import { APP_NAME, APP_TAGLINE } from '@/lib/constants'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <GlassCard className="p-8">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-radius-xl bg-primary-container text-headline-lg font-bold text-on-primary-container">
              T
            </div>
            <h1 className="mt-4 font-headline text-headline-lg text-on-surface">
              Create Account
            </h1>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Join {APP_NAME} and transform your studies
            </p>
          </div>

          {/* Form */}
          <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              label="University Email"
              type="email"
              placeholder="student@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-on-surface-variant transition-colors hover:text-on-surface"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <label className="flex items-start gap-2 text-label-sm text-on-surface-variant">
              <input
                type="checkbox"
                className="mt-0.5 rounded border-outline-variant bg-surface-container-low text-primary-container focus:ring-primary-container"
              />
              <span>
                I agree to the{' '}
                <button type="button" className="text-primary-container underline transition-colors hover:text-primary">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="text-primary-container underline transition-colors hover:text-primary">
                  Privacy Policy
                </button>
              </span>
            </label>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              icon={<UserPlus className="h-4 w-4" />}
            >
              Create Account
            </Button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-body-md text-on-surface-variant">
            Already have an account?{' '}
            <Link
              to="/auth/login"
              className="text-primary-container font-medium transition-colors hover:text-primary"
            >
              Sign in
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  )
}