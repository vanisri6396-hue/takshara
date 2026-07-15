import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, MotionConfig, motion, useScroll, useTransform } from 'framer-motion'
import {
  Sparkles,
  ShieldCheck,
  Wand2,
  Zap,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Star,
  Layers,
  Brain,
  Clock,
  Target,
  BarChart3,
  MessageSquare,
  BookOpen,
  GraduationCap,
  Infinity,
} from 'lucide-react'

import { Button } from '@/components/ui/Button/Button'
import { GlassCard } from '@/components/ui/GlassCard/GlassCard'
import { Logo } from '@/components/ui/Logo'
import { cn } from '@/lib/utils'
import { AuroraBackground } from './components/AuroraBackground'
import { FloatingParticles } from './components/FloatingParticles'
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion'

/* ─── Reusable Section Reveal ─── */
function SectionReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const reduced = usePrefersReducedMotion()

  return (
    <motion.section
      className={className}
      initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      whileInView={reduced ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.section>
  )
}

/* ─── Animated Counter ─── */
function AnimatedNumber({ value, suffix = '', durationMs = 900 }: { value: number; suffix?: string; durationMs?: number }) {
  const reduced = usePrefersReducedMotion()
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (reduced) {
      setDisplay(value)
      return
    }

    const start = performance.now()
    let raf = 0
    const from = 0
    const to = value

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - t, 3)
      const next = Math.round(from + (to - from) * eased)
      setDisplay(next)
      if (t < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [durationMs, reduced, value])

  return (
    <motion.span
      className="font-headline text-3xl sm:text-4xl tracking-tight"
      initial={reduced ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {display}
      {suffix}
    </motion.span>
  )
}

/* ─── Glow Icon ─── */
function GlowIcon({ children, tone = 'gold' }: { children: React.ReactNode; tone?: 'gold' | 'emerald' | 'teal' | 'blue' }) {
  const borderMap = {
    gold: 'border-primary-fixed/30 bg-[rgba(230,195,122,0.08)]',
    emerald: 'border-emerald-300/20 bg-[rgba(47,211,168,0.09)]',
    teal: 'border-teal-300/20 bg-[rgba(20,184,166,0.09)]',
    blue: 'border-blue-300/20 bg-[rgba(59,130,246,0.09)]',
  }

  return (
    <div
      className={cn(
        'inline-flex h-11 w-11 items-center justify-center rounded-xl border',
        borderMap[tone],
        'shadow-[0_0_0_1px_rgba(230,195,122,0.10),0_20px_60px_rgba(0,0,0,0.35)]',
      )}
    >
      {children}
    </div>
  )
}

/* ─── Shimmer Divider ─── */
function ShimmerDivider() {
  return (
    <div className="relative my-10 h-px w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-fixed/40 to-transparent" />
      <motion.div
        className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(230,195,122,0.55),transparent)]"
        animate={{ x: ['-60%', '60%'] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

/* ─── Parallax Mouse Layers ─── */
function ParallaxLayers() {
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (reduced) return
    const el = ref.current
    if (!el) return

    let raf = 0
    let targetX = 0
    let targetY = 0
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width
      const py = (e.clientY - rect.top) / rect.height
      targetX = (px - 0.5) * 18
      targetY = (py - 0.5) * 18
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0
          el.style.setProperty('--px', `${targetX}`)
          el.style.setProperty('--py', `${targetY}`)
        })
      }
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [reduced])

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute -top-24 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(230,195,122,0.22),rgba(230,195,122,0)_60%)]"
        style={{ transform: 'translate3d(calc(var(--px,0px)*0.6), calc(var(--py,0px)*0.6), 0)' }}
      />
      <motion.div
        className="absolute top-40 left-10 h-[320px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(47,211,168,0.18),rgba(47,211,168,0)_62%)]"
        style={{ transform: 'translate3d(calc(var(--px,0px)*0.3), calc(var(--py,0px)*0.3), 0)' }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(230,195,122,0.08),rgba(230,195,122,0)_35%,rgba(47,211,168,0.06))]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-surface to-transparent" />

      {!reduced && (
        <motion.div
          className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full border border-primary-container/40"
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        />
      )}
    </div>
  )
}

