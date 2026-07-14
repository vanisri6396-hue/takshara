import { useState, useMemo, useEffect } from 'react'
import { Clock, MapPin, Plus, Edit2, Trash2, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useSchedules, useCreateSchedule, useUpdateSchedule, useDeleteSchedule } from '@/hooks/useSchedules'
import { useSubjects } from '@/hooks/useSubjects'
import { cn } from '@/lib/utils'
import type { Schedule } from '@/types/design-system'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
const CLASS_TYPES = [
  { value: 'theory', label: 'Theory', color: '#2563eb' },
  { value: 'lab', label: 'Lab', color: '#7c3aed' },
  { value: 'tutorial', label: 'Tutorial', color: '#059669' },
  { value: 'seminar', label: 'Seminar', color: '#d97706' },
]

const SUBJECT_COLORS = [
  '#059669', '#2563eb', '#d97706', '#7c3aed', '#db2777',
  '#0891b2', '#ca8a04', '#dc2626', '#059669', '#4f46e5'
]

function ScheduleFormModal({
  open,
  onClose,
  schedule,
  subjects,
  onSubmit,
  isLoading,
}: {
  open: boolean
  onClose: () => void
  schedule?: Schedule | null
  subjects: any[]
  onSubmit: (data: Partial<Schedule>) => void
  isLoading: boolean
}) {
  const [formData, setFormData] = useState<Partial<Schedule>>({
    subjectId: schedule?.subjectId || subjects[0]?.id || '',
    facultyName: schedule?.facultyName || '',
    day: schedule?.day || DAYS[new Date().getDay() - 1] || DAYS[0],
    startTime: schedule?.startTime || '09:00',
    endTime: schedule?.endTime || '10:00',
    room: schedule?.room || '',
    classType: schedule?.classType || 'theory',
    notes: schedule?.notes || '',
    subjectColor: schedule?.subjectColor || subjects[0]?.color || SUBJECT_COLORS[0],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.subjectId) newErrors.subjectId = 'Subject is required'
    if (!formData.facultyName?.trim()) newErrors.facultyName = 'Faculty name is required'
    if (!formData.day) newErrors.day = 'Day is required'
    if (!formData.startTime) newErrors.startTime = 'Start time is required'
    if (!formData.endTime) newErrors.endTime = 'End time is required'
    if (!formData.room?.trim()) newErrors.room = 'Room number is required'
    if (formData.startTime && formData.endTime && formData.endTime <= formData.startTime) {
      newErrors.endTime = 'End time must be after start time'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(formData)
    }
  }

  const handleSubjectChange = (subjectId: string) => {
    const subject = subjects.find((s) => s.id === subjectId)
    setFormData({
      ...formData,
      subjectId,
      subjectColor: subject?.color || SUBJECT_COLORS[0],
    })
  }

  return (
    <Modal open={open} onClose={onClose} title={schedule ? 'Edit Class' : 'Add New Class'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Subject */}
        <div>
          <label className="mb-1.5 block text-label-sm font-medium text-on-surface">Subject</label>
          <select
            value={formData.subjectId}
            onChange={(e) => handleSubjectChange(e.target.value)}
            className={cn(
              'w-full rounded-radius-lg border bg-surface-container-low px-3 py-2.5 text-body-sm text-on-surface',
              'border-outline-variant/30 focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/20',
              errors.subjectId && 'border-red-500'
            )}
          >
            <option value="">Select subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name} ({subject.code})
              </option>
            ))}
          </select>
          {errors.subjectId && <p className="mt-1 text-label-sm text-red-400">{errors.subjectId}</p>}
        </div>

        {/* Faculty Name */}
        <div>
          <label className="mb-1.5 block text-label-sm font-medium text-on-surface">Faculty Name</label>
          <input
            type="text"
            value={formData.facultyName}
            onChange={(e) => setFormData({ ...formData, facultyName: e.target.value })}
            placeholder="Dr. John Doe"
            className={cn(
              'w-full rounded-radius-lg border bg-surface-container-low px-3 py-2.5 text-body-sm text-on-surface',
              'border-outline-variant/30 focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/20',
              errors.facultyName && 'border-red-500'
            )}
          />
          {errors.facultyName && <p className="mt-1 text-label-sm text-red-400">{errors.facultyName}</p>}
        </div>

        {/* Day and Class Type */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-label-sm font-medium text-on-surface">Day</label>
            <select
              value={formData.day}
              onChange={(e) => setFormData({ ...formData, day: e.target.value })}
              className={cn(
                'w-full rounded-radius-lg border bg-surface-container-low px-3 py-2.5 text-body-sm text-on-surface',
                'border-outline-variant/30 focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/20',
                errors.day && 'border-red-500'
              )}
            >
              {DAYS.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
            {errors.day && <p className="mt-1 text-label-sm text-red-400">{errors.day}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-label-sm font-medium text-on-surface">Class Type</label>
            <select
              value={formData.classType}
              onChange={(e) => setFormData({ ...formData, classType: e.target.value as any })}
              className="w-full rounded-radius-lg border border-outline-variant/30 bg-surface-container-low px-3 py-2.5 text-body-sm text-on-surface focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/20"
            >
              {CLASS_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Time Range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-label-sm font-medium text-on-surface">Start Time</label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className={cn(
                'w-full rounded-radius-lg border bg-surface-container-low px-3 py-2.5 text-body-sm text-on-surface',
                'border-outline-variant/30 focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/20',
                errors.startTime && 'border-red-500'
              )}
            />
            {errors.startTime && <p className="mt-1 text-label-sm text-red-400">{errors.startTime}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-label-sm font-medium text-on-surface">End Time</label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className={cn(
                'w-full rounded-radius-lg border bg-surface-container-low px-3 py-2.5 text-body-sm text-on-surface',
                'border-outline-variant/30 focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/20',
                errors.endTime && 'border-red-500'
              )}
            />
            {errors.endTime && <p className="mt-1 text-label-sm text-red-400">{errors.endTime}</p>}
          </div>
        </div>

        {/* Room Number */}
        <div>
          <label className="mb-1.5 block text-label-sm font-medium text-on-surface">Room Number</label>
          <input
            type="text"
            value={formData.room}
            onChange={(e) => setFormData({ ...formData, room: e.target.value })}
            placeholder="Room 101"
            className={cn(
              'w-full rounded-radius-lg border bg-surface-container-low px-3 py-2.5 text-body-sm text-on-surface',
              'border-outline-variant/30 focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/20',
              errors.room && 'border-red-500'
            )}
          />
          {errors.room && <p className="mt-1 text-label-sm text-red-400">{errors.room}</p>}
        </div>

        {/* Subject Color */}
        <div>
          <label className="mb-1.5 block text-label-sm font-medium text-on-surface">Subject Color</label>
          <div className="flex gap-2">
            {SUBJECT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, subjectColor: color })}
                className={cn(
                  'h-10 w-10 rounded-radius-lg border-2 transition-all duration-200',
                  formData.subjectColor === color ? 'border-on-surface scale-110' : 'border-transparent'
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="mb-1.5 block text-label-sm font-medium text-on-surface">Notes (Optional)</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes..."
            rows={3}
            className="w-full rounded-radius-lg border border-outline-variant/30 bg-surface-container-low px-3 py-2.5 text-body-sm text-on-surface focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/20"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button type="submit" loading={isLoading} className="flex-1">
            {schedule ? 'Update' : 'Add'} Class
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  schedule,
  isLoading,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  schedule: Schedule | null
  isLoading: boolean
}) {
  if (!schedule) return null

  return (
    <Modal open={open} onClose={onClose} title="Delete Class">
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-radius-lg border border-red-500/20 bg-red-500/5 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
          <div>
            <p className="text-body-sm font-medium text-on-surface">Are you sure you want to delete this class?</p>
            <p className="mt-1 text-label-sm text-on-surface-variant">
              {schedule.subjects?.name} - {schedule.day} ({schedule.startTime} - {schedule.endTime})
            </p>
            <p className="mt-1 text-label-sm text-on-surface-variant">This action cannot be undone.</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isLoading} className="flex-1">
            Cancel
          </Button>
          <Button onClick={onConfirm} loading={isLoading} className="flex-1 bg-red-500 hover:bg-red-600">
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-radius-lg px-4 py-3 shadow-lg',
        'animate-in slide-in-from-bottom-5 fade-in',
        type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
      )}
    >
      {type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
      <span className="text-label-md font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 rounded-radius p-1 hover:bg-white/20">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export default function TimetablePage() {
  const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay() - 1] || DAYS[0])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const schedulesQuery = useSchedules()
  const subjectsQuery = useSubjects()
  const createMutation = useCreateSchedule()
  const updateMutation = useUpdateSchedule()
  const deleteMutation = useDeleteSchedule()

  const subjectMap = useMemo(() => new Map(subjectsQuery.data?.map((s) => [s.id, s]) ?? []), [subjectsQuery.data])
  const getSubject = (id: string) => subjectMap.get(id)

  const daySchedule = useMemo(
    () =>
      (schedulesQuery.data ?? [])
        .filter((s) => s.day === selectedDay)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [schedulesQuery.data, selectedDay]
  )

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
  }

  const handleAdd = () => {
    setSelectedSchedule(null)
    setIsModalOpen(true)
  }

  const handleEdit = (schedule: Schedule) => {
    setSelectedSchedule(schedule)
    setIsModalOpen(true)
  }

  const handleDelete = (schedule: Schedule) => {
    setSelectedSchedule(schedule)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmit = async (data: Partial<Schedule>) => {
    try {
      if (selectedSchedule) {
        await updateMutation.mutateAsync({ id: selectedSchedule.id, ...data })
        showToast('Class updated successfully', 'success')
      } else {
        await createMutation.mutateAsync(data as Omit<Schedule, 'id'>)
        showToast('Class added successfully', 'success')
      }
      setIsModalOpen(false)
    } catch (error: any) {
      showToast(error.message || 'An error occurred', 'error')
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedSchedule) return
    try {
      await deleteMutation.mutateAsync(selectedSchedule.id)
      showToast('Class deleted successfully', 'success')
      setIsDeleteDialogOpen(false)
      setSelectedSchedule(null)
    } catch (error: any) {
      showToast(error.message || 'Failed to delete class', 'error')
    }
  }

  const isLoading = schedulesQuery.isLoading || subjectsQuery.isLoading
  const isSubmitting = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  if (isLoading) {
    return (
      <div className="space-y-6 pb-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-surface-container-high" />
          <div className="h-12 rounded-radius-lg bg-surface-container-high" />
          <div className="h-96 rounded-radius-lg bg-surface-container-high" />
        </div>
      </div>
    )
  }

  if (schedulesQuery.error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <p className="mt-3 text-body-md text-on-surface">Failed to load timetable</p>
          <Button onClick={() => schedulesQuery.refetch()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline text-headline-lg text-on-surface">Timetable</h1>
            <p className="mt-1 text-body-md text-on-surface-variant">Your weekly academic schedule</p>
          </div>
          <Button onClick={handleAdd} icon={<Plus className="h-4 w-4" />}>
            Add Class
          </Button>
        </div>
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
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
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
          <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-outline-variant/20">
            <div className="p-3 text-center text-label-sm text-on-surface-variant">Time</div>
            {DAYS.map((day) => (
              <div
                key={day}
                className={cn(
                  'p-3 text-center text-label-sm font-medium',
                  day === selectedDay ? 'text-primary-container' : 'text-on-surface-variant'
                )}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grid Body */}
          <div className="relative">
            {TIME_SLOTS.map((time) => (
              <div
                key={time}
                className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-outline-variant/10 last:border-b-0"
              >
                <div className="flex items-center justify-center p-2 text-label-sm text-on-surface-variant">{time}</div>
                {DAYS.map((day) => {
                  const slot = schedulesQuery.data?.find(
                    (s) => s.day === day && s.startTime <= time && s.endTime > time
                  )
                  if (!slot) return <div key={`${day}-${time}`} className="p-2" />
                  const subject = getSubject(slot.subjectId)
                  const isFirst = slot.startTime === time
                  if (!isFirst) return <div key={`${day}-${time}`} className="p-2" />
                  const classTypeInfo = CLASS_TYPES.find((t) => t.value === slot.classType)
                  return (
                    <div
                      key={slot.id}
                      className="m-1 rounded-radius-lg p-3 transition-all duration-200 hover:scale-[1.02] cursor-pointer group relative"
                      style={{
                        backgroundColor: `${slot.subjectColor || subject?.color || '#666'}18`,
                        borderLeft: `3px solid ${slot.subjectColor || subject?.color || '#666'}`,
                      }}
                      onClick={() => handleEdit(slot)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-body-sm font-medium text-on-surface truncate">
                            {subject?.name || 'Unknown'}
                          </p>
                          <p className="mt-0.5 text-label-sm text-on-surface-variant">
                            {slot.startTime} – {slot.endTime}
                          </p>
                          <p className="text-label-sm text-on-surface-variant">{slot.room}</p>
                          {slot.facultyName && (
                            <p className="text-label-sm text-on-surface-variant truncate">{slot.facultyName}</p>
                          )}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEdit(slot)
                            }}
                            className="rounded-radius p-1 hover:bg-surface-container-high"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-on-surface-variant" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(slot)
                            }}
                            className="rounded-radius p-1 hover:bg-surface-container-high"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-400" />
                          </button>
                        </div>
                      </div>
                      {classTypeInfo && (
                        <Badge
                          variant="neutral"
                          size="sm"
                          className="mt-2"
                          style={{ backgroundColor: `${classTypeInfo.color}20`, color: classTypeInfo.color }}
                        >
                          {classTypeInfo.label}
                        </Badge>
                      )}
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
                const classTypeInfo = CLASS_TYPES.find((t) => t.value === s.classType)
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
                      style={{ backgroundColor: s.subjectColor || subject?.color || '#666' }}
                    />

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-body-md font-medium text-on-surface">
                            {subject?.name || 'Unknown'}
                          </p>
                          {s.facultyName && (
                            <p className="text-label-sm text-on-surface-variant">{s.facultyName}</p>
                          )}
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
                          {classTypeInfo && (
                            <Badge
                              variant="neutral"
                              size="sm"
                              className="mt-2"
                              style={{
                                backgroundColor: `${classTypeInfo.color}20`,
                                color: classTypeInfo.color,
                              }}
                            >
                              {classTypeInfo.label}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(s)}
                            className="rounded-radius p-2 hover:bg-surface-container-high"
                          >
                            <Edit2 className="h-4 w-4 text-on-surface-variant" />
                          </button>
                          <button
                            onClick={() => handleDelete(s)}
                            className="rounded-radius p-2 hover:bg-surface-container-high"
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                      {s.notes && <p className="mt-2 text-label-sm text-on-surface-variant">{s.notes}</p>}
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
          <div className="grid grid-cols-7 gap-2">
            {DAYS.map((day) => {
              const count = (schedulesQuery.data ?? []).filter((s) => s.day === day).length
              return (
                <div
                  key={day}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-radius-lg p-3 transition-all duration-200',
                    day === selectedDay ? 'bg-primary-container/15' : 'bg-surface-container-low'
                  )}
                >
                  <span className="text-label-sm text-on-surface-variant">{day.slice(0, 3)}</span>
                  <span className="font-headline text-headline-lg text-on-surface">{count}</span>
                  <span className="text-label-sm text-on-surface-variant">classes</span>
                </div>
              )
            })}
          </div>
        </GlassCard>
      </div>

      {/* Add/Edit Modal */}
      <ScheduleFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        schedule={selectedSchedule}
        subjects={subjectsQuery.data ?? []}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setSelectedSchedule(null)
        }}
        onConfirm={handleConfirmDelete}
        schedule={selectedSchedule}
        isLoading={deleteMutation.isPending}
      />

      {/* Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}