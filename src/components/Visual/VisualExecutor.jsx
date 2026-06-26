// src/components/Visual/VisualExecutor.jsx
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, ChevronRight, Eye } from 'lucide-react'

function parseCodeSteps(code, language) {
  const lines = code.split('\n').filter(l => l.trim())
  const steps = []
  const variables = {}
  const callStack = []

  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*')) return

    const step = {
      lineIndex: idx,
      line: trimmed,
      variables: { ...variables },
      callStack: [...callStack],
      highlight: 'normal',
      description: '',
    }

    // Very basic heuristic analysis
    if (language === 'python' || language === 'javascript') {
      if (trimmed.includes('for ') || trimmed.includes('while ')) {
        step.highlight = 'loop'
        step.description = '🔄 Loop: iterating...'
        callStack.push('loop')
      } else if (trimmed.includes('def ') || trimmed.includes('function ')) {
        step.highlight = 'function'
        const name = trimmed.match(/(?:def|function)\s+(\w+)/)?.[1] || 'func'
        step.description = `📦 Defining function: ${name}()`
        callStack.push(name)
      } else if (trimmed.includes('return')) {
        step.highlight = 'return'
        step.description = '↩️ Returning value'
        callStack.pop()
      } else if (trimmed.includes('=') && !trimmed.includes('==')) {
        const varName = trimmed.split('=')[0].trim().split(' ').pop()
        step.highlight = 'variable'
        step.description = `📌 Assigning variable: ${varName}`
        variables[varName] = '...'
      } else if (trimmed.includes('print') || trimmed.includes('console.log')) {
        step.highlight = 'output'
        step.description = '📤 Printing output'
      } else if (trimmed.includes('if ')) {
        step.highlight = 'condition'
        step.description = '🔀 Evaluating condition'
      }
    }

    step.variables = { ...variables }
    step.callStack = [...callStack]
    steps.push(step)
  })

  return steps
}

const HIGHLIGHT_COLORS = {
  normal: 'border-white/10 bg-white/2',
  loop: 'border-accent-amber/30 bg-accent-amber/5',
  function: 'border-accent-violet/30 bg-accent-violet/5',
  return: 'border-accent-emerald/30 bg-accent-emerald/5',
  variable: 'border-accent-cyan/30 bg-accent-cyan/5',
  output: 'border-accent-emerald/30 bg-accent-emerald/5',
  condition: 'border-accent-rose/30 bg-accent-rose/5',
}

export default function VisualExecutor({ code, language }) {
  const [steps, setSteps] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (code) {
      setSteps(parseCodeSteps(code, language))
      setCurrentStep(0)
      setPlaying(false)
    }
  }, [code, language])

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setCurrentStep(s => {
          if (s >= steps.length - 1) {
            setPlaying(false)
            return s
          }
          return s + 1
        })
      }, speed)
    }
    return () => clearInterval(intervalRef.current)
  }, [playing, steps.length, speed])

  const step = steps[currentStep]

  return (
    <div className="h-full flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <Eye size={14} className="text-accent-violet" />
        <span className="text-xs font-display font-semibold text-white">Visual Execution</span>
        <span className="text-xs text-slate-500 ml-1">{steps.length} steps</span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => { setCurrentStep(0); setPlaying(false) }}
          className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-slate-200 transition-all"
        >
          <RotateCcw size={12} />
        </button>
        <button
          onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
          className="px-2 py-1 rounded-lg bg-white/5 text-slate-400 hover:text-slate-200 text-xs transition-all"
        >
          ‹ Prev
        </button>
        <button
          onClick={() => setPlaying(!playing)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            playing
              ? 'bg-accent-rose/10 text-accent-rose border border-accent-rose/20'
              : 'bg-accent-violet/10 text-accent-violet border border-accent-violet/20'
          }`}
        >
          {playing ? <Pause size={11} /> : <Play size={11} />}
          {playing ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={() => setCurrentStep(s => Math.min(steps.length - 1, s + 1))}
          className="px-2 py-1 rounded-lg bg-white/5 text-slate-400 hover:text-slate-200 text-xs transition-all"
        >
          Next ›
        </button>
        <select
          value={speed}
          onChange={e => setSpeed(Number(e.target.value))}
          className="ml-auto speed-select border rounded-lg text-xs px-2 py-1 outline-none cursor-pointer"
        >
          <option value={2000}>Slow</option>
          <option value={1000}>Normal</option>
          <option value={500}>Fast</option>
        </select>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-accent-violet to-accent-cyan"
          animate={{ width: steps.length > 0 ? `${(currentStep / (steps.length - 1)) * 100}%` : '0%' }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Current step highlight */}
      {step && (
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl border p-3 ${HIGHLIGHT_COLORS[step.highlight] || HIGHLIGHT_COLORS.normal}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-slate-500">Line {step.lineIndex + 1}</span>
            {step.description && (
              <span className="text-xs text-slate-300">{step.description}</span>
            )}
          </div>
          <code className="text-xs font-mono text-cyan-200 block">{step.line}</code>
        </motion.div>
      )}

      {/* Variable tracker */}
      {step && Object.keys(step.variables).length > 0 && (
        <div>
          <p className="text-xs text-slate-500 mb-1.5">📦 Variables</p>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(step.variables).map(([k, v]) => (
              <div key={k} className="glass rounded-lg p-2 flex items-center justify-between">
                <span className="text-xs font-mono text-accent-cyan">{k}</span>
                <span className="text-xs font-mono text-slate-300">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call stack */}
      {step && step.callStack.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 mb-1.5">📚 Call Stack</p>
          <div className="flex flex-col-reverse gap-1">
            {step.callStack.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-lg px-3 py-1.5 text-xs font-mono text-slate-300 border border-white/5"
                style={{ marginLeft: `${i * 8}px` }}
              >
                {item}()
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Code overview */}
      <div className="flex-1 overflow-y-auto">
        <p className="text-xs text-slate-500 mb-1.5">📋 Code Flow</p>
        <div className="space-y-1">
          {steps.map((s, i) => (
            <button
              key={i}
              onClick={() => { setCurrentStep(i); setPlaying(false) }}
              className={`w-full text-left flex items-center gap-2 px-2 py-1 rounded-lg text-xs transition-all ${
                i === currentStep
                  ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20'
                  : i < currentStep
                  ? 'text-slate-500 bg-white/2'
                  : 'text-slate-600 hover:text-slate-400 hover:bg-white/3'
              }`}
            >
              <span className="w-5 text-right flex-shrink-0 font-mono">{s.lineIndex + 1}</span>
              <span className="truncate font-mono">{s.line}</span>
              {i < currentStep && <span className="ml-auto text-accent-emerald flex-shrink-0">✓</span>}
              {i === currentStep && <ChevronRight size={10} className="ml-auto flex-shrink-0 text-accent-cyan" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
