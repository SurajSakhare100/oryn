import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    PROJECT_NAME: str = "Oryn AI Service"
    VERSION: str = "0.1.0"
    ENV: str = os.getenv("ENV", "development")

    # Groq Settings
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

    # Server Settings
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # PostgreSQL / Supabase Settings
    # DATABASE_URL: pooled connection (Supavisor transaction mode, port 6543) — used at runtime
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgrespassword@localhost:5432/oryn")
    # DIRECT_URL: direct connection (port 5432) — used by Prisma for schema migrations
    DIRECT_URL: str = os.getenv("DIRECT_URL", "")

    # CORS Settings (FastAPI is an internal AI microservice, but keeps CORS for dev)
    ALLOWED_CORS_ORIGINS: str = os.getenv("ALLOWED_CORS_ORIGINS", "*")

    # Express API gateway URL (used to know which service to trust X-User-Id from)
    API_GATEWAY_URL: str = os.getenv("API_GATEWAY_URL", "http://localhost:3001")

settings = Settings()
