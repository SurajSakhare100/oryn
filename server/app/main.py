from contextlib import asynccontextmanager
import asyncio
from fastapi import FastAPI
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from app.config import settings
from app.routers import chat
from app.db import connect_db, close_db
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.error_handler import ErrorHandlerMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    database_task = asyncio.create_task(connect_db())
    try:
        yield
    finally:
        if not database_task.done():
            database_task.cancel()
            try:
                await database_task
            except asyncio.CancelledError:
                pass
        await close_db()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI microservice for Oryn — powered by Groq LLM. Auth and user management are handled by the Express API gateway.",
    lifespan=lifespan
)

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

@app.get("/")
async def root():
    return {
        "message": "Oryn AI Service",
        "status": "healthy",
        "version": settings.VERSION,
        "note": "Authentication is handled by the Express API gateway. This service reads X-User-Id from trusted gateway requests."
    }

@app.get("/health")
async def health_check():
    return {"status": "ok"}
