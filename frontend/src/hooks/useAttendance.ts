import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/authStore'
import type { AttendanceRecord } from '@/types/design-system'

export function useAttendance() {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['attendance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select('*, subjects(name, code, color)')
        .order('date', { ascending: false })
      if (error) throw error
      return data as (AttendanceRecord & { subjects: { name: string; code: string; color: string } })[]
    },
    enabled: !!user,
  })
}

export function useAttendancePercentage(subjectId?: string) {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['attendance', 'percentage', subjectId],
    queryFn: async () => {
      let query = supabase.from('attendance').select('*')
      if (subjectId) {
        query = query.eq('subject_id', subjectId)
      }
      const { data, error } = await query
      if (error) throw error

      if (!data || data.length === 0) return 0
      const present = data.filter((r) => r.status === 'present' || r.status === 'late').length
      return Math.round((present / data.length) * 100)
    },
    enabled: !!user,
  })
}

export function useCreateAttendanceRecord() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: async (record: Omit<AttendanceRecord, 'id'>) => {
      const { data, error } = await supabase
        .from('attendance')
        .insert([{
          user_id: user!.id,
          subject_id: record.subjectId,
          date: record.date,
          status: record.status,
        }])
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
    },
  })
}