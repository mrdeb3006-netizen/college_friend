import React from 'react'
import { cn } from '../../lib/utils'

// ============================================================
// Button
// ============================================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
}

export function Button({
  children,
  variant = 'secondary',
  size = 'md',
  loading = false,
  icon,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
    outline: 'btn border border-slate-200 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80',
  }[variant]

  const sizeClass = { sm: 'btn-sm', md: '', lg: 'btn-lg' }[size]

  return (
    <button
      className={cn('btn cursor-pointer', variantClass, sizeClass, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  )
}

// ============================================================
// Input
// ============================================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
}

export function Input({ label, error, hint, icon, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label htmlFor={inputId} className="label">{label}</label>}
      <div className="relative w-full">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            'input shadow-2xs',
            icon && 'pl-10',
            error && 'border-red-400 focus:ring-red-500/30 focus:border-red-500',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      {hint && !error && <p className="text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  )
}

// ============================================================
// Textarea
// ============================================================
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export function Textarea({ label, error, hint, className, id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label htmlFor={inputId} className="label">{label}</label>}
      <textarea
        id={inputId}
        className={cn(
          'textarea shadow-2xs',
          error && 'border-red-400 focus:ring-red-500/30 focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      {hint && !error && <p className="text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  )
}

// ============================================================
// Select
// ============================================================
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: { value: string; label: string }[]
}

export function Select({ label, error, hint, options, className, id, ...props }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label htmlFor={inputId} className="label">{label}</label>}
      <div className="relative w-full">
        <select
          id={inputId}
          className={cn(
            'select shadow-2xs',
            error && 'border-red-400 focus:ring-red-500/30',
            className
          )}
          {...props}
        >
          {options.map(o => (
            <option key={o.value} value={o.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
              {o.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
          ▼
        </span>
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      {hint && !error && <p className="text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  )
}

// ============================================================
// Checkbox
// ============================================================
interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  className?: string
}

export function Checkbox({ checked, onChange, label, className }: CheckboxProps) {
  return (
    <label className={cn('flex items-center gap-2.5 cursor-pointer select-none', className)}>
      <div
        onClick={() => onChange(!checked)}
        className={cn(
          'w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all',
          checked
            ? 'bg-primary-600 border-primary-600 shadow-glow-primary scale-105'
            : 'border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 hover:border-primary-400'
        )}
      >
        {checked && (
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 12 12">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      {label && <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>}
    </label>
  )
}

// ============================================================
// Card
// ============================================================
interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hoverable?: boolean
  padding?: boolean
}

export function Card({ children, className, onClick, hoverable, padding = true }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        hoverable ? 'card-hover' : 'card',
        padding && 'p-5',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}

// ============================================================
// Skeleton Loader
// ============================================================
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />
}

// ============================================================
// Divider
// ============================================================
export function Divider({ className }: { className?: string }) {
  return <hr className={cn('border-slate-200/80 dark:border-slate-800', className)} />
}

// ============================================================
// Empty State
// ============================================================
interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/10 to-purple-500/10 border border-primary-200/50 dark:border-primary-800/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-3xl shadow-xs">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <p className="text-base font-bold text-slate-800 dark:text-slate-200">{title}</p>
        {description && <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

// ============================================================
// Toggle Switch
// ============================================================
interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors duration-200 border border-transparent',
          checked
            ? 'bg-primary-600 shadow-glow-primary'
            : 'bg-slate-300 dark:bg-slate-700'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ease-out',
            checked ? 'translate-x-5.5' : 'translate-x-0.5'
          )}
        />
      </div>
      {label && <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</span>}
    </label>
  )
}
