import { cn } from '@/lib/utils'

interface PasswordStrengthProps {
  password: string
}

interface Requirement {
  label: string

  test: (password: string) => boolean
}


const requirements: Requirement[] = [
  { label: 'Minimum 8 characters', test: (p) => p.length >= 8 },

  { label: 'Uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'Number', test: (p) => /[0-9]/.test(p) },
  { label: 'Special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
]

function getStrength(password: string): {
  level: number
  label: string
  barColor: string
  textColor: string
} {
  const score = requirements.filter((r) => r.test(password)).length

  // Per spec: Very Weak → Red, Weak → Orange, Medium → Yellow, Strong → Emerald, Very Strong → Gold
  if (score <= 1) return { level: 1, label: 'Very Weak', barColor: 'bg-red-500', textColor: 'text-red-500' }
  if (score === 2) return { level: 2, label: 'Weak', barColor: 'bg-orange-500', textColor: 'text-orange-500' }
  if (score === 3) return { level: 3, label: 'Medium', barColor: 'bg-yellow-500', textColor: 'text-yellow-500' }
  if (score === 4) return { level: 4, label: 'Strong', barColor: 'bg-emerald-500', textColor: 'text-emerald-500' }
  return { level: 5, label: 'Very Strong', barColor: 'bg-[#D4AF37]', textColor: 'text-[#D4AF37]' }
}


export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = getStrength(password)

  const isEmpty = password.length === 0

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="h-1 flex-1 rounded-full bg-outline-variant/20">
          <div
            className={cn(
              'h-1 rounded-full transition-all duration-300',
              isEmpty ? 'opacity-40' : 'opacity-100',
              strength.barColor,
            )}

            style={{ width: isEmpty ? '0%' : `${(strength.level / 5) * 100}%` }}
          />
        </div>
        <span
          className={cn(
            'text-label-sm font-medium transition-colors duration-200',
            strength.textColor,
            isEmpty ? 'text-on-surface-variant' : 'text-on-surface-variant'
          )}
        >
          {isEmpty ? '—' : strength.label}
        </span>
      </div>
    </div>
  )
}

