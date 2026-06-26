// src/store/useStore.js
import { useState, useEffect, useCallback } from 'react'

const DEFAULT_STATE = {
  theme: 'dark',
  mode: 'beginner',
  userName: '',
  welcomed: false,
  progress: {
    xp: 0,
    streak: 0,
    completedTopics: [],
    lastVisit: null,
  },
  recentLessons: [],
  savedSnippets: [],
  chatHistory: [],
  preferences: {
    fontSize: 14,
    autoRun: false,
    showLineNumbers: true,
    animationsEnabled: true,
  },
}

function loadFromStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(`nc_${key}`)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(`nc_${key}`, JSON.stringify(value))
  } catch {}
}

export function useStore() {
  const [theme, setThemeState] = useState(() => loadFromStorage('theme', 'dark'))
  const [mode, setModeState] = useState(() => loadFromStorage('mode', 'beginner'))
  const [userName, setUserNameState] = useState(() => loadFromStorage('userName', ''))
  const [welcomed, setWelcomedState] = useState(() => loadFromStorage('welcomed', false))
  const [progress, setProgressState] = useState(() => loadFromStorage('progress', DEFAULT_STATE.progress))
  const [recentLessons, setRecentLessonsState] = useState(() => loadFromStorage('recentLessons', []))
  const [savedSnippets, setSavedSnippetsState] = useState(() => loadFromStorage('savedSnippets', []))
  const [chatHistory, setChatHistoryState] = useState(() => loadFromStorage('chatHistory', []))
  const [preferences, setPreferencesState] = useState(() => loadFromStorage('preferences', DEFAULT_STATE.preferences))

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.classList.toggle('light', theme === 'light')
    saveToStorage('theme', theme)
  }, [theme])

  useEffect(() => { saveToStorage('mode', mode) }, [mode])
  useEffect(() => { saveToStorage('userName', userName) }, [userName])
  useEffect(() => { saveToStorage('welcomed', welcomed) }, [welcomed])
  useEffect(() => { saveToStorage('progress', progress) }, [progress])
  useEffect(() => { saveToStorage('recentLessons', recentLessons) }, [recentLessons])
  useEffect(() => { saveToStorage('savedSnippets', savedSnippets) }, [savedSnippets])
  useEffect(() => { saveToStorage('chatHistory', chatHistory) }, [chatHistory])
  useEffect(() => { saveToStorage('preferences', preferences) }, [preferences])

  // Streak tracking
  useEffect(() => {
    const today = new Date().toDateString()
    const last = progress.lastVisit
    if (last !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString()
      setProgressState(p => ({
        ...p,
        streak: last === yesterday ? p.streak + 1 : (last ? 0 : 1),
        lastVisit: today,
      }))
    }
  }, [])

  const setTheme = useCallback((t) => setThemeState(t), [])
  const setMode = useCallback((m) => setModeState(m), [])
  const setUserName = useCallback((n) => setUserNameState(n), [])
  const setWelcomed = useCallback((w) => setWelcomedState(w), [])

  const addXP = useCallback((amount) => {
    setProgressState(p => ({ ...p, xp: p.xp + amount }))
  }, [])

  const completeTopric = useCallback((topic) => {
    setProgressState(p => ({
      ...p,
      completedTopics: p.completedTopics.includes(topic) ? p.completedTopics : [...p.completedTopics, topic],
    }))
  }, [])

  const addRecentLesson = useCallback((lesson) => {
    setRecentLessonsState(prev => {
      const filtered = prev.filter(l => l.id !== lesson.id)
      return [{ ...lesson, visitedAt: Date.now() }, ...filtered].slice(0, 10)
    })
  }, [])

  const saveSnippet = useCallback((snippet) => {
    setSavedSnippetsState(prev => {
      const exists = prev.find(s => s.id === snippet.id)
      if (exists) return prev.map(s => s.id === snippet.id ? snippet : s)
      return [{ ...snippet, savedAt: Date.now() }, ...prev].slice(0, 20)
    })
  }, [])

  const removeSnippet = useCallback((id) => {
    setSavedSnippetsState(prev => prev.filter(s => s.id !== id))
  }, [])

  const addChatMessage = useCallback((message) => {
    setChatHistoryState(prev => [...prev, { ...message, id: Date.now(), timestamp: Date.now() }].slice(-100))
  }, [])

  const clearChat = useCallback(() => setChatHistoryState([]), [])

  const updatePreferences = useCallback((prefs) => {
    setPreferencesState(p => ({ ...p, ...prefs }))
  }, [])

  return {
    theme, setTheme,
    mode, setMode,
    userName, setUserName,
    welcomed, setWelcomed,
    progress, addXP, completeTopric,
    recentLessons, addRecentLesson,
    savedSnippets, saveSnippet, removeSnippet,
    chatHistory, addChatMessage, clearChat,
    preferences, updatePreferences,
  }
}
