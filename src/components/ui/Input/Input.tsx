import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { InputProps } from '@/types/design-system'

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-label-md text-on-surface-variant"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
              aria-hidden="true"
            >
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-radius border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-body-md text-on-surface placeholder:text-on-surface-variant/50 transition-all duration-200',
              'focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:shadow-[0_0_12px_rgba(212,175,55,0.15)]',
              error &&
                'border-error focus:border-error focus:ring-error/30 focus:shadow-[0_0_12px_rgba(255,180,171,0.15)]',
              icon && 'pl-10',
              className,
            )}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-label-sm text-error" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-label-sm text-on-surface-variant">
            {helperText}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'