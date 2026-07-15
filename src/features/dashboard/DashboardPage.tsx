import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  ClipboardList,
  GraduationCap,
  TrendingUp,
  Clock,
  BookOpen,
  Target,
  Sparkles,
  Bell,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Zap,
  Lightbulb,
  Award,
  BarChart3,
  ArrowRight,
  MapPin,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { GlassCard } from '@/components/ui/GlassCard'
import { SubjectChip } from '@/components/shared/SubjectChip'
import { useAuthStore } from '@/stores/authStore'
import { useSubjects } from '@/hooks/useSubjects'
import { useSchedules } from '@/hooks/useSchedules'
import { useAssignments } from '@/hooks/useAssignments'
import { useAttendance } from '@/hooks/useAttendance'
import { useExams } from '@/hooks/useExams'
import { useStudyGoals } from '@/hooks/useStudyGoals'
import { useActivity } from '@/hooks/useActivity'
import { cn, formatDate } from '@/lib/utils'

/* ──────────────────────────── Stat Card ─────────────────────── */

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
  delay = 0,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  color: string
  delay?: number
}) {
  return (
    <div className="group animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      <GlassCard className="relative overflow-hidden p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
        <div
          className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full opacity-10 blur-2xl transition-all duration-500 group-hover:opacity-20"
          style={{ backgroundColor: color }}
        />
        <div className="flex items-start justify-between">
          <div>
            <p className="text-label-sm text-on-surface-variant">{label}</p>
            <p className="mt-1 font-headline text-headline-lg text-on-surface">
              {value}
            </p>
            {sub && (
              <p className="mt-0.5 text-label-sm text-on-surface-variant">{sub}</p>
            )}
          </div>
          <div
            className="flex h-10 w-10 items-center justify-center rounded-radius"
            style={{ backgroundColor: `${color}20` }}
          >
            <span className="text-lg" style={{ color }}>{icon}</span>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

/* ──────────────────────────── Greeting ──────────────────────── */

function GreetingSection() {
  const profile = useAuthStore((s) => s.profile)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getName = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ')[0]
    }
    return 'Student'
  }

  const getCurrentSemester = () => {
    const now = new Date()
    const month = now.getMonth()
    // Academic year: odd months (Aug-Dec) = odd semesters, even months (Jan-Jul) = even semesters
    const year = profile?.year || 1
    const semester = month >= 7 ? year * 2 - 1 : year * 2
    return `Semester ${semester}`
  }

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary-container/30 bg-primary-container/15 text-xl font-headline font-bold text-primary-container">
              {profile?.full_name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div>
              <h1 className="font-headline text-headline-lg text-on-surface">
                {getGreeting()}, {getName()}
              </h1>
              <p className="mt-0.5 flex items-center gap-2 text-body-md text-on-surface-variant">
                <GraduationCap className="h-4 w-4" />
                {getCurrentSemester()} · {profile?.year ? `Year ${profile.year}` : 'Student'}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3 sm:mt-0">
          <button className="inline-flex items-center gap-2 rounded-radius-lg gradient-gold px-4 py-2.5 text-label-sm font-bold text-on-primary transition-all duration-200 hover:opacity-90 glow-gold">
            <Sparkles className="h-4 w-4" />
            AI Insights
          </button>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────── Today's Schedule ──────────────── */

function TodayScheduleCard({ schedules }: { schedules: any[] }) {
  const subjectsQuery = useSubjects()
  const subjectMap = new Map(subjectsQuery.data?.map((s) => [s.id, s]) ?? [])
  const getSubject = (id: string) => subjectMap.get(id)

  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' })

  const todaySchedule = schedules
    .filter((s) => s.day === dayName)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))

  const currentClass = todaySchedule.find(
    (s) => s.start_time <= currentTime && s.end_time > currentTime,
  )
  const nextClass = todaySchedule.find(
    (s) => s.start_time > currentTime && (!currentClass || s.start_time > currentClass.start_time),
  )

  if (todaySchedule.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-headline text-headline-md text-on-surface">
            <Calendar className="mr-2 inline h-5 w-5 text-primary-container" />
            Today's Schedule
          </h3>
          <Badge variant="info" size="sm">
            0 classes
          </Badge>
        </div>
        <div className="flex flex-col items-center gap-3 py-8">
          <Calendar className="h-10 w-10 text-on-surface-variant/30" />
          <p className="text-body-md text-on-surface-variant">No classes scheduled today</p>
          <p className="text-label-sm text-on-surface-variant/50">Enjoy your day off!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-headline text-headline-md text-on-surface">
          <Calendar className="mr-2 inline h-5 w-5 text-primary-container" />
          Today's Schedule
        </h3>
        <Badge variant="info" size="sm">
          {todaySchedule.length} classes
        </Badge>
      </div>
      <div className="space-y-2">
        {todaySchedule.map((s, i) => {
          const subject = getSubject(s.subject_id)
          const isCurrent = currentClass?.id === s.id
          const isPast = s.end_time < currentTime
          return (
            <div
              key={s.id}
              className={cn(
                'relative flex items-center gap-4 rounded-radius-lg border p-4 transition-all duration-200 hover:scale-[1.01] animate-fade-in-up',
                isCurrent
                  ? 'border-primary-container/40 bg-primary-container/10 glow-gold/20'
                  : isPast
                    ? 'border-outline-variant/10 bg-surface-container-low opacity-50'
                    : 'border-outline-variant/10 bg-surface-container-low',
              )}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {isCurrent && (
                <span className="absolute -left-0.5 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-primary-container animate-pulse-glow" />
              )}
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-radius text-label-sm font-bold"
                style={{ backgroundColor: `${subject?.color || '#666'}20`, color: subject?.color || '#666' }}
              >
                {s.start_time}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-body-md font-medium text-on-surface">
                  {subject?.name || 'Unknown'}
                </p>
                <div className="mt-0.5 flex items-center gap-2 text-label-sm text-on-surface-variant">
                  <span>{s.start_time} – {s.end_time}</span>
                  <span>·</span>
                  <span>{s.room}</span>
                </div>
              </div>
              <SubjectChip label={subject?.code || ''} color={subject?.color} size="sm" />
            </div>
          )
        })}
      </div>
      {nextClass && (
        <div className="flex items-center gap-2 rounded-radius bg-primary-container/10 px-4 py-2 text-label-sm text-primary-container animate-fade-in-up">
          <Clock className="h-3.5 w-3.5" />
          <span>Next: {getSubject(nextClass.subject_id)?.name} at {nextClass.start_time}</span>
        </div>
      )}
    </div>
  )
}

