import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppStore {
  theme: 'light' | 'dark' | 'system'
  setTheme: (t: 'light' | 'dark' | 'system') => void
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  activeFilter: string
  setActiveFilter: (f: string) => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
      },
      sidebarOpen: true,
      setSidebarOpen: (v) => set({ sidebarOpen: v }),
      searchQuery: '',
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      activeFilter: 'all',
      setActiveFilter: (activeFilter) => set({ activeFilter }),
    }),
    {
      name: 'ccc-app-store',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
)

export function applyTheme(theme: 'light' | 'dark' | 'system') {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else if (theme === 'light') {
    root.classList.remove('dark')
  } else {
    // System
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.toggle('dark', prefersDark)
  }
}

export function initTheme() {
  const stored = localStorage.getItem('ccc-app-store')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      const theme = parsed.state?.theme || 'system'
      applyTheme(theme)
    } catch {
      applyTheme('system')
    }
  } else {
    applyTheme('system')
  }
}
