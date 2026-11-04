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

Google sign-in, conversations, and the AI chat gateway run through the Express
API in `server/api`. FastAPI handles AI generation internally. The Render Docker
image runs both backend services together; the Next.js frontend remains a
separate deployment.

1. Create a Google OAuth 2.0 **Web application** client in Google Cloud Console.
   Add the frontend origin (for local development, `http://localhost:3000`) to
   **Authorized JavaScript origins**. The legacy redirect flow also uses
   `http://localhost:3001/api/auth/google/callback`.
2. Create `server/.env` with `DATABASE_URL`, `DIRECT_URL`, `GOOGLE_CLIENT_ID`,
   `GOOGLE_CLIENT_SECRET`, `JWT_SECRET`, and `CLIENT_URL=http://localhost:3000`.
3. Create `client/.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:3001`.
4. Start the combined backend and Next.js client:

```bash
# Express API + internal FastAPI service
cd server && docker compose up --build

# Frontend
cd client && npm run dev
```

For deployment, set the Render Docker service's `DATABASE_URL`, `DIRECT_URL`,
`JWT_SECRET`, `GROQ_API_KEY`, and `GOOGLE_CLIENT_ID`. Set `CLIENT_URL` and
`ALLOWED_CORS_ORIGINS` to the deployed frontend origin. Set the frontend's
`NEXT_PUBLIC_API_URL` to the Docker service URL (for example,
`https://oryn-dbjz.onrender.com`). Google OAuth credentials belong in the API
environment; they cannot be supplied by the client.

