import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { ROUTES } from './routePaths'

/* ──────────────────────────── Page Imports ─────────────────────── */

import DashboardPage from '@/features/dashboard/DashboardPage'
import TimetablePage from '@/features/timetable/TimetablePage'
import NotesPage from '@/features/notes/NotesPage'
import NoteEditorPage from '@/features/notes/NoteEditorPage'
import AssignmentsPage from '@/features/assignments/AssignmentsPage'
import AttendancePage from '@/features/attendance/AttendancePage'
import AIPage from '@/features/ai-assistant/AIPage'
import SettingsPage from '@/features/settings/SettingsPage'
import ProfilePage from '@/features/profile/ProfilePage'
import LoginPage from '@/features/auth/LoginPage'
import RegisterPage from '@/features/auth/RegisterPage'
import NotFoundPage from '@/features/not-found/NotFoundPage'

/* ──────────────────────────── Router Configuration ────────────── */

export const router = createBrowserRouter([
  {
    path: '/auth',
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <Navigate to={ROUTES.DASHBOARD} replace />,
          },
          {
            path: ROUTES.DASHBOARD,
            element: <DashboardPage />,
          },
          {
            path: ROUTES.TIMETABLE,
            element: <TimetablePage />,
          },
          {
            path: ROUTES.NOTES,
            element: <NotesPage />,
          },
          {
            path: ROUTES.NOTE_DETAIL,
            element: <NoteEditorPage />,
          },
          {
            path: ROUTES.ASSIGNMENTS,
            element: <AssignmentsPage />,
          },
          {
            path: ROUTES.ATTENDANCE,
            element: <AttendancePage />,
          },
          {
            path: ROUTES.AI,
            element: <AIPage />,
          },
          {
            path: ROUTES.SETTINGS,
            element: <SettingsPage />,
          },
          {
            path: ROUTES.PROFILE,
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
