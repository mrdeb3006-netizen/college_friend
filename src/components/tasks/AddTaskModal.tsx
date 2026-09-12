import React, { useState } from 'react'
import { Modal } from '../ui/Overlays'
import { Button, Input, Textarea, Select } from '../ui'
import { demoStore } from '../../lib/demoStore'
import { CATEGORY_LIST, PRIORITY_LIST, suggestPriorityLocally } from '../../lib/utils'
import type { Task, Priority, Category, TaskStatus } from '../../lib/types'
import { Sparkles, Info } from 'lucide-react'
import { suggestPriority } from '../../services/ai'
import toast from 'react-hot-toast'

interface AddTaskModalProps {
  open: boolean
  onClose: () => void
  onSave: (task: Task) => void
  prefilled?: Partial<Task & { related_notice_id: string; related_notice_title: string }>
}

export default function AddTaskModal({ open, onClose, onSave, prefilled }: AddTaskModalProps) {
  const [loading, setLoading] = useState(false)
  const [suggestingPriority, setSuggestingPriority] = useState(false)
  const [aiPriority, setAiPriority] = useState<{ priority: Priority; reasoning: string } | null>(null)

  const [form, setForm] = useState({
    title: prefilled?.title || '',
    description: prefilled?.description || '',
    deadline: prefilled?.deadline || '',
    priority: (prefilled?.priority || 'important_not_urgent') as Priority,
    category: (prefilled?.category || 'general') as Category,
    estimated_minutes: prefilled?.estimated_minutes?.toString() || '',
    notes: '',
    delegated_to: '',
    delegation_note: '',
    related_notice_id: prefilled?.related_notice_id || '',
    related_notice_title: prefilled?.related_notice_title || '',
  })

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  const handleAISuggestPriority = async () => {
    setSuggestingPriority(true)
    try {
      const taskData: Partial<Task> = {
        title: form.title,
        deadline: form.deadline || null,
        category: form.category,
        estimated_minutes: form.estimated_minutes ? parseInt(form.estimated_minutes) : null,
      }
      const result = await suggestPriority(taskData, demoStore.getTasks())
      setAiPriority({ priority: result.suggested_priority, reasoning: result.reasoning })
      setForm(f => ({ ...f, priority: result.suggested_priority }))
      toast.success('Priority suggested!')
    } catch {
      // Fallback to local suggestion
      const local = suggestPriorityLocally(form.deadline || null, form.category)
      setAiPriority({ priority: local, reasoning: 'Based on deadline proximity and category.' })
      setForm(f => ({ ...f, priority: local }))
    }
    setSuggestingPriority(false)
  }

  const handleSave = () => {
    if (!form.title.trim()) return
    setLoading(true)
    const task = demoStore.addTask({
      title: form.title.trim(),
      description: form.description.trim(),
      deadline: form.deadline || null,
      priority: form.priority,
      ai_suggested_priority: aiPriority?.priority || null,
      user_overrode_priority: aiPriority ? form.priority !== aiPriority.priority : false,
      category: form.category,
      estimated_minutes: form.estimated_minutes ? parseInt(form.estimated_minutes) : null,
      status: 'not_started' as TaskStatus,
      notes: form.notes.trim(),
      related_notice_id: form.related_notice_id || null,
      related_notice_title: form.related_notice_title || null,
      delegated_to: form.delegated_to.trim() || null,
      delegation_note: form.delegation_note.trim() || null,
      delegation_status: form.delegated_to ? 'pending' : 'none',
      subtasks: [],
    })
    setLoading(false)
    onSave(task)
  }

  const priorityOptions = PRIORITY_LIST.map(p => ({ value: p.value, label: `${p.emoji} ${p.label}` }))
  const categoryOptions = CATEGORY_LIST.map(c => ({ value: c.value, label: c.label }))
  const estimatedOptions = [
    { value: '', label: 'Not set' },
    { value: '15', label: '15 min' },
    { value: '30', label: '30 min' },
    { value: '45', label: '45 min' },
    { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' },
    { value: '120', label: '2 hours' },
    { value: '180', label: '3 hours' },
    { value: '240', label: '4 hours' },
  ]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={prefilled ? 'Create Task from Notice' : 'New Task'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} loading={loading} disabled={!form.title.trim()} id="task-save-btn">
            Save Task
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Related notice indicator */}
        {form.related_notice_title && (
          <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-800">
            <Info className="w-4 h-4 text-primary-500 shrink-0" />
            <p className="text-xs text-primary-700 dark:text-primary-300">
              Linked to: <strong>{form.related_notice_title}</strong>
            </p>
          </div>
        )}

        <Input
          label="Task Title *"
          placeholder="e.g. Register for coding competition"
          value={form.title}
          onChange={e => update('title', e.target.value)}
          autoFocus
          id="task-title"
        />

        <Textarea
          label="Description"
          placeholder="Add any details about this task..."
          value={form.description}
          onChange={e => update('description', e.target.value)}
          rows={2}
          id="task-description"
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Deadline"
            type="date"
            value={form.deadline}
            onChange={e => update('deadline', e.target.value)}
            id="task-deadline"
          />
          <Select
            label="Estimated Time"
            options={estimatedOptions}
            value={form.estimated_minutes}
            onChange={e => update('estimated_minutes', e.target.value)}
            id="task-estimated"
          />
          <Select
            label="Category"
            options={categoryOptions}
            value={form.category}
            onChange={e => update('category', e.target.value as Category)}
            id="task-category"
          />

          {/* Priority with AI suggestion */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="label mb-0">Priority</label>
              <button
                onClick={handleAISuggestPriority}
                disabled={suggestingPriority}
                className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline"
                id="task-suggest-priority"
              >
                <Sparkles className="w-3 h-3" />
                {suggestingPriority ? 'Analyzing…' : 'AI Suggest'}
              </button>
            </div>
            <Select
              options={priorityOptions}
              value={form.priority}
              onChange={e => update('priority', e.target.value as Priority)}
              id="task-priority"
            />
            {aiPriority && (
              <p className="text-xs text-slate-500 mt-1">
                💡 AI: {aiPriority.reasoning}
              </p>
            )}
          </div>
        </div>

        <Textarea
          label="Notes"
          placeholder="Private notes: reminders, who to ask, dependencies..."
          value={form.notes}
          onChange={e => update('notes', e.target.value)}
          rows={2}
          id="task-notes"
          hint="Notes are separate from the task description and are for your personal reference."
        />

        {/* Delegation */}
        <div className="border border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-3 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Delegation (optional)</p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Delegate to (person name)"
              value={form.delegated_to}
              onChange={e => update('delegated_to', e.target.value)}
              id="task-delegate-to"
            />
            <Input
              placeholder="Note for delegation"
              value={form.delegation_note}
              onChange={e => update('delegation_note', e.target.value)}
              id="task-delegate-note"
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}
