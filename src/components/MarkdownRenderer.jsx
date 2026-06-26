// src/components/MarkdownRenderer.jsx
import React, { useState } from 'react'
import { Copy, Check } from 'lucide-react'

function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="code-block my-3 overflow-hidden rounded-xl border border-white/5 bg-black/30">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5 bg-white/3">
        <span className="text-xs text-accent-cyan/60 font-mono uppercase tracking-wider">{lang || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={11} className="text-accent-emerald" />
              <span className="text-accent-emerald font-semibold">Copied</span>
            </>
          ) : (
            <>
              <Copy size={11} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-xs leading-relaxed">
        <code className="text-cyan-200">{code}</code>
      </pre>
    </div>
  )
}

function processMarkdown(text) {
  const lines = text.split('\n')
  const result = []
  let i = 0
  let inCodeBlock = false
  let codeLang = ''
  let codeLines = []

  while (i < lines.length) {
    const line = lines[i]

    // Code block
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true
        codeLang = line.slice(3).trim()
        codeLines = []
      } else {
        inCodeBlock = false
        result.push(
          <CodeBlock
            key={`code-${i}`}
            lang={codeLang}
            code={codeLines.join('\n')}
          />
        )
        codeLines = []
        codeLang = ''
      }
      i++
      continue
    }

    if (inCodeBlock) {
      codeLines.push(line)
      i++
      continue
    }

    // Headings
    if (line.startsWith('### ')) {
      result.push(<h3 key={i} className="text-accent-cyan font-display font-600 text-sm mt-4 mb-2">{parseInline(line.slice(4))}</h3>)
    } else if (line.startsWith('## ')) {
      result.push(<h2 key={i} className="text-accent-cyan font-display font-semibold text-base mt-4 mb-2">{parseInline(line.slice(3))}</h2>)
    } else if (line.startsWith('# ')) {
      result.push(<h1 key={i} className="text-white font-display font-bold text-lg mt-4 mb-2">{parseInline(line.slice(2))}</h1>)
    }
    // Bullet lists
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      result.push(
        <div key={i} className="flex gap-2 my-1">
          <span className="text-accent-cyan mt-0.5 flex-shrink-0">▸</span>
          <span className="text-slate-300 text-sm">{parseInline(line.slice(2))}</span>
        </div>
      )
    }
    // Numbered list
    else if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^(\d+)\.\s(.*)/)
      if (match) {
        result.push(
          <div key={i} className="flex gap-2 my-1">
            <span className="text-accent-cyan text-sm font-mono w-5 flex-shrink-0">{match[1]}.</span>
            <span className="text-slate-300 text-sm">{parseInline(match[2])}</span>
          </div>
        )
      }
    }
    // Horizontal rule
    else if (line === '---' || line === '***') {
      result.push(<hr key={i} className="border-white/5 my-3" />)
    }
    // Empty line
    else if (line.trim() === '') {
      result.push(<div key={i} className="h-2" />)
    }
    // Regular paragraph
    else {
      result.push(
        <p key={i} className="text-slate-400 text-sm leading-relaxed">{parseInline(line)}</p>
      )
    }

    i++
  }

  return result
}

function parseInline(text) {
  // We'll return a mix by splitting on patterns
  const parts = []
  let remaining = text
  let key = 0

  // Process bold, italic, inline code
  const patterns = [
    { regex: /\*\*(.+?)\*\*/g, render: (m, content) => <strong key={key++} className="text-white font-semibold">{content}</strong> },
    { regex: /`([^`]+)`/g, render: (m, content) => <code key={key++} className="font-mono text-xs bg-accent-cyan/10 text-accent-cyan px-1.5 py-0.5 rounded">{content}</code> },
    { regex: /\*(.+?)\*/g, render: (m, content) => <em key={key++} className="text-slate-300 italic">{content}</em> },
  ]

  // Simple approach: split on inline code first
  const segments = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return segments.map((seg, idx) => {
    if (seg.startsWith('**') && seg.endsWith('**')) {
      return <strong key={idx} className="text-white font-semibold">{seg.slice(2, -2)}</strong>
    }
    if (seg.startsWith('`') && seg.endsWith('`')) {
      return <code key={idx} className="font-mono text-xs bg-accent-cyan/10 text-accent-cyan px-1.5 py-0.5 rounded">{seg.slice(1, -1)}</code>
    }
    if (seg.startsWith('*') && seg.endsWith('*')) {
      return <em key={idx} className="text-slate-300 italic">{seg.slice(1, -1)}</em>
    }
    return seg
  })
}

export default function MarkdownRenderer({ content, className = '' }) {
  if (!content) return null
  return (
    <div className={`prose-ai ${className}`}>
      {processMarkdown(content)}
    </div>
  )
}
