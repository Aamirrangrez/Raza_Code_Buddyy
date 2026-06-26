// src/components/Layout/WelcomeScreen.jsx
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, BookOpen, Code2, MessageSquare, Eye, ArrowRight, ChevronRight } from 'lucide-react'
import { LEARNING_MODES } from '../../utils/languages'

const FEATURES = [
  { icon: BookOpen, color: 'cyan', title: 'Interactive Lessons', desc: 'Personalized lessons on any coding concept' },
  { icon: Code2, color: 'violet', title: 'Live IDE', desc: 'Write and run Python, JS, C, C++ with Monaco editor' },
  { icon: MessageSquare, color: 'emerald', title: 'Code Helper', desc: 'Ask questions, debug code, and get explanations' },
  { icon: Eye, color: 'amber', title: 'Visual Execution', desc: 'Watch code run step by step with variable tracking' },
]

const COLOR_CLASSES = {
  cyan:    { bg: 'bg-accent-cyan/10',    border: 'border-accent-cyan/20',    text: 'text-accent-cyan' },
  violet:  { bg: 'bg-accent-violet/10',  border: 'border-accent-violet/20',  text: 'text-accent-violet' },
  emerald: { bg: 'bg-accent-emerald/10', border: 'border-accent-emerald/20', text: 'text-accent-emerald' },
  amber:   { bg: 'bg-accent-amber/10',   border: 'border-accent-amber/20',   text: 'text-accent-amber' },
}

export default function WelcomeScreen({ onStart, setMode, setUserName }) {
  const [step, setStep] = useState(0) // 0 = intro, 1 = pick mode
  const [nameInput, setNameInput] = useState('')
  const [nameError, setNameError] = useState('')
  const [selectedMode, setSelectedMode] = useState('beginner')

  const handleStart = () => {
    const finalName = nameInput.trim() || 'Learner'
    setUserName(finalName)
    setMode(selectedMode)
    onStart()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(3,7,18,0.95)', backdropFilter: 'blur(20px)' }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent-cyan/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent-violet/5 blur-3xl" />
      </div>

      <AnimatePresence mode="wait">
        {step === 0 ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="relative max-w-lg w-full text-center"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-cyan/20 to-accent-violet/20 border border-accent-cyan/30 flex items-center justify-center mx-auto mb-6"
              style={{ boxShadow: '0 0 40px rgba(34,211,238,0.2)' }}
            >
              <Zap size={28} className="text-accent-cyan" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display font-bold text-4xl text-white mb-2"
            >
              RazaCode<span className="shimmer-text">Buddy</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-slate-400 text-sm mb-6"
            >
              Your visual coding environment & learning mentor
            </motion.p>

            {/* Feature grid */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 gap-3 mb-6"
            >
              {FEATURES.map((f, i) => {
                const Icon = f.icon
                const c = COLOR_CLASSES[f.color]
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.07 }}
                    className={`rounded-xl border p-3 text-left ${c.bg} ${c.border}`}
                  >
                    <Icon size={16} className={`${c.text} mb-2`} />
                    <p className="text-xs font-semibold text-white mb-0.5">{f.title}</p>
                    <p className="text-[11px] text-slate-500 leading-snug">{f.desc}</p>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* User name input */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-6 text-left max-w-sm mx-auto w-full"
            >
              <label htmlFor="name-input" className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Enter your name or nickname
              </label>
              <input
                id="name-input"
                type="text"
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value)
                  if (e.target.value.trim().length > 0) setNameError('')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && nameInput.trim()) {
                    setStep(1)
                  }
                }}
                placeholder="What should we call you?"
                className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-accent-cyan/40 focus:bg-accent-cyan/5 transition-all"
                maxLength={25}
              />
              {nameError && (
                <p className="text-xs text-red-400 mt-1.5">{nameError}</p>
              )}
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              onClick={() => {
                if (!nameInput.trim()) {
                  setNameError('Please enter your name to get started!')
                  return
                }
                setStep(1)
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all mb-4"
              style={{
                background: 'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(139,92,246,0.15))',
                border: '1px solid rgba(34,211,238,0.3)',
                boxShadow: '0 0 30px rgba(34,211,238,0.1)',
              }}
            >
              Get Started <ArrowRight size={15} />
            </motion.button>

            <div className="mt-6 text-center">
              <a
                href="https://amirrangrez.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-slate-500 hover:text-accent-cyan transition-all font-medium"
              >
                Designed & developed by Amir Rangrez
              </a>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="mode"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="relative max-w-sm w-full"
          >
            <h2 className="font-display font-bold text-2xl text-white text-center mb-1">
              Hi, <span className="shimmer-text">{nameInput.trim()}</span>!
            </h2>
            <p className="text-slate-400 text-xs text-center mb-6">Choose your learning level to personalize lessons</p>

            <div className="space-y-3 mb-6">
              {LEARNING_MODES.map((m) => (
                <motion.button
                  key={m.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedMode(m.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedMode === m.id
                      ? 'bg-accent-cyan/10 border-accent-cyan/30 text-white'
                      : 'bg-white/3 border-white/8 text-slate-400 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{m.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{m.label}</p>
                      <p className="text-xs opacity-60 mt-0.5">{m.desc}</p>
                    </div>
                    {selectedMode === m.id && (
                      <div className="w-5 h-5 rounded-full bg-accent-cyan/20 border border-accent-cyan/40 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-accent-cyan" />
                      </div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(0)}
                className="px-4 py-2.5 rounded-xl text-sm text-slate-400 border border-white/8 hover:bg-white/5 transition-all"
              >
                Back
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStart}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{
                  background: 'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(139,92,246,0.15))',
                  border: '1px solid rgba(34,211,238,0.3)',
                  boxShadow: '0 0 30px rgba(34,211,238,0.1)',
                }}
              >
                Start Learning <ChevronRight size={15} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
