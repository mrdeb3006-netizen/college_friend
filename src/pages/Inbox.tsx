import React, { useState } from 'react'
import { format } from 'date-fns'
import {
  Plus, Star, ExternalLink,
  Inbox as InboxIcon, Sparkles,
  Search, MoreHorizontal, CheckCircle, CheckSquare, Loader2, Trash2
} from 'lucide-react'
import { demoStore } from '../lib/demoStore'
import { CATEGORY_LIST, formatRelative } from '../lib/utils'
import { Button, EmptyState } from '../components/ui'
import { CategoryBadge, StatusBadge } from '../components/ui/Badge'
import { Dropdown } from '../components/ui/Overlays'
import { PageLayout } from '../components/layout/Navigation'
import AddInboxModal from '../components/inbox/AddInboxModal'
import AddTaskModal from '../components/tasks/AddTaskModal'
import InboxItemDetail from '../components/inbox/InboxItemDetail'
import { extractNotice } from '../services/ai'
import type { InboxItem, Category, InboxStatus } from '../lib/types'
import toast from 'react-hot-toast'

const STATUS_FILTERS: { value: InboxStatus | 'all'; label: string }[] = [
  { value: 'all',      label: 'All' },
  { value: 'unread',   label: 'Unread' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'acted',    label: 'Acted' },
]

