import React, { useState } from 'react'
import { format } from 'date-fns'
import {
  Sparkles, ExternalLink, ChevronDown, ChevronUp,
  Star, CheckCircle, Trash2, Plus, X
} from 'lucide-react'
import { Drawer } from '../ui/Overlays'
import { Button } from '../ui'
import { CategoryBadge, StatusBadge } from '../ui/Badge'
import { demoStore } from '../../lib/demoStore'
import type { InboxItem, InboxStatus, SuggestedTask } from '../../lib/types'
import { extractNotice } from '../../services/ai'
import toast from 'react-hot-toast'
import AddTaskModal from '../tasks/AddTaskModal'

interface InboxItemDetailProps {
  item: InboxItem
  onClose: () => void
  onUpdate: () => void
}

export default function InboxItemDetail({ item, onClose, onUpdate }: InboxItemDetailProps) {
  const [showExtraction, setShowExtraction] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [suggestedTasks, setSuggestedTasks] = useState<SuggestedTask[]>([])
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [prefilledTask, setPrefilledTask] = useState<any>(null)
  const [, refresh] = useState(0)

  const current = demoStore.getInbox().find(i => i.id === item.id) || item

  const analyzeNotice = async () => {
    if (!current.description && !current.ai_extraction) return
    setAnalyzing(true)
    try {
      const text = current.description
      const result = await extractNotice(text)
      demoStore.updateInboxItem(item.id, { ai_extraction: result.extraction })
      setSuggestedTasks(result.suggested_tasks)
      toast.success('Notice analyzed successfully!')
      onUpdate()
    } catch {
      toast.error('Analysis failed. Please try again.')
    }
    setAnalyzing(false)
  }

  const toggleImportant = () => {
    demoStore.updateInboxItem(item.id, { is_important: !current.is_important })
    toast.success(current.is_important ? 'Removed from Important' : '⭐ Marked as Important')
    onUpdate()
    refresh(v => v + 1)
  }

  const createTaskFrom = (suggested: SuggestedTask) => {
    setPrefilledTask({
      title: suggested.title,
      description: suggested.description,
      deadline: suggested.deadline || '',
      priority: suggested.priority,
      category: suggested.category,
      estimated_minutes: suggested.estimated_minutes,
      related_notice_id: item.id,
      related_notice_title: item.title,
    })
    setShowCreateTask(true)
  }

  const extraction = current.ai_extraction

  return (
    <>
      <Drawer
        open={true}
        onClose={onClose}
        title={current.title}
        width="max-w-2xl"
      >
        <div className="space-y-5">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={current.category} />
            <StatusBadge status={current.status} />
            {current.is_important && (
              <span className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1 font-medium">
                <Star className="w-3.5 h-3.5 fill-current" /> Important
              </span>
            )}
            <span className="text-xs text-slate-400 ml-auto">{current.source}</span>
          </div>

          {/* Key dates */}
          {(current.registration_deadline || current.event_date) && (
            <div className="grid grid-cols-2 gap-3">
              {current.registration_deadline && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3">
                  <p className="text-xs text-red-500 font-medium uppercase tracking-wide">Registration Deadline</p>
                  <p className="text-sm font-bold text-red-700 dark:text-red-400 mt-0.5">
                    {format(new Date(current.registration_deadline), 'MMMM d, yyyy')}
                  </p>
                </div>
              )}
              {current.event_date && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
                  <p className="text-xs text-blue-500 font-medium uppercase tracking-wide">Event Date</p>
                  <p className="text-sm font-bold text-blue-700 dark:text-blue-400 mt-0.5">
                    {format(new Date(current.event_date), 'MMMM d, yyyy')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Link */}
          {current.link && (
            <a
              href={current.link}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              Open Registration Link
            </a>
          )}

          {/* Description */}
          {current.description && (
            <div>
              <p className="label mb-2">Description</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">
                {current.description}
              </p>
            </div>
          )}

          {/* AI Analysis section */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div
              className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
              onClick={() => setShowExtraction(v => !v)}
            >
              <Sparkles className="w-4 h-4 text-primary-500" />
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex-1">AI Notice Analysis</p>
              {!extraction && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={e => { e.stopPropagation(); analyzeNotice() }}
                  loading={analyzing}
                  id="analyze-notice-btn"
                >
                  Analyze
                </Button>
              )}
              {showExtraction ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>

            {showExtraction && extraction && (
              <div className="p-4 space-y-3">
                <ExField label="What" value={extraction.summary} />
                <ExField label="Who is eligible" value={extraction.eligibility?.join('\n') || 'Not mentioned in the notice.'} />
                <ExField label="Action required" value={extraction.required_actions?.join('\n') || 'Not mentioned in the notice.'} />
                <ExField label="Registration deadline" value={extraction.registration_deadline ? format(new Date(extraction.registration_deadline), 'MMMM d, yyyy') : 'Not mentioned in the notice.'} highlight={!!extraction.registration_deadline} />
                <ExField label="Event date" value={extraction.event_date ? format(new Date(extraction.event_date), 'MMMM d, yyyy') : 'Not mentioned in the notice.'} />
                <ExField label="Documents required" value={extraction.required_documents?.join('\n') || 'Not mentioned in the notice.'} />
                <ExField label="Fees" value={extraction.fees || 'Not mentioned in the notice.'} />
                <ExField label="Location" value={extraction.location || 'Not mentioned in the notice.'} />
                <ExField label="Organizer" value={extraction.organizer || 'Not mentioned in the notice.'} />
                <ExField label="Contact" value={extraction.contact_info || 'Not mentioned in the notice.'} />
                {extraction.important_conditions?.length > 0 && (
                  <ExField label="Important conditions" value={extraction.important_conditions.join('\n')} />
                )}
                {extraction.missing_information?.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mb-1">⚠️ Information not found in notice:</p>
                    <p className="text-xs text-amber-700 dark:text-amber-300">{extraction.missing_information.join(', ')}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Suggested Tasks */}
          {suggestedTasks.length > 0 && (
            <div>
              <p className="label mb-2">AI Suggested Tasks</p>
              <div className="space-y-2">
                {suggestedTasks.map((task, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{task.title}</p>
                      {task.deadline && (
                        <p className="text-xs text-slate-500 mt-0.5">Deadline: {format(new Date(task.deadline), 'MMM d, yyyy')}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-0.5">{task.reasoning}</p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => createTaskFrom(task)}
                    >
                      <Plus className="w-3.5 h-3.5" /> Create
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <Button
              variant="primary"
              onClick={() => {
                setPrefilledTask({
                  title: `Act on: ${current.title}`,
                  description: '',
                  deadline: current.registration_deadline || '',
                  category: current.category,
                  related_notice_id: item.id,
                  related_notice_title: item.title,
                })
                setShowCreateTask(true)
              }}
              id="inbox-create-task"
            >
              <Plus className="w-4 h-4" /> Create Task
            </Button>
            <Button
              variant={current.is_important ? 'ghost' : 'secondary'}
              onClick={toggleImportant}
              id="inbox-toggle-important"
            >
              <Star className={`w-4 h-4 ${current.is_important ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              {current.is_important ? 'Remove Star' : 'Mark Important'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => { demoStore.updateInboxItem(item.id, { status: 'acted' }); onUpdate(); onClose() }}
            >
              <CheckCircle className="w-4 h-4" /> Mark Acted
            </Button>
          </div>
        </div>
      </Drawer>

      {showCreateTask && prefilledTask && (
        <AddTaskModal
          open={showCreateTask}
          onClose={() => setShowCreateTask(false)}
          prefilled={prefilledTask}
          onSave={() => { setShowCreateTask(false); toast.success('Task created!') }}
        />
      )}
    </>
  )
}

function ExField({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-sm whitespace-pre-wrap ${highlight ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-slate-700 dark:text-slate-300'}`}>
        {value}
      </p>
    </div>
  )
}
