import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isToday, isTomorrow, isPast, differenceInDays } from 'date-fns'
import type { Priority, Category, TaskStatus, PriorityInfo, CategoryInfo } from './types'

// ============================================================
// Class Merging Utility
// ============================================================
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================================
// Priority System
// ============================================================
export const PRIORITIES: Record<Priority, PriorityInfo> = {
  urgent_important: {
    value: 'urgent_important',
    label: 'Urgent + Important',
    emoji: '🔴',
    description: 'Do now — immediate attention required',
    colorClass: 'text-red-600 dark:text-red-400',
    dotClass: 'priority-dot-urgent',
    badgeClass: 'priority-urgent',
    borderClass: 'border-l-4 border-red-500',
  },
  important_not_urgent: {
    value: 'important_not_urgent',
    label: 'Important, Not Urgent',
    emoji: '🟠',
    description: 'Schedule — plan time for this',
    colorClass: 'text-orange-600 dark:text-orange-400',
    dotClass: 'priority-dot-important',
    badgeClass: 'priority-important',
    borderClass: 'border-l-4 border-orange-500',
  },
  urgent_not_important: {
    value: 'urgent_not_important',
    label: 'Urgent, Not Important',
    emoji: '🟡',
    description: 'Handle quickly or delegate',
    colorClass: 'text-yellow-600 dark:text-yellow-400',
    dotClass: 'priority-dot-notable',
    badgeClass: 'priority-notable',
    borderClass: 'border-l-4 border-yellow-500',
  },
  low: {
    value: 'low',
    label: 'Low Priority',
    emoji: '⚪',
    description: 'Optional — do when time allows',
    colorClass: 'text-slate-500 dark:text-slate-400',
    dotClass: 'priority-dot-low',
    badgeClass: 'priority-low',
    borderClass: 'border-l-4 border-slate-300',
  },
}

// ============================================================
// Category System
// ============================================================
export const CATEGORIES: Record<Category, CategoryInfo> = {
  academic:    { value: 'academic',    label: 'Academic',     colorClass: 'category-academic',    bgColor: '#6366f1' },
  competition: { value: 'competition', label: 'Competition',  colorClass: 'category-competition', bgColor: '#f97316' },
  hackathon:   { value: 'hackathon',   label: 'Hackathon',    colorClass: 'category-hackathon',   bgColor: '#a855f7' },
  club:        { value: 'club',        label: 'Club',         colorClass: 'category-club',        bgColor: '#22c55e' },
  event:       { value: 'event',       label: 'Event',        colorClass: 'category-event',       bgColor: '#06b6d4' },
  workshop:    { value: 'workshop',    label: 'Workshop',     colorClass: 'category-workshop',    bgColor: '#ec4899' },
  seminar:     { value: 'seminar',     label: 'Seminar',      colorClass: 'category-seminar',     bgColor: '#14b8a6' },
  opportunity: { value: 'opportunity', label: 'Opportunity',  colorClass: 'category-opportunity', bgColor: '#f59e0b' },
  general:     { value: 'general',     label: 'General',      colorClass: 'category-general',     bgColor: '#6b7280' },
}

export const CATEGORY_LIST = Object.values(CATEGORIES)
export const PRIORITY_LIST = Object.values(PRIORITIES)

// ============================================================
// Task Status
// ============================================================
export const TASK_STATUSES: Record<string, { label: string; colorClass: string }> = {
  not_started: { label: 'Not Started', colorClass: 'status-not-started' },
  in_progress:  { label: 'In Progress', colorClass: 'status-in-progress' },
  waiting:      { label: 'Waiting',     colorClass: 'status-waiting' },
  completed:    { label: 'Completed',   colorClass: 'status-completed' },
}

// ============================================================
// Date Utilities
// ============================================================
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'No date'
  const d = new Date(dateStr)
  if (isToday(d)) return 'Today'
  if (isTomorrow(d)) return 'Tomorrow'
  return format(d, 'MMM d, yyyy')
}

export function formatDeadline(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isPast(d)) return `Overdue (${format(d, 'MMM d')})`
  if (isToday(d)) return 'Due today'
  if (isTomorrow(d)) return 'Due tomorrow'
  const days = differenceInDays(d, new Date())
  if (days <= 7) return `Due in ${days} day${days !== 1 ? 's' : ''}`
  return `Due ${format(d, 'MMM d')}`
}

export function formatRelative(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
}

export function isDeadlineClose(dateStr: string | null, days = 3): boolean {
  if (!dateStr) return false
  const d = new Date(dateStr)
  return differenceInDays(d, new Date()) <= days
}

export function isDeadlineOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false
  return isPast(new Date(dateStr))
}

// ============================================================
// ID Generation
// ============================================================
export function generateId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

// ============================================================
// Priority Suggestion (local, without AI)
// ============================================================
export function suggestPriorityLocally(
  deadline: string | null,
  category: Category,
): Priority {
  if (!deadline) return 'low'
  const days = differenceInDays(new Date(deadline), new Date())
  const isAcademic = category === 'academic'
  const isTimeConstrained = ['competition', 'hackathon', 'opportunity'].includes(category)

  if (days <= 1) return 'urgent_important'
  if (days <= 3 && (isAcademic || isTimeConstrained)) return 'urgent_important'
  if (days <= 7 && isAcademic) return 'important_not_urgent'
  if (days <= 3) return 'urgent_not_important'
  if (isAcademic || isTimeConstrained) return 'important_not_urgent'
  return 'low'
}

// ============================================================
// Truncate
// ============================================================
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max) + '…'
}

// ============================================================
// Format estimated time
// ============================================================
export function formatMinutes(minutes: number | null): string {
  if (!minutes) return ''
  if (minutes < 60) return `~${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `~${h}h ${m}m` : `~${h}h`
}
