import { useMemo } from 'react'
import {
  Calendar,
  ClipboardList,
  GraduationCap,
  TrendingUp,
  Clock,
  ArrowRight,
  BookOpen,
  Target,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { GlassCard } from '@/components/ui/GlassCard'
import { SubjectChip } from '@/components/shared/SubjectChip'
import {
  DASHBOARD_STATS,
  ACTIVITY_FEED,
  STUDY_GOALS,
  getTodaySchedule,
  getCurrentClass,
  getNextClass,
  getUpcomingAssignments,
  getSubject,
  getSubjectByName,
} from '@/data/mockData'
import { cn, formatDate, formatTime } from '@/lib/utils'

/* ─────────── Stat Card ─────────── */

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  color: string
}) {
  return (
    <div className="group animate-fade-in-up">
      <GlassCard className="relative overflow-hidden p-5 transition-all duration-300 hover:scale-[1.02]">
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

/* ─────────── Schedule Card ─────────── */

function TodayScheduleCard() {
  const schedule = getTodaySchedule()
  const currentClass = getCurrentClass()
  const nextClass = getNextClass()

  if (schedule.length === 0) {
    return (
      <Card variant="glass" className="p-6">
        <div className="flex flex-col items-center gap-3 py-8">
          <Calendar className="h-10 w-10 text-on-surface-variant/30" />
          <p className="text-body-md text-on-surface-variant">No classes scheduled today</p>
          <p className="text-label-sm text-on-surface-variant/50">Enjoy your day off!</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-headline text-headline-md text-on-surface">Today's Schedule</h3>
        <Badge variant="info" size="sm">
          {schedule.length} classes
        </Badge>
      </div>
      <div className="space-y-2">
        {schedule.map((s, i) => {
          const subject = getSubject(s.subjectId)
          const isCurrent = currentClass?.id === s.id
          const isPast = s.endTime < `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`
          return (
            <div
              key={s.id}
              className={cn(
                'relative flex items-center gap-4 rounded-radius-lg border p-4 transition-all duration-200 hover:scale-[1.01] animate-fade-in-up',
                isCurrent
                  ? 'border-primary-container/40 bg-primary-container/10'
                  : isPast
                    ? 'border-outline-variant/10 bg-surface-container-low opacity-50'
                    : 'border-outline-variant/10 bg-surface-container-low',
              )}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {isCurrent && (
                <span className="absolute -left-0.5 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-primary-container glow-gold" />
              )}
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-radius text-label-sm font-bold"
                style={{ backgroundColor: `${subject?.color || '#666'}20`, color: subject?.color || '#666' }}
              >
                {s.startTime}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-body-md font-medium text-on-surface">
                  {subject?.name || 'Unknown'}
                </p>
                <div className="mt-0.5 flex items-center gap-2 text-label-sm text-on-surface-variant">
                  <span>{s.startTime} – {s.endTime}</span>
                  <span>·</span>
                  <span>{s.room}</span>
                </div>
              </div>
              <SubjectChip label={subject?.code || ''} color={subject?.color} size="sm" />
            </div>
          )
        })}
      </div>
      {nextClass && !currentClass && (
        <div className="flex items-center gap-2 rounded-radius bg-primary-container/10 px-4 py-2 text-label-sm text-primary-container">
          <Clock className="h-3.5 w-3.5" />
          <span>Next: {getSubject(nextClass.subjectId)?.name} at {nextClass.startTime}</span>
        </div>
      )}
    </div>
  )
}

/* ─────────── Assignments Card ─────────── */

function UpcomingAssignmentsCard() {
  const assignments = getUpcomingAssignments().slice(0, 4)

  if (assignments.length === 0) {
    return (
      <Card variant="glass" className="p-6">
        <div className="flex flex-col items-center gap-3 py-8">
          <ClipboardList className="h-10 w-10 text-on-surface-variant/30" />
          <p className="text-body-md text-on-surface-variant">All caught up!</p>
          <p className="text-label-sm text-on-surface-variant/50">No pending assignments</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-headline text-headline-md text-on-surface">Upcoming Deadlines</h3>
        <Badge variant="warning" size="sm">
          {assignments.length} pending
        </Badge>
      </div>
      <div className="space-y-2">
        {assignments.map((a, i) => {
          const subject = getSubject(a.subjectId)
          const isUrgent = new Date(a.dueDate).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000
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
                {subject?.code?.slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-body-md text-on-surface">{a.title}</p>
                <p className="text-label-sm text-on-surface-variant">
                  Due {formatDate(a.dueDate)}
                </p>
              </div>
              {isUrgent && (
                <Badge variant="error" size="sm">Urgent</Badge>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─────────── Activity Feed ─────────── */

function ActivityFeedCard() {
  const activities = ACTIVITY_FEED.slice(0, 5)

  const activityIcons: Record<string, React.ReactNode> = {
    assignment_graded: <TrendingUp className="h-4 w-4" />,
    assignment_submitted: <ClipboardList className="h-4 w-4" />,
    note_created: <BookOpen className="h-4 w-4" />,
    attendance: <GraduationCap className="h-4 w-4" />,
  }

  const activityColors: Record<string, string> = {
    assignment_graded: '#059669',
    assignment_submitted: '#2563eb',
    note_created: '#d97706',
    attendance: '#7c3aed',
  }

  return (
    <div className="space-y-3">
      <h3 className="font-headline text-headline-md text-on-surface">Recent Activity</h3>
      {activities.length === 0 ? (
        <Card variant="glass" className="p-6">
          <div className="flex flex-col items-center gap-3 py-6">
            <TrendingUp className="h-10 w-10 text-on-surface-variant/30" />
            <p className="text-body-md text-on-surface-variant">No recent activity</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {activities.map((act, i) => (
            <div
              key={act.id}
              className="flex items-start gap-3 rounded-radius-lg bg-surface-container-low p-3 transition-all duration-200 hover:bg-surface-container animate-fade-in-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div
                className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${activityColors[act.type] || '#666'}20` }}
              >
                <span style={{ color: activityColors[act.type] || '#666' }}>
                  {activityIcons[act.type]}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-body-md text-on-surface">{act.message}</p>
                <p className="mt-0.5 text-label-sm text-on-surface-variant">
                  {formatDate(act.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─────────── Study Goals ─────────── */

function StudyGoalsCard() {
  return (
    <div className="space-y-3">
      <h3 className="font-headline text-headline-md text-on-surface">Study Goals</h3>
      {STUDY_GOALS.length === 0 ? (
        <Card variant="glass" className="p-6">
          <div className="flex flex-col items-center gap-3 py-6">
            <Target className="h-10 w-10 text-on-surface-variant/30" />
            <p className="text-body-md text-on-surface-variant">No goals set</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {STUDY_GOALS.map((goal, i) => {
            const progress = goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0
            return (
              <div
                key={goal.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <GlassCard className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-body-md font-medium text-on-surface">{goal.title}</p>
                    <span className="text-label-sm text-on-surface-variant">
                      {goal.current}/{goal.target}
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
                    <div
                      className="h-full rounded-full gradient-gold animate-grow-width"
                      style={{ width: `${progress}%`, animationDelay: `${300 + i * 100}ms` }}
                    />
                  </div>
                  <p className="mt-1 text-label-sm text-on-surface-variant">
                    {progress}% complete · {goal.unit} remaining
                  </p>
                </GlassCard>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ─────────── Attendance Overview ─────────── */

function AttendanceOverviewCard() {
  const stats = DASHBOARD_STATS
  const progress = stats.totalClasses > 0 ? Math.round((stats.attendedClasses / stats.totalClasses) * 100) : 0
  const isGood = progress >= 75

  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-label-sm text-on-surface-variant">Attendance</p>
          <p className="mt-1 font-headline text-headline-lg text-on-surface">
            {stats.attendancePercentage}%
          </p>
          <p className="mt-0.5 text-label-sm text-on-surface-variant">
            {stats.attendedClasses} of {stats.totalClasses} classes
          </p>
        </div>
        <div
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-full border-2',
            isGood ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-amber-500/30 bg-amber-500/10',
          )}
        >
          <span className={cn('font-headline text-headline-md', isGood ? 'text-emerald-400' : 'text-amber-400')}>
            {stats.attendancePercentage}%
          </span>
        </div>
      </div>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000 animate-grow-width',
            isGood ? 'bg-emerald-500' : 'bg-amber-500',
          )}
          style={{ width: `${progress}%`, animationDelay: '300ms' }}
        />
      </div>
      {!isGood && (
        <p className="mt-2 text-label-sm text-amber-400">
          Attendance below 75% threshold
        </p>
      )}
    </GlassCard>
  )
}

/* ─────────── Page ─────────── */

export default function DashboardPage() {
  const stats = DASHBOARD_STATS

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="font-headline text-headline-lg text-on-surface">Dashboard</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Welcome back, Student
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<GraduationCap className="h-5 w-5" />}
          label="Attendance"
          value={`${stats.attendancePercentage}%`}
          sub={`${stats.attendedClasses}/${stats.totalClasses} classes`}
          color="#059669"
        />
        <StatCard
          icon={<ClipboardList className="h-5 w-5" />}
          label="Assignments"
          value={`${stats.pendingAssignments}`}
          sub={`${stats.completedAssignments} completed`}
          color="#d97706"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Average Grade"
          value={`${stats.averageGrade}%`}
          color="#2563eb"
        />
        <StatCard
          icon={<Calendar className="h-5 w-5" />}
          label="Upcoming Classes"
          value={`${stats.upcomingClasses}`}
          sub="Today"
          color="#7c3aed"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <Card variant="glass" className="p-5">
              <TodayScheduleCard />
            </Card>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
            <Card variant="glass" className="p-5">
              <UpcomingAssignmentsCard />
            </Card>
          </div>
        </div>

        {/* Right Column - Widgets */}
        <div className="space-y-6">
          <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <AttendanceOverviewCard />
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
            <Card variant="glass" className="p-5">
              <StudyGoalsCard />
            </Card>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <Card variant="glass" className="p-5">
              <ActivityFeedCard />
            </Card>
          </div>
        </div>
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: '350ms' }}>
        <Card variant="glass" className="p-6 text-center">
          <p className="text-label-sm text-on-surface-variant">
            Takshara v0.1 · AI-Powered Student OS
          </p>
        </Card>
      </div>
    </div>
  )
}