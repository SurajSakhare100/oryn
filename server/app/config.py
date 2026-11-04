import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    PROJECT_NAME: str = "Oryn AI Service"
    VERSION: str = "0.1.0"
    # Groq Settings
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

    # Server Settings
    AI_SERVICE_TOKEN: str = os.getenv("AI_SERVICE_TOKEN", "")

    # PostgreSQL / Supabase Settings
    # DATABASE_URL: pooled connection (Supavisor transaction mode, port 6543) — used at runtime
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    # DIRECT_URL: direct connection (port 5432) — used by Prisma for schema migrations
    DIRECT_URL: str = os.getenv("DIRECT_URL", "")

settings = Settings()
