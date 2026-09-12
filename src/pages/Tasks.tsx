import React, { useState } from 'react'
import {
  Plus, CheckCircle2, Circle, Clock, Filter, Search,
  ChevronDown, MoreHorizontal, Trash2, Edit2, ArrowUpCircle,
  Link as LinkIcon, User, FileText
} from 'lucide-react'
import { demoStore } from '../lib/demoStore'
import {
  PRIORITIES, CATEGORIES, CATEGORY_LIST, PRIORITY_LIST,
  formatDeadline, formatMinutes, isDeadlineOverdue, formatRelative
} from '../lib/utils'
import { Button, EmptyState, Checkbox } from '../components/ui'
import { PriorityBadge, CategoryBadge, StatusBadge } from '../components/ui/Badge'
import { Dropdown } from '../components/ui/Overlays'
import { PageLayout } from '../components/layout/Navigation'
import AddTaskModal from '../components/tasks/AddTaskModal'
import TaskDetailDrawer from '../components/tasks/TaskDetailDrawer'
import type { Task, Priority, Category, TaskStatus } from '../lib/types'
import toast from 'react-hot-toast'

const STATUS_OPTIONS: { value: TaskStatus | 'all'; label: string }[] = [
  { value: 'all',         label: 'All' },
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting',     label: 'Waiting' },
  { value: 'completed',   label: 'Completed' },
]

export default function TasksPage() {
  const [, refresh] = useState(0)
  const [showAdd, setShowAdd] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all')
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const allTasks = demoStore.getTasks()

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
      // Sort: urgent first, then by deadline
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

  return (
    <>
      <PageLayout
        title="My Tasks"
        subtitle={`${completedCount}/${totalCount} completed`}
        action={
          <Button variant="primary" onClick={() => setShowAdd(true)} id="tasks-add-btn">
            <Plus className="w-4 h-4" /> New Task
          </Button>
        }
      >
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="input pl-9 h-9 text-sm"
              placeholder="Search tasks..."
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
          <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-3 animate-fade-in">
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

        {/* Task list */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="✅"
            title={search ? 'No tasks match your search' : 'No tasks yet'}
            description={search ? 'Try different search terms.' : 'Create a task manually or generate one from an inbox notice.'}
            action={
              !search ? (
                <Button variant="primary" onClick={() => setShowAdd(true)}>
                  <Plus className="w-4 h-4" /> Create Task
                </Button>
              ) : undefined
            }
          />
        ) : (
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
// Task Card
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
        {/* Checkbox */}
        <button
          onClick={e => { e.stopPropagation(); onToggle(task) }}
          className={`mt-0.5 shrink-0 transition-colors ${isCompleted ? 'text-green-500' : 'text-slate-400 hover:text-primary-500'}`}
          aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
        >
          {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
        </button>

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                {task.title}
              </p>
              {task.description && (
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{task.description}</p>
              )}
            </div>

            {/* Context menu */}
            <div onClick={e => e.stopPropagation()}>
              <Dropdown
                trigger={
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                }
                items={[
                  { label: 'View / Edit', icon: <Edit2 className="w-3.5 h-3.5" />, onClick: onView },
                  { label: 'Mark In Progress', onClick: () => updateStatus('in_progress') },
                  { label: 'Mark Waiting', onClick: () => updateStatus('waiting') },
                  { label: 'Mark Completed', onClick: () => updateStatus('completed') },
                  { label: 'Delete', icon: <Trash2 className="w-3.5 h-3.5" />, onClick: onDelete, danger: true },
                ]}
              />
            </div>
          </div>

          {/* Meta row */}
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

          {/* Subtask progress + delegation */}
          <div className="flex flex-wrap gap-3 mt-1.5">
            {task.subtasks.length > 0 && (
              <span className="text-xs text-slate-400">
                {completedSubs}/{task.subtasks.length} subtasks
              </span>
            )}
            {task.delegated_to && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <User className="w-3 h-3" />→ {task.delegated_to}
              </span>
            )}
            {task.related_notice_title && (
              <span className="text-xs text-primary-500 flex items-center gap-1">
                <LinkIcon className="w-3 h-3" />{task.related_notice_title.slice(0, 30)}…
              </span>
            )}
            {task.user_overrode_priority && task.ai_suggested_priority && (
              <span className="text-xs text-amber-500 flex items-center gap-1">
                ✏️ Priority overridden (AI: {PRIORITIES[task.ai_suggested_priority]?.emoji})
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
