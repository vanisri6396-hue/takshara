import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { CardProps } from '@/types/design-system'

const variantStyles: Record<string, string> = {
  default: 'surface-level-1 rounded-radius',
  featured:
    'glass rounded-radius border-t-2 border-t-primary-container',
  glass: 'glass rounded-radius',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', as: Component = 'div', children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          'p-4 transition-all duration-200',
          variantStyles[variant],
          className,
        )}
        {...props}
      >
        {children}
      </Component>
    )
  },
)

Card.displayName = 'Card'