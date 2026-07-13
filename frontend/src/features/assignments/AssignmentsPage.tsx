import { useState } from 'react'
import {
  ClipboardList,
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  Flag,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { SubjectChip } from '@/components/shared/SubjectChip'
import { useAssignments, useCreateAssignment, useUpdateAssignment, useDeleteAssignment } from '@/hooks/useAssignments'
import { useSubjects } from '@/hooks/useSubjects'
import { toast } from 'react-hot-toast'
import { cn, formatDate } from '@/lib/utils'
import type { Assignment } from '@/types/design-system'

const TABS: { label: string; value: Assignment['status'] | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Graded', value: 'graded' },
]

const PRIORITIES: { label: string; value: 'low' | 'medium' | 'high'; color: string }[] = [
  { label: 'Low', value: 'low', color: '#059669' },
  { label: 'Medium', value: 'medium', color: '#d97706' },
  { label: 'High', value: 'high', color: '#dc2626' },
]

export default function AssignmentsPage() {
  const [activeTab, setActiveTab] = useState<Assignment['status'] | 'all'>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    subjectId: '',
    description: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    reminder: '',
    progress: 0,
    status: 'pending' as Assignment['status'],
  })

  const assignmentsQuery = useAssignments()
  const subjectsQuery = useSubjects()
  const subjectMap = new Map(subjectsQuery.data?.map((s) => [s.id, s]) ?? [])
  const createMutation = useCreateAssignment()
  const updateMutation = useUpdateAssignment()
  const deleteMutation = useDeleteAssignment()

  const filteredAssignments =
    activeTab === 'all'
      ? assignmentsQuery.data ?? []
      : (assignmentsQuery.data ?? []).filter((a) => a.status === activeTab)

  const statusBadge = (status: Assignment['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning" size="sm">Pending</Badge>
      case 'submitted':
        return <Badge variant="info" size="sm">Submitted</Badge>
      case 'graded':
        return <Badge variant="success" size="sm">Graded</Badge>
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      subjectId: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      reminder: '',
      progress: 0,
      status: 'pending',
    })
    setEditingAssignment(null)
    setShowCreate(false)
  }

  const openEdit = (assignment: Assignment) => {
    setFormData({
      title: assignment.title,
      subjectId: assignment.subjectId,
      description: assignment.description || '',
      dueDate: assignment.dueDate,
      priority: assignment.priority || 'medium',
      reminder: assignment.reminder || '',
      progress: assignment.progress || 0,
      status: assignment.status,
    })
    setEditingAssignment(assignment)
    setShowCreate(true)
  }

  const handleSave = async () => {
    if (!formData.title || !formData.subjectId || !formData.dueDate) {
      toast.error('Please fill in title, subject, and due date')
      return
    }

    try {
      if (editingAssignment) {
        await updateMutation.mutateAsync({ id: editingAssignment.id, ...formData })
        toast.success('Assignment updated')
      } else {
        await createMutation.mutateAsync(formData)
        toast.success('Assignment created')
      }
      resetForm()
    } catch {
      toast.error('Failed to save assignment')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Assignment deleted')
      setShowDeleteId(null)
    } catch {
      toast.error('Failed to delete assignment')
    }
  }

  const handleStatusChange = async (id: string, status: Assignment['status']) => {
    try {
      await updateMutation.mutateAsync({ id, status })
      toast.success(`Assignment marked as ${status}`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  const isLoading = assignmentsQuery.isLoading || subjectsQuery.isLoading

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
          <h1 className="font-headline text-headline-lg text-on-surface">Assignments</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">Track and manage your deadlines</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-radius-lg gradient-gold px-4 py-2.5 text-label-md font-bold text-on-primary transition-all duration-200 hover:opacity-90 glow-gold"
        >
          <Plus className="h-4 w-4" />
          New Assignment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="animate-fade-in-up">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-radius bg-amber-500/15 text-amber-400">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant">Pending</p>
                <p className="font-headline text-headline-md text-on-surface">
                  {(assignmentsQuery.data ?? []).filter((a) => a.status === 'pending').length}
                </p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-radius bg-blue-500/15 text-blue-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant">Submitted</p>
                <p className="font-headline text-headline-md text-on-surface">
                  {(assignmentsQuery.data ?? []).filter((a) => a.status === 'submitted').length}
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
                <p className="text-label-sm text-on-surface-variant">Graded</p>
                <p className="font-headline text-headline-md text-on-surface">
                  {(assignmentsQuery.data ?? []).filter((a) => a.status === 'graded').length}
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
                  {assignmentsQuery.data?.length ?? 0}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Filter Tabs */}
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

      {/* Assignments List */}
      <div className="space-y-3 animate-fade-in-up">
        {filteredAssignments.length === 0 ? (
          <Card variant="glass" className="p-10">
            <div className="flex flex-col items-center gap-3">
              <ClipboardList className="h-12 w-12 text-on-surface-variant/30" />
              <p className="text-body-lg text-on-surface-variant">No assignments found</p>
              <p className="text-label-sm text-on-surface-variant/50">
                {activeTab === 'all' ? 'No assignments yet' : `No ${activeTab} assignments`}
              </p>
            </div>
          </Card>
        ) : (
          filteredAssignments.map((assignment, i) => {
            const subject = subjectMap.get(assignment.subjectId)
            const isUrgent =
              assignment.status === 'pending' &&
              new Date(assignment.dueDate).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000
            const isOverdue =
              assignment.status === 'pending' &&
              new Date(assignment.dueDate).getTime() < Date.now()

            return (
              <div
                key={assignment.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <Card
                  variant="glass"
                  className={cn(
                    'overflow-hidden p-0 transition-all duration-200 hover:scale-[1.01]',
                    isOverdue ? 'border-red-500/30' : isUrgent ? 'border-amber-500/30' : '',
                  )}
                >
                  <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6">
                    {/* Status Indicator */}
                    <div
                      className={cn(
                        'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-radius-lg',
                        assignment.status === 'pending' && (isOverdue ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'),
                        assignment.status === 'submitted' && 'bg-blue-500/15 text-blue-400',
                        assignment.status === 'graded' && 'bg-emerald-500/15 text-emerald-400',
                      )}
                    >
                      {assignment.status === 'pending' && <Clock className="h-6 w-6" />}
                      {assignment.status === 'submitted' && <FileText className="h-6 w-6" />}
                      {assignment.status === 'graded' && <CheckCircle2 className="h-6 w-6" />}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-body-lg font-medium text-on-surface">
                          {assignment.title}
                        </h3>
                        {statusBadge(assignment.status)}
                        {isOverdue && <Badge variant="error" size="sm">Overdue</Badge>}
                        {isUrgent && !isOverdue && <Badge variant="error" size="sm">Urgent</Badge>}
                      </div>
                      {assignment.description && (
                        <p className="mt-1 text-body-md text-on-surface-variant line-clamp-2">
                          {assignment.description}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <SubjectChip
                          label={subject?.name || 'Unknown'}
                          color={subject?.color}
                          size="sm"
                        />
                        <span className="flex items-center gap-1 text-label-sm text-on-surface-variant">
                          <Calendar className="h-3.5 w-3.5" />
                          Due {formatDate(assignment.dueDate)}
                        </span>
                        {assignment.priority && (
                          <span
                            className="flex items-center gap-1 text-label-sm"
                            style={{
                              color: PRIORITIES.find((p) => p.value === assignment.priority)?.color || '#666',
                            }}
                          >
                            <Flag className="h-3.5 w-3.5" />
                            {assignment.priority}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {assignment.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(assignment.id, 'submitted')}
                          >
                            Mark Submitted
                          </Button>
                        )}
                        {assignment.status === 'submitted' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(assignment.id, 'graded')}
                          >
                            Mark Graded
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Grade Badge */}
                    {assignment.status === 'graded' && assignment.grade !== undefined && (
                      <div className="flex flex-shrink-0 flex-col items-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-emerald-500/30 bg-emerald-500/10">
                          <span className="font-headline text-headline-md text-emerald-400">
                            {assignment.grade}
                          </span>
                        </div>
                        <span className="mt-1 text-label-sm text-emerald-400">/100</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-shrink-0 items-center gap-1">
                      <button
                        onClick={() => openEdit(assignment)}
                        className="rounded-radius p-2 text-on-surface-variant transition-colors hover:text-primary-container"
                        aria-label="Edit assignment"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteId(assignment.id)}
                        className="rounded-radius p-2 text-on-surface-variant transition-colors hover:text-red-400"
                        aria-label="Delete assignment"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </Card>

                {/* Delete Confirmation */}
                {showDeleteId === assignment.id && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <Card variant="glass" className="w-full max-w-md p-6">
                      <h3 className="font-headline text-headline-md text-on-surface">Delete Assignment</h3>
                      <p className="mt-2 text-body-md text-on-surface-variant">
                        Are you sure you want to delete "{assignment.title}"? This action cannot be undone.
                      </p>
                      <div className="mt-4 flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setShowDeleteId(null)}>
                          Cancel
                        </Button>
                        <Button variant="ghost" onClick={() => handleDelete(assignment.id)}>
                          Delete
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

      {/* Create/Edit Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card variant="glass" className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h3 className="font-headline text-headline-md text-on-surface">
              {editingAssignment ? 'Edit Assignment' : 'Create Assignment'}
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
                  placeholder="e.g., Chapter 5 Homework"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="text-label-sm text-on-surface-variant">Subject *</label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="mt-1 w-full rounded-radius-lg border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-body-md text-on-surface outline-none focus:border-primary-container"
                >
                  <option value="">Select subject</option>
                  {(subjectsQuery.data ?? []).map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="text-label-sm text-on-surface-variant">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full rounded-radius-lg border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-body-md text-on-surface outline-none focus:border-primary-container min-h-[80px] resize-none"
                  placeholder="Assignment description..."
                />
              </div>

              {/* Due Date & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-label-sm text-on-surface-variant">Due Date *</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="mt-1 w-full rounded-radius-lg border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-body-md text-on-surface outline-none focus:border-primary-container"
                  />
                </div>
                <div>
                  <label className="text-label-sm text-on-surface-variant">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                    className="mt-1 w-full rounded-radius-lg border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-body-md text-on-surface outline-none focus:border-primary-container"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reminder & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-label-sm text-on-surface-variant">Reminder</label>
                  <select
                    value={formData.reminder}
                    onChange={(e) => setFormData({ ...formData, reminder: e.target.value })}
                    className="mt-1 w-full rounded-radius-lg border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-body-md text-on-surface outline-none focus:border-primary-container"
                  >
                    <option value="">No reminder</option>
                    <option value="1h">1 hour before</option>
                    <option value="24h">1 day before</option>
                    <option value="48h">2 days before</option>
                    <option value="72h">3 days before</option>
                    <option value="1w">1 week before</option>
                  </select>
                </div>
                <div>
                  <label className="text-label-sm text-on-surface-variant">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Assignment['status'] })}
                    className="mt-1 w-full rounded-radius-lg border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-body-md text-on-surface outline-none focus:border-primary-container"
                  >
                    <option value="pending">Pending</option>
                    <option value="submitted">Submitted</option>
                    <option value="graded">Graded</option>
                  </select>
                </div>
              </div>

              {/* Progress */}
              <div>
                <label className="text-label-sm text-on-surface-variant">Progress ({formData.progress}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                  className="mt-2 w-full accent-primary-container"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSave} loading={createMutation.isPending || updateMutation.isPending}>
                {editingAssignment ? 'Update' : 'Create'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}