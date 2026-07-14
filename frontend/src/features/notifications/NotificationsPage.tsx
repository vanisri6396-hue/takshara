import { useState } from 'react'
import {
  Bell,
  BellOff,
  CheckCircle2,
  Trash2,
  ExternalLink,
  AlertTriangle,
  BookOpen,
  Calendar,
  Clock,
  Award,
  Settings,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useNotifications, useMarkNotificationRead, useMarkAllRead, useDeleteNotification } from '@/hooks/useNotifications'
import { toast } from 'react-hot-toast'
import { cn, formatDate } from '@/lib/utils'

const CATEGORIES = [
  { value: 'all', label: 'All', icon: null },
  { value: 'assignment', label: 'Assignment', icon: <BookOpen className="h-4 w-4" /> },
  { value: 'timetable', label: 'Timetable', icon: <Calendar className="h-4 w-4" /> },
  { value: 'attendance', label: 'Attendance', icon: <Clock className="h-4 w-4" /> },
  { value: 'reminder', label: 'Reminder', icon: <AlertTriangle className="h-4 w-4" /> },
  { value: 'system', label: 'System', icon: <Settings className="h-4 w-4" /> },
  { value: 'achievement', label: 'Achievement', icon: <Award className="h-4 w-4" /> },
] as const

const PRIORITIES = [
  { value: 'all', label: 'All Priorities', color: '' },
  { value: 'high', label: 'High', color: '#dc2626' },
  { value: 'medium', label: 'Medium', color: '#d97706' },
  { value: 'low', label: 'Low', color: '#059669' },
] as const

const TYPE_COLORS: Record<string, string> = {
  assignment: '#d97706',
  timetable: '#7c3aed',
  attendance: '#0891b2',
  reminder: '#dc2626',
  system: '#666666',
  achievement: '#059669',
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  assignment: <BookOpen className="h-5 w-5" />,
  timetable: <Calendar className="h-5 w-5" />,
  attendance: <Clock className="h-5 w-5" />,
  reminder: <AlertTriangle className="h-5 w-5" />,
  system: <Settings className="h-5 w-5" />,
  achievement: <Award className="h-5 w-5" />,
}

export default function NotificationsPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  const notificationsQuery = useNotifications()
  const markReadMutation = useMarkNotificationRead()
  const markAllReadMutation = useMarkAllRead()
  const deleteMutation = useDeleteNotification()

  const filteredNotifications = notificationsQuery.data?.filter((notification) => {
    if (categoryFilter !== 'all' && notification.type !== categoryFilter) return false
    if (priorityFilter !== 'all' && notification.priority !== priorityFilter) return false
    if (showUnreadOnly && notification.read) return false
    return true
  }) ?? []

  const unreadCount = notificationsQuery.data?.filter((n) => !n.read).length ?? 0

  const handleMarkAsRead = async (id: string) => {
    try {
      await markReadMutation.mutateAsync(id)
      toast.success('Notification marked as read')
    } catch {
      toast.error('Failed to mark notification as read')
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllReadMutation.mutateAsync()
      toast.success('All notifications marked as read')
    } catch {
      toast.error('Failed to mark all notifications as read')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Notification deleted')
    } catch {
      toast.error('Failed to delete notification')
    }
  }

  const isLoading = notificationsQuery.isLoading

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in-up">
        <div>
          <h1 className="font-headline text-headline-lg text-on-surface">Notifications</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            onClick={handleMarkAllRead}
            loading={markAllReadMutation.isPending}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-3 animate-fade-in-up">
        {/* Category Filter */}
        <div>
          <label className="text-label-sm text-on-surface-variant">Category</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategoryFilter(cat.value)}
                className={cn(
                  'flex items-center gap-2 rounded-radius-lg px-4 py-2 text-label-sm transition-all duration-200',
                  categoryFilter === cat.value
                    ? 'gradient-gold text-on-primary font-bold glow-gold'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
                )}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Priority Filter & Unread Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="text-label-sm text-on-surface-variant">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="mt-1 w-full rounded-radius-lg border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-body-md text-on-surface outline-none focus:border-primary-container"
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="unread-only"
              checked={showUnreadOnly}
              onChange={(e) => setShowUnreadOnly(e.target.checked)}
              className="h-4 w-4 rounded border-outline-variant accent-primary-container"
            />
            <label htmlFor="unread-only" className="text-label-sm text-on-surface-variant cursor-pointer">
              Unread only
            </label>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3 animate-fade-in-up">
        {filteredNotifications.length === 0 ? (
          <Card variant="glass" className="p-10">
            <div className="flex flex-col items-center gap-3">
              {showUnreadOnly ? (
                <>
                  <CheckCircle2 className="h-12 w-12 text-emerald-500/30" />
                  <p className="text-body-lg text-on-surface-variant">All caught up!</p>
                  <p className="text-label-sm text-on-surface-variant/50">No unread notifications</p>
                </>
              ) : (
                <>
                  <BellOff className="h-12 w-12 text-on-surface-variant/30" />
                  <p className="text-body-lg text-on-surface-variant">No notifications</p>
                  <p className="text-label-sm text-on-surface-variant/50">You're all set!</p>
                </>
              )}
            </div>
          </Card>
        ) : (
          filteredNotifications.map((notification, i) => {
            const typeColor = TYPE_COLORS[notification.type] || '#666'
            const typeIcon = TYPE_ICONS[notification.type] || <Bell className="h-5 w-5" />

            return (
              <div
                key={notification.id}
                className={cn(
                  'animate-fade-in-up transition-all duration-200',
                  !notification.read && 'border-l-4',
                )}
                style={{
                  animationDelay: `${i * 40}ms`,
                  borderLeftColor: typeColor,
                }}
              >
                <Card
                  variant="glass"
                  className={cn(
                    'p-5 transition-all duration-200 hover:scale-[1.01]',
                    !notification.read && 'bg-surface-container-low',
                  )}
                >
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div
                      className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-radius-lg"
                      style={{ backgroundColor: `${typeColor}20`, color: typeColor }}
                    >
                      {typeIcon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-body-md font-medium text-on-surface truncate">
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-primary-container" />
                            )}
                          </div>
                          <p className="mt-1 text-body-sm text-on-surface-variant line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <Badge variant="info" size="sm">{notification.type}</Badge>
                            <Badge
                              size="sm"
                              style={{
                                backgroundColor: `${PRIORITIES.find(p => p.value === notification.priority)?.color}20`,
                                color: PRIORITIES.find(p => p.value === notification.priority)?.color,
                              }}
                            >
                              {notification.priority}
                            </Badge>
                            <span className="text-label-sm text-on-surface-variant">
                              {formatDate(notification.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            loading={markReadMutation.isPending}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Mark as read
                          </Button>
                        )}
                        {notification.link && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(notification.link, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Open
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(notification.id)}
                          loading={deleteMutation.isPending}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}