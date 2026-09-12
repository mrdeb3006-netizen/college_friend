import React, { useState } from 'react'
import { format, isToday, isTomorrow, addDays, startOfDay } from 'date-fns'
import {
  CheckCircle2, Circle, Clock, Plus, Star, ArrowRight,
  AlertTriangle, Sparkles, Calendar, ChevronRight, Flame
} from 'lucide-react'
import { demoStore } from '../lib/demoStore'
import { formatDeadline, formatMinutes, PRIORITIES, CATEGORIES, isDeadlineOverdue } from '../lib/utils'
import { Card, Button, EmptyState } from '../components/ui'
import { PriorityBadge, CategoryBadge, StatusBadge } from '../components/ui/Badge'
import type { Task, InboxItem } from '../lib/types'
import { NavLink, useNavigate } from 'react-router-dom'
import AddTaskModal from '../components/tasks/AddTaskModal'
import AddInboxModal from '../components/inbox/AddInboxModal'

export default function Dashboard() {
  const navigate = useNavigate()
  const [showAddTask, setShowAddTask] = useState(false)
  const [showAddInbox, setShowAddInbox] = useState(false)
  const [quickAddType, setQuickAddType] = useState<'task' | 'notice' | null>(null)
  const [, refresh] = useState(0)

  const profile = demoStore.getProfile()
  const tasks = demoStore.getTasks()
  const inbox = demoStore.getInbox()

  // Today's focus: urgent + incomplete, sorted by deadline
  const todaysFocus = tasks
    .filter(t => t.status !== 'completed')
    .sort((a, b) => {
      const pa = ['urgent_important', 'important_not_urgent', 'urgent_not_important', 'low'].indexOf(a.priority)
      const pb = ['urgent_important', 'important_not_urgent', 'urgent_not_important', 'low'].indexOf(b.priority)
      return pa - pb
    })
    .slice(0, 5)

  // Upcoming: tasks with deadlines in next 14 days
  const upcoming = tasks
    .filter(t => t.deadline && t.status !== 'completed')
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 8)

  // Unprocessed important items
  const unprocessed = inbox.filter(i => i.is_important && i.status !== 'acted').slice(0, 4)

  // Stats
  const urgentCount = tasks.filter(t => t.priority === 'urgent_important' && t.status !== 'completed').length
  const completedToday = tasks.filter(t => t.status === 'completed').length
  const unreadInbox = inbox.filter(i => i.status === 'unread').length
  const pendingTasks = tasks.filter(t => t.status !== 'completed').length
  const totalTasks = tasks.length
  const totalInbox = inbox.length

  const toggleTask = (task: Task) => {
    demoStore.updateTask(task.id, {
      status: task.status === 'completed' ? 'not_started' : 'completed',
    })
    refresh(v => v + 1)
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {greeting}, {profile.name.split(' ')[0]} 👋
            </h1>
            <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-0.5">
              {profile.college} · {profile.branch} ({profile.year})
            </p>
          </div>

          {/* Stats pills */}
          <div className="hidden sm:flex gap-2">
            {urgentCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 shadow-xs">
                <Flame className="w-3.5 h-3.5 text-red-500" />
                <span className="text-xs font-semibold text-red-600 dark:text-red-400">{urgentCount} urgent</span>
              </div>
            )}
            {unreadInbox > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 shadow-xs">
                <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">{unreadInbox} unread</span>
              </div>
            )}
          </div>
        </div>

        {/* Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="card p-3.5 flex items-center justify-between border-l-4 border-l-primary-500">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending Tasks</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">{pendingTasks}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center text-primary-600 dark:text-primary-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="card p-3.5 flex items-center justify-between border-l-4 border-l-red-500">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Urgent Focus</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-0.5">{urgentCount}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-red-500">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="card p-3.5 flex items-center justify-between border-l-4 border-l-teal-500">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">College Notices</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">{totalInbox}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="card p-3.5 flex items-center justify-between border-l-4 border-l-emerald-500">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Completed Tasks</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{completedToday}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-500">
              <Star className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Clean slate welcome banner if empty */}
        {totalTasks === 0 && totalInbox === 0 && (
          <div className="card p-6 bg-gradient-to-br from-primary-500/10 via-indigo-500/5 to-purple-500/10 border border-primary-200/50 dark:border-primary-800/40 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Ready for the semester, Debendranath! 🎓
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                  Your workspace is clean. Capture messy WhatsApp announcements, syllabus notices, or deadlines, and let AI structure them into actionable tasks.
                </p>
              </div>
              <div className="flex gap-2.5 shrink-0">
                <Button variant="primary" onClick={() => setShowAddInbox(true)}>
                  <Plus className="w-4 h-4" /> Add Notice
                </Button>
                <Button variant="secondary" onClick={() => setShowAddTask(true)}>
                  <Plus className="w-4 h-4" /> Create Task
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Add */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: 'Add Task', icon: '✅', color: 'bg-primary-500', onClick: () => setShowAddTask(true) },
            { label: 'Add Notice', icon: '📌', color: 'bg-orange-500', onClick: () => setShowAddInbox(true) },
            { label: 'College Inbox', icon: '📥', color: 'bg-teal-500', onClick: () => navigate('/inbox') },
            { label: 'AI Copilot', icon: '🤖', color: 'bg-purple-500', onClick: () => navigate('/copilot') },
          ].map(item => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-card-md hover:border-primary-200 dark:hover:border-primary-700 transition-all text-left group"
            >
              <span className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center text-base shrink-0 group-hover:scale-110 transition-transform`}>
                {item.icon}
              </span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Today's Focus — 2/3 width */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-500" />
                <h2 className="section-title">Today's Focus</h2>
              </div>
              <NavLink to="/tasks" className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                All tasks <ChevronRight className="w-3 h-3" />
              </NavLink>
            </div>

            {todaysFocus.length === 0 ? (
              <Card>
                <EmptyState
                  icon="✅"
                  title="Nothing urgent right now"
                  description="Add tasks to start tracking your work."
                  action={
                    <Button variant="primary" size="sm" onClick={() => setShowAddTask(true)}>
                      <Plus className="w-4 h-4" /> Add Task
                    </Button>
                  }
                />
              </Card>
            ) : (
              <div className="space-y-2">
                {todaysFocus.map(task => (
                  <TaskFocusCard key={task.id} task={task} onToggle={toggleTask} />
                ))}
              </div>
            )}

            {/* AI Copilot prompt */}
            <Card className="bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-950/30 dark:to-purple-950/30 border-primary-100 dark:border-primary-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">College Copilot</p>
                  <p className="text-xs text-slate-500 truncate">Ask me to plan your day, analyze a notice, or help you decide</p>
                </div>
                <button
                  onClick={() => navigate('/copilot')}
                  className="btn-primary btn btn-sm shrink-0"
                >
                  Ask AI
                </button>
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Important Unprocessed */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <h2 className="section-title text-base">Important — Not Acted</h2>
              </div>
              {unprocessed.length === 0 ? (
                <Card className="py-6">
                  <p className="text-center text-sm text-slate-400">All caught up! ✨</p>
                </Card>
              ) : (
                <div className="space-y-2">
                  {unprocessed.map(item => (
                    <UnprocessedCard key={item.id} item={item} refresh={() => refresh(v => v + 1)} />
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-primary-500" />
                <h2 className="section-title text-base">Upcoming</h2>
              </div>
              {upcoming.length === 0 ? (
                <Card className="py-6">
                  <p className="text-center text-sm text-slate-400">No upcoming deadlines.</p>
                </Card>
              ) : (
                <div className="space-y-1.5">
                  {upcoming.map(task => (
                    <UpcomingItem key={task.id} task={task} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddTaskModal open={showAddTask} onClose={() => setShowAddTask(false)} onSave={() => { setShowAddTask(false); refresh(v => v + 1) }} />
      <AddInboxModal open={showAddInbox} onClose={() => setShowAddInbox(false)} onSave={() => { setShowAddInbox(false); refresh(v => v + 1) }} />
    </>
  )
}

// ============================================================
// Task Focus Card
// ============================================================
function TaskFocusCard({ task, onToggle }: { task: Task; onToggle: (t: Task) => void }) {
  const isCompleted = task.status === 'completed'
  const isOverdue = isDeadlineOverdue(task.deadline)
  const pInfo = PRIORITIES[task.priority]
  const completedSubtasks = task.subtasks.filter(s => s.is_completed).length

  return (
    <div className={`card p-4 ${pInfo.borderClass} transition-all hover:shadow-card-md`}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(task)}
          className="mt-0.5 shrink-0 text-slate-400 hover:text-primary-500 transition-colors"
          aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
            {task.title}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className={`text-xs ${isOverdue ? 'text-red-500 font-semibold' : 'text-slate-500'}`}>
              {isOverdue ? '⚠️ ' : '📅 '}{formatDeadline(task.deadline)}
            </span>
            {task.estimated_minutes && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />{formatMinutes(task.estimated_minutes)}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <PriorityBadge priority={task.priority} />
            <CategoryBadge category={task.category} />
            {task.subtasks.length > 0 && (
              <span className="text-xs text-slate-400">
                {completedSubtasks}/{task.subtasks.length} subtasks
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Unprocessed Important Card
// ============================================================
function UnprocessedCard({ item, refresh }: { item: InboxItem; refresh: () => void }) {
  const navigate = useNavigate()
  const markActed = () => {
    demoStore.updateInboxItem(item.id, { status: 'acted' })
    refresh()
  }

  return (
    <div className="card p-3 border-l-4 border-yellow-400">
      <div className="flex items-start gap-2">
        <Star className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{item.title}</p>
          {item.registration_deadline && (
            <p className="text-xs text-red-500 mt-0.5">Closes {format(new Date(item.registration_deadline), 'MMM d')}</p>
          )}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => navigate('/inbox')}
              className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
            >
              View
            </button>
            <button
              onClick={markActed}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Upcoming Item
// ============================================================
function UpcomingItem({ task }: { task: Task }) {
  const d = new Date(task.deadline!)
  const isOverdue = isDeadlineOverdue(task.deadline)
  const pInfo = PRIORITIES[task.priority]

  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <span className={pInfo.dotClass} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{task.title}</p>
      </div>
      <span className={`text-xs font-medium shrink-0 ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
        {isToday(d) ? 'Today' : isTomorrow(d) ? 'Tomorrow' : format(d, 'MMM d')}
      </span>
    </div>
  )
}
