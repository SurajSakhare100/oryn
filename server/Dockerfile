# Use a lightweight python image with uv pre-installed
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder

WORKDIR /app

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1

# Copy dependency files
COPY pyproject.toml ./

# Install dependencies using uv sync (let uv update lockfile as needed)
RUN uv sync --no-dev --no-install-project

# Second stage for final runtime
FROM python:3.12-slim

# Install system dependencies needed for Prisma / Postgres (openssl, certificates, libatomic1)
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    libatomic1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy virtualenv and project code
COPY --from=builder /app/.venv /app/.venv
COPY . /app

# Set path to use virtualenv
ENV PATH="/app/.venv/bin:$PATH"

# Run Prisma generate to generate the database client
RUN prisma generate --schema=prisma/schema.prisma

# Expose port (Render uses $PORT env variable, default 10000)
EXPOSE 10000

# Start FastAPI via uvicorn - reads PORT from environment (Render injects this automatically)
CMD ["/bin/sh", "-c", "/app/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}"]
