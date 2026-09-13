import React, { useState } from 'react'
import {
  User, Bell, Bot, Palette, Shield,
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

type SettingsTab = 'profile' | 'ai' | 'theme' | 'data'

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
    if (confirm('Are you sure? This will delete all tasks, inbox notices, and AI chat history for a 100% clean slate.')) {
      demoStore.clearAllData()
      toast.success('Clean slate activated! All demo & current items cleared.')
    }
  }

  const loadSamples = () => {
    demoStore.loadSampleData()
    toast.success('Starter sample items loaded!')
  }

  const tabs = [
    { id: 'profile', label: 'Profile',  icon: User },
    { id: 'ai',      label: 'AI Copilot', icon: Bot },
    { id: 'theme',   label: 'Theme',    icon: Palette },
    { id: 'data',    label: 'Data',     icon: Shield },
  ] as const

  return (
    <PageLayout title="Settings">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Tab nav */}
        <div className="md:w-48 shrink-0">
          <nav className="flex md:flex-col gap-1.5 flex-wrap p-1.5 bg-slate-200/60 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/40'
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
              <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary-500 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shrink-0">
                    {profile.name.charAt(0)}
                  </div>
                )}
                <div className="overflow-hidden min-w-0">
                  <p className="font-bold text-slate-900 dark:text-slate-100 text-base truncate">{profile.name}</p>
                  <p className="text-sm text-slate-500 truncate">{profile.email || 'mrdeb3006@gmail.com'}</p>
                </div>
              </div>
              <Input label="Full Name" value={profile.name} onChange={e => update('name', e.target.value)} id="settings-name" />
              <Input label="Email Address" value={profile.email || ''} onChange={e => update('email', e.target.value)} id="settings-email" placeholder="e.g. deb@example.com" />
              <Input label="Avatar Image URL" value={profile.avatar_url || ''} onChange={e => update('avatar_url', e.target.value)} id="settings-avatar" placeholder="https://github.com/..." />
              <Textarea label="Personal Goals / Focus" value={profile.goals} onChange={e => update('goals', e.target.value)} rows={2} id="settings-goals" placeholder="What are you working towards?" />
              <div>
                <p className="label mb-2">Interests & Specializations</p>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map(interest => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        profile.interests.includes(interest)
                          ? 'bg-primary-500 border-primary-500 text-white shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-300'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
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
                <h2 className="section-title">Data & Backup</h2>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-xs text-green-700 dark:text-green-300">
                  ✅ All your notices, tasks, and settings are stored locally on your device in your browser.
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="secondary" onClick={exportData} className="flex-1">
                    <Download className="w-4 h-4" /> Export All Data (JSON)
                  </Button>
                  <Button variant="secondary" onClick={loadSamples} className="flex-1">
                    Load Starter Sample Pack
                  </Button>
                </div>
              </div>
              <div className="card p-6 space-y-3 border border-red-200 dark:border-red-900/40">
                <h2 className="text-base font-semibold text-red-600 dark:text-red-400">Clean Slate / Reset</h2>
                <p className="text-xs text-slate-500">
                  Wipes all demo & current tasks, notices, and AI chats for a completely clean semester start. Your personal profile is preserved.
                </p>
                <Button variant="danger" onClick={clearAll}>
                  <Trash2 className="w-4 h-4" /> Clean Slate (Wipe All Tasks & Notices)
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
