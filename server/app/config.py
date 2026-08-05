import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    PROJECT_NAME: str = "Oryn AI Answer Engine Server"
    VERSION: str = "0.1.0"
    ENV: str = os.getenv("ENV", "development")

    # Groq Settings
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    # Server Settings
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # PostgreSQL / Supabase Settings
    # DATABASE_URL: pooled connection (Supavisor transaction mode, port 6543) — used at runtime
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgrespassword@localhost:5432/oryn")
    # DIRECT_URL: direct connection (port 5432) — used by Prisma for schema migrations
    DIRECT_URL: str = os.getenv("DIRECT_URL", "")

    # JWT Settings
    JWT_SECRET: str = os.getenv("JWT_SECRET", "")

settings = Settings()
