import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/authStore'

export function useStudyGoals() {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['study-goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('study_goals')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}

export function useCreateStudyGoal() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: async (goal: { title: string; target: number; unit: string; subjectId?: string }) => {
      const { data, error } = await supabase
        .from('study_goals')
        .insert([{
          user_id: user!.id,
          title: goal.title,
          target: goal.target,
          current: 0,
          unit: goal.unit,
          subject_id: goal.subjectId || null,
        }])
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-goals'] })
    },
  })
}