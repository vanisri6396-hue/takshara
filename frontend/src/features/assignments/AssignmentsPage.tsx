import { useState } from 'react'
import { ClipboardList, Calendar, Clock, FileText, CheckCircle2, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { SubjectChip } from '@/components/shared/SubjectChip'
import { useAssignments } from '@/hooks/useAssignments'
import { useCreateAssignment, useUpdateAssignment, useDeleteAssignment } from '@/hooks/useAssignments'
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

const DIALOG_TITLE = 'Assignment'

export default function AssignmentsPage() {
  const [activeTab, setActiveTab] = useState<Assignment['status'] | 'all'>('all')
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null)

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

  const isLoading = assignmentsQuery.isLoading || subjectsQuery.isLoading

  const handleStatusChange = async (id: string, status: Assignment['status']) => {
    await updateMutation.mutateAsync({ id, status })
    toast.success('Assignment updated')
  }

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id)
    toast.success('Assignment deleted')
    setShowDeleteId(null)
  }

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
      <div className="animate-fade-in-up">
        <h1 className="font-headline text-headline-lg text-on-surface">Assignments</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">Track and manage your deadlines</p>
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
                    isUrgent && 'border-amber-500/30',
                  )}
                >
                  <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6">
                    {/* Status Indicator */}
                    <div
                      className={cn(
                        'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-radius-lg',
                        assignment.status === 'pending' && 'bg-amber-500/15 text-amber-400',
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
                        {isUrgent && (
                          <Badge variant="error" size="sm">Urgent</Badge>
                        )}
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

                    {/* Delete */}
                    <button
                      onClick={() => setShowDeleteId(assignment.id)}
                      className="flex-shrink-0 rounded-radius text-on-surface-variant transition-colors hover:text-red-400"
                      aria-label="Delete assignment"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
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
    </div>
  )
}