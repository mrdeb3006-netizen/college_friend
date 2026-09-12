import React, { useState } from 'react'
import {
  Plus, CheckCircle2, Circle, Clock, Filter, Search,
  MoreHorizontal, Trash2, Edit2,
  Link as LinkIcon, User, Flame, Target, Zap, Archive,
  List, Columns, Grid2X2, ArrowRight
} from 'lucide-react'
import { demoStore } from '../lib/demoStore'
import {
  PRIORITIES, CATEGORY_LIST, PRIORITY_LIST,
  formatDeadline, formatMinutes, isDeadlineOverdue
} from '../lib/utils'
import { Button, EmptyState } from '../components/ui'
import { PriorityBadge, CategoryBadge, StatusBadge } from '../components/ui/Badge'
import { Dropdown } from '../components/ui/Overlays'
import { PageLayout } from '../components/layout/Navigation'
import AddTaskModal from '../components/tasks/AddTaskModal'
import TaskDetailDrawer from '../components/tasks/TaskDetailDrawer'
import type { Task, Priority, Category, TaskStatus } from '../lib/types'
import toast from 'react-hot-toast'

type ViewMode = 'list' | 'matrix' | 'kanban'

const STATUS_OPTIONS: { value: TaskStatus | 'all'; label: string }[] = [
  { value: 'all',         label: 'All Status' },
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting',     label: 'Waiting' },
  { value: 'completed',   label: 'Completed' },
]

