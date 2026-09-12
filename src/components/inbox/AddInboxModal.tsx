import React, { useState, useRef } from 'react'
import { Modal } from '../ui/Overlays'
import { Button, Input, Textarea, Select } from '../ui'
import { demoStore } from '../../lib/demoStore'
import { CATEGORY_LIST } from '../../lib/utils'
import type { InboxItem, Category } from '../../lib/types'
import { extractNotice } from '../../services/ai'
import { Sparkles, Upload, Link, FileText, AlignLeft, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'

interface AddInboxModalProps {
  open: boolean
  onClose: () => void
  onSave: (item: InboxItem) => void
}

type InputMode = 'text' | 'link' | 'manual'

export default function AddInboxModal({ open, onClose, onSave }: AddInboxModalProps) {
  const [mode, setMode] = useState<InputMode>('text')
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [extraction, setExtraction] = useState<any>(null)
  const [showFullExtraction, setShowFullExtraction] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    source: '',
    category: 'general' as Category,
    link: '',
    event_date: '',
    registration_deadline: '',
    rawText: '',
  })

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  const handleExtractAI = async () => {
    if (!form.rawText.trim()) return
    setExtracting(true)
    try {
      const result = await extractNotice(form.rawText)
      setExtraction(result.extraction)
      // Auto-fill form from extraction
      setForm(f => ({
        ...f,
        title: result.extraction.title || f.title,
        description: result.extraction.summary || f.description,
        category: result.extraction.category as Category,
        link: result.extraction.registration_link || f.link,
        event_date: result.extraction.event_date || f.event_date,
        registration_deadline: result.extraction.registration_deadline || f.registration_deadline,
      }))
    } catch (err) {
      console.error('AI extraction failed:', err)
    }
    setExtracting(false)
  }

  const handleSave = () => {
    if (!form.title.trim()) return
    setLoading(true)
    const newItem = demoStore.addInboxItem({
      title: form.title.trim(),
      description: form.description.trim() || form.rawText.trim(),
      source: form.source.trim() || 'Manual entry',
      category: form.category,
      status: 'unread',
      received_at: new Date().toISOString(),
      event_date: form.event_date || null,
      registration_deadline: form.registration_deadline || null,
      link: form.link || null,
      attachment_url: null,
      attachment_name: null,
      is_important: false,
      ai_extraction: extraction || null,
    })
    setLoading(false)
    // Reset
    setForm({ title: '', description: '', source: '', category: 'general', link: '', event_date: '', registration_deadline: '', rawText: '' })
    setExtraction(null)
    setMode('text')
    onSave(newItem)
  }

  const categoryOptions = [
    { value: '', label: 'Select category...' },
    ...CATEGORY_LIST.map(c => ({ value: c.value, label: c.label })),
  ]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add to College Inbox"
      description="Capture any college-related information here."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} loading={loading} disabled={!form.title.trim()}>
            Save to Inbox
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Mode selector */}
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
          {([
            { id: 'text',   icon: AlignLeft, label: 'Paste Text' },
            { id: 'link',   icon: Link,      label: 'Add Link' },
            { id: 'manual', icon: FileText,  label: 'Manual' },
          ] as const).map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                mode === m.id
                  ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <m.icon className="w-3.5 h-3.5" />
              {m.label}
            </button>
          ))}
        </div>

        {/* Paste Text mode */}
        {mode === 'text' && (
          <div className="space-y-3">
            <Textarea
              label="Paste notice/message text"
              placeholder="Paste the WhatsApp message, email, or notice text here..."
              value={form.rawText}
              onChange={e => update('rawText', e.target.value)}
              rows={5}
              id="inbox-raw-text"
            />
            <Button
              variant="primary"
              onClick={handleExtractAI}
              loading={extracting}
              disabled={!form.rawText.trim()}
              className="w-full"
              id="inbox-extract-ai"
            >
              <Sparkles className="w-4 h-4" />
              {extracting ? 'Analyzing with AI…' : 'Extract with AI'}
            </Button>

            {/* AI Extraction Result */}
            {extraction && (
              <div className="border border-primary-200 dark:border-primary-800 rounded-xl overflow-hidden">
                <div className="bg-primary-50 dark:bg-primary-900/20 px-4 py-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary-500" />
                  <p className="text-sm font-semibold text-primary-700 dark:text-primary-300">AI Notice Summary</p>
                  <button
                    onClick={() => setShowFullExtraction(v => !v)}
                    className="ml-auto text-primary-500"
                  >
                    {showFullExtraction ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
                <div className="p-4 space-y-2.5 text-sm">
                  <ExtractionRow label="What" value={extraction.summary} />
                  <ExtractionRow label="Who" value={extraction.eligibility?.join(', ') || 'Not mentioned in the notice.'} />
                  <ExtractionRow label="Deadline" value={extraction.registration_deadline ? format(new Date(extraction.registration_deadline), 'MMMM d, yyyy') : 'Not mentioned in the notice.'} highlight={!!extraction.registration_deadline} />
                  <ExtractionRow label="Event date" value={extraction.event_date ? format(new Date(extraction.event_date), 'MMMM d, yyyy') : 'Not mentioned in the notice.'} />
                  <ExtractionRow label="Action required" value={extraction.required_actions?.join(' · ') || 'Not mentioned in the notice.'} />

                  {showFullExtraction && (
                    <>
                      <ExtractionRow label="Documents" value={extraction.required_documents?.join(', ') || 'Not mentioned in the notice.'} />
                      <ExtractionRow label="Fees" value={extraction.fees || 'Not mentioned in the notice.'} />
                      <ExtractionRow label="Location" value={extraction.location || 'Not mentioned in the notice.'} />
                      <ExtractionRow label="Contact" value={extraction.contact_info || 'Not mentioned in the notice.'} />
                      {extraction.important_conditions?.length > 0 && (
                        <ExtractionRow label="Conditions" value={extraction.important_conditions.join(' · ')} />
                      )}
                      {extraction.missing_information?.length > 0 && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2.5">
                          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">⚠️ Missing info: {extraction.missing_information.join(', ')}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Link mode */}
        {mode === 'link' && (
          <div className="space-y-3">
            <Input
              label="URL or Link"
              type="url"
              placeholder="https://..."
              value={form.link}
              onChange={e => update('link', e.target.value)}
              id="inbox-link"
            />
          </div>
        )}

        {/* Common fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
          <Input
            label="Title *"
            placeholder="Name this notice"
            value={form.title}
            onChange={e => update('title', e.target.value)}
            id="inbox-title"
          />
          <Select
            label="Category"
            options={categoryOptions}
            value={form.category}
            onChange={e => update('category', e.target.value as Category)}
            id="inbox-category"
          />
          <Input
            label="Source"
            placeholder="WhatsApp / Email / Portal…"
            value={form.source}
            onChange={e => update('source', e.target.value)}
            id="inbox-source"
          />
          {mode !== 'text' && (
            <Input
              label="Link (optional)"
              type="url"
              placeholder="https://..."
              value={form.link}
              onChange={e => update('link', e.target.value)}
              id="inbox-link-field"
            />
          )}
          <Input
            label="Registration Deadline"
            type="date"
            value={form.registration_deadline}
            onChange={e => update('registration_deadline', e.target.value)}
            id="inbox-reg-deadline"
          />
          <Input
            label="Event Date"
            type="date"
            value={form.event_date}
            onChange={e => update('event_date', e.target.value)}
            id="inbox-event-date"
          />
        </div>

        {mode !== 'text' && (
          <Textarea
            label="Description"
            placeholder="Add any additional details…"
            value={form.description}
            onChange={e => update('description', e.target.value)}
            rows={3}
            id="inbox-description"
          />
        )}
      </div>
    </Modal>
  )
}

function ExtractionRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex gap-2">
      <span className="text-xs font-semibold text-slate-500 w-24 shrink-0">{label}:</span>
      <span className={`text-xs ${highlight ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-slate-700 dark:text-slate-300'}`}>
        {value}
      </span>
    </div>
  )
}
