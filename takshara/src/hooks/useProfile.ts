import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/stores/authStore'

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const updateProfile = useAuthStore((s) => s.updateProfile)

  return useMutation({
    mutationFn: async (data: { full_name?: string; student_id?: string; year?: number }) => {
      const result = await updateProfile(data)
      if (result.error) {
        toast.error(result.error)
        throw new Error(result.error)
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Profile updated')
    },
  })
}
