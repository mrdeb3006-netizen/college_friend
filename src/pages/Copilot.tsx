import React, { useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import {
  Send, Bot, User, Sparkles, Trash2, ChevronDown,
  Loader2, Lightbulb, BookOpen, Clock, HelpCircle
} from 'lucide-react'
import { copilotChat } from '../services/ai'
import { demoStore } from '../lib/demoStore'
import type { CopilotMessage } from '../lib/types'
import { generateId } from '../lib/utils'
import { PageLayout } from '../components/layout/Navigation'
import { Button } from '../components/ui'
import toast from 'react-hot-toast'

const PROMPT_CHIPS = [
  { label: 'Plan my day', icon: Clock,      text: 'I have about 2 hours tonight. What should I work on?' },
  { label: 'Help me decide', icon: HelpCircle, text: 'Help me decide what to prioritize among my current tasks.' },
  { label: 'Philosophical view', icon: BookOpen, text: 'I\'m feeling overwhelmed with deadlines. Can you give me a philosophical perspective?' },
  { label: 'Today\'s priorities', icon: Sparkles, text: 'Which tasks should I focus on today and why?' },
]

function formatCopilotContent(content: string): React.ReactNode {
  // Simple markdown-like renderer for bold, headings
  return content.split('\n').map((line, i) => {
    // Bold: **text**
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j} className="font-semibold text-slate-900 dark:text-slate-100">{part.slice(2, -2)}</strong>
      }
      return part
    })

    if (line.startsWith('# ')) return <h1 key={i} className="text-base font-bold text-slate-900 dark:text-slate-100 mt-2 mb-1">{line.slice(2)}</h1>
    if (line.startsWith('## ')) return <h2 key={i} className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-2">{line.slice(3)}</h2>
    if (line.startsWith('• ') || line.startsWith('- ')) return <li key={i} className="ml-4 text-sm list-disc">{parts.slice(1)}</li>
    if (line.startsWith('> ')) return (
      <blockquote key={i} className="border-l-3 border-primary-300 pl-3 my-1 text-sm italic text-slate-600 dark:text-slate-400">
        {line.slice(2)}
      </blockquote>
    )
    if (line.trim() === '') return <div key={i} className="h-2" />
    return <p key={i} className="text-sm leading-relaxed">{parts}</p>
  })
}

export default function CopilotPage() {
  const [messages, setMessages] = useState<CopilotMessage[]>(() => demoStore.getMessages())
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text?: string) => {
    const messageText = (text || input).trim()
    if (!messageText || loading) return

    setInput('')

    const userMsg: CopilotMessage = {
      id: generateId(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    }

    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    demoStore.saveMessages(newMessages)
    setLoading(true)

    try {
      const history = newMessages.slice(-10).map(m => ({ role: m.role, content: m.content }))
      const response = await copilotChat(messageText, history.slice(0, -1))

      const aiMsg: CopilotMessage = {
        id: generateId(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        mode: response.mode,
      }

      const finalMessages = [...newMessages, aiMsg]
      setMessages(finalMessages)
      demoStore.saveMessages(finalMessages)
    } catch (err) {
      toast.error('Copilot unavailable. Please try again.')
    }
    setLoading(false)
  }

  const clearChat = () => {
    demoStore.clearMessages()
    setMessages([])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const profile = demoStore.getProfile()

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-200 dark:border-slate-700 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-sm">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">Student AI Copilot</h1>
              <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>
            <p className="text-xs text-slate-500">Autonomous context-aware student assistant</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearChat}>
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <WelcomeState name={profile.name} />
        ) : (
          messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Prompt chips */}
      {messages.length === 0 && (
        <div className="px-4 md:px-6 pb-3 flex flex-wrap gap-2 shrink-0">
          {PROMPT_CHIPS.map(chip => (
            <button
              key={chip.label}
              onClick={() => sendMessage(chip.text)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors bg-white dark:bg-slate-800"
            >
              <chip.icon className="w-3.5 h-3.5" />
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 md:px-6 pb-4 md:pb-6 pt-2 border-t border-slate-200/80 dark:border-slate-800 shrink-0">
        <div className="flex gap-3 items-end bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3 shadow-card focus-within:ring-2 focus-within:ring-primary-500/30 focus-within:border-primary-500 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about prioritizing your week, deciding on opportunities, or structuring a notice…"
            rows={1}
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 resize-none focus:outline-none max-h-32 overflow-y-auto"
            style={{ minHeight: '24px' }}
            id="copilot-input"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer ${
              input.trim() && !loading
                ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-sm hover:shadow-glow-primary hover:from-primary-500 hover:to-indigo-500 active:scale-95'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
            aria-label="Send message"
            id="copilot-send"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-[11px] text-slate-400 mt-2 font-medium">
          Student AI Copilot operates with full live awareness of your active tasks, deadlines, and captured notices.
        </p>
      </div>
    </div>
  )
}

// ============================================================
// Welcome State
// ============================================================
function WelcomeState({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
        <Bot className="w-8 h-8 text-white" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Hi {name.split(' ')[0]}! I'm your AI Copilot.</h2>
        <p className="text-slate-500 mt-1 max-w-md text-sm">
          I'm connected to your real tasks, deadlines, and captured notices. Ask me anything — from planning your hours to analyzing tough academic choices.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 w-full max-w-sm">
        {[
          '"I have 2 hours. What should I do?"',
          '"Should I participate in this hackathon?"',
          '"What are my most urgent tasks?"',
          '"Help me think through a decision."',
        ].map(example => (
          <div key={example} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400 italic text-left">
            {example}
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// Message Bubble
// ============================================================
function MessageBubble({ message }: { message: CopilotMessage }) {
  const isUser = message.role === 'user'
  const userAvatar = demoStore.getProfile().avatar_url

  const modeLabel: Record<string, string> = {
    decision: '🧭 Decision Analysis',
    philosophical: '🪷 Philosophical Perspective',
    extraction: '📋 Notice Analysis',
    planning: '📋 Day Plan',
    general: '',
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {isUser && userAvatar ? (
        <img
          src={userAvatar}
          alt="Avatar"
          className="w-7 h-7 rounded-full object-cover border border-primary-200 dark:border-primary-800 shrink-0 mt-0.5"
        />
      ) : (
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5 ${
          isUser ? 'bg-primary-500' : 'bg-gradient-to-br from-primary-500 to-purple-600'
        }`}>
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>
      )}

      <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'} max-w-[85%]`}>
        {/* Mode label */}
        {!isUser && message.mode && modeLabel[message.mode] && (
          <span className="text-xs text-primary-500 font-medium px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 rounded-full">
            {modeLabel[message.mode]}
          </span>
        )}

        {/* Bubble */}
        <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}>
          {isUser ? (
            <p className="text-sm">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 space-y-1">
              {formatCopilotContent(message.content)}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-xs text-slate-400 px-1">
          {format(new Date(message.timestamp), 'HH:mm')}
        </span>
      </div>
    </div>
  )
}

// ============================================================
// Typing Indicator
// ============================================================
function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="chat-bubble-ai px-4 py-3 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}
