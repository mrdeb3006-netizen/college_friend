// ============================================================
// Local Store — College Command Center
// Uses localStorage for state persistence
// Clean, real-ready initial state
// ============================================================
import type { InboxItem, Task, UserProfile, CopilotMessage } from './types'
import { generateId } from './utils'

const IS_DEMO = !import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co'

export { IS_DEMO }

const USER_ID = 'user_debendranath_001'

// ============================================================
// Profile: Debendranath Bera
// ============================================================
const DEFAULT_PROFILE: UserProfile = {
  id: 'profile_001',
  user_id: USER_ID,
  name: 'Debendranath Bera',
  email: 'mrdeb3006@gmail.com',
  avatar_url: 'https://avatars.githubusercontent.com/u/279176333?v=4',
  interests: ['Full-Stack Development', 'AI & Machine Learning', 'Competitive Programming', 'Open Source'],
  goals: 'Master modern engineering, stay ahead of deadlines, and build impactful software applications.',
  theme: 'system',
  onboarding_complete: true,
  ai_preferences: {
    philosophical_mode: false,
    philosophy_framework: 'bhagavad_gita',
    verbose_explanations: true,
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

// Clean initial data — no fake/demo placeholder clutter
const INITIAL_INBOX: InboxItem[] = []
const INITIAL_TASKS: Task[] = []

// Migration & cleanup key to clear any legacy demo material from browser storage
const STORE_VERSION_KEY = 'ccc_clean_version'
const CURRENT_VERSION = 'v5_pure_clean_zero_demo_samples'

if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const version = localStorage.getItem(STORE_VERSION_KEY)
    if (version !== CURRENT_VERSION) {
      const storedProfile = localStorage.getItem('ccc_profile')
      if (!storedProfile || storedProfile.includes('Arjun Sharma')) {
        localStorage.setItem('ccc_profile', JSON.stringify(DEFAULT_PROFILE))
      } else {
        try {
          const parsed = JSON.parse(storedProfile)
          parsed.name = 'Debendranath Bera'
          parsed.email = 'mrdeb3006@gmail.com'
          parsed.avatar_url = 'https://avatars.githubusercontent.com/u/279176333?v=4'
          delete parsed.college
          delete parsed.year
          delete parsed.branch
          localStorage.setItem('ccc_profile', JSON.stringify(parsed))
        } catch {
          // ignore
        }
      }
      // Ensure completely empty clean store with zero demo or sample clutter
      localStorage.setItem('ccc_inbox', JSON.stringify([]))
      localStorage.setItem('ccc_tasks', JSON.stringify([]))
      localStorage.setItem('ccc_messages', JSON.stringify([]))
      localStorage.setItem(STORE_VERSION_KEY, CURRENT_VERSION)
    }
  } catch (err) {
    console.error('Storage version migration failed', err)
  }
}

// ============================================================
// localStorage helpers
// ============================================================
function getStored<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return fallback
    return JSON.parse(stored) as T
  } catch {
    return fallback
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    console.warn('localStorage write failed')
  }
}

// ============================================================
// Data Store
// ============================================================
export const demoStore = {
  // Profile
  getProfile(): UserProfile {
    const p = getStored('ccc_profile', DEFAULT_PROFILE)
    if (p.name === 'Arjun Sharma' || !p.avatar_url) {
      const updated: UserProfile = {
        ...p,
        name: 'Debendranath Bera',
        email: p.email || 'mrdeb3006@gmail.com',
        avatar_url: 'https://avatars.githubusercontent.com/u/279176333?v=4',
      }
      this.saveProfile(updated)
      return updated
    }
    return p
  },

  saveProfile(p: Partial<UserProfile>): UserProfile {
    const current = this.getProfile()
    const updated = { ...current, ...p, updated_at: new Date().toISOString() }
    setStored('ccc_profile', updated)
    return updated
  },

  // Inbox
  getInbox(): InboxItem[] {
    return getStored('ccc_inbox', INITIAL_INBOX)
  },

  saveInbox(items: InboxItem[]): void {
    setStored('ccc_inbox', items)
  },

  addInboxItem(item: Omit<InboxItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>): InboxItem {
    const newItem: InboxItem = {
      ...item,
      id: generateId(),
      user_id: USER_ID,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const items = this.getInbox()
    items.unshift(newItem)
    this.saveInbox(items)
    return newItem
  },

  updateInboxItem(id: string, updates: Partial<InboxItem>): void {
    const items = this.getInbox()
    const idx = items.findIndex(i => i.id === id)
    if (idx >= 0) {
      items[idx] = { ...items[idx], ...updates, updated_at: new Date().toISOString() }
      this.saveInbox(items)
    }
  },

  deleteInboxItem(id: string): void {
    const items = this.getInbox().filter(i => i.id !== id)
    this.saveInbox(items)
  },

  // Tasks
  getTasks(): Task[] {
    return getStored('ccc_tasks', INITIAL_TASKS)
  },

  saveTasks(tasks: Task[]): void {
    setStored('ccc_tasks', tasks)
  },

  addTask(task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Task {
    const newTask: Task = {
      ...task,
      id: generateId(),
      user_id: USER_ID,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const tasks = this.getTasks()
    tasks.unshift(newTask)
    this.saveTasks(tasks)
    return newTask
  },

  updateTask(id: string, updates: Partial<Task>): void {
    const tasks = this.getTasks()
    const idx = tasks.findIndex(t => t.id === id)
    if (idx >= 0) {
      tasks[idx] = { ...tasks[idx], ...updates, updated_at: new Date().toISOString() }
      this.saveTasks(tasks)
    }
  },

  deleteTask(id: string): void {
    const tasks = this.getTasks().filter(t => t.id !== id)
    this.saveTasks(tasks)
  },

  // Copilot messages
  getMessages(): CopilotMessage[] {
    return getStored('ccc_messages', [])
  },

  saveMessages(msgs: CopilotMessage[]): void {
    setStored('ccc_messages', msgs)
  },

  addMessage(msg: Omit<CopilotMessage, 'id' | 'timestamp'>): CopilotMessage {
    const newMsg: CopilotMessage = {
      ...msg,
      id: generateId(),
      timestamp: new Date().toISOString(),
    }
    const msgs = this.getMessages()
    msgs.push(newMsg)
    this.saveMessages(msgs)
    return newMsg
  },

  clearMessages(): void {
    setStored('ccc_messages', [])
  },

  // Reset all to clean
  clearAllData(): void {
    setStored('ccc_inbox', [])
    setStored('ccc_tasks', [])
    setStored('ccc_messages', [])
  },

  // Onboarding
  isOnboardingComplete(): boolean {
    return this.getProfile().onboarding_complete
  },

  completeOnboarding(profileData: Partial<UserProfile>): void {
    this.saveProfile({ ...profileData, onboarding_complete: true })
  },
}
