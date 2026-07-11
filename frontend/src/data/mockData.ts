/* ──────────────────────────────────────────────────────────────
   Takshara — Mock Data Layer
   All mock data is centralized here. No hardcoded values in components.
   ────────────────────────────────────────────────────────────── */

import type {
  Subject,
  Schedule,
  Assignment,
  AttendanceRecord,
  Note,
  DashboardStats,
  ActivityItem,
  StudyGoal,
} from '@/types/design-system'

/* ──────────────────────────── Subjects ──────────────────────── */

export const SUBJECTS: Subject[] = [
  { id: 'sub-1', name: 'Data Structures', code: 'CS201', color: '#059669', credits: 4 },
  { id: 'sub-2', name: 'Algorithms', code: 'CS202', color: '#2563eb', credits: 4 },
  { id: 'sub-3', name: 'Database Systems', code: 'CS301', color: '#d97706', credits: 3 },
  { id: 'sub-4', name: 'Computer Networks', code: 'CS302', color: '#7c3aed', credits: 3 },
  { id: 'sub-5', name: 'Operating Systems', code: 'CS303', color: '#db2777', credits: 3 },
  { id: 'sub-6', name: 'Software Engineering', code: 'CS401', color: '#0891b2', credits: 3 },
  { id: 'sub-7', name: 'Machine Learning', code: 'CS402', color: '#ca8a04', credits: 4 },
  { id: 'sub-8', name: 'Compiler Design', code: 'CS403', color: '#dc2626', credits: 3 },
]

/* ──────────────────────────── Schedule ──────────────────────── */

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export const SCHEDULE: Schedule[] = [
  { id: 'sched-1', subjectId: 'sub-1', day: 'Monday', startTime: '09:00', endTime: '10:30', room: 'LH-101' },
  { id: 'sched-2', subjectId: 'sub-2', day: 'Monday', startTime: '11:00', endTime: '12:30', room: 'LH-102' },
  { id: 'sched-3', subjectId: 'sub-3', day: 'Monday', startTime: '14:00', endTime: '15:30', room: 'LH-201' },
  { id: 'sched-4', subjectId: 'sub-4', day: 'Tuesday', startTime: '09:00', endTime: '10:30', room: 'LH-103' },
  { id: 'sched-5', subjectId: 'sub-5', day: 'Tuesday', startTime: '11:00', endTime: '12:30', room: 'LH-104' },
  { id: 'sched-6', subjectId: 'sub-1', day: 'Tuesday', startTime: '14:00', endTime: '15:30', room: 'LH-101' },
  { id: 'sched-7', subjectId: 'sub-6', day: 'Wednesday', startTime: '09:00', endTime: '10:30', room: 'LH-201' },
  { id: 'sched-8', subjectId: 'sub-7', day: 'Wednesday', startTime: '11:00', endTime: '12:30', room: 'LH-202' },
  { id: 'sched-9', subjectId: 'sub-2', day: 'Wednesday', startTime: '14:00', endTime: '15:30', room: 'LH-102' },
  { id: 'sched-10', subjectId: 'sub-3', day: 'Thursday', startTime: '09:00', endTime: '10:30', room: 'LH-201' },
  { id: 'sched-11', subjectId: 'sub-8', day: 'Thursday', startTime: '11:00', endTime: '12:30', room: 'LH-301' },
  { id: 'sched-12', subjectId: 'sub-4', day: 'Thursday', startTime: '14:00', endTime: '15:30', room: 'LH-103' },
  { id: 'sched-13', subjectId: 'sub-5', day: 'Friday', startTime: '09:00', endTime: '10:30', room: 'LH-104' },
  { id: 'sched-14', subjectId: 'sub-6', day: 'Friday', startTime: '11:00', endTime: '12:30', room: 'LH-201' },
  { id: 'sched-15', subjectId: 'sub-7', day: 'Friday', startTime: '14:00', endTime: '15:30', room: 'LH-202' },
]

/* ──────────────────────────── Assignments ───────────────────── */

