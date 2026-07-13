import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/authStore'
import type { Activity } from '@/types/design-system'

export function useActivity() {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*, subjects(name, code, color)')
        .order('created_at', { ascending: false })
        .limit(20)
      if (error) throw error
      return data as (Activity & { subjects: { name: string; code: string; color: string } | null })[]
    },
    enabled: !!user,
  })
}

export function useCreateActivity() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: async (activity: Omit<Activity, 'id' | 'timestamp'>) => {
      const { data, error } = await supabase
        .from('activity_log')
        .insert([{
          user_id: user!.id,
          type: activity.type,
          message: activity.message,
          subject_id: activity.subjectId || null,
          link: activity.link || '',
        }])
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity'] })
    },
  })
}