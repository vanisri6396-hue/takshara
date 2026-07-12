import { CheckCircle2, XCircle } from 'lucide-react'

interface PasswordChecklistProps {
  password: string
}

const requirements = [
  { label: '8+ characters', test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

export function PasswordChecklist({ password }: PasswordChecklistProps) {
  return (
    <div className="mt-2 space-y-1">
      {requirements.map((requirement) => {
        const satisfied = password.length > 0 && requirement.test(password)
        return (
          <div
            key={requirement.label}
            className={`flex items-center gap-2 text-label-xs transition-all duration-200 ${
              satisfied ? 'text-green-600' : 'text-on-surface-variant'
            }`}
          >
            {satisfied ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
            <span>{requirement.label}</span>
          </div>
        )
      })}
    </div>
  )
}