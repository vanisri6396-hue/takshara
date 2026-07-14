import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Search, Plus, FileText, Sparkles, X, Tag } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { SubjectChip } from '@/components/shared/SubjectChip'
import { SubjectSelect } from '@/components/shared/SubjectSelect'
import { useNotes } from '@/hooks/useNotes'
import { useSubjects } from '@/hooks/useSubjects'
import { useCreateNote } from '@/hooks/useNotes'
import { toast } from 'react-hot-toast'
import { cn, formatDate, truncate } from '@/lib/utils'

export default function NotesPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string | 'all'>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newSubject, setNewSubject] = useState('')
  const [newTags, setNewTags] = useState('')

  const notesQuery = useNotes()
  const subjectsQuery = useSubjects()
  const createMutation = useCreateNote()

  const subjectMap = new Map(subjectsQuery.data?.map((s) => [s.id, s]) ?? [])

  const subjects = useMemo(() => {
    if (!notesQuery.data) return []
    return [...new Set(notesQuery.data.filter((n) => n.subjectId).map((n) => n.subjectId!))]
  }, [notesQuery.data])

  const filteredNotes = (notesQuery.data ?? []).filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesSubject = selectedSubject === 'all' || note.subjectId === selectedSubject
    return matchesSearch && matchesSubject
  })

  const handleCreateNote = async () => {
    if (!newTitle.trim()) {
      toast.error('Please enter a title')
      return
    }
    await createMutation.mutateAsync({
      title: newTitle.trim(),
      content: newContent,
      subjectId: newSubject || undefined,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
    })
    setNewTitle('')
    setNewContent('')
    setNewSubject('')
    setNewTags('')
    setShowCreate(false)
    toast.success('Note created')
  }

  if (notesQuery.isLoading || subjectsQuery.isLoading) {
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
          <h1 className="font-headline text-headline-lg text-on-surface">Notes</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">Your study notes and summaries</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-radius-lg gradient-gold px-4 py-2.5 text-label-md font-bold text-on-primary transition-all duration-200 hover:opacity-90 glow-gold"
        >
          <Plus className="h-4 w-4" />
          New Note
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row animate-fade-in-up">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-radius-lg border border-outline-variant/20 bg-surface-container-low py-2.5 pl-10 pr-4 text-body-md text-on-surface placeholder:text-on-surface-variant/50 transition-all duration-200 focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/30"
          />
        </div>
      </div>

      {/* Subject Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin animate-fade-in-up">
        <button
          onClick={() => setSelectedSubject('all')}
          className={cn(
            'flex-shrink-0 rounded-radius-lg px-4 py-2 text-label-md transition-all duration-200',
            selectedSubject === 'all'
              ? 'gradient-gold text-on-primary font-bold glow-gold'
              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
          )}
        >
          All Notes
        </button>
        {subjects.map((subId) => {
          const subject = subjectMap.get(subId)
          return (
            <button
              key={subId}
              onClick={() => setSelectedSubject(subId)}
              className={cn(
                'flex-shrink-0 rounded-radius-lg px-4 py-2 text-label-md transition-all duration-200',
                selectedSubject === subId
                  ? 'text-white font-bold'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
              )}
              style={
                selectedSubject === subId
                  ? { backgroundColor: `${subject?.color}30`, color: subject?.color }
                  : undefined
              }
            >
              {subject?.name || 'Unknown'}
            </button>
          )
        })}
      </div>

      {/* Notes Grid */}
      <div className="animate-fade-in-up">
        {filteredNotes.length === 0 ? (
          <Card variant="glass" className="p-10">
            <div className="flex flex-col items-center gap-3">
              <BookOpen className="h-12 w-12 text-on-surface-variant/30" />
              <p className="text-body-lg text-on-surface-variant">No notes found</p>
              <p className="text-label-sm text-on-surface-variant/50">
                {searchQuery ? 'Try a different search term' : 'Create your first note to get started'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredNotes.map((note, i) => {
              const subject = note.subjectId ? subjectMap.get(note.subjectId) : undefined
              return (
                <div
                  key={note.id}
                  className="group cursor-pointer animate-fade-in-up"
                  style={{ animationDelay: `${i * 40}ms` }}
                  onClick={() => navigate(`/notes/${note.id}`)}
                >
                  <Card
                    variant="glass"
                    className="flex h-full flex-col p-5 transition-all duration-200 hover:scale-[1.02]"
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-radius bg-primary-container/15 text-primary-container">
                      <FileText className="h-5 w-5" />
                    </div>
                    <h3 className="text-body-lg font-medium text-on-surface line-clamp-2">
                      {note.title}
                    </h3>
                    <p className="mt-2 flex-1 text-body-md text-on-surface-variant line-clamp-3">
                      {truncate(note.content, 120)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {note.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-outline-variant/10 pt-3">
                      <div className="flex items-center gap-2">
                        {subject && (
                          <SubjectChip label={subject.code} color={subject.color} size="sm" />
                        )}
                      </div>
                      <span className="text-label-sm text-on-surface-variant">
                        {formatDate(note.updatedAt)}
                      </span>
                    </div>
                  </Card>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* AI Summary Button */}
      <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <GlassCard className="flex items-center gap-4 p-5 transition-all duration-200 hover:scale-[1.01]">
          <div className="flex h-12 w-12 items-center justify-center rounded-radius-lg bg-primary-container/15 text-primary-container">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-body-md font-medium text-on-surface">AI Summary</p>
            <p className="text-label-sm text-on-surface-variant">
              Generate smart summaries of your notes
            </p>
          </div>
          <button className="flex-shrink-0 rounded-radius-lg gradient-gold px-4 py-2 text-label-sm font-bold text-on-primary transition-all duration-200 hover:opacity-90">
            Try Now
          </button>
        </GlassCard>
      </div>

      {/* Create Note Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card variant="glass" className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-headline text-headline-md text-on-surface">Create Note</h3>
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-radius p-1 text-on-surface-variant hover:text-on-surface"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-label-sm text-on-surface-variant">Title *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="mt-1 w-full rounded-radius-lg border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-body-md text-on-surface outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/30"
                  placeholder="e.g., Calculus Lecture 1"
                />
              </div>
              <div>
                <SubjectSelect
                  label="Subject"
                  value={newSubject}
                  onChange={setNewSubject}
                  clearable
                  placeholder="Select or type a subject…"
                />
              </div>
              <div>
                <label className="text-label-sm text-on-surface-variant">Content</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="mt-1 w-full rounded-radius-lg border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-body-md text-on-surface outline-none focus:border-primary-container min-h-[120px] resize-none"
                  placeholder="Write your note..."
                />
              </div>
              <div>
                <label className="flex items-center gap-1 text-label-sm text-on-surface-variant">
                  <Tag className="h-3.5 w-3.5" />
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="mt-1 w-full rounded-radius-lg border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-body-md text-on-surface outline-none focus:border-primary-container"
                  placeholder="e.g., calculus, derivatives"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={handleCreateNote} loading={createMutation.isPending}>
                Create Note
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}