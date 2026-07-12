import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-')

    return (
      <div>
        <label htmlFor={inputId} className="text-label-sm text-on-surface-variant">
          {label}
        </label>
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'mt-1 w-full rounded-radius-lg border bg-surface-container-low px-4 py-2.5 text-body-md text-on-surface outline-none transition-all duration-200',
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-outline-variant/20 focus:border-primary-container focus:ring-2 focus:ring-primary-container/20',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-label-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    )
  }
)

AuthInput.displayName = 'AuthInput'