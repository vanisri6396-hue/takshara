import { useState } from 'react'
import {
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { SubjectChip } from '@/components/shared/SubjectChip'
import { useExams, useCreateExam, useUpdateExam, useDeleteExam } from '@/hooks/useExams'
import { useSubjects } from '@/hooks/useSubjects'
import { toast } from 'react-hot-toast'
import { cn, formatDate } from '@/lib/utils'
import type { Exam } from '@/types/design-system'

const TABS: { label: string; value: Exam['status'] | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

const DIALOG_TITLE = 'Exam'

export default function ExamsPage() {
  const [activeTab, setActiveTab] = useState<Exam['status'] | 'all'>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null)

  // Create form state
  const [formData, setFormData] = useState({
    title: '',
    subjectId: '',
    date: '',
    time: '09:00',
    duration: '1 hour',
    room: '',
    syllabus: '',
    maxMarks: 100,
    status: 'upcoming' as Exam['status'],
  })

  const examsQuery = useExams()
  const subjectsQuery = useSubjects()
  const createMutation = useCreateExam()
  const updateMutation = useUpdateExam()
  const deleteMutation = useDeleteExam()

  const subjectMap = new Map(subjectsQuery.data?.map((s) => [s.id, s]) ?? [])

  const filteredExams =
    activeTab === 'all'
      ? examsQuery.data ?? []
      : (examsQuery.data ?? []).filter((e) => e.status === activeTab)

  const statusBadge = (status: Exam['status']) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="info" size="sm">Upcoming</Badge>
      case 'completed':
        return <Badge variant="success" size="sm">Completed</Badge>
      case 'cancelled':
        return <Badge variant="error" size="sm">Cancelled</Badge>
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      subjectId: '',
      date: '',
      time: '09:00',
      duration: '1 hour',
      room: '',
      syllabus: '',
      maxMarks: 100,
      status: 'upcoming',
    })
    setEditingExam(null)
    setShowCreate(false)
  }

  const openEdit = (exam: Exam) => {
    setFormData({
      title: exam.title,
      subjectId: exam.subjectId,
      date: exam.date,
      time: exam.time,
      duration: exam.duration,
      room: exam.room,
      syllabus: exam.syllabus,
      maxMarks: exam.maxMarks,
      status: exam.status,
    })
    setEditingExam(exam)
    setShowCreate(true)
  }

  const handleSave = async () => {
    if (!formData.title || !formData.subjectId || !formData.date) {
      toast.error('Please fill in title, subject, and date')
      return
    }

    try {
      if (editingExam) {
        await updateMutation.mutateAsync({ id: editingExam.id, ...formData })
        toast.success('Exam updated')
      } else {
        await createMutation.mutateAsync(formData)
        toast.success('Exam created')
      }
      resetForm()
    } catch {
      toast.error('Failed to save exam')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Exam deleted')
      setShowDeleteId(null)
    } catch {
      toast.error('Failed to delete exam')
    }
  }

  const isLoading = examsQuery.isLoading || subjectsQuery.isLoading

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-container border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in-up">
        <div>
          <h1 className="font-headline text-headline-lg text-on-surface">Exams</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">Track and manage your exams</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-radius-lg gradient-gold px-4 py-2.5 text-label-md font-bold text-on-primary transition-all duration-200 hover:opacity-90 glow-gold"
        >
          <Plus className="h-4 w-4" />
          New Exam
        </button>
      </div>

      {/* Stats */}
      <div className="animate-fade-in-up">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-radius bg-blue-500/15 text-blue-400">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant">Upcoming</p>
                <p className="font-headline text-headline-md text-on-surface">
                  {(examsQuery.data ?? []).filter((e) => e.status === 'upcoming').length}
                </p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-radius bg-emerald-500/15 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant">Completed</p>
                <p className="font-headline text-headline-md text-on-surface">
                  {(examsQuery.data ?? []).filter((e) => e.status === 'completed').length}
                </p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-radius bg-primary-container/15 text-primary-container">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant">Total</p>
                <p className="font-headline text-headline-md text-on-surface">
                  {examsQuery.data?.length ?? 0}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin animate-fade-in-up">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'flex-shrink-0 rounded-radius-lg px-4 py-2 text-label-md transition-all duration-200',
              activeTab === tab.value
                ? 'gradient-gold text-on-primary font-bold glow-gold'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Exams List */}
      <div className="space-y-3 animate-fade-in-up">
        {filteredExams.length === 0 ? (
          <Card variant="glass" className="p-10">
            <div className="flex flex-col items-center gap-3">
              <BookOpen className="h-12 w-12 text-on-surface-variant/30" />
              <p className="text-body-lg text-on-surface-variant">No exams found</p>
              <p className="text-label-sm text-on-surface-variant/50">
                {activeTab === 'all' ? 'Create your first exam to get started' : `No ${activeTab} exams`}
              </p>
            </div>
          </Card>
        ) : (
          filteredExams.map((exam, i) => {
            const subject = subjectMap.get(exam.subjectId)
            const daysUntil = Math.ceil((new Date(exam.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            const isUrgent = exam.status === 'upcoming' && daysUntil <= 3
            return (
              <div
                key={exam.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <Card
                  variant="glass"
                  className={cn(
                    'overflow-hidden p-0 transition-all duration-200 hover:scale-[1.01]',
                    isUrgent && 'border-red-500/30',
                  )}
                >
                  <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6">
                    {/* Status */}
                    <div
                      className={cn(
                        'flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-2',
                        exam.status === 'upcoming'
                          ? 'border-blue-500/30 bg-blue-500/10'
                          : exam.status === 'completed'
                            ? 'border-emerald-500/30 bg-emerald-500/10'
                            : 'border-red-500/30 bg-red-500/10',
                      )}
                    >
                      <span
                        className={cn(
                          'font-headline text-headline-md',
                          exam.status === 'upcoming'
                            ? 'text-blue-400'
                            : exam.status === 'completed'
                              ? 'text-emerald-400'
                              : 'text-red-400',
                        )}
                      >
                        {exam.maxMarks}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-body-lg font-medium text-on-surface">{exam.title}</h3>
                        {statusBadge(exam.status)}
                        {isUrgent && <Badge variant="error" size="sm">Urgent</Badge>}
                      </div>
                      {exam.syllabus && (
                        <p className="mt-1 text-body-md text-on-surface-variant line-clamp-2">{exam.syllabus}</p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-label-sm text-on-surface-variant">
                        <SubjectChip label={subject?.name || 'Unknown'} color={subject?.color} size="sm" />
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(exam.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {exam.time} ({exam.duration})
                        </span>
                        {exam.room && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {exam.room}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-shrink-0 items-center gap-2">
                      {exam.status === 'upcoming' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateMutation.mutate({ id: exam.id, status: 'completed' })}
                        >
                          Mark Done
                        </Button>
                      )}
                      <button
                        onClick={() => openEdit(exam)}
                        className="rounded-radius p-2 text-on-surface-variant transition-colors hover:text-primary-container"
                        aria-label="Edit exam"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteId(exam.id)}
                        className="rounded-radius p-2 text-on-surface-variant transition-colors hover:text-red-400"
                        aria-label="Delete exam"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </Card>

                {/* Delete Confirmation */}
                {showDeleteId === exam.id && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <Card variant="glass" className="w-full max-w-md p-6">
                      <h3 className="font-headline text-headline-md text-on-surface">Delete Exam</h3>
                      <p className="mt-2 text-body-md text-on-surface-variant">
                        Are you sure you want to delete "{exam.title}"? This action cannot be undone.
                      </p>
                      <div className="mt-4 flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setShowDeleteId(null)}>Cancel</Button>
                        <Button variant="ghost" onClick={() => handleDelete(exam.id)}>Delete</Button>
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card variant="glass" className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h3 className="font-headline text-headline-md text-on-surface">
              {editingExam ? 'Edit Exam' : 'Create Exam'}
            </h3>

            <div className="mt-4 space-y-4">
              {/* Title */}
              <div>
                <label className="text-label-sm text-on-surface-variant">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 w-full rounded-radius-lg border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-body-md text-on-surface outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/30"
                  placeholder="e.g., Midterm Examination"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="text-label-sm text-on-surface-variant">Subject *</label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="mt-1 w-full rounded-radius-lg border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-body-md text-on-surface outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/30"
                >
                  <option value="">Select subject</option>
                  {(subjectsQuery.data ?? []).map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-label-sm text-on-surface-variant">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="mt-1 w-full rounded-radius-lg border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-body-md text-on-surface outline-none focus:border-primary-container"
                  />
                </div>
                <div>
                  <label className="text-label-sm text-on-surface-variant">Time</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="mt-1 w-full rounded-radius-lg border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-body-md text-on-surface outline-none focus:border-primary-container"
                  />
                </div>
              </div>

              {/* Duration & Room */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-label-sm text-on-surface-variant">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="mt-1 w-full rounded-radius-lg border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-body-md text-on-surface outline-none focus:border-primary-container"
                    placeholder="e.g., 2 hours"
                  />
                </div>
                <div>
                  <label className="text-label-sm text-on-surface-variant">Room</label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="mt-1 w-full rounded-radius-lg border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-body-md text-on-surface outline-none focus:border-primary-container"
                    placeholder="e.g., Hall A"
                  />
                </div>
              </div>

              {/* Max Marks & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-label-sm text-on-surface-variant">Max Marks</label>
                  <input
                    type="number"
                    value={formData.maxMarks}
                    onChange={(e) => setFormData({ ...formData, maxMarks: Number(e.target.value) })}
                    className="mt-1 w-full rounded-radius-lg border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-body-md text-on-surface outline-none focus:border-primary-container"
                  />
                </div>
                <div>
                  <label className="text-label-sm text-on-surface-variant">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Exam['status'] })}
                    className="mt-1 w-full rounded-radius-lg border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-body-md text-on-surface outline-none focus:border-primary-container"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Syllabus */}
              <div>
                <label className="text-label-sm text-on-surface-variant">Syllabus / Notes</label>
                <textarea
                  value={formData.syllabus}
                  onChange={(e) => setFormData({ ...formData, syllabus: e.target.value })}
                  className="mt-1 w-full rounded-radius-lg border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-body-md text-on-surface outline-none focus:border-primary-container min-h-[80px] resize-none"
                  placeholder="Topics covered, resources, etc."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSave} loading={createMutation.isPending || updateMutation.isPending}>
                {editingExam ? 'Update' : 'Create'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}