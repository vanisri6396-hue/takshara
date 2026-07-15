import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  mobileNavOpen: boolean
  activeModal: string | null
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setMobileNavOpen: (open: boolean) => void
  toggleMobileNav: () => void
  openModal: (id: string) => void
  closeModal: () => void
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  mobileNavOpen: false,
  activeModal: null,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  toggleMobileNav: () => set((state) => ({ mobileNavOpen: !state.mobileNavOpen })),

  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
}))