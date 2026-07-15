import { useState } from 'react'
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
  const [imgError, setImgError] = useState(false)
  const initials = fallback || getInitials(alt || '')

  if (src && !imgError) {
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
          onError={() => setImgError(true)}
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