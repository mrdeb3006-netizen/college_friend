import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Sidebar, MobileNav, TopBar } from './components/layout/Navigation'
import { initTheme } from './stores/appStore'
import { demoStore } from './lib/demoStore'

// Pages (lazy loaded)
import Dashboard from './pages/Dashboard'
import InboxPage from './pages/Inbox'
import ImportantPage from './pages/Important'
import TasksPage from './pages/Tasks'
import CalendarPage from './pages/Calendar'
import CopilotPage from './pages/Copilot'
import SettingsPage from './pages/Settings'
import Onboarding from './pages/Onboarding'

import CommandPalette from './components/ui/CommandPalette'
import AddTaskModal from './components/tasks/AddTaskModal'
import AddInboxModal from './components/inbox/AddInboxModal'

// ============================================================
// Protected App Layout
// ============================================================
function AppLayout() {
  const location = useLocation()
  const [paletteOpen, setPaletteOpen] = React.useState(false)
  const [addTaskOpen, setAddTaskOpen] = React.useState(false)
  const [addInboxOpen, setAddInboxOpen] = React.useState(false)

  // Global Ctrl+K / Cmd+K listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen(v => !v)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-[#06090f] text-slate-900 dark:text-slate-100 overflow-hidden select-none relative transition-colors duration-300">
      {/* Ambient Studio Aurora Glows */}
      <div className="pointer-events-none fixed -top-32 left-1/4 w-[600px] h-[450px] bg-gradient-to-br from-primary-500/10 to-indigo-600/10 dark:from-primary-600/15 dark:to-indigo-600/15 rounded-full blur-[130px] -z-10" />
      <div className="pointer-events-none fixed top-1/3 -right-24 w-[500px] h-[450px] bg-gradient-to-br from-purple-500/10 to-pink-500/5 dark:from-purple-600/12 dark:to-pink-600/8 rounded-full blur-[140px] -z-10" />
      <div className="pointer-events-none fixed -bottom-24 left-1/3 w-[600px] h-[400px] bg-gradient-to-tr from-sky-500/10 to-teal-500/5 dark:from-sky-600/12 dark:to-teal-600/8 rounded-full blur-[140px] -z-10" />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <TopBar
          onOpenPalette={() => setPaletteOpen(true)}
          onOpenAddTask={() => setAddTaskOpen(true)}
          onOpenAddInbox={() => setAddInboxOpen(true)}
        />

        {/* Page content with smooth route transition */}
        <main className="flex-1 overflow-hidden relative">
          <div key={location.pathname} className="h-full w-full animate-fade-in will-change-transform">
            <Routes location={location}>
              <Route path="/"          element={<Dashboard />} />
              <Route path="/inbox"     element={<InboxPage />} />
              <Route path="/important" element={<ImportantPage />} />
              <Route path="/tasks"     element={<TasksPage />} />
              <Route path="/calendar"  element={<CalendarPage />} />
              <Route path="/copilot"   element={<CopilotPage />} />
              <Route path="/settings"  element={<SettingsPage />} />
              <Route path="*"          element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>

        {/* Mobile bottom nav */}
        <MobileNav />
      </div>

      {/* Command Palette */}
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onOpenAddTask={() => setAddTaskOpen(true)}
        onOpenAddInbox={() => setAddInboxOpen(true)}
      />

      {/* Global Quick Action Modals */}
      <AddTaskModal
        open={addTaskOpen}
        onClose={() => setAddTaskOpen(false)}
        onSave={() => setAddTaskOpen(false)}
      />
      <AddInboxModal
        open={addInboxOpen}
        onClose={() => setAddInboxOpen(false)}
        onSave={() => setAddInboxOpen(false)}
      />
    </div>
  )
}

// ============================================================
// Root App
// ============================================================
export default function App() {
  useEffect(() => {
    initTheme()
  }, [])

  const onboardingComplete = demoStore.isOnboardingComplete()

  return (
    <BrowserRouter>
      <Routes>
        {/* Onboarding route */}
        <Route
          path="/onboarding"
          element={onboardingComplete ? <Navigate to="/" replace /> : <Onboarding />}
        />

        {/* App routes — redirect to onboarding if not complete */}
        <Route
          path="/*"
          element={
            onboardingComplete ? (
              <AppLayout />
            ) : (
              <Navigate to="/onboarding" replace />
            )
          }
        />
      </Routes>

      {/* Global toast notifications */}
      <Toaster
        position="bottom-right"
        gutter={8}
        toastOptions={{
          className: 'text-sm font-medium',
          style: {
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
    </BrowserRouter>
  )
}
