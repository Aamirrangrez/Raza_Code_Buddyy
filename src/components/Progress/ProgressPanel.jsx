// src/components/Progress/ProgressPanel.jsx
import React from 'react'
import { motion } from 'framer-motion'
import { Flame, Star, BookOpen, Code2, Trash2, Clock, CheckCircle2, Save } from 'lucide-react'
import { TOPICS, getLanguageById } from '../../utils/languages'

function StatCard({ icon, label, value, color = 'cyan' }) {
  const colors = {
    cyan: 'text-accent-cyan border-accent-cyan/20 bg-accent-cyan/5',
    amber: 'text-accent-amber border-accent-amber/20 bg-accent-amber/5',
    violet: 'text-accent-violet border-accent-violet/20 bg-accent-violet/5',
    emerald: 'text-accent-emerald border-accent-emerald/20 bg-accent-emerald/5',
  }
  return (
    <div className={`rounded-xl border p-3 flex flex-col justify-between ${colors[color]}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="opacity-70 flex items-center">{icon}</span>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className="font-display font-bold text-lg leading-tight mt-1">{value}</p>
    </div>
  )
}

export default function ProgressPanel({ progress, recentLessons, savedSnippets, removeSnippet, userName, setUserName, setWelcomed }) {
  const level = Math.floor(progress.xp / 100) + 1
  const xpInLevel = progress.xp % 100
  const completedCount = progress.completedTopics.length
  const totalTopics = TOPICS.length

  const formatTime = (ts) => {
    if (!ts) return ''
    const diff = Date.now() - ts
    if (diff < 60000) return 'just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return `${Math.floor(diff / 86400000)}d ago`
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Level & XP */}
        <div className="glass rounded-xl p-4 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-slate-400 font-semibold mb-0.5">{userName || 'Learner'}</p>
              <p className="font-display font-bold text-2xl text-white">Level {level}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-cyan/20 to-accent-violet/20 border border-accent-cyan/20 flex items-center justify-center">
              <Star size={20} className="text-accent-cyan" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">XP Progress</span>
              <span className="text-accent-cyan font-mono">{xpInLevel}/100</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpInLevel}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-accent-cyan to-accent-violet rounded-full"
              />
            </div>
            <p className="text-[10px] text-slate-600">{100 - xpInLevel} XP to Level {level + 1}</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          <StatCard icon={<Flame size={13} />} label="Streak" value={`${progress.streak}d`} color="amber" />
          <StatCard icon={<Star size={13} />} label="Total XP" value={progress.xp} color="cyan" />
          <StatCard icon={<CheckCircle2 size={13} />} label="Completed" value={`${completedCount}/${totalTopics}`} color="emerald" />
          <StatCard icon={<Save size={13} />} label="Saved" value={savedSnippets.length} color="violet" />
        </div>

        {/* Completed topics */}
        {completedCount > 0 && (
          <div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Completed Topics</p>
            <div className="flex flex-wrap gap-1.5">
              {progress.completedTopics.map(topicId => {
                const topic = TOPICS.find(t => t.id === topicId)
                return topic ? (
                  <span
                    key={topicId}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20"
                  >
                    {topic.icon} {topic.label}
                  </span>
                ) : null
              })}
            </div>
          </div>
        )}

        {/* Recent lessons */}
        {recentLessons.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-1">
              <Clock size={10} /> Recent
            </p>
            <div className="space-y-1.5">
              {recentLessons.slice(0, 5).map((lesson, i) => {
                const lang = getLanguageById(lesson.language)
                return (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/3 border border-white/5">
                    <span>{lang.icon}</span>
                    <span className="text-xs text-slate-300 flex-1 truncate">{lesson.label}</span>
                    <span className="text-[10px] text-slate-600">{formatTime(lesson.visitedAt)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Saved snippets */}
        {savedSnippets.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-1">
              <Code2 size={10} /> Saved Snippets
            </p>
            <div className="space-y-1.5">
              {savedSnippets.map((snippet) => {
                const lang = getLanguageById(snippet.language)
                return (
                  <div key={snippet.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/3 border border-white/5 group">
                    <span>{lang.icon}</span>
                    <span className="text-xs text-slate-300 flex-1 truncate">{snippet.title}</span>
                    <button
                      onClick={() => removeSnippet(snippet.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-accent-rose transition-all"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {completedCount === 0 && recentLessons.length === 0 && (
          <div className="text-center py-6">
            <BookOpen size={24} className="text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-600">Start learning to track your progress!</p>
          </div>
        )}

        {/* Profile Settings / Onboarding Reset */}
        <div className="border-t border-white/5 pt-4 mt-6 flex justify-between items-center bg-black/5 p-3 rounded-xl border border-white/5">
          <div>
            <p className="text-[11px] font-semibold text-slate-400">Profile & Onboarding</p>
            <p className="text-[9px] text-slate-500 mt-0.5">Want to redo the entry steps or change name?</p>
          </div>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset your profile and redo the entry steps?')) {
                setWelcomed(false)
                setUserName('')
              }
            }}
            className="px-3 py-1.5 rounded-lg text-[10px] font-semibold text-accent-cyan border border-accent-cyan/20 bg-accent-cyan/5 hover:bg-accent-cyan/10 transition-all cursor-pointer"
          >
            Reset Profile
          </button>
        </div>
      </div>
    </div>
  )
}
