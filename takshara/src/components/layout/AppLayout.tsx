import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { MobileNav } from './MobileNav'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const { sidebarOpen } = useUIStore()

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar - Desktop */}
      <Sidebar />

      {/* Mobile Navigation Overlay */}
      <MobileNav />

      {/* Main Content Area */}
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-300',
          sidebarOpen ? 'ml-64' : 'ml-16',
        )}
      >
        <TopBar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto w-full max-w-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}