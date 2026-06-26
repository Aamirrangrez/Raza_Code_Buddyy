// src/components/AI/ChatPanel.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, Trash2, Copy, RotateCcw, Bot, User, Loader2 } from 'lucide-react'
import { chatWithAI } from '../../services/groqService'
import MarkdownRenderer from '../MarkdownRenderer'

const QUICK_PROMPTS = [
  'Explain this code to me',
  'What is a loop?',
  'How do functions work?',
  'Debug my code',
  'Give me a practice problem',
  'What are arrays?',
  'Explain recursion simply',
  'How to handle errors?',
]

function ChatMessage({ message }) {
  const isAI = message.role === 'assistant'
  const [copied, setCopied] = useState(false)

  const copyContent = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2.5 ${isAI ? '' : 'flex-row-reverse'}`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
        isAI
          ? 'bg-gradient-to-br from-accent-cyan/20 to-accent-violet/20 border border-accent-cyan/20'
          : 'bg-white/5 border border-white/10'
      }`}>
        {isAI ? <Sparkles size={12} className="text-accent-cyan" /> : <User size={12} className="text-slate-400" />}
      </div>

      {/* Bubble */}
      <div className={`flex-1 max-w-[85%] ${isAI ? '' : 'flex flex-col items-end'}`}>
        <div className={`rounded-2xl px-3 py-2.5 text-xs leading-relaxed ${
          isAI
            ? 'bg-white/4 border border-white/6 rounded-tl-sm'
            : 'bg-accent-cyan/10 border border-accent-cyan/15 rounded-tr-sm'
        }`}>
          {isAI ? (
            <MarkdownRenderer content={message.content} />
          ) : (
            <p className="text-slate-200">{message.content}</p>
          )}
        </div>
        {isAI && (
          <button
            onClick={copyContent}
            className="mt-1 flex items-center gap-1 text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
          >
            <Copy size={9} />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
      </div>
    </motion.div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-cyan/20 to-accent-violet/20 border border-accent-cyan/20 flex items-center justify-center flex-shrink-0">
        <Sparkles size={12} className="text-accent-cyan" />
      </div>
      <div className="bg-white/4 border border-white/6 rounded-2xl rounded-tl-sm px-3 py-2.5">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-accent-cyan/50"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ChatPanel({ chatHistory, addChatMessage, clearChat, currentCode, language, mode }) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [localMessages, setLocalMessages] = useState(chatHistory)
  const endRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [localMessages, loading])

  const sendMessage = useCallback(async (content) => {
    const userMsg = content || input.trim()
    if (!userMsg || loading) return
    setInput('')

    const userMessage = { role: 'user', content: userMsg }
    const newMessages = [...localMessages, userMessage]
    setLocalMessages(newMessages)
    addChatMessage(userMessage)
    setLoading(true)

    try {
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }))
      const response = await chatWithAI({
        messages: apiMessages,
        currentCode,
        language,
        mode,
      })

      const aiMessage = { role: 'assistant', content: response }
      setLocalMessages(prev => [...prev, aiMessage])
      addChatMessage(aiMessage)
    } catch (e) {
      const errMsg = { role: 'assistant', content: `⚠️ Error: ${e.message}\n\nMake sure your GROQ API key is configured.` }
      setLocalMessages(prev => [...prev, errMsg])
    } finally {
      setLoading(false)
    }
  }, [input, loading, localMessages, currentCode, language, mode, addChatMessage])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleClear = () => {
    setLocalMessages([])
    clearChat()
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-accent-cyan/20 to-accent-violet/20 border border-accent-cyan/20 flex items-center justify-center">
            <Sparkles size={11} className="text-accent-cyan" />
          </div>
          <span className="text-sm font-display font-semibold text-white">Coding Mentor</span>
          <div className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
        </div>
        <button
          onClick={handleClear}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
          title="Clear chat"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {localMessages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-cyan/20 to-accent-violet/20 border border-accent-cyan/20 flex items-center justify-center mx-auto mb-3">
              <Sparkles size={20} className="text-accent-cyan" />
            </div>
            <h3 className="font-display font-semibold text-white text-sm mb-1">Interactive Coding Mentor</h3>
            <p className="text-xs text-slate-500 mb-4">Ask me anything about programming!</p>

            {/* Quick prompts */}
            <div className="grid grid-cols-2 gap-1.5">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(prompt)}
                  className="text-left text-xs px-2.5 py-2 rounded-lg bg-white/4 border border-white/6 text-slate-400 hover:text-slate-200 hover:border-accent-cyan/20 hover:bg-accent-cyan/5 transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {localMessages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}

        {loading && <TypingIndicator />}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-3 border-t chat-input-area">
        <div className="chat-input-unified">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            rows={1}
            className="flex-1 chat-textarea-unified px-3 py-2.5 text-xs transition-all resize-none max-h-28 overflow-y-auto outline-none"
            style={{ minHeight: '38px' }}
            onInput={e => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 112) + 'px'
            }}
          />
          <div className="chat-input-separator" />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-10 h-10 flex items-center justify-center chat-send-btn-unified flex-shrink-0"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <p className="chat-helper-text">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
