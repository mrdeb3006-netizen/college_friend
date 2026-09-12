// ============================================================
// TYPES — College Command Center
// ============================================================

export type Priority = 'urgent_important' | 'important_not_urgent' | 'urgent_not_important' | 'low'
export type TaskStatus = 'not_started' | 'in_progress' | 'waiting' | 'completed'
export type InboxStatus = 'unread' | 'reviewed' | 'acted'

export type Category =
  | 'academic'
  | 'competition'
  | 'hackathon'
  | 'club'
  | 'event'
  | 'workshop'
  | 'seminar'
  | 'opportunity'
  | 'general'

export interface UserProfile {
  id: string
  user_id: string
  name: string
  email?: string
  avatar_url?: string
  college?: string
  year?: string
  branch?: string
  interests: string[]
  goals: string
  theme: 'light' | 'dark' | 'system'
  onboarding_complete: boolean
  ai_preferences: {
    philosophical_mode: boolean
    philosophy_framework: string
    verbose_explanations: boolean
  }
  created_at: string
  updated_at: string
}

export interface InboxItem {
  id: string
  user_id: string
  title: string
  description: string
  source: string
  category: Category
  status: InboxStatus
  received_at: string
  event_date: string | null
  registration_deadline: string | null
  link: string | null
  attachment_url: string | null
  attachment_name: string | null
  is_important: boolean
  ai_extraction: AIExtraction | null
  created_at: string
  updated_at: string
}

export interface AIExtraction {
  title: string
  category: Category
  summary: string
  eligibility: string[]
  event_date: string | null
  registration_deadline: string | null
  required_actions: string[]
  required_documents: string[]
  registration_link: string | null
  fees: string | null
  location: string | null
  organizer: string | null
  contact_info: string | null
  important_conditions: string[]
  missing_information: string[]
  ambiguities: string[]
}

export interface Task {
  id: string
  user_id: string
  title: string
  description: string
  deadline: string | null
  priority: Priority
  ai_suggested_priority: Priority | null
  user_overrode_priority: boolean
  category: Category
  estimated_minutes: number | null
  status: TaskStatus
  notes: string
  related_notice_id: string | null
  related_notice_title: string | null
  delegated_to: string | null
  delegation_note: string | null
  delegation_status: 'none' | 'pending' | 'in_progress' | 'done'
  subtasks: Subtask[]
  created_at: string
  updated_at: string
}

export interface Subtask {
  id: string
  task_id: string
  title: string
  is_completed: boolean
  order_index: number
}

export interface CalendarEvent {
  id: string
  title: string
  date: string
  type: 'task' | 'exam' | 'assignment' | 'event' | 'deadline' | 'registration'
  category: Category
  priority?: Priority
  source_id: string
}

export interface CopilotMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  mode?: 'decision' | 'philosophical' | 'extraction' | 'planning' | 'general'
}

export interface PriorityInfo {
  value: Priority
  label: string
  emoji: string
  description: string
  colorClass: string
  dotClass: string
  badgeClass: string
  borderClass: string
}

export interface CategoryInfo {
  value: Category
  label: string
  colorClass: string
  bgColor: string
}

export interface DemoUser {
  id: string
  email: string
  profile: UserProfile
}

// AI Response types
export interface NoticeExtractionResponse {
  extraction: AIExtraction
  suggested_tasks: SuggestedTask[]
}

export interface SuggestedTask {
  title: string
  description: string
  deadline: string | null
  priority: Priority
  category: Category
  estimated_minutes: number
  reasoning: string
}

export interface PrioritySuggestionResponse {
  suggested_priority: Priority
  reasoning: string
  factors: string[]
}

export interface DailyPlanResponse {
  plan: DailyPlanItem[]
  total_minutes: number
  notes: string
}

export interface DailyPlanItem {
  task_id: string
  task_title: string
  minutes: number
  reasoning: string
  priority_order: number
}

export interface CopilotResponse {
  content: string
  mode: 'decision' | 'philosophical' | 'extraction' | 'planning' | 'general'
  structured_response?: {
    situation?: string
    practical_view?: string
    recommendation?: string
    why?: string
    philosophical_perspective?: string
  }
}
