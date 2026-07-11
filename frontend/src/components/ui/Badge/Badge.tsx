import { cn } from '@/lib/utils'
import type { BadgeProps } from '@/types/design-system'

const variantStyles: Record<string, string> = {
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  error: 'bg-red-500/15 text-red-400 border-red-500/30',
  info: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  neutral: 'bg-surface-container-high text-on-surface-variant border-outline/30',
}

const sizeStyles: Record<string, string> = {
  sm: 'px-1.5 py-0.5 text-label-sm',
  md: 'px-2.5 py-1 text-label-md',
}

export function Badge({
  className,
  variant = 'neutral',
  size = 'sm',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}