import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { ROUTES } from './routePaths'

/* ──────────────────────────── Lazy-loaded Pages ───────────────── */

const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'))
const TimetablePage = lazy(() => import('@/features/timetable/TimetablePage'))
const NotesPage = lazy(() => import('@/features/notes/NotesPage'))
const NoteEditorPage = lazy(() => import('@/features/notes/NoteEditorPage'))
const AssignmentsPage = lazy(() => import('@/features/assignments/AssignmentsPage'))
const AttendancePage = lazy(() => import('@/features/attendance/AttendancePage'))
const AIPage = lazy(() => import('@/features/ai-assistant/AIPage'))
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage'))
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage'))
const LoginPage = lazy(() => import('@/features/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/features/auth/RegisterPage'))
const NotFoundPage = lazy(() => import('@/features/not-found/NotFoundPage'))

/* ──────────────────────────── Loading Fallback ────────────────── */

function PageLoader() {
  return (
    <div className="flex h-full min-h-[400px] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-container border-t-transparent" />
        <p className="text-label-sm text-on-surface-variant">Loading...</p>
      </div>
    </div>
  )
}

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

/* ──────────────────────────── Router Configuration ────────────── */

export const router = createBrowserRouter([
  {
    path: '/auth',
    children: [
      {
        path: 'login',
        element: (
          <SuspenseWrapper>
            <LoginPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'register',
        element: (
          <SuspenseWrapper>
            <RegisterPage />
          </SuspenseWrapper>
        ),
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
            element: (
              <SuspenseWrapper>
                <DashboardPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: ROUTES.TIMETABLE,
            element: (
              <SuspenseWrapper>
                <TimetablePage />
              </SuspenseWrapper>
            ),
          },
          {
            path: ROUTES.NOTES,
            element: (
              <SuspenseWrapper>
                <NotesPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: ROUTES.NOTE_DETAIL,
            element: (
              <SuspenseWrapper>
                <NoteEditorPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: ROUTES.ASSIGNMENTS,
            element: (
              <SuspenseWrapper>
                <AssignmentsPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: ROUTES.ATTENDANCE,
            element: (
              <SuspenseWrapper>
                <AttendancePage />
              </SuspenseWrapper>
            ),
          },
          {
            path: ROUTES.AI,
            element: (
              <SuspenseWrapper>
                <AIPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: ROUTES.SETTINGS,
            element: (
              <SuspenseWrapper>
                <SettingsPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: ROUTES.PROFILE,
            element: (
              <SuspenseWrapper>
                <ProfilePage />
              </SuspenseWrapper>
            ),
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: (
      <SuspenseWrapper>
        <NotFoundPage />
      </SuspenseWrapper>
    ),
  },
])