from prisma import Prisma
from app.config import settings
import logging
import subprocess
import os

logger = logging.getLogger("uvicorn")

class Database:
    prisma: Prisma = None

db_helper = Database()

def run_prisma_db_push():
    """
    Runs 'prisma db push' to automatically synchronize the schema to the database.
    """
    try:
        logger.info("Synchronizing database schema via Prisma db push...")
        # Try running using prisma CLI directly, fallback to python -m prisma
        env = os.environ.copy()
        env["DATABASE_URL"] = settings.DATABASE_URL
        
        result = subprocess.run(
            ["prisma", "db", "push"],
            capture_output=True,
            text=True,
            env=env
        )
        if result.returncode != 0:
            # Fallback to python -m prisma
            result = subprocess.run(
                ["python", "-m", "prisma", "db", "push"],
                capture_output=True,
                text=True,
                env=env
            )
            
        if result.returncode == 0:
            logger.info("Database schema synchronized successfully")
        else:
            logger.error(f"Failed to push database schema. Stderr: {result.stderr}")
    except Exception as e:
        logger.error(f"Error executing database schema synchronization: {e}")

async def connect_db():
    try:
        # Run db push before connecting
        run_prisma_db_push()
        
        db_helper.prisma = Prisma()
        await db_helper.prisma.connect()
        logger.info("Connected to PostgreSQL successfully via Prisma")
    except Exception as e:
        logger.error(f"Failed to connect to PostgreSQL: {e}")

async def close_db():
    if db_helper.prisma and db_helper.prisma.is_connected():
        await db_helper.prisma.disconnect()
        logger.info("Closed PostgreSQL connection")
