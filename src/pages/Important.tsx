import React, { useState } from 'react'
import { format } from 'date-fns'
import { Plus, Filter, Star, ArrowRight } from 'lucide-react'
import { demoStore } from '../lib/demoStore'
import { CATEGORY_LIST, formatDeadline, formatRelative } from '../lib/utils'
import { Button, EmptyState } from '../components/ui'
import { CategoryBadge } from '../components/ui/Badge'
import { PageLayout } from '../components/layout/Navigation'
import InboxItemDetail from '../components/inbox/InboxItemDetail'
import AddTaskModal from '../components/tasks/AddTaskModal'
import type { InboxItem, Category } from '../lib/types'
import toast from 'react-hot-toast'

type SortOption = 'deadline' | 'newest' | 'category' | 'event_date'

export default function ImportantPage() {
  const [, refresh] = useState(0)
  const [selectedItem, setSelectedItem] = useState<InboxItem | null>(null)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [taskPrefill, setTaskPrefill] = useState<any>(null)
  const [sort, setSort] = useState<SortOption>('deadline')
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all')

  const inbox = demoStore.getInbox()
  const important = inbox.filter(i => i.is_important)

  const filtered = important
    .filter(i => categoryFilter === 'all' || i.category === categoryFilter)
    .sort((a, b) => {
      if (sort === 'deadline') {
        const ad = a.registration_deadline || a.event_date || '9999'
        const bd = b.registration_deadline || b.event_date || '9999'
        return ad.localeCompare(bd)
      }
      if (sort === 'newest') return b.received_at.localeCompare(a.received_at)
      if (sort === 'category') return a.category.localeCompare(b.category)
      if (sort === 'event_date') {
        const ae = a.event_date || '9999'
        const be = b.event_date || '9999'
        return ae.localeCompare(be)
      }
      return 0
    })

  const createTask = (item: InboxItem) => {
    setTaskPrefill({
      title: `Act on: ${item.title}`,
      description: '',
      deadline: item.registration_deadline || item.event_date || '',
      category: item.category,
      related_notice_id: item.id,
      related_notice_title: item.title,
    })
    setShowCreateTask(true)
  }

  const removeImportant = (item: InboxItem) => {
    demoStore.updateInboxItem(item.id, { is_important: false })
    toast.success('Removed from Important')
    refresh(v => v + 1)
  }

  return (
    <>
      <PageLayout
        title="Important"
        subtitle={`${filtered.length} starred items`}
      >
        {/* Sort / filter bar */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="flex gap-1.5 flex-wrap">
            {([
              { value: 'deadline', label: 'By Deadline' },
              { value: 'newest',   label: 'Newest' },
              { value: 'category', label: 'Category' },
              { value: 'event_date', label: 'Event Date' },
            ] as const).map(s => (
              <button key={s.value} onClick={() => setSort(s.value)} className={`filter-chip ${sort === s.value ? 'active' : ''}`}>
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => setCategoryFilter('all')} className={`filter-chip ${categoryFilter === 'all' ? 'active' : ''}`}>All</button>
            {CATEGORY_LIST.map(c => (
              <button key={c.value} onClick={() => setCategoryFilter(c.value)} className={`filter-chip ${categoryFilter === c.value ? 'active' : ''}`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="⭐"
            title="Nothing starred yet"
            description="Mark inbox items as Important to see them here."
          />
        ) : (
          <div className="space-y-3">
            {filtered.map(item => (
              <ImportantCard
                key={item.id}
                item={item}
                onView={() => setSelectedItem(item)}
                onCreateTask={() => createTask(item)}
                onRemove={() => removeImportant(item)}
              />
            ))}
          </div>
        )}
      </PageLayout>

      {selectedItem && (
        <InboxItemDetail
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onUpdate={() => refresh(v => v + 1)}
        />
      )}
      {showCreateTask && taskPrefill && (
        <AddTaskModal
          open={showCreateTask}
          onClose={() => setShowCreateTask(false)}
          prefilled={taskPrefill}
          onSave={() => { setShowCreateTask(false); toast.success('Task created!') }}
        />
      )}
    </>
  )
}

function ImportantCard({
  item, onView, onCreateTask, onRemove
}: {
  item: InboxItem
  onView: () => void
  onCreateTask: () => void
  onRemove: () => void
}) {
  const daysUntilDeadline = item.registration_deadline
    ? Math.ceil((new Date(item.registration_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  const isUrgent = daysUntilDeadline !== null && daysUntilDeadline <= 3

  return (
    <div className={`card p-4 ${isUrgent ? 'border-l-4 border-red-400' : 'border-l-4 border-yellow-400'}`}>
      <div className="flex items-start gap-3">
        <Star className="w-5 h-5 text-yellow-500 fill-current shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
              {item.description && (
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>
              )}
            </div>
            <button
              onClick={onRemove}
              className="p-1 text-slate-300 hover:text-red-400 transition-colors shrink-0"
              title="Remove star"
            >
              ✕
            </button>
          </div>

          {/* Dates */}
          <div className="flex flex-wrap gap-3 mt-2">
            {item.registration_deadline && (
              <div className={`text-xs font-semibold ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`}>
                📅 Registration closes: {format(new Date(item.registration_deadline), 'MMM d')}
                {daysUntilDeadline !== null && (
                  <span className="ml-1 font-normal">
                    ({daysUntilDeadline <= 0 ? 'overdue' : `${daysUntilDeadline}d left`})
                  </span>
                )}
              </div>
            )}
            {item.event_date && (
              <div className="text-xs text-blue-600 dark:text-blue-400">
                🗓️ Event: {format(new Date(item.event_date), 'MMM d')}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <CategoryBadge category={item.category} />
            <div className="ml-auto flex gap-2">
              <button onClick={onView} className="btn btn-ghost btn-sm text-xs">
                View Details
              </button>
              <button onClick={onCreateTask} className="btn btn-primary btn-sm text-xs">
                <Plus className="w-3 h-3" /> Create Task
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
