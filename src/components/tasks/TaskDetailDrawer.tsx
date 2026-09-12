import React, { useState } from 'react'
import { Drawer } from '../ui/Overlays'
import { Button, Input, Textarea, Select, Checkbox } from '../ui'
import { PriorityBadge, CategoryBadge, StatusBadge } from '../ui/Badge'
import { demoStore } from '../../lib/demoStore'
import {
  PRIORITIES, PRIORITY_LIST, CATEGORY_LIST, TASK_STATUSES,
  formatDate, formatDeadline, formatMinutes, generateId
} from '../../lib/utils'
import type { Task, Priority, Category, TaskStatus, Subtask } from '../../lib/types'
import {
  Clock, Calendar, User, Link as LinkIcon, Sparkles,
  Plus, Trash2, ChevronDown, ChevronUp, Edit2, Check, X
} from 'lucide-react'
import { suggestPriority } from '../../services/ai'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface TaskDetailDrawerProps {
  task: Task
  onClose: () => void
  onUpdate: () => void
}

export default function TaskDetailDrawer({ task, onClose, onUpdate }: TaskDetailDrawerProps) {
  const [editing, setEditing] = useState(false)
  const [suggestingPriority, setSuggestingPriority] = useState(false)
  const [showSubtasks, setShowSubtasks] = useState(true)
  const [newSubtask, setNewSubtask] = useState('')
  const [, refresh] = useState(0)

  const current = () => demoStore.getTasks().find(t => t.id === task.id) || task

  const [form, setForm] = useState({
    title: task.title,
    description: task.description,
    deadline: task.deadline || '',
    priority: task.priority as Priority,
    category: task.category as Category,
    estimated_minutes: task.estimated_minutes?.toString() || '',
    status: task.status as TaskStatus,
    notes: task.notes,
    delegated_to: task.delegated_to || '',
    delegation_note: task.delegation_note || '',
    delegation_status: task.delegation_status,
  })

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  const saveEdits = () => {
    demoStore.updateTask(task.id, {
      title: form.title,
      description: form.description,
      deadline: form.deadline || null,
      priority: form.priority,
      category: form.category,
      estimated_minutes: form.estimated_minutes ? parseInt(form.estimated_minutes) : null,
      status: form.status,
      notes: form.notes,
      delegated_to: form.delegated_to || null,
      delegation_note: form.delegation_note || null,
      delegation_status: form.delegated_to ? (form.delegation_status as any) : 'none',
    })
    setEditing(false)
    onUpdate()
    toast.success('Task updated!')
  }

  const toggleSubtask = (subtask: Subtask) => {
    const t = current()
    const updated = t.subtasks.map(s =>
      s.id === subtask.id ? { ...s, is_completed: !s.is_completed } : s
    )
    demoStore.updateTask(task.id, { subtasks: updated })
    onUpdate()
    refresh(v => v + 1)
  }

  const addSubtask = () => {
    if (!newSubtask.trim()) return
    const t = current()
    const subtask: Subtask = {
      id: generateId(),
      task_id: task.id,
      title: newSubtask.trim(),
      is_completed: false,
      order_index: t.subtasks.length,
    }
    demoStore.updateTask(task.id, { subtasks: [...t.subtasks, subtask] })
    setNewSubtask('')
    onUpdate()
    refresh(v => v + 1)
  }

  const deleteSubtask = (id: string) => {
    const t = current()
    demoStore.updateTask(task.id, { subtasks: t.subtasks.filter(s => s.id !== id) })
    onUpdate()
    refresh(v => v + 1)
  }

  const handleAISuggest = async () => {
    setSuggestingPriority(true)
    try {
      const result = await suggestPriority(
        { title: form.title, deadline: form.deadline || null, category: form.category },
        demoStore.getTasks()
      )
      setForm(f => ({ ...f, priority: result.suggested_priority }))
      demoStore.updateTask(task.id, {
        ai_suggested_priority: result.suggested_priority,
        priority: result.suggested_priority,
      })
      toast.success(`AI suggests: ${PRIORITIES[result.suggested_priority].label}\n${result.reasoning}`)
      onUpdate()
    } catch {
      toast.error('Could not get AI suggestion')
    }
    setSuggestingPriority(false)
  }

  const t = current()
  const completedSubs = t.subtasks.filter(s => s.is_completed).length

  const priorityOptions = PRIORITY_LIST.map(p => ({ value: p.value, label: `${p.emoji} ${p.label}` }))
  const categoryOptions = CATEGORY_LIST.map(c => ({ value: c.value, label: c.label }))
  const statusOptions = Object.entries(TASK_STATUSES).map(([v, info]) => ({ value: v, label: info.label }))
  const estimatedOptions = [
    { value: '', label: 'Not set' },
    { value: '15', label: '15 min' }, { value: '30', label: '30 min' },
    { value: '45', label: '45 min' }, { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' }, { value: '120', label: '2 hours' },
    { value: '180', label: '3 hours' }, { value: '240', label: '4 hours' },
  ]

  return (
    <Drawer open={true} onClose={onClose} title={editing ? 'Edit Task' : t.title} width="max-w-xl">
      <div className="space-y-5">
        {/* Action bar */}
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button variant="primary" size="sm" onClick={saveEdits}>
                <Check className="w-3.5 h-3.5" /> Save
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                <X className="w-3.5 h-3.5" /> Cancel
              </Button>
            </>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAISuggest}
            loading={suggestingPriority}
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Priority
          </Button>
        </div>

        {editing ? (
          /* Edit mode */
          <div className="space-y-4">
            <Input label="Title" value={form.title} onChange={e => update('title', e.target.value)} id="task-detail-title" />
            <Textarea label="Description" value={form.description} onChange={e => update('description', e.target.value)} rows={2} id="task-detail-desc" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Deadline" type="date" value={form.deadline} onChange={e => update('deadline', e.target.value)} id="task-detail-deadline" />
              <Select label="Estimated Time" options={estimatedOptions} value={form.estimated_minutes} onChange={e => update('estimated_minutes', e.target.value)} id="task-detail-est" />
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="label mb-0">Priority</label>
                  {t.ai_suggested_priority && t.ai_suggested_priority !== form.priority && (
                    <span className="text-xs text-amber-500">AI: {PRIORITIES[t.ai_suggested_priority]?.emoji}</span>
                  )}
                </div>
                <Select options={priorityOptions} value={form.priority} onChange={e => update('priority', e.target.value as Priority)} id="task-detail-priority" />
              </div>
              <Select label="Category" options={categoryOptions} value={form.category} onChange={e => update('category', e.target.value as Category)} id="task-detail-cat" />
              <Select label="Status" options={statusOptions} value={form.status} onChange={e => update('status', e.target.value as TaskStatus)} id="task-detail-status" />
            </div>
          </div>
        ) : (
          /* View mode */
          <div className="space-y-3">
            {/* Status + Priority row */}
            <div className="flex flex-wrap gap-2">
              <PriorityBadge priority={t.priority} />
              <CategoryBadge category={t.category} />
              <StatusBadge status={t.status} />
              {t.user_overrode_priority && t.ai_suggested_priority && (
                <span className="text-xs text-amber-500 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20">
                  ✏️ Overridden (AI: {PRIORITIES[t.ai_suggested_priority]?.emoji} {PRIORITIES[t.ai_suggested_priority]?.label})
                </span>
              )}
            </div>

            {/* Key info grid */}
            <div className="grid grid-cols-2 gap-3">
              {t.deadline && (
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 font-medium mb-0.5">Deadline</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {format(new Date(t.deadline), 'MMM d, yyyy')}
                  </p>
                  <p className="text-xs text-slate-500">{formatDeadline(t.deadline)}</p>
                </div>
              )}
              {t.estimated_minutes && (
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 font-medium mb-0.5">Estimated</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{formatMinutes(t.estimated_minutes)}</p>
                </div>
              )}
            </div>

            {/* Description */}
            {t.description && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Description</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{t.description}</p>
              </div>
            )}

            {/* Related notice */}
            {t.related_notice_title && (
              <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                <LinkIcon className="w-4 h-4 text-primary-500 shrink-0" />
                <p className="text-xs text-primary-700 dark:text-primary-300">From notice: <strong>{t.related_notice_title}</strong></p>
              </div>
            )}
          </div>
        )}

        {/* Status quick change (always visible) */}
        {!editing && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Status</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(TASK_STATUSES).map(([status, info]) => (
                <button
                  key={status}
                  onClick={() => { demoStore.updateTask(task.id, { status: status as TaskStatus }); onUpdate(); refresh(v => v + 1) }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    t.status === status
                      ? `${info.colorClass} border-current`
                      : 'border-slate-200 dark:border-slate-600 text-slate-500 hover:border-slate-400'
                  }`}
                >
                  {info.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Private Notes</p>
          {editing ? (
            <Textarea
              value={form.notes}
              onChange={e => update('notes', e.target.value)}
              rows={3}
              placeholder="Personal notes, reminders, who to ask..."
              id="task-detail-notes"
            />
          ) : (
            <div
              className="min-h-16 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 cursor-pointer"
              onClick={() => setEditing(true)}
            >
              {t.notes ? (
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{t.notes}</p>
              ) : (
                <p className="text-xs text-slate-400 italic">Click to add private notes…</p>
              )}
            </div>
          )}
        </div>

        {/* Subtasks */}
        <div>
          <button
            onClick={() => setShowSubtasks(v => !v)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 hover:text-slate-600 dark:hover:text-slate-200 transition-colors w-full"
          >
            Subtasks ({completedSubs}/{t.subtasks.length})
            {showSubtasks ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
          </button>
          {showSubtasks && (
            <div className="space-y-2">
              {t.subtasks.map(sub => (
                <div key={sub.id} className="flex items-center gap-2 group">
                  <Checkbox
                    checked={sub.is_completed}
                    onChange={() => toggleSubtask(sub)}
                  />
                  <span className={`flex-1 text-sm ${sub.is_completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {sub.title}
                  </span>
                  <button
                    onClick={() => deleteSubtask(sub.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {/* Add subtask */}
              <div className="flex gap-2 mt-2">
                <input
                  className="input flex-1 text-sm h-8"
                  placeholder="Add a subtask…"
                  value={newSubtask}
                  onChange={e => setNewSubtask(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addSubtask() }}
                  id="new-subtask-input"
                />
                <button onClick={addSubtask} className="btn btn-secondary btn-sm px-2.5">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Delegation */}
        <div className="border border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Delegation
          </p>
          {t.delegated_to ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-600">
                  {t.delegated_to.charAt(0)}
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.delegated_to}</span>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                  t.delegation_status === 'done' ? 'bg-green-100 text-green-700' :
                  t.delegation_status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {t.delegation_status?.replace('_', ' ')}
                </span>
              </div>
              {t.delegation_note && (
                <p className="text-xs text-slate-500">{t.delegation_note}</p>
              )}
              {editing && (
                <Select
                  options={[
                    { value: 'pending', label: 'Pending' },
                    { value: 'in_progress', label: 'In Progress' },
                    { value: 'done', label: 'Done' },
                  ]}
                  value={form.delegation_status}
                  onChange={e => update('delegation_status', e.target.value)}
                  id="task-delegation-status"
                />
              )}
            </div>
          ) : editing ? (
            <div className="space-y-2">
              <Input placeholder="Delegate to (person name)" value={form.delegated_to} onChange={e => update('delegated_to', e.target.value)} id="task-delegateto" />
              <Input placeholder="Note" value={form.delegation_note} onChange={e => update('delegation_note', e.target.value)} id="task-delegatenote" />
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Not delegated. Click Edit to delegate this task.</p>
          )}
        </div>

        {/* Danger zone */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              demoStore.deleteTask(task.id)
              onUpdate()
              onClose()
              toast.success('Task deleted')
            }}
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Task
          </Button>
        </div>
      </div>
    </Drawer>
  )
}
