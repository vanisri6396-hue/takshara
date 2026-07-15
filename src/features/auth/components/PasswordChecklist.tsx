import { CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'


interface PasswordChecklistProps {
  password: string
}

const requirements = [
  { label: 'Minimum 8 characters', test: (p: string) => p.length >= 8 },

  { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

export function PasswordChecklist({ password }: PasswordChecklistProps) {
  const hasTyped = password.length > 0

  return (
    <div className="mt-2 space-y-1">
      {requirements.map((requirement, idx) => {
        const satisfied = hasTyped && requirement.test(password)
        return (
          <div
            key={requirement.label}
            className={cn(
              'flex items-center gap-2 text-label-xs',
              'transition-all duration-300 ease-out',
              satisfied ? 'text-emerald-400' : 'text-on-surface-variant/90',
              satisfied ? 'translate-x-0' : 'translate-x-0',
            )}
            style={{
              transitionDelay: satisfied ? `${Math.min(idx * 40, 160)}ms` : '0ms',
            }}
          >
            <span
              className={cn(
                'grid h-5 w-5 place-items-center transition-transform duration-300',
                satisfied ? 'scale-100' : 'scale-95',
              )}
              aria-hidden="true"
            >
              {satisfied ? (
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              ) : (
                <XCircle className="h-3 w-3 text-on-surface-variant/70" />
              )}
            </span>
            <span className={cn('transition-colors duration-300', satisfied && 'text-emerald-400')}>
              {requirement.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

