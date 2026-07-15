import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ButtonProps } from '@/types/design-system'

const variantStyles: Record<string, string> = {
  primary:
    'gradient-gold text-on-primary font-bold border-none hover:opacity-90 active:opacity-80 glow-gold',
  secondary:
    'bg-transparent border border-primary-container text-primary-container hover:bg-primary-container/10 active:bg-primary-container/20',
  ghost:
    'bg-transparent border-none text-on-surface hover:bg-surface-container-high active:bg-surface-container-highest',
}

const sizeStyles: Record<string, string> = {
  sm: 'h-8 px-3 text-label-sm',
  md: 'h-10 px-4 text-label-md',
  lg: 'h-12 px-6 text-label-md',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      icon,
      children,
      as: Component = 'button',
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading

    return (
      <Component
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 rounded-radius transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
          'overflow-hidden hover:-translate-y-0.5 hover:glow-gold',
          variantStyles[variant],
          sizeStyles[size],
          isDisabled && 'pointer-events-none opacity-50',
          className,
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : icon ? (
          <span className="h-4 w-4" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        {children && <span>{children}</span>}
      </Component>
    )
  },
)

Button.displayName = 'Button'