// src/components/Lessons/LearnPanel.jsx
import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Sparkles, RefreshCw, Trophy, Star, CheckCircle, XCircle, ChevronRight, Clock, Zap } from 'lucide-react'
import { TOPICS, LANGUAGES, getLanguageById } from '../../utils/languages'
import { generateLesson, generateQuiz } from '../../services/groqService'
import MarkdownRenderer from '../MarkdownRenderer'

function TopicCard({ topic, completed, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="lesson-card rounded-xl p-3 text-left w-full group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{topic.icon}</span>
          <span className="text-sm text-slate-300 group-hover:text-white transition-colors font-medium">
            {topic.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {completed ? (
            <CheckCircle size={14} className="text-accent-emerald" />
          ) : (
            <ChevronRight size={13} className="text-slate-600 group-hover:text-accent-cyan transition-colors" />
          )}
        </div>
      </div>
    </motion.button>
  )
}

function QuizCard({ quiz, onComplete }) {
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (selected === null) return
    setSubmitted(true)
    if (selected === quiz.correct) onComplete(true)
    else onComplete(false)
  }

  return (
    <div className="glass rounded-xl p-4 border border-white/5">
      <p className="text-sm text-slate-200 mb-3 font-medium">{quiz.question}</p>
      <div className="grid gap-2">
        {quiz.options.map((opt, i) => {
          let cls = 'border border-white/8 bg-white/3 hover:border-accent-cyan/30 hover:bg-accent-cyan/5'
          if (submitted) {
            if (i === quiz.correct) cls = 'border-accent-emerald/50 bg-accent-emerald/10'
            else if (i === selected) cls = 'border-accent-rose/50 bg-accent-rose/10'
            else cls = 'border-white/5 opacity-50'
          } else if (selected === i) {
            cls = 'border-accent-cyan/40 bg-accent-cyan/10'
          }
          return (
            <button
              key={i}
              onClick={() => !submitted && setSelected(i)}
              className={`text-left text-xs px-3 py-2.5 rounded-lg transition-all ${cls}`}
            >
              <span className="text-accent-cyan mr-2 font-mono">{String.fromCharCode(65+i)}.</span>
              <span className="text-slate-300">{opt}</span>
            </button>
          )
        })}
      </div>
      {submitted ? (
        <div className="mt-3 text-xs text-slate-400 bg-white/3 rounded-lg p-2">
          <span className="text-accent-cyan">💡</span> {quiz.explanation}
        </div>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={selected === null}
          className="mt-3 w-full py-2 text-xs font-medium rounded-lg bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 hover:bg-accent-cyan/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Submit Answer
        </button>
      )}
    </div>
  )
}

