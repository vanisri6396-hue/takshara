import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { ROUTES } from './routePaths'
import { AuthGate } from './AuthGate'


/* ──────────────────────────── Page Imports ─────────────────────── */

import DashboardPage from '@/features/dashboard/DashboardPage'
import TimetablePage from '@/features/timetable/TimetablePage'
import NotesPage from '@/features/notes/NotesPage'
import NoteEditorPage from '@/features/notes/NoteEditorPage'
import AssignmentsPage from '@/features/assignments/AssignmentsPage'
import ExamsPage from '@/features/exams/ExamsPage'
import ProjectsPage from '@/features/projects/ProjectsPage'
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
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to={ROUTES.DASHBOARD} replace /> },
      { path: ROUTES.DASHBOARD, element: <DashboardPage /> },
      { path: ROUTES.TIMETABLE, element: <TimetablePage /> },
      { path: ROUTES.NOTES, element: <NotesPage /> },
      { path: ROUTES.NOTE_DETAIL, element: <NoteEditorPage /> },
      { path: ROUTES.ASSIGNMENTS, element: <AssignmentsPage /> },
      { path: '/exams', element: <ExamsPage /> },
      { path: '/projects', element: <ProjectsPage /> },
      { path: ROUTES.ATTENDANCE, element: <AttendancePage /> },
      { path: ROUTES.AI, element: <AIPage /> },
      { path: ROUTES.SETTINGS, element: <SettingsPage /> },
      { path: ROUTES.PROFILE, element: <ProfilePage /> },
    ],
  },
  // Auth routes (aliases to prevent accidental 404s)
  // Keep canonical paths under /auth/*, but also support /login and /register.
  {
    path: '/auth',
    children: [
      {
        path: 'login',
        element: (
          <AuthGate mode="login">
            <LoginPage />
          </AuthGate>
        ),
      },
      {
        path: 'register',
        element: (
          <AuthGate mode="register">
            <RegisterPage />
          </AuthGate>
        ),
      },
    ],
  },
  {
    path: '/login',
    element: (
      <AuthGate mode="login">
        <LoginPage />
      </AuthGate>
    ),
  },
  {
    path: '/register',
    element: (
      <AuthGate mode="register">
        <RegisterPage />
      </AuthGate>
    ),
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
