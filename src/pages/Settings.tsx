import React, { useState } from 'react'
import {
  User, School, Bell, Bot, Palette, Shield,
  Save, Moon, Sun, Monitor, Trash2, Download
} from 'lucide-react'
import { demoStore } from '../lib/demoStore'
import { useAppStore } from '../stores/appStore'
import { Button, Input, Textarea, Select, Toggle } from '../components/ui'
import { PageLayout } from '../components/layout/Navigation'
import type { UserProfile } from '../lib/types'
import toast from 'react-hot-toast'

const INTEREST_OPTIONS = [
  'Machine Learning / AI', 'Web Development', 'Mobile Development', 'Data Science',
  'Competitive Programming', 'Open Source', 'Entrepreneurship', 'Design / UI/UX',
  'Research', 'Cloud Computing', 'Cybersecurity', 'Game Development',
  'Robotics / IoT', 'Finance / Fintech', 'Healthcare Tech', 'EdTech',
]

const YEAR_OPTIONS = [
  { value: '1st Year', label: '1st Year' },
  { value: '2nd Year', label: '2nd Year' },
  { value: '3rd Year', label: '3rd Year' },
  { value: '4th Year', label: '4th Year (Final)' },
  { value: 'Postgraduate', label: 'Postgraduate' },
]

