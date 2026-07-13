import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  BookOpen,
  TrendingUp,
  ClipboardCheck,
  Sparkles,
  ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_ITEMS, APP_NAME } from '@/lib/constants'
import { useUIStore } from '@/stores/uiStore'

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-5 w-5" />,
  Calendar: <Calendar className="h-5 w-5" />,
  ClipboardList: <ClipboardList className="h-5 w-5" />,
  BookOpen: <BookOpen className="h-5 w-5" />,
  TrendingUp: <TrendingUp className="h-5 w-5" />,
  ClipboardCheck: <ClipboardCheck className="h-5 w-5" />,
  Sparkles: <Sparkles className="h-5 w-5" />,
}

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-outline-variant/20 bg-surface transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16',
      )}
    >
      {/* Logo Area */}
      <div
        className={cn(
          'flex h-16 items-center border-b border-outline-variant/20 px-4',
          !sidebarOpen && 'justify-center px-0',
        )}
      >
        {sidebarOpen ? (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-radius bg-primary-container text-label-sm font-bold text-on-primary-container">
              T
            </div>
            <span className="font-headline text-headline-md text-on-surface">
              {APP_NAME}
            </span>
          </div>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-radius bg-primary-container text-label-sm font-bold text-on-primary-container">
            T
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 scrollbar-thin">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-radius px-3 py-2.5 text-body-md transition-all duration-200',
                    isActive
                      ? 'bg-primary-container/15 text-primary-container font-medium'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
                    !sidebarOpen && 'justify-center px-0',
                  )
                }
              >
                <span className="flex-shrink-0">{iconMap[item.icon]}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-outline-variant/20 p-2">
        <button
          onClick={toggleSidebar}
          className={cn(
            'flex w-full items-center gap-3 rounded-radius px-3 py-2 text-body-md text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface',
            !sidebarOpen && 'justify-center px-0',
          )}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <ChevronLeft
            className={cn(
              'h-5 w-5 transition-transform duration-300',
              !sidebarOpen && 'rotate-180',
            )}
          />
          {sidebarOpen && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}