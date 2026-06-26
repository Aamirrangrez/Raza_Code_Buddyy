// src/App.jsx
import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Braces, BookOpen, Code2, MessageSquare, Trophy, BarChart3, ChevronLeft, ChevronRight, Eye } from 'lucide-react'

import { useStore } from './store/useStore'
import Navbar from './components/Layout/Navbar'
import SplitPanel from './components/Layout/SplitPanel'
import WelcomeScreen from './components/Layout/WelcomeScreen'
import SearchOverlay from './components/Layout/SearchOverlay'
import LanguagePanel from './components/Lessons/LanguagePanel'
import LearnPanel from './components/Lessons/LearnPanel'
import EditorPanel from './components/IDE/EditorPanel'
import ChatPanel from './components/AI/ChatPanel'
import InterviewPanel from './components/Lessons/InterviewPanel'
import ProgressPanel from './components/Progress/ProgressPanel'
import VisualExecutor from './components/Visual/VisualExecutor'

const LEFT_TABS = [
  { id: 'language', icon: Braces, label: 'Language' },
  { id: 'learn', icon: BookOpen, label: 'Learn' },
  { id: 'chat', icon: MessageSquare, label: 'Chat' },
  { id: 'interview', icon: Trophy, label: 'Interview' },
  { id: 'progress', icon: BarChart3, label: 'Progress' },
]

const RIGHT_TABS = [
  { id: 'editor', icon: Code2, label: 'Editor' },
  { id: 'visual', icon: Eye, label: 'Visual' },
]

