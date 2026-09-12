import React, { useState, useCallback } from 'react'
import { format } from 'date-fns'
import {
  Plus, Star, StarOff, Trash2, ExternalLink, Filter,
  Inbox as InboxIcon, Sparkles, ChevronDown, ChevronUp,
  Search, MoreHorizontal, CheckCircle
} from 'lucide-react'
import { demoStore } from '../lib/demoStore'
import { CATEGORIES, CATEGORY_LIST, formatDeadline, formatRelative, truncate } from '../lib/utils'
import { Button, EmptyState } from '../components/ui'
import { CategoryBadge, StatusBadge } from '../components/ui/Badge'
import { Dropdown } from '../components/ui/Overlays'
import { PageLayout } from '../components/layout/Navigation'
import AddInboxModal from '../components/inbox/AddInboxModal'
import InboxItemDetail from '../components/inbox/InboxItemDetail'
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

  const allItems = demoStore.getInbox()

  const filtered = allItems
    .filter(i => statusFilter === 'all' || i.status === statusFilter)
    .filter(i => categoryFilter === 'all' || i.category === categoryFilter)
    .filter(i => !onlyImportant || i.is_important)
    .filter(i => {
      if (!search) return true
      const q = search.toLowerCase()
      return i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.source.toLowerCase().includes(q)
    })

  const toggleImportant = (item: InboxItem) => {
    demoStore.updateInboxItem(item.id, { is_important: !item.is_important })
    toast.success(item.is_important ? 'Removed from Important' : '⭐ Marked as Important')
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
        title="College Inbox"
        subtitle={`${allItems.length} items · ${unreadCount} unread`}
        action={
          <Button variant="primary" onClick={() => setShowAdd(true)} id="inbox-add-btn">
            <Plus className="w-4 h-4" /> Add Item
          </Button>
        }
      >
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="input pl-9 h-9 text-sm"
              placeholder="Search inbox..."
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
            title="Nothing here yet"
            description="Add college notices, WhatsApp messages, PDFs or links to your inbox."
            action={
              <Button variant="primary" onClick={() => setShowAdd(true)}>
                <Plus className="w-4 h-4" /> Add to Inbox
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
              />
            ))}
          </div>
        )}
      </PageLayout>

      <AddInboxModal open={showAdd} onClose={() => setShowAdd(false)} onSave={() => { setShowAdd(false); refresh(v => v + 1) }} />
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
  item, onView, onToggleImportant, onMarkActed, onDelete
}: {
  item: InboxItem
  onView: () => void
  onToggleImportant: () => void
  onMarkActed: () => void
  onDelete: () => void
}) {
  const isUnread = item.status === 'unread'

  return (
    <div
      className={`card-hover p-4 ${isUnread ? 'border-l-4 border-primary-400' : ''}`}
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
                  { label: item.is_important ? 'Remove star' : 'Mark important', icon: <Star className="w-3.5 h-3.5" />, onClick: onToggleImportant },
                  { label: 'Mark as acted', icon: <CheckCircle className="w-3.5 h-3.5" />, onClick: onMarkActed },
                  { label: 'Delete', icon: <Trash2 className="w-3.5 h-3.5" />, onClick: onDelete, danger: true },
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
