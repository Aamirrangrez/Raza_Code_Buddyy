// src/components/Lessons/InterviewPanel.jsx
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, RefreshCw, ChevronDown, ChevronUp, Loader2, Zap } from 'lucide-react'
import { generateInterviewQuestions } from '../../services/groqService'
import { LANGUAGES, getLanguageById } from '../../utils/languages'
import MarkdownRenderer from '../MarkdownRenderer'

const CATEGORY_COLORS = {
  'Concepts': 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20',
  'Coding': 'text-accent-violet bg-accent-violet/10 border-accent-violet/20',
  'Problem Solving': 'text-accent-emerald bg-accent-emerald/10 border-accent-emerald/20',
  'Debugging': 'text-accent-rose bg-accent-rose/10 border-accent-rose/20',
}

const DIFFICULTY_COLORS = {
  'Easy': 'text-accent-emerald',
  'Medium': 'text-accent-amber',
  'Hard': 'text-accent-rose',
}

function InterviewCard({ question, index }) {
  const [expanded, setExpanded] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="lesson-card rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 flex items-start gap-3"
      >
        <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-xs font-mono text-slate-400">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${CATEGORY_COLORS[question.category] || CATEGORY_COLORS['Concepts']}`}>
              {question.category}
            </span>
            <span className={`text-[10px] font-medium ${DIFFICULTY_COLORS[question.difficulty]}`}>
              {question.difficulty}
            </span>
          </div>
          <p className="text-sm text-slate-200 leading-snug">{question.question}</p>
        </div>
        <div className="flex-shrink-0 text-slate-500">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-accent-amber/10 text-accent-amber border border-accent-amber/20 hover:bg-accent-amber/20 transition-all"
                >
                  💡 {showHint ? 'Hide' : 'Show'} Hint
                </button>
                <button
                  onClick={() => setShowAnswer(!showAnswer)}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20 hover:bg-accent-emerald/20 transition-all"
                >
                  ✅ {showAnswer ? 'Hide' : 'Show'} Answer
                </button>
              </div>

              {showHint && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-slate-400 bg-accent-amber/5 border border-accent-amber/15 rounded-lg p-3"
                >
                  <span className="text-accent-amber font-medium">Hint:</span> {question.hint}
                </motion.div>
              )}

              {showAnswer && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/2 border border-white/8 rounded-lg p-3"
                >
                  <MarkdownRenderer content={question.answer} />
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function InterviewPanel({ language, setLanguage, mode }) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [generated, setGenerated] = useState(false)

  const generate = async () => {
    setLoading(true)
    setError(null)
    setGenerated(false)
    try {
      const lang = getLanguageById(language)
      const qs = await generateInterviewQuestions({ language: lang.name, mode })
      setQuestions(qs)
      setGenerated(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-white/5">
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={16} className="text-accent-amber" />
          <span className="font-display font-semibold text-sm text-white">Interview Prep</span>
        </div>

        <button
          onClick={generate}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-accent-amber/10 to-accent-rose/10 border border-accent-amber/20 text-accent-amber text-sm font-medium hover:from-accent-amber/20 hover:to-accent-rose/20 disabled:opacity-50 transition-all"
        >
          {loading ? (
            <><Loader2 size={14} className="animate-spin" /> Generating questions...</>
          ) : (
            <><Zap size={14} /> Generate {mode.charAt(0).toUpperCase() + mode.slice(1)} Questions</>
          )}
        </button>
      </div>

      {/* Questions */}
      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <div className="glass rounded-xl p-4 border border-accent-rose/20 mb-4">
            <p className="text-xs text-accent-rose">⚠️ {error}</p>
          </div>
        )}

        {!generated && !loading && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-amber/10 to-accent-rose/10 border border-accent-amber/20 flex items-center justify-center">
              <Trophy size={24} className="text-accent-amber" />
            </div>
            <h3 className="font-display font-semibold text-white text-sm">Interview Practice</h3>
            <p className="text-xs text-slate-500 max-w-48">
              Generate interactive interview questions tailored to your level
            </p>
          </div>
        )}

        {generated && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">{questions.length} questions generated</span>
              <button
                onClick={generate}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                <RefreshCw size={11} /> Regenerate
              </button>
            </div>
            {questions.map((q, i) => (
              <InterviewCard key={q.id || i} question={q} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