type SettingsTab = 'profile' | 'college' | 'ai' | 'theme' | 'data'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const { theme, setTheme } = useAppStore()
  const [profile, setProfile] = useState<UserProfile>(demoStore.getProfile())
  const [saving, setSaving] = useState(false)

  const update = (field: string, value: any) => setProfile(p => ({ ...p, [field]: value }))
  const updateAI = (field: string, value: any) => setProfile(p => ({ ...p, ai_preferences: { ...p.ai_preferences, [field]: value } }))

  const toggleInterest = (interest: string) => {
    setProfile(p => ({
      ...p,
      interests: p.interests.includes(interest)
        ? p.interests.filter(i => i !== interest)
        : [...p.interests, interest],
    }))
  }

  const save = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))
    demoStore.saveProfile(profile)
    setSaving(false)
    toast.success('Settings saved!')
  }

  const exportData = () => {
    const data = {
      profile: demoStore.getProfile(),
      tasks: demoStore.getTasks(),
      inbox: demoStore.getInbox(),
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'college-command-center-export.json'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Data exported!')
  }

  const clearAll = () => {
    if (confirm('Are you sure? This will delete all your tasks and inbox items.')) {
      localStorage.removeItem('ccc_tasks')
      localStorage.removeItem('ccc_inbox')
      localStorage.removeItem('ccc_messages')
      toast.success('Data cleared. Reload to see fresh demo data.')
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile',  icon: User },
    { id: 'college', label: 'College',  icon: School },
    { id: 'ai',      label: 'AI',       icon: Bot },
    { id: 'theme',   label: 'Theme',    icon: Palette },
    { id: 'data',    label: 'Data',     icon: Shield },
  ] as const

  return (
    <PageLayout title="Settings">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Tab nav */}
        <div className="md:w-44 shrink-0">
          <nav className="flex md:flex-col gap-1.5 flex-wrap">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                  activeTab === tab.id
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-lg">
          {activeTab === 'profile' && (
            <div className="card p-6 space-y-4">
              <h2 className="section-title">Personal Profile</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary-500 flex items-center justify-center text-white font-bold text-2xl">
                  {profile.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{profile.name}</p>
                  <p className="text-sm text-slate-500">{profile.year} · {profile.branch}</p>
                  <p className="text-sm text-slate-400">{profile.college}</p>
                </div>
              </div>
              <Input label="Full Name" value={profile.name} onChange={e => update('name', e.target.value)} id="settings-name" />
              <Textarea label="Personal Goals" value={profile.goals} onChange={e => update('goals', e.target.value)} rows={2} id="settings-goals" placeholder="What are you working towards?" />
              <div>
                <p className="label mb-2">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map(interest => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        profile.interests.includes(interest)
                          ? 'bg-primary-500 border-primary-500 text-white'
                          : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-primary-300'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'college' && (
            <div className="card p-6 space-y-4">
              <h2 className="section-title">College Information</h2>
              <Input label="College / University" value={profile.college} onChange={e => update('college', e.target.value)} id="settings-college" />
              <Select label="Year of Study" options={YEAR_OPTIONS} value={profile.year} onChange={e => update('year', e.target.value)} id="settings-year" />
              <Input label="Branch / Department" value={profile.branch} onChange={e => update('branch', e.target.value)} id="settings-branch" />
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="card p-6 space-y-5">
              <h2 className="section-title">AI Preferences</h2>
              <div className="space-y-4">
                <Toggle
                  checked={profile.ai_preferences.philosophical_mode}
                  onChange={v => updateAI('philosophical_mode', v)}
                  label="Enable philosophical perspectives"
                />
                <p className="text-xs text-slate-500 -mt-2 ml-13">
                  When enabled, the AI Copilot can offer philosophical reflections from the Bhagavad Gita, Stoicism, and other traditions when relevant.
                </p>
                <Select
                  label="Preferred philosophical framework"
                  options={[
                    { value: 'bhagavad_gita', label: 'Bhagavad Gita / Vedanta' },
                    { value: 'stoicism', label: 'Stoicism (Marcus Aurelius, Epictetus)' },
                    { value: 'buddhism', label: 'Buddhist Philosophy' },
                    { value: 'aristotle', label: 'Aristotle / Virtue Ethics' },
                    { value: 'mixed', label: 'Mixed (let AI decide)' },
                  ]}
                  value={profile.ai_preferences.philosophy_framework}
                  onChange={e => updateAI('philosophy_framework', e.target.value)}
                  id="settings-philosophy"
                />
                <Toggle
                  checked={profile.ai_preferences.verbose_explanations}
                  onChange={v => updateAI('verbose_explanations', v)}
                  label="Verbose AI explanations"
                />
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-xs text-amber-700 dark:text-amber-300">
                ⚠️ Philosophical perspectives are always clearly labeled as reflective frameworks, not factual recommendations.
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="card p-6 space-y-4">
              <h2 className="section-title">Appearance</h2>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { value: 'light',  icon: Sun,     label: 'Light' },
                  { value: 'dark',   icon: Moon,    label: 'Dark' },
                  { value: 'system', icon: Monitor, label: 'System' },
                ] as const).map(t => (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      theme === t.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <t.icon className={`w-5 h-5 ${theme === t.value ? 'text-primary-500' : 'text-slate-500'}`} />
                    <span className={`text-xs font-medium ${theme === t.value ? 'text-primary-600 dark:text-primary-400' : 'text-slate-600 dark:text-slate-400'}`}>
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="card p-6 space-y-4">
                <h2 className="section-title">Data & Privacy</h2>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-xs text-green-700 dark:text-green-300">
                  ✅ All your data is stored locally on this device. No data is sent to any server without your explicit action.
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-xs text-blue-700 dark:text-blue-300">
                  🔒 AI requests are processed through the backend. Your notice text is sent for analysis, but not stored permanently.
                </div>
                <Button variant="secondary" onClick={exportData} className="w-full">
                  <Download className="w-4 h-4" /> Export All Data (JSON)
                </Button>
              </div>
              <div className="card p-6 space-y-3">
                <h2 className="text-base font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
                <p className="text-xs text-slate-500">This will delete all your tasks and inbox items. Your profile will be kept.</p>
                <Button variant="danger" onClick={clearAll}>
                  <Trash2 className="w-4 h-4" /> Clear All Data
                </Button>
              </div>
            </div>
          )}

          {/* Save button */}
          {activeTab !== 'data' && activeTab !== 'theme' && (
            <div className="mt-4">
              <Button variant="primary" onClick={save} loading={saving} id="settings-save">
                <Save className="w-4 h-4" /> Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
