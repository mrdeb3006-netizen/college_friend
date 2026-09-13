import React, { useState } from 'react'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isToday, isSameDay,
  addMonths, subMonths, addWeeks, subWeeks, startOfDay
} from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from 'lucide-react'
import { demoStore } from '../lib/demoStore'
import { PRIORITIES, CATEGORIES, formatDeadline } from '../lib/utils'
import { PageLayout } from '../components/layout/Navigation'
import { Card } from '../components/ui'
import type { Task, InboxItem } from '../lib/types'

type ViewMode = 'month' | 'week' | 'upcoming'

interface CalEvent {
  id: string
  title: string
  date: Date
  type: 'task' | 'registration' | 'event'
  priority?: string
  category?: string
}

export default function CalendarPage() {
  const [view, setView] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date())

  const tasks = demoStore.getTasks().filter(t => t.deadline && t.status !== 'completed')
  const inbox = demoStore.getInbox()

  // Build events from tasks + inbox
  const events: CalEvent[] = [
    ...tasks.map(t => ({
      id: t.id,
      title: t.title,
      date: new Date(t.deadline!),
      type: 'task' as const,
      priority: t.priority,
      category: t.category,
    })),
    ...inbox.flatMap(i => {
      const evs: CalEvent[] = []
      if (i.registration_deadline) {
        evs.push({
          id: `reg_${i.id}`,
          title: `📝 Register: ${i.title}`,
          date: new Date(i.registration_deadline),
          type: 'registration',
          category: i.category,
        })
      }
      if (i.event_date) {
        evs.push({
          id: `evt_${i.id}`,
          title: `📅 ${i.title}`,
          date: new Date(i.event_date),
          type: 'event',
          category: i.category,
        })
      }
      return evs
    }),
  ]

  const eventsOnDay = (day: Date) => events.filter(e => isSameDay(e.date, day))

  const navigate = (dir: 1 | -1) => {
    if (view === 'month') setCurrentDate(dir === 1 ? addMonths(currentDate, 1) : subMonths(currentDate, 1))
    if (view === 'week') setCurrentDate(dir === 1 ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1))
  }

  // Month view days
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  // Week view days
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Upcoming (next 30 days)
  const upcoming = events
    .filter(e => e.date >= startOfDay(new Date()))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 30)

  const getEventColor = (event: CalEvent) => {
    if (event.type === 'registration') return 'bg-red-400'
    if (event.type === 'event') return 'bg-blue-400'
    if (event.priority === 'urgent_important') return 'bg-red-500'
    if (event.priority === 'important_not_urgent') return 'bg-orange-500'
    if (event.priority === 'urgent_not_important') return 'bg-yellow-500'
    return 'bg-slate-400'
  }

  const headerTitle =
    view === 'month' ? format(currentDate, 'MMMM yyyy') :
    view === 'week' ? `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}` :
    'Upcoming Events'

  return (
    <PageLayout title="Calendar">
      {/* View Toggle + Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex p-1 bg-slate-200/70 dark:bg-slate-900/80 rounded-2xl border border-slate-300/60 dark:border-slate-800 shadow-2xs w-fit">
          {(['month', 'week', 'upcoming'] as ViewMode[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize select-none cursor-pointer ${
                view === v
                  ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        {view !== 'upcoming' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-800 shadow-2xs"
              aria-label="Previous period"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 min-w-36 text-center">
              {headerTitle}
            </span>
            <button
              onClick={() => navigate(1)}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-800 shadow-2xs"
              aria-label="Next period"
            >
              <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 shadow-2xs cursor-pointer"
            >
              Today
            </button>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs font-medium">
        {[
          { color: 'bg-red-500 ring-2 ring-red-500/20',       label: 'Urgent Task' },
          { color: 'bg-orange-500 ring-2 ring-orange-500/20', label: 'Important Task' },
          { color: 'bg-red-400 ring-2 ring-red-400/20',       label: 'Registration Deadline' },
          { color: 'bg-blue-500 ring-2 ring-blue-500/20',     label: 'Event' },
          { color: 'bg-slate-400 ring-2 ring-slate-400/20',   label: 'Other' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
            <span className="text-slate-600 dark:text-slate-400">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Month View */}
      {view === 'month' && (
        <div className="card overflow-hidden shadow-card border border-slate-200/80 dark:border-slate-800">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} className="py-2.5 text-center text-xs font-bold text-slate-600 dark:text-slate-400 border-r last:border-r-0 border-slate-200/60 dark:border-slate-800">
                {d}
              </div>
            ))}
          </div>
          {/* Days */}
          <div className="grid grid-cols-7">
            {days.map((day, i) => {
              const dayEvents = eventsOnDay(day)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isCurrentDay = isToday(day)
              return (
                <div
                  key={i}
                  className={`min-h-24 p-2 border-r border-b last:border-r-0 border-slate-200/70 dark:border-slate-800/80 transition-colors ${
                    !isCurrentMonth
                      ? 'bg-slate-50/40 dark:bg-slate-950/40 text-slate-400'
                      : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/30'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                    isCurrentDay
                      ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-glow-primary'
                      : isCurrentMonth ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-600'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(evt => (
                      <div
                        key={evt.id}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-white leading-tight shadow-2xs ${getEventColor(evt)}`}
                        title={evt.title}
                      >
                        <span className="truncate">{evt.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] font-bold text-slate-400 pl-1">+{dayEvents.length - 3} more</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Week View */}
      {view === 'week' && (
        <div className="card overflow-hidden shadow-card border border-slate-200/80 dark:border-slate-800">
          <div className="grid grid-cols-7 divide-x divide-slate-200/80 dark:divide-slate-800">
            {weekDays.map(day => {
              const dayEvents = eventsOnDay(day)
              const isCurrentDay = isToday(day)
              return (
                <div key={day.toISOString()} className="flex flex-col min-h-64">
                  <div className={`py-3 text-center border-b border-slate-200/80 dark:border-slate-800 ${isCurrentDay ? 'bg-primary-50/60 dark:bg-primary-950/40' : 'bg-slate-50/40 dark:bg-slate-900/30'}`}>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{format(day, 'EEE')}</p>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mt-1 text-sm font-extrabold ${
                      isCurrentDay ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-glow-primary' : 'text-slate-800 dark:text-slate-200'
                    }`}>
                      {format(day, 'd')}
                    </div>
                  </div>
                  <div className="p-2 space-y-1.5 flex-1">
                    {dayEvents.map(evt => (
                      <div
                        key={evt.id}
                        className={`px-2 py-1.5 rounded-xl text-xs text-white leading-tight shadow-2xs ${getEventColor(evt)}`}
                        title={evt.title}
                      >
                        <p className="truncate font-semibold">{evt.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Upcoming List */}
      {view === 'upcoming' && (
        <div className="space-y-3">
          {upcoming.length === 0 ? (
            <Card>
              <div className="py-16 text-center">
                <CalIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-slate-400 font-medium">No upcoming events or deadlines recorded.</p>
              </div>
            </Card>
          ) : (
            upcoming.map(evt => (
              <div key={evt.id} className="card p-4 flex items-center gap-4 hover:shadow-card-md hover:border-primary-300 dark:hover:border-primary-700/60 transition-all">
                <div className={`w-2 h-12 rounded-full shrink-0 ${getEventColor(evt)}`} />
                <div className="w-14 text-center shrink-0 bg-slate-50 dark:bg-slate-800/80 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{format(evt.date, 'EEE')}</p>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{format(evt.date, 'd')}</p>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{format(evt.date, 'MMM')}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{evt.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {evt.type === 'registration' ? '📝 Registration Deadline' : evt.type === 'event' ? '📅 Campus Event' : '🎯 Task Deadline'}
                    {evt.category && ` · ${evt.category}`}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </PageLayout>
  )
}
