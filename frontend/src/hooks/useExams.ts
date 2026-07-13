import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/authStore'
import type { Exam } from '@/types/design-system'

export function useExams() {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['exams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exams')
        .select('*, subjects(name, code, color)')
        .order('date', { ascending: true })
      if (error) throw error
      return data as (Exam & { subjects: { name: string; code: string; color: string } })[]
    },
    enabled: !!user,
  })
}

export function useCreateExam() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: async (exam: Omit<Exam, 'id'>) => {
      const { data, error } = await supabase
        .from('exams')
        .insert([{
          user_id: user!.id,
          subject_id: exam.subjectId,
          title: exam.title,
          date: exam.date,
          time: exam.time,
          duration: exam.duration,
          room: exam.room,
          syllabus: exam.syllabus,
          max_marks: exam.maxMarks,
          status: exam.status,
        }])
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] })
    },
  })
}

export function useUpdateExam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Exam> & { id: string }) => {
      const { data, error } = await supabase
        .from('exams')
        .update({
          title: updates.title,
          subject_id: updates.subjectId,
          date: updates.date,
          time: updates.time,
          duration: updates.duration,
          room: updates.room,
          syllabus: updates.syllabus,
          max_marks: updates.maxMarks,
          status: updates.status,
        })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] })
    },
  })
}

export function useDeleteExam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('exams').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] })
    },
  })
}