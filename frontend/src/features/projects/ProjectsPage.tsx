import { useState } from 'react'
import {
  TrendingUp,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Code2,
  AlertTriangle,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { SubjectChip } from '@/components/shared/SubjectChip'
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '@/hooks/useProjects'
import { useSubjects } from '@/hooks/useSubjects'
import { toast } from 'react-hot-toast'
import { cn, formatDate } from '@/lib/utils'
import type { Project } from '@/types/design-system'

const TABS: { label: string; value: Project['status'] | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
]

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState<Project['status'] | 'all'>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    subjectId: '',
    description: '',
    dueDate: '',
    status: 'pending' as Project['status'],
    progress: 0,
    technologies: [] as string[],
    techInput: '',
  })

  const projectsQuery = useProjects()
  const subjectsQuery = useSubjects()
  const createMutation = useCreateProject()
  const updateMutation = useUpdateProject()
  const deleteMutation = useDeleteProject()

  const subjectMap = new Map(subjectsQuery.data?.map((s) => [s.id, s]) ?? [])

  const filteredProjects =
    activeTab === 'all'
      ? projectsQuery.data ?? []
      : (projectsQuery.data ?? []).filter((p) => p.status === activeTab)

  const statusBadge = (status: Project['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning" size="sm">Pending</Badge>
      case 'in_progress':
        return <Badge variant="info" size="sm">In Progress</Badge>
      case 'completed':
        return <Badge variant="success" size="sm">Completed</Badge>
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      subjectId: '',
      description: '',
      dueDate: '',
      status: 'pending',
      progress: 0,
      technologies: [],
      techInput: '',
    })
    setEditingProject(null)
    setShowCreate(false)
  }

  const openEdit = (project: Project) => {
    setFormData({
      title: project.title,
      subjectId: project.subjectId,
      description: project.description,
      dueDate: project.dueDate,
      status: project.status,
      progress: project.progress,
      technologies: project.technologies,
      techInput: '',
    })
    setEditingProject(project)
    setShowCreate(true)
  }

  const addTech = () => {
    const tech = formData.techInput.trim()
    if (tech && !formData.technologies.includes(tech)) {
      setFormData({ ...formData, technologies: [...formData.technologies, tech], techInput: '' })
    }
  }

  const removeTech = (tech: string) => {
    setFormData({ ...formData, technologies: formData.technologies.filter((t) => t !== tech) })
  }

  const handleSave = async () => {
    if (!formData.title || !formData.subjectId || !formData.dueDate) {
      toast.error('Please fill in title, subject, and due date')
      return
    }

    try {
      if (editingProject) {
        await updateMutation.mutateAsync({ id: editingProject.id, ...formData })
        toast.success('Project updated')
      } else {
        await createMutation.mutateAsync(formData)
        toast.success('Project created')
      }
      resetForm()
    } catch {
      toast.error('Failed to save project')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Project deleted')
      setShowDeleteId(null)
    } catch {
      toast.error('Failed to delete project')
    }
  }

  const isLoading = projectsQuery.isLoading || subjectsQuery.isLoading

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
          <h1 className="font-headline text-headline-lg text-on-surface">Projects</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">Manage your academic projects</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-radius-lg gradient-gold px-4 py-2.5 text-label-md font-bold text-on-primary transition-all duration-200 hover:opacity-90 glow-gold"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {/* Stats */}
      <div className="animate-fade-in-up">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-radius bg-amber-500/15 text-amber-400">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant">In Progress</p>
                <p className="font-headline text-headline-md text-on-surface">
                  {(projectsQuery.data ?? []).filter((p) => p.status === 'in_progress').length}
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
                  {(projectsQuery.data ?? []).filter((p) => p.status === 'completed').length}
                </p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-radius bg-primary-container/15 text-primary-container">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant">Total</p>
                <p className="font-headline text-headline-md text-on-surface">
                  {projectsQuery.data?.length ?? 0}
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

      {/* Projects List */}
      <div className="space-y-3 animate-fade-in-up">
        {filteredProjects.length === 0 ? (
          <Card variant="glass" className="p-10">
            <div className="flex flex-col items-center gap-3">
              <TrendingUp className="h-12 w-12 text-on-surface-variant/30" />
              <p className="text-body-lg text-on-surface-variant">No projects found</p>
              <p className="text-label-sm text-on-surface-variant/50">
                {activeTab === 'all' ? 'Create your first project to get started' : `No ${activeTab} projects`}
              </p>
            </div>
          </Card>
        ) : (
          filteredProjects.map((project, i) => {
            const subject = subjectMap.get(project.subjectId)
            const isOverdue = project.status !== 'completed' && new Date(project.dueDate).getTime() < Date.now()
            return (
              <div
                key={project.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <Card
                  variant="glass"
                  className={cn(
                    'overflow-hidden p-0 transition-all duration-200 hover:scale-[1.01]',
                    isOverdue && 'border-red-500/30',
                  )}
                >
                  <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6">
                    {/* Progress Circle */}
                    <div
                      className={cn(
                        'flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-2',
                        project.status === 'completed'
                          ? 'border-emerald-500/30 bg-emerald-500/10'
                          : project.progress >= 50
                            ? 'border-blue-500/30 bg-blue-500/10'
                            : 'border-amber-500/30 bg-amber-500/10',
                      )}
                    >
                      <span
                        className={cn(
                          'font-headline text-headline-md',
                          project.status === 'completed'
                            ? 'text-emerald-400'
                            : project.progress >= 50
                              ? 'text-blue-400'
                              : 'text-amber-400',
                        )}
                      >
                        {project.progress}%
                      </span>
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-body-lg font-medium text-on-surface">{project.title}</h3>
                        {statusBadge(project.status)}
                        {isOverdue && <Badge variant="error" size="sm">Overdue</Badge>}
                      </div>
                      {project.description && (
                        <p className="mt-1 text-body-md text-on-surface-variant line-clamp-2">{project.description}</p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-label-sm text-on-surface-variant">
                        <SubjectChip label={subject?.name || 'Unknown'} color={subject?.color} size="sm" />
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Due {formatDate(project.dueDate)}
                        </span>
                      </div>
                      {project.technologies.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {project.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="inline-flex items-center gap-1 rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant"
                            >
                              <Code2 className="h-3 w-3" />
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Progress Bar */}
                      <div className="mt-3 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-surface-container-highest">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-1000',
                            project.status === 'completed' ? 'bg-emerald-500' : 'bg-primary-container',
                          )}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <button
                        onClick={() => openEdit(project)}
                        className="rounded-radius p-2 text-on-surface-variant transition-colors hover:text-primary-container"
                        aria-label="Edit project"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteId(project.id)}
                        className="rounded-radius p-2 text-on-surface-variant transition-colors hover:text-red-400"
                        aria-label="Delete project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </Card>

                {/* Delete Confirmation */}
                {showDeleteId === project.id && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <Card variant="glass" className="w-full max-w-md p-6">
                      <h3 className="font-headline text-headline-md text-on-surface">Delete Project</h3>
                      <p className="mt-2 text-body-md text-on-surface-variant">
                        Are you sure you want to delete "{project.title}"? This action cannot be undone.
                      </p>
                      <div className="mt-4 flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setShowDeleteId(null)}>Cancel</Button>
                        <Button variant="ghost" onClick={() => handleDelete(project.id)}>Delete</Button>
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
              {editingProject ? 'Edit Project' : 'Create Project'}
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
                  placeholder="e.g., Machine Learning Project"
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
                  placeholder="Project description..."
                />
              </div>

              {/* Due Date & Status */}
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
                  <label className="text-label-sm text-on-surface-variant">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Project['status'] })}
                    className="mt-1 w-full rounded-radius-lg border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-body-md text-on-surface outline-none focus:border-primary-container"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
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

              {/* Technologies */}
              <div>
                <label className="text-label-sm text-on-surface-variant">Technologies</label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    value={formData.techInput}
                    onChange={(e) => setFormData({ ...formData, techInput: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                    className="flex-1 rounded-radius-lg border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-body-md text-on-surface outline-none focus:border-primary-container"
                    placeholder="e.g., React, Python"
                  />
                  <Button variant="secondary" size="sm" onClick={addTech}>Add</Button>
                </div>
                {formData.technologies.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {formData.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center gap-1 rounded-full bg-surface-container-high px-2.5 py-1 text-label-sm text-on-surface-variant"
                      >
                        {tech}
                        <button
                          onClick={() => removeTech(tech)}
                          className="text-on-surface-variant/50 hover:text-red-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSave} loading={createMutation.isPending || updateMutation.isPending}>
                {editingProject ? 'Update' : 'Create'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}