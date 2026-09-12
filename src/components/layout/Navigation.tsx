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
  GraduationCap,
  Moon,
  Sun,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAppStore } from '../../stores/appStore'
import { demoStore } from '../../lib/demoStore'

const NAV_ITEMS = [
  { to: '/',            icon: LayoutDashboard, label: 'Dashboard',     id: 'nav-dashboard' },
  { to: '/inbox',       icon: Inbox,           label: 'College Inbox', id: 'nav-inbox' },
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
        'hidden md:flex flex-col h-full transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
      style={{ background: 'var(--sidebar-bg)' }}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5', collapsed && 'justify-center')}>
        <div className="w-8 h-8 rounded-xl bg-primary-500 flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white font-bold text-sm leading-tight">College</p>
            <p className="text-primary-300 text-xs font-medium">Command Center</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(v => !v)}
          className="ml-auto text-slate-500 hover:text-slate-300 transition-colors hidden lg:block"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronRight className={cn('w-4 h-4 transition-transform', !collapsed && 'rotate-180')} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            id={item.id}
            className={({ isActive }) =>
              cn('sidebar-link', isActive && 'active')
            }
          >
            <div className="relative shrink-0">
              <item.icon className="w-5 h-5" />
              {item.to === '/inbox' && unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              {item.to === '/tasks' && urgentCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {urgentCount > 9 ? '9+' : urgentCount}
                </span>
              )}
            </div>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className={cn('p-3 space-y-2 border-t border-white/10')}>
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={cn('sidebar-link w-full', collapsed && 'justify-center')}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
          {!collapsed && <span className="text-xs">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* Profile */}
        <NavLink
          to="/settings"
          className={cn(
            'flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/10 transition-all group',
            collapsed && 'justify-center px-0'
          )}
          title="Account Settings"
        >
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-400/50 shrink-0 group-hover:ring-primary-400 transition-all"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
              {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
          )}
          {!collapsed && (
            <div className="overflow-hidden min-w-0">
              <p className="text-white text-sm font-semibold truncate group-hover:text-primary-300 transition-colors">
                {profile.name}
              </p>
              <p className="text-slate-400 text-xs truncate">
                {profile.email || 'Personal Command Center'}
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 safe-area-bottom">
        <div className="flex">
          {MOBILE_MAIN.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              id={`mobile-${item.id}`}
              className={({ isActive }) =>
                cn(
                  'flex-1 flex flex-col items-center gap-0.5 py-2.5 px-1 text-xs font-medium transition-colors',
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-slate-500 dark:text-slate-400'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label.split(' ')[0]}</span>
            </NavLink>
          ))}
          {/* More button */}
          <button
            id="mobile-nav-more"
            onClick={() => setMenuOpen(v => !v)}
            className="flex-1 flex flex-col items-center gap-0.5 py-2.5 px-1 text-xs font-medium text-slate-500 dark:text-slate-400"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px]">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-800 rounded-t-2xl p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-slate-900 dark:text-slate-100">Menu</p>
              <button onClick={() => setMenuOpen(false)} className="btn-ghost p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            {NAV_ITEMS.slice(5).map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// ============================================================
// Top Bar (mobile header)
// ============================================================
export function TopBar() {
  const location = useLocation()
  const { theme, setTheme } = useAppStore()
  const profile = demoStore.getProfile()

  const pageTitle = NAV_ITEMS.find(n =>
    n.to === '/' ? location.pathname === '/' : location.pathname.startsWith(n.to)
  )?.label ?? 'College Command Center'

  return (
    <header className="md:hidden sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center shadow-sm">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{pageTitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <NavLink to="/settings" className="shrink-0" title="Profile Settings">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-primary-500"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-primary-600 text-white font-bold text-xs flex items-center justify-center">
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
    <div className="flex flex-col h-full">
      {(title || action) && (
        <div className="flex items-center justify-between px-6 pt-6 pb-2 shrink-0">
          <div>
            {title && <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>}
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
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
