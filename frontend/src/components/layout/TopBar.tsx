import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Search, Menu, CheckCheck, Clock, Calendar, AlertTriangle, Award, GraduationCap } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore } from '@/stores/authStore'
import { useNotifications, useUnreadCount, useMarkNotificationRead, useMarkAllRead } from '@/hooks/useNotifications'
import { cn, formatDate } from '@/lib/utils'
import { LogoutButton } from './LogoutButton'

const notificationIcons: Record<string, React.ReactNode> = {
  assignment_due: <Clock className="h-4 w-4" />,
  exam_reminder: <GraduationCap className="h-4 w-4" />,
  low_attendance: <AlertTriangle className="h-4 w-4" />,
  upcoming_class: <Calendar className="h-4 w-4" />,
  goal_completed: <Award className="h-4 w-4" />,
  assignment_graded: <Award className="h-4 w-4" />,
  general: <Bell className="h-4 w-4" />,
}

const notificationColors: Record<string, string> = {
  assignment_due: '#d97706',
  exam_reminder: '#dc2626',
  low_attendance: '#dc2626',
  upcoming_class: '#2563eb',
  goal_completed: '#059669',
  assignment_graded: '#059669',
  general: '#7c3aed',
}

export function TopBar() {
  const { toggleMobileNav } = useUIStore()
  const profile = useAuthStore((s) => s.profile)
  const navigate = useNavigate()

  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const { data: notifications } = useNotifications()
  const { data: unreadCount } = useUnreadCount()
  const markReadMutation = useMarkNotificationRead()
  const markAllReadMutation = useMarkAllRead()

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkRead = (id: string) => {
    markReadMutation.mutate(id)
  }

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate()
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-outline-variant/20 bg-surface/80 backdrop-blur-xl px-4 lg:px-6">
      {/* Left: Mobile Menu Toggle */}
      <button
        onClick={toggleMobileNav}
        className="flex items-center justify-center rounded-radius p-2 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface lg:hidden"
        aria-label="Toggle mobile navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Center/Spacer */}
      <div className="hidden lg:flex lg:flex-1" />

      {/* Right: Actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Search */}
        <button
          className="flex items-center justify-center rounded-radius p-2 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors duration-200"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Notifications */}
        <div ref={notificationRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex items-center justify-center rounded-radius p-2 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors duration-200"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount !== undefined && unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-label-xs font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 animate-fade-in-up">
              <div className="glass-strong rounded-radius-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-outline-variant/20 px-4 py-3">
                  <h3 className="font-headline text-headline-sm text-on-surface">Notifications</h3>
                  {(unreadCount ?? 0) > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="flex items-center gap-1 text-label-sm text-primary-container hover:text-primary transition-colors duration-200"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="max-h-80 overflow-y-auto scrollbar-thin">
                  {!notifications || notifications.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-10 px-4">
                      <Bell className="h-8 w-8 text-on-surface-variant/30" />
                      <p className="text-body-md text-on-surface-variant">No notifications yet</p>
                      <p className="text-label-sm text-on-surface-variant/50 text-center">
                        You'll see reminders for deadlines, exams, and more here
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-outline-variant/10">
                      {notifications.slice(0, 20).map((notification) => {
                        const icon = notificationIcons[notification.type] || <Bell className="h-4 w-4" />
                        const color = notificationColors[notification.type] || '#7c3aed'
                        return (
                          <button
                            key={notification.id}
                            onClick={() => {
                              handleMarkRead(notification.id)
                              if (notification.link) navigate(notification.link)
                            }}
                            className={cn(
                              'flex w-full items-start gap-3 px-4 py-3 text-left transition-all duration-200 hover:bg-surface-container-high',
                              !notification.read && 'bg-primary-container/5',
                            )}
                          >
                            <div
                              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                              style={{ backgroundColor: `${color}20`, color }}
                            >
                              {icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={cn(
                                'text-body-sm',
                                notification.read ? 'text-on-surface-variant' : 'text-on-surface font-medium',
                              )}>
                                {notification.title}
                              </p>
                              {notification.message && (
                                <p className="mt-0.5 text-label-sm text-on-surface-variant/70 line-clamp-2">
                                  {notification.message}
                                </p>
                              )}
                              <p className="mt-1 text-label-sm text-on-surface-variant/50">
                                {formatDate(notification.createdAt, { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {!notification.read && (
                              <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary-container" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 rounded-radius-lg p-1.5 transition-all duration-200 hover:bg-surface-container-high"
          >
            <Avatar
              alt={profile?.full_name || 'Student'}
              size="sm"
            />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-56 animate-fade-in-up">
              <div className="glass-strong rounded-radius-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-outline-variant/20">
                  <p className="text-body-sm font-medium text-on-surface truncate">
                    {profile?.full_name || 'Student'}
                  </p>
                  <p className="text-label-sm text-on-surface-variant truncate">
                    {profile?.email || ''}
                  </p>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => {
                      navigate('/profile')
                      setShowProfile(false)
                    }}
                    className="flex w-full items-center gap-2 rounded-radius-lg px-3 py-2 text-body-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors duration-200"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      navigate('/settings')
                      setShowProfile(false)
                    }}
                    className="flex w-full items-center gap-2 rounded-radius-lg px-3 py-2 text-body-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors duration-200"
                  >
                    Settings
                  </button>
                  <div className="px-1 py-1">
                    {/* Logout clears Supabase session + React Query cache (via authStore) */}
                    <LogoutButton />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}