/* ──────────────────────────── Next Class Card ──────────────── */

function NextClassCard({ schedules }: { schedules: any[] }) {
  const subjectsQuery = useSubjects()
  const subjectMap = new Map(subjectsQuery.data?.map((s) => [s.id, s]) ?? [])
  const getSubject = (id: string) => subjectMap.get(id)

  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' })

  const todaySchedule = schedules
    .filter((s) => s.day === dayName)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))

  const currentClass = todaySchedule.find(
    (s) => s.start_time <= currentTime && s.end_time > currentTime,
  )
  const nextClass = todaySchedule.find(
    (s) => s.start_time > currentTime && (!currentClass || s.start_time > currentClass.start_time),
  )

  if (!currentClass && !nextClass) {
    return (
      <GlassCard className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <Clock className="h-5 w-5 text-primary-container" />
          <h3 className="font-headline text-headline-md text-on-surface">Next Class</h3>
        </div>
        <div className="flex flex-col items-center gap-3 py-6">
          <CheckCircle2 className="h-10 w-10 text-emerald-500/40" />
          <p className="text-body-md text-on-surface-variant">No more classes today</p>
          <p className="text-label-sm text-on-surface-variant/50">Enjoy your day!</p>
        </div>
      </GlassCard>
    )
  }

  const displayClass = currentClass || nextClass
  const subject = getSubject(displayClass.subject_id)
  const isCurrent = !!currentClass

  return (
    <GlassCard className={cn('p-5 transition-all duration-300', isCurrent && 'glow-gold border-2 border-primary-container/30')}>
      <div className="flex items-center gap-3 mb-3">
        <Clock className="h-5 w-5 text-primary-container" />
        <h3 className="font-headline text-headline-md text-on-surface">
          {isCurrent ? 'Current Class' : 'Next Class'}
        </h3>
        {isCurrent && (
          <Badge variant="info" size="sm" className="animate-pulse">
            Now
          </Badge>
        )}
      </div>
      <div className="flex items-start gap-4">
        <div
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-radius-lg text-label-md font-bold"
          style={{ backgroundColor: `${subject?.color || '#666'}20`, color: subject?.color || '#666' }}
        >
          {displayClass.start_time}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-body-md font-semibold text-on-surface truncate">
            {subject?.name || 'Unknown'}
          </p>
          <div className="mt-1 flex items-center gap-3 text-label-sm text-on-surface-variant">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {displayClass.start_time} – {displayClass.end_time}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {displayClass.room}
            </span>
          </div>
          {displayClass.faculty_name && (
            <p className="mt-1 text-label-sm text-on-surface-variant">{displayClass.faculty_name}</p>
          )}
        </div>
      </div>
      {!isCurrent && nextClass && (
        <div className="mt-3 flex items-center gap-2 text-label-sm text-primary-container">
          <span>Starts in {getTimeUntil(nextClass.start_time)}</span>
        </div>
      )}
    </GlassCard>
  )
}

