import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/authStore'
import type { Assignment } from '@/types/design-system'

export function useAssignments() {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assignments')
        .select('*, subjects(name, code, color)')
        .order('due_date', { ascending: true })
      if (error) throw error
      return data as (Assignment & { subjects: { name: string; code: string; color: string } })[]
    },
    enabled: !!user,
  })
}

export function useCreateAssignment() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: async (assignment: Omit<Assignment, 'id'>) => {
      const { data, error } = await supabase
        .from('assignments')
        .insert([{
          user_id: user!.id,
          subject_id: assignment.subjectId,
          title: assignment.title,
          description: assignment.description || '',
          due_date: assignment.dueDate,
          status: assignment.status,
          grade: assignment.grade || null,
        }])
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
    },
  })
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Assignment> & { id: string }) => {
      const { data, error } = await supabase
        .from('assignments')
        .update({
          title: updates.title,
          description: updates.description,
          subject_id: updates.subjectId,
          due_date: updates.dueDate,
          status: updates.status,
          grade: updates.grade ?? null,
        })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
    },
  })
}