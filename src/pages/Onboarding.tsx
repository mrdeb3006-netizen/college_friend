import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, ArrowRight, Sparkles, Check, Compass, ShieldCheck } from 'lucide-react'
import { Button, Input, Textarea } from '../components/ui'
import { demoStore } from '../lib/demoStore'

const STEPS = [
  { id: 'name',      title: "Welcome! What's your name?",         subtitle: "Let's personalize your college operating system." },
  { id: 'interests', title: 'What are your key focus areas?',      subtitle: 'Select your academic interests — helps the AI Copilot tailor suggestions.' },
  { id: 'workflow',  title: 'Your Command Center is ready.',       subtitle: "Here's how your unified student operating system operates." },
]

const INTEREST_OPTIONS = [
  'Machine Learning / AI', 'Full-Stack Web Dev', 'Mobile App Dev', 'Data Science',
  'Competitive Programming', 'Open Source', 'Entrepreneurship & Startups', 'UI/UX & Product Design',
  'Academic Research', 'Cloud & DevOps', 'Cybersecurity', 'Game Development',
  'Robotics & IoT', 'Finance & Fintech', 'Systems & Architecture', 'Quantum Computing',
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [data, setData] = useState({
    name: 'Debendranath Bera',
    interests: ['Full-Stack Web Dev', 'Machine Learning / AI', 'Competitive Programming', 'Open Source'] as string[],
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
    return true
  }

  const handleNext = () => {
    if (isLast) {
      demoStore.completeOnboarding({
        ...demoStore.getProfile(),
        name: data.name || 'Debendranath Bera',
        interests: data.interests,
        goals: data.goals,
      })
      navigate('/')
    } else {
      setStep(s => s + 1)
    }
  }

  return (
    <div className="min-h-screen bg-[#06090f] text-slate-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Aurora Ambient Glows */}
      <div className="pointer-events-none fixed -top-40 left-1/4 w-[600px] h-[500px] bg-gradient-to-br from-primary-600/20 via-indigo-600/20 to-transparent rounded-full blur-[140px] -z-10" />
      <div className="pointer-events-none fixed bottom-0 right-1/4 w-[500px] h-[450px] bg-gradient-to-tr from-purple-600/15 via-pink-600/10 to-transparent rounded-full blur-[140px] -z-10" />

      <div className="w-full max-w-lg relative z-10">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3.5 mb-8 justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/30 ring-1 ring-white/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-extrabold text-lg tracking-tight">College Command Center</p>
            <p className="text-primary-400 text-xs font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Unified Academic Operating System
            </p>
          </div>
        </div>

        {/* Step Progress Pills */}
        <div className="flex gap-2 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                i <= step
                  ? 'bg-gradient-to-r from-primary-500 to-indigo-500 shadow-glow-primary'
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Frosted Glass Card Container */}
        <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{current.title}</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">{current.subtitle}</p>
          </div>

          {/* Step 0: Name & Goals */}
          {step === 0 && (
            <div className="space-y-4">
              <Input
                label="Your Full Name"
                placeholder="e.g. Debendranath Bera"
                value={data.name}
                onChange={e => update('name', e.target.value)}
                autoFocus
                id="onboarding-name"
              />
              <Textarea
                label="Academic Goals & Focus (optional)"
                placeholder="e.g. Ace algorithms, build production full-stack apps, prepare for placement season..."
                value={data.goals}
                onChange={e => update('goals', e.target.value)}
                rows={3}
                id="onboarding-goals"
              />
            </div>
          )}

          {/* Step 1: Interests */}
          {step === 1 && (
            <div>
              <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto pr-1">
                {INTEREST_OPTIONS.map(interest => {
                  const selected = data.interests.includes(interest)
                  return (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                        selected
                          ? 'bg-primary-600 border-primary-500 text-white shadow-glow-primary scale-105'
                          : 'border-slate-800 bg-slate-800/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      {selected && <Check className="w-3.5 h-3.5" />}
                      {interest}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-slate-400 mt-4 font-mono font-medium">
                {data.interests.length} topics selected
              </p>
            </div>
          )}

          {/* Step 2: System Architecture & Workflow */}
          {step === 2 && (
            <div className="space-y-3.5">
              {[
                {
                  step: '1. Intelligent Ingest',
                  icon: '📥',
                  desc: 'Paste WhatsApp messages, exam circulars, or hackathon PDFs. Gemini AI extracts deadlines and links automatically.',
                },
                {
                  step: '2. Eisenhower Prioritization',
                  icon: '⚡',
                  desc: 'Auto-categorize commitments into Q1 (Urgent/Important), Q2 (Schedule), Q3 (Delegate), and Q4 (Backlog).',
                },
                {
                  step: '3. Real-Time Tracking',
                  icon: '📅',
                  desc: 'Interactive calendar, timeline view, and kanban board to guarantee you never miss a deadline.',
                },
                {
                  step: '4. Academic AI Copilot',
                  icon: '🤖',
                  desc: 'Ask your copilot to build revision schedules, prioritize homework, or draft club announcements.',
                },
              ].map(item => (
                <div key={item.step} className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                  <span className="text-2xl shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <p className="text-xs font-extrabold text-white">{item.step}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}

              <div className="bg-primary-950/50 border border-primary-800/60 rounded-2xl p-3.5 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="text-xs text-primary-200 font-medium">
                  Client-side local storage with private browser database. Zero external data sharing.
                </p>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/10">
            {step > 0 ? (
              <button
                onClick={() => setStep(s => s - 1)}
                className="text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ← Back
              </button>
            ) : <div />}

            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!canProceed()}
              id={`onboarding-next-${step}`}
              className="shadow-glow-primary px-6"
            >
              {isLast ? 'Enter Command Center' : 'Continue'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Skip Option */}
        {!isLast && (
          <button
            onClick={() => {
              demoStore.completeOnboarding({ ...demoStore.getProfile(), name: data.name || 'Debendranath Bera' })
              navigate('/')
            }}
            className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-300 mt-4 transition-colors cursor-pointer"
          >
            Skip personalization & enter now →
          </button>
        )}
      </div>
    </div>
  )
}