function getTimeUntil(time: string): string {
  const now = new Date()
  const [hours, minutes] = time.split(':').map(Number)
  const target = new Date(now)
  target.setHours(hours, minutes, 0, 0)
  
  if (target < now) {
    target.setDate(target.getDate() + 1)
  }
  
  const diff = target.getTime() - now.getTime()
  const diffHours = Math.floor(diff / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m`
  }
  return `${diffMinutes}m`
}

/* ──────────────────────────── Remaining Classes ─────────────── */

function RemainingClassesCard({ schedules }: { schedules: any[] }) {
  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' })

  const remainingClasses = schedules.filter((s) => {
    if (s.day !== dayName) return false
    return s.end_time > currentTime
  }).length

  const totalToday = schedules.filter((s) => s.day === dayName).length

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-label-sm text-on-surface-variant">Remaining Today</p>
          <p className="mt-1 font-headline text-headline-lg text-on-surface">
            {remainingClasses} <span className="text-label-sm text-on-surface-variant">/ {totalToday}</span>
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container/10">
          <Calendar className="h-6 w-6 text-primary-container" />
        </div>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary-container to-primary transition-all duration-1000"
          style={{ width: `${totalToday > 0 ? (remainingClasses / totalToday) * 100 : 0}%` }}
        />
      </div>
    </GlassCard>
  )
}

/* ──────────────────────────── Weekly Preview ────────────────── */

function WeeklyPreview({ schedules }: { schedules: any[] }) {
  const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const today = new Date()
  const currentDayIndex = today.getDay() || 7 // Make Sunday = 7

  const weeklyData = DAYS_SHORT.map((day, index) => {
    const fullDay = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index]
    const count = schedules.filter((s) => s.day === fullDay).length
    const isToday = index === currentDayIndex - 1
    return { day, count, isToday }
  })

  return (
    <GlassCard className="p-5">
      <h3 className="mb-4 font-headline text-headline-md text-on-surface">Weekly Preview</h3>
          <div className="grid grid-cols-7 gap-2">
            {weeklyData.map((data) => (
              <div
                key={data.day}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-radius-lg p-3 transition-all duration-200',
                  data.isToday
                    ? 'bg-primary-container/15 border-2 border-primary-container/30'
                    : 'bg-surface-container-low border-2 border-transparent'
                )}
              >
                <span className={cn('text-label-sm font-medium', data.isToday ? 'text-primary-container' : 'text-on-surface-variant')}>
                  {data.day}
                </span>
                <span className={cn('font-headline text-headline-lg', data.isToday ? 'text-primary-container' : 'text-on-surface')}>
                  {data.count}
                </span>
                <span className="text-label-sm text-on-surface-variant">classes</span>
              </div>
            ))}
          </div>
    </GlassCard>
  )
}

/* ──────────────────────────── Quick Actions ─────────────────── */

function QuickActions() {
  const navigate = useNavigate()

  const actions = [
    { icon: <FileText className="h-4 w-4" />, label: 'New Note', onClick: () => navigate('/notes'), color: '#2563eb' },
    { icon: <ClipboardList className="h-4 w-4" />, label: 'Add Assignment', onClick: () => navigate('/assignments'), color: '#d97706' },
    { icon: <BookOpen className="h-4 w-4" />, label: 'Add Subject', onClick: () => navigate('/timetable'), color: '#7c3aed' },
    { icon: <Target className="h-4 w-4" />, label: 'Set Goal', onClick: () => navigate('/settings'), color: '#059669' },
  ]

  return (
    <GlassCard className="p-5">
      <h3 className="mb-3 font-headline text-headline-md text-on-surface">
        <Zap className="mr-2 inline h-5 w-5 text-primary-container" />
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={action.onClick}
            className="flex items-center gap-2 rounded-radius-lg border border-outline-variant/10 bg-surface-container-low p-3 text-label-sm text-on-surface-variant transition-all duration-200 hover:border-outline-variant/30 hover:text-on-surface hover:scale-[1.02] animate-fade-in-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-radius"
              style={{ backgroundColor: `${action.color}20`, color: action.color }}
            >
              {action.icon}
            </span>
            {action.label}
          </button>
        ))}
      </div>
    </GlassCard>
  )
}

/* ──────────────────────────── Upcoming Deadlines ────────────── */

function UpcomingDeadlines({ assignments }: { assignments: any[] }) {
  const navigate = useNavigate()
  const subjectsQuery = useSubjects()
  const subjectMap = new Map(subjectsQuery.data?.map((s) => [s.id, s]) ?? [])

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const dueToday = assignments.filter((a) => {
    const due = new Date(a.dueDate)
    due.setHours(0, 0, 0, 0)
    return due.getTime() === today.getTime()
  })

  const dueTomorrow = assignments.filter((a) => {
    const due = new Date(a.dueDate)
    due.setHours(0, 0, 0, 0)
    return due.getTime() === tomorrow.getTime()
  })

  const overdue = assignments.filter((a) => {
    const due = new Date(a.dueDate)
    due.setHours(0, 0, 0, 0)
    return due.getTime() < today.getTime()
  })

  const grouped = [
    ...(overdue.length > 0 ? [{ label: 'Overdue', items: overdue, color: '#dc2626', icon: <AlertTriangle className="h-3.5 w-3.5" /> }] : []),
    ...(dueToday.length > 0 ? [{ label: 'Due Today', items: dueToday, color: '#d97706', icon: <Clock className="h-3.5 w-3.5" /> }] : []),
    ...(dueTomorrow.length > 0 ? [{ label: 'Due Tomorrow', items: dueTomorrow, color: '#7c3aed', icon: <Calendar className="h-3.5 w-3.5" /> }] : []),
  ]

  if (grouped.length === 0) {
    return (
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-headline text-headline-md text-on-surface">
            <ClipboardList className="mr-2 inline h-5 w-5 text-primary-container" />
            Deadlines
          </h3>
          <Badge variant="success" size="sm">All Clear</Badge>
        </div>
        <div className="flex flex-col items-center gap-3 py-6">
          <CheckCircle2 className="h-10 w-10 text-emerald-500/40" />
          <p className="text-body-md text-on-surface-variant">All caught up!</p>
          <p className="text-label-sm text-on-surface-variant/50">No pending deadlines</p>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-headline text-headline-md text-on-surface">
          <ClipboardList className="mr-2 inline h-5 w-5 text-primary-container" />
          Deadlines
        </h3>
        {overdue.length > 0 && (
          <Badge variant="error" size="sm">{overdue.length} overdue</Badge>
        )}
      </div>
      <div className="space-y-3">
        {grouped.map((group) => (
          <div key={group.label}>
            <div className="mb-2 flex items-center gap-2 text-label-sm" style={{ color: group.color }}>
              {group.icon}
              <span className="font-medium">{group.label}</span>
              <span className="opacity-60">({group.items.length})</span>
            </div>
            <div className="space-y-2">
              {group.items.slice(0, 3).map((a: any, i: number) => {
                const subject = subjectMap.get(a.subjectId)
                return (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 rounded-radius-lg border border-outline-variant/10 bg-surface-container-low p-3 transition-all duration-200 hover:border-outline-variant/30 animate-fade-in-up"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-radius text-label-sm font-bold"
                      style={{ backgroundColor: `${subject?.color || '#666'}20`, color: subject?.color || '#666' }}
                    >
                      {subject?.code?.slice(0, 2) || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body-md text-on-surface">{a.title}</p>
                      <p className="text-label-sm text-on-surface-variant">
                        Due {formatDate(a.dueDate)}
                      </p>
                    </div>
                    <Badge variant="warning" size="sm">{a.priority || 'medium'}</Badge>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => navigate('/assignments')}
        className="mt-3 flex w-full items-center justify-center gap-1 rounded-radius-lg bg-surface-container-low py-2 text-label-sm text-on-surface-variant transition-all duration-200 hover:bg-surface-container-high hover:text-on-surface"
      >
        View all assignments
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </GlassCard>
  )
}

/* ──────────────────────────── Upcoming Exams ────────────────── */

function UpcomingExamsCard({ exams }: { exams: any[] }) {
  const subjectsQuery = useSubjects()
  const subjectMap = new Map(subjectsQuery.data?.map((s) => [s.id, s]) ?? [])

  const upcomingExams = exams
    .filter((e) => e.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4)

  if (upcomingExams.length === 0) {
    return null
  }

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-headline text-headline-md text-on-surface">
          <BookOpen className="mr-2 inline h-5 w-5 text-primary-container" />
          Upcoming Exams
        </h3>
        <Badge variant="info" size="sm">{upcomingExams.length} exams</Badge>
      </div>
      <div className="space-y-2">
        {upcomingExams.map((e, i) => {
          const subject = subjectMap.get(e.subjectId)
          const daysUntil = Math.ceil((new Date(e.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          const isUrgent = daysUntil <= 3
          return (
            <div
              key={e.id}
              className={cn(
                'flex items-center gap-3 rounded-radius-lg border p-3 transition-all duration-200 hover:scale-[1.01] animate-fade-in-up',
                isUrgent
                  ? 'border-red-500/20 bg-red-500/5'
                  : 'border-outline-variant/10 bg-surface-container-low',
              )}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-radius text-label-sm font-bold"
                style={{ backgroundColor: `${subject?.color || '#666'}20`, color: subject?.color || '#666' }}
              >
                {e.title.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-body-md font-medium text-on-surface">{e.title}</p>
                <p className="text-label-sm text-on-surface-variant">
                  {subject?.name} · {formatDate(e.date)}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className={cn('text-label-sm font-bold', isUrgent ? 'text-red-400' : 'text-primary-container')}>
                  {daysUntil}d
                </span>
                <span className="text-label-sm text-on-surface-variant">left</span>
              </div>
            </div>
          )
        })}
      </div>
    </GlassCard>
  )
}

/* ──────────────────────────── Study Goals ───────────────────── */

function StudyGoalsCard({ goals }: { goals: any[] }) {
  const activeGoals = goals.filter((g) => (g.current || 0) < g.target).slice(0, 3)

  if (activeGoals.length === 0) return null

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-headline text-headline-md text-on-surface">
          <Target className="mr-2 inline h-5 w-5 text-primary-container" />
          Study Goals
        </h3>
      </div>
      <div className="space-y-3">
        {activeGoals.map((goal, i) => {
          const percentage = Math.min(Math.round(((goal.current || 0) / goal.target) * 100), 100)
          return (
            <div key={goal.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-body-sm text-on-surface truncate">{goal.title}</p>
                <span className="text-label-sm text-on-surface-variant">
                  {goal.current || 0}/{goal.target} {goal.unit}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary-container to-primary transition-all duration-1000 animate-grow-width"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </GlassCard>
  )
}

/* ──────────────────────────── Weekly Progress ───────────────── */

function WeeklyProgress({ attendance }: { attendance: any[] }) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())

  const weeklyData = days.map((day, i) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    const dayRecords = attendance.filter((a) => a.date === dateStr)
    const present = dayRecords.filter((a) => a.status === 'present' || a.status === 'late').length
    const total = dayRecords.length
    return { day, present, total, percentage: total > 0 ? Math.round((present / total) * 100) : -1 }
  })

  const maxBars = Math.max(...weeklyData.map((d) => d.percentage).filter((p) => p >= 0), 1)

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline text-headline-md text-on-surface">
          <BarChart3 className="mr-2 inline h-5 w-5 text-primary-container" />
          Weekly Attendance
        </h3>
      </div>
      <div className="flex items-end justify-between gap-2 h-32">
        {weeklyData.map((d, i) => (
          <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
            {d.percentage >= 0 ? (
              <>
                <span className="text-label-sm text-on-surface-variant">{d.percentage}%</span>
                <div className="w-full flex-1 flex flex-col justify-end">
                  <div
                    className={cn(
                      'w-full rounded-t-sm transition-all duration-1000 animate-grow-width',
                      d.percentage >= 75 ? 'bg-emerald-500' : d.percentage >= 50 ? 'bg-amber-500' : 'bg-red-500',
                    )}
                    style={{ height: `${(d.percentage / Math.max(maxBars, 1)) * 100}%`, maxHeight: '100%', animationDelay: `${i * 100}ms` }}
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <span className="text-label-sm text-on-surface-variant/30">—</span>
              </div>
            )}
            <span className={cn('text-label-sm', d.day === days[today.getDay()] ? 'text-primary-container font-bold' : 'text-on-surface-variant')}>
              {d.day}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

/* ──────────────────────────── Recent Activity ──────────────── */

function RecentActivity({ activities }: { activities: any[] }) {
  const activityIcons: Record<string, React.ReactNode> = {
    assignment_created: <ClipboardList className="h-4 w-4" />,
    assignment_submitted: <FileText className="h-4 w-4" />,
    assignment_graded: <CheckCircle2 className="h-4 w-4" />,
    note_created: <BookOpen className="h-4 w-4" />,
    attendance_marked: <Calendar className="h-4 w-4" />,
    exam_created: <GraduationCap className="h-4 w-4" />,
    project_created: <TrendingUp className="h-4 w-4" />,
    goal_created: <Target className="h-4 w-4" />,
    goal_completed: <Award className="h-4 w-4" />,
  }

  const activityColors: Record<string, string> = {
    assignment_created: '#d97706',
    assignment_submitted: '#2563eb',
    assignment_graded: '#059669',
    note_created: '#7c3aed',
    attendance_marked: '#0891b2',
    exam_created: '#dc2626',
    project_created: '#ca8a04',
    goal_created: '#059669',
    goal_completed: '#059669',
  }

  if (activities.length === 0) return null

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-headline text-headline-md text-on-surface">
          <TrendingUp className="mr-2 inline h-5 w-5 text-primary-container" />
          Recent Activity
        </h3>
      </div>
      <div className="space-y-2">
        {activities.slice(0, 5).map((activity, i) => {
          const color = activityColors[activity.type] || '#666'
          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 rounded-radius-lg bg-surface-container-low p-3 transition-all duration-200 hover:bg-surface-container-high animate-fade-in-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${color}20`, color }}
              >
                {activityIcons[activity.type] || <Bell className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-body-sm text-on-surface">{activity.message}</p>
                <p className="text-label-sm text-on-surface-variant">
                  {formatDate(activity.created_at || activity.timestamp)}

                </p>
              </div>
            </div>
          )
        })}
      </div>
    </GlassCard>
  )
}

