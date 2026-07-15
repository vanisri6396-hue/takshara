import { useMemo } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  color: 'gold' | 'emerald' | 'teal' | 'blue' | 'purple'
}

const PARTICLE_COLORS = {
  gold: 'rgba(230,195,122,',
  emerald: 'rgba(47,211,168,',
  teal: 'rgba(20,184,166,',
  blue: 'rgba(59,130,246,',
  purple: 'rgba(168,139,230,',
} as const

export function FloatingParticles() {
  const reduced = usePrefersReducedMotion()

  const particles = useMemo<Particle[]>(() => {
    if (reduced) return []
    const items: Particle[] = []
    const colors: Particle['color'][] = ['gold', 'emerald', 'teal', 'blue', 'purple']

    for (let i = 0; i < 18; i++) {
      items.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1.5,
        duration: Math.random() * 6 + 6,
        delay: Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    return items
  }, [reduced])

  if (reduced || particles.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-float-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: `${PARTICLE_COLORS[p.color]}0.60)`,
            boxShadow: `0 0 ${p.size * 3}px ${PARTICLE_COLORS[p.color]}0.35), 0 0 ${p.size * 6}px ${PARTICLE_COLORS[p.color]}0.15)`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* A few slightly larger glow particles */}
      <div
        className="absolute left-[25%] top-[20%] h-2 w-2 animate-float-particle"
        style={{
          borderRadius: '50%',
          backgroundColor: 'rgba(230,195,122,0.30)',
          boxShadow: '0 0 20px rgba(230,195,122,0.25), 0 0 40px rgba(230,195,122,0.10)',
          animationDuration: '10s',
          animationDelay: '1s',
        }}
      />
      <div
        className="absolute left-[70%] top-[60%] h-2.5 w-2.5 animate-float-particle"
        style={{
          borderRadius: '50%',
          backgroundColor: 'rgba(47,211,168,0.25)',
          boxShadow: '0 0 20px rgba(47,211,168,0.20), 0 0 40px rgba(47,211,168,0.08)',
          animationDuration: '9s',
          animationDelay: '3s',
        }}
      />
    </div>
  )
}