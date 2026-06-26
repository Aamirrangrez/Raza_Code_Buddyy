// src/components/Layout/SplitPanel.jsx
import React, { useState, useRef, useCallback, useEffect } from 'react'

export default function SplitPanel({ left, right, defaultSplit = 42, minLeft = 25, maxLeft = 70, resizable = true }) {
  const [split, setSplit] = useState(defaultSplit)
  const [dragging, setDragging] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    setSplit(defaultSplit)
  }, [defaultSplit])

  const handleMouseDown = useCallback((e) => {
    if (!resizable) return
    e.preventDefault()
    setDragging(true)
  }, [resizable])

  const handleMouseMove = useCallback((e) => {
    if (!dragging || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const newSplit = ((e.clientX - rect.left) / rect.width) * 100
    setSplit(Math.min(maxLeft, Math.max(minLeft, newSplit)))
  }, [dragging, minLeft, maxLeft])

  const handleMouseUp = useCallback(() => {
    setDragging(false)
  }, [])

  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [dragging, handleMouseMove, handleMouseUp])

  return (
    <div ref={containerRef} className="flex h-full w-full overflow-hidden">
      {/* Left panel */}
      <div style={{ width: `${split}%` }} className="flex-shrink-0 overflow-hidden">
        {left}
      </div>

      {/* Resize handle */}
      {resizable && (
        <div
          onMouseDown={handleMouseDown}
          className={`resize-handle flex-shrink-0 ${dragging ? 'active' : ''}`}
        />
      )}

      {/* Right panel */}
      <div style={{ width: `${100 - split}%` }} className="flex-shrink-0 overflow-hidden">
        {right}
      </div>
    </div>
  )
}
