// src/components/AI/FloatingChat.jsx
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, MessageSquare } from 'lucide-react'
import ChatPanel from './ChatPanel'

export default function FloatingChat({ chatHistory, addChatMessage, clearChat, currentCode, language, mode }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Floating button — only visible on mobile */}
      <div className="md:hidden fixed bottom-6 right-4 z-50">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="absolute bottom-16 right-0 w-80 h-[480px] glass-strong rounded-2xl border border-accent-cyan/15 overflow-hidden shadow-2xl"
              style={{ boxShadow: '0 0 60px rgba(34,211,238,0.1), 0 25px 50px rgba(0,0,0,0.5)' }}
            >
              <ChatPanel
                chatHistory={chatHistory}
                addChatMessage={addChatMessage}
                clearChat={clearChat}
                currentCode={currentCode}
                language={language}
                mode={mode}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(!open)}
          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #22d3ee22, #8b5cf622)',
            border: '1px solid rgba(34,211,238,0.3)',
            boxShadow: '0 0 20px rgba(34,211,238,0.2)',
          }}
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X size={18} className="text-accent-cyan" />
              </motion.div>
            ) : (
              <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                <MessageSquare size={18} className="text-accent-cyan" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  )
}
