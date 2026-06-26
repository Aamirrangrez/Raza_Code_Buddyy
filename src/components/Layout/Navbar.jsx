// src/components/Layout/Navbar.jsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Zap, BookOpen, Code2, MessageSquare, Search, Trophy, Menu, X, Flame,
  Braces, BarChart3, Sun, Moon, ChevronDown
} from 'lucide-react'
import { LEARNING_MODES } from '../../utils/languages'

export default function Navbar({
  theme, setTheme, mode, setMode, userName, activeTab, setActiveTab, progress, onSearch,
  mobileOpen, setMobileOpen
}) {
  const [levelDropdownOpen, setLevelDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const tabs = [
    { id: 'language', label: 'Language', icon: Braces },
    { id: 'learn', label: 'Learn', icon: BookOpen },
    { id: 'ide', label: 'IDE', icon: Code2 },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'interview', label: 'Interview', icon: Trophy },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
  ]

  const level = Math.floor(progress.xp / 100) + 1
  const xpToNext = (level * 100) - progress.xp
  const currentModeObj = LEARNING_MODES.find(m => m.id === mode) || LEARNING_MODES[0]

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim())
      setSearchQuery('')
    }
  }

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass-strong fixed top-0 left-0 right-0 z-50 h-14"
    >
      <div className="flex items-center h-full px-4 gap-3 justify-between">
        {/* Left Side: Logo & Search */}
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-violet flex items-center justify-center flex-shrink-0">
              <Zap size={14} className="text-white" />
            </div>
            <div className="flex flex-col justify-center leading-tight">
              <span className="font-display font-bold text-sm text-white flex items-center gap-0.5">
                RazaCode<span className="neon-cyan">Buddy</span>
              </span>
              <span className="text-[9px] text-slate-500 font-medium whitespace-nowrap">
                designed & developed by{' '}
                <a
                  href="https://amirrangrez.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-cyan hover:text-accent-violet transition-all"
                >
                  Amir Rangrez
                </a>
              </span>
            </div>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-grow max-w-xs ml-2 hidden sm:flex">
            <div className="relative w-full">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search concepts..."
                className="w-full bg-white/5 border border-white/8 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-accent-cyan/30 focus:bg-accent-cyan/5 transition-all"
              />
            </div>
          </form>
        </div>

        {/* Right Side: Greeting, Level Selector, Theme Toggle, XP, Hamburger */}
        <div className="flex items-center gap-3">
          {/* User Name Greeting (desktop) */}
          {userName && (
            <span className="text-xs text-slate-400 font-medium hidden lg:inline-block mr-1">
              Hello, <span className="shimmer-text font-bold">{userName}</span>!
            </span>
          )}


          {/* XP & Streak (desktop) */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-amber-500 font-medium">
              <Flame size={12} className="animate-pulse" />
              <span>{progress.streak}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent-cyan to-accent-violet rounded-full transition-all duration-500"
                  style={{ width: `${(progress.xp % 100)}%` }}
                />
              </div>
              <span className="text-slate-400">Lv{level}</span>
            </div>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 text-slate-400 hover:text-slate-200 transition-all flex items-center justify-center"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 border border-white/5 bg-white/3 hover:bg-white/5 hover:text-white"
          >
            {mobileOpen ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop Blur Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 top-14 mobile-overlay-blur z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile dropdown */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-14 left-0 right-0 md:hidden mobile-dropdown-menu border-t border-white/5 p-3 flex flex-col gap-2 z-50 shadow-2xl"
        >
          {/* User Profile Greeting in mobile dropdown */}
          {userName && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/3 border border-white/5 mb-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-cyan/20 to-accent-violet/20 border border-accent-cyan/30 flex items-center justify-center font-display font-bold text-sm text-accent-cyan">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-500 leading-none">Welcome back,</p>
                <p className="text-xs font-semibold text-white mt-1 truncate">{userName}</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-amber-500 font-medium bg-amber-500/5 px-2 py-1 rounded-lg border border-amber-500/10">
                <Flame size={10} className="animate-pulse" />
                <span>{progress.streak}d</span>
              </div>
            </div>
          )}

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="w-full mb-1">
            <div className="relative w-full">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search concepts..."
                className="w-full bg-white/5 border border-white/8 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-accent-cyan/30 focus:bg-accent-cyan/5 transition-all"
              />
            </div>
          </form>

          {/* Mobile Navigation Tabs */}
          <div className="grid grid-cols-2 gap-1.5">
            {tabs.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMobileOpen(false) }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs transition-all ${
                    isActive
                      ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 font-medium'
                      : 'text-slate-400 bg-white/3 border border-white/5 hover:bg-white/5'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              )
            })}
          </div>


        </motion.div>
      )}
    </motion.nav>
  )
}
