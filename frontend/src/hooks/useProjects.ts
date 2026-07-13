import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/authStore'
import type { Project } from '@/types/design-system'

export function useProjects() {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*, subjects(name, code, color)')
        .order('due_date', { ascending: true })
      if (error) throw error
      return data as (Project & { subjects: { name: string; code: string; color: string } })[]
    },
    enabled: !!user,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: async (project: Omit<Project, 'id'>) => {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          user_id: user!.id,
          subject_id: project.subjectId,
          title: project.title,
          description: project.description,
          due_date: project.dueDate,
          status: project.status,
          progress: project.progress,
          technologies: project.technologies,
        }])
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Project> & { id: string }) => {
      const { data, error } = await supabase
        .from('projects')
        .update({
          title: updates.title,
          description: updates.description,
          subject_id: updates.subjectId,
          due_date: updates.dueDate,
          status: updates.status,
          progress: updates.progress,
          technologies: updates.technologies,
        })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}