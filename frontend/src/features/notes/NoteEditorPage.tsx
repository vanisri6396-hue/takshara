import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Sparkles, Tag } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { SubjectChip } from '@/components/shared/SubjectChip'
import { useNote } from '@/hooks/useNotes'
import { useUpdateNote } from '@/hooks/useNotes'
import { useSubjects } from '@/hooks/useSubjects'
import { toast } from 'react-hot-toast'
import { formatDate } from '@/lib/utils'

export default function NoteEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const noteQuery = useNote(id)
  const subjectsQuery = useSubjects()
  const updateMutation = useUpdateNote()

  const note = noteQuery.data
  const subjectMap = new Map(subjectsQuery.data?.map((s) => [s.id, s]) ?? [])
  const subject = note?.subjectId ? subjectMap.get(note.subjectId) : undefined

  const [title, setTitle] = useState(note?.title || 'Untitled Note')
  const [content, setContent] = useState(note?.content || '')

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
    }
  }, [note?.id, note?.title, note?.content])

  const handleSave = async () => {
    if (!id || !note) return
    await updateMutation.mutateAsync({ id, title, content })
    toast.success('Note saved')
  }

  if (noteQuery.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-container border-t-transparent" />
      </div>
    )
  }

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
        <p className="text-body-lg text-on-surface-variant">Note not found</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/notes')}>
          <ArrowLeft className="h-4 w-4" />
          Back to Notes
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8 animate-fade-in-up">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/notes')}
          className="flex items-center gap-2 rounded-radius-lg px-3 py-2 text-label-md text-on-surface-variant transition-all duration-200 hover:bg-surface-container-high hover:text-on-surface"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={<Sparkles className="h-4 w-4" />}>
            AI Summary
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} loading={updateMutation.isPending} icon={<Save className="h-4 w-4" />}>
            Save
          </Button>
        </div>
      </div>

      {/* Note Editor */}
      <GlassCard className="overflow-hidden p-0">
        {/* Title Input */}
        <div className="border-b border-outline-variant/20 px-6 py-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent font-headline text-headline-lg text-on-surface outline-none placeholder:text-on-surface-variant/30"
            placeholder="Note title..."
          />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {subject && <SubjectChip label={subject.name} color={subject.color} size="sm" />}
            <span className="text-label-sm text-on-surface-variant">
              Updated {formatDate(note.updatedAt)}
            </span>
            <span className="flex items-center gap-1 text-label-sm text-on-surface-variant">
              <Tag className="h-3.5 w-3.5" />
              {note.tags.join(', ')}
            </span>
          </div>
        </div>

        {/* Content Editor */}
        <div className="px-6 py-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[400px] w-full resize-none bg-transparent text-body-md text-on-surface outline-none placeholder:text-on-surface-variant/30"
            placeholder="Start writing your notes here..."
          />
        </div>
      </GlassCard>
    </div>
  )
}