// src/services/groqService.js
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1'
const MODEL = 'llama-3.1-8b-instant'

async function groqChat(messages, systemPrompt = '') {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not set. Please add VITE_GROQ_API_KEY to your .env file.')
  }

  const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || `Groq API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || ''
}

const SYSTEM_BASE = `You are RazaCodeBuddy, an expert AI coding mentor. You teach programming in a clear, friendly, and beginner-focused way.
Format your responses using markdown. Use code blocks with language tags. Keep explanations simple but accurate.
Use analogies from everyday life to explain complex concepts. Always be encouraging.`

export async function generateLesson({ concept, language, mode }) {
  const modeContext = {
    beginner: 'Use very simple language, lots of analogies, step-by-step. Assume zero prior knowledge.',
    intermediate: 'Use moderate technical depth, some theory, practical examples.',
    advanced: 'Include complexity analysis, edge cases, optimization techniques, and professional patterns.',
  }[mode] || 'Use simple language.'

  const prompt = `Generate a comprehensive lesson about "${concept}" in ${language}.

Learning level: ${mode} - ${modeContext}

Structure your response exactly like this:

### 🎯 What is ${concept}?
[Clear explanation with an everyday analogy]

### 💡 Key Concepts
[Bullet points of the most important ideas]

### 📝 Syntax
[Show the basic syntax with a minimal code example]

### 🔥 Real Example
[A practical, runnable code example that demonstrates the concept]

### 🧠 How It Works (Step-by-Step)
[Walk through the example line by line]

### ⚡ Quick Tip
[One pro tip or common mistake to avoid]

### 🎮 Mini Exercise
[A simple coding challenge for the learner to try]

Make the code examples in ${language} and ensure they are complete and runnable.`

  return await groqChat([{ role: 'user', content: prompt }], SYSTEM_BASE)
}

export async function generateQuiz({ concept, language, mode }) {
  const prompt = `Generate a 5-question quiz about "${concept}" in ${language} for ${mode} learners.

Return ONLY a valid JSON array (no markdown, no explanation) with this format:
[
  {
    "id": 1,
    "question": "Question text here?",
    "options": ["A", "B", "C", "D"],
    "correct": 0,
    "explanation": "Why this answer is correct"
  }
]

Make the questions ${mode === 'beginner' ? 'simple and conceptual' : mode === 'intermediate' ? 'practical and code-focused' : 'challenging with edge cases'}.`

  const raw = await groqChat([{ role: 'user', content: prompt }], SYSTEM_BASE)
  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return []
  }
}

export async function explainError({ code, language, error, output }) {
  const prompt = `A student wrote this ${language} code and got an error. Explain it clearly.

**Code:**
\`\`\`${language.toLowerCase()}
${code}
\`\`\`

**Error:**
\`\`\`
${error || output || 'Runtime error'}
\`\`\`

Respond with:

### 🔴 What Happened
[Explain what error occurred, in simple terms]

### 🤔 Why It Happened
[Explain the root cause]

### ✅ How to Fix It
[Step by step fix instructions]

### 💻 Fixed Code
\`\`\`${language.toLowerCase()}
[Complete corrected code here]
\`\`\`

### 🎓 Lesson Learned
[One key takeaway to remember]`

  return await groqChat([{ role: 'user', content: prompt }], SYSTEM_BASE)
}

export async function chatWithAI({ messages, currentCode, language, mode }) {
  const systemPrompt = `${SYSTEM_BASE}
The student is currently working in ${language} at ${mode} level.
${currentCode ? `Their current code:\n\`\`\`${language.toLowerCase()}\n${currentCode}\n\`\`\`` : ''}
Keep responses concise and conversational. Use markdown. Be encouraging.`

  return await groqChat(messages, systemPrompt)
}

export async function searchConcept({ query, language, mode }) {
  const prompt = `The student searched: "${query}" (language: ${language}, level: ${mode})

Provide a helpful response with:

### 📖 ${query}
[Brief, clear explanation]

### 🔑 Key Points
[3-4 bullet points]

### 💻 Code Example
\`\`\`${language.toLowerCase()}
[Relevant code example]
\`\`\`

### 🔗 Related Topics
[2-3 related concepts to explore next]`

  return await groqChat([{ role: 'user', content: prompt }], SYSTEM_BASE)
}

export async function generateInterviewQuestions({ language, mode }) {
  const prompt = `Generate 5 ${mode}-level interview questions about ${language} programming.

Format as JSON only:
[
  {
    "id": 1,
    "question": "Interview question?",
    "category": "Concepts|Coding|Problem Solving|Debugging",
    "difficulty": "Easy|Medium|Hard",
    "hint": "Brief hint",
    "answer": "Detailed answer explanation"
  }
]`

  const raw = await groqChat([{ role: 'user', content: prompt }], SYSTEM_BASE)
  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return []
  }
}

export async function optimizeCode({ code, language }) {
  const prompt = `Analyze and optimize this ${language} code:

\`\`\`${language.toLowerCase()}
${code}
\`\`\`

Respond with:

### 📊 Current Code Analysis
[Time & space complexity, issues found]

### ⚡ Optimized Version
\`\`\`${language.toLowerCase()}
[Optimized code]
\`\`\`

### 🎯 What Changed & Why
[Explain each optimization]

### 📈 Improvement Summary
[Before vs After comparison]`

  return await groqChat([{ role: 'user', content: prompt }], SYSTEM_BASE)
}
