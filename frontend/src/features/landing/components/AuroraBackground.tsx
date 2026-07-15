import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

export function AuroraBackground() {
  const reduced = usePrefersReducedMotion()

  if (reduced) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Soft base gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,10,20,0.5),#05070A_80%)]" />

      {/* Aurora Blob 1 - Gold/Amber */}
      <div
        className="absolute -top-[10%] left-[5%] h-[600px] w-[600px] animate-aurora-1"
        style={{
          background:
            'radial-gradient(circle at 30% 50%, rgba(230,195,122,0.35) 0%, rgba(230,195,122,0.18) 30%, rgba(212,175,55,0.08) 50%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Aurora Blob 2 - Emerald */}
      <div
        className="absolute top-[15%] right-[10%] h-[500px] w-[500px] animate-aurora-2"
        style={{
          background:
            'radial-gradient(circle at 60% 40%, rgba(47,211,168,0.30) 0%, rgba(47,211,168,0.15) 25%, rgba(20,184,166,0.07) 45%, transparent 65%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Aurora Blob 3 - Teal */}
      <div
        className="absolute bottom-[20%] left-[15%] h-[450px] w-[450px] animate-aurora-3"
        style={{
          background:
            'radial-gradient(circle at 40% 50%, rgba(20,184,166,0.25) 0%, rgba(20,184,166,0.12) 20%, rgba(20,184,166,0.05) 40%, transparent 60%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Aurora Blob 4 - Blue */}
      <div
        className="absolute top-[40%] left-[50%] h-[400px] w-[400px] animate-aurora-4"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(59,130,246,0.20) 0%, rgba(59,130,246,0.10) 25%, rgba(59,130,246,0.04) 45%, transparent 65%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Aurora Blob 5 - Subtle Purple */}
      <div
        className="absolute top-[60%] right-[5%] h-[380px] w-[380px] animate-aurora-5"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(168,139,230,0.18) 0%, rgba(168,139,230,0.08) 25%, rgba(168,139,230,0.03) 45%, transparent 65%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Soft ambient radial overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(230,195,122,0.06),transparent_50%)]" />

      {/* Vignette at edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(5,7,10,0.50)_100%)]" />
    </div>
  )
}