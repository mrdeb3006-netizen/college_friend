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
  college: 'College of Engineering',
  year: '3rd Year',
  branch: 'Computer Science & Engineering',
  interests: ['Full-Stack Development', 'AI & Machine Learning', 'Competitive Programming', 'Open Source'],
  goals: 'Excel in academics, master modern engineering, and build impactful software applications.',
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
const CURRENT_VERSION = 'v2_clean_debendranath_bera'

if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const version = localStorage.getItem(STORE_VERSION_KEY)
    if (version !== CURRENT_VERSION) {
      const storedProfile = localStorage.getItem('ccc_profile')
      if (!storedProfile || storedProfile.includes('Arjun Sharma')) {
        localStorage.setItem('ccc_profile', JSON.stringify(DEFAULT_PROFILE))
        localStorage.setItem('ccc_inbox', JSON.stringify(INITIAL_INBOX))
        localStorage.setItem('ccc_tasks', JSON.stringify(INITIAL_TASKS))
        localStorage.setItem('ccc_messages', JSON.stringify([]))
      } else {
        // Upgrade existing profile with real name and avatar
        try {
          const parsed = JSON.parse(storedProfile)
          if (parsed.name === 'Arjun Sharma' || !parsed.avatar_url) {
            parsed.name = 'Debendranath Bera'
            parsed.email = 'mrdeb3006@gmail.com'
            parsed.avatar_url = 'https://avatars.githubusercontent.com/u/279176333?v=4'
            localStorage.setItem('ccc_profile', JSON.stringify(parsed))
          }
        } catch {
          // ignore
        }
      }
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

// Helper to generate upcoming relative date
const addDays = (d: number) => {
  const date = new Date()
  date.setDate(date.getDate() + d)
  return date.toISOString().split('T')[0]
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

  // Optional starter pack if user wishes to load realistic test items
  loadSampleData(): void {
    const sampleInbox: InboxItem[] = [
      {
        id: generateId(),
        user_id: USER_ID,
        title: 'National Hackathon — Smart India Hackathon',
        description: 'Call for student teams to submit ideas for Smart India Hackathon. Registration portal is open.',
        source: 'College Notice Board',
        category: 'hackathon',
        status: 'unread',
        received_at: new Date().toISOString(),
        event_date: addDays(25),
        registration_deadline: addDays(10),
        link: 'https://sih.gov.in',
        attachment_url: null,
        attachment_name: null,
        is_important: true,
        ai_extraction: {
          title: 'Smart India Hackathon Registration',
          category: 'hackathon',
          summary: 'National level hackathon for college teams solving real world problems.',
          eligibility: ['Undergraduate students in engineering/technology'],
          event_date: addDays(25),
          registration_deadline: addDays(10),
          required_actions: ['Form a team of 6 members', 'Submit problem statement solution PPT by deadline'],
          required_documents: ['College ID card', 'Team registration form'],
          registration_link: 'https://sih.gov.in',
          fees: 'Free',
          location: 'Hybrid / Designated Nodal Centers',
          organizer: 'Ministry of Education Innovation Cell',
          contact_info: 'support@sih.gov.in',
          important_conditions: ['Must have at least one female team member'],
          missing_information: [],
          ambiguities: [],
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]

    const sampleTasks: Task[] = [
      {
        id: generateId(),
        user_id: USER_ID,
        title: 'Complete Algorithm Lab Assignment',
        description: 'Implement Graph algorithms (Dijkstra and Kruskal) with time complexity analysis.',
        deadline: addDays(3),
        priority: 'urgent_important',
        ai_suggested_priority: 'urgent_important',
        user_overrode_priority: false,
        category: 'academic',
        estimated_minutes: 90,
        status: 'in_progress',
        notes: 'Review code comments and test corner cases before submission.',
        related_notice_id: null,
        related_notice_title: null,
        delegated_to: null,
        delegation_note: null,
        delegation_status: 'none',
        subtasks: [
          { id: generateId(), task_id: 'sample_t1', title: 'Implement Dijkstra in C++', is_completed: true, order_index: 0 },
          { id: generateId(), task_id: 'sample_t1', title: 'Implement Kruskal with Disjoint Set', is_completed: false, order_index: 1 },
          { id: generateId(), task_id: 'sample_t1', title: 'Write lab report and complexity charts', is_completed: false, order_index: 2 },
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]

    setStored('ccc_inbox', sampleInbox)
    setStored('ccc_tasks', sampleTasks)
  },

  // Onboarding
  isOnboardingComplete(): boolean {
    return this.getProfile().onboarding_complete
  },

  completeOnboarding(profileData: Partial<UserProfile>): void {
    this.saveProfile({ ...profileData, onboarding_complete: true })
  },
}
