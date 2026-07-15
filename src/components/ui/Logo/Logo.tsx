import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  textClassName?: string
}

const sizeMap = {
  sm: 28,
  md: 36,
  lg: 44,
  xl: 56,
}

export function Logo({ className, size = 'md', showText = true, textClassName }: LogoProps) {
  const px = sizeMap[size]

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <img
        src="/logo.png"
        alt="Takshara"
        width={px}
        height={px}
        className="shrink-0 object-contain"
        style={{ width: px, height: px }}
      />
      {showText && (
        <div>
          <div className={cn('font-bold text-primary-fixed', textClassName || 'text-label-md')}>
            Takshara
          </div>
          {size !== 'sm' && (
            <div className="text-xs text-on-surface-variant/90">AI-Powered Student OS</div>
          )}
        </div>
      )}
    </div>
  )
}