import React from 'react'
import { cn } from '../../lib/utils'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md'
  icon?: React.ReactNode
}

export function Badge({ children, className, size = 'sm', icon }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold rounded-full tracking-wide transition-all select-none shadow-2xs',
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs',
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { label: string; dotClass: string; cls: string; pulse?: boolean }> = {
    urgent_important: {
      label: 'Urgent',
      dotClass: 'bg-red-500 ring-4 ring-red-500/25',
      cls: 'priority-urgent shadow-xs',
      pulse: true,
    },
    important_not_urgent: {
      label: 'Important',
      dotClass: 'bg-amber-500 ring-4 ring-amber-500/25',
      cls: 'priority-important shadow-xs',
    },
    urgent_not_important: {
      label: 'Notable',
      dotClass: 'bg-sky-500 ring-4 ring-sky-500/25',
      cls: 'priority-notable shadow-xs',
    },
    low: {
      label: 'Low',
      dotClass: 'bg-slate-400 ring-4 ring-slate-400/20',
      cls: 'priority-low shadow-xs',
    },
  }
  const info = map[priority] || map.low
  return (
    <Badge className={info.cls}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', info.dotClass, info.pulse && 'animate-pulse')} />
      {info.label}
    </Badge>
  )
}

export function CategoryBadge({ category }: { category: string }) {
  const label = category.charAt(0).toUpperCase() + category.slice(1)
  return (
    <Badge className={`category-${category} shadow-2xs`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0" />
      {label}
    </Badge>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; dotClass: string; cls: string }> = {
    not_started: { label: 'Not Started', dotClass: 'bg-slate-400',    cls: 'status-not-started' },
    in_progress: { label: 'In Progress', dotClass: 'bg-blue-500',     cls: 'status-in-progress' },
    waiting:     { label: 'Waiting',     dotClass: 'bg-amber-500',    cls: 'status-waiting' },
    completed:   { label: 'Completed',   dotClass: 'bg-emerald-500',  cls: 'status-completed' },
    unread:      { label: 'Unread',      dotClass: 'bg-slate-400',    cls: 'status-not-started' },
    reviewed:    { label: 'Reviewed',    dotClass: 'bg-blue-500',     cls: 'status-in-progress' },
    acted:       { label: 'Acted',       dotClass: 'bg-emerald-500',  cls: 'status-completed' },
  }
  const info = map[status] || { label: status, dotClass: 'bg-slate-400', cls: '' }
  return (
    <Badge className={info.cls}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', info.dotClass)} />
      {info.label}
    </Badge>
  )
}
