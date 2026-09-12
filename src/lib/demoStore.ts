// ============================================================
// Demo / Local Store
// Uses localStorage for persistence when Supabase is not configured
// Provides realistic demo data for immediate use
// ============================================================
import type { InboxItem, Task, UserProfile, CopilotMessage, Subtask } from './types'
import { generateId } from './utils'

const IS_DEMO = !import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co'

export { IS_DEMO }

const DEMO_USER_ID = 'demo_user_001'

// ============================================================
// Initial demo data
// ============================================================
const DEMO_PROFILE: UserProfile = {
  id: 'profile_001',
  user_id: DEMO_USER_ID,
  name: 'Arjun Sharma',
  college: 'BITS Pilani',
  year: '2nd Year',
  branch: 'Computer Science',
  interests: ['Machine Learning', 'Competitive Programming', 'Open Source'],
  goals: 'Get a software engineering internship and build meaningful projects.',
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

const today = new Date()
const addDays = (d: number) => {
  const date = new Date(today)
  date.setDate(today.getDate() + d)
  return date.toISOString().split('T')[0]
}

const DEMO_INBOX: InboxItem[] = [
  {
    id: 'inbox_001',
    user_id: DEMO_USER_ID,
    title: 'Inter-College Coding Competition — CodeStorm 2026',
    description: `Dear Students,

We are pleased to announce the annual Inter-College Coding Competition "CodeStorm 2026" organized by the Department of Computer Science.

ELIGIBILITY: Students from 1st and 2nd year (all branches) are eligible to participate.

IMPORTANT DATES:
- Registration Deadline: ${addDays(5)}
- Team Details Submission: ${addDays(7)}
- Event Date: ${addDays(12)}

PARTICIPATION:
- Team size: 2-3 members
- Each team must submit a brief problem statement they wish to solve.
- Registration fee: ₹100 per team

For registration, visit: https://codestorm.college.edu/register

For queries, contact: cs.events@college.edu`,
    source: 'College Portal',
    category: 'competition',
    status: 'unread',
    received_at: new Date().toISOString(),
    event_date: addDays(12),
    registration_deadline: addDays(5),
    link: 'https://codestorm.college.edu/register',
    attachment_url: null,
    attachment_name: null,
    is_important: true,
    ai_extraction: {
      title: 'CodeStorm 2026 — Inter-College Coding Competition',
      category: 'competition',
      summary: 'Annual inter-college coding competition organized by the CS department. Teams of 2-3 students compete to solve programming challenges.',
      eligibility: ['1st year students (all branches)', '2nd year students (all branches)'],
      event_date: addDays(12),
      registration_deadline: addDays(5),
      required_actions: ['Register online by deadline', 'Form a team of 2-3 members', 'Submit team details by ' + addDays(7), 'Pay ₹100 registration fee'],
      required_documents: ['Team member details', 'Brief problem statement'],
      registration_link: 'https://codestorm.college.edu/register',
      fees: '₹100 per team',
      location: 'Not mentioned in the notice.',
      organizer: 'Department of Computer Science',
      contact_info: 'cs.events@college.edu',
      important_conditions: ['Team size must be 2-3 members', 'Must submit problem statement with registration'],
      missing_information: ['Venue/location not specified', 'Competition format/rounds not detailed'],
      ambiguities: [],
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'inbox_002',
    user_id: DEMO_USER_ID,
    title: 'Machine Learning Workshop by TechClub',
    description: 'TechClub is organizing a 2-day hands-on ML workshop. Topics: Python basics, NumPy, Pandas, Scikit-learn, and a mini-project. Certificate provided.',
    source: 'WhatsApp Group — TechClub',
    category: 'workshop',
    status: 'reviewed',
    received_at: new Date(Date.now() - 86400000).toISOString(),
    event_date: addDays(8),
    registration_deadline: addDays(3),
    link: null,
    attachment_url: null,
    attachment_name: null,
    is_important: true,
    ai_extraction: null,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'inbox_003',
    user_id: DEMO_USER_ID,
    title: 'Physics Lab Report Submission',
    description: 'Lab report for Experiment 3 (Simple Harmonic Motion) must be submitted by end of day tomorrow. Submit in PDF format to the course portal.',
    source: 'Faculty Email',
    category: 'academic',
    status: 'unread',
    received_at: new Date().toISOString(),
    event_date: null,
    registration_deadline: null,
    link: null,
    attachment_url: null,
    attachment_name: null,
    is_important: true,
    ai_extraction: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'inbox_004',
    user_id: DEMO_USER_ID,
    title: 'National Level Hackathon — BuildForBharat',
    description: 'BuildForBharat hackathon invites student teams to solve problems in HealthTech, EdTech, and AgriTech. 48-hour hackathon with ₹5L prize pool. Open to all UG students.',
    source: 'College Notice Board',
    category: 'hackathon',
    status: 'unread',
    received_at: new Date(Date.now() - 3600000).toISOString(),
    event_date: addDays(20),
    registration_deadline: addDays(10),
    link: 'https://buildforbharat.in',
    attachment_url: null,
    attachment_name: null,
    is_important: false,
    ai_extraction: null,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'inbox_005',
    user_id: DEMO_USER_ID,
    title: 'Seminar: Career in Data Science',
    description: 'Guest lecture by a Senior Data Scientist from Google India. Open to all students. No registration required.',
    source: 'Department Notice',
    category: 'seminar',
    status: 'reviewed',
    received_at: new Date(Date.now() - 172800000).toISOString(),
    event_date: addDays(4),
    registration_deadline: null,
    link: null,
    attachment_url: null,
    attachment_name: null,
    is_important: false,
    ai_extraction: null,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
  },
]

const DEMO_TASKS: Task[] = [
  {
    id: 'task_001',
    user_id: DEMO_USER_ID,
    title: 'Submit Physics Lab Report',
    description: 'Write and submit lab report for Experiment 3 (Simple Harmonic Motion). Include observations, calculations, error analysis, and conclusion.',
    deadline: addDays(1),
    priority: 'urgent_important',
    ai_suggested_priority: 'urgent_important',
    user_overrode_priority: false,
    category: 'academic',
    estimated_minutes: 90,
    status: 'in_progress',
    notes: 'Check Dr. Mehta\'s notes for the formula correction. Sagnik has the sample report from last year.',
    related_notice_id: 'inbox_003',
    related_notice_title: 'Physics Lab Report Submission',
    delegated_to: null,
    delegation_note: null,
    delegation_status: 'none',
    subtasks: [
      { id: 'st_001', task_id: 'task_001', title: 'Write observations section', is_completed: true, order_index: 0 },
      { id: 'st_002', task_id: 'task_001', title: 'Calculate error margins', is_completed: false, order_index: 1 },
      { id: 'st_003', task_id: 'task_001', title: 'Write conclusion', is_completed: false, order_index: 2 },
      { id: 'st_004', task_id: 'task_001', title: 'Submit on course portal', is_completed: false, order_index: 3 },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'task_002',
    user_id: DEMO_USER_ID,
    title: 'Register for CodeStorm 2026',
    description: 'Register for the inter-college coding competition. Team of 2-3 required.',
    deadline: addDays(5),
    priority: 'urgent_important',
    ai_suggested_priority: 'important_not_urgent',
    user_overrode_priority: true,
    category: 'competition',
    estimated_minutes: 15,
    status: 'not_started',
    notes: 'Ask Priya and Rahul if they want to team up. Need to submit problem statement too.',
    related_notice_id: 'inbox_001',
    related_notice_title: 'Inter-College Coding Competition — CodeStorm 2026',
    delegated_to: null,
    delegation_note: null,
    delegation_status: 'none',
    subtasks: [
      { id: 'st_005', task_id: 'task_002', title: 'Finalize team members', is_completed: false, order_index: 0 },
      { id: 'st_006', task_id: 'task_002', title: 'Pay ₹100 registration fee', is_completed: false, order_index: 1 },
      { id: 'st_007', task_id: 'task_002', title: 'Submit problem statement', is_completed: false, order_index: 2 },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'task_003',
    user_id: DEMO_USER_ID,
    title: 'Register for ML Workshop',
    description: 'Register for TechClub\'s 2-day ML workshop before deadline.',
    deadline: addDays(3),
    priority: 'important_not_urgent',
    ai_suggested_priority: 'important_not_urgent',
    user_overrode_priority: false,
    category: 'workshop',
    estimated_minutes: 10,
    status: 'not_started',
    notes: '',
    related_notice_id: 'inbox_002',
    related_notice_title: 'Machine Learning Workshop by TechClub',
    delegated_to: 'Rahul',
    delegation_note: 'Rahul said he would register for both of us. Check with him.',
    delegation_status: 'pending',
    subtasks: [],
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'task_004',
    user_id: DEMO_USER_ID,
    title: 'DSA Practice — Arrays & Hashing',
    description: 'Complete LeetCode problems on arrays and hash maps for interview prep. Target: 3 medium problems.',
    deadline: addDays(7),
    priority: 'important_not_urgent',
    ai_suggested_priority: 'important_not_urgent',
    user_overrode_priority: false,
    category: 'academic',
    estimated_minutes: 120,
    status: 'not_started',
    notes: 'Focus on two-pointer and sliding window patterns. Review NeetCode playlist.',
    related_notice_id: null,
    related_notice_title: null,
    delegated_to: null,
    delegation_note: null,
    delegation_status: 'none',
    subtasks: [
      { id: 'st_008', task_id: 'task_004', title: 'Two Sum (Easy)', is_completed: true, order_index: 0 },
      { id: 'st_009', task_id: 'task_004', title: 'Group Anagrams (Medium)', is_completed: false, order_index: 1 },
      { id: 'st_010', task_id: 'task_004', title: 'Longest Consecutive Sequence (Medium)', is_completed: false, order_index: 2 },
    ],
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'task_005',
    user_id: DEMO_USER_ID,
    title: 'Mathematics Assignment 2',
    description: 'Complete problems 1-15 from Chapter 4 (Differential Equations). Submit in class.',
    deadline: addDays(4),
    priority: 'urgent_important',
    ai_suggested_priority: 'urgent_important',
    user_overrode_priority: false,
    category: 'academic',
    estimated_minutes: 75,
    status: 'not_started',
    notes: 'Check Chapter 3 examples first. The method is similar to what was covered in last Tuesday\'s class.',
    related_notice_id: null,
    related_notice_title: null,
    delegated_to: null,
    delegation_note: null,
    delegation_status: 'none',
    subtasks: [],
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
]

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
// Demo Data Store
// ============================================================
export const demoStore = {
  // Profile
  getProfile(): UserProfile {
    return getStored('ccc_profile', DEMO_PROFILE)
  },
  saveProfile(p: Partial<UserProfile>): UserProfile {
    const current = this.getProfile()
    const updated = { ...current, ...p, updated_at: new Date().toISOString() }
    setStored('ccc_profile', updated)
    return updated
  },

  // Inbox
  getInbox(): InboxItem[] {
    return getStored('ccc_inbox', DEMO_INBOX)
  },
  saveInbox(items: InboxItem[]): void {
    setStored('ccc_inbox', items)
  },
  addInboxItem(item: Omit<InboxItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>): InboxItem {
    const newItem: InboxItem = {
      ...item,
      id: generateId(),
      user_id: DEMO_USER_ID,
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
    return getStored('ccc_tasks', DEMO_TASKS)
  },
  saveTasks(tasks: Task[]): void {
    setStored('ccc_tasks', tasks)
  },
  addTask(task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Task {
    const newTask: Task = {
      ...task,
      id: generateId(),
      user_id: DEMO_USER_ID,
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

  // Onboarding
  isOnboardingComplete(): boolean {
    return this.getProfile().onboarding_complete
  },
  completeOnboarding(profileData: Partial<UserProfile>): void {
    this.saveProfile({ ...profileData, onboarding_complete: true })
  },
}
