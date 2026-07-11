import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/authStore'

interface Settings {
  theme: string
  accent_color: string
  font_size: string
  push_notifications: boolean
  email_reminders: boolean
  assignment_alerts: string
  two_factor_auth: boolean
  session_timeout: string
  data_sharing: string
}

export function useSettings() {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user!.id)
        .single()
      if (error) throw error
      return data as Settings
    },
    enabled: !!user,
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: async (settings: Partial<Settings>) => {
      const { data, error } = await supabase
        .from('user_settings')
        .update(settings)
        .eq('user_id', user!.id)
        .select()
        .single()
      if (error) throw error
      return data as Settings
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })
}