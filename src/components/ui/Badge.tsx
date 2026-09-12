import React from 'react'
import { cn } from '../../lib/utils'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md'
}

export function Badge({ children, className, size = 'sm' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        className
      )}
    >
      {children}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { label: string; emoji: string; cls: string }> = {
    urgent_important:     { label: 'Urgent', emoji: '🔴', cls: 'priority-urgent' },
    important_not_urgent: { label: 'Important', emoji: '🟠', cls: 'priority-important' },
    urgent_not_important: { label: 'Notable', emoji: '🟡', cls: 'priority-notable' },
    low:                  { label: 'Low', emoji: '⚪', cls: 'priority-low' },
  }
  const info = map[priority] || map.low
  return (
    <Badge className={info.cls}>
      {info.emoji} {info.label}
    </Badge>
  )
}

export function CategoryBadge({ category }: { category: string }) {
  const label = category.charAt(0).toUpperCase() + category.slice(1)
  return <Badge className={`category-${category}`}>{label}</Badge>
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    not_started: { label: 'Not Started', cls: 'status-not-started' },
    in_progress:  { label: 'In Progress', cls: 'status-in-progress' },
    waiting:      { label: 'Waiting',     cls: 'status-waiting' },
    completed:    { label: 'Completed',   cls: 'status-completed' },
    unread:       { label: 'Unread',      cls: 'status-not-started' },
    reviewed:     { label: 'Reviewed',    cls: 'status-in-progress' },
    acted:        { label: 'Acted',       cls: 'status-completed' },
  }
  const info = map[status] || { label: status, cls: '' }
  return <Badge className={info.cls}>{info.label}</Badge>
}
