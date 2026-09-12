import React, { useState } from 'react'
import { format, isToday, isTomorrow } from 'date-fns'
import {
  CheckCircle2, Circle, Clock, Plus, Star, ArrowRight,
  Sparkles, Calendar, ChevronRight, Flame, Layers, Check
} from 'lucide-react'
import { demoStore } from '../lib/demoStore'
import { formatDeadline, formatMinutes, PRIORITIES, isDeadlineOverdue } from '../lib/utils'
import { Card, Button, EmptyState } from '../components/ui'
import { PriorityBadge, CategoryBadge } from '../components/ui/Badge'
import type { Task, InboxItem } from '../lib/types'
import { NavLink, useNavigate } from 'react-router-dom'
import AddTaskModal from '../components/tasks/AddTaskModal'
import AddInboxModal from '../components/inbox/AddInboxModal'

export default function Dashboard() {
  const navigate = useNavigate()
  const [showAddTask, setShowAddTask] = useState(false)
  const [showAddInbox, setShowAddInbox] = useState(false)
  const [, refresh] = useState(0)

  const profile = demoStore.getProfile()
  const tasks = demoStore.getTasks()
  const inbox = demoStore.getInbox()

  // Today's focus: urgent + incomplete, sorted by priority
  const todaysFocus = tasks
    .filter(t => t.status !== 'completed')
    .sort((a, b) => {
      const pa = ['urgent_important', 'important_not_urgent', 'urgent_not_important', 'low'].indexOf(a.priority)
      const pb = ['urgent_important', 'important_not_urgent', 'urgent_not_important', 'low'].indexOf(b.priority)
      return pa - pb
    })
    .slice(0, 5)

  // Upcoming: tasks with deadlines
  const upcoming = tasks
    .filter(t => t.deadline && t.status !== 'completed')
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 7)

  // Unprocessed important items
  const unprocessed = inbox.filter(i => i.is_important && i.status !== 'acted').slice(0, 4)

  // Stats
  const urgentCount = tasks.filter(t => t.priority === 'urgent_important' && t.status !== 'completed').length
  const completedToday = tasks.filter(t => t.status === 'completed').length
  const unreadInbox = inbox.filter(i => i.status === 'unread').length
  const pendingTasks = tasks.filter(t => t.status !== 'completed').length
  const totalTasks = tasks.length
  const totalInbox = inbox.length
  const completionRate = totalTasks > 0 ? Math.round((completedToday / totalTasks) * 100) : 0

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
      <div className="space-y-6 animate-fade-in">
        {/* ============================================================
            Hero Welcome Banner (Linear / Raycast aesthetic)
           ============================================================ */}
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-white via-slate-50 to-primary-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-primary-950/20 border border-slate-200/90 dark:border-slate-800 shadow-card">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-primary-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-primary-500/30 shadow-md"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
                    {profile.name.charAt(0)}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-2.5 py-0.5 rounded-full border border-primary-200/50 dark:border-primary-800/50">
                    {format(new Date(), 'EEEE, MMMM d')}
                  </span>
                  {urgentCount > 0 && (
                    <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2.5 py-0.5 rounded-full border border-red-200/50 dark:border-red-800/50 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-red-500" /> {urgentCount} urgent
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1.5">
                  {greeting}, {profile.name.split(' ')[0]} 👋
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                  {pendingTasks === 0
                    ? 'All clear! Your tasks are completed and your workspace is fully up to date.'
                    : `You have ${pendingTasks} active task${pendingTasks > 1 ? 's' : ''} in your queue. Stay focused and conquer your priorities.`}
                </p>
              </div>
            </div>

            {/* Quick Action Trigger Buttons */}
            <div className="flex items-center gap-2.5 shrink-0 self-stretch md:self-auto">
              <Button
                variant="primary"
                onClick={() => setShowAddTask(true)}
                className="flex-1 md:flex-initial"
              >
                <Plus className="w-4 h-4" /> Create Task
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowAddInbox(true)}
                className="flex-1 md:flex-initial"
              >
                <Sparkles className="w-4 h-4 text-primary-500" /> Ingest Notice
              </Button>
            </div>
          </div>

          {/* Progress Strip */}
          {totalTasks > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-200/70 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3 flex-1 max-w-md">
                <div className="flex-1 h-2 rounded-full bg-slate-200/70 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-600 to-emerald-500 transition-all duration-500 rounded-full"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                  {completionRate}% Complete
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                {completedToday} of {totalTasks} tasks resolved
              </span>
            </div>
          )}
        </div>

        {/* ============================================================
            Metrics Cards Strip (Redesigned with ambient color glows)
           ============================================================ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Pending Tasks */}
          <div className="card p-4 hover:shadow-card-md transition-all group relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pending Tasks</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1">{pendingTasks}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/60 border border-primary-100 dark:border-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
              <span>{urgentCount} requiring fast attention</span>
            </div>
          </div>

          {/* Urgent Focus */}
          <div className="card p-4 hover:shadow-card-md transition-all group relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Urgent Focus</p>
                <p className="text-2xl font-extrabold text-red-600 dark:text-red-400 tracking-tight mt-1">{urgentCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-100 dark:border-red-900/50 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                <Flame className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-red-500 font-medium">
              <span>{urgentCount > 0 ? 'High academic impact' : 'No critical bottlenecks'}</span>
            </div>
          </div>

          {/* Captured Notices */}
          <div className="card p-4 hover:shadow-card-md transition-all group relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Smart Inbox</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1">{totalInbox}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-100 dark:border-cyan-900/50 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
              <span>{unreadInbox} unread announcements</span>
            </div>
          </div>

          {/* Completed Tasks */}
          <div className="card p-4 hover:shadow-card-md transition-all group relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Completed</p>
                <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight mt-1">{completedToday}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                <Star className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <span>Great momentum today</span>
            </div>
          </div>
        </div>

        {/* ============================================================
            Quick Navigation Dock
           ============================================================ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { label: 'Create Task', icon: Check, color: 'bg-primary-500 text-white', onClick: () => setShowAddTask(true) },
            { label: 'Ingest Notice', icon: Plus, color: 'bg-amber-500 text-white', onClick: () => setShowAddInbox(true) },
            { label: 'Smart Inbox', icon: Calendar, color: 'bg-teal-500 text-white', onClick: () => navigate('/inbox') },
            { label: 'AI Copilot', icon: Sparkles, color: 'bg-purple-500 text-white', onClick: () => navigate('/copilot') },
          ].map(item => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="card p-3.5 hover:shadow-card-md hover:-translate-y-0.5 transition-all text-left flex items-center gap-3 group cursor-pointer"
            >
              <div className={`w-8 h-8 rounded-xl ${item.color} flex items-center justify-center text-xs shrink-0 shadow-xs group-hover:scale-110 transition-transform`}>
                <item.icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{item.label}</span>
            </button>
          ))}
        </div>

        {/* ============================================================
            Main Content Grid (2:1 Column Split)
           ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Today's Focus */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-500" />
                <h2 className="section-title">Today's Priority Focus</h2>
              </div>
              <NavLink to="/tasks" className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline flex items-center gap-1">
                All tasks <ChevronRight className="w-3.5 h-3.5" />
              </NavLink>
            </div>

            {todaysFocus.length === 0 ? (
              <div className="card p-8 text-center space-y-3">
                <EmptyState
                  icon="🎯"
                  title="No urgent tasks right now"
                  description="Your priority queue is clear. Capture upcoming coursework or create tasks to organize your schedule."
                  action={
                    <Button variant="primary" size="sm" onClick={() => setShowAddTask(true)}>
                      <Plus className="w-4 h-4" /> Create Task
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="space-y-2.5">
                {todaysFocus.map(task => (
                  <TaskFocusCard key={task.id} task={task} onToggle={toggleTask} />
                ))}
              </div>
            )}

            {/* AI Copilot Card (Redesigned with glowing border) */}
            <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-r from-primary-500/10 via-indigo-500/5 to-purple-500/10 border border-primary-200/80 dark:border-primary-800/60 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-primary-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Student AI Copilot</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    Ask me to plan your day, analyze a notice, or help prioritize your commitments.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/copilot')}
                  className="btn-primary btn btn-sm shrink-0 cursor-pointer"
                >
                  Ask Copilot
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Starred Notices & Upcoming */}
          <div className="space-y-5">
            {/* Starred Important Notices */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <h2 className="section-title text-sm">Important Notices</h2>
                </div>
                <NavLink to="/important" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                  View all
                </NavLink>
              </div>

              {unprocessed.length === 0 ? (
                <div className="card p-5 text-center">
                  <p className="text-xs text-slate-400 font-medium">No unprocessed starred notices. ✨</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {unprocessed.map(item => (
                    <UnprocessedCard key={item.id} item={item} refresh={() => refresh(v => v + 1)} />
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Deadlines Widget */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Calendar className="w-4 h-4 text-primary-500" />
                <h2 className="section-title text-sm">Upcoming Deadlines</h2>
              </div>

              {upcoming.length === 0 ? (
                <div className="card p-5 text-center">
                  <p className="text-xs text-slate-400 font-medium">No deadlines recorded yet.</p>
                </div>
              ) : (
                <div className="card p-2 divide-y divide-slate-100 dark:divide-slate-800/80">
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
  const completedSubtasks = task.subtasks.filter(s => s.is_completed).length

  return (
    <div className={`card p-4 transition-all hover:shadow-card-md hover:border-primary-300/80 dark:hover:border-primary-700/80 ${
      task.priority === 'urgent_important' ? 'border-l-4 border-l-red-500' :
      task.priority === 'important_not_urgent' ? 'border-l-4 border-l-amber-500' :
      task.priority === 'urgent_not_important' ? 'border-l-4 border-l-sky-500' : ''
    }`}>
      <div className="flex items-start gap-3.5">
        <button
          onClick={() => onToggle(task)}
          className={`mt-0.5 shrink-0 transition-colors cursor-pointer ${
            isCompleted ? 'text-emerald-500' : 'text-slate-400 hover:text-primary-600'
          }`}
          aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
            {task.title}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <PriorityBadge priority={task.priority} />
            <CategoryBadge category={task.category} />

            {task.deadline && (
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                isOverdue
                  ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                📅 {formatDeadline(task.deadline)}
              </span>
            )}

            {task.estimated_minutes && (
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />{formatMinutes(task.estimated_minutes)}
              </span>
            )}

            {task.subtasks.length > 0 && (
              <span className="text-[11px] text-slate-400">
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
// Unprocessed Important Notice Card
// ============================================================
function UnprocessedCard({ item, refresh }: { item: InboxItem; refresh: () => void }) {
  const navigate = useNavigate()
  const markActed = () => {
    demoStore.updateInboxItem(item.id, { status: 'acted' })
    refresh()
  }

  return (
    <div className="card p-3.5 border-l-4 border-l-amber-400 hover:shadow-card-md transition-all">
      <div className="flex items-start gap-2.5">
        <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{item.title}</p>
          {item.registration_deadline && (
            <p className="text-[11px] text-red-500 font-semibold mt-0.5">
              Deadline: {format(new Date(item.registration_deadline), 'MMM d, yyyy')}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => navigate('/inbox')}
              className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
            >
              View Notice
            </button>
            <button
              onClick={markActed}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
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

  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <span className={`w-2 h-2 rounded-full shrink-0 ${
        task.priority === 'urgent_important' ? 'bg-red-500 ring-2 ring-red-500/20' :
        task.priority === 'important_not_urgent' ? 'bg-amber-500 ring-2 ring-amber-500/20' : 'bg-slate-400'
      }`} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{task.title}</p>
      </div>
      <span className={`text-[11px] font-bold shrink-0 ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
        {isToday(d) ? 'Today' : isTomorrow(d) ? 'Tomorrow' : format(d, 'MMM d')}
      </span>
    </div>
  )
}
