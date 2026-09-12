import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Inbox,
  Star,
  CheckSquare,
  Calendar,
  Bot,
  Settings,
  Sun,
  Moon,
  Plus,
  Search,
  Menu,
  X,
  ChevronRight,
  GraduationCap,
  Sparkles,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAppStore } from '../../stores/appStore'
import { demoStore } from '../../lib/demoStore'

const NAV_ITEMS = [
  { to: '/',            icon: LayoutDashboard, label: 'Dashboard',     id: 'nav-dashboard' },
  { to: '/inbox',       icon: Inbox,           label: 'Smart Inbox',   id: 'nav-inbox' },
  { to: '/important',   icon: Star,            label: 'Important',     id: 'nav-important' },
  { to: '/tasks',       icon: CheckSquare,     label: 'My Tasks',      id: 'nav-tasks' },
  { to: '/calendar',    icon: Calendar,        label: 'Calendar',      id: 'nav-calendar' },
  { to: '/copilot',     icon: Bot,             label: 'AI Copilot',    id: 'nav-copilot' },
  { to: '/settings',    icon: Settings,        label: 'Settings',      id: 'nav-settings' },
]

// ============================================================
// Sidebar (Desktop)
// ============================================================
export function Sidebar() {
  const { theme, setTheme } = useAppStore()
  const profile = demoStore.getProfile()
  const [collapsed, setCollapsed] = useState(false)

  const tasks = demoStore.getTasks()
  const urgentCount = tasks.filter(t => t.priority === 'urgent_important' && t.status !== 'completed').length
  const inbox = demoStore.getInbox()
  const unreadCount = inbox.filter(i => i.status === 'unread').length

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-full transition-all duration-300 border-r border-white/5 bg-gradient-to-b from-[#0b0f19] via-[#090d16] to-[#06080e]',
        collapsed ? 'w-18' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-white/5', collapsed && 'justify-center')}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 via-indigo-500 to-purple-500 shadow-glow-primary flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-white font-bold text-sm tracking-tight leading-tight">Command Center</p>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            </div>
            <p className="text-primary-300/80 text-[10px] font-bold uppercase tracking-wider">Student OS</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(v => !v)}
          className="ml-auto text-slate-500 hover:text-slate-300 transition-colors hidden lg:block p-1 rounded-lg hover:bg-white/5"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronRight className={cn('w-4 h-4 transition-transform', !collapsed && 'rotate-180')} />
        </button>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            id={item.id}
            className={({ isActive }) =>
              cn(
                'sidebar-link relative group',
                isActive && 'active',
                collapsed && 'justify-center px-2'
              )
            }
          >
            <div className="relative shrink-0">
              <item.icon className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
              {item.to === '/inbox' && unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              {item.to === '/tasks' && urgentCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 bg-amber-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-xs">
                  {urgentCount > 9 ? '9+' : urgentCount}
                </span>
              )}
            </div>
            {!collapsed && <span className="truncate text-xs font-semibold">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom User & Theme Dock */}
      <div className={cn('p-3 space-y-2 border-t border-white/5 bg-black/20')}>
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={cn('sidebar-link w-full text-xs hover:text-white', collapsed && 'justify-center')}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400 shrink-0" /> : <Moon className="w-4 h-4 text-indigo-400 shrink-0" />}
          {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* Profile Card */}
        <NavLink
          to="/settings"
          className={cn(
            'flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 group',
            collapsed && 'justify-center p-1.5'
          )}
        >
          <div className="relative shrink-0">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/20 group-hover:ring-primary-400 transition-all"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#0b0f19]" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden min-w-0 flex-1">
              <p className="text-white text-xs font-bold truncate group-hover:text-primary-300 transition-colors">
                {profile.name}
              </p>
              <p className="text-slate-400 text-[10px] truncate">
                {profile.email || 'Online'}
              </p>
            </div>
          )}
        </NavLink>
      </div>
    </aside>
  )
}

