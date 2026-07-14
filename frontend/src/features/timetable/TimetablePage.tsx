import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import {
  Clock,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  Calendar,
  List,
  Keyboard,
} from 'lucide-react'
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
  { value: 'theory', label: 'Theory', color: '#2563eb', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  { value: 'lab', label: 'Lab', color: '#7c3aed', bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30' },
  { value: 'tutorial', label: 'Tutorial', color: '#059669', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  { value: 'seminar', label: 'Seminar', color: '#d97706', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
]

const SUBJECT_COLORS = [
  '#059669', '#2563eb', '#d97706', '#7c3aed', '#db2777',
  '#0891b2', '#ca8a04', '#dc2626', '#4f46e5', '#059669'
]

/* ──────────────────────────── Form Modal ─────────────────────── */

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
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const selectRef = useRef<HTMLSelectElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus first input when modal opens
  useEffect(() => {
    if (open && selectRef.current) {
      setTimeout(() => selectRef.current?.focus(), 100)
    }
  }, [open])

  // Reset form when schedule changes
  useEffect(() => {
    if (open) {
      setFormData({
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
      setErrors({})
      setTouched({})
    }
  }, [open, schedule, subjects])

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.subjectId) newErrors.subjectId = 'Please select a subject'
    if (!formData.facultyName?.trim()) newErrors.facultyName = 'Faculty name is required'
    if (!formData.day) newErrors.day = 'Please select a day'
    if (!formData.startTime) newErrors.startTime = 'Start time is required'
    if (!formData.endTime) newErrors.endTime = 'End time is required'
    if (!formData.room?.trim()) newErrors.room = 'Room number is required'
    if (formData.startTime && formData.endTime) {
      if (formData.endTime <= formData.startTime) {
        newErrors.endTime = 'End time must be after start time'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    validate()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ subjectId: true, facultyName: true, day: true, startTime: true, endTime: true, room: true })
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={schedule ? 'Edit Class' : 'Add New Class'}>
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-5">
        {/* Subject */}
        <div className="space-y-2">
          <label htmlFor="subject" className="block text-label-sm font-semibold text-on-surface">
            Subject <span className="text-red-400">*</span>
          </label>
          <select
            ref={selectRef}
            id="subject"
            value={formData.subjectId}
            onChange={(e) => handleSubjectChange(e.target.value)}
            onBlur={() => handleBlur('subjectId')}
            aria-invalid={!!errors.subjectId}
            aria-describedby={errors.subjectId ? 'subject-error' : undefined}
            className={cn(
              'w-full rounded-radius-lg border-2 bg-surface-container-low px-4 py-3 text-body-sm text-on-surface transition-all duration-200',
              'border-outline-variant/30 focus:border-primary-container focus:outline-none focus:ring-4 focus:ring-primary-container/10',
              touched.subjectId && errors.subjectId && 'border-red-500'
            )}
          >
            <option value="">Select a subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name} ({subject.code})
              </option>
            ))}
          </select>
          {touched.subjectId && errors.subjectId && (
            <p id="subject-error" className="text-label-sm text-red-400 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.subjectId}
            </p>
          )}
        </div>

        {/* Faculty Name */}
        <div className="space-y-2">
          <label htmlFor="faculty" className="block text-label-sm font-semibold text-on-surface">
            Faculty Name <span className="text-red-400">*</span>
          </label>
          <input
            ref={inputRef}
            id="faculty"
            type="text"
            value={formData.facultyName}
            onChange={(e) => setFormData({ ...formData, facultyName: e.target.value })}
            onBlur={() => handleBlur('facultyName')}
            placeholder="Dr. John Doe"
            aria-invalid={!!errors.facultyName}
            aria-describedby={errors.facultyName ? 'faculty-error' : undefined}
            className={cn(
              'w-full rounded-radius-lg border-2 bg-surface-container-low px-4 py-3 text-body-sm text-on-surface transition-all duration-200',
              'border-outline-variant/30 focus:border-primary-container focus:outline-none focus:ring-4 focus:ring-primary-container/10',
              touched.facultyName && errors.facultyName && 'border-red-500'
            )}
          />
          {touched.facultyName && errors.facultyName && (
            <p id="faculty-error" className="text-label-sm text-red-400 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.facultyName}
            </p>
          )}
        </div>

        {/* Day and Class Type */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="day" className="block text-label-sm font-semibold text-on-surface">
              Day <span className="text-red-400">*</span>
            </label>
            <select
              id="day"
              value={formData.day}
              onChange={(e) => setFormData({ ...formData, day: e.target.value })}
              onBlur={() => handleBlur('day')}
              aria-invalid={!!errors.day}
              aria-describedby={errors.day ? 'day-error' : undefined}
              className={cn(
                'w-full rounded-radius-lg border-2 bg-surface-container-low px-4 py-3 text-body-sm text-on-surface transition-all duration-200',
                'border-outline-variant/30 focus:border-primary-container focus:outline-none focus:ring-4 focus:ring-primary-container/10',
                touched.day && errors.day && 'border-red-500'
              )}
            >
              {DAYS.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
            {touched.day && errors.day && (
              <p id="day-error" className="text-label-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.day}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="classType" className="block text-label-sm font-semibold text-on-surface">
              Class Type
            </label>
            <select
              id="classType"
              value={formData.classType}
              onChange={(e) => setFormData({ ...formData, classType: e.target.value as any })}
              className="w-full rounded-radius-lg border-2 border-outline-variant/30 bg-surface-container-low px-4 py-3 text-body-sm text-on-surface transition-all duration-200 focus:border-primary-container focus:outline-none focus:ring-4 focus:ring-primary-container/10"
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
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="startTime" className="block text-label-sm font-semibold text-on-surface">
              Start Time <span className="text-red-400">*</span>
            </label>
            <input
              id="startTime"
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              onBlur={() => handleBlur('startTime')}
              aria-invalid={!!errors.startTime}
              aria-describedby={errors.startTime ? 'startTime-error' : undefined}
              className={cn(
                'w-full rounded-radius-lg border-2 bg-surface-container-low px-4 py-3 text-body-sm text-on-surface transition-all duration-200',
                'border-outline-variant/30 focus:border-primary-container focus:outline-none focus:ring-4 focus:ring-primary-container/10',
                touched.startTime && errors.startTime && 'border-red-500'
              )}
            />
            {touched.startTime && errors.startTime && (
              <p id="startTime-error" className="text-label-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.startTime}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="endTime" className="block text-label-sm font-semibold text-on-surface">
              End Time <span className="text-red-400">*</span>
            </label>
            <input
              id="endTime"
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              onBlur={() => handleBlur('endTime')}
              aria-invalid={!!errors.endTime}
              aria-describedby={errors.endTime ? 'endTime-error' : undefined}
              className={cn(
                'w-full rounded-radius-lg border-2 bg-surface-container-low px-4 py-3 text-body-sm text-on-surface transition-all duration-200',
                'border-outline-variant/30 focus:border-primary-container focus:outline-none focus:ring-4 focus:ring-primary-container/10',
                touched.endTime && errors.endTime && 'border-red-500'
              )}
            />
            {touched.endTime && errors.endTime && (
              <p id="endTime-error" className="text-label-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.endTime}
              </p>
            )}
          </div>
        </div>

        {/* Room Number */}
        <div className="space-y-2">
          <label htmlFor="room" className="block text-label-sm font-semibold text-on-surface">
            Room Number <span className="text-red-400">*</span>
          </label>
          <input
            id="room"
            type="text"
            value={formData.room}
            onChange={(e) => setFormData({ ...formData, room: e.target.value })}
            onBlur={() => handleBlur('room')}
            placeholder="Room 101"
            aria-invalid={!!errors.room}
            aria-describedby={errors.room ? 'room-error' : undefined}
            className={cn(
              'w-full rounded-radius-lg border-2 bg-surface-container-low px-4 py-3 text-body-sm text-on-surface transition-all duration-200',
              'border-outline-variant/30 focus:border-primary-container focus:outline-none focus:ring-4 focus:ring-primary-container/10',
              touched.room && errors.room && 'border-red-500'
            )}
          />
          {touched.room && errors.room && (
            <p id="room-error" className="text-label-sm text-red-400 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.room}
            </p>
          )}
        </div>

        {/* Subject Color */}
        <div className="space-y-3">
          <label className="block text-label-sm font-semibold text-on-surface">Subject Color</label>
          <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Select subject color">
            {SUBJECT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, subjectColor: color })}
                aria-label={`Select color ${color}`}
                aria-checked={formData.subjectColor === color}
                role="radio"
                className={cn(
                  'h-12 w-12 rounded-radius-lg border-3 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-container focus:ring-offset-2',
                  formData.subjectColor === color ? 'border-on-surface shadow-lg scale-110' : 'border-transparent'
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label htmlFor="notes" className="block text-label-sm font-semibold text-on-surface">
            Notes <span className="text-on-surface-variant font-normal">(Optional)</span>
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes..."
            rows={3}
            className="w-full rounded-radius-lg border-2 border-outline-variant/30 bg-surface-container-low px-4 py-3 text-body-sm text-on-surface transition-all duration-200 focus:border-primary-container focus:outline-none focus:ring-4 focus:ring-primary-container/10"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading}
            className="flex-1"
            aria-label={schedule ? 'Update class' : 'Add class'}
          >
            {isLoading ? 'Please wait...' : schedule ? 'Update Class' : 'Add Class'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Cancel"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  )
}

/* ──────────────────────────── Delete Dialog ──────────────────── */

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
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open && confirmButtonRef.current) {
      setTimeout(() => confirmButtonRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!schedule) return null

  return (
    <Modal open={open} onClose={onClose} title="Delete Class">
      <div className="space-y-5">
        <div className="flex items-start gap-4 rounded-radius-lg border-2 border-red-500/30 bg-red-500/5 p-5">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-500/10">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <p className="text-body-md font-semibold text-on-surface">Are you sure you want to delete this class?</p>
            <p className="mt-2 text-label-sm text-on-surface-variant">
              {schedule.subjects?.name} - {schedule.day} ({schedule.startTime} - {schedule.endTime})
            </p>
            <p className="mt-1 text-label-sm text-on-surface-variant/70">This action cannot be undone.</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            ref={confirmButtonRef}
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
            aria-label="Cancel deletion"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            loading={isLoading}
            disabled={isLoading}
            className="flex-1 bg-red-500 hover:bg-red-600"
            aria-label="Confirm deletion"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

/* ──────────────────────────── Toast ──────────────────────────── */

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-radius-lg border-2 px-5 py-4 shadow-2xl',
        'animate-in slide-in-from-bottom-5 fade-in',
        type === 'success'
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
          : 'border-red-500/30 bg-red-500/10 text-red-400'
      )}
    >
      {type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
      <span className="text-label-md font-semibold">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 rounded-radius p-1.5 transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

/* ──────────────────────────── Loading Skeleton ───────────────── */

function LoadingSkeleton() {
  return (
    <div className="space-y-6 pb-8" aria-label="Loading timetable">
      <div className="animate-pulse space-y-4">
        <div className="h-10 w-64 rounded-lg bg-surface-container-high" />
        <div className="h-14 rounded-radius-lg bg-surface-container-high" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-radius-lg bg-surface-container-high" />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────── Empty State ────────────────────── */

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-container/10">
        <Calendar className="h-10 w-10 text-primary-container/50" />
      </div>
      <h3 className="mt-6 font-headline text-headline-md text-on-surface">No classes scheduled</h3>
      <p className="mt-2 text-body-md text-on-surface-variant text-center max-w-md">
        Start building your weekly schedule by adding your first class
      </p>
      <Button onClick={onAdd} icon={<Plus className="h-4 w-4" />} className="mt-6">
        Add Your First Class
      </Button>
    </div>
  )
}

/* ──────────────────────────── Error State ────────────────────── */

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex h-96 items-center justify-center">
      <div className="text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 mx-auto">
          <AlertCircle className="h-8 w-8 text-red-400" />
        </div>
        <h3 className="mt-4 text-body-md text-on-surface font-medium">Failed to load timetable</h3>
        <p className="mt-2 text-label-sm text-on-surface-variant">Please check your connection and try again</p>
        <Button onClick={onRetry} className="mt-4">
          <Keyboard className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    </div>
  )
}

/* ──────────────────────────── Main Page ──────────────────────── */

export default function TimetablePage() {
  const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay() - 1] || DAYS[0])
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week')
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

  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' })

  const daySchedule = useMemo(
    () =>
      (schedulesQuery.data ?? [])
        .filter((s) => s.day === selectedDay)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [schedulesQuery.data, selectedDay]
  )

  const getClassStatus = (schedule: Schedule) => {
    if (schedule.day !== currentDay) return 'upcoming'
    if (schedule.startTime <= currentTime && schedule.endTime > currentTime) return 'current'
    if (schedule.endTime <= currentTime) return 'completed'
    return 'upcoming'
  }

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type })
  }, [])

  const handleAdd = useCallback(() => {
    setSelectedSchedule(null)
    setIsModalOpen(true)
  }, [])

  const handleEdit = useCallback((schedule: Schedule) => {
    setSelectedSchedule(schedule)
    setIsModalOpen(true)
  }, [])

  const handleDelete = useCallback((schedule: Schedule) => {
    setSelectedSchedule(schedule)
    setIsDeleteDialogOpen(true)
  }, [])

  const handleSubmit = useCallback(
    async (data: Partial<Schedule>) => {
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
        showToast(error.message || 'An error occurred. Please try again.', 'error')
      }
    },
    [selectedSchedule, updateMutation, createMutation, showToast]
  )

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedSchedule) return
    try {
      await deleteMutation.mutateAsync(selectedSchedule.id)
      showToast('Class deleted successfully', 'success')
      setIsDeleteDialogOpen(false)
      setSelectedSchedule(null)
    } catch (error: any) {
      showToast(error.message || 'Failed to delete class. Please try again.', 'error')
    }
  }, [selectedSchedule, deleteMutation, showToast])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'n' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        handleAdd()
      }
    },
    [handleAdd]
  )

  const isLoading = schedulesQuery.isLoading || subjectsQuery.isLoading
  const isSubmitting = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown as any)
    return () => window.removeEventListener('keydown', handleKeyDown as any)
  }, [handleKeyDown])

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (schedulesQuery.error) {
    return <ErrorState onRetry={() => schedulesQuery.refetch()} />
  }

  const hasNoClasses = !schedulesQuery.data || schedulesQuery.data.length === 0

  return (
    <div className="space-y-6 pb-8" onKeyDown={handleKeyDown}>
      {/* Header */}
      <div className="animate-fade-in-up">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-headline text-headline-lg text-on-surface">Timetable</h1>
            <p className="mt-1 text-body-md text-on-surface-variant">Your weekly academic schedule</p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center gap-1 rounded-radius-lg border-2 border-outline-variant/20 bg-surface-container-low p-1">
              <button
                onClick={() => setViewMode('week')}
                aria-pressed={viewMode === 'week'}
                className={cn(
                  'rounded-radius-md px-3 py-2 text-label-sm font-medium transition-all duration-200',
                  viewMode === 'week'
                    ? 'gradient-gold text-on-primary shadow-lg'
                    : 'text-on-surface-variant hover:text-on-surface'
                )}
              >
                <Calendar className="inline h-4 w-4 mr-1.5" aria-hidden="true" />
                Week
              </button>
              <button
                onClick={() => setViewMode('day')}
                aria-pressed={viewMode === 'day'}
                className={cn(
                  'rounded-radius-md px-3 py-2 text-label-sm font-medium transition-all duration-200',
                  viewMode === 'day'
                    ? 'gradient-gold text-on-primary shadow-lg'
                    : 'text-on-surface-variant hover:text-on-surface'
                )}
              >
                <List className="inline h-4 w-4 mr-1.5" aria-hidden="true" />
                Day
              </button>
            </div>
            <Button
              onClick={handleAdd}
              icon={<Plus className="h-4 w-4" />}
              aria-label="Add new class"
            >
              Add Class
            </Button>
          </div>
        </div>
        <p className="mt-2 text-label-sm text-on-surface-variant">
          Press <kbd className="px-2 py-1 rounded-radius bg-surface-container-high border border-outline-variant/30 font-mono text-xs">Ctrl</kbd> + <kbd className="px-2 py-1 rounded-radius bg-surface-container-high border border-outline-variant/30 font-mono text-xs">N</kbd> to add class
        </p>
      </div>

      {/* Empty State */}
      {hasNoClasses && !isLoading && (
        <EmptyState onAdd={handleAdd} />
      )}

      {/* Day Selector - Only show in day view */}
      {viewMode === 'day' && !hasNoClasses && (
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin" role="tablist" aria-label="Select day">
            {DAYS.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                role="tab"
                aria-selected={selectedDay === day}
                aria-label={`${day} - ${(schedulesQuery.data ?? []).filter((s) => s.day === day).length} classes`}
                className={cn(
                  'flex-shrink-0 rounded-radius-lg px-5 py-3 text-label-md font-medium transition-all duration-200',
                  selectedDay === day
                    ? 'gradient-gold text-on-primary shadow-lg glow-gold'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface hover:shadow-md'
                )}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Grid View */}
      {viewMode === 'week' && !hasNoClasses && (
        <div className="animate-fade-in-up">
          <Card variant="glass" className="overflow-hidden p-0">
            {/* Grid Header */}
            <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b-2 border-outline-variant/20 bg-surface-container-low/50">
              <div className="p-4 text-center text-label-sm font-semibold text-on-surface-variant">Time</div>
              {DAYS.map((day) => (
                <div
                  key={day}
                  className={cn(
                    'p-4 text-center text-label-sm font-semibold transition-colors',
                    day === currentDay ? 'text-primary-container' : 'text-on-surface-variant'
                  )}
                >
                  {day.slice(0, 3)}
                  {day === currentDay && (
                    <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-primary-container animate-pulse" aria-label="Today" />
                  )}
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
                  <div className="flex items-center justify-center p-3 text-label-sm font-medium text-on-surface-variant">
                    {time}
                  </div>
                  {DAYS.map((day) => {
                    const slot = schedulesQuery.data?.find(
                      (s) => s.day === day && s.startTime <= time && s.endTime > time
                    )
                    if (!slot) return <div key={`${day}-${time}`} className="p-2" />
                    const subject = getSubject(slot.subjectId)
                    const isFirst = slot.startTime === time
                    if (!isFirst) return <div key={`${day}-${time}`} className="p-2" />
                    const classTypeInfo = CLASS_TYPES.find((t) => t.value === slot.classType)
                    const classStatus = getClassStatus(slot)

                    const statusStyles = {
                      current: 'ring-2 ring-primary-container/50 shadow-lg',
                      upcoming: '',
                      completed: 'opacity-60',
                    }

                    return (
                      <div
                        key={slot.id}
                        className={cn(
                          'm-1.5 rounded-radius-lg p-3 transition-all duration-300 cursor-pointer group relative',
                          'hover:scale-[1.03] hover:shadow-xl',
                          statusStyles[classStatus as keyof typeof statusStyles]
                        )}
                        style={{
                          backgroundColor: `${slot.subjectColor || subject?.color || '#666'}15`,
                          borderLeft: `3px solid ${slot.subjectColor || subject?.color || '#666'}`,
                        }}
                        onClick={() => handleEdit(slot)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            handleEdit(slot)
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`${subject?.name || 'Unknown'} - ${slot.startTime} to ${slot.endTime} in ${slot.room}`}
                      >
                        {/* Current Class Indicator */}
                        {classStatus === 'current' && (
                          <div className="absolute -left-1 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-primary-container animate-pulse-glow" aria-label="Current class" />
                        )}

                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-body-sm font-semibold text-on-surface truncate">
                              {subject?.name || 'Unknown'}
                            </p>
                            <p className="mt-1 text-label-sm text-on-surface-variant">
                              {slot.startTime} – {slot.endTime}
                            </p>
                            <p className="text-label-sm text-on-surface-variant truncate">{slot.room}</p>
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
                              className="rounded-radius p-1.5 hover:bg-surface-container-high transition-colors"
                              aria-label={`Edit ${subject?.name || 'class'}`}
                            >
                              <Edit2 className="h-3.5 w-3.5 text-on-surface-variant" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(slot)
                              }}
                              className="rounded-radius p-1.5 hover:bg-surface-container-high transition-colors"
                              aria-label={`Delete ${subject?.name || 'class'}`}
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
                            style={{
                              backgroundColor: `${classTypeInfo.color}20`,
                              color: classTypeInfo.color,
                            }}
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
      )}

      {/* Daily List View */}
      {viewMode === 'day' && !hasNoClasses && (
        <div className="animate-fade-in-up">
          <Card variant="glass" className="p-6">
            {daySchedule.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-16">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high">
                  <Clock className="h-8 w-8 text-on-surface-variant/30" />
                </div>
                <div className="text-center">
                  <h3 className="font-headline text-headline-md text-on-surface">No classes scheduled</h3>
                  <p className="mt-2 text-body-md text-on-surface-variant">Enjoy your day off!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3" role="list" aria-label={`Classes for ${selectedDay}`}>
                {daySchedule.map((s, i) => {
                  const subject = getSubject(s.subjectId)
                  const classTypeInfo = CLASS_TYPES.find((t) => t.value === s.classType)
                  const classStatus = getClassStatus(s)

                  const statusStyles = {
                    current: 'border-primary-container/40 bg-primary-container/5 shadow-lg',
                    upcoming: 'border-outline-variant/10 bg-surface-container-low hover:border-outline-variant/30 hover:shadow-md',
                    completed: 'border-outline-variant/10 bg-surface-container-low opacity-50',
                  }

                  return (
                    <div
                      key={s.id}
                      className={cn(
                        'flex items-start gap-5 rounded-radius-lg border-2 p-5 transition-all duration-300',
                        'hover:scale-[1.01] animate-fade-in-up',
                        statusStyles[classStatus as keyof typeof statusStyles]
                      )}
                      style={{ animationDelay: `${i * 50}ms` }}
                      role="listitem"
                    >
                      {/* Time Column */}
                      <div className="flex flex-col items-center gap-1.5 min-w-[70px]">
                        <span className="text-label-md font-bold text-on-surface">{s.startTime}</span>
                        <div className="w-px h-4 bg-outline-variant/30" />
                        <span className="text-label-sm text-on-surface-variant">{s.endTime}</span>
                      </div>

                      {/* Divider */}
                      <div
                        className="w-1 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: s.subjectColor || subject?.color || '#666' }}
                        aria-hidden="true"
                      />

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-body-md font-semibold text-on-surface">
                                {subject?.name || 'Unknown'}
                              </h3>
                              {classStatus === 'current' && (
                                <Badge variant="info" size="sm" className="animate-pulse">
                                  Now
                                </Badge>
                              )}
                              {classStatus === 'completed' && (
                                <Badge variant="neutral" size="sm">
                                  Done
                                </Badge>
                              )}
                            </div>
                            {s.facultyName && (
                              <p className="text-label-sm text-on-surface-variant mb-2">{s.facultyName}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-4 text-label-sm text-on-surface-variant mb-3">
                              <span className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" />
                                {s.room}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                {s.startTime} – {s.endTime}
                              </span>
                            </div>
                            {classTypeInfo && (
                              <Badge
                                variant="neutral"
                                size="sm"
                                className={cn('font-medium', classTypeInfo.bg, classTypeInfo.text, classTypeInfo.border)}
                              >
                                {classTypeInfo.label}
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEdit(s)}
                              className="rounded-radius-lg p-2.5 transition-all duration-200 hover:bg-surface-container-high hover:scale-110"
                              aria-label={`Edit ${subject?.name || 'class'}`}
                            >
                              <Edit2 className="h-4 w-4 text-on-surface-variant" />
                            </button>
                            <button
                              onClick={() => handleDelete(s)}
                              className="rounded-radius-lg p-2.5 transition-all duration-200 hover:bg-surface-container-high hover:scale-110"
                              aria-label={`Delete ${subject?.name || 'class'}`}
                            >
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                        {s.notes && (
                          <div className="mt-3 rounded-radius-lg bg-surface-container-high/50 p-3">
                            <p className="text-label-sm text-on-surface-variant italic">{s.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Weekly Overview - Only show in day view */}
      {viewMode === 'day' && !hasNoClasses && (
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <GlassCard className="p-6">
            <h3 className="mb-4 font-headline text-headline-md text-on-surface">Weekly Overview</h3>
            <div className="grid grid-cols-7 gap-3">
              {DAYS.map((day) => {
                const count = (schedulesQuery.data ?? []).filter((s) => s.day === day).length
                const isToday = day === currentDay
                return (
                  <button
                    key={day}
                    onClick={() => {
                      setSelectedDay(day)
                      setViewMode('day')
                    }}
                    aria-label={`${day} - ${count} classes`}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-radius-lg p-4 transition-all duration-200',
                      'hover:scale-105 hover:shadow-lg',
                      isToday ? 'bg-primary-container/15 border-2 border-primary-container/30' : 'bg-surface-container-low border-2 border-transparent'
                    )}
                  >
                    <span className={cn('text-label-sm font-medium', isToday ? 'text-primary-container' : 'text-on-surface-variant')}>
                      {day.slice(0, 3)}
                    </span>
                    <span className={cn('font-headline text-headline-lg', isToday ? 'text-primary-container' : 'text-on-surface')}>
                      {count}
                    </span>
                    <span className="text-label-sm text-on-surface-variant">classes</span>
                  </button>
                )
              })}
            </div>
          </GlassCard>
        </div>
      )}

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