import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from './ProtectedRoute'
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

import LandingPage from '@/features/landing/LandingPage'

export const router = createBrowserRouter([
  // Public marketing site
  {
    path: '/',
    element: <LandingPage />,
  },
  // Authenticated application (moved behind /app)
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'timetable', element: <TimetablePage /> },
      { path: 'notes', element: <NotesPage /> },
      { path: 'notes/:id', element: <NoteEditorPage /> },
      { path: 'assignments', element: <AssignmentsPage /> },
      { path: 'exams', element: <ExamsPage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'attendance', element: <AttendancePage /> },
      { path: 'ai', element: <AIPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'profile', element: <ProfilePage /> },
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
