import { cn } from '@/lib/utils'
import type { SubjectChipProps } from '@/types/design-system'

const sizeStyles = {
  sm: 'px-2 py-0.5 text-label-sm',
  md: 'px-2.5 py-1 text-label-md',
}

export function SubjectChip({ label, color, size = 'sm', className }: SubjectChipProps & { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        sizeStyles[size],
        className,
      )}
      style={
        color
          ? {
              backgroundColor: `${color}20`,
              borderColor: `${color}40`,
              color: color,
            }
          : undefined
      }
    >
      {label}
    </span>
  )
}