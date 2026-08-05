from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from app.config import settings
from app.routers import chat, auth
from app.db import connect_db, close_db
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.error_handler import ErrorHandlerMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: connect to PostgreSQL via Prisma
    await connect_db()
    yield
    # Shutdown: close PostgreSQL connection
    await close_db()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API server for Oryn AI Answer Engine, powered by Groq LLM and PostgreSQL via Prisma.",
    lifespan=lifespan
)

# Enable CORS for the client frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Protect against host header attacks
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # Allow all for development/deployment flexibility
)

# Rate limiting: 60 requests per minute per IP
app.add_middleware(
    RateLimitMiddleware,
    limit=60,
    window=60
)

# Global unhandled exception handler
app.add_middleware(ErrorHandlerMiddleware)

# Include routers
app.include_router(chat.router)
app.include_router(auth.router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to Oryn AI Answer Engine Server",
        "status": "healthy",
        "version": settings.VERSION
    }

@app.get("/health")
async def health_check():
    return {"status": "ok"}
