# Oryn — AI Answer Engine

An open-source, source-backed answer engine built with Next.js, FastAPI, Groq, and PostgreSQL.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, Tailwind CSS |
| API | Express, TypeScript |
| AI service | FastAPI, Python 3.14, uv |
| Database | PostgreSQL via Prisma / Supabase |
| Search and answer generation | DuckDuckGo, Groq / LangChain |
| Hosting | Vercel + Render |

## Local development

1. Create a Google OAuth **Web application** client and add `http://localhost:3000` as an authorized JavaScript origin.
2. Copy `server/.env.example` to `server/.env` and set the database URLs, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, and `GROQ_API_KEY`. `AI_SERVICE_TOKEN` must have the same value for both backend processes; the example value is for local development only.
3. Copy `client/.env.example` to `client/.env.local`. `API_URL` is read by the Next.js server to proxy `/api` requests; it is not exposed in browser JavaScript.
4. Start the FastAPI service:

   ```bash
   cd server
   uv sync
   uv run prisma generate --schema=prisma/schema.prisma
   uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

5. In a second terminal, start the Express API:

   ```bash
   cd server/api
   npm ci
   npx prisma generate
   npm run dev
   ```

6. In a third terminal, start the frontend:

   ```bash
   cd client
   npm ci
   npm run dev
   ```

## Render deployment

`server/render.yaml` defines two native Render web services: `oryn` (Python / uv) and `oryn-api` (Node). The API service calls the AI service using a generated shared token. Both services use the same PostgreSQL database; only the Python service needs `DIRECT_URL` for its schema push. Set `DATABASE_URL`, `DIRECT_URL`, and `GROQ_API_KEY` on the Python service, and `DATABASE_URL`, `JWT_SECRET`, and `GOOGLE_CLIENT_ID` on the API service. Render generates `AI_SERVICE_TOKEN` and shares it with the API service.

Set the frontend's server-side `API_URL` to the Express service URL in Vercel. Do not use a `NEXT_PUBLIC_` prefix. The browser calls same-origin `/api` paths and Next.js proxies them to Express.

Google's OAuth client ID is public by design. Keep database URLs, the Groq key, the JWT signing secret, and the AI service token in backend or hosting environment settings; never put them in frontend variables or commit `.env` files.
