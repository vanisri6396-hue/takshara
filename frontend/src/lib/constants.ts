/* ──────────────────────────── Route Paths ─────────────────────── */

export const ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  DASHBOARD: '/dashboard',
  TIMETABLE: '/timetable',
  NOTES: '/notes',
  NOTE_DETAIL: '/notes/:id',
  ASSIGNMENTS: '/assignments',
  ATTENDANCE: '/attendance',
  AI: '/ai',
  SETTINGS: '/settings',
} as const

/* ──────────────────────────── Navigation ──────────────────────── */

export const NAV_ITEMS = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: 'LayoutDashboard' },
  { label: 'Timetable', path: ROUTES.TIMETABLE, icon: 'Calendar' },
  { label: 'Assignments', path: ROUTES.ASSIGNMENTS, icon: 'ClipboardList' },
  { label: 'Notes', path: ROUTES.NOTES, icon: 'BookOpen' },
  { label: 'Attendance', path: ROUTES.ATTENDANCE, icon: 'ClipboardCheck' },
  { label: 'AI Assistant', path: ROUTES.AI, icon: 'Sparkles' },
] as const

/* ──────────────────────────── App Metadata ────────────────────── */

export const APP_NAME = 'Takshara'
export const APP_TAGLINE = 'AI-Powered Student OS'

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