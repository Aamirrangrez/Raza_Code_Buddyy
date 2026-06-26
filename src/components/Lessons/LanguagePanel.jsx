// src/components/Lessons/LanguagePanel.jsx
import React from 'react'
import { motion } from 'framer-motion'
import { Braces, CheckCircle2 } from 'lucide-react'
import { LANGUAGES, STARTER_CODE } from '../../utils/languages'

export default function LanguagePanel({ language, setLanguage }) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Braces size={16} className="text-accent-cyan" />
          <span className="font-display font-semibold text-sm text-white">Select Language</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          Choose your primary programming language for lessons and compiling code.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 gap-2">
          {LANGUAGES.map((lang) => {
            const isSelected = language === lang.id
            return (
              <motion.button
                key={lang.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  localStorage.setItem(`nc_code_${lang.id}`, STARTER_CODE[lang.id] || '')
                  setLanguage(lang.id)
                }}
                className={`lesson-card rounded-xl p-3.5 text-left w-full flex items-center justify-between border transition-all ${
                  isSelected
                    ? 'border-accent-cyan/30 bg-accent-cyan/5 text-white'
                    : 'border-white/5 bg-white/2 hover:bg-white/5 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl flex-shrink-0">{lang.icon}</div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-200">
                      {lang.name}
                    </span>
                    <span className="text-[10px] text-slate-500 capitalize">
                      {lang.id === 'cpp' ? 'C++' : lang.id} environment
                    </span>
                  </div>
                </div>
                {isSelected && (
                  <CheckCircle2 size={15} className="text-accent-cyan flex-shrink-0" />
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
