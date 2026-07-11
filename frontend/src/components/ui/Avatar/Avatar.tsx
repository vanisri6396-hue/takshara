import { cn, getInitials } from '@/lib/utils'
import type { AvatarProps } from '@/types/design-system'

const sizeStyles: Record<string, string> = {
  sm: 'h-8 w-8 text-label-sm',
  md: 'h-10 w-10 text-label-md',
  lg: 'h-12 w-12 text-label-md',
  xl: 'h-16 w-16 text-headline-md',
}

export function Avatar({
  className,
  src,
  alt = '',
  fallback,
  size = 'md',
  ...props
}: AvatarProps) {
  const initials = fallback || getInitials(alt || '')

  if (src) {
    return (
      <div
        className={cn(
          'relative inline-flex overflow-hidden rounded-full',
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={(e) => {
            // If image fails to load, show fallback
            const target = e.currentTarget
            target.style.display = 'none'
            const parent = target.parentElement
            if (parent) {
              const fallbackEl = document.createElement('span')
              fallbackEl.className =
                'flex h-full w-full items-center justify-center bg-primary-container text-on-primary-container font-bold'
              fallbackEl.textContent = initials
              parent.appendChild(fallbackEl)
            }
          }}
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-primary-container text-on-primary-container font-bold',
        sizeStyles[size],
        className,
      )}
      aria-label={alt || initials}
      {...props}
    >
      {initials}
    </div>
  )
}