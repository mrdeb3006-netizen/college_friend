import React, { useState } from 'react'
import { format } from 'date-fns'
import {
  Plus, Star, ExternalLink,
  Inbox as InboxIcon, Sparkles,
  Search, MoreHorizontal, CheckCircle, CheckSquare, Loader2, Trash2,
  Calendar, FileText, ArrowRight, Zap
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

const SAMPLE_NOTICES = [
  {
    label: '📝 Midterm Exam Schedule',
    text: 'URGENT CIRCULAR: Midterm Examination for CS301 Algorithms scheduled for Oct 24, 2026 at 10:00 AM in Hall B. Registration deadline is Oct 18.',
  },
  {
    label: '🚀 AI Innovation Hackathon',
    text: 'Inter-College AI Hackathon: Registrations close on Oct 30, 2026. Teams of 2-4 members. 48-hour challenge with cash prize pool of $5000. Apply at https://hackathon.edu',
  },
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

  const handleQuickExtract = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault()
    const textToExtract = (customText || quickPaste).trim()
    if (!textToExtract || extracting) return
    setExtracting(true)
    try {
      const { extraction } = await extractNotice(textToExtract)
      demoStore.addInboxItem({
        title: extraction.title || 'Extracted Notice',
        description: textToExtract,
        source: 'AI Instant Extraction',
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
      toast.success('Notice analyzed & added to Inbox!')
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
  const importantCount = allItems.filter(i => i.is_important).length

  return (
    <>
      <PageLayout
        title="Smart Inbox"
        subtitle={`${allItems.length} notices captured · ${unreadCount} unread · ${importantCount} starred`}
        action={
          <Button variant="primary" onClick={() => setShowAdd(true)} id="inbox-add-btn" className="shadow-glow-primary">
            <Plus className="w-4 h-4" /> Add Notice
          </Button>
        }
      >
        {/* Quick Paste & AI Extract Card (Linear / Raycast High-End Style) */}
        <div className="glass-card-interactive p-5 mb-6 rounded-3xl relative overflow-hidden bg-gradient-to-r from-primary-500/[0.08] via-purple-500/[0.05] to-indigo-500/[0.08] border border-primary-300/60 dark:border-primary-800/60">
          <form onSubmit={e => handleQuickExtract(e)} className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                </span>
                Instant AI Circular & Notice Parser
              </label>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Auto-extracts deadlines, actions, and dates with Gemini
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                className="input flex-1 h-11 text-xs shadow-xs rounded-xl focus:ring-2 focus:ring-primary-500/40"
                placeholder="Paste raw WhatsApp circular, exam notice, hackathon announcement, or club email..."
                value={quickPaste}
                onChange={e => setQuickPaste(e.target.value)}
              />
              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={!quickPaste.trim() || extracting}
                className="h-11 shrink-0 px-5 shadow-glow-primary hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {extracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {extracting ? 'Analyzing...' : 'Parse & Ingest'}
              </Button>
            </div>

            {/* Quick Sample Notice Chips */}
            <div className="flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 shrink-0">
                Sample tests:
              </span>
              {SAMPLE_NOTICES.map(sample => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => {
                    setQuickPaste(sample.text)
                    handleQuickExtract(undefined, sample.text)
                  }}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/70 dark:bg-slate-800/80 hover:bg-primary-50 dark:hover:bg-primary-950/50 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:border-primary-400 dark:hover:border-primary-600 shrink-0 transition-all cursor-pointer"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </form>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 min-w-56">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="input pl-10 h-10 text-xs rounded-xl shadow-2xs"
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
            className={`filter-chip ${onlyImportant ? 'active bg-amber-50 dark:bg-amber-950/50 border-amber-400 text-amber-700 dark:text-amber-300' : ''}`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyImportant ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
            Important only
          </button>
        </div>

        {/* Notice Cards List */}
        {filtered.length === 0 ? (
          <div className="glass-card-interactive p-12 text-center rounded-3xl">
            <EmptyState
              icon={<InboxIcon className="w-8 h-8 text-primary-500" />}
              title={search ? 'No notices match your search' : 'No notices in inbox'}
              description={search ? 'Try clearing or modifying your filter query.' : 'Capture notices, WhatsApp messages, or academic announcements here.'}
              action={
                <Button variant="primary" onClick={() => setShowAdd(true)} className="shadow-glow-primary">
                  <Plus className="w-4 h-4" /> Add Notice
                </Button>
              }
            />
          </div>
        ) : (
          <div className="space-y-3">
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
// Inbox Card (Elevated Frosted Glass Style)
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
      className={`glass-card-interactive p-4 sm:p-5 rounded-2xl transition-all cursor-pointer ${
        isUnread ? 'border-l-4 border-l-primary-500 shadow-glow-primary/10' : ''
      }`}
      onClick={onView}
    >
      <div className="flex items-start gap-3.5">
        {/* Star Button */}
        <button
          onClick={e => { e.stopPropagation(); onToggleImportant() }}
          className={`mt-1 shrink-0 transition-transform hover:scale-125 cursor-pointer ${
            item.is_important ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600 hover:text-amber-400'
          }`}
          aria-label={item.is_important ? 'Remove from important' : 'Mark as important'}
        >
          <Star className={`w-4 h-4 ${item.is_important ? 'fill-amber-500' : ''}`} />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {isUnread && (
                  <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0 ring-4 ring-primary-500/20" />
                )}
                <p className={`text-sm sm:text-base font-extrabold truncate ${isUnread ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                  {item.title}
                </p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                {item.source} · {formatRelative(item.received_at)}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
              <button
                onClick={onConvertToTask}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/60 hover:bg-primary-100 dark:hover:bg-primary-900/60 border border-primary-200/60 dark:border-primary-800/60 transition-all cursor-pointer hover:scale-105"
                title="Create task linked to this notice"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Create Task</span>
              </button>
              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <Dropdown
                trigger={
                  <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
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
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}

          {/* Badges & Meta Preview */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <CategoryBadge category={item.category} />
            <StatusBadge status={item.status} />
            {item.registration_deadline && (
              <span className="text-xs text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/50 px-2.5 py-0.5 rounded-full border border-red-200 dark:border-red-800/60">
                📅 Deadline: {format(new Date(item.registration_deadline), 'MMM d, yyyy')}
              </span>
            )}
            {item.ai_extraction && (
              <span className="text-xs text-primary-600 dark:text-primary-400 font-semibold bg-primary-50 dark:bg-primary-950/50 px-2 py-0.5 rounded-full border border-primary-200/60 dark:border-primary-800/60 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Extracted
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
