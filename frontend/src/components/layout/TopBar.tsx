import { Bell, Search, Menu } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { Avatar } from '@/components/ui/Avatar'

export function TopBar() {
  const { toggleMobileNav } = useUIStore()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-outline-variant/20 bg-surface/80 backdrop-blur-xl px-4 lg:px-6">
      {/* Left: Mobile Menu Toggle */}
      <button
        onClick={toggleMobileNav}
        className="flex items-center justify-center rounded-radius p-2 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface lg:hidden"
        aria-label="Toggle mobile navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Center/Spacer */}
      <div className="hidden lg:flex lg:flex-1" />

      {/* Right: Actions */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Search */}
        <button
          className="flex items-center justify-center rounded-radius p-2 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Notifications */}
        <button
          className="relative flex items-center justify-center rounded-radius p-2 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-primary-container" />
        </button>

        {/* Profile */}
        <Avatar alt="Student" size="sm" />
      </div>
    </header>
  )
}