export default function InboxPage() {
  const [, refresh] = useState(0)
  const [showAdd, setShowAdd] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InboxItem | null>(null)
  const [statusFilter, setStatusFilter] = useState<InboxStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all')
  const [search, setSearch] = useState('')
  const [onlyImportant, setOnlyImportant] = useState(false)

  // Quick extract state
  const [quickPaste, setQuickPaste] = useState('')
  const [extracting, setExtracting] = useState(false)

  // Convert notice to task modal
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [taskPrefill, setTaskPrefill] = useState<any>(null)

  const allItems = demoStore.getInbox()

  const handleQuickExtract = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickPaste.trim() || extracting) return
    setExtracting(true)
    try {
      const { extraction } = await extractNotice(quickPaste)
      demoStore.addInboxItem({
        title: extraction.title || 'Notice',
        description: quickPaste,
        source: 'Quick Paste',
        category: (extraction.category as Category) || 'general',
        status: 'unread',
        received_at: new Date().toISOString(),
        event_date: extraction.event_date || null,
        registration_deadline: extraction.registration_deadline || null,
        link: extraction.registration_link || null,
        attachment_url: null,
        attachment_name: null,
        is_important: true,
        ai_extraction: extraction,
      })
      setQuickPaste('')
      refresh(v => v + 1)
      toast.success('Notice extracted & saved to Inbox!')
    } catch {
      toast.error('Extraction failed. Please try again.')
    }
    setExtracting(false)
  }

  const handleConvertToTask = (item: InboxItem) => {
    setTaskPrefill({
      title: `Act on: ${item.title}`,
      description: item.description,
      deadline: item.registration_deadline || item.event_date || null,
      category: item.category,
      related_notice_id: item.id,
      related_notice_title: item.title,
    })
    setTaskModalOpen(true)
  }

  const filtered = allItems
    .filter(i => statusFilter === 'all' || i.status === statusFilter)
    .filter(i => categoryFilter === 'all' || i.category === categoryFilter)
    .filter(i => !onlyImportant || i.is_important)
    .filter(i => {
      if (!search) return true
      const q = search.toLowerCase()
      return i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.source.toLowerCase().includes(q)
    })
    .sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime())

  const toggleImportant = (item: InboxItem) => {
    demoStore.updateInboxItem(item.id, { is_important: !item.is_important })
    refresh(v => v + 1)
  }

  const markStatus = (item: InboxItem, status: InboxStatus) => {
    demoStore.updateInboxItem(item.id, { status })
    refresh(v => v + 1)
  }

  const deleteItem = (item: InboxItem) => {
    demoStore.deleteInboxItem(item.id)
    toast.success('Item deleted')
    refresh(v => v + 1)
  }

  const unreadCount = allItems.filter(i => i.status === 'unread').length

  return (
    <>
      <PageLayout
        title="Smart Inbox"
        subtitle={`${allItems.length} notices captured · ${unreadCount} unread`}
        action={
          <Button variant="primary" onClick={() => setShowAdd(true)} id="inbox-add-btn">
            <Plus className="w-4 h-4" /> Add Notice
          </Button>
        }
      >
        {/* Quick Paste & AI Extract Banner */}
        <div className="card p-4 mb-5 bg-gradient-to-r from-primary-500/5 via-purple-500/5 to-indigo-500/5 border-primary-200/60 dark:border-primary-800/40">
          <form onSubmit={handleQuickExtract} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary-500" />
                Quick Paste & AI Notice Parser
              </label>
              <span className="text-[11px] text-slate-400">Extracts deadlines, fees & tasks automatically</span>
            </div>
            <div className="flex gap-2">
              <input
                className="input flex-1 h-9 text-xs"
                placeholder="Paste WhatsApp message, circular text, or email announcement here..."
                value={quickPaste}
                onChange={e => setQuickPaste(e.target.value)}
              />
              <Button variant="primary" size="sm" type="submit" disabled={!quickPaste.trim() || extracting} className="shrink-0">
                {extracting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {extracting ? 'Analyzing...' : 'Parse Notice'}
              </Button>
            </div>
          </form>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="input pl-9 h-9 text-sm"
              placeholder="Search by title, keywords or sender..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              id="inbox-search"
            />
          </div>

          {/* Status filter */}
          <div className="flex gap-1.5 flex-wrap">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`filter-chip ${statusFilter === f.value ? 'active' : ''}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`filter-chip ${categoryFilter === 'all' ? 'active' : ''}`}
            >All Categories</button>
            {CATEGORY_LIST.map(c => (
              <button
                key={c.value}
                onClick={() => setCategoryFilter(c.value)}
                className={`filter-chip ${categoryFilter === c.value ? 'active' : ''}`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Important toggle */}
          <button
            onClick={() => setOnlyImportant(v => !v)}
            className={`filter-chip ${onlyImportant ? 'active' : ''}`}
          >
            ⭐ Important only
          </button>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<InboxIcon className="w-8 h-8" />}
            title={search ? 'No notices match your search' : 'No notices in inbox'}
            description={search ? 'Try clearing your filters.' : 'Capture notices, WhatsApp messages, or announcements here.'}
            action={
              <Button variant="primary" onClick={() => setShowAdd(true)}>
                <Plus className="w-4 h-4" /> Add Notice
              </Button>
            }
          />
        ) : (
          <div className="space-y-2">
            {filtered.map(item => (
              <InboxCard
                key={item.id}
                item={item}
                onView={() => { setSelectedItem(item); markStatus(item, 'reviewed') }}
                onToggleImportant={() => toggleImportant(item)}
                onMarkActed={() => markStatus(item, 'acted')}
                onDelete={() => deleteItem(item)}
                onConvertToTask={() => handleConvertToTask(item)}
              />
            ))}
          </div>
        )}
      </PageLayout>

      <AddInboxModal open={showAdd} onClose={() => setShowAdd(false)} onSave={() => { setShowAdd(false); refresh(v => v + 1) }} />
      
      {taskModalOpen && (
        <AddTaskModal
          open={taskModalOpen}
          prefilled={taskPrefill}
          onClose={() => setTaskModalOpen(false)}
          onSave={() => { setTaskModalOpen(false); refresh(v => v + 1); toast.success('Task created from notice!') }}
        />
      )}

      {selectedItem && (
        <InboxItemDetail
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onUpdate={() => refresh(v => v + 1)}
        />
      )}
    </>
  )
}

// ============================================================
// Inbox Card
// ============================================================
function InboxCard({
  item, onView, onToggleImportant, onMarkActed, onDelete, onConvertToTask
}: {
  item: InboxItem
  onView: () => void
  onToggleImportant: () => void
  onMarkActed: () => void
  onDelete: () => void
  onConvertToTask: () => void
}) {
  const isUnread = item.status === 'unread'

  return (
    <div
      className={`card-hover p-4 ${isUnread ? 'border-l-4 border-primary-500' : ''}`}
      onClick={onView}
    >
      <div className="flex items-start gap-3">
        {/* Star */}
        <button
          onClick={e => { e.stopPropagation(); onToggleImportant() }}
          className={`mt-0.5 shrink-0 transition-colors ${item.is_important ? 'text-yellow-500' : 'text-slate-300 hover:text-yellow-400'}`}
          aria-label={item.is_important ? 'Remove from important' : 'Mark as important'}
        >
          <Star className={`w-4 h-4 ${item.is_important ? 'fill-current' : ''}`} />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {isUnread && <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />}
                <p className={`text-sm font-semibold truncate ${isUnread ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}>
                  {item.title}
                </p>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{item.source} · {formatRelative(item.received_at)}</p>
            </div>
            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
              <button
                onClick={onConvertToTask}
                className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-primary-600 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors"
                title="Create task linked to this notice"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Task</span>
              </button>
              {item.link && (
                <a href={item.link} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-primary-500 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <Dropdown
                trigger={
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                }
                items={[
                  { label: 'Turn into Task', icon: <CheckSquare className="w-3.5 h-3.5" />, onClick: onConvertToTask },
                  { label: item.is_important ? 'Remove star' : 'Mark important', icon: <Star className="w-3.5 h-3.5" />, onClick: onToggleImportant },
                  { label: 'Mark as acted', icon: <CheckCircle className="w-3.5 h-3.5" />, onClick: onMarkActed },
                  { label: 'Delete notice', icon: <Trash2 className="w-3.5 h-3.5" />, onClick: onDelete, danger: true },
                ]}
              />
            </div>
          </div>

          {/* Description preview */}
          {item.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap gap-2 mt-2">
            <CategoryBadge category={item.category} />
            <StatusBadge status={item.status} />
            {item.registration_deadline && (
              <span className="text-xs text-red-500 font-medium">
                📅 Deadline: {format(new Date(item.registration_deadline), 'MMM d')}
              </span>
            )}
            {item.ai_extraction && (
              <span className="text-xs text-primary-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI analyzed
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