export default function LearnPanel({ language, setLanguage, mode, onTopicSelect, progress, addXP, completeTopric, addRecentLesson, searchQuery, clearSearch }) {
  const [lesson, setLesson] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingQuiz, setLoadingQuiz] = useState(false)
  const [activeTopic, setActiveTopic] = useState(null)
  const [view, setView] = useState('topics') // topics | lesson | quiz
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 })
  const [completedQuiz, setCompletedQuiz] = useState(false)
  const [error, setError] = useState(null)

  const loadLesson = useCallback(async (topicId, topicLabel) => {
    setLoading(true)
    setError(null)
    setLesson(null)
    setQuiz(null)
    setActiveTopic({ id: topicId, label: topicLabel })
    setView('lesson')
    setCompletedQuiz(false)
    setQuizScore({ correct: 0, total: 0 })

    try {
      const lang = getLanguageById(language)
      const content = await generateLesson({ concept: topicLabel, language: lang.name, mode })
      setLesson(content)
      addRecentLesson({ id: topicId, label: topicLabel, language, timestamp: Date.now() })
      addXP(10)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [language, mode, addXP, addRecentLesson])

  // Handle external search
  React.useEffect(() => {
    if (searchQuery) {
      loadLesson(searchQuery, searchQuery)
      clearSearch()
    }
  }, [searchQuery])

  const loadQuiz = async () => {
    setLoadingQuiz(true)
    setView('quiz')
    setQuizScore({ correct: 0, total: 0 })
    setCompletedQuiz(false)
    try {
      const lang = getLanguageById(language)
      const questions = await generateQuiz({ concept: activeTopic.label, language: lang.name, mode })
      setQuiz(questions)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoadingQuiz(false)
    }
  }

  const handleQuizAnswer = (correct) => {
    setQuizScore(s => {
      const newScore = { correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }
      if (newScore.total === quiz.length) {
        setCompletedQuiz(true)
        const xpEarned = newScore.correct * 20
        addXP(xpEarned)
        if (newScore.correct === quiz.length) completeTopric(activeTopic.id)
      }
      return newScore
    })
  }

  const lang = getLanguageById(language)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-accent-cyan" />
            <span className="font-display font-semibold text-sm text-white">
              {view === 'topics' ? 'Topics' : view === 'quiz' ? 'Quiz' : activeTopic?.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {view !== 'topics' && (
              <button
                onClick={() => setView('topics')}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                ← Back
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {view === 'topics' && (
            <motion.div
              key="topics"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-2"
            >
              <p className="text-xs text-slate-500 mb-2">Choose a topic to start learning</p>
              {TOPICS.map(topic => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  completed={progress.completedTopics.includes(topic.id)}
                  onClick={() => loadLesson(topic.id, topic.label)}
                />
              ))}
            </motion.div>
          )}

          {view === 'lesson' && (
            <motion.div
              key="lesson"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-8 h-8 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
                  <p className="text-xs text-slate-500">Preparing lesson content...</p>
                </div>
              ) : error ? (
                <div className="glass rounded-xl p-4 border border-accent-rose/20">
                  <p className="text-xs text-accent-rose mb-2">⚠️ {error}</p>
                  <button onClick={() => loadLesson(activeTopic.id, activeTopic.label)}
                    className="text-xs text-accent-cyan hover:underline">Try again</button>
                </div>
              ) : lesson ? (
                <div>
                  <MarkdownRenderer content={lesson} />
                  <div className="mt-6 flex gap-2">
                    <button
                      onClick={loadQuiz}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-violet/10 text-accent-violet border border-accent-violet/20 text-xs font-medium hover:bg-accent-violet/20 transition-all"
                    >
                      <Trophy size={13} /> Take Quiz
                    </button>
                    <button
                      onClick={() => loadLesson(activeTopic.id, activeTopic.label)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 border border-white/8 text-xs transition-all"
                    >
                      <RefreshCw size={12} /> Reload
                    </button>
                  </div>
                </div>
              ) : null}
            </motion.div>
          )}

          {view === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {loadingQuiz ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-8 h-8 border-2 border-accent-violet/30 border-t-accent-violet rounded-full animate-spin" />
                  <p className="text-xs text-slate-500">Generating quiz questions...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {!completedQuiz && quiz && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-500">
                        {quizScore.total}/{quiz.length} answered
                      </span>
                      <span className="text-xs text-accent-emerald">
                        {quizScore.correct} correct
                      </span>
                    </div>
                  )}
                  {completedQuiz ? (
                    <div className="glass rounded-xl p-6 text-center border border-accent-violet/20">
                      <div className="text-4xl mb-2">
                        {quizScore.correct === quiz.length ? '🏆' : quizScore.correct >= quiz.length / 2 ? '⭐' : '📚'}
                      </div>
                      <h3 className="font-display font-bold text-white mb-1">
                        {quizScore.correct}/{quiz.length} Correct
                      </h3>
                      <p className="text-xs text-slate-400 mb-4">
                        +{quizScore.correct * 20} XP earned!
                      </p>
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => setView('lesson')}
                          className="px-3 py-2 text-xs rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 transition-all">
                          Review Lesson
                        </button>
                        <button onClick={loadQuiz}
                          className="px-3 py-2 text-xs rounded-lg bg-accent-violet/10 text-accent-violet border border-accent-violet/20 hover:bg-accent-violet/20 transition-all">
                          Retry Quiz
                        </button>
                      </div>
                    </div>
                  ) : (
                    quiz?.map((q, i) => (
                      quizScore.total <= i && (
                        <QuizCard key={q.id || i} quiz={q} onComplete={handleQuizAnswer} />
                      )
                    ))
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
