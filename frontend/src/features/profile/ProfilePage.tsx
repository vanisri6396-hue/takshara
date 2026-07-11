import {
  Mail,
  GraduationCap,
  Calendar,
  Award,
  BookOpen,
  Clock,
  TrendingUp,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { DASHBOARD_STATS, SUBJECTS } from '@/data/mockData'

export default function ProfilePage() {
  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="font-headline text-headline-lg text-on-surface">Profile</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">Your academic profile</p>
      </div>

      {/* Profile Card */}
      <div className="animate-fade-in-up">
        <GlassCard className="relative overflow-hidden p-6">
          <div className="absolute right-0 top-0 h-40 w-40 translate-x-12 -translate-y-12 rounded-full bg-primary-container/10 blur-3xl" />
          <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Avatar alt="Student" size="xl" fallback="ST" />
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <h2 className="font-headline text-headline-lg text-on-surface">Student</h2>
              <p className="text-body-md text-on-surface-variant">Computer Science · Year 3</p>
              <div className="mt-3 flex flex-wrap justify-center gap-3 sm:justify-start">
                <span className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
                  <Mail className="h-3.5 w-3.5" />
                  student@university.edu
                </span>
                <span className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
                  <GraduationCap className="h-3.5 w-3.5" />
                  CS2024-001
                </span>
                <span className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined 2024
                </span>
              </div>
            </div>
            <Badge variant="success" size="md" className="flex-shrink-0">
              Active Student
            </Badge>
          </div>
        </GlassCard>
      </div>

      {/* Stats Grid */}
      <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-radius bg-emerald-500/15 text-emerald-400">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant">Avg. Grade</p>
                <p className="font-headline text-headline-md text-on-surface">
                  {DASHBOARD_STATS.averageGrade}%
                </p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-radius bg-blue-500/15 text-blue-400">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant">Subjects</p>
                <p className="font-headline text-headline-md text-on-surface">
                  {SUBJECTS.length}
                </p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-radius bg-amber-500/15 text-amber-400">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant">Attendance</p>
                <p className="font-headline text-headline-md text-on-surface">
                  {DASHBOARD_STATS.attendancePercentage}%
                </p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-radius bg-primary-container/15 text-primary-container">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant">Completed</p>
                <p className="font-headline text-headline-md text-on-surface">
                  {DASHBOARD_STATS.completedAssignments}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Enrolled Subjects */}
      <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <Card variant="glass" className="p-5">
          <h3 className="mb-4 font-headline text-headline-md text-on-surface">
            Enrolled Subjects
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SUBJECTS.map((subject, i) => (
              <div
                key={subject.id}
                className="flex items-center gap-3 rounded-radius-lg border border-outline-variant/10 bg-surface-container-low p-3 transition-all duration-200 hover:border-outline-variant/30 animate-fade-in-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-radius text-label-sm font-bold"
                  style={{
                    backgroundColor: `${subject.color}20`,
                    color: subject.color,
                  }}
                >
                  {subject.code.slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body-md font-medium text-on-surface">
                    {subject.name}
                  </p>
                  <p className="text-label-sm text-on-surface-variant">
                    {subject.code} · {subject.credits} credits
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}