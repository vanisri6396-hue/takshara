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
        .select('id, subject_id, faculty_name, day, start_time, end_time, room, class_type, notes, subject_color, user_id, subjects(name, code, color)')
        .order('day')
        .order('start_time')
      if (error) throw error
      
      // Transform snake_case to camelCase
      return (data || []).map((item: any) => ({
        id: item.id,
        subjectId: item.subject_id,
        facultyName: item.faculty_name,
        day: item.day,
        startTime: item.start_time,
        endTime: item.end_time,
        room: item.room,
        classType: item.class_type,
        notes: item.notes,
        subjectColor: item.subject_color,
        userId: item.user_id,
        subjects: item.subjects,
      })) as (Schedule & { subjects: { name: string; code: string; color: string } })[]
    },
    enabled: !!user,
  })
}

export function useCreateSchedule() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: async (schedule: Omit<Schedule, 'id'>) => {
      // Convert camelCase to snake_case for database
      const dbSchedule = {
        subject_id: schedule.subjectId,
        faculty_name: schedule.facultyName,
        day: schedule.day,
        start_time: schedule.startTime,
        end_time: schedule.endTime,
        room: schedule.room,
        class_type: schedule.classType,
        notes: schedule.notes,
        subject_color: schedule.subjectColor,
        user_id: user!.id,
      }
      
      const { data, error } = await supabase
        .from('schedules')
        .insert([dbSchedule])
        .select()
        .single()
      if (error) throw error
      
      // Transform back to camelCase
      return {
        id: data.id,
        subjectId: data.subject_id,
        facultyName: data.faculty_name,
        day: data.day,
        startTime: data.start_time,
        endTime: data.end_time,
        room: data.room,
        classType: data.class_type,
        notes: data.notes,
        subjectColor: data.subject_color,
        userId: data.user_id,
      } as Schedule
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

export function useUpdateSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Schedule> & { id: string }) => {
      // Convert camelCase to snake_case for database
      const dbUpdates: any = {}
      if (updates.subjectId !== undefined) dbUpdates.subject_id = updates.subjectId
      if (updates.facultyName !== undefined) dbUpdates.faculty_name = updates.facultyName
      if (updates.day !== undefined) dbUpdates.day = updates.day
      if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime
      if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime
      if (updates.room !== undefined) dbUpdates.room = updates.room
      if (updates.classType !== undefined) dbUpdates.class_type = updates.classType
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes
      if (updates.subjectColor !== undefined) dbUpdates.subject_color = updates.subjectColor
      
      const { data, error } = await supabase
        .from('schedules')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      
      // Transform back to camelCase
      return {
        id: data.id,
        subjectId: data.subject_id,
        facultyName: data.faculty_name,
        day: data.day,
        startTime: data.start_time,
        endTime: data.end_time,
        room: data.room,
        classType: data.class_type,
        notes: data.notes,
        subjectColor: data.subject_color,
        userId: data.user_id,
      } as Schedule
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
    },
  })
}
