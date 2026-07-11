import { useState } from 'react'
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { GlassCard } from '@/components/ui/GlassCard'
import { SubjectChip } from '@/components/shared/SubjectChip'
import { SCHEDULE, getSubject } from '@/data/mockData'
import { cn } from '@/lib/utils'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']

export default function TimetablePage() {
  const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay() - 1] || DAYS[0])
  const daySchedule = SCHEDULE.filter((s) => s.day === selectedDay).sort((a, b) =>
    a.startTime.localeCompare(b.startTime),
  )

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="font-headline text-headline-lg text-on-surface">Timetable</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">Your weekly academic schedule</p>
      </div>

      {/* Day Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin animate-fade-in-up">
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={cn(
              'flex-shrink-0 rounded-radius-lg px-4 py-2.5 text-label-md transition-all duration-200',
              selectedDay === day
                ? 'gradient-gold text-on-primary font-bold glow-gold'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
            )}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Desktop: Grid View */}
      <div className="hidden lg:block animate-fade-in-up">
        <Card variant="glass" className="overflow-hidden p-0">
          {/* Grid Header */}
          <div className="grid grid-cols-[80px_repeat(5,1fr)] border-b border-outline-variant/20">
            <div className="p-3 text-center text-label-sm text-on-surface-variant">Time</div>
            {DAYS.map((day) => (
              <div
                key={day}
                className={cn(
                  'p-3 text-center text-label-sm font-medium',
                  day === selectedDay ? 'text-primary-container' : 'text-on-surface-variant',
                )}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grid Body */}
          <div className="relative">
            {TIME_SLOTS.map((time, ti) => (
              <div
                key={time}
                className="grid grid-cols-[80px_repeat(5,1fr)] border-b border-outline-variant/10 last:border-b-0"
              >
                <div className="flex items-center justify-center p-2 text-label-sm text-on-surface-variant">
                  {time}
                </div>
                {DAYS.map((day) => {
                  const slot = SCHEDULE.find(
                    (s) => s.day === day && s.startTime <= time && s.endTime > time,
                  )
                  if (!slot) return <div key={`${day}-${time}`} className="p-2" />
                  const subject = getSubject(slot.subjectId)
                  const isFirst = slot.startTime === time
                  if (!isFirst) return <div key={`${day}-${time}`} className="p-2" />
                  return (
                    <div
                      key={slot.id}
                      className="m-1 rounded-radius-lg p-3 transition-all duration-200 hover:scale-[1.02]"
                      style={{
                        backgroundColor: `${subject?.color || '#666'}18`,
                        borderLeft: `3px solid ${subject?.color || '#666'}`,
                      }}
                    >
                      <p className="text-body-sm font-medium text-on-surface">
                        {subject?.name}
                      </p>
                      <p className="mt-0.5 text-label-sm text-on-surface-variant">
                        {slot.startTime} – {slot.endTime}
                      </p>
                      <p className="text-label-sm text-on-surface-variant">{slot.room}</p>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Mobile: List View */}
      <div className="lg:hidden animate-fade-in-up">
        <Card variant="glass" className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-headline text-headline-md text-on-surface">{selectedDay}</h2>
            <Badge variant="info" size="sm">
              {daySchedule.length} classes
            </Badge>
          </div>

          {daySchedule.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <Clock className="h-10 w-10 text-on-surface-variant/30" />
              <p className="text-body-md text-on-surface-variant">No classes scheduled</p>
              <p className="text-label-sm text-on-surface-variant/50">Enjoy your day off!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {daySchedule.map((s, i) => {
                const subject = getSubject(s.subjectId)
                return (
                  <div
                    key={s.id}
                    className="flex items-start gap-4 rounded-radius-lg border border-outline-variant/10 bg-surface-container-low p-4 transition-all duration-200 hover:border-outline-variant/30 animate-fade-in-up"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {/* Time Column */}
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-label-sm font-bold text-on-surface">{s.startTime}</span>
                      <span className="text-label-sm text-on-surface-variant">–</span>
                      <span className="text-label-sm text-on-surface-variant">{s.endTime}</span>
                    </div>

                    {/* Divider */}
                    <div
                      className="w-0.5 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: subject?.color || '#666' }}
                    />

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <p className="text-body-md font-medium text-on-surface">
                        {subject?.name || 'Unknown'}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-label-sm text-on-surface-variant">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {s.room}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {s.startTime} – {s.endTime}
                        </span>
                      </div>
                      <div className="mt-2">
                        <SubjectChip label={subject?.code || ''} color={subject?.color} size="sm" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Weekly Overview */}
      <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <GlassCard className="p-5">
          <h3 className="mb-4 font-headline text-headline-md text-on-surface">Weekly Overview</h3>
          <div className="grid grid-cols-5 gap-2">
            {DAYS.map((day) => {
              const count = SCHEDULE.filter((s) => s.day === day).length
              return (
                <div
                  key={day}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-radius-lg p-3 transition-all duration-200',
                    day === selectedDay
                      ? 'bg-primary-container/15'
                      : 'bg-surface-container-low',
                  )}
                >
                  <span className="text-label-sm text-on-surface-variant">
                    {day.slice(0, 3)}
                  </span>
                  <span className="font-headline text-headline-lg text-on-surface">{count}</span>
                  <span className="text-label-sm text-on-surface-variant">classes</span>
                </div>
              )
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}