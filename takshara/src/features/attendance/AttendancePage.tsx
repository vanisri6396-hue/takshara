import { useState } from 'react'
import { GraduationCap, Calendar, TrendingUp, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { SubjectChip } from '@/components/shared/SubjectChip'
import { useSubjects } from '@/hooks/useSubjects'
import { useAttendance } from '@/hooks/useAttendance'
import { useCreateAttendanceRecord } from '@/hooks/useAttendance'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { ATTENDANCE_THRESHOLD } from '@/lib/constants'
import type { AttendanceRecord } from '@/types/design-system'

const STATUSES: { value: AttendanceRecord['status']; label: string; icon: typeof CheckCircle }[] = [
  { value: 'present', label: 'Present', icon: CheckCircle },
  { value: 'absent', label: 'Absent', icon: XCircle },
  { value: 'late', label: 'Late', icon: Clock },
]

export default function AttendancePage() {
  const [selectedSubject, setSelectedSubject] = useState<string | 'all'>('all')
  const [markingId, setMarkingId] = useState<string | null>(null)

  const subjectsQuery = useSubjects()
  const attendanceQuery = useAttendance()
  const createMutation = useCreateAttendanceRecord()

  const subjectMap = new Map(subjectsQuery.data?.map((s) => [s.id, s]) ?? [])

  const filteredAttendance =
    selectedSubject === 'all'
      ? attendanceQuery.data ?? []
      : (attendanceQuery.data ?? []).filter((a) => a.subjectId === selectedSubject)

  const overallPercentage =
    attendanceQuery.data?.length
      ? Math.round((attendanceQuery.data.filter((a) => a.status === 'present' || a.status === 'late').length / attendanceQuery.data.length) * 100)
      : 0

  const totalPresent = attendanceQuery.data?.filter((a) => a.status === 'present').length ?? 0
  const totalAbsent = attendanceQuery.data?.filter((a) => a.status === 'absent').length ?? 0
  const totalLate = attendanceQuery.data?.filter((a) => a.status === 'late').length ?? 0

  const handleMarkAttendance = async (record: { subjectId: string; date: string; status: AttendanceRecord['status'] }) => {
    await createMutation.mutateAsync(record)
    toast.success('Attendance marked')
    setMarkingId(null)
  }

  if (subjectsQuery.isLoading || attendanceQuery.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-container border-t-transparent" />
      </div>
    )
  }

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
        {(subjectsQuery.data ?? []).map((sub) => (
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

      {/* Attendance Records */}
      <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        {filteredAttendance.length === 0 ? (
          <Card variant="glass" className="p-10">
            <div className="flex flex-col items-center gap-3">
              <Calendar className="h-12 w-12 text-on-surface-variant/30" />
              <p className="text-body-lg text-on-surface-variant">No attendance records</p>
              <p className="text-label-sm text-on-surface-variant/50">
                Mark your first attendance to get started
              </p>
            </div>
          </Card>
        ) : (
                  filteredAttendance.map((record, i) => {
            const subject = subjectMap.get(record.subjectId)
            const isAtRisk = record.status === 'absent'
            return (
              <div
                key={record.id}
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
                    {/* Status Indicator */}
                    <div
                      className={cn(
                        'flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-2',
                        record.status === 'present'
                          ? 'border-emerald-500/30 bg-emerald-500/10'
                          : record.status === 'late'
                            ? 'border-amber-500/30 bg-amber-500/10'
                            : 'border-red-500/30 bg-red-500/10',
                      )}
                    >
                      <span
                        className={cn(
                          'font-headline text-headline-md',
                          record.status === 'present'
                            ? 'text-emerald-400'
                            : record.status === 'late'
                              ? 'text-amber-400'
                              : 'text-red-400',
                        )}
                      >
                        {record.status === 'present' ? '✓' : record.status === 'late' ? '~' : '✗'}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-body-lg font-medium text-on-surface">
                          {subject?.name || 'Unknown'}
                        </h3>
                        <SubjectChip label={subject?.code || ''} color={subject?.color} size="sm" />
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-label-sm text-on-surface-variant">
                        <span>{record.date}</span>
                        <span
                          className={cn(
                            'font-bold',
                            record.status === 'present'
                              ? 'text-emerald-400'
                              : record.status === 'late'
                                ? 'text-amber-400'
                                : 'text-red-400',
                          )}
                        >
                          {record.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMarkingId(record.id)}
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Mark Attendance Dialog */}
                {markingId === record.id && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <Card variant="glass" className="w-full max-w-md p-6">
                      <h3 className="font-headline text-headline-md text-on-surface">Mark Attendance</h3>
                      <p className="mt-2 text-body-md text-on-surface-variant">
                        {subject?.name} · {record.date}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {STATUSES.map((status) => (
                          <button
                            key={status.value}
                            onClick={() => handleMarkAttendance({
                              subjectId: record.subjectId,
                              date: record.date,
                              status: status.value,
                            })}
                            className={cn(
                              'flex items-center gap-2 rounded-radius-lg px-4 py-2 text-label-md transition-all duration-200',
                              record.status === status.value
                                ? 'gradient-gold text-on-primary font-bold'
                                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
                            )}
                          >
                            <status.icon className="h-4 w-4" />
                            {status.label}
                          </button>
                        ))}
                      </div>
                      <div className="mt-4">
                        <Button variant="ghost" onClick={() => setMarkingId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}