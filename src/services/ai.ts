// ============================================================
// AI Service — Frontend-facing API
// All AI calls go through the backend (Supabase Edge Functions)
// or, in demo mode, through a simulated AI response
// ============================================================
import type {
  NoticeExtractionResponse,
  PrioritySuggestionResponse,
  CopilotResponse,
  Task,
  InboxItem,
  Priority,
  Category,
} from '../lib/types'
import { demoStore } from '../lib/demoStore'
import { addDays, format } from 'date-fns'

const AI_API_BASE = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
  : null

// ============================================================
// Backend call wrapper
// ============================================================
async function callBackend<T>(
  endpoint: string,
  body: object,
): Promise<T> {
  if (!AI_API_BASE) {
    // Demo mode — use simulated AI
    return simulateAI(endpoint, body) as T
  }
  const res = await fetch(`${AI_API_BASE}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`AI service error: ${err}`)
  }
  return res.json()
}

// ============================================================
// AI Feature Functions
// ============================================================

export async function extractNotice(
  text: string,
  fileName?: string,
): Promise<NoticeExtractionResponse> {
  return callBackend('ai-extract-notice', { text, fileName })
}

export async function suggestPriority(
  task: Partial<Task>,
  existingTasks: Task[],
): Promise<PrioritySuggestionResponse> {
  return callBackend('ai-suggest-priority', { task, existingTasks })
}

export async function copilotChat(
  message: string,
  conversationHistory: Array<{ role: string; content: string }>,
  includeContext: boolean = true,
): Promise<CopilotResponse> {
  const context = includeContext ? buildUserContext() : null
  return callBackend('ai-copilot-chat', { message, conversationHistory, context })
}

// ============================================================
// User Context Builder
// Injects user data into AI calls
// ============================================================
function buildUserContext(): object {
  const tasks = demoStore.getTasks()
  const inbox = demoStore.getInbox()
  const profile = demoStore.getProfile()

  const activeTasks = tasks.filter(t => t.status !== 'completed')
  const importantNotices = inbox.filter(i => i.is_important && i.status !== 'acted')

  return {
    profile: {
      name: profile.name,
      year: profile.year,
      branch: profile.branch,
      interests: profile.interests,
    },
    activeTasks: activeTasks.map(t => ({
      id: t.id,
      title: t.title,
      deadline: t.deadline,
      priority: t.priority,
      category: t.category,
      estimatedMinutes: t.estimated_minutes,
      status: t.status,
      notes: t.notes,
    })),
    importantNotices: importantNotices.map(n => ({
      id: n.id,
      title: n.title,
      category: n.category,
      registrationDeadline: n.registration_deadline,
      eventDate: n.event_date,
    })),
    currentDate: new Date().toISOString(),
  }
}

// ============================================================
// DEMO / SIMULATION MODE
// Produces realistic AI-like responses without an API key
// ============================================================
async function simulateAI(endpoint: string, body: object): Promise<unknown> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700))

  switch (endpoint) {
    case 'ai-extract-notice':
      return simulateExtraction((body as { text: string }).text)
    case 'ai-suggest-priority':
      return simulatePrioritySuggestion(body as { task: Partial<Task> })
    case 'ai-copilot-chat':
      return simulateCopilot(body as { message: string; conversationHistory: Array<{ role: string; content: string }> })
    default:
      throw new Error(`Unknown AI endpoint: ${endpoint}`)
  }
}

function simulateExtraction(text: string): NoticeExtractionResponse {
  // Basic extraction simulation
  const hasDeadline = /deadline|by|register|before/i.test(text)
  const hasEvent = /event|competition|workshop|hackathon|seminar/i.test(text)
  const hasLink = /(https?:\/\/[^\s]+)/i.exec(text)
  const hasEmail = /[\w.]+@[\w.]+/i.exec(text)
  const dateMatches = text.match(/\d{1,2}[\s-\/](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{1,2})[\s-\/]\d{2,4}/gi)

  const now = new Date()
  const category = detectCategory(text)

  const extraction = {
    title: extractTitle(text),
    category,
    summary: `This notice describes a ${category} activity or requirement. Review the details below for specific actions required.`,
    eligibility: text.toLowerCase().includes('all student') ? ['All students'] : ['Not mentioned in the notice.'],
    event_date: dateMatches && dateMatches[1] ? parseSimpleDate(dateMatches[1]) : null,
    registration_deadline: hasDeadline && dateMatches && dateMatches[0] ? parseSimpleDate(dateMatches[0]) : null,
    required_actions: extractActions(text),
    required_documents: extractDocuments(text),
    registration_link: hasLink ? hasLink[1] : null,
    fees: extractFees(text),
    location: 'Not mentioned in the notice.',
    organizer: 'Not mentioned in the notice.',
    contact_info: hasEmail ? hasEmail[0] : 'Not mentioned in the notice.',
    important_conditions: extractConditions(text),
    missing_information: ['Some details may be missing from the provided text.'],
    ambiguities: [],
  }

  const suggestedTasks = []
  if (extraction.registration_deadline) {
    suggestedTasks.push({
      title: `Register for ${extraction.title}`,
      description: `Complete registration before the deadline.`,
      deadline: extraction.registration_deadline,
      priority: 'urgent_important' as Priority,
      category: extraction.category as Category,
      estimated_minutes: 15,
      reasoning: 'Registration has a specific deadline and must be completed first.',
    })
  }
  if (extraction.event_date && extraction.event_date !== extraction.registration_deadline) {
    suggestedTasks.push({
      title: `Prepare for ${extraction.title}`,
      description: `Prepare and organize for the event.`,
      deadline: extraction.event_date,
      priority: 'important_not_urgent' as Priority,
      category: extraction.category as Category,
      estimated_minutes: 60,
      reasoning: 'Preparation before the event date ensures you perform your best.',
    })
  }

  return { extraction, suggested_tasks: suggestedTasks }
}

function detectCategory(text: string): Category {
  const t = text.toLowerCase()
  if (t.includes('hackathon')) return 'hackathon'
  if (t.includes('competition') || t.includes('contest')) return 'competition'
  if (t.includes('workshop')) return 'workshop'
  if (t.includes('seminar') || t.includes('lecture') || t.includes('guest')) return 'seminar'
  if (t.includes('club') || t.includes('society')) return 'club'
  if (t.includes('assignment') || t.includes('exam') || t.includes('test') || t.includes('quiz') || t.includes('lab')) return 'academic'
  if (t.includes('opportunity') || t.includes('internship') || t.includes('job')) return 'opportunity'
  if (t.includes('event') || t.includes('fest') || t.includes('fair')) return 'event'
  return 'general'
}

function extractTitle(text: string): string {
  const lines = text.split('\n').filter(l => l.trim().length > 0)
  const firstMeaningful = lines.find(l => l.trim().length > 10 && l.trim().length < 100)
  return firstMeaningful ? firstMeaningful.trim().slice(0, 80) : 'Notice (Please review)'
}

function extractActions(text: string): string[] {
  const actions: string[] = []
  if (/register/i.test(text)) actions.push('Register for the event/activity')
  if (/submit/i.test(text)) actions.push('Submit required documents/materials')
  if (/pay|fee|payment/i.test(text)) actions.push('Pay registration or participation fee')
  if (/team|group/i.test(text)) actions.push('Form a team as required')
  if (actions.length === 0) actions.push('Review the notice and take appropriate action')
  return actions
}

function extractDocuments(text: string): string[] {
  const docs: string[] = []
  if (/id card|college id/i.test(text)) docs.push('College ID card')
  if (/photo/i.test(text)) docs.push('Photograph')
  if (/statement|proposal/i.test(text)) docs.push('Problem statement/proposal')
  if (/resume|cv/i.test(text)) docs.push('Resume/CV')
  if (docs.length === 0) return ['Not mentioned in the notice.']
  return docs
}

function extractFees(text: string): string | null {
  const feeMatch = text.match(/₹\s*[\d,]+|Rs\.?\s*[\d,]+|\d+\s*rupees?/i)
  return feeMatch ? feeMatch[0] : null
}

function extractConditions(text: string): string[] {
  const conditions: string[] = []
  const lines = text.split(/[.\n]/).filter(l => l.trim().length > 20)
  for (const line of lines) {
    if (/must|should|required|mandatory|only|eligible|condition/i.test(line)) {
      conditions.push(line.trim())
      if (conditions.length >= 3) break
    }
  }
  return conditions.length > 0 ? conditions : ['Review the original notice for specific conditions.']
}

function parseSimpleDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0]
  } catch {}
  return addDays(new Date(), 7).toISOString().split('T')[0]
}

function simulatePrioritySuggestion(body: { task: Partial<Task> }): PrioritySuggestionResponse {
  const { task } = body
  const deadline = task.deadline ? new Date(task.deadline) : null
  const now = new Date()
  const daysUntil = deadline ? Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 999
  const category = task.category || 'general'

  let priority: Priority = 'low'
  let reasoning = ''
  let factors: string[] = []

  if (daysUntil <= 1) {
    priority = 'urgent_important'
    reasoning = 'This task is due very soon and should be your immediate focus.'
    factors = ['Deadline within 24 hours', 'High consequence of missing deadline']
  } else if (daysUntil <= 3 && ['academic', 'competition'].includes(category)) {
    priority = 'urgent_important'
    reasoning = 'Academic or competition deadline approaching within 3 days requires immediate attention.'
    factors = ['Deadline within 3 days', 'Academic/competition category', 'High consequence']
  } else if (['academic', 'competition', 'hackathon', 'opportunity'].includes(category)) {
    priority = 'important_not_urgent'
    reasoning = 'This task is important for your academic/career growth and should be scheduled soon.'
    factors = ['High-value category for career/academic goals', 'Has upcoming deadline to plan for']
  } else if (daysUntil <= 3) {
    priority = 'urgent_not_important'
    reasoning = 'This task needs to be completed soon but has lower overall importance.'
    factors = ['Approaching deadline', 'Lower priority category']
  } else {
    priority = 'low'
    reasoning = 'This task is not time-sensitive and can be addressed when convenient.'
    factors = ['No immediate deadline', 'Lower priority category']
  }

  return { suggested_priority: priority, reasoning, factors }
}

function simulateCopilot(body: {
  message: string
  conversationHistory: Array<{ role: string; content: string }>
}): CopilotResponse {
  const { message } = body
  const tasks = demoStore.getTasks().filter(t => t.status !== 'completed')
  const inbox = demoStore.getInbox().filter(i => i.is_important)
  const profile = demoStore.getProfile()

  const msg = message.toLowerCase()

  // Decision mode triggers
  const isDecision = /should i|what should|help me decide|prioritize|which.*first/i.test(msg)
  const isPhilosophical = /philosophy|gita|stoic|stress|anxious|worried|purpose|meaning/i.test(msg)
  const isPlanning = /hours?.*tonight|today.*plan|what.*work on|schedule.*today/i.test(msg)
  const isExtraction = /notice|explain.*notice|what does.*say|what.*require/i.test(msg)

  let content = ''
  let mode: CopilotResponse['mode'] = 'general'
  let structured_response: CopilotResponse['structured_response'] = undefined

  if (isPlanning) {
    mode = 'planning'
    const urgent = tasks.filter(t => t.priority === 'urgent_important').slice(0, 3)
    const hoursMatch = msg.match(/(\d+)\s*hour/i)
    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 2
    const totalMinutes = hours * 60

    let plan = `**📋 Your ${hours}-Hour Focused Plan**\n\nBased on your current tasks and priorities:\n\n`
    let remaining = totalMinutes
    let planItems = 0

    for (const task of urgent) {
      if (remaining <= 0) break
      const time = Math.min(task.estimated_minutes || 45, remaining, 90)
      plan += `**${planItems + 1}. ${task.title}** — ${time} min\n`
      if (task.deadline) plan += `   📅 Due ${format(new Date(task.deadline), 'MMM d')}\n`
      plan += '\n'
      remaining -= time
      planItems++
    }

    if (remaining > 10) {
      plan += `**${planItems + 1}. Buffer / review** — ${remaining} min\n\nUse the remaining time to review what you completed or do a quick DSA problem.\n`
    }

    plan += `\n> 💡 Focus on one task at a time. Put your phone away during each block.`
    content = plan
  } else if (isDecision) {
    mode = 'decision'
    const urgentCount = tasks.filter(t => t.priority === 'urgent_important').length
    const upcomingDeadlines = tasks
      .filter(t => t.deadline)
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
      .slice(0, 3)

    content = `**🧭 College Copilot Analysis**\n\n`
    content += `**Situation:**\nYou have ${tasks.length} active tasks, ${urgentCount} of which are urgent.\n\n`
    content += `**Practical View:**\n`
    for (const t of upcomingDeadlines) {
      content += `• ${t.title} — due ${t.deadline ? format(new Date(t.deadline), 'MMM d') : 'unknown'}\n`
    }
    content += `\n**Recommendation:**\nFocus on your most urgent deadline first. Complete it before moving to the next.\n\n`
    content += `**Why:**\nDeadlines that are closest and most consequential deserve your undivided attention. Once those are handled, you'll be able to think more clearly about everything else.\n\n`

    if (isPhilosophical) {
      content += `**🪷 A Reflective Perspective (Bhagavad Gita-inspired):**\n*"You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions."* (Ch. 2, V. 47)\n\nFrom this perspective: focus on doing the work with full attention and effort — the outcome follows naturally. Anxiety about results often pulls attention away from the action itself.`
    }

    structured_response = {
      situation: `${tasks.length} active tasks, ${urgentCount} urgent`,
      recommendation: 'Handle nearest deadline first, then plan the rest',
    }
  } else if (isPhilosophical) {
    mode = 'philosophical'
    content = `**🪷 Philosophical Reflection**\n\n`
    content += `Here are some perspectives that might help ground you:\n\n`
    content += `**From the Bhagavad Gita (Ch. 2, V. 47):**\n*"You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions."*\n\nThis doesn't mean outcomes don't matter — it means that worrying excessively about outcomes draws energy away from the action itself. Do your work with full attention.\n\n`
    content += `**A Stoic perspective:**\nMarcus Aurelius wrote: *"Confine yourself to the present."* What specifically can you do *right now*, today? Break the overwhelming whole into the next single step.\n\n`
    content += `> These are philosophical frameworks for reflection — not prescriptions. You remain the best judge of your own situation.`
  } else if (isExtraction) {
    mode = 'extraction'
    content = `To analyze a specific notice, please go to the **College Inbox** section and use the **"Add to Inbox"** button to paste or upload your notice. I'll extract all the key information automatically.\n\nAlternatively, paste the notice text here and I'll do my best to summarize it for you.`
  } else {
    // General response
    const urgentTasks = tasks.filter(t => t.priority === 'urgent_important' && t.status !== 'completed')
    content = `Hi ${profile.name}! 👋\n\nHere's what I see in your current workload:\n\n`
    if (urgentTasks.length > 0) {
      content += `**🔴 Urgent & Important:**\n`
      for (const t of urgentTasks.slice(0, 3)) {
        content += `• ${t.title}${t.deadline ? ` (due ${format(new Date(t.deadline), 'MMM d')})` : ''}\n`
      }
      content += '\n'
    }
    content += `You have **${tasks.length} active tasks** total.\n\n`
    content += `I can help you:\n• Plan your day: *"I have 2 hours tonight, what should I do?"*\n• Make decisions: *"Should I participate in this hackathon?"*\n• Analyze notices: *"What does this notice require me to submit?"*\n• Get philosophical perspective: *"I'm stressed about exams"*\n\nWhat would you like help with?`
  }

  return { content, mode, structured_response }
}
