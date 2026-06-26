# RazaCodeBuddy — AI-Powered Coding Learning Platform

> A futuristic, premium coding mentor powered by AI. Learn programming visually with interactive lessons, live IDE, and intelligent guidance.

## Features

- 🤖 **AI Learning System** — Groq-powered lessons, explanations, quizzes, and debugging
- 💻 **Monaco Editor IDE** — Full-featured code editor with syntax highlighting
- ⚡ **Code Execution** — Run Python, C, C++, and JavaScript via Judge0
- 👁️ **Visual Execution** — Animate code step by step, watch variables change
- 🛠️ **AI Error Explainer** — Auto-explains errors with fix suggestions
- 💬 **AI Chat Mentor** — Floating assistant for questions and debugging
- 🏆 **Interview Prep** — AI-generated interview questions by level
- 📊 **Progress Tracking** — XP, streaks, completed topics (localStorage)
- 🌙 **Dark/Light Mode** — Default dark with smooth toggle

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill in your API keys:

```env
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_JUDGE0_API_KEY=your_judge0_api_key_here
VITE_JUDGE0_BASE_URL=https://judge0-ce.p.rapidapi.com
```

**Get Groq API Key:** https://console.groq.com  
**Get Judge0 API Key:** https://rapidapi.com/judge0-official/api/judge0-ce

> Note: The app works without API keys in demo mode (simulated code execution, AI features require Groq key)

### 3. Start development server

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Editor | Monaco Editor |
| AI | Groq API (Llama 3) |
| Code Execution | Judge0 API |
| Storage | localStorage |
| Icons | Lucide React |

## Project Structure

```
src/
├── components/
│   ├── AI/           # Chat panel
│   ├── IDE/          # Monaco editor + output
│   ├── Layout/       # Navbar, particles, split panel
│   ├── Lessons/      # Learn + interview panels
│   ├── Progress/     # XP & stats
│   └── Visual/       # Code step visualizer
├── services/
│   ├── groqService.js    # AI API calls
│   └── judge0Service.js  # Code execution
├── store/
│   └── useStore.js   # localStorage state
└── utils/
    └── languages.js  # Language configs
```

## Learning Modes

- 🌱 **Beginner** — Simple explanations, analogies, step-by-step
- ⚡ **Intermediate** — Practical focus, moderate theory
- 🚀 **Advanced** — Complexity analysis, optimization

## Supported Languages

- 🐍 Python
- ⚡ JavaScript
- 🔧 C
- ⚙️ C++
