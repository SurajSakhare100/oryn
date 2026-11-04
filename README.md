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

Google sign-in uses the Express API in `server/api` (port 3001). The FastAPI
service on port 8000 handles AI chat requests; it does not handle OAuth.

1. Create a Google OAuth 2.0 **Web application** client in Google Cloud Console.
   Add `http://localhost:3001/api/auth/google/callback` as an authorized redirect URI.
2. Create `server/.env` with `DATABASE_URL`, `DIRECT_URL`, `GOOGLE_CLIENT_ID`,
   `GOOGLE_CLIENT_SECRET`, `JWT_SECRET`, and `CLIENT_URL=http://localhost:3000`.
3. Create `client/.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:3001`.
4. Start the Express API, FastAPI service, and Next.js client in separate terminals:

```bash
# Express API (OAuth, users, conversations)
cd server/api && npm run dev

# FastAPI (AI chat)
cd server && uv run uvicorn app.main:app --reload

# Frontend
cd client && npm run dev
```

For deployment, set the Express API's `GOOGLE_CALLBACK_URL` to its public
`/api/auth/google/callback` URL and register that exact URL in Google Cloud
Console. Set `CLIENT_URL` to the deployed frontend origin, and set the frontend's
`NEXT_PUBLIC_API_URL` to the public Express API origin. Google OAuth credentials
must be configured in the API environment; they cannot be supplied by the client.

