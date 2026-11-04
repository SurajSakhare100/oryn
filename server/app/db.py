from prisma import Prisma
from app.config import settings
import asyncio
import logging

logger = logging.getLogger("uvicorn")

class Database:
    prisma: Prisma = None

db_helper = Database()

async def connect_db():
    if not settings.DATABASE_URL:
        logger.error("DATABASE_URL is missing; saved conversations will be unavailable.")
        return

    while True:
        client = Prisma()
        try:
            await asyncio.wait_for(client.connect(), timeout=15)
            db_helper.prisma = client
            logger.info("Connected to PostgreSQL successfully via Prisma")
            return
        except asyncio.CancelledError:
            raise
        except Exception as error:
            logger.warning(
                "Database connection failed (%s: %s); retrying in 10 seconds.",
                type(error).__name__,
                error,
            )
            try:
                if client.is_connected():
                    await client.disconnect()
            except Exception:
                logger.debug("Could not close the failed Prisma connection.")
            await asyncio.sleep(10)

async def close_db():
    if db_helper.prisma and db_helper.prisma.is_connected():
        await db_helper.prisma.disconnect()
        logger.info("Closed PostgreSQL connection")
