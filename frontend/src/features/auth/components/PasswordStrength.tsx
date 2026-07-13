import { CheckCircle2, XCircle } from 'lucide-react'

interface PasswordStrengthProps {
  password: string
}

interface Requirement {
  label: string
  test: (password: string) => boolean
}

const requirements: Requirement[] = [
  { label: '8+ characters', test: (p) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'Number', test: (p) => /[0-9]/.test(p) },
  { label: 'Special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
]

function getStrength(password: string): { level: number; label: string; color: string } {
  const score = requirements.filter((r) => r.test(password)).length

  if (score <= 1) return { level: 1, label: 'Very Weak', color: 'bg-red-500' }
  if (score === 2) return { level: 2, label: 'Weak', color: 'bg-orange-500' }
  if (score === 3) return { level: 3, label: 'Medium', color: 'bg-yellow-500' }
  if (score === 4) return { level: 4, label: 'Strong', color: 'bg-green-500' }
  return { level: 5, label: 'Very Strong', color: 'bg-emerald-500' }
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = getStrength(password)

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="h-1 flex-1 rounded-full bg-outline-variant/20">
          <div
            className={`h-1 rounded-full transition-all duration-300 ${strength.color}`}
            style={{ width: `${(strength.level / 5) * 100}%` }}
          />
        </div>
        <span className="text-label-sm font-medium text-on-surface-variant">{strength.label}</span>
      </div>

      {/* Requirements checklist */}
      <div className="grid grid-cols-2 gap-1.5">
        {requirements.map((requirement) => {
          const satisfied = requirement.test(password)
          return (
            <div
              key={requirement.label}
              className={`flex items-center gap-1.5 text-label-xs transition-all duration-200 ${
                satisfied ? 'text-green-600' : 'text-on-surface-variant'
              }`}
            >
              {satisfied ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              <span>{requirement.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}