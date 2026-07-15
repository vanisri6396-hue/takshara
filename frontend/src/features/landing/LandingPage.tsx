import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'framer-motion'
import { Sparkles, ShieldCheck, Wand2, Zap, ArrowRight, ArrowUpRight } from 'lucide-react'

import { Button } from '@/components/ui/Button/Button'
import { GlassCard } from '@/components/ui/GlassCard/GlassCard'
import { cn } from '@/lib/utils'

function usePrefersReducedMotion() {
  const reduced = useReducedMotion()
  return reduced
}

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
      initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      whileInView={reduced ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.section>
  )
}

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

function GlowIcon({ children, tone = 'gold' }: { children: React.ReactNode; tone?: 'gold' | 'emerald' }) {
  return (
    <div
      className={cn(
        'inline-flex h-11 w-11 items-center justify-center rounded-xl border border-primary-fixed/30',
        'bg-[rgba(230,195,122,0.08)]',
        tone === 'emerald' && 'border-emerald-300/20 bg-[rgba(47,211,168,0.09)]',
        'shadow-[0_0_0_1px_rgba(230,195,122,0.10),0_20px_60px_rgba(0,0,0,0.35)]',
      )}
    >
      {children}
    </div>
  )
}

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

      <div className="absolute inset-0 opacity-[0.45] [background-image:radial-gradient(rgba(230,195,122,0.35)_1px,transparent_1px)] [background-size:22px_22px]" />
    </div>
  )
}

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

