import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { CardProps } from '@/types/design-system'

export const GlassCard = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'glass rounded-radius-lg p-4 transition-all duration-200 hover:glass-strong',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)

GlassCard.displayName = 'GlassCard'