function VerticalTabBar({ tabs, active, setActive }) {
  return (
    <div className="flex flex-col gap-1 p-2">
      {tabs.map(tab => {
        const Icon = tab.icon
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            title={tab.label}
            className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg w-full transition-all duration-200 ${isActive
              ? 'bg-accent-cyan/10 text-accent-cyan'
              : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
          >
            <Icon size={16} />
            <span className="text-[9px] leading-none">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default function App() {
  const store = useStore()
  const [language, setLanguage] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('language')
  const [leftTab, setLeftTab] = useState('language')
  const [rightTab, setRightTab] = useState('editor')
  const [searchOverlay, setSearchOverlay] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [currentCode, setCurrentCode] = useState('')

  const handleCodeChange = useCallback((code) => setCurrentCode(code), [])

  const handleSearch = (query) => {
    setSearchQuery(query)
    setSearchOverlay(true)
  }

  const handleWelcomeDone = () => {
    store.setWelcomed(true)
  }

  const handleNavTabChange = (tab) => {
    setActiveTab(tab)
    if (tab === 'language') setLeftTab('language')
    else if (tab === 'learn') setLeftTab('learn')
    else if (tab === 'chat') setLeftTab('chat')
    else if (tab === 'interview') setLeftTab('interview')
    else if (tab === 'progress') setLeftTab('progress')
    else if (tab === 'ide') setRightTab('editor')
  }

  const renderLeftPanel = () => {
    if (!language && leftTab !== 'language' && leftTab !== 'progress') {
      return (
        <LanguageRequiredPlaceholder
          setLeftTab={setLeftTab}
          setMobileOpen={setMobileOpen}
          setActiveTab={setActiveTab}
        />
      )
    }
    switch (leftTab) {
      case 'language':
        return (
          <LanguagePanel
            language={language}
            setLanguage={(lang) => {
              setLanguage(lang)
              if (window.innerWidth < 768) {
                setMobileOpen(true)
              }
            }}
          />
        )
      case 'learn':
        return (
          <LearnPanel
            language={language}
            setLanguage={setLanguage}
            mode={store.mode}
            progress={store.progress}
            addXP={store.addXP}
            completeTopric={store.completeTopric}
            addRecentLesson={store.addRecentLesson}
            searchQuery={''}
            clearSearch={() => { }}
            onTopicSelect={() => { }}
          />
        )
      case 'chat':
        return (
          <ChatPanel
            chatHistory={store.chatHistory}
            addChatMessage={store.addChatMessage}
            clearChat={store.clearChat}
            currentCode={currentCode}
            language={language}
            mode={store.mode}
          />
        )
      case 'interview':
        return (
          <InterviewPanel
            language={language}
            setLanguage={setLanguage}
            mode={store.mode}
          />
        )
      case 'progress':
        return (
          <ProgressPanel
            progress={store.progress}
            recentLessons={store.recentLessons}
            savedSnippets={store.savedSnippets}
            removeSnippet={store.removeSnippet}
            userName={store.userName}
            setUserName={store.setUserName}
            setWelcomed={store.setWelcomed}
          />
        )
      default:
        return null
    }
  }

  const renderRightPanel = () => {
    if (!language) {
      return (
        <LanguageRequiredPlaceholder
          setLeftTab={setLeftTab}
          setMobileOpen={setMobileOpen}
          setActiveTab={setActiveTab}
        />
      )
    }
    switch (rightTab) {
      case 'editor':
        return (
          <EditorPanel
            language={language}
            setLanguage={setLanguage}
            savedSnippets={store.savedSnippets}
            saveSnippet={store.saveSnippet}
            mode={store.mode}
            theme={store.theme}
          />
        )
      case 'visual':
        return <VisualExecutor code={currentCode} language={language} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen mesh-bg dark">

      {/* Welcome screen */}
      <AnimatePresence>
        {!store.welcomed && (
          <WelcomeScreen
            onStart={handleWelcomeDone}
            setMode={store.setMode}
            setUserName={store.setUserName}
          />
        )}
      </AnimatePresence>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOverlay && (
          <SearchOverlay
            initialQuery={searchQuery}
            language={language}
            mode={store.mode}
            onClose={() => setSearchOverlay(false)}
          />
        )}
      </AnimatePresence>

      <Navbar
        theme={store.theme}
        setTheme={store.setTheme}
        mode={store.mode}
        setMode={store.setMode}
        userName={store.userName}
        activeTab={activeTab}
        setActiveTab={handleNavTabChange}
        progress={store.progress}
        onSearch={handleSearch}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Desktop layout */}
      <div className="flex h-screen pt-14 overflow-hidden">
        {/* Left icon sidebar */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex-shrink-0 hidden md:flex flex-col w-14 glass-strong border-r border-white/5 z-10"
        >
          <VerticalTabBar
            tabs={LEFT_TABS}
            active={leftTab}
            setActive={(tabId) => {
              setLeftTab(tabId)
              setLeftCollapsed(false)
            }}
          />
          <div className="flex-1" />
          <button
            onClick={() => setLeftCollapsed(!leftCollapsed)}
            className="m-2 p-2 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-all flex items-center justify-center"
            title={leftCollapsed ? 'Expand panel' : 'Collapse panel'}
          >
            {leftCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </motion.div>

        {/* Main split view - desktop */}
        <div className="flex-1 hidden md:block overflow-hidden">
          <SplitPanel
            defaultSplit={leftCollapsed ? 0 : 50}
            minLeft={leftCollapsed ? 0 : 20}
            maxLeft={leftCollapsed ? 0 : 80}
            resizable={!leftCollapsed}
            left={
              leftCollapsed ? (
                <div className="h-full w-0 overflow-hidden" />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full glass border-r border-white/5 flex flex-col overflow-hidden"
                >
                  <div className="flex-grow min-h-0 overflow-y-auto">
                    {renderLeftPanel()}
                  </div>
                  <div className="flex-shrink-0 p-2.5 border-t border-white/5 text-center bg-black/10">
                    <a
                      href="https://amirrangrez.netlify.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-slate-500 hover:text-accent-cyan transition-all font-medium"
                    >
                      Designed & developed by Amir Rangrez
                    </a>
                  </div>
                </motion.div>
              )
            }
            right={
              <div className="h-full flex flex-col">
                {/* Right tab bar */}
                <div className="flex-shrink-0 flex items-center gap-1 px-3 py-2 border-b border-white/5 bg-surface/50">
                  {RIGHT_TABS.map(tab => {
                    const Icon = tab.icon
                    const isActive = rightTab === tab.id
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setRightTab(tab.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${isActive
                          ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20'
                          : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
                          }`}
                      >
                        <Icon size={12} />
                        {tab.label}
                      </button>
                    )
                  })}
                </div>
                <div className="flex-1 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={rightTab}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="h-full"
                    >
                      {renderRightPanel()}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            }
          />
        </div>

        {/* Mobile view */}
        <div className="flex-1 md:hidden overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full flex flex-col"
            >
              {activeTab === 'ide' ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Mobile sub-tabs for IDE */}
                  <div className="flex-shrink-0 flex items-center justify-center gap-1 px-3 py-1.5 border-b border-white/5 bg-surface/30">
                    {RIGHT_TABS.map(tab => {
                      const Icon = tab.icon
                      const isActive = rightTab === tab.id
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setRightTab(tab.id)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded-md text-xs transition-all ${isActive
                            ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 font-medium'
                            : 'text-slate-500 hover:text-slate-200'
                            }`}
                        >
                          <Icon size={12} />
                          {tab.label}
                        </button>
                      )
                    })}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    {renderRightPanel()}
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-hidden">
                  {renderLeftPanel()}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>



      {/* Code context tracker */}
      <CodeTracker language={language} onCodeUpdate={handleCodeChange} />
    </div>
  )
}

function CodeTracker({ language, onCodeUpdate }) {
  React.useEffect(() => {
    const read = () => {
      const c = localStorage.getItem(`nc_code_${language}`) || ''
      onCodeUpdate(c)
    }
    read()
    const id = setInterval(read, 2000)
    return () => clearInterval(id)
  }, [language, onCodeUpdate])
  return null
}

function LanguageRequiredPlaceholder({ setLeftTab, setMobileOpen, setActiveTab }) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto">
      <div className="w-12 h-12 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center mb-4 text-accent-cyan animate-pulse">
        <Braces size={22} />
      </div>
      <h3 className="font-display font-semibold text-sm text-white mb-2">No Language Selected</h3>
      <p className="text-xs text-slate-500 mb-6 leading-relaxed">
        Select a programming language first to customize your coding workspace, lessons, and AI compiler tools.
      </p>
      <button
        onClick={() => {
          setLeftTab('language')
          setActiveTab('language')
          if (window.innerWidth < 768) {
            setMobileOpen(false)
          }
        }}
        className="px-4 py-2 text-xs font-semibold rounded-lg bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 hover:bg-accent-cyan/20 transition-all cursor-pointer"
      >
        Choose Language
      </button>
    </div>
  )
}
