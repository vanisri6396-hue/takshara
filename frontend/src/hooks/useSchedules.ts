import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/authStore'
import type { Schedule } from '@/types/design-system'

export function useSchedules() {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['schedules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedules')
        .select('*, subjects(name, code, color)')
        .order('day')
        .order('start_time')
      if (error) throw error
      return data as (Schedule & { subjects: { name: string; code: string; color: string } })[]
    },
    enabled: !!user,
  })
}

export function useCreateSchedule() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: async (schedule: Omit<Schedule, 'id'>) => {
      const { data, error } = await supabase
        .from('schedules')
        .insert([{ ...schedule, user_id: user!.id }])
        .select()
        .single()
      if (error) throw error
      return data as Schedule
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
    },
  })
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('schedules').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
    },
  })
}