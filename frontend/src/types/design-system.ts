import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'

/* ──────────────────────────── Layout ──────────────────────────── */

export interface LayoutProps {
  children: ReactNode
}

/* ──────────────────────────── Button ──────────────────────────── */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
  as?: ElementType
}

/* ──────────────────────────── Input ──────────────────────────── */

export interface InputProps extends ComponentPropsWithoutRef<'input'> {
  label?: string
  error?: string
  icon?: ReactNode
  helperText?: string
}

/* ──────────────────────────── Card ──────────────────────────── */

export type CardVariant = 'default' | 'featured' | 'glass'

export interface CardProps extends ComponentPropsWithoutRef<'div'> {
  variant?: CardVariant
  as?: ElementType
}

/* ──────────────────────────── Badge ──────────────────────────── */

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral'

export interface BadgeProps extends ComponentPropsWithoutRef<'span'> {
  variant?: BadgeVariant
  size?: 'sm' | 'md'
}

/* ──────────────────────────── Avatar ──────────────────────────── */

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

export interface AvatarProps extends ComponentPropsWithoutRef<'div'> {
  src?: string
  alt?: string
  fallback?: string
  size?: AvatarSize
}

/* ──────────────────────────── Modal ──────────────────────────── */

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
}

/* ──────────────────────────── Subject Chip ─────────────────────── */

export interface SubjectChipProps {
  label: string
  color?: string
  size?: 'sm' | 'md'
}

/* ──────────────────────────── Navigation ──────────────────────── */

export interface NavItem {
  label: string
  path: string
  icon: string
  badge?: number
}

/* ──────────────────────────── Data Types ──────────────────────── */

export interface Subject {
  id: string
  name: string
  code: string
  color: string
  credits: number
}

export interface Schedule {
  id: string
  subjectId: string
  facultyName: string
  day: string
  startTime: string
  endTime: string
  room: string
  classType: 'theory' | 'lab' | 'tutorial' | 'seminar'
  notes: string
  subjectColor: string
  subjects?: { name: string; code: string; color: string }
}

export interface Assignment {
  id: string
  title: string
  subjectId: string
  description: string
  dueDate: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'submitted' | 'graded'
  estimatedStudyTime: number
  attachmentLink?: string
  grade?: number
  reminder?: string
  progress?: number
  subjects?: { name: string; code: string; color: string }
}

export interface AttendanceRecord {
  id: string
  subjectId: string
  date: string
  status: 'present' | 'absent' | 'late'
  subjects?: { name: string; code: string; color: string }
}

export interface Note {
  id: string
  title: string
  content: string
  subjectId?: string
  tags: string[]
  createdAt: string
  updatedAt: string
  subjects?: { name: string; code: string; color: string } | null
}

/* ──────────────────────────── Exam ──────────────────────────── */

export interface Exam {
  id: string
  title: string
  subjectId: string
  date: string
  time: string
  duration: string
  room: string
  syllabus: string
  maxMarks: number
  status: 'upcoming' | 'completed' | 'cancelled'
  subjects?: { name: string; code: string; color: string }
}

/* ──────────────────────────── Project ──────────────────────────── */

export interface Project {
  id: string
  title: string
  subjectId: string
  description: string
  dueDate: string
  status: 'pending' | 'in_progress' | 'completed'
  progress: number
  technologies: string[]
  subjects?: { name: string; code: string; color: string }
}

/* ──────────────────────────── Notification ──────────────────────── */

export type NotificationType = 
  | 'assignment'
  | 'timetable'
  | 'attendance'
  | 'reminder'
  | 'system'
  | 'achievement'

export type NotificationPriority = 'low' | 'medium' | 'high'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  priority: NotificationPriority
  read: boolean
  link?: string
  createdAt: string
}

/* ──────────────────────────── Activity ──────────────────────────── */

export type ActivityType = 
  | 'assignment_created'
  | 'assignment_submitted'
  | 'assignment_graded'
  | 'note_created'
  | 'attendance_marked'
  | 'exam_created'
  | 'project_created'
  | 'goal_created'
  | 'goal_completed'

export interface Activity {
  id: string
  type: ActivityType
  message: string
  timestamp: string
  subjectId?: string
  link?: string
}

/* ──────────────────────────── Dashboard ──────────────────────── */

export interface DashboardStats {
  totalClasses: number
  attendedClasses: number
  attendancePercentage: number
  pendingAssignments: number
  upcomingClasses: number
  completedAssignments: number
  averageGrade: number
  assignmentsDueToday: number
  assignmentsDueTomorrow: number
  overdueAssignments: number
  upcomingExams: number
  completionPercentage: number
  weeklyAttendance: number[]
  weeklyLabels: string[]
}

export interface ActivityItem {
  id: string
  type: ActivityType
  message: string
  timestamp: string
  subjectId?: string
}

export interface StudyGoal {
  id: string
  title: string
  target: number
  current: number
  unit: string
  subjectId?: string
  completed?: boolean
}

export interface Settings {
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