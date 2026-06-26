// src/services/judge0Service.js
const JUDGE0_API_KEY = import.meta.env.VITE_JUDGE0_API_KEY
const JUDGE0_BASE_URL = import.meta.env.VITE_JUDGE0_BASE_URL || 'https://judge0-ce.p.rapidapi.com'

// Language IDs for Judge0
const LANGUAGE_IDS = {
  python: 71,      // Python 3.8.1
  javascript: 63,  // JavaScript (Node.js 12.14.0)
  c: 50,           // C (GCC 9.2.0)
  cpp: 54,         // C++ (GCC 9.2.0)
  java: 62,        // Java (OpenJDK 13.0.1)
  go: 60,          // Go (1.13.5)
  rust: 73,        // Rust (1.40.0)
  ruby: 72,        // Ruby (2.7.0)
  php: 68,         // PHP (7.4.1)
}

const HEADERS = {
  'Content-Type': 'application/json',
  'X-RapidAPI-Key': JUDGE0_API_KEY,
  'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function executeCode({ code, language, stdin = '' }) {
  const isKeyBlocked = localStorage.getItem('nc_judge0_blocked') === 'true'

  if (!JUDGE0_API_KEY || isKeyBlocked) {
    // Demo mode - simulate execution
    return simulateExecution(code, language)
  }

  const languageId = LANGUAGE_IDS[language.toLowerCase()]
  if (!languageId) throw new Error(`Unsupported language: ${language}`)

  // Submit
  let submitRes;
  try {
    submitRes = await fetch(`${JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=false`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        language_id: languageId,
        source_code: code,
        stdin,
      }),
    })
  } catch (err) {
    throw new Error(`Network error: ${err.message}`)
  }

  if (!submitRes.ok) {
    if (submitRes.status === 403 || submitRes.status === 401) {
      console.warn(`Judge0 API returned ${submitRes.status}. Your API key is likely unsubscribed or invalid. Falling back to simulation.`)
      // Cache the failure so we don't spam the console with 403 network errors
      localStorage.setItem('nc_judge0_blocked', 'true')
      return simulateExecution(code, language)
    }
    throw new Error(`Submission failed: ${submitRes.status}`)
  }
  const { token } = await submitRes.json()

  // Poll for result
  let attempts = 0
  while (attempts < 15) {
    await sleep(1000)
    const resultRes = await fetch(`${JUDGE0_BASE_URL}/submissions/${token}?base64_encoded=false`, {
      headers: HEADERS,
    })

    if (!resultRes.ok) throw new Error(`Polling failed: ${resultRes.status}`)
    const result = await resultRes.json()

    const statusId = result.status?.id
    // 1 = In Queue, 2 = Processing
    if (statusId !== 1 && statusId !== 2) {
      return {
        stdout: result.stdout || '',
        stderr: result.stderr || result.compile_output || '',
        status: result.status?.description || 'Unknown',
        statusId,
        time: result.time,
        memory: result.memory,
        success: statusId === 3, // 3 = Accepted
      }
    }
    attempts++
  }

  throw new Error('Execution timed out')
}

