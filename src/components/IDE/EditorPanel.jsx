// src/components/IDE/EditorPanel.jsx
import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Editor from '@monaco-editor/react'
import {
  Play, Copy, RotateCcw, Maximize2, Minimize2,
  CheckCircle, AlertCircle, Loader2, Save, Wand2,
  ChevronDown, Terminal, X, Clock, Check
} from 'lucide-react'
import { LANGUAGES, STARTER_CODE, getLanguageById } from '../../utils/languages'
import { executeCode } from '../../services/judge0Service'
import { explainError, optimizeCode } from '../../services/groqService'
import MarkdownRenderer from '../MarkdownRenderer'

const MONACO_THEME_DARK = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '4b5563', fontStyle: 'italic' },
    { token: 'keyword', foreground: '22d3ee' },
    { token: 'string', foreground: 'a5f3fc' },
    { token: 'number', foreground: 'f59e0b' },
    { token: 'type', foreground: '8b5cf6' },
    { token: 'function', foreground: '10b981' },
  ],
  colors: {
    'editor.background': '#030712',
    'editor.foreground': '#e2e8f0',
    'editor.lineHighlightBackground': '#ffffff06',
    'editor.selectionBackground': '#22d3ee20',
    'editorLineNumber.foreground': '#374151',
    'editorLineNumber.activeForeground': '#22d3ee',
    'editorCursor.foreground': '#22d3ee',
    'editor.findMatchBackground': '#22d3ee30',
    'editorGutter.background': '#030712',
    'scrollbarSlider.background': '#22d3ee15',
    'scrollbarSlider.hoverBackground': '#22d3ee25',
  }
}
function autoDetectLanguage(code) {
  if (!code) return null;
  // C++ specific
  if (code.includes('#include <iostream>') || code.includes('std::cout') || code.includes('using namespace std;')) return 'cpp';
  // C specific
  if (code.includes('#include <stdio.h>') || code.match(/\bprintf\s*\(/)) return 'c';
  // Java specific
  if (code.includes('public static void main') || code.includes('System.out.print')) return 'java';
  // Go specific
  if (code.match(/^package\s+main/m) || code.includes('fmt.Println')) return 'go';
  // Rust specific
  if (code.match(/\bfn\s+main\s*\(\)/) || code.includes('println!')) return 'rust';
  // PHP specific
  if (code.includes('<?php') || code.includes('echo ')) return 'php';
  // Ruby specific
  if (code.includes('puts ') || (code.match(/\bdef\s+\w+\b/) && code.includes('end'))) return 'ruby';
  // JavaScript specific
  if (code.includes('console.log') || code.includes('document.') || /\b(const|let|var|=>|function\s+\w*)\b/.test(code)) return 'javascript';
  // Python specific
  if (code.match(/\bprint\s*\(/) || /\b(def|import|elif|except|pass|True|False|None)\b/.test(code)) return 'python';
  return null;
}

export default function EditorPanel({ language, setLanguage, savedSnippets, saveSnippet, mode, theme }) {
  const [code, setCode] = useState(() => {
    const saved = localStorage.getItem(`nc_code_${language}`)
    return saved || STARTER_CODE[language]
  })
  const [output, setOutput] = useState(null)
  const [running, setRunning] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [errorExplanation, setErrorExplanation] = useState(null)
  const [loadingExplanation, setLoadingExplanation] = useState(false)
  const [optimization, setOptimization] = useState(null)
  const [loadingOptimize, setLoadingOptimize] = useState(false)
  const [activeOutput, setActiveOutput] = useState('output') // output | error | ai
  const [outputHeight, setOutputHeight] = useState(180)
  const editorRef = useRef(null)
  const monacoRef = useRef(null)
  const [decorations, setDecorations] = useState([])

  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    const startY = e.clientY
    const startHeight = outputHeight

    const handleMouseMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY
      const newHeight = Math.max(100, Math.min(500, startHeight - deltaY))
      setOutputHeight(newHeight)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [outputHeight])

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 0) return
    const startY = e.touches[0].clientY
    const startHeight = outputHeight

    const handleTouchMove = (moveEvent) => {
      if (moveEvent.touches.length === 0) return
      const deltaY = moveEvent.touches[0].clientY - startY
      const newHeight = Math.max(100, Math.min(500, startHeight - deltaY))
      setOutputHeight(newHeight)
    }

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }

    document.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('touchend', handleTouchEnd)
  }, [outputHeight])

  // Sync local code state when the active language changes
  useEffect(() => {
    const saved = localStorage.getItem(`nc_code_${language}`)
    setCode(saved || STARTER_CODE[language] || '')
    setOutput(null)
    setErrorExplanation(null)
    setOptimization(null)
  }, [language])

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco
    monaco.editor.defineTheme('RazaCodeBuddy', MONACO_THEME_DARK)
    monaco.editor.setTheme(theme === 'light' ? 'vs' : 'RazaCodeBuddy')
  }

  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(theme === 'light' ? 'vs' : 'RazaCodeBuddy')
    }
  }, [theme])

  const runCode = useCallback(async () => {
    setRunning(true)
    setOutput(null)
    setErrorExplanation(null)
    setOptimization(null)

    try {
      const result = await executeCode({ code, language })
      setOutput(result)

      if (!result.success && (result.stderr || result.stdout)) {
        // Auto-trigger AI explanation
        setActiveOutput('error')
      } else {
        setActiveOutput('output')
      }
    } catch (e) {
      setOutput({ stdout: '', stderr: e.message, status: 'Error', statusId: 0, success: false })
      setActiveOutput('error')
    } finally {
      setRunning(false)
    }
  }, [code, language])

  const explainWithAI = async () => {
    if (!output) return
    setLoadingExplanation(true)
    setActiveOutput('ai')
    try {
      const lang = getLanguageById(language)
      const explanation = await explainError({
        code,
        language: lang.name,
        error: output.stderr,
        output: output.stdout,
      })
      setErrorExplanation(explanation)
    } catch (e) {
      setErrorExplanation(`Failed to get AI explanation: ${e.message}`)
    } finally {
      setLoadingExplanation(false)
    }
  }

  const optimizeWithAI = async () => {
    setLoadingOptimize(true)
    setActiveOutput('ai')
    try {
      const lang = getLanguageById(language)
      const result = await optimizeCode({ code, language: lang.name })
      setOptimization(result)
    } catch (e) {
      setOptimization(`Failed: ${e.message}`)
    } finally {
      setLoadingOptimize(false)
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const resetCode = () => {
    const starter = STARTER_CODE[language]
    setCode(starter)
    localStorage.setItem(`nc_code_${language}`, starter)
    setOutput(null)
    setErrorExplanation(null)
    setOptimization(null)
  }

  const handleSave = () => {
    saveSnippet({
      id: `${language}_${Date.now()}`,
      language,
      code,
      title: `${getLanguageById(language).name} snippet`,
    })
  }

  const applyFix = () => {
    if (!errorExplanation) return
    // Extract code from explanation
    const codeMatch = errorExplanation.match(/```[\w]*\n([\s\S]*?)```/)
    if (codeMatch) {
      const fixedCode = codeMatch[1].trim()
      setCode(fixedCode)
      localStorage.setItem(`nc_code_${language}`, fixedCode)
      setOutput(null)
      setErrorExplanation(null)
    }
  }

  const lang = getLanguageById(language)

  return (
    <div className={`flex flex-col h-full ${fullscreen ? 'fixed inset-0 z-50 bg-void' : ''}`}>
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center justify-between gap-2 px-3 py-2 border-b border-white/5 bg-surface/50">
        {/* Active Language Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 rounded-md text-xs font-semibold">
          <span>{lang.icon}</span>
          <span>{lang.name}</span>
        </div>

        {/* Actions - pinned to the right */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={handleSave} title="Save snippet"
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all">
            <Save size={13} />
          </button>
          <button onClick={copyCode} title="Copy code"
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all">
            {copied ? <CheckCircle size={13} className="text-accent-emerald" /> : <Copy size={13} />}
          </button>
          <button onClick={resetCode} title="Reset code"
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all">
            <RotateCcw size={13} />
          </button>
          <button onClick={() => setFullscreen(!fullscreen)} title="Fullscreen"
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all hidden sm:block">
            {fullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
          <button
            onClick={runCode}
            disabled={running}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 hover:bg-accent-cyan/20 disabled:opacity-50 text-xs font-medium transition-all ml-1"
          >
            {running ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
            {running ? 'Running...' : 'Run'}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={lang.monacoId}
          value={code}
          onChange={v => {
            const newCode = v || ''
            setCode(newCode)
            localStorage.setItem(`nc_code_${language}`, newCode)
          }}
          onMount={handleEditorMount}
          options={{
            fontSize: 13,
            fontFamily: '"JetBrains Mono", monospace',
            fontLigatures: true,
            lineNumbers: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            renderLineHighlight: 'line',
            padding: { top: 12, bottom: 12 },
            lineHeight: 22,
            letterSpacing: 0.3,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            scrollbar: { vertical: 'hidden', horizontal: 'auto', alwaysConsumeMouseWheel: false },
            contextmenu: false,
            folding: false,
            glyphMargin: false,
            lineDecorationsWidth: 0,
            bracketPairColorization: { enabled: true },
            automaticLayout: true,
          }}
          theme={theme === 'light' ? 'vs' : 'RazaCodeBuddy'}
        />
      </div>

      {/* Resizable Divider (Drag Handle) */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="h-1 bg-white/5 hover:bg-accent-cyan/50 cursor-row-resize transition-all w-full z-20 flex-shrink-0"
        title="Drag to resize output panel"
      />

      {/* Output panel */}
      <div
        className="flex-shrink-0 bg-void/80 flex flex-col overflow-hidden"
        style={{ height: `${outputHeight}px` }}
      >
        {/* Output tabs */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-1.5 sm:py-0 border-b border-white/5 bg-surface/30">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {['output', 'error', 'ai'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveOutput(tab)}
                className={`px-3 py-1.5 text-xs rounded-t-lg capitalize transition-all flex items-center gap-1.5 ${activeOutput === tab
                    ? 'text-accent-cyan bg-accent-cyan/5 border-b-2 border-accent-cyan font-semibold'
                    : 'text-slate-500 hover:text-slate-300'
                  }`}
              >
                {tab === 'output' ? (
                  <>
                    <Terminal size={12} className={activeOutput === 'output' ? 'text-accent-cyan' : 'text-slate-500'} />
                    <span>Output</span>
                  </>
                ) : tab === 'error' ? (
                  <>
                    <AlertCircle size={12} className={activeOutput === 'error' ? 'text-accent-rose' : 'text-slate-500'} />
                    <span>Error</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={12} className={activeOutput === 'ai' ? 'text-accent-violet' : 'text-slate-500'} />
                    <span>AI Explain</span>
                  </>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 justify-end py-1 sm:py-0">
            {output && !output.success && (
              <>
                <button
                  onClick={explainWithAI}
                  disabled={loadingExplanation}
                  className="neon-revolving-btn neon-revolving-violet hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  <span className="neon-revolving-inner">
                    <Wand2 size={12} className={loadingExplanation ? 'animate-spin' : ''} />
                    {loadingExplanation ? 'Analyzing...' : 'Explain Error'}
                  </span>
                </button>

                {errorExplanation && (
                  <button
                    onClick={applyFix}
                    className="neon-revolving-btn neon-revolving-emerald hover:scale-105 active:scale-95 transition-all duration-200"
                  >
                    <span className="neon-revolving-inner">
                      <Check size={12} />
                      Apply AI Fix
                    </span>
                  </button>
                )}
              </>
            )}
            {output && output.success && code.length > 50 && (
              <button
                onClick={optimizeWithAI}
                disabled={loadingOptimize}
                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20 hover:bg-accent-emerald/20 transition-all font-semibold uppercase tracking-wider"
              >
                <Wand2 size={11} />
                {loadingOptimize ? 'Optimizing...' : 'Optimize'}
              </button>
            )}
          </div>
        </div>

        <div className="p-3 flex-1 overflow-y-auto min-h-0">
          <AnimatePresence mode="wait">
            {activeOutput === 'output' && (
              <motion.div key="out" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {!output ? (
                  <p className="text-xs text-slate-600 font-mono">// Click Run to execute your code</p>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {output.success
                        ? <CheckCircle size={12} className="text-accent-emerald" />
                        : <AlertCircle size={12} className="text-accent-rose" />
                      }
                      <span className={`text-xs font-medium ${output.success ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                        {output.status}
                      </span>
                      {output.time && (
                        <span className="text-xs text-slate-600 ml-auto flex items-center gap-1">
                          <Clock size={11} />
                          <span>{output.time}s</span>
                        </span>
                      )}
                    </div>
                    {output.stdout && (
                      <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {output.stdout}
                      </pre>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {activeOutput === 'error' && (
              <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {!output?.stderr ? (
                  <p className="text-xs text-slate-600 font-mono">// No errors to display</p>
                ) : (
                  <pre className="text-xs font-mono text-accent-rose/80 whitespace-pre-wrap leading-relaxed">
                    {output.stderr}
                  </pre>
                )}
              </motion.div>
            )}

            {activeOutput === 'ai' && (
              <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {loadingExplanation || loadingOptimize ? (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Loader2 size={12} className="animate-spin" />
                    AI is analyzing your code...
                  </div>
                ) : errorExplanation ? (
                  <div>
                    <MarkdownRenderer content={errorExplanation} />
                  </div>
                ) : optimization ? (
                  <MarkdownRenderer content={optimization} />
                ) : (
                  <p className="text-xs text-slate-600">Run your code and use "Explain Error" or "Optimize" to get AI insights.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
