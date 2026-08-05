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
cors_origins = [origin.strip() for origin in settings.ALLOWED_CORS_ORIGINS.split(",") if origin.strip()]
if not cors_origins:
    cors_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True if "*" not in cors_origins else False, # Credentials must be disabled if wildcard * is allowed in FastAPI
    allow_methods=["*"],
    allow_headers=["*"],
)

# TrustedHostMiddleware: allow all hosts since CORS already enforces origin restrictions.
# Note: allowed_hosts here refers to the SERVER's Host header, not client origins.
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]
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