export default function TasksPage() {
  const [, refresh] = useState(0)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [showAdd, setShowAdd] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all')
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Inline quick-add state
  const [quickTitle, setQuickTitle] = useState('')
  const [quickPriority, setQuickPriority] = useState<Priority>('urgent_important')

  const allTasks = demoStore.getTasks()

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickTitle.trim()) return
    demoStore.addTask({
      title: quickTitle.trim(),
      description: '',
      deadline: null,
      priority: quickPriority,
      ai_suggested_priority: null,
      user_overrode_priority: false,
      category: 'academic',
      estimated_minutes: null,
      status: 'not_started',
      notes: '',
      related_notice_id: null,
      related_notice_title: null,
      delegated_to: null,
      delegation_note: null,
      delegation_status: 'none',
      subtasks: [],
    })
    setQuickTitle('')
    refresh(v => v + 1)
    toast.success('Task added!')
  }

  const filtered = allTasks
    .filter(t => statusFilter === 'all' || t.status === statusFilter)
    .filter(t => priorityFilter === 'all' || t.priority === priorityFilter)
    .filter(t => categoryFilter === 'all' || t.category === categoryFilter)
    .filter(t => {
      if (!search) return true
      const q = search.toLowerCase()
      return t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.notes.toLowerCase().includes(q)
    })
    .sort((a, b) => {
      const pa = ['urgent_important', 'important_not_urgent', 'urgent_not_important', 'low'].indexOf(a.priority)
      const pb = ['urgent_important', 'important_not_urgent', 'urgent_not_important', 'low'].indexOf(b.priority)
      if (pa !== pb) return pa - pb
      if (a.deadline && b.deadline) return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      if (a.deadline) return -1
      if (b.deadline) return 1
      return 0
    })

  const toggleComplete = (task: Task) => {
    demoStore.updateTask(task.id, {
      status: task.status === 'completed' ? 'not_started' : 'completed',
    })
    refresh(v => v + 1)
  }

  const deleteTask = (task: Task) => {
    demoStore.deleteTask(task.id)
    toast.success('Task deleted')
    refresh(v => v + 1)
  }

  const completedCount = allTasks.filter(t => t.status === 'completed').length
  const totalCount = allTasks.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <>
      <PageLayout
        title="My Tasks"
        subtitle={`${completedCount}/${totalCount} completed (${progressPercent}%)`}
        action={
          <div className="flex items-center gap-2">
            {/* View Switcher */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-300 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                onClick={() => setViewMode('matrix')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'matrix'
                    ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-300 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="Eisenhower Priority Matrix"
              >
                <Grid2X2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Eisenhower</span>
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'kanban'
                    ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-300 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="Kanban Board View"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kanban</span>
              </button>
            </div>

            <Button variant="primary" onClick={() => setShowAdd(true)} id="tasks-add-btn">
              <Plus className="w-4 h-4" /> New Task
            </Button>
          </div>
        }
      >
        {/* Completion Progress Bar */}
        {totalCount > 0 && (
          <div className="mb-4 card p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="text-slate-700 dark:text-slate-300">Task Completion Velocity</span>
              <span className="text-primary-600 dark:text-primary-400 font-extrabold">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-600 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Quick Add Bar (Linear Style) */}
        <form onSubmit={handleQuickAdd} className="mb-5 card p-2 flex flex-col sm:flex-row items-center gap-2 shadow-2xs">
          <div className="flex-1 flex items-center gap-2 px-2 w-full">
            <Plus className="w-4 h-4 text-primary-500 shrink-0" />
            <input
              className="w-full bg-transparent border-none text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
              placeholder="Quickly capture a task (e.g. Study Operating Systems, Submit Lab Report)..."
              value={quickTitle}
              onChange={e => setQuickTitle(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
            <select
              value={quickPriority}
              onChange={e => setQuickPriority(e.target.value as Priority)}
              className="select h-9 text-xs sm:w-44 bg-slate-50 dark:bg-slate-800"
            >
              <option value="urgent_important">🔥 Urgent & Important</option>
              <option value="important_not_urgent">🎯 Important (Schedule)</option>
              <option value="urgent_not_important">⚡ Notable (Quick)</option>
              <option value="low">📦 Low Priority</option>
            </select>
            <Button variant="primary" type="submit" size="sm" className="h-9 shrink-0">
              <span>Add</span>
              <kbd className="hidden sm:inline-block text-[10px] text-white/80 font-mono">↵</kbd>
            </Button>
          </div>
        </form>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="input pl-9 h-9 text-sm"
              placeholder="Filter tasks by name or notes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              id="tasks-search"
            />
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`btn btn-secondary btn-sm gap-1.5 ${showFilters ? 'ring-2 ring-primary-400' : ''}`}
          >
            <Filter className="w-3.5 h-3.5" /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-3 animate-fade-in border border-slate-200 dark:border-slate-700">
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">Status</p>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_OPTIONS.map(f => (
                  <button key={f.value} onClick={() => setStatusFilter(f.value)} className={`filter-chip ${statusFilter === f.value ? 'active' : ''}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">Priority</p>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => setPriorityFilter('all')} className={`filter-chip ${priorityFilter === 'all' ? 'active' : ''}`}>All</button>
                {PRIORITY_LIST.map(p => (
                  <button key={p.value} onClick={() => setPriorityFilter(p.value)} className={`filter-chip ${priorityFilter === p.value ? 'active' : ''}`}>
                    {p.emoji} {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">Category</p>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => setCategoryFilter('all')} className={`filter-chip ${categoryFilter === 'all' ? 'active' : ''}`}>All</button>
                {CATEGORY_LIST.map(c => (
                  <button key={c.value} onClick={() => setCategoryFilter(c.value)} className={`filter-chip ${categoryFilter === c.value ? 'active' : ''}`}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* View Mode Rendering */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="✅"
            title={search ? 'No tasks match your search' : 'No tasks yet'}
            description={search ? 'Try different search terms.' : 'Create a task manually or paste a college notice to generate one.'}
            action={
              !search ? (
                <Button variant="primary" onClick={() => setShowAdd(true)}>
                  <Plus className="w-4 h-4" /> Create Task
                </Button>
              ) : undefined
            }
          />
        ) : viewMode === 'list' ? (
          /* List View */
          <div className="space-y-2">
            {filtered.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={toggleComplete}
                onView={() => setSelectedTask(task)}
                onDelete={() => deleteTask(task)}
                onRefresh={() => refresh(v => v + 1)}
              />
            ))}
          </div>
        ) : viewMode === 'matrix' ? (
          /* Eisenhower Matrix View */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Q1: Urgent & Important */}
            <MatrixQuadrant
              title="Do First (Urgent & Important)"
              subtitle="Crisis, deadlines, urgent obligations"
              icon={Flame}
              colorClass="border-red-300 dark:border-red-800 bg-red-50/20 dark:bg-red-950/10 text-red-600 dark:text-red-400"
              tasks={filtered.filter(t => t.priority === 'urgent_important')}
              onToggle={toggleComplete}
              onView={setSelectedTask}
            />
            {/* Q2: Important, Not Urgent */}
            <MatrixQuadrant
              title="Schedule (Important, Not Urgent)"
              subtitle="Long-term projects, study goals, preparation"
              icon={Target}
              colorClass="border-orange-300 dark:border-orange-800 bg-orange-50/20 dark:bg-orange-950/10 text-orange-600 dark:text-orange-400"
              tasks={filtered.filter(t => t.priority === 'important_not_urgent')}
              onToggle={toggleComplete}
              onView={setSelectedTask}
            />
            {/* Q3: Urgent, Not Important */}
            <MatrixQuadrant
              title="Delegate / Quick (Urgent, Not Important)"
              subtitle="Minor interruptions, routine coordination"
              icon={Zap}
              colorClass="border-yellow-300 dark:border-yellow-800 bg-yellow-50/20 dark:bg-yellow-950/10 text-yellow-600 dark:text-yellow-400"
              tasks={filtered.filter(t => t.priority === 'urgent_not_important')}
              onToggle={toggleComplete}
              onView={setSelectedTask}
            />
            {/* Q4: Low Priority */}
            <MatrixQuadrant
              title="Eliminate / Backlog (Low Priority)"
              subtitle="Low impact, nice-to-have later"
              icon={Archive}
              colorClass="border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 text-slate-600 dark:text-slate-400"
              tasks={filtered.filter(t => t.priority === 'low')}
              onToggle={toggleComplete}
              onView={setSelectedTask}
            />
          </div>
        ) : (
          /* Kanban Board View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KanbanColumn
              title="To Do"
              count={filtered.filter(t => t.status === 'not_started').length}
              tasks={filtered.filter(t => t.status === 'not_started')}
              nextStatus="in_progress"
              nextLabel="Start"
              onToggle={toggleComplete}
              onView={setSelectedTask}
              onMoveStatus={(t, s) => { demoStore.updateTask(t.id, { status: s }); refresh(v => v + 1) }}
            />
            <KanbanColumn
              title="In Progress"
              count={filtered.filter(t => t.status === 'in_progress').length}
              tasks={filtered.filter(t => t.status === 'in_progress')}
              nextStatus="completed"
              nextLabel="Complete"
              onToggle={toggleComplete}
              onView={setSelectedTask}
              onMoveStatus={(t, s) => { demoStore.updateTask(t.id, { status: s }); refresh(v => v + 1) }}
            />
            <KanbanColumn
              title="Waiting"
              count={filtered.filter(t => t.status === 'waiting').length}
              tasks={filtered.filter(t => t.status === 'waiting')}
              nextStatus="in_progress"
              nextLabel="Resume"
              onToggle={toggleComplete}
              onView={setSelectedTask}
              onMoveStatus={(t, s) => { demoStore.updateTask(t.id, { status: s }); refresh(v => v + 1) }}
            />
            <KanbanColumn
              title="Completed"
              count={filtered.filter(t => t.status === 'completed').length}
              tasks={filtered.filter(t => t.status === 'completed')}
              nextStatus="not_started"
              nextLabel="Reopen"
              onToggle={toggleComplete}
              onView={setSelectedTask}
              onMoveStatus={(t, s) => { demoStore.updateTask(t.id, { status: s }); refresh(v => v + 1) }}
            />
          </div>
        )}
      </PageLayout>

      <AddTaskModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={() => { setShowAdd(false); refresh(v => v + 1); toast.success('Task created!') }}
      />
      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={() => refresh(v => v + 1)}
        />
      )}
    </>
  )
}

// ============================================================
// Eisenhower Matrix Quadrant Card
// ============================================================
function MatrixQuadrant({
  title, subtitle, icon: Icon, colorClass, tasks, onToggle, onView
}: {
  title: string
  subtitle: string
  icon: any
  colorClass: string
  tasks: Task[]
  onToggle: (t: Task) => void
  onView: (t: Task) => void
}) {
  return (
    <div className={`card p-4 border-2 ${colorClass} flex flex-col min-h-[300px]`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 shrink-0" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{title}</h3>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-white/80 dark:bg-slate-800 shadow-2xs">
          {tasks.length}
        </span>
      </div>
      <p className="text-[11px] text-slate-500 mb-3">{subtitle}</p>

      <div className="flex-1 space-y-2 overflow-y-auto max-h-80 pr-1">
        {tasks.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 italic py-8">
            No tasks in this quadrant
          </div>
        ) : (
          tasks.map(task => (
            <div
              key={task.id}
              onClick={() => onView(task)}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:shadow-card-md transition-all cursor-pointer flex items-start gap-2.5"
            >
              <button
                onClick={e => { e.stopPropagation(); onToggle(task) }}
                className="mt-0.5 text-slate-400 hover:text-green-500 transition-colors shrink-0"
              >
                {task.status === 'completed' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold truncate ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                  {task.title}
                </p>
                {task.deadline && (
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    📅 {formatDeadline(task.deadline)}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ============================================================
// Kanban Board Column
// ============================================================
function KanbanColumn({
  title, count, tasks, nextStatus, nextLabel, onToggle, onView, onMoveStatus
}: {
  title: string
  count: number
  tasks: Task[]
  nextStatus: TaskStatus
  nextLabel: string
  onToggle: (t: Task) => void
  onView: (t: Task) => void
  onMoveStatus: (t: Task, s: TaskStatus) => void
}) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-3 border border-slate-200 dark:border-slate-700/80 flex flex-col min-h-[360px]">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">{title}</h3>
        <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300">
          {count}
        </span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto max-h-[500px]">
        {tasks.length === 0 ? (
          <div className="text-center text-xs text-slate-400 py-10">Empty</div>
        ) : (
          tasks.map(task => (
            <div
              key={task.id}
              onClick={() => onView(task)}
              className="card p-3 hover:shadow-card-md transition-all cursor-pointer space-y-2 group"
            >
              <div className="flex items-start justify-between gap-2">
                <p className={`text-xs font-semibold ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                  {task.title}
                </p>
                <PriorityBadge priority={task.priority} />
              </div>
              {task.description && (
                <p className="text-[11px] text-slate-500 line-clamp-2">{task.description}</p>
              )}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/60 text-[10px]">
                <span className="text-slate-400">
                  {task.deadline ? formatDeadline(task.deadline) : 'No date'}
                </span>
                <button
                  onClick={e => { e.stopPropagation(); onMoveStatus(task, nextStatus) }}
                  className="px-2 py-0.5 rounded font-medium bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors flex items-center gap-1"
                >
                  {nextLabel} <ArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ============================================================
// Task Card (List View)
// ============================================================
function TaskCard({
  task, onToggle, onView, onDelete, onRefresh
}: {
  task: Task
  onToggle: (t: Task) => void
  onView: () => void
  onDelete: () => void
  onRefresh: () => void
}) {
  const isCompleted = task.status === 'completed'
  const isOverdue = isDeadlineOverdue(task.deadline)
  const pInfo = PRIORITIES[task.priority]
  const completedSubs = task.subtasks.filter(s => s.is_completed).length

  const updateStatus = (status: TaskStatus) => {
    demoStore.updateTask(task.id, { status })
    onRefresh()
  }

  return (
    <div
      className={`card p-4 ${pInfo.borderClass} ${isCompleted ? 'opacity-60' : ''} hover:shadow-card-md transition-all cursor-pointer`}
      onClick={onView}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={e => { e.stopPropagation(); onToggle(task) }}
          className={`mt-0.5 shrink-0 transition-colors ${isCompleted ? 'text-green-500' : 'text-slate-400 hover:text-primary-500'}`}
          aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
        >
          {isCompleted ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                {task.title}
              </p>
              {task.description && (
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{task.description}</p>
              )}
            </div>

            <div onClick={e => e.stopPropagation()}>
              <Dropdown
                trigger={
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                }
                items={[
                  { label: 'View / Edit Details', icon: <Edit2 className="w-3.5 h-3.5" />, onClick: onView },
                  { label: 'Set In Progress', onClick: () => updateStatus('in_progress') },
                  { label: 'Set Waiting', onClick: () => updateStatus('waiting') },
                  { label: 'Set Completed', onClick: () => updateStatus('completed') },
                  { label: 'Delete Task', icon: <Trash2 className="w-3.5 h-3.5" />, onClick: onDelete, danger: true },
                ]}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <PriorityBadge priority={task.priority} />
            <CategoryBadge category={task.category} />
            <StatusBadge status={task.status} />
            {task.deadline && (
              <span className={`text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-slate-500'}`}>
                {isOverdue ? '⚠️ ' : '📅 '}{formatDeadline(task.deadline)}
              </span>
            )}
            {task.estimated_minutes && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />{formatMinutes(task.estimated_minutes)}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-slate-400">
            {task.subtasks.length > 0 && (
              <span>{completedSubs}/{task.subtasks.length} subtasks</span>
            )}
            {task.delegated_to && (
              <span className="flex items-center gap-1"><User className="w-3 h-3" />→ {task.delegated_to}</span>
            )}
            {task.related_notice_title && (
              <span className="text-primary-500 flex items-center gap-1">
                <LinkIcon className="w-3 h-3" />{task.related_notice_title.slice(0, 30)}…
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
