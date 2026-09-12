import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, CheckSquare, Inbox, Calendar, Bot, Settings, Star,
  Plus, Moon, Sun, ArrowRight, CornerDownLeft, Sparkles
} from 'lucide-react'
import { demoStore } from '../../lib/demoStore'
import { useAppStore } from '../../stores/appStore'
import { PRIORITIES } from '../../lib/utils'
import type { Task, InboxItem } from '../../lib/types'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  onOpenAddTask: () => void
  onOpenAddInbox: () => void
}

interface CommandItem {
  id: string
  title: string
  category: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  action: () => void
}

export default function CommandPalette({
  open,
  onClose,
  onOpenAddTask,
  onOpenAddInbox,
}: CommandPaletteProps) {
  const navigate = useNavigate()
  const { theme, setTheme } = useAppStore()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const tasks = demoStore.getTasks()
  const inbox = demoStore.getInbox()

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Navigation pages
  const navActions: CommandItem[] = [
    { id: 'p-dash', title: 'Go to Dashboard', category: 'Navigation', icon: Search, action: () => navigate('/') },
    { id: 'p-inbox', title: 'Go to College Inbox', category: 'Navigation', icon: Inbox, action: () => navigate('/inbox') },
    { id: 'p-important', title: 'Go to Important Notices', category: 'Navigation', icon: Star, action: () => navigate('/important') },
    { id: 'p-tasks', title: 'Go to My Tasks', category: 'Navigation', icon: CheckSquare, action: () => navigate('/tasks') },
    { id: 'p-cal', title: 'Go to Calendar', category: 'Navigation', icon: Calendar, action: () => navigate('/calendar') },
    { id: 'p-copilot', title: 'Chat with AI Copilot', category: 'Navigation', icon: Bot, action: () => navigate('/copilot') },
    { id: 'p-settings', title: 'Go to Settings', category: 'Navigation', icon: Settings, action: () => navigate('/settings') },
  ]

  // Quick actions
  const quickActions: CommandItem[] = [
    {
      id: 'act-add-task',
      title: 'Create New Task',
      category: 'Actions',
      icon: Plus,
      action: () => { onClose(); onOpenAddTask() },
    },
    {
      id: 'act-add-notice',
      title: 'Capture New Notice / WhatsApp Message',
      category: 'Actions',
      icon: Inbox,
      action: () => { onClose(); onOpenAddInbox() },
    },
    {
      id: 'act-theme',
      title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      category: 'Actions',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    },
  ]

  // Filter tasks
  const matchedTasks: CommandItem[] = tasks
    .filter(t => !query || t.title.toLowerCase().includes(query.toLowerCase()) || t.description.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5)
    .map(t => ({
      id: `task-${t.id}`,
      title: t.title,
      category: 'Tasks',
      icon: CheckSquare,
      badge: PRIORITIES[t.priority]?.label || 'Task',
      action: () => navigate('/tasks'),
    }))

  // Filter inbox
  const matchedInbox: CommandItem[] = inbox
    .filter(i => !query || i.title.toLowerCase().includes(query.toLowerCase()) || i.description.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5)
    .map(i => ({
      id: `inbox-${i.id}`,
      title: i.title,
      category: 'Notices',
      icon: Inbox,
      badge: i.is_important ? 'Important' : i.category,
      action: () => navigate('/inbox'),
    }))

  // Filter actions
  const matchedNav = navActions.filter(a => !query || a.title.toLowerCase().includes(query.toLowerCase()))
  const matchedQuick = quickActions.filter(a => !query || a.title.toLowerCase().includes(query.toLowerCase()))

  const allItems: CommandItem[] = [...matchedQuick, ...matchedNav, ...matchedTasks, ...matchedInbox]

  // Keyboard navigation
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % (allItems.length || 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + (allItems.length || 1)) % (allItems.length || 1))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (allItems[selectedIndex]) {
          allItems[selectedIndex].action()
          onClose()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, selectedIndex, allItems, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            className="w-full bg-transparent border-0 px-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-0"
            placeholder="Type a command, task title, or notice keyword..."
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0) }}
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {allItems.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              No results found for "{query}".
            </div>
          ) : (
            allItems.map((item, idx) => {
              const isSelected = idx === selectedIndex
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => { item.action(); onClose() }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-primary-500 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium truncate">{item.title}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {item.badge && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
                        {item.badge}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400">
                      {item.category}
                    </span>
                    {isSelected && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400 shrink-0" />
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Footer shortcuts info */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>Use <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono">↑</kbd> <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono">↓</kbd> to navigate</span>
            <span><kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono">↵</kbd> to select</span>
          </div>
          <span className="flex items-center gap-1 text-primary-600 dark:text-primary-400 font-medium">
            <Sparkles className="w-3 h-3" /> Command Palette
          </span>
        </div>
      </div>
    </div>
  )
}