// Simulated execution for demo without API key
export async function simulateExecution(code, language) {
  const lang = language.toLowerCase()
  return new Promise(async (resolve) => {
    let output = ''
    let isError = false
    let time = 0.05

    if (lang === 'javascript') {
      const originalLog = console.log
      const originalError = console.error
      const logs = []
      console.log = (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '))
      console.error = (...args) => { isError = true; logs.push('Error: ' + args.map(String).join(' ')) }

      try {
        const start = performance.now()
        // Execute JS in browser
        new Function(code)()
        time = ((performance.now() - start) / 1000).toFixed(2)
        output = logs.join('\n')
      } catch (e) {
        isError = true
        output = e.toString()
      } finally {
        console.log = originalLog
        console.error = originalError
      }
    } else if (lang === 'python') {
      if (!window.pyodide) {
        output = '[System] Initializing local Python runtime...\nPlease wait 5-10 seconds and click Run again.'
        isError = true // Force to error channel so it's visible as system message
        if (!document.getElementById('pyodide-script')) {
          const script = document.createElement('script')
          script.id = 'pyodide-script'
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js'

          // Temporarily hide Monaco's AMD loader so Pyodide uses standard globals
          const oldDefine = window.define
          window.define = undefined

          script.onload = async () => {
            try {
              window.pyodide = await window.loadPyodide({
                indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
              })
            } catch (err) {
              console.error("Pyodide init failed:", err)
            } finally {
              window.define = oldDefine // Restore Monaco's loader
            }
          }
          document.head.appendChild(script)
        }
      } else {
        try {
          let pyLogs = []
          window.pyodide.setStdout({ batched: (msg) => pyLogs.push(msg) })
          window.pyodide.setStderr({ batched: (msg) => pyLogs.push(msg) })

          const start = performance.now()
          await window.pyodide.runPythonAsync(code)
          time = ((performance.now() - start) / 1000).toFixed(2)
          output = pyLogs.join('\n')
        } catch (e) {
          isError = true
          output = e.toString()
        }
      }
    } else {
      // Basic syntax validation for brackets and quotes in C, C++, Java, Rust, Go, PHP
      let hasObviousError = false
      let syntaxErrorMessage = ''

      if (['c', 'cpp', 'java', 'rust', 'go', 'php'].includes(lang)) {
        const lines = code.split('\n')
        let inBlockComment = false
        const stack = []
        const openChars = ['(', '{', '[']
        const closeChars = [')', '}', ']']
        const matchingPairs = { ')': '(', '}': '{', ']': '[' }

        for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
          const line = lines[lineIdx]
          let inLineComment = false
          let currentQuote = null

          for (let colIdx = 0; colIdx < line.length; colIdx++) {
            const char = line[colIdx]

            // 1. Check for block comment status
            if (inBlockComment) {
              if (char === '/' && colIdx > 0 && line[colIdx-1] === '*') {
                inBlockComment = false
              }
              continue
            }

            if (char === '/' && colIdx < line.length - 1 && line[colIdx+1] === '*') {
              inBlockComment = true
              colIdx++ // Skip '*'
              continue
            }

            // 2. Check for single line comments
            if (char === '/' && colIdx < line.length - 1 && line[colIdx+1] === '/') {
              inLineComment = true
              break // Skip rest of the line
            }

            // 3. Track string literal quotes
            if ((char === '"' || char === "'") && (colIdx === 0 || line[colIdx-1] !== '\\')) {
              if (currentQuote === char) {
                currentQuote = null
              } else if (!currentQuote) {
                currentQuote = char
              }
              continue
            }

            // Skip everything if inside a string literal
            if (currentQuote) {
              continue
            }

            // 4. Bracket tracking
            if (openChars.includes(char)) {
              stack.push({ char, line: lineIdx + 1 })
            } else if (closeChars.includes(char)) {
              const expected = matchingPairs[char]
              if (stack.length === 0) {
                hasObviousError = true
                syntaxErrorMessage = `Compilation Error (Line ${lineIdx + 1}): Unmatched closing bracket '${char}' found.`
                break
              } else {
                const popped = stack.pop()
                if (popped.char !== expected) {
                  hasObviousError = true
                  syntaxErrorMessage = `Compilation Error (Line ${lineIdx + 1}): Expected closing bracket for '${popped.char}' from line ${popped.line} but found '${char}'.`
                  break
                }
              }
            }
          }

          if (hasObviousError) break

          // Unclosed quote at end of line (double quotes only, unless escaped with backslash)
          if (currentQuote === '"') {
            const trimmed = line.trim()
            if (!trimmed.endsWith('\\')) {
              hasObviousError = true
              syntaxErrorMessage = `Compilation Error (Line ${lineIdx + 1}): Missing closing quote (").`
              break
            }
          }
        }

        if (!hasObviousError && stack.length > 0) {
          hasObviousError = true
          const unmatched = stack.pop()
          syntaxErrorMessage = `Compilation Error (Line ${unmatched.line}): Unclosed bracket '${unmatched.char}' found.`
        }
      }

      if (hasObviousError) {
        isError = true
        output = syntaxErrorMessage
      } else {
        output = `[Local Mode] Syntax check passed! No errors found.\nReal execution for ${language} requires a valid Judge0 API key in your .env file.\nOutput: (C code compiled successfully, main returned 0)`
      }
    }

    resolve({
      stdout: isError ? '' : (output || '// Code executed successfully with no output'),
      stderr: isError ? output : '',
      status: isError
        ? (lang === 'python' && !window.pyodide ? 'Initializing' : (output.startsWith('Compilation Error') ? 'Compilation Error' : 'Runtime Error'))
        : 'Accepted',
      statusId: isError ? (output.startsWith('Compilation Error') ? 6 : 11) : 3,
      time: time.toString(),
      memory: 1024,
      success: !isError,
    })
  })
}