export const ASSIGNMENTS: Assignment[] = [
  { id: 'as-1', title: 'AVL Tree Implementation', subjectId: 'sub-1', dueDate: '2026-07-18T23:59:00', status: 'pending', description: 'Implement AVL tree with insert, delete, and balance operations in C++.' },
  { id: 'as-2', title: 'Graph Traversal Analysis', subjectId: 'sub-2', dueDate: '2026-07-20T23:59:00', status: 'pending', description: 'Compare BFS and DFS performance on different graph structures.' },
  { id: 'as-3', title: 'Normalization Exercise', subjectId: 'sub-3', dueDate: '2026-07-15T23:59:00', status: 'submitted', description: 'Normalize a given database schema to 3NF.' },
  { id: 'as-4', title: 'TCP/IP Protocol Stack', subjectId: 'sub-4', dueDate: '2026-07-22T23:59:00', status: 'pending', description: 'Write a report on the TCP/IP protocol stack with diagrams.' },
  { id: 'as-5', title: 'Process Scheduling Simulator', subjectId: 'sub-5', dueDate: '2026-07-12T23:59:00', status: 'graded', grade: 92, description: 'Implement a process scheduling simulator with FCFS, SJF, and Round Robin.' },
  { id: 'as-6', title: 'SRS Document', subjectId: 'sub-6', dueDate: '2026-07-25T23:59:00', status: 'pending', description: 'Create a Software Requirements Specification for a library management system.' },
  { id: 'as-7', title: 'Linear Regression Model', subjectId: 'sub-7', dueDate: '2026-07-10T23:59:00', status: 'graded', grade: 88, description: 'Implement linear regression from scratch and evaluate on a dataset.' },
  { id: 'as-8', title: 'LR Parser Design', subjectId: 'sub-8', dueDate: '2026-07-28T23:59:00', status: 'pending', description: 'Design and implement an LR parser for a given grammar.' },
]

/* ──────────────────────────── Attendance ────────────────────── */

export const ATTENDANCE: AttendanceRecord[] = [
  { id: 'att-1', subjectId: 'sub-1', date: '2026-07-01', status: 'present' },
  { id: 'att-2', subjectId: 'sub-1', date: '2026-07-03', status: 'present' },
  { id: 'att-3', subjectId: 'sub-1', date: '2026-07-06', status: 'absent' },
  { id: 'att-4', subjectId: 'sub-1', date: '2026-07-08', status: 'present' },
  { id: 'att-5', subjectId: 'sub-1', date: '2026-07-10', status: 'late' },
  { id: 'att-6', subjectId: 'sub-2', date: '2026-07-01', status: 'present' },
  { id: 'att-7', subjectId: 'sub-2', date: '2026-07-03', status: 'present' },
  { id: 'att-8', subjectId: 'sub-2', date: '2026-07-06', status: 'present' },
  { id: 'att-9', subjectId: 'sub-2', date: '2026-07-08', status: 'absent' },
  { id: 'att-10', subjectId: 'sub-2', date: '2026-07-10', status: 'present' },
  { id: 'att-11', subjectId: 'sub-3', date: '2026-07-02', status: 'present' },
  { id: 'att-12', subjectId: 'sub-3', date: '2026-07-04', status: 'late' },
  { id: 'att-13', subjectId: 'sub-3', date: '2026-07-07', status: 'present' },
  { id: 'att-14', subjectId: 'sub-3', date: '2026-07-09', status: 'present' },
  { id: 'att-15', subjectId: 'sub-3', date: '2026-07-11', status: 'absent' },
  { id: 'att-16', subjectId: 'sub-4', date: '2026-07-02', status: 'present' },
  { id: 'att-17', subjectId: 'sub-4', date: '2026-07-04', status: 'present' },
  { id: 'att-18', subjectId: 'sub-4', date: '2026-07-07', status: 'present' },
  { id: 'att-19', subjectId: 'sub-4', date: '2026-07-09', status: 'present' },
  { id: 'att-20', subjectId: 'sub-4', date: '2026-07-11', status: 'present' },
  { id: 'att-21', subjectId: 'sub-5', date: '2026-07-02', status: 'present' },
  { id: 'att-22', subjectId: 'sub-5', date: '2026-07-04', status: 'absent' },
  { id: 'att-23', subjectId: 'sub-5', date: '2026-07-07', status: 'present' },
  { id: 'att-24', subjectId: 'sub-5', date: '2026-07-09', status: 'late' },
  { id: 'att-25', subjectId: 'sub-5', date: '2026-07-11', status: 'present' },
  { id: 'att-26', subjectId: 'sub-6', date: '2026-07-01', status: 'present' },
  { id: 'att-27', subjectId: 'sub-6', date: '2026-07-03', status: 'present' },
  { id: 'att-28', subjectId: 'sub-6', date: '2026-07-06', status: 'present' },
  { id: 'att-29', subjectId: 'sub-6', date: '2026-07-08', status: 'present' },
  { id: 'att-30', subjectId: 'sub-6', date: '2026-07-10', status: 'present' },
  { id: 'att-31', subjectId: 'sub-7', date: '2026-07-01', status: 'present' },
  { id: 'att-32', subjectId: 'sub-7', date: '2026-07-03', status: 'present' },
  { id: 'att-33', subjectId: 'sub-7', date: '2026-07-06', status: 'absent' },
  { id: 'att-34', subjectId: 'sub-7', date: '2026-07-08', status: 'present' },
  { id: 'att-35', subjectId: 'sub-7', date: '2026-07-10', status: 'present' },
  { id: 'att-36', subjectId: 'sub-8', date: '2026-07-02', status: 'present' },
  { id: 'att-37', subjectId: 'sub-8', date: '2026-07-04', status: 'present' },
  { id: 'att-38', subjectId: 'sub-8', date: '2026-07-07', status: 'present' },
  { id: 'att-39', subjectId: 'sub-8', date: '2026-07-09', status: 'present' },
  { id: 'att-40', subjectId: 'sub-8', date: '2026-07-11', status: 'present' },
]

