import { useState } from 'react'
import { GraduationCap, Calendar, TrendingUp, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { GlassCard } from '@/components/ui/GlassCard'
import { SubjectChip } from '@/components/shared/SubjectChip'
import { SUBJECTS, ATTENDANCE, getAttendancePercentage, getAttendanceForSubject } from '@/data/mockData'
import { cn } from '@/lib/utils'
import { ATTENDANCE_THRESHOLD } from '@/lib/constants'

export default function AttendancePage() {
  const [selectedSubject, setSelectedSubject] = useState<string | 'all'>('all')

  const subjectAttendance = SUBJECTS.map((sub) => ({
    subject: sub,
    percentage: getAttendancePercentage(sub.id),
    records: getAttendanceForSubject(sub.id),
  }))

  const filteredAttendance =
    selectedSubject === 'all'
      ? subjectAttendance
      : subjectAttendance.filter((sa) => sa.subject.id === selectedSubject)

  const overallPercentage =
    ATTENDANCE.length > 0
      ? Math.round(
          (ATTENDANCE.filter((a) => a.status === 'present' || a.status === 'late').length /
            ATTENDANCE.length) *
            100,
        )
      : 0

  const totalPresent = ATTENDANCE.filter((a) => a.status === 'present').length
  const totalAbsent = ATTENDANCE.filter((a) => a.status === 'absent').length
  const totalLate = ATTENDANCE.filter((a) => a.status === 'late').length

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="font-headline text-headline-lg text-on-surface">Attendance</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">Track your academic attendance</p>
      </div>

      {/* Overall Stats */}
      <div className="animate-fade-in-up">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-radius',
                  overallPercentage >= ATTENDANCE_THRESHOLD
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-amber-500/15 text-amber-400',
                )}
              >
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant">Overall</p>
                <p className="font-headline text-headline-md text-on-surface">
                  {overallPercentage}%
                </p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-radius bg-emerald-500/15 text-emerald-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant">Present</p>
                <p className="font-headline text-headline-md text-on-surface">{totalPresent}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-radius bg-red-500/15 text-red-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant">Absent</p>
                <p className="font-headline text-headline-md text-on-surface">{totalAbsent}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-radius bg-amber-500/15 text-amber-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant">Late</p>
                <p className="font-headline text-headline-md text-on-surface">{totalLate}</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-body-md font-medium text-on-surface">Overall Attendance</p>
            <span
              className={cn(
                'text-label-sm font-bold',
                overallPercentage >= ATTENDANCE_THRESHOLD
                  ? 'text-emerald-400'
                  : 'text-amber-400',
              )}
            >
              {overallPercentage >= ATTENDANCE_THRESHOLD ? '✅ On Track' : '⚠ Below Threshold'}
            </span>
          </div>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-surface-container-highest">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-1000 animate-grow-width',
                overallPercentage >= ATTENDANCE_THRESHOLD
                  ? 'bg-emerald-500'
                  : 'bg-amber-500',
              )}
              style={{ width: `${overallPercentage}%`, animationDelay: '300ms' }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-label-sm text-on-surface-variant">
            <span>{ATTENDANCE_THRESHOLD}% threshold</span>
            <span>{overallPercentage}% current</span>
          </div>
        </GlassCard>
      </div>

      {/* Subject Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin animate-fade-in-up" style={{ animationDelay: '150ms' }}>
        <button
          onClick={() => setSelectedSubject('all')}
          className={cn(
            'flex-shrink-0 rounded-radius-lg px-4 py-2 text-label-md transition-all duration-200',
            selectedSubject === 'all'
              ? 'gradient-gold text-on-primary font-bold glow-gold'
              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
          )}
        >
          All Subjects
        </button>
        {SUBJECTS.map((sub) => (
          <button
            key={sub.id}
            onClick={() => setSelectedSubject(sub.id)}
            className={cn(
              'flex-shrink-0 rounded-radius-lg px-4 py-2 text-label-md transition-all duration-200',
              selectedSubject === sub.id
                ? 'text-white font-bold'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
            )}
            style={
              selectedSubject === sub.id
                ? { backgroundColor: `${sub.color}30`, color: sub.color }
                : undefined
            }
          >
            {sub.name}
          </button>
        ))}
      </div>

      {/* Subject Attendance Cards */}
      <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        {filteredAttendance.map((sa, i) => {
          const isAtRisk = sa.percentage < ATTENDANCE_THRESHOLD
          return (
            <div
              key={sa.subject.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <Card
                variant="glass"
                className={cn(
                  'overflow-hidden p-0 transition-all duration-200 hover:scale-[1.01]',
                  isAtRisk && 'border-amber-500/30',
                )}
              >
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6">
                  {/* Percentage Circle */}
                  <div
                    className={cn(
                      'flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-2',
                      isAtRisk
                        ? 'border-amber-500/30 bg-amber-500/10'
                        : 'border-emerald-500/30 bg-emerald-500/10',
                    )}
                  >
                    <span
                      className={cn(
                        'font-headline text-headline-md',
                        isAtRisk ? 'text-amber-400' : 'text-emerald-400',
                      )}
                    >
                      {sa.percentage}%
                    </span>
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-body-lg font-medium text-on-surface">
                        {sa.subject.name}
                      </h3>
                      <SubjectChip label={sa.subject.code} color={sa.subject.color} size="sm" />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-label-sm text-on-surface-variant">
                      <span>
                        Present:{' '}
                        <span className="text-emerald-400">
                          {sa.records.filter((r) => r.status === 'present').length}
                        </span>
                      </span>
                      <span>
                        Late:{' '}
                        <span className="text-amber-400">
                          {sa.records.filter((r) => r.status === 'late').length}
                        </span>
                      </span>
                      <span>
                        Absent:{' '}
                        <span className="text-red-400">
                          {sa.records.filter((r) => r.status === 'absent').length}
                        </span>
                      </span>
                      <span>Total: {sa.records.length}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all animate-grow-width',
                          isAtRisk ? 'bg-amber-500' : 'bg-emerald-500',
                        )}
                        style={{ width: `${sa.percentage}%`, animationDelay: `${300 + i * 100}ms` }}
                      />
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0">
                    {isAtRisk ? (
                      <Badge variant="error" size="sm">At Risk</Badge>
                    ) : (
                      <Badge variant="success" size="sm">On Track</Badge>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}