import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/authStore'
import type { Note } from '@/types/design-system'

export function useNotes() {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*, subjects(name, code, color)')
        .order('updated_at', { ascending: false })
      if (error) throw error
      return data as (Note & { subjects: { name: string; code: string; color: string } | null })[]
    },
    enabled: !!user,
  })
}

export function useNote(id: string | undefined) {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['notes', id],
    queryFn: async () => {
      if (!id) throw new Error('Note ID is required')
      const { data, error } = await supabase
        .from('notes')
        .select('*, subjects(name, code, color)')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as Note & { subjects: { name: string; code: string; color: string } | null }
    },
    enabled: !!user && !!id,
  })
}

export function useCreateNote() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: async (note: { title: string; content: string; subjectId?: string; tags?: string[] }) => {
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          user_id: user!.id,
          title: note.title,
          content: note.content,
          subject_id: note.subjectId || null,
          tags: note.tags || [],
        }])
        .select()
        .single()
      if (error) throw error
      return data as Note
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })
}

export function useUpdateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Note> & { id: string }) => {
      const { data, error } = await supabase
        .from('notes')
        .update({
          title: updates.title,
          content: updates.content,
          subject_id: updates.subjectId || null,
          tags: updates.tags || [],
        })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Note
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })
}

export function useDeleteNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notes').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })
}