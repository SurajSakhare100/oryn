# Oryn — AI Answer Engine

An open-source AI-powered answer engine (like Perplexity) built with Next.js, FastAPI, Groq LLM, and PostgreSQL.

## Features

- 🔍 Real-time web search with DuckDuckGo crawling
- 🤖 LLM-powered answers with inline citations (Groq / LangChain)
- 💬 Multi-turn conversation history
- 🔐 JWT-based user authentication
- 📁 Conversation storage with PostgreSQL (Supabase)
- 🌐 Fully responsive, dark-mode UI

## Stack

| Layer    | Technology              |
|----------|-------------------------|
| Frontend | Next.js 16, Tailwind CSS |
| Backend  | FastAPI, Python 3.12    |
| Database | PostgreSQL via Prisma   |
| LLM      | Groq (LangChain)        |
| Hosting  | Vercel + Render         |

## Getting Started

```bash
# Backend
cd server && uv run uvicorn app.main:app --reload

# Frontend
cd client && npm run dev
```

