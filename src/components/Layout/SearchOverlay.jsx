// src/components/Layout/SearchOverlay.jsx
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Loader2, Zap, BookOpen, Code2 } from 'lucide-react'
import { searchConcept } from '../../services/groqService'
import MarkdownRenderer from '../MarkdownRenderer'
import { LANGUAGES, getLanguageById } from '../../utils/languages'

const SUGGESTIONS = [
  'Python loops', 'What is recursion', 'JavaScript arrays',
  'C pointers', 'How functions work', 'Sorting algorithms',
  'Error handling', 'Object-oriented programming', 'Binary search',
]

export default function SearchOverlay({ initialQuery, language, mode, onClose }) {
  const [query, setQuery] = useState(initialQuery || '')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lang, setLang] = useState(language)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    if (initialQuery) doSearch(initialQuery)
  }, [])

  const doSearch = async (q) => {
    if (!q.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const content = await searchConcept({ query: q, language: getLanguageById(lang).name, mode })
      setResult(content)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    doSearch(query)
  }

  const handleKey = (e) => {
    if (e.key === 'Escape') onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4"
      style={{ background: 'rgba(3,7,18,0.85)', backdropFilter: 'blur(12px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={handleKey}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-2xl glass-strong rounded-2xl border border-white/8 overflow-hidden shadow-2xl"
      >
        {/* Search bar */}
        <form onSubmit={handleSubmit} className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
          <Search size={16} className="text-slate-500 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search any concept, error, or topic..."
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 focus:outline-none"
          />
          {/* Language filter */}
          <div className="flex gap-1 flex-shrink-0">
            {LANGUAGES.map(l => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLang(l.id)}
                className={`text-xs px-2 py-1 rounded-lg transition-all ${
                  lang === l.id
                    ? 'bg-accent-cyan/15 text-accent-cyan'
                    : 'text-slate-600 hover:text-slate-400'
                }`}
              >
                {l.icon}
              </button>
            ))}
          </div>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors ml-1">
            <X size={15} />
          </button>
        </form>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto">
          {!loading && !result && !error && (
            <div className="p-4">
              <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Suggestions</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setQuery(s); doSearch(s) }}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/4 border border-white/8 text-slate-400 hover:text-accent-cyan hover:border-accent-cyan/20 hover:bg-accent-cyan/5 transition-all"
                  >
                    <Zap size={10} />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-3 p-6 text-slate-500">
              <Loader2 size={16} className="animate-spin text-accent-cyan" />
              <span className="text-sm">AI is searching for "{query}"...</span>
            </div>
          )}

          {error && (
            <div className="p-4">
              <p className="text-xs text-accent-rose">⚠️ {error}</p>
            </div>
          )}

          {result && (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={13} className="text-accent-cyan" />
                <span className="text-xs text-accent-cyan font-medium">Result for "{query}"</span>
                <span className="text-xs text-slate-600">· {getLanguageById(lang).name}</span>
              </div>
              <MarkdownRenderer content={result} />

              {/* Try another */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-xs text-slate-500 mb-2">Related searches</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Examples', 'Practice problems', 'Common errors', 'Interview questions'].map(r => (
                    <button
                      key={r}
                      onClick={() => { const q2 = `${query} ${r}`; setQuery(q2); doSearch(q2) }}
                      className="text-xs px-2.5 py-1 rounded-lg bg-white/4 border border-white/8 text-slate-500 hover:text-accent-cyan hover:border-accent-cyan/20 transition-all"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