export default function LandingPage() {
  const reduced = usePrefersReducedMotion()

  const featureCards = useMemo(
    () => [
      {
        icon: <Wand2 className="h-5 w-5 text-primary-fixed" aria-hidden="true" />,
        title: 'AI Study Orchestration',
        desc: 'Your curriculum, deadlines, and focus areas—translated into a daily plan you can actually follow.',
      },
      {
        icon: <Zap className="h-5 w-5 text-primary-fixed" aria-hidden="true" />,
        title: 'Instant Guidance',
        desc: 'Ask Takshara anything—assignments, doubts, exam strategies—with crisp, actionable answers.',
      },
      {
        icon: <ShieldCheck className="h-5 w-5 text-primary-fixed" aria-hidden="true" />,
        title: 'Privacy-First Workspace',
        desc: 'Keep your academic data organized with secure, user-controlled flows.',
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
          'The AI assistant conversations are fast and focused. It doesn’t just answer—it tells me what to do next.',
        name: 'Dev P.',
        role: 'Competitive Aspirant',
      },
    ],
    [],
  )

  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>
      <div className="relative min-h-screen bg-surface-level-0 overflow-hidden">
        <ParallaxLayers />

        <header className="relative z-10">
          <div className="mx-auto flex max-w-container items-center justify-between px-4 py-5 lg:px-6">
            <div className="flex items-center gap-3">
              <div className="relative h-11 w-11 rounded-2xl bg-[rgba(230,195,122,0.10)] border border-primary-fixed/25 shadow-[0_0_24px_rgba(230,195,122,0.25)]">
                <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top,rgba(246,225,178,0.35),transparent_60%)]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary-fixed" aria-hidden="true" />
                </div>
              </div>
              <div>
                <div className="text-label-md font-bold text-primary-fixed">Takshara</div>
                <div className="text-xs text-on-surface-variant/90">AI-Powered Student OS</div>
              </div>
            </div>

            <nav className="hidden items-center gap-6 md:flex">
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
                  className="text-sm text-on-surface-variant/85 hover:text-primary-fixed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <a href="/auth/login">
                <Button variant="secondary" size="md" className="hidden sm:inline-flex">
                  Sign in
                </Button>
              </a>
              <a href="/auth/register">
                <Button variant="primary" size="md" className="group">
                  Get started
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                </Button>
              </a>
            </div>
          </div>
        </header>

        <main className="relative z-10">
          {/* HERO */}
          <section className="mx-auto max-w-container px-4 pb-6 pt-12 sm:pt-16 lg:px-6 lg:pb-10">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <SectionReveal>
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary-fixed/25 bg-[rgba(230,195,122,0.08)] px-4 py-2 text-xs text-on-surface-variant">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-fixed animate-pulse" aria-hidden="true" />
                    Built for focus. Designed for momentum.
                  </div>
                </SectionReveal>

                <SectionReveal className="mt-6" delay={0.08}>
                  <h1 className="text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
                    Takshara is the <span className="text-primary-fixed">AI-powered</span>
                    <br /> Student Operating System.
                  </h1>
                </SectionReveal>

                <SectionReveal className="mt-5 text-base sm:text-lg text-on-surface-variant/90" delay={0.14}>
                  Your syllabus, schedule, and questions—unified into one premium workflow.
                  <span className="text-primary-fixed"> Plan smarter.</span> Learn faster. Stay ahead.
                </SectionReveal>

                <SectionReveal className="mt-7 flex flex-wrap items-center gap-3" delay={0.18}>
                  <a href="/auth/register">
                    <Button variant="primary" size="lg" className="group">
                      Start free
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 -translate-y-0.5" aria-hidden="true" />
                    </Button>
                  </a>
                  <a href="#features" className="rounded">
                    <Button variant="secondary" size="lg" className="border-primary-fixed/20">
                      Explore features
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </a>
                </SectionReveal>

                <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
                  <SectionReveal delay={0.22}>
                    <div className="rounded-2xl border border-white/5 bg-[rgba(15,22,32,0.35)] px-3 py-4">
                      <AnimatedNumber value={48} suffix="%" durationMs={950} />
                      <div className="mt-1 text-[11px] text-on-surface-variant/85">fewer missed deadlines</div>
                    </div>
                  </SectionReveal>
                  <SectionReveal delay={0.28}>
                    <div className="rounded-2xl border border-white/5 bg-[rgba(15,22,32,0.35)] px-3 py-4">
                      <AnimatedNumber value={3} suffix="x" durationMs={980} />
                      <div className="mt-1 text-[11px] text-on-surface-variant/85">faster doubt resolution</div>
                    </div>
                  </SectionReveal>
                  <SectionReveal delay={0.34}>
                    <div className="rounded-2xl border border-white/5 bg-[rgba(15,22,32,0.35)] px-3 py-4">
                      <AnimatedNumber value={92} suffix="%" durationMs={1000} />
                      <div className="mt-1 text-[11px] text-on-surface-variant/85">focus satisfaction</div>
                    </div>
                  </SectionReveal>
                </div>
              </div>

              <div className="relative">
                <SectionReveal>
                  <GlassCard className="p-4 sm:p-5 rounded-[1.25rem] overflow-hidden">
                    <div className="relative overflow-hidden rounded-[1.15rem] border border-primary-fixed/20 bg-[rgba(15,22,32,0.35)]">
                      <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(90deg,rgba(230,195,122,0.18)_0%,rgba(230,195,122,0)_35%),linear-gradient(180deg,rgba(47,211,168,0.12)_0%,rgba(47,211,168,0)_55%)]" />
                      <div className="relative p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-primary-fixed" aria-hidden="true" />
                            <div className="h-2.5 w-2.5 rounded-full bg-emerald-300/80" aria-hidden="true" />
                            <div className="h-2.5 w-2.5 rounded-full bg-primary-container/70" aria-hidden="true" />
                          </div>
                          <div className="text-xs text-on-surface-variant/85">Takshara AI • Live preview</div>
                        </div>

                        <div className="mt-4 grid gap-3">
                          {[
                            { role: 'student', label: 'Student', text: 'I have organic chemistry next week. Make a plan for tonight.' },
                            { role: 'ai', label: 'Takshara AI', text: 'Absolutely. I’ll structure it into revision blocks + practice sets. Want focus on mechanisms or reactions?' },
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

                          <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-[rgba(15,22,32,0.28)] px-3 py-2">
                            <div className="text-xs text-on-surface-variant/85">Next: Generate 3-step study sprint</div>
                            <motion.div
                              className="rounded-xl border border-primary-fixed/25 bg-[rgba(230,195,122,0.10)] px-3 py-1 text-xs font-semibold text-primary-fixed"
                              animate={reduced ? undefined : { y: [0, -3, 0] }}
                              transition={{ duration: 1.8, repeat: reduced ? 0 : Infinity, ease: 'easeInOut' }}
                            >
                              Run
                            </motion.div>
                          </div>
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
          </section>

          <ShimmerDivider />

          {/* FEATURES */}
          <SectionReveal className="mx-auto max-w-container px-4 lg:px-6" delay={0.06}>
            <div id="features" className="scroll-mt-24">
              <div className="flex items-end justify-between gap-6">
                <div>
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
                    <GlassCard className="h-full rounded-[1.25rem] p-5">
                      <div className="flex items-center gap-3">
                        <GlowIcon tone={idx === 1 ? 'emerald' : 'gold'}>
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
                ))}
              </div>
            </div>
          </SectionReveal>

          {/* ASSISTANT */}
          <section className="mx-auto max-w-container px-4 lg:px-6 py-14">
            <SectionReveal>
              <div id="assistant" className="scroll-mt-24">
                <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary-fixed/20 bg-[rgba(230,195,122,0.07)] px-4 py-2 text-xs text-on-surface-variant">
                      <Sparkles className="h-4 w-4 text-primary-fixed" aria-hidden="true" />
                      AI Assistant Showcase
                    </div>
                    <h2 className="mt-4 text-3xl sm:text-4xl">Answers that behave like a mentor.</h2>
                    <p className="mt-3 text-on-surface-variant/90">
                      Takshara doesn’t just respond. It clarifies your goal, generates next actions, and keeps you on track.
                    </p>

                    <div className="mt-6 space-y-3">
                      {[
                        { title: 'Explain, then execute', desc: 'Comprehension first, action second.' },
                        { title: 'Study sprints', desc: 'Timed blocks tailored to your schedule.' },
                        { title: 'Confidence checks', desc: 'Quick questions to validate learning.' },
                      ].map((x) => (
                        <GlassCard key={x.title} className="p-4 rounded-[1.1rem]">
                          <div className="text-sm font-semibold">{x.title}</div>
                          <div className="mt-1 text-sm text-on-surface-variant/90">{x.desc}</div>
                        </GlassCard>
                      ))}
                    </div>

                    <div className="mt-7">
                      <a href="/auth/register">
                        <Button variant="primary" size="lg" className="group">
                          Try the AI assistant
                          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                        </Button>
                      </a>
                    </div>
                  </div>

                  <div className="relative">
                    <motion.div
                      initial={reduced ? undefined : { opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-60px' }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <GlassCard className="p-4 sm:p-5 rounded-[1.25rem]">
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
                            >
                              <div className="text-xs text-on-surface-variant/85">Generate sprint + checklist</div>
                              <motion.div
                                className="rounded-xl border border-primary-fixed/25 bg-[rgba(230,195,122,0.10)] px-3 py-1 text-xs font-semibold text-primary-fixed"
                                animate={reduced ? undefined : { scale: [1, 1.03, 1] }}
                                transition={{ duration: 1.7, repeat: reduced ? 0 : Infinity, ease: 'easeInOut' }}
                              >
                                Generate
                              </motion.div>
                            </motion.div>
                          </div>
                        </div>
                      </GlassCard>
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

          {/* DASHBOARD PREVIEW */}
          <SectionReveal className="mx-auto max-w-container px-4 lg:px-6 py-6" delay={0.06}>
            <div id="dashboard" className="scroll-mt-24">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
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
                  <GlassCard className="p-5 rounded-[1.4rem]">
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
                          <div key={row.time} className="flex items-center justify-between rounded-2xl border border-white/5 bg-[rgba(0,0,0,0.12)] px-3 py-2">
                            <div className="text-xs text-on-surface-variant/85">{row.time}</div>
                            <div className="text-sm font-semibold text-on-surface-variant/95">{row.title}</div>
                            <div className={cn('h-2.5 w-2.5 rounded-full', row.tone === 'emerald' ? 'bg-emerald-300' : 'bg-primary-fixed')} aria-hidden="true" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>

                <div className="lg:col-span-5 space-y-4">
                  <GlassCard className="p-5 rounded-[1.25rem]">
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

                  <GlassCard className="p-5 rounded-[1.25rem]">
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
                </div>
              </div>
            </div>
          </SectionReveal>

          {/* BENEFITS + USE CASES */}
          <section className="mx-auto max-w-container px-4 lg:px-6 py-14">
            <SectionReveal>
              <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
                <div className="lg:col-span-5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-[rgba(47,211,168,0.07)] px-4 py-2 text-xs text-on-surface-variant">
                    <ShieldCheck className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                    Benefits + Use Cases
                  </div>
                  <h2 className="mt-4 text-3xl sm:text-4xl">A system for every student season.</h2>
                  <p className="mt-3 text-on-surface-variant/90">From exam crunch to everyday consistency—Takshara stays elegant and effective.</p>

                  <div className="mt-6 space-y-3">
                    {[
                      { title: 'Exam preparation', desc: 'Spaced revision + targeted practice sets.' },
                      { title: 'Assignments on time', desc: 'Deadline-aware planning with confidence checks.' },
                      { title: 'Deep understanding', desc: 'Concept-first explanations that convert to action.' },
                    ].map((x) => (
                      <GlassCard key={x.title} className="p-4 rounded-[1.1rem]">
                        <div className="text-sm font-semibold">{x.title}</div>
                        <div className="mt-1 text-sm text-on-surface-variant/90">{x.desc}</div>
                      </GlassCard>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      { k: 'Study Sprints', v: 'Timed focus blocks', tone: 'gold' as const },
                      { k: 'Progress View', v: 'Clear momentum', tone: 'emerald' as const },
                      { k: 'AI Assistant', v: 'Mentor-style guidance', tone: 'gold' as const },
                      { k: 'Timetable', v: 'Beautiful planning', tone: 'emerald' as const },
                    ].map((card, i) => (
                      <motion.div
                        key={card.k}
                        initial={reduced ? undefined : { opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.55, delay: i * 0.04 }}
                      >
                        <GlassCard className="p-5 rounded-[1.25rem] h-full">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs uppercase tracking-[0.18em] text-on-surface-variant/70">{card.k}</div>
                              <div className="mt-2 text-lg font-bold text-on-surface-variant/95">{card.v}</div>
                            </div>
                            <div className={cn('h-10 w-10 rounded-2xl border flex items-center justify-center', card.tone === 'emerald' ? 'border-emerald-300/20 bg-[rgba(47,211,168,0.10)]' : 'border-primary-fixed/25 bg-[rgba(230,195,122,0.10)]')}>
                              {card.tone === 'emerald' ? <Zap className="h-4 w-4 text-emerald-300" aria-hidden="true" /> : <Sparkles className="h-4 w-4 text-primary-fixed" aria-hidden="true" />}
                            </div>
                          </div>
                        </GlassCard>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionReveal>
          </section>

          {/* TESTIMONIALS */}
          <SectionReveal className="mx-auto max-w-container px-4 lg:px-6 py-10" delay={0.06}>
            <div id="testimonials" className="scroll-mt-24">
              <div className="flex items-end justify-between gap-6">
                <div>
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
                    <GlassCard className="p-5 rounded-[1.35rem] h-full">
                      <div className="text-sm font-semibold text-primary-fixed">“{t.quote}”</div>
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
                ))}
              </div>
            </div>
          </SectionReveal>

          {/* HOW IT WORKS */}
          <section className="mx-auto max-w-container px-4 lg:px-6 py-14">
            <SectionReveal>
              <div id="how" className="scroll-mt-24">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
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
                      <GlassCard className="p-5 rounded-[1.35rem] h-full relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[radial-gradient(circle_at_center,rgba(230,195,122,0.25),transparent_60%)]" aria-hidden="true" />
                        <div className="relative">
                          <div className="text-xs font-bold text-primary-fixed">Step {x.step}</div>
                          <div className="mt-3 text-lg font-bold">{x.title}</div>
                          <div className="mt-2 text-sm text-on-surface-variant/90 leading-relaxed">{x.desc}</div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </div>
              </div>
            </SectionReveal>
          </section>

          {/* PRICING (placeholder pricing but polished UI) */}
          <SectionReveal className="mx-auto max-w-container px-4 lg:px-6 py-12" delay={0.06}>
            <div id="pricing" className="scroll-mt-24">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-3xl sm:text-4xl">Pricing</h2>
                  <p className="mt-3 max-w-2xl text-on-surface-variant/90">Premium tools, built for real study flow. Placeholder tiers.</p>
                </div>
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-3">
                {[
                  { name: 'Starter', price: '$0', desc: 'Explore Takshara premium UX basics.' },
                  { name: 'Student', price: '$9', desc: 'AI sprints + dashboard insights.' , highlight: true},
                  { name: 'Pro', price: '$19', desc: 'Advanced planning + deeper analysis.', highlight: false },
                ].map((p, i) => (
                  <motion.div
                    key={p.name}
                    initial={reduced ? undefined : { opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-70px' }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                  >
                    <GlassCard
                      className={cn(
                        'p-6 rounded-[1.4rem] h-full',
                        p.highlight && 'glass-strong glow-gold',
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold">{p.name}</div>
                        {p.highlight && <div className="text-xs font-bold text-primary-fixed">Most loved</div>}
                      </div>
                      <div className="mt-4">
                        <div className="text-4xl font-headline">{p.price}</div>
                        <div className="text-xs text-on-surface-variant/80">per month</div>
                      </div>
                      <div className="mt-4 text-sm text-on-surface-variant/90">{p.desc}</div>
                      <div className="mt-6">
                        <Button variant={p.highlight ? 'primary' : 'secondary'} size="lg" className="w-full">
                          Choose {p.name}
                        </Button>
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
                ))}
              </div>
            </div>
          </SectionReveal>

          {/* FAQ */}
          <section className="mx-auto max-w-container px-4 lg:px-6 py-14">
            <SectionReveal>
              <div id="faq" className="scroll-mt-24">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
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

          {/* CTA */}
          <section className="mx-auto max-w-container px-4 lg:px-6 pb-14">
            <SectionReveal>
              <div className="relative overflow-hidden rounded-[1.7rem] border border-primary-fixed/25 bg-[rgba(15,22,32,0.35)] p-6 sm:p-10">
                <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_center,rgba(230,195,122,0.18),transparent_58%),linear-gradient(135deg,rgba(47,211,168,0.08),transparent_55%)]" aria-hidden="true" />
                <div className="relative grid gap-6 lg:grid-cols-12 lg:items-center">
                  <div className="lg:col-span-7">
                    <div className="text-xs uppercase tracking-[0.22em] text-on-surface-variant/70">Takshara • The Student OS</div>
                    <h2 className="mt-3 text-3xl sm:text-4xl">Make your best studying feel effortless.</h2>
                    <p className="mt-3 max-w-2xl text-on-surface-variant/90">Start with a free sprint. Upgrade when your routine is locked.</p>
                  </div>
                  <div className="lg:col-span-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-end">
                      <a href="/auth/register">
                        <Button variant="primary" size="lg" className="group w-full sm:w-auto">
                          Create account
                          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                        </Button>
                      </a>
                      <a href="#pricing" className="w-full sm:w-auto">
                        <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                          View pricing
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </SectionReveal>
          </section>

          {/* FOOTER */}
          <footer className="border-t border-white/5 bg-[rgba(0,0,0,0.12)]">
            <div className="mx-auto max-w-container px-4 py-10 lg:px-6">
              <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
                <div className="max-w-md">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-[rgba(230,195,122,0.10)] border border-primary-fixed/25 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-primary-fixed" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="font-bold">Takshara</div>
                      <div className="text-xs text-on-surface-variant/80">AI-Powered Student Operating System</div>
                    </div>
                  </div>
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
                      {[{ t: 'Features', h: '#features' }, { t: 'Assistant', h: '#assistant' }, { t: 'FAQ', h: '#faq' }].map((l) => (
                        <a key={l.t} href={l.h} className="block text-on-surface-variant/85 hover:text-primary-fixed">
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
                  <a className="hover:text-primary-fixed" href="#">Terms</a>
                  <span aria-hidden="true">•</span>
                  <a className="hover:text-primary-fixed" href="#">Privacy</a>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </MotionConfig>
  )
}

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
      <GlassCard className="p-5 rounded-[1.35rem]">
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
            className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/5 bg-[rgba(15,22,32,0.22)]"
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

