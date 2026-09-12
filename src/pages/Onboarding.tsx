import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, ArrowRight, Sparkles } from 'lucide-react'
import { Button, Input, Textarea, Select } from '../components/ui'
import { demoStore } from '../lib/demoStore'
import type { UserProfile } from '../lib/types'

const STEPS = [
  { id: 'name',     title: 'Welcome! What\'s your name?',              subtitle: 'Let\'s personalize your experience.' },
  { id: 'college',  title: 'Which college do you attend?',             subtitle: 'This helps us tailor the app for your institution.' },
  { id: 'details',  title: 'Tell us about your studies.',              subtitle: 'We\'ll use this to prioritize what matters to you.' },
  { id: 'interests',title: 'What are you passionate about?',           subtitle: 'Select your interests — helps the AI Copilot give better advice.' },
  { id: 'workflow', title: 'Your personal operating system is ready.', subtitle: 'Here\'s how it works.' },
]

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

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [data, setData] = useState({
    name: '',
    college: '',
    year: '2nd Year',
    branch: '',
    interests: [] as string[],
    goals: '',
  })

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  const update = (field: string, value: string | string[]) =>
    setData(d => ({ ...d, [field]: value }))

  const toggleInterest = (interest: string) => {
    setData(d => ({
      ...d,
      interests: d.interests.includes(interest)
        ? d.interests.filter(i => i !== interest)
        : [...d.interests, interest],
    }))
  }

  const canProceed = () => {
    if (step === 0) return data.name.trim().length >= 2
    if (step === 1) return data.college.trim().length >= 2
    if (step === 2) return data.branch.trim().length >= 2
    return true
  }

  const handleNext = () => {
    if (isLast) {
      demoStore.completeOnboarding({
        ...demoStore.getProfile(),
        name: data.name || 'Student',
        college: data.college,
        year: data.year,
        branch: data.branch,
        interests: data.interests,
        goals: data.goals,
      })
      navigate('/')
    } else {
      setStep(s => s + 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-primary-950 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-bold">College Command Center</p>
            <p className="text-primary-400 text-xs">Your personal academic OS</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-primary-400' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{current.title}</h1>
            <p className="text-sm text-slate-500 mt-1">{current.subtitle}</p>
          </div>

          {/* Step content */}
          {step === 0 && (
            <div className="space-y-4">
              <Input
                label="Your Name"
                placeholder="e.g. Debendranath Bera"
                value={data.name}
                onChange={e => update('name', e.target.value)}
                autoFocus
                id="onboarding-name"
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <Input
                label="College / University Name"
                placeholder="e.g. BITS Pilani, IIT Bombay, VIT..."
                value={data.college}
                onChange={e => update('college', e.target.value)}
                autoFocus
                id="onboarding-college"
              />
              <Textarea
                label="Goals (optional)"
                placeholder="e.g. Get a software engineering internship, build meaningful projects..."
                value={data.goals}
                onChange={e => update('goals', e.target.value)}
                rows={3}
                id="onboarding-goals"
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Select
                label="Year of Study"
                options={YEAR_OPTIONS}
                value={data.year}
                onChange={e => update('year', e.target.value)}
                id="onboarding-year"
              />
              <Input
                label="Branch / Department"
                placeholder="e.g. Computer Science, Mechanical, Electronics..."
                value={data.branch}
                onChange={e => update('branch', e.target.value)}
                id="onboarding-branch"
              />
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map(interest => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      data.interests.includes(interest)
                        ? 'bg-primary-500 border-primary-500 text-white'
                        : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-primary-300'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-3">{data.interests.length} selected</p>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              {[
                {
                  step: '1. Capture',
                  icon: '📥',
                  desc: 'Add college notices, PDFs, WhatsApp messages, links to the College Inbox.',
                },
                {
                  step: '2. Understand',
                  icon: '🤖',
                  desc: 'AI extracts key info: deadlines, eligibility, required actions from complex notices.',
                },
                {
                  step: '3. Prioritize',
                  icon: '⚡',
                  desc: 'The Eisenhower matrix and AI help you focus on what actually matters.',
                },
                {
                  step: '4. Act',
                  icon: '✅',
                  desc: 'Tasks linked to notices. Calendar shows everything. College Copilot guides decisions.',
                },
              ].map(item => (
                <div key={item.step} className="flex gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.step}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}

              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 flex items-start gap-3 mt-2">
                <Sparkles className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                <p className="text-sm text-primary-700 dark:text-primary-300">
                  Everything is saved locally for now. When you add your Supabase credentials, your data syncs across devices.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-8">
            {step > 0 ? (
              <button
                onClick={() => setStep(s => s - 1)}
                className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                ← Back
              </button>
            ) : <div />}
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!canProceed()}
              id={`onboarding-next-${step}`}
            >
              {isLast ? 'Get Started' : 'Continue'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Skip */}
        {!isLast && (
          <button
            onClick={() => {
              demoStore.completeOnboarding({ ...demoStore.getProfile(), name: data.name || 'Student' })
              navigate('/')
            }}
            className="w-full text-center text-xs text-white/40 hover:text-white/60 mt-4 transition-colors"
          >
            Skip setup
          </button>
        )}
      </div>
    </div>
  )
}
