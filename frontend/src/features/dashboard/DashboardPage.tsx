import { useMemo } from 'react'
import {
  Calendar,
  ClipboardList,
  GraduationCap,
  TrendingUp,
  Clock,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { GlassCard } from '@/components/ui/GlassCard'
import { SubjectChip } from '@/components/shared/SubjectChip'
import { useSubjects } from '@/hooks/useSubjects'
import { useSchedules } from '@/hooks/useSchedules'
import { useAssignments } from '@/hooks/useAssignments'
import { useAttendance } from '@/hooks/useAttendance'
import { cn, formatDate } from '@/lib/utils'

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
        <div className="flex items-center gap-2 rounded-radius bg-primary-container/10 px-4 py-2 text-label-sm text-primary-container">
          <Clock className="h-3.5 w-3.5" />
          <span>Next: {getSubject(nextClass.subject_id)?.name} at {nextClass.start_time}</span>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const now = new Date()
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' })

  const schedulesQuery = useSchedules()
  const assignmentsQuery = useAssignments()
  const attendanceQuery = useAttendance()

  const upcomingAssignments = useMemo(() => {
    if (!assignmentsQuery.data) return []
    return assignmentsQuery.data
      .filter((a) => a.status === 'pending')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 4)
  }, [assignmentsQuery.data])

  const overallAttendance = attendanceQuery.data?.length
    ? Math.round((attendanceQuery.data.filter((a) => a.status === 'present' || a.status === 'late').length / attendanceQuery.data.length) * 100)
    : 0

  const isLoading = schedulesQuery.isLoading || assignmentsQuery.isLoading || attendanceQuery.isLoading

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-container border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="animate-fade-in-up">
        <h1 className="font-headline text-headline-lg text-on-surface">Dashboard</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">Welcome back, Student</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<GraduationCap className="h-5 w-5" />}
          label="Attendance"
          value={`${overallAttendance}%`}
          sub={`${attendanceQuery.data?.filter(a => a.status === 'present').length ?? 0}/${attendanceQuery.data?.length ?? 0} classes`}
          color="#059669"
        />
        <StatCard
          icon={<ClipboardList className="h-5 w-5" />}
          label="Assignments"
          value={`${upcomingAssignments.length}`}
          sub={`${assignmentsQuery.data?.filter(a => a.status === 'graded').length ?? 0} completed`}
          color="#d97706"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Upcoming Classes"
          value={`${schedulesQuery.data?.filter((s) => s.day === dayName).length ?? 0}`}
          sub="Today"
          color="#7c3aed"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <Card variant="glass" className="p-5">
              <TodayScheduleCard schedules={schedulesQuery.data ?? []} />
            </Card>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
            <Card variant="glass" className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-headline text-headline-md text-on-surface">Upcoming Deadlines</h3>
                <Badge variant="warning" size="sm">
                  {upcomingAssignments.length} pending
                </Badge>
              </div>
              {upcomingAssignments.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <ClipboardList className="h-10 w-10 text-on-surface-variant/30" />
                  <p className="text-body-md text-on-surface-variant">All caught up!</p>
                  <p className="text-label-sm text-on-surface-variant/50">No pending assignments</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingAssignments.map((a, i) => {
                    const subject = a.subjects
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
              )}
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <GlassCard className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-label-sm text-on-surface-variant">Attendance</p>
                  <p className="mt-1 font-headline text-headline-lg text-on-surface">
                    {overallAttendance}%
                  </p>
                  <p className="mt-0.5 text-label-sm text-on-surface-variant">
                    {attendanceQuery.data?.filter(a => a.status === 'present').length ?? 0} of {attendanceQuery.data?.length ?? 0} classes
                  </p>
                </div>
                <div
                  className={cn(
                    'flex h-14 w-14 items-center justify-center rounded-full border-2',
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
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-1000 animate-grow-width',
                    overallAttendance >= 75 ? 'bg-emerald-500' : 'bg-amber-500',
                  )}
                  style={{ width: `${overallAttendance}%`, animationDelay: '300ms' }}
                />
              </div>
              {overallAttendance < 75 && (
                <p className="mt-2 text-label-sm text-amber-400">
                  Attendance below 75% threshold
                </p>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}