/* ──────────────────────────── Notes ─────────────────────────── */

export const NOTES: Note[] = [
  {
    id: 'note-1',
    title: 'Binary Search Trees',
    content: 'A binary search tree is a data structure that maintains sorted data...',
    subjectId: 'sub-1',
    tags: ['trees', 'search', 'data-structures'],
    createdAt: '2026-07-05T10:30:00',
    updatedAt: '2026-07-05T10:30:00',
  },
  {
    id: 'note-2',
    title: 'Sorting Algorithms Comparison',
    content: 'Quick sort has average O(n log n) time complexity while merge sort...',
    subjectId: 'sub-2',
    tags: ['sorting', 'algorithms', 'complexity'],
    createdAt: '2026-07-06T14:00:00',
    updatedAt: '2026-07-07T09:00:00',
  },
  {
    id: 'note-3',
    title: 'SQL Joins Cheatsheet',
    content: 'INNER JOIN returns records with matching values in both tables...',
    subjectId: 'sub-3',
    tags: ['sql', 'databases', 'joins'],
    createdAt: '2026-07-08T11:00:00',
    updatedAt: '2026-07-08T11:00:00',
  },
  {
    id: 'note-4',
    title: 'OSI Model Layers',
    content: 'The OSI model has 7 layers: Physical, Data Link, Network, Transport...',
    subjectId: 'sub-4',
    tags: ['networking', 'osi', 'protocols'],
    createdAt: '2026-07-09T16:00:00',
    updatedAt: '2026-07-10T08:30:00',
  },
  {
    id: 'note-5',
    title: 'Deadlock Prevention',
    content: 'Deadlock can be prevented by ensuring at least one of the four necessary conditions...',
    subjectId: 'sub-5',
    tags: ['os', 'deadlock', 'concurrency'],
    createdAt: '2026-07-10T09:00:00',
    updatedAt: '2026-07-10T09:00:00',
  },
  {
    id: 'note-6',
    title: 'Agile Methodology Overview',
    content: 'Agile is an iterative approach to software development that emphasizes...',
    subjectId: 'sub-6',
    tags: ['agile', 'methodology', 'scrum'],
    createdAt: '2026-07-11T13:00:00',
    updatedAt: '2026-07-11T13:00:00',
  },
]

/* ──────────────────────────── Dashboard Stats ───────────────── */

export const DASHBOARD_STATS: DashboardStats = {
  totalClasses: 40,
  attendedClasses: 34,
  attendancePercentage: 85,
  pendingAssignments: 5,
  upcomingClasses: 3,
  completedAssignments: 3,
  averageGrade: 90,
}

/* ──────────────────────────── Activity Feed ─────────────────── */

export const ACTIVITY_FEED: ActivityItem[] = [
  { id: 'act-1', type: 'assignment_graded', message: 'Process Scheduling Simulator graded: 92%', timestamp: '2026-07-12T14:00:00', subjectId: 'sub-5' },
  { id: 'act-2', type: 'note_created', message: 'Created note: Agile Methodology Overview', timestamp: '2026-07-11T13:00:00', subjectId: 'sub-6' },
  { id: 'act-3', type: 'attendance', message: 'Marked late for Operating Systems', timestamp: '2026-07-11T09:30:00', subjectId: 'sub-5' },
  { id: 'act-4', type: 'assignment_submitted', message: 'Submitted: Normalization Exercise', timestamp: '2026-07-10T22:00:00', subjectId: 'sub-3' },
  { id: 'act-5', type: 'note_created', message: 'Created note: Deadlock Prevention', timestamp: '2026-07-10T09:00:00', subjectId: 'sub-5' },
  { id: 'act-6', type: 'assignment_graded', message: 'Linear Regression Model graded: 88%', timestamp: '2026-07-10T08:00:00', subjectId: 'sub-7' },
]

/* ──────────────────────────── Study Goals ───────────────────── */

export const STUDY_GOALS: StudyGoal[] = [
  { id: 'goal-1', title: 'Complete Data Structures Practice', target: 10, current: 7, unit: 'problems', subjectId: 'sub-1' },
  { id: 'goal-2', title: 'Review Algorithm Complexity', target: 5, current: 3, unit: 'topics', subjectId: 'sub-2' },
  { id: 'goal-3', title: 'Database Normalization Exercises', target: 8, current: 5, unit: 'exercises', subjectId: 'sub-3' },
]

/* ──────────────────────────── Helper Functions ──────────────── */

export function getSubject(id: string): Subject | undefined {
  return SUBJECTS.find((s) => s.id === id)
}

export function getSubjectByName(name: string): Subject | undefined {
  return SUBJECTS.find((s) => s.name === name)
}

export function getScheduleForDay(day: string): Schedule[] {
  return SCHEDULE.filter((s) => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime))
}

export function getAssignmentsByStatus(status: Assignment['status']): Assignment[] {
  return ASSIGNMENTS.filter((a) => a.status === status)
}

export function getAttendanceForSubject(subjectId: string): AttendanceRecord[] {
  return ATTENDANCE.filter((a) => a.subjectId === subjectId)
}

export function getAttendancePercentage(subjectId: string): number {
  const records = getAttendanceForSubject(subjectId)
  if (records.length === 0) return 0
  const present = records.filter((r) => r.status === 'present' || r.status === 'late').length
  return Math.round((present / records.length) * 100)
}

export function getNotesForSubject(subjectId: string): Note[] {
  return NOTES.filter((n) => n.subjectId === subjectId)
}

export function getUpcomingAssignments(): Assignment[] {
  return ASSIGNMENTS.filter((a) => a.status === 'pending')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
}

export function getTodaySchedule(): Schedule[] {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const today = days[new Date().getDay()]
  return getScheduleForDay(today)
}

export function getCurrentClass(): Schedule | null {
  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const todaySchedule = getTodaySchedule()
  return todaySchedule.find((s) => s.startTime <= currentTime && s.endTime >= currentTime) || null
}

export function getNextClass(): Schedule | null {
  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const todaySchedule = getTodaySchedule()
  return todaySchedule.find((s) => s.startTime > currentTime) || null
}