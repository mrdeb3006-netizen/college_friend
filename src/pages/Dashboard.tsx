import React, { useState } from 'react'
import { format, isToday, isTomorrow } from 'date-fns'
import {
  CheckCircle2, Circle, Clock, Plus, Star, ArrowRight,
  Sparkles, Calendar, ChevronRight, Flame, Check, Zap,
  TrendingUp, Compass, MessageSquare, AlertCircle
} from 'lucide-react'
import { demoStore } from '../lib/demoStore'
import { formatDeadline, formatMinutes, isDeadlineOverdue } from '../lib/utils'
import { Button, EmptyState } from '../components/ui'
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
    <div className="h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* ============================================================
            Hero Welcome Banner (Linear / Raycast / Apple Aesthetic)
           ============================================================ */}
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-white/85 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/90 dark:border-white/[0.08] shadow-card-lg">
          {/* Ambient lighting glows inside the hero */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-500/15 via-purple-500/10 to-pink-500/5 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />
          <div className="absolute -bottom-10 left-1/4 w-72 h-72 bg-gradient-to-tr from-sky-500/10 to-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4 sm:gap-5">
              {/* Profile Avatar with Glowing Halo */}
              <div className="relative shrink-0">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary-500/30 dark:ring-primary-400/40 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 via-indigo-600 to-purple-600 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-primary-500/25">
                    {profile.name.charAt(0)}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-3 ring-white dark:ring-slate-900 shadow-xs" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/60 px-3 py-0.5 rounded-full border border-primary-200/60 dark:border-primary-800/60">
                    <Zap className="w-3 h-3 text-primary-500 fill-primary-500" />
                    {format(new Date(), 'EEEE, MMMM d')}
                  </span>

                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Term
                  </span>

                  {urgentCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/60 px-3 py-0.5 rounded-full border border-red-200/60 dark:border-red-800/60 shadow-xs">
                      <Flame className="w-3.5 h-3.5 text-red-500" /> {urgentCount} urgent
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2 font-sans">
                  {greeting}, <span className="bg-gradient-to-r from-primary-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">{profile.name.split(' ')[0]}</span> 👋
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl font-normal leading-relaxed">
                  {pendingTasks === 0
                    ? 'All clear! Your queue is cleared and your workspace is fully synchronized.'
                    : `You have ${pendingTasks} active task${pendingTasks > 1 ? 's' : ''} in your queue. Let's make steady progress today.`}
                </p>
              </div>
            </div>

            {/* Quick Action Trigger Buttons */}
            <div className="flex items-center gap-3 shrink-0 self-stretch md:self-auto">
              <Button
                variant="primary"
                onClick={() => setShowAddTask(true)}
                className="flex-1 md:flex-initial shadow-glow-primary hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Plus className="w-4 h-4" /> Create Task
                <span className="ml-1 text-[10px] opacity-75 font-mono px-1.5 py-0.5 rounded bg-white/20">⌘N</span>
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowAddInbox(true)}
                className="flex-1 md:flex-initial hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Sparkles className="w-4 h-4 text-primary-500" /> Ingest Notice
              </Button>
            </div>
          </div>

          {/* Progress Strip with Animated Shimmer Bar */}
          {totalTasks > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-200/70 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 flex-1 max-w-lg">
                <div className="flex-1 h-2.5 rounded-full bg-slate-200/80 dark:bg-slate-800/90 overflow-hidden relative p-0.5">
                  <div
                    className={`h-full transition-all duration-700 rounded-full relative overflow-hidden ${
                      completionRate >= 80
                        ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 shadow-glow-emerald'
                        : completionRate >= 40
                        ? 'bg-gradient-to-r from-primary-600 via-indigo-500 to-purple-500 shadow-glow-primary'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-glow-amber'
                    }`}
                    style={{ width: `${Math.max(completionRate, 5)}%` }}
                  >
                    <div className="absolute inset-0 shimmer-bar opacity-60" />
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 shrink-0 font-mono">
                  {completionRate}% Complete
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span><strong className="text-slate-800 dark:text-slate-200 font-semibold">{completedToday}</strong> of {totalTasks} tasks resolved</span>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================
            Metrics Cards Strip (With SVG Sparklines & Glowing Halos)
           ============================================================ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pending Tasks */}
          <div className="glass-card-interactive p-5 rounded-2xl relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pending Tasks</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">{pendingTasks}</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-primary-50 dark:bg-primary-950/60 border border-primary-200/50 dark:border-primary-800/50 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 group-hover:shadow-glow-primary transition-all">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            {/* Mini Sparkline SVG */}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {urgentCount > 0 ? `${urgentCount} need urgent focus` : 'Queue on track'}
              </span>
              <svg className="w-16 h-6 text-primary-500/70" viewBox="0 0 60 20" fill="none">
                <path d="M0 16 L12 12 L24 14 L36 8 L48 10 L60 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Urgent Focus */}
          <div className="glass-card-interactive p-5 rounded-2xl relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Urgent Focus</p>
                <p className="text-3xl font-extrabold text-red-600 dark:text-red-400 tracking-tight mt-1">{urgentCount}</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200/50 dark:border-red-800/50 flex items-center justify-center text-red-500 group-hover:scale-110 group-hover:shadow-glow-red transition-all">
                <Flame className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                {urgentCount > 0 ? 'Action required' : 'No blockers'}
              </span>
              <svg className="w-16 h-6 text-red-500/70" viewBox="0 0 60 20" fill="none">
                <path d="M0 18 L15 15 L30 17 L45 8 L60 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Smart Inbox */}
          <div className="glass-card-interactive p-5 rounded-2xl relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Smart Inbox</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">{totalInbox}</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200/50 dark:border-cyan-800/50 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:scale-110 group-hover:shadow-glow-sky transition-all">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                {unreadInbox} unread notices
              </span>
              <svg className="w-16 h-6 text-cyan-500/70" viewBox="0 0 60 20" fill="none">
                <path d="M0 12 L15 14 L30 8 L45 10 L60 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Completed */}
          <div className="glass-card-interactive p-5 rounded-2xl relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Completed</p>
                <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight mt-1">{completedToday}</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/50 dark:border-emerald-800/50 flex items-center justify-center text-emerald-500 group-hover:scale-110 group-hover:shadow-glow-emerald transition-all">
                <Star className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Great velocity
              </span>
              <svg className="w-16 h-6 text-emerald-500/70" viewBox="0 0 60 20" fill="none">
                <path d="M0 16 L15 12 L30 10 L45 6 L60 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* ============================================================
            Quick Action Dock (Glass Pill Navigation)
           ============================================================ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Create Task', kbd: '⌘N', icon: Check, color: 'from-primary-600 to-indigo-600 text-white', onClick: () => setShowAddTask(true) },
            { label: 'Ingest Notice', kbd: '⌘I', icon: Plus, color: 'from-amber-500 to-orange-500 text-white', onClick: () => setShowAddInbox(true) },
            { label: 'Smart Inbox', kbd: '⌘G', icon: Calendar, color: 'from-teal-500 to-cyan-500 text-white', onClick: () => navigate('/inbox') },
            { label: 'AI Copilot', kbd: '⌘C', icon: Sparkles, color: 'from-purple-600 to-pink-600 text-white', onClick: () => navigate('/copilot') },
          ].map(item => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="glass-card-interactive p-3.5 rounded-2xl text-left flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-xs shrink-0 shadow-xs group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{item.label}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200/80 dark:border-slate-700/80 shrink-0">
                {item.kbd}
              </span>
            </button>
          ))}
        </div>

        {/* ============================================================
            Main Content Grid (2:1 Split)
           ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Today's Priority Focus */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200/60 dark:border-red-800/60 flex items-center justify-center text-red-500 shadow-2xs">
                  <Flame className="w-4 h-4" />
                </div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Today's Priority Focus</h2>
              </div>
              <NavLink to="/tasks" className="text-xs text-primary-600 dark:text-primary-400 font-bold hover:underline flex items-center gap-1 group">
                All tasks <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </NavLink>
            </div>

            {todaysFocus.length === 0 ? (
              <div className="glass-card-interactive p-8 text-center rounded-2xl">
                <EmptyState
                  icon="🎯"
                  title="No urgent tasks in focus"
                  description="Your priority queue is clear! Capture upcoming coursework or create tasks to organize your schedule."
                  action={
                    <Button variant="primary" size="sm" onClick={() => setShowAddTask(true)}>
                      <Plus className="w-4 h-4" /> Create Task
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="space-y-3">
                {todaysFocus.map(task => (
                  <TaskFocusCard key={task.id} task={task} onToggle={toggleTask} />
                ))}
              </div>
            )}

            {/* AI Copilot Card (Linear / Raycast High-End Banner) */}
            <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r from-primary-500/10 via-indigo-500/5 to-purple-500/10 border border-primary-200/80 dark:border-primary-800/60 shadow-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary-500/25">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white">AI Academic Copilot</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-950/70 text-primary-700 dark:text-primary-300 border border-primary-200/60 dark:border-primary-800/60">
                        Always Online
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Ask me to plan your study sessions, summarize exam circulars, or break down complex projects.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/copilot')}
                  className="btn-primary btn btn-sm shrink-0 cursor-pointer self-start sm:self-auto hover:scale-105 transition-transform"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Launch Copilot
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Starred Notices & Upcoming Deadlines */}
          <div className="space-y-6">
            {/* Starred Important Notices */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/60 flex items-center justify-center text-amber-500 shadow-2xs">
                    <Star className="w-4 h-4 fill-amber-500" />
                  </div>
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Important Notices</h2>
                </div>
                <NavLink to="/important" className="text-xs text-primary-600 dark:text-primary-400 font-bold hover:underline">
                  View all
                </NavLink>
              </div>

              {unprocessed.length === 0 ? (
                <div className="glass-card-interactive p-6 text-center rounded-2xl">
                  <p className="text-xs text-slate-400 font-medium">No unprocessed starred notices. ✨</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {unprocessed.map(item => (
                    <UnprocessedCard key={item.id} item={item} refresh={() => refresh(v => v + 1)} />
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Deadlines Widget */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-950/60 border border-primary-200/60 dark:border-primary-800/60 flex items-center justify-center text-primary-500 shadow-2xs">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Upcoming Deadlines</h2>
                </div>
                <NavLink to="/calendar" className="text-xs text-primary-600 dark:text-primary-400 font-bold hover:underline">
                  Calendar
                </NavLink>
              </div>

              {upcoming.length === 0 ? (
                <div className="glass-card-interactive p-6 text-center rounded-2xl">
                  <p className="text-xs text-slate-400 font-medium">No deadlines recorded yet.</p>
                </div>
              ) : (
                <div className="glass-card-interactive p-2 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800/80">
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
    </div>
  )
}

// ============================================================
// Task Focus Card (With glowing left border & hover lift)
// ============================================================
function TaskFocusCard({ task, onToggle }: { task: Task; onToggle: (t: Task) => void }) {
  const isCompleted = task.status === 'completed'
  const isOverdue = isDeadlineOverdue(task.deadline)
  const completedSubtasks = task.subtasks.filter(s => s.is_completed).length

  return (
    <div className={`glass-card-interactive p-4 rounded-2xl transition-all ${
      task.priority === 'urgent_important' ? 'border-l-4 border-l-red-500' :
      task.priority === 'important_not_urgent' ? 'border-l-4 border-l-amber-500' :
      task.priority === 'urgent_not_important' ? 'border-l-4 border-l-sky-500' : 'border-l-4 border-l-slate-400'
    }`}>
      <div className="flex items-start gap-3.5">
        <button
          onClick={() => onToggle(task)}
          className={`mt-0.5 shrink-0 transition-transform cursor-pointer hover:scale-110 active:scale-95 ${
            isCompleted ? 'text-emerald-500' : 'text-slate-400 hover:text-primary-600 dark:hover:text-primary-400'
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
          <p className={`text-sm font-bold leading-snug ${isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
            {task.title}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            <PriorityBadge priority={task.priority} />
            <CategoryBadge category={task.category} />

            {task.deadline && (
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                isOverdue
                  ? 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80'
              }`}>
                📅 {formatDeadline(task.deadline)}
              </span>
            )}

            {task.estimated_minutes && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" />{formatMinutes(task.estimated_minutes)}
              </span>
            )}

            {task.subtasks.length > 0 && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
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
    <div className="glass-card-interactive p-4 rounded-2xl border-l-4 border-l-amber-400">
      <div className="flex items-start gap-3">
        <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
          {item.registration_deadline && (
            <p className="text-[11px] text-red-500 font-bold mt-1">
              Deadline: {format(new Date(item.registration_deadline), 'MMM d, yyyy')}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2.5">
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
    <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
        task.priority === 'urgent_important' ? 'bg-red-500 ring-4 ring-red-500/20' :
        task.priority === 'important_not_urgent' ? 'bg-amber-500 ring-4 ring-amber-500/20' : 'bg-slate-400 ring-4 ring-slate-400/20'
      }`} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{task.title}</p>
      </div>
      <span className={`text-[11px] font-mono font-bold shrink-0 ${isOverdue ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`}>
        {isToday(d) ? 'Today' : isTomorrow(d) ? 'Tomorrow' : format(d, 'MMM d')}
      </span>
    </div>
  )
}
