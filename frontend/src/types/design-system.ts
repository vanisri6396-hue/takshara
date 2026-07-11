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
  day: string
  startTime: string
  endTime: string
  room: string
}

export interface Assignment {
  id: string
  title: string
  subjectId: string
  dueDate: string
  status: 'pending' | 'submitted' | 'graded'
  grade?: number
  description?: string
}

export interface AttendanceRecord {
  id: string
  subjectId: string
  date: string
  status: 'present' | 'absent' | 'late'
}

export interface Note {
  id: string
  title: string
  content: string
  subjectId?: string
  tags: string[]
  createdAt: string
  updatedAt: string
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
}

export interface ActivityItem {
  id: string
  type: 'assignment_graded' | 'assignment_submitted' | 'note_created' | 'attendance' | 'reminder'
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
}
