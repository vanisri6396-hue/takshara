import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  BookOpen,
  ClipboardCheck,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/lib/constants'
import { useUIStore } from '@/stores/uiStore'

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-5 w-5" />,
  Calendar: <Calendar className="h-5 w-5" />,
  ClipboardList: <ClipboardList className="h-5 w-5" />,
  BookOpen: <BookOpen className="h-5 w-5" />,
  ClipboardCheck: <ClipboardCheck className="h-5 w-5" />,
  Sparkles: <Sparkles className="h-5 w-5" />,
}

export function MobileNav() {
  const { mobileNavOpen, setMobileNavOpen } = useUIStore()

  if (!mobileNavOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        onClick={() => setMobileNavOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Nav Panel */}
      <nav
        className="fixed inset-x-0 top-16 z-50 glass-strong rounded-b-radius-xl p-4 lg:hidden"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={() => setMobileNavOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-radius px-4 py-3 text-body-md transition-all duration-200',
                    isActive
                      ? 'bg-primary-container/15 text-primary-container font-medium'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
                  )
                }
              >
                <span className="flex-shrink-0">{iconMap[item.icon]}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}