/* ─── Ripple Button Wrapper (uses React Router Link) ─── */
function RippleButton({ children, href, to, variant = 'primary', size = 'lg', className, ...props }: {
  children: React.ReactNode
  href?: string
  to?: string
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const id = Date.now()
      setRipples((prev) => [...prev, { id, x, y }])
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id))
      }, 600)
    },
    [],
  )

  const linkTo = href || to || '#'
  const isExternal = linkTo.startsWith('http') || linkTo.startsWith('#')
  const linkClass = cn('inline-block', className)

  if (isExternal) {
    return (
      <a href={linkTo} className={linkClass}>
        <Button
          ref={buttonRef}
          variant={variant}
          size={size}
          className="group relative overflow-hidden"
          onClick={handleClick}
          {...props}
        >
          {ripples.map((r) => (
            <span
              key={r.id}
              className="absolute animate-ripple rounded-full bg-white/20"
              style={{
                left: r.x,
                top: r.y,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
          {children}
        </Button>
      </a>
    )
  }

  return (
    <Link to={linkTo} className={linkClass}>
      <Button
        ref={buttonRef}
        variant={variant}
        size={size}
        className="group relative overflow-hidden"
        onClick={handleClick}
        {...props}
      >
        {ripples.map((r) => (
          <span
            key={r.id}
            className="absolute animate-ripple rounded-full bg-white/20"
            style={{
              left: r.x,
              top: r.y,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
        {children}
      </Button>
    </Link>
  )
}

/* ─── Navbar ─── */
function Navbar() {
  const { scrollY } = useScroll()
  const navBg = useTransform(
    scrollY,
    [0, 80],
    ['rgba(7,10,13,0)', 'rgba(7,10,13,0.72)'],
  )
  const navBlur = useTransform(scrollY, [0, 80], [0, 20])
  const navBorder = useTransform(
    scrollY,
    [0, 80],
    ['rgba(230,195,122,0)', 'rgba(230,195,122,0.10)'],
  )

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: navBg,
        backdropFilter: navBlur as unknown as string,
        WebkitBackdropFilter: navBlur as unknown as string,
        borderBottom: navBorder as unknown as string,
      }}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mx-auto flex max-w-container items-center justify-between px-4 py-4 lg:px-6">
        <a href="#" className="group">
          <Logo size="md" />
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {[
            { label: 'Features', href: '#features' },
            { label: 'Assistant', href: '#assistant' },
            { label: 'Dashboard', href: '#dashboard' },
            { label: 'How it works', href: '#how' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'FAQ', href: '#faq' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative text-sm text-on-surface-variant/85 hover:text-primary-fixed transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-primary-fixed/60 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="secondary" size="md" className="hidden sm:inline-flex border-primary-fixed/20 hover:bg-primary-fixed/10">
              Sign in
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="md" className="group relative overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                Get started
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  )
}

/* ─── FAQ Item ─── */
function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const reduced = usePrefersReducedMotion()
  const [open, setOpen] = useState(index === 0)

  return (
    <motion.div
      initial={reduced ? undefined : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: index * 0.04 }}
      className="rounded-[1.35rem]"
    >
      <GlassCard className="p-5 rounded-[1.35rem] gradient-border">
        <button
          type="button"
          className="flex w-full items-start justify-between gap-4 text-left"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="text-sm font-bold">{q}</span>
          <motion.span
            aria-hidden="true"
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/5 bg-[rgba(15,22,32,0.22)]"
          >
            <span className="relative h-3 w-3">
              <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-primary-fixed" />
              <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-primary-fixed" />
            </span>
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="content"
              initial={reduced ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
              animate={reduced ? { height: 'auto', opacity: 1 } : { height: 'auto', opacity: 1 }}
              exit={reduced ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="mt-3 overflow-hidden"
            >
              <div className="text-sm text-on-surface-variant/90 leading-relaxed">{a}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  )
}

/* ─── Main Landing Page ─── */
export default function LandingPage() {
  const reduced = usePrefersReducedMotion()

  const featureCards = useMemo(
    () => [
      {
        icon: <Wand2 className="h-5 w-5 text-primary-fixed" aria-hidden="true" />,
        title: 'AI Study Orchestration',
        desc: 'Your curriculum, deadlines, and focus areas—translated into a daily plan you can actually follow.',
        tone: 'gold' as const,
      },
      {
        icon: <Zap className="h-5 w-5 text-emerald-300" aria-hidden="true" />,
        title: 'Instant Guidance',
        desc: 'Ask Takshara anything—assignments, doubts, exam strategies—with crisp, actionable answers.',
        tone: 'emerald' as const,
      },
      {
        icon: <ShieldCheck className="h-5 w-5 text-teal-300" aria-hidden="true" />,
        title: 'Privacy-First Workspace',
        desc: 'Keep your academic data organized with secure, user-controlled flows.',
        tone: 'teal' as const,
      },
    ],
    [],
  )

  const testimonials = useMemo(
    () => [
      {
        quote:
          'Takshara feels like a senior mentor. It breaks down my syllabus into a plan I can execute—without overwhelm.',
        name: 'Aarav S.',
        role: 'Final-year Engineering',
      },
      {
        quote:
          'The dashboard preview is the best part—my timetable, tasks, and progress in one place. I stopped juggling tabs.',
        name: 'Meera K.',
        role: 'Medical Student',
      },
      {
        quote:
          'The AI assistant conversations are fast and focused. It doesn\'t just answer—it tells me what to do next.',
        name: 'Dev P.',
        role: 'Competitive Aspirant',
      },
    ],
    [],
  )

  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>
      <div className="relative min-h-screen bg-surface overflow-hidden">
        {/* Aurora Background */}
        <AuroraBackground />
        <FloatingParticles />

        {/* Parallax Layers (on top of aurora) */}
        <ParallaxLayers />

        {/* Sticky Navbar */}
        <Navbar />

        <main className="relative z-10 pt-20">
          {/* ─── HERO ─── */}
          <section className="mx-auto max-w-container px-4 pb-6 pt-12 sm:pt-20 lg:px-6 lg:pb-10">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <SectionReveal>
                  <motion.div
                    className="inline-flex items-center gap-2 rounded-full border border-primary-fixed/25 bg-[rgba(230,195,122,0.08)] px-4 py-2 text-xs text-on-surface-variant"
                    whileHover={reduced ? undefined : { scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-fixed animate-pulse" aria-hidden="true" />
                    Built for focus. Designed for momentum.
                  </motion.div>
                </SectionReveal>

                <SectionReveal className="mt-6" delay={0.08}>
                  <h1 className="text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
                    Takshara is the <span className="text-primary-fixed">AI-powered</span>
                    <br /> Student Operating System.
                  </h1>
                </SectionReveal>

                <SectionReveal className="mt-5 text-base sm:text-lg text-on-surface-variant/90 max-w-xl" delay={0.14}>
                  Your syllabus, schedule, and questions—unified into one premium workflow.
                  <span className="text-primary-fixed"> Plan smarter.</span> Learn faster. Stay ahead.
                </SectionReveal>

                <SectionReveal className="mt-7 flex flex-wrap items-center gap-3" delay={0.18}>
                  <RippleButton to="/register" variant="primary" size="lg">
                    Start free
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 -translate-y-0.5" aria-hidden="true" />
                  </RippleButton>
                  <a href="#features">
                    <Button variant="secondary" size="lg" className="border-primary-fixed/20 group">
                      Explore features
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                    </Button>
                  </a>
                </SectionReveal>

                <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
                  <SectionReveal delay={0.22}>
                    <motion.div
                      className="rounded-2xl border border-white/5 bg-[rgba(15,22,32,0.35)] px-3 py-4 gradient-border"
                      whileHover={reduced ? undefined : { y: -4, borderColor: 'rgba(230,195,122,0.3)' }}
                      transition={{ duration: 0.2 }}
                    >
                      <AnimatedNumber value={48} suffix="%" durationMs={950} />
                      <div className="mt-1 text-[11px] text-on-surface-variant/85">fewer missed deadlines</div>
                    </motion.div>
                  </SectionReveal>
                  <SectionReveal delay={0.28}>
                    <motion.div
                      className="rounded-2xl border border-white/5 bg-[rgba(15,22,32,0.35)] px-3 py-4 gradient-border-emerald"
                      whileHover={reduced ? undefined : { y: -4, borderColor: 'rgba(47,211,168,0.3)' }}
                      transition={{ duration: 0.2 }}
                    >
                      <AnimatedNumber value={3} suffix="x" durationMs={980} />
                      <div className="mt-1 text-[11px] text-on-surface-variant/85">faster doubt resolution</div>
                    </motion.div>
                  </SectionReveal>
                  <SectionReveal delay={0.34}>
                    <motion.div
                      className="rounded-2xl border border-white/5 bg-[rgba(15,22,32,0.35)] px-3 py-4 gradient-border"
                      whileHover={reduced ? undefined : { y: -4, borderColor: 'rgba(230,195,122,0.3)' }}
                      transition={{ duration: 0.2 }}
                    >
                      <AnimatedNumber value={92} suffix="%" durationMs={1000} />
                      <div className="mt-1 text-[11px] text-on-surface-variant/85">focus satisfaction</div>
                    </motion.div>
                  </SectionReveal>
                </div>
              </div>

              <div className="relative">
                <SectionReveal>
                  <motion.div
                    whileHover={reduced ? undefined : { y: -6 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <GlassCard className="p-4 sm:p-5 rounded-[1.25rem] overflow-hidden gradient-border">
                      <div className="relative overflow-hidden rounded-[1.15rem] border border-primary-fixed/20 bg-[rgba(15,22,32,0.35)]">
                        <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(90deg,rgba(230,195,122,0.18)_0%,rgba(230,195,122,0)_35%),linear-gradient(180deg,rgba(47,211,168,0.12)_0%,rgba(47,211,168,0)_55%)]" />
                        <div className="relative p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <motion.div
                                className="h-2.5 w-2.5 rounded-full bg-primary-fixed"
                                animate={reduced ? undefined : { scale: [1, 1.3, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                aria-hidden="true"
                              />
                              <div className="h-2.5 w-2.5 rounded-full bg-emerald-300/80" aria-hidden="true" />
                              <div className="h-2.5 w-2.5 rounded-full bg-primary-container/70" aria-hidden="true" />
                            </div>
                            <div className="text-xs text-on-surface-variant/85">Takshara AI • Live preview</div>
                          </div>

                          <div className="mt-4 grid gap-3">
                            {[
                              { role: 'student', label: 'Student', text: 'I have organic chemistry next week. Make a plan for tonight.' },
                              { role: 'ai', label: 'Takshara AI', text: 'Absolutely. I\'ll structure it into revision blocks + practice sets. Want focus on mechanisms or reactions?' },
                            ].map((m, idx) => (
                              <motion.div
                                key={idx}
                                initial={reduced ? false : { opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: idx * 0.08 }}
                                className={cn(
                                  'rounded-2xl border bg-[rgba(0,0,0,0.15)] p-3',
                                  m.role === 'ai'
                                    ? 'border-primary-fixed/20 shadow-[0_0_0_1px_rgba(230,195,122,0.08)]'
                                    : 'border-white/5',
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="text-xs font-semibold text-primary-fixed">{m.label}</div>
                                  <div className="text-[11px] text-on-surface-variant/75">now</div>
                                </div>
                                <div className="mt-2 text-sm text-on-surface-variant/90 leading-relaxed">{m.text}</div>
                              </motion.div>
                            ))}

                            <motion.div
                              className="flex items-center justify-between rounded-2xl border border-white/5 bg-[rgba(15,22,32,0.28)] px-3 py-2"
                              whileHover={reduced ? undefined : { borderColor: 'rgba(230,195,122,0.3)' }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="text-xs text-on-surface-variant/85">Next: Generate 3-step study sprint</div>
                              <motion.div
                                className="rounded-xl border border-primary-fixed/25 bg-[rgba(230,195,122,0.10)] px-3 py-1 text-xs font-semibold text-primary-fixed cursor-pointer"
                                animate={reduced ? undefined : { y: [0, -3, 0] }}
                                transition={{ duration: 1.8, repeat: reduced ? 0 : Infinity, ease: 'easeInOut' }}
                                whileHover={reduced ? undefined : { scale: 1.05, backgroundColor: 'rgba(230,195,122,0.18)' }}
                              >
                                Run
                              </motion.div>
                            </motion.div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-xl bg-[rgba(47,211,168,0.12)] border border-emerald-300/20 flex items-center justify-center">
                            <Zap className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold">Smart Plan</div>
                            <div className="text-xs text-on-surface-variant/85">timed + personalized</div>
                          </div>
                        </div>
                        <div className="text-xs text-on-surface-variant/80">
                          <span className="text-primary-fixed">No setup.</span> One workspace.
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                </SectionReveal>

                {!reduced && (
                  <motion.div
                    className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full border border-primary-fixed/25 bg-[radial-gradient(circle_at_center,rgba(230,195,122,0.22),rgba(230,195,122,0)_60%)] blur-[0.5px]"
                    animate={{ y: [0, -14, 0], x: [0, 10, 0] }}
                    transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
                    aria-hidden="true"
                  />
                )}
              </div>
            </div>

            {/* Scroll indicator */}
            <motion.div
              className="mt-16 flex flex-col items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.8 }}
            >
              <span className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/50">Scroll to explore</span>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ChevronDown className="h-4 w-4 text-on-surface-variant/40" aria-hidden="true" />
              </motion.div>
            </motion.div>
          </section>

          <ShimmerDivider />

          {/* ─── FEATURES ─── */}
          <SectionReveal className="mx-auto max-w-container px-4 lg:px-6" delay={0.06}>
            <div id="features" className="scroll-mt-28">
              <div className="flex items-end justify-between gap-6">
                <div>
                  <motion.div
                    className="inline-flex items-center gap-2 rounded-full border border-primary-fixed/20 bg-[rgba(230,195,122,0.07)] px-4 py-2 text-xs text-on-surface-variant mb-4"
                    whileHover={reduced ? undefined : { scale: 1.02 }}
                  >
                    <Star className="h-3.5 w-3.5 text-primary-fixed" aria-hidden="true" />
                    Core Features
                  </motion.div>
                  <h2 className="text-3xl sm:text-4xl">Everything you need to learn—beautifully organized.</h2>
                  <p className="mt-3 max-w-2xl text-on-surface-variant/90">
                    Takshara turns chaotic study time into a premium, AI-guided system.
                    Glass cards, glowing edges, and micro-interactions that feel instant.
                  </p>
                </div>
                <div className="hidden sm:block text-right">
                  <div className="text-xs uppercase tracking-[0.22em] text-on-surface-variant/70">Takshara Core</div>
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {featureCards.map((f, idx) => (
                  <motion.div
                    key={f.title}
                    className="h-full"
                    initial={reduced ? false : { opacity: 0, y: 14 }}
                    whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: idx * 0.05 }}
                  >
                    <motion.div
                      whileHover={reduced ? undefined : { y: -8, scale: 1.01 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full"
                    >
                      <GlassCard className={cn(
                        'h-full rounded-[1.25rem] p-5',
                        f.tone === 'gold' ? 'gradient-border' : 'gradient-border-emerald',
                      )}>
                        <div className="flex items-center gap-3">
                          <GlowIcon tone={f.tone}>
                            {f.icon}
                          </GlowIcon>
                          <div className="text-lg font-bold">{f.title}</div>
                        </div>
                        <div className="mt-3 text-sm leading-relaxed text-on-surface-variant/90">{f.desc}</div>
                        <div className="mt-4 flex items-center gap-2 text-xs text-on-surface-variant/80">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary-fixed" aria-hidden="true" />
                          <span>Premium flow • Minimal friction</span>
                        </div>
                      </GlassCard>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
          </SectionReveal>

          {/* ─── AI ASSISTANT SHOWCASE ─── */}
          <section className="mx-auto max-w-container px-4 lg:px-6 py-14">
            <SectionReveal>
              <div id="assistant" className="scroll-mt-28">
                <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                  <div>
                    <motion.div
                      className="inline-flex items-center gap-2 rounded-full border border-primary-fixed/20 bg-[rgba(230,195,122,0.07)] px-4 py-2 text-xs text-on-surface-variant"
                      whileHover={reduced ? undefined : { scale: 1.02 }}
                    >
                      <Brain className="h-4 w-4 text-primary-fixed" aria-hidden="true" />
                      AI Assistant Showcase
                    </motion.div>
                    <h2 className="mt-4 text-3xl sm:text-4xl">Answers that behave like a mentor.</h2>
                    <p className="mt-3 text-on-surface-variant/90">
                      Takshara doesn't just respond. It clarifies your goal, generates next actions, and keeps you on track.
                    </p>

                    <div className="mt-6 space-y-3">
                      {[
                        { title: 'Explain, then execute', desc: 'Comprehension first, action second.', icon: <MessageSquare className="h-4 w-4 text-primary-fixed" /> },
                        { title: 'Study sprints', desc: 'Timed blocks tailored to your schedule.', icon: <Clock className="h-4 w-4 text-emerald-300" /> },
                        { title: 'Confidence checks', desc: 'Quick questions to validate learning.', icon: <Target className="h-4 w-4 text-teal-300" /> },
                      ].map((x) => (
                        <motion.div
                          key={x.title}
                          whileHover={reduced ? undefined : { x: 4 }}
                          transition={{ duration: 0.2 }}
                        >
                          <GlassCard className="p-4 rounded-[1.1rem] gradient-border">
                            <div className="flex items-center gap-3">
                              <GlowIcon tone={x.title === 'Study sprints' ? 'emerald' : x.title === 'Confidence checks' ? 'teal' : 'gold'}>
                                {x.icon}
                              </GlowIcon>
                              <div>
                                <div className="text-sm font-semibold">{x.title}</div>
                                <div className="mt-1 text-sm text-on-surface-variant/90">{x.desc}</div>
                              </div>
                            </div>
                          </GlassCard>
                        </motion.div>
                      ))}
                    </div>

                    <div className="mt-7">
                      <RippleButton to="/register" variant="primary" size="lg">
                        Try the AI assistant
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                      </RippleButton>
                    </div>
                  </div>

                  <div className="relative">
                    <motion.div
                      initial={reduced ? undefined : { opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-60px' }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <motion.div
                        whileHover={reduced ? undefined : { y: -6 }}
                        transition={{ duration: 0.3 }}
                      >
                        <GlassCard className="p-4 sm:p-5 rounded-[1.25rem] gradient-border-emerald">
                          <div className="rounded-[1.15rem] border border-white/5 bg-[rgba(15,22,32,0.35)] p-4">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-bold">Assistant • Query Builder</div>
                              <div className="text-xs text-on-surface-variant/80">glassy transcript</div>
                            </div>
                            <div className="mt-4 space-y-3">
                              {[
                                { who: 'You', text: 'Plan my revision for Physics: kinematics.' },
                                { who: 'Takshara', text: 'Step 1: 20-min concept review. Step 2: 30-min problem set. Step 3: 10-min recall test.' },
                              ].map((m, i) => (
                                <div
                                  key={i}
                                  className={cn(
                                    'rounded-2xl border p-3',
                                    m.who === 'Takshara' ? 'border-primary-fixed/20 bg-[rgba(230,195,122,0.08)]' : 'border-white/5',
                                  )}
                                >
                                  <div className={cn('text-xs font-semibold', m.who === 'Takshara' ? 'text-primary-fixed' : 'text-on-surface-variant/80')}>
                                    {m.who}
                                  </div>
                                  <div className="mt-2 text-sm text-on-surface-variant/90 leading-relaxed">{m.text}</div>
                                </div>
                              ))}

                              <motion.div
                                className="flex items-center justify-between rounded-2xl border border-white/5 bg-[rgba(15,22,32,0.28)] px-3 py-2"
                                initial={reduced ? undefined : { opacity: 0, y: 8 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                                whileHover={reduced ? undefined : { borderColor: 'rgba(47,211,168,0.3)' }}
                              >
                                <div className="text-xs text-on-surface-variant/85">Generate sprint + checklist</div>
                                <motion.div
                                  className="rounded-xl border border-emerald-300/25 bg-[rgba(47,211,168,0.10)] px-3 py-1 text-xs font-semibold text-emerald-300 cursor-pointer"
                                  animate={reduced ? undefined : { scale: [1, 1.03, 1] }}
                                  transition={{ duration: 1.7, repeat: reduced ? 0 : Infinity, ease: 'easeInOut' }}
                                  whileHover={reduced ? undefined : { scale: 1.05, backgroundColor: 'rgba(47,211,168,0.18)' }}
                                >
                                  Generate
                                </motion.div>
                              </motion.div>
                            </div>
                          </div>
                        </GlassCard>
                      </motion.div>
                    </motion.div>

                    {!reduced && (
                      <motion.div
                        className="absolute -left-8 -top-8 h-24 w-24 rounded-3xl border border-emerald-300/20 bg-[rgba(47,211,168,0.10)] blur-[0.4px]"
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                </div>
              </div>
            </SectionReveal>
          </section>

          {/* ─── DASHBOARD PREVIEW ─── */}
          <SectionReveal className="mx-auto max-w-container px-4 lg:px-6 py-6" delay={0.06}>
            <div id="dashboard" className="scroll-mt-28">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <motion.div
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-[rgba(47,211,168,0.07)] px-4 py-2 text-xs text-on-surface-variant mb-4"
                    whileHover={reduced ? undefined : { scale: 1.02 }}
                  >
                    <BarChart3 className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
                    Dashboard Preview
                  </motion.div>
                  <h2 className="text-3xl sm:text-4xl">Your progress, in a glance.</h2>
                  <p className="mt-3 max-w-2xl text-on-surface-variant/90">
                    Timetable, tasks, AI guidance, and focus metrics—presented with premium clarity.
                  </p>
                </div>
                <div className="text-xs uppercase tracking-[0.22em] text-on-surface-variant/70">Dashboard Preview</div>
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-12">
                <motion.div
                  className="lg:col-span-7"
                  initial={reduced ? undefined : { opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.div
                    whileHover={reduced ? undefined : { y: -4 }}
                    transition={{ duration: 0.25 }}
                  >
                    <GlassCard className="p-5 rounded-[1.4rem] gradient-border">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-bold">Takshara Workspace</div>
                        <div className="text-xs text-on-surface-variant/80">Updated just now</div>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-3">
                        {[
                          { label: 'Today', val: '3 sprints' },
                          { label: 'Focus', val: '2h 20m' },
                          { label: 'AI', val: 'Ready' },
                        ].map((x, i) => (
                          <motion.div
                            key={x.label}
                            className="rounded-2xl border border-white/5 bg-[rgba(15,22,32,0.28)] px-3 py-3"
                            initial={reduced ? undefined : { opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.45, delay: i * 0.05 }}
                            whileHover={reduced ? undefined : { y: -2, borderColor: 'rgba(230,195,122,0.2)' }}
                          >
                            <div className="text-[11px] text-on-surface-variant/80">{x.label}</div>
                            <div className="mt-1 text-lg font-bold text-primary-fixed">{x.val}</div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="mt-4 rounded-3xl border border-white/5 bg-[rgba(15,22,32,0.22)] p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold">Smart Timetable</div>
                          <div className="text-xs text-on-surface-variant/80">Mon • Wed • Fri</div>
                        </div>

                        <div className="mt-3 space-y-2">
                          {[
                            { time: '07:30', title: 'Organic Concepts', tone: 'gold' as const },
                            { time: '10:00', title: 'Problem Practice', tone: 'emerald' as const },
                            { time: '17:20', title: 'Recall Sprint', tone: 'gold' as const },
                          ].map((row) => (
                            <motion.div
                              key={row.time}
                              className="flex items-center justify-between rounded-2xl border border-white/5 bg-[rgba(0,0,0,0.12)] px-3 py-2"
                              whileHover={reduced ? undefined : { x: 4, borderColor: 'rgba(230,195,122,0.15)' }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="text-xs text-on-surface-variant/85">{row.time}</div>
                              <div className="text-sm font-semibold text-on-surface-variant/95">{row.title}</div>
                              <div className={cn('h-2.5 w-2.5 rounded-full', row.tone === 'emerald' ? 'bg-emerald-300' : 'bg-primary-fixed')} aria-hidden="true" />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                </motion.div>

                <div className="lg:col-span-5 space-y-4">
                  <motion.div
                    whileHover={reduced ? undefined : { y: -4 }}
                    transition={{ duration: 0.25 }}
                  >
                    <GlassCard className="p-5 rounded-[1.25rem] gradient-border-emerald">
                      <div className="text-sm font-bold">AI Confidence</div>
                      <div className="mt-2 text-sm text-on-surface-variant/90">Your next best step based on what you struggle with.</div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-on-surface-variant/80">
                          <span>Understanding</span>
                          <span className="text-primary-fixed">84%</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-white/5 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-[linear-gradient(90deg,#d4af37,#b8860b)]"
                            initial={reduced ? undefined : { width: 0 }}
                            whileInView={{ width: '84%' }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>

                  <motion.div
                    whileHover={reduced ? undefined : { y: -4 }}
                    transition={{ duration: 0.25 }}
                  >
                    <GlassCard className="p-5 rounded-[1.25rem] gradient-border">
                      <div className="text-sm font-bold">Weekly Momentum</div>
                      <div className="mt-2 flex items-end justify-between gap-3">
                        {[12, 20, 26, 32, 40, 52, 60].map((n, i) => (
                          <div key={i} className="flex-1">
                            <motion.div
                              className="h-2 rounded-full bg-[linear-gradient(180deg,rgba(47,211,168,0.9),rgba(47,211,168,0.25))]"
                              initial={reduced ? undefined : { height: 0 }}
                              whileInView={{ height: n }}
                              viewport={{ once: true, margin: '-60px' }}
                              transition={{ duration: 0.55, delay: i * 0.03 }}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 text-xs text-on-surface-variant/80">Consistent micro-sprints beat cramming.</div>
                    </GlassCard>
                  </motion.div>
                </div>
              </div>
            </div>
          </SectionReveal>

          {/* ─── BENEFITS + USE CASES ─── */}
          <section className="mx-auto max-w-container px-4 lg:px-6 py-14">
            <SectionReveal>
              <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
                <div className="lg:col-span-5">
                  <motion.div
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-[rgba(47,211,168,0.07)] px-4 py-2 text-xs text-on-surface-variant"
                    whileHover={reduced ? undefined : { scale: 1.02 }}
                  >
                    <ShieldCheck className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                    Benefits + Use Cases
                  </motion.div>
                  <h2 className="mt-4 text-3xl sm:text-4xl">A system for every student season.</h2>
                  <p className="mt-3 text-on-surface-variant/90">From exam crunch to everyday consistency—Takshara stays elegant and effective.</p>

                  <div className="mt-6 space-y-3">
                    {[
                      { title: 'Exam preparation', desc: 'Spaced revision + targeted practice sets.', icon: <GraduationCap className="h-4 w-4 text-primary-fixed" /> },
                      { title: 'Assignments on time', desc: 'Deadline-aware planning with confidence checks.', icon: <BookOpen className="h-4 w-4 text-emerald-300" /> },
                      { title: 'Deep understanding', desc: 'Concept-first explanations that convert to action.', icon: <Brain className="h-4 w-4 text-teal-300" /> },
                    ].map((x) => (
                      <motion.div
                        key={x.title}
                        whileHover={reduced ? undefined : { x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <GlassCard className="p-4 rounded-[1.1rem] gradient-border">
                          <div className="flex items-center gap-3">
                            <GlowIcon tone={x.title === 'Assignments on time' ? 'emerald' : x.title === 'Deep understanding' ? 'teal' : 'gold'}>
                              {x.icon}
                            </GlowIcon>
                            <div>
                              <div className="text-sm font-semibold">{x.title}</div>
                              <div className="mt-1 text-sm text-on-surface-variant/90">{x.desc}</div>
                            </div>
                          </div>
                        </GlassCard>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      { k: 'Study Sprints', v: 'Timed focus blocks', tone: 'gold' as const },
                      { k: 'Progress View', v: 'Clear momentum', tone: 'emerald' as const },
                      { k: 'AI Assistant', v: 'Mentor-style guidance', tone: 'teal' as const },
                      { k: 'Timetable', v: 'Beautiful planning', tone: 'emerald' as const },
                    ].map((card, i) => (
                      <motion.div
                        key={card.k}
                        initial={reduced ? undefined : { opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.55, delay: i * 0.04 }}
                      >
                        <motion.div
                          whileHover={reduced ? undefined : { y: -6, scale: 1.01 }}
                          transition={{ duration: 0.25 }}
                          className="h-full"
                        >
                          <GlassCard className={cn(
                            'p-5 rounded-[1.25rem] h-full',
                            card.tone === 'emerald' ? 'gradient-border-emerald' : 'gradient-border',
                          )}>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-xs uppercase tracking-[0.18em] text-on-surface-variant/70">{card.k}</div>
                                <div className="mt-2 text-lg font-bold text-on-surface-variant/95">{card.v}</div>
                              </div>
                              <div className={cn(
                                'h-10 w-10 rounded-2xl border flex items-center justify-center',
                                card.tone === 'emerald'
                                  ? 'border-emerald-300/20 bg-[rgba(47,211,168,0.10)]'
                                  : card.tone === 'teal'
                                    ? 'border-teal-300/20 bg-[rgba(20,184,166,0.10)]'
                                    : 'border-primary-fixed/25 bg-[rgba(230,195,122,0.10)]',
                              )}>
                                {card.tone === 'emerald'
                                  ? <Zap className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                                  : card.tone === 'teal'
                                    ? <Brain className="h-4 w-4 text-teal-300" aria-hidden="true" />
                                    : <Sparkles className="h-4 w-4 text-primary-fixed" aria-hidden="true" />
                                }
                              </div>
                            </div>
                          </GlassCard>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionReveal>
          </section>

          {/* ─── TESTIMONIALS ─── */}
          <SectionReveal className="mx-auto max-w-container px-4 lg:px-6 py-10" delay={0.06}>
            <div id="testimonials" className="scroll-mt-28">
              <div className="flex items-end justify-between gap-6">
                <div>
                  <motion.div
                    className="inline-flex items-center gap-2 rounded-full border border-primary-fixed/20 bg-[rgba(230,195,122,0.07)] px-4 py-2 text-xs text-on-surface-variant mb-4"
                    whileHover={reduced ? undefined : { scale: 1.02 }}
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-primary-fixed" aria-hidden="true" />
                    Testimonials
                  </motion.div>
                  <h2 className="text-3xl sm:text-4xl">Loved by focus-minded students.</h2>
                  <p className="mt-3 max-w-2xl text-on-surface-variant/90">Premium study experiences are built on clarity, not chaos.</p>
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {testimonials.map((t, i) => (
                  <motion.div
                    key={t.name}
                    initial={reduced ? undefined : { opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                  >
                    <motion.div
                      whileHover={reduced ? undefined : { y: -6, scale: 1.01 }}
                      transition={{ duration: 0.25 }}
                      className="h-full"
                    >
                      <GlassCard className="p-5 rounded-[1.35rem] h-full gradient-border">
                        <div className="text-sm font-semibold text-primary-fixed">&ldquo;{t.quote}&rdquo;</div>
                        <div className="mt-4 flex items-center justify-between">
                          <div>
                            <div className="font-bold">{t.name}</div>
                            <div className="text-xs text-on-surface-variant/80">{t.role}</div>
                          </div>
                          <div className="h-10 w-10 rounded-2xl border border-white/5 bg-[rgba(15,22,32,0.22)] flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-primary-fixed" aria-hidden="true" />
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
          </SectionReveal>

          {/* ─── HOW IT WORKS ─── */}
          <section className="mx-auto max-w-container px-4 lg:px-6 py-14">
            <SectionReveal>
              <div id="how" className="scroll-mt-28">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <motion.div
                      className="inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-[rgba(20,184,166,0.07)] px-4 py-2 text-xs text-on-surface-variant mb-4"
                      whileHover={reduced ? undefined : { scale: 1.02 }}
                    >
                      <Layers className="h-3.5 w-3.5 text-teal-300" aria-hidden="true" />
                      How It Works
                    </motion.div>
                    <h2 className="text-3xl sm:text-4xl">How it works</h2>
                    <p className="mt-3 max-w-2xl text-on-surface-variant/90">A timeline that turns intent into execution.</p>
                  </div>
                  <div className="text-xs uppercase tracking-[0.22em] text-on-surface-variant/70">Timeline</div>
                </div>

                <div className="mt-10 grid gap-4 md:grid-cols-3">
                  {[
                    { step: '01', title: 'Tell Takshara your goal', desc: 'Deadlines, syllabus topics, and what you want to master.' },
                    { step: '02', title: 'Receive an AI study sprint', desc: 'A precise plan with actions and confidence checkpoints.' },
                    { step: '03', title: 'Track momentum daily', desc: 'Timetable + progress—so you stay consistent and confident.' },
                  ].map((x, i) => (
                    <motion.div
                      key={x.step}
                      initial={reduced ? undefined : { opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-70px' }}
                      transition={{ duration: 0.6, delay: i * 0.05 }}
                    >
                      <motion.div
                        whileHover={reduced ? undefined : { y: -8, scale: 1.01 }}
                        transition={{ duration: 0.25 }}
                        className="h-full"
                      >
                        <GlassCard className="p-5 rounded-[1.35rem] h-full relative overflow-hidden gradient-border">
                          <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[radial-gradient(circle_at_center,rgba(230,195,122,0.25),transparent_60%)]" aria-hidden="true" />
                          <div className="relative">
                            <div className="text-xs font-bold text-primary-fixed">Step {x.step}</div>
                            <div className="mt-3 text-lg font-bold">{x.title}</div>
                            <div className="mt-2 text-sm text-on-surface-variant/90 leading-relaxed">{x.desc}</div>
                          </div>
                        </GlassCard>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </SectionReveal>
          </section>

          {/* ─── PRICING ─── */}
          <SectionReveal className="mx-auto max-w-container px-4 lg:px-6 py-12" delay={0.06}>
            <div id="pricing" className="scroll-mt-28">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <motion.div
                    className="inline-flex items-center gap-2 rounded-full border border-primary-fixed/20 bg-[rgba(230,195,122,0.07)] px-4 py-2 text-xs text-on-surface-variant mb-4"
                    whileHover={reduced ? undefined : { scale: 1.02 }}
                  >
                    <Infinity className="h-3.5 w-3.5 text-primary-fixed" aria-hidden="true" />
                    Pricing
                  </motion.div>
                  <h2 className="text-3xl sm:text-4xl">Pricing</h2>
                  <p className="mt-3 max-w-2xl text-on-surface-variant/90">Premium tools, built for real study flow. Placeholder tiers.</p>
                </div>
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-3">
                {[
                  { name: 'Starter', price: '$0', desc: 'Explore Takshara premium UX basics.' },
                  { name: 'Student', price: '$9', desc: 'AI sprints + dashboard insights.', highlight: true },
                  { name: 'Pro', price: '$19', desc: 'Advanced planning + deeper analysis.', highlight: false },
                ].map((p, i) => (
                  <motion.div
                    key={p.name}
                    initial={reduced ? undefined : { opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-70px' }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                  >
                    <motion.div
                      whileHover={reduced ? undefined : { y: -8, scale: 1.01 }}
                      transition={{ duration: 0.25 }}
                      className="h-full"
                    >
                      <GlassCard
                        className={cn(
                          'p-6 rounded-[1.4rem] h-full',
                          p.highlight && 'glass-strong glow-gold',
                          p.highlight ? 'gradient-border' : 'gradient-border-emerald',
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold">{p.name}</div>
                          {p.highlight && (
                            <motion.div
                              className="text-xs font-bold text-primary-fixed"
                              animate={reduced ? undefined : { scale: [1, 1.05, 1] }}
                              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            >
                              Most loved
                            </motion.div>
                          )}
                        </div>
                        <div className="mt-4">
                          <div className="text-4xl font-headline">{p.price}</div>
                          <div className="text-xs text-on-surface-variant/80">per month</div>
                        </div>
                        <div className="mt-4 text-sm text-on-surface-variant/90">{p.desc}</div>
                        <div className="mt-6">
                          <RippleButton
                            to="/register"
                            variant={p.highlight ? 'primary' : 'secondary'}
                            size="lg"
                            className="w-full"
                          >
                            Choose {p.name}
                          </RippleButton>
                        </div>
                        <div className="mt-5 space-y-2 text-xs text-on-surface-variant/80">
                          {['AI study sprints', 'Glassy dashboard', 'Focus checkpoints'].map((x) => (
                            <div key={x} className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" aria-hidden="true" />
                              <span>{x}</span>
                            </div>
                          ))}
                        </div>
                      </GlassCard>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
          </SectionReveal>

          {/* ─── FAQ ─── */}
          <section className="mx-auto max-w-container px-4 lg:px-6 py-14">
            <SectionReveal>
              <div id="faq" className="scroll-mt-28">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <motion.div
                      className="inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-[rgba(59,130,246,0.07)] px-4 py-2 text-xs text-on-surface-variant mb-4"
                      whileHover={reduced ? undefined : { scale: 1.02 }}
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-blue-300" aria-hidden="true" />
                      FAQ
                    </motion.div>
                    <h2 className="text-3xl sm:text-4xl">FAQ</h2>
                    <p className="mt-3 max-w-2xl text-on-surface-variant/90">Short answers, premium clarity.</p>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 lg:grid-cols-2">
                  {[
                    {
                      q: 'Is Takshara only for exams?',
                      a: 'No. Takshara helps you plan for daily study, assignments, and long-term revision—any time you want momentum.',
                    },
                    {
                      q: 'Does the AI replace my learning?',
                      a: 'It supports your learning. Takshara explains concepts, generates practice sprints, and helps you execute with confidence.',
                    },
                    {
                      q: 'Can I use it on mobile?',
                      a: 'Yes. The landing and dashboard are fully responsive with smooth, accessible interactions.',
                    },
                    {
                      q: 'Is this a real product?',
                      a: 'This landing page is a premium UI build. Pricing tiers are placeholders until final rollout.',
                    },
                  ].map((item, i) => (
                    <FAQItem key={item.q} q={item.q} a={item.a} index={i} />
                  ))}
                </div>
              </div>
            </SectionReveal>
          </section>

          {/* ─── CTA ─── */}
          <section className="mx-auto max-w-container px-4 lg:px-6 pb-14">
            <SectionReveal>
              <motion.div
                className="relative overflow-hidden rounded-[1.7rem] border border-primary-fixed/25 bg-[rgba(15,22,32,0.35)] p-6 sm:p-10 gradient-border"
                whileHover={reduced ? undefined : { scale: 1.005 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_center,rgba(230,195,122,0.18),transparent_58%),linear-gradient(135deg,rgba(47,211,168,0.08),transparent_55%)]" aria-hidden="true" />
                <div className="relative grid gap-6 lg:grid-cols-12 lg:items-center">
                  <div className="lg:col-span-7">
                    <div className="text-xs uppercase tracking-[0.22em] text-on-surface-variant/70">Takshara • The Student OS</div>
                    <h2 className="mt-3 text-3xl sm:text-4xl">Make your best studying feel effortless.</h2>
                    <p className="mt-3 max-w-2xl text-on-surface-variant/90">Start with a free sprint. Upgrade when your routine is locked.</p>
                  </div>
                  <div className="lg:col-span-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-end">
                      <RippleButton to="/register" variant="primary" size="lg" className="w-full sm:w-auto">
                        Create account
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                      </RippleButton>
                      <a href="#pricing" className="w-full sm:w-auto">
                        <Button variant="secondary" size="lg" className="w-full sm:w-auto border-primary-fixed/20 group">
                          View pricing
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            </SectionReveal>
          </section>

          {/* ─── FOOTER ─── */}
          <footer className="border-t border-white/5 bg-[rgba(0,0,0,0.12)]">
            <div className="mx-auto max-w-container px-4 py-10 lg:px-6">
              <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
                <div className="max-w-md">
                <Logo size="md" />
                  <p className="mt-4 text-sm text-on-surface-variant/90">
                    Premium dark UI with gold accents, glassmorphism, and AI-first workflows.
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <div className="text-sm font-semibold">Social</div>
                    <div className="mt-3 flex items-center gap-3">
                      {[
                        { name: 'X', href: '#' },
                        { name: 'GitHub', href: '#' },
                        { name: 'LinkedIn', href: '#' },
                        { name: 'Discord', href: '#' },
                      ].map((s) => (
                        <a
                          key={s.name}
                          href={s.href}
                          className="rounded-xl border border-white/5 bg-[rgba(15,22,32,0.22)] px-3 py-2 text-xs text-on-surface-variant/85 hover:text-primary-fixed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                        >
                          {s.name}
                        </a>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold">Quick links</div>
                    <div className="mt-3 space-y-2 text-sm">
                      {[
                        { t: 'Features', h: '#features' },
                        { t: 'Assistant', h: '#assistant' },
                        { t: 'Dashboard', h: '#dashboard' },
                        { t: 'Pricing', h: '#pricing' },
                        { t: 'FAQ', h: '#faq' },
                      ].map((l) => (
                        <a
                          key={l.t}
                          href={l.h}
                          className="block text-on-surface-variant/85 hover:text-primary-fixed transition-colors"
                        >
                          {l.t}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-on-surface-variant/75">
                <div>© {new Date().getFullYear()} Takshara. All rights reserved.</div>
                <div className="flex items-center gap-3">
                  <a className="hover:text-primary-fixed transition-colors" href="#">Terms</a>
                  <span aria-hidden="true">•</span>
                  <a className="hover:text-primary-fixed transition-colors" href="#">Privacy</a>
                  <span aria-hidden="true">•</span>
                  <Link className="hover:text-primary-fixed transition-colors" to="/login">Sign in</Link>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </MotionConfig>
  )
}