// ============================================================
// Mobile Bottom Navigation
// ============================================================
export function MobileNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const MOBILE_MAIN = NAV_ITEMS.slice(0, 5)

  return (
    <>
      {/* Bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 safe-area-bottom">
        <div className="flex items-center justify-around py-1">
          {MOBILE_MAIN.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              id={`mobile-${item.id}`}
              className={({ isActive }) =>
                cn(
                  'flex-1 flex flex-col items-center gap-1 py-2 px-1 text-xs font-medium transition-colors select-none',
                  isActive
                    ? 'text-primary-600 dark:text-primary-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] tracking-tight">{item.label.split(' ')[0]}</span>
            </NavLink>
          ))}
          <button
            id="mobile-nav-more"
            onClick={() => setMenuOpen(v => !v)}
            className="flex-1 flex flex-col items-center gap-1 py-2 px-1 text-xs font-medium text-slate-500 dark:text-slate-400"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px]">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setMenuOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl p-5 border-t border-slate-200 dark:border-slate-800 animate-slide-up space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <p className="font-bold text-sm text-slate-900 dark:text-slate-100">All Navigation</p>
              <button onClick={() => setMenuOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {NAV_ITEMS.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all',
                      isActive
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                        : 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60'
                    )
                  }
                >
                  <item.icon className="w-4 h-4 text-primary-500" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ============================================================
// Top Bar (Unified Desktop & Mobile Header)
// ============================================================
export function TopBar({
  onOpenPalette,
  onOpenAddTask,
  onOpenAddInbox,
}: {
  onOpenPalette?: () => void
  onOpenAddTask?: () => void
  onOpenAddInbox?: () => void
}) {
  const location = useLocation()
  const { theme, setTheme } = useAppStore()
  const profile = demoStore.getProfile()

  const currentNav = NAV_ITEMS.find(n =>
    n.to === '/' ? location.pathname === '/' : location.pathname.startsWith(n.to)
  )
  const pageTitle = currentNav?.label ?? 'Command Center'
  const PageIcon = currentNav?.icon ?? LayoutDashboard

  return (
    <header className="sticky top-0 z-30 bg-white/75 dark:bg-slate-950/75 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between px-4 lg:px-6 py-2.5 transition-all">
      {/* Left: Active view indicator */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-50 to-indigo-50 dark:from-primary-950/60 dark:to-indigo-950/60 border border-primary-200/60 dark:border-primary-800/60 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0 shadow-2xs">
          <PageIcon className="w-4 h-4" />
        </div>
        <div>
          <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight tracking-tight truncate">{pageTitle}</h2>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider hidden sm:block">College Command Center</p>
        </div>
      </div>

      {/* Center: Command Palette Trigger */}
      <button
        onClick={onOpenPalette}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-900 text-slate-400 hover:border-primary-300 dark:hover:border-primary-700 hover:text-slate-700 dark:hover:text-slate-200 transition-all text-xs w-44 sm:w-64 md:w-72 lg:w-80 shadow-2xs group cursor-pointer"
        title="Quick Search & Command Palette (Ctrl+K or Cmd+K)"
      >
        <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-500 transition-colors shrink-0" />
        <span className="flex-1 text-left truncate font-medium">Search or jump to...</span>
        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          ⌘K
        </span>
      </button>

      {/* Right: Quick actions & Profile */}
      <div className="flex items-center gap-2">
        {onOpenAddTask && (
          <button
            onClick={onOpenAddTask}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white shadow-sm hover:shadow-glow-primary active:scale-[0.98] transition-all cursor-pointer"
            title="Create Task"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Task</span>
          </button>
        )}

        {onOpenAddInbox && (
          <button
            onClick={onOpenAddInbox}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 active:scale-[0.98] transition-all cursor-pointer"
            title="Capture Notice"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary-500" />
            <span>Notice</span>
          </button>
        )}

        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Toggle theme"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        <NavLink to="/settings" className="shrink-0 ml-1" title="Account Settings">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="w-8 h-8 rounded-xl object-cover ring-2 ring-primary-500/30 hover:ring-primary-500 transition-all shadow-2xs"
            />
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {profile.name.charAt(0)}
            </div>
          )}
        </NavLink>
      </div>
    </header>
  )
}

// ============================================================
// Page Wrapper
// ============================================================
export function PageLayout({ children, title, subtitle, action }: {
  children: React.ReactNode
  title?: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col h-full animate-fade-in">
      {(title || action) && (
        <div className="flex items-center justify-between px-6 pt-6 pb-2 shrink-0">
          <div>
            {title && <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h1>}
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-6 py-4 pb-24 md:pb-6">
        {children}
      </div>
    </div>
  )
}
