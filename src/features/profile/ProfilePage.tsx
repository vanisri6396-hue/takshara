import { useState } from 'react'
import { User, Mail, Calendar, Edit2, Save, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/authStore'
import { useUpdateProfile } from '@/hooks/useProfile'

export default function ProfilePage() {
  const { user, profile } = useAuthStore()
  const updateProfileMutation = useUpdateProfile()

  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [studentId, setStudentId] = useState(profile?.student_id ?? '')
  const [year, setYear] = useState(profile?.year ?? 1)

  const isLoading = useAuthStore((s) => s.isLoading)

  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync({ full_name: fullName, student_id: studentId, year })
      setIsEditing(false)
    } catch {
      // error shown in toast by hook
    }
  }

  const handleCancel = () => {
    setFullName(profile?.full_name ?? '')
    setStudentId(profile?.student_id ?? '')
    setYear(profile?.year ?? 1)
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-container border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="font-headline text-headline-lg text-on-surface">Profile</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">Manage your account details</p>
      </div>

      {/* Profile Card */}
      <div className="animate-fade-in-up">
        <Card variant="glass" className="overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary-container/40 to-primary-container/20" />
          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="-mt-16 mb-4">
              <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-surface bg-surface-container text-4xl font-headline font-bold text-primary-container">
                {profile?.full_name?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0).toUpperCase() ?? 'U'}
              </div>
            </div>

            {/* Info */}
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <label className="text-label-sm text-on-surface-variant">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-1 w-full rounded-radius-lg border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-body-md text-on-surface"
                    />
                  </div>
                  <div>
                    <label className="text-label-sm text-on-surface-variant">Student ID</label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="mt-1 w-full rounded-radius-lg border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-body-md text-on-surface"
                    />
                  </div>
                  <div>
                    <label className="text-label-sm text-on-surface-variant">Year</label>
                    <select
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="mt-1 w-full rounded-radius-lg border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-body-md text-on-surface"
                    >
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleSave} loading={updateProfileMutation.isPending}>
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                    <Button variant="ghost" onClick={handleCancel}>
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-headline text-headline-md text-on-surface">
                        {profile?.full_name || 'Student'}
                      </h2>
                      <div className="mt-1 flex items-center gap-2 text-label-sm text-on-surface-variant">
                        <Mail className="h-3.5 w-3.5" />
                        {user?.email}
                      </div>
                      {profile?.student_id && (
                        <div className="mt-1 flex items-center gap-2 text-label-sm text-on-surface-variant">
                          <User className="h-3.5 w-3.5" />
                          {profile.student_id}
                        </div>
                      )}
                      {profile?.year && (
                        <div className="mt-1 flex items-center gap-2 text-label-sm text-on-surface-variant">
                          <Calendar className="h-3.5 w-3.5" />
                          Year {profile.year}
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" onClick={() => setIsEditing(true)}>
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}