/* ──────────────────────────── AI Recommendations ────────────── */

function AIRecommendations() {
  const recommendations = [
    { icon: <Lightbulb className="h-4 w-4" />, text: 'Review Mathematics before tomorrow\'s quiz', color: '#d97706' },
    { icon: <Target className="h-4 w-4" />, text: 'Complete 3 more study goals this week', color: '#059669' },
    { icon: <BookOpen className="h-4 w-4" />, text: 'Organize your notes by subject', color: '#7c3aed' },
  ]

  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-5 w-5 text-primary-container" />
        <h3 className="font-headline text-headline-md text-on-surface">AI Recommendations</h3>
      </div>
      <div className="space-y-2">
        {recommendations.map((rec, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-radius-lg border border-outline-variant/10 bg-surface-container-low p-3 transition-all duration-200 hover:border-primary-container/30 animate-fade-in-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `${rec.color}20`, color: rec.color }}
            >
              {rec.icon}
            </div>
            <p className="text-body-sm text-on-surface-variant">{rec.text}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

/* ──────────────────────────── Productivity Insights ─────────── */

function ProductivityInsights({ assignments, attendance }: { assignments: any[]; attendance: any[] }) {
  const totalAssignments = assignments.length
  const completed = assignments.filter((a) => a.status === 'graded').length
  const completionRate = totalAssignments > 0 ? Math.round((completed / totalAssignments) * 100) : 0
  const attendanceRate = attendance.length > 0
    ? Math.round((attendance.filter((a) => a.status === 'present' || a.status === 'late').length / attendance.length) * 100)
    : 0

  return (
    <GlassCard className="p-5">
      <h3 className="mb-4 font-headline text-headline-md text-on-surface">
        <TrendingUp className="mr-2 inline h-5 w-5 text-primary-container" />
        Productivity
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-500/30 bg-emerald-500/10 mx-auto">
            <span className="font-headline text-headline-md text-emerald-400">{completionRate}%</span>
          </div>
          <p className="mt-2 text-label-sm text-on-surface-variant">Assignments</p>
          <p className="text-label-sm text-on-surface-variant/50">{completed}/{totalAssignments} done</p>
        </div>
        <div className="text-center">
          <div className={cn(
            'flex h-16 w-16 items-center justify-center rounded-full border-2 mx-auto',
            attendanceRate >= 75 ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-amber-500/30 bg-amber-500/10',
          )}>
            <span className={cn('font-headline text-headline-md', attendanceRate >= 75 ? 'text-emerald-400' : 'text-amber-400')}>
              {attendanceRate}%
            </span>
          </div>
          <p className="mt-2 text-label-sm text-on-surface-variant">Attendance</p>
        </div>
      </div>
    </GlassCard>
  )
}

/* ──────────────────────────── Dashboard Page ────────────────── */

export default function DashboardPage() {
  const now = new Date()
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' })

  const schedulesQuery = useSchedules()
  const assignmentsQuery = useAssignments()
  const attendanceQuery = useAttendance()
  const examsQuery = useExams()
  const goalsQuery = useStudyGoals()
  const activityQuery = useActivity()

  const isLoading =
    schedulesQuery.isLoading ||
    assignmentsQuery.isLoading ||
    attendanceQuery.isLoading ||
    examsQuery.isLoading ||
    goalsQuery.isLoading

  const pendingAssignments = useMemo(() => {
    if (!assignmentsQuery.data) return []
    return assignmentsQuery.data
      .filter((a) => a.status === 'pending' || a.status === 'submitted')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  }, [assignmentsQuery.data])

  const overallAttendance = attendanceQuery.data?.length
    ? Math.round((attendanceQuery.data.filter((a) => a.status === 'present' || a.status === 'late').length / attendanceQuery.data.length) * 100)
    : 0

  const totalPresent = attendanceQuery.data?.filter((a) => a.status === 'present').length ?? 0
  const totalRecords = attendanceQuery.data?.length ?? 0

  if (isLoading) {
    return (
      <div className="space-y-6 pb-8">
        {/* Loading Skeleton */}
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-surface-container-high" />
            <div className="space-y-2">
              <div className="h-6 w-64 rounded bg-surface-container-high" />
              <div className="h-4 w-40 rounded bg-surface-container-high" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-radius-lg bg-surface-container-high" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-72 rounded-radius-lg bg-surface-container-high" />
              <div className="h-64 rounded-radius-lg bg-surface-container-high" />
            </div>
            <div className="space-y-6">
              <div className="h-48 rounded-radius-lg bg-surface-container-high" />
              <div className="h-48 rounded-radius-lg bg-surface-container-high" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Personalized Greeting */}
      <GreetingSection />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          icon={<GraduationCap className="h-5 w-5" />}
          label="Attendance"
          value={`${overallAttendance}%`}
          sub={`${totalPresent}/${totalRecords} classes`}
          color="#059669"
          delay={0}
        />
        <StatCard
          icon={<ClipboardList className="h-5 w-5" />}
          label="Pending"
          value={pendingAssignments.length}
          sub={`${assignmentsQuery.data?.filter(a => a.status === 'graded').length ?? 0} completed`}
          color="#d97706"
          delay={50}
        />
        <StatCard
          icon={<Calendar className="h-5 w-5" />}
          label="Today's Classes"
          value={schedulesQuery.data?.filter((s) => s.day === dayName).length ?? 0}
          sub="Scheduled"
          color="#7c3aed"
          delay={100}
        />
        <StatCard
          icon={<BookOpen className="h-5 w-5" />}
          label="Upcoming Exams"
          value={examsQuery.data?.filter((e) => e.status === 'upcoming').length ?? 0}
          sub="Scheduled"
          color="#dc2626"
          delay={150}
        />
        <StatCard
          icon={<Target className="h-5 w-5" />}
          label="Study Goals"
          value={goalsQuery.data?.length ?? 0}
          sub={`${goalsQuery.data?.filter((g) => (g.current || 0) >= g.target).length ?? 0} completed`}
          color="#0891b2"
          delay={200}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Completion"
          value={assignmentsQuery.data?.length
            ? `${Math.round((assignmentsQuery.data.filter(a => a.status === 'graded').length / assignmentsQuery.data.length) * 100)}%`
            : '0%'}
          sub="Assignments done"
          color="#ca8a04"
          delay={250}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left & Center Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule */}
          <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <Card variant="glass" className="p-5">
              <TodayScheduleCard schedules={schedulesQuery.data ?? []} />
            </Card>
          </div>

          {/* Next Class & Remaining Classes */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
              <NextClassCard schedules={schedulesQuery.data ?? []} />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <RemainingClassesCard schedules={schedulesQuery.data ?? []} />
            </div>
          </div>

          {/* Weekly Preview */}
          <div className="animate-fade-in-up" style={{ animationDelay: '350ms' }}>
            <WeeklyPreview schedules={schedulesQuery.data ?? []} />
          </div>

          {/* Deadlines + Exams Row */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
              <UpcomingDeadlines assignments={pendingAssignments} />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <UpcomingExamsCard exams={examsQuery.data ?? []} />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="animate-fade-in-up" style={{ animationDelay: '350ms' }}>
            <RecentActivity activities={activityQuery.data ?? []} />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Attendance Circle */}
          <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <GlassCard className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-label-sm text-on-surface-variant">Overall Attendance</p>
                  <p className="mt-1 font-headline text-headline-lg text-on-surface">
                    {overallAttendance}%
                  </p>
                  <p className="mt-0.5 text-label-sm text-on-surface-variant">
                    {totalPresent} of {totalRecords} classes
                  </p>
                </div>
                <div
                  className={cn(
                    'flex h-16 w-16 items-center justify-center rounded-full border-2',
                    overallAttendance >= 75
                      ? 'border-emerald-500/30 bg-emerald-500/10'
                      : 'border-amber-500/30 bg-amber-500/10',
                  )}
                >
                  <span className={cn('font-headline text-headline-md', overallAttendance >= 75 ? 'text-emerald-400' : 'text-amber-400')}>
                    {overallAttendance}%
                  </span>
                </div>
              </div>
              <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-1000 animate-grow-width',
                    overallAttendance >= 75 ? 'bg-emerald-500' : 'bg-amber-500',
                  )}
                  style={{ width: `${overallAttendance}%`, animationDelay: '300ms' }}
                />
              </div>
              {overallAttendance < 75 && (
                <div className="mt-2 flex items-center gap-2 text-label-sm text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Attendance below 75% threshold
                </div>
              )}
              {overallAttendance >= 75 && (
                <div className="mt-2 flex items-center gap-2 text-label-sm text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  On track — keep it up!
                </div>
              )}
            </GlassCard>
          </div>

          {/* Study Goals */}
          <div className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
            <StudyGoalsCard goals={goalsQuery.data ?? []} />
          </div>

          {/* Quick Actions */}
          <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <QuickActions />
          </div>

          {/* AI Recommendations */}
          <div className="animate-fade-in-up" style={{ animationDelay: '350ms' }}>
            <AIRecommendations />
          </div>

          {/* Productivity */}
          <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <ProductivityInsights
              assignments={assignmentsQuery.data ?? []}
              attendance={attendanceQuery.data ?? []}
            />
          </div>

          {/* Weekly Progress */}
          <div className="animate-fade-in-up" style={{ animationDelay: '450ms' }}>
            <WeeklyProgress attendance={attendanceQuery.data ?? []} />
          </div>
        </div>
      </div>
    </div>
  )
}