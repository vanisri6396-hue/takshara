/* ──────────────────────────── Route Paths ─────────────────────── */

export const ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  DASHBOARD: '/app/dashboard',
  TIMETABLE: '/app/timetable',
  NOTES: '/app/notes',
  NOTE_DETAIL: '/app/notes/:id',
  ASSIGNMENTS: '/app/assignments',
  EXAMS: '/app/exams',
  PROJECTS: '/app/projects',
  ATTENDANCE: '/app/attendance',
  AI: '/app/ai',
  SETTINGS: '/app/settings',
  PROFILE: '/app/profile',
} as const

/* ──────────────────────────── Navigation ──────────────────────── */

export const NAV_ITEMS = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: 'LayoutDashboard' },
  { label: 'Timetable', path: ROUTES.TIMETABLE, icon: 'Calendar' },
  { label: 'Assignments', path: ROUTES.ASSIGNMENTS, icon: 'ClipboardList' },
  { label: 'Exams', path: ROUTES.EXAMS, icon: 'BookOpen' },
  { label: 'Projects', path: ROUTES.PROJECTS, icon: 'TrendingUp' },
  { label: 'Notes', path: ROUTES.NOTES, icon: 'BookOpen' },
  { label: 'Attendance', path: ROUTES.ATTENDANCE, icon: 'ClipboardCheck' },
  { label: 'AI Assistant', path: ROUTES.AI, icon: 'Sparkles' },
] as const

/* ──────────────────────────── App Metadata ────────────────────── */

export const APP_NAME = 'Takshara'
export const APP_TAGLINE = 'Student Operating System'

/* ──────────────────────────── Subject Colors ──────────────────── */

export const SUBJECT_COLORS = [
  '#059669', // Emerald
  '#2563eb', // Royal Blue
  '#d97706', // Amber
  '#7c3aed', // Violet
  '#db2777', // Pink
  '#0891b2', // Cyan
  '#ca8a04', // Yellow
  '#dc2626', // Red
] as const

/* ──────────────────────────── Attendance ──────────────────────── */

export const ATTENDANCE_THRESHOLD = 75
export const ATTENDANCE_COLORS = {
  present: '#059669',
  absent: '#dc2626',
  late: '#d97706',
} as const