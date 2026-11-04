# Build the Express API and its generated Prisma client.
FROM node:22-bookworm-slim AS api-builder
WORKDIR /app/api
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY api/package.json api/package-lock.json ./
RUN npm ci
COPY api ./
RUN DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build" \
    DIRECT_URL="postgresql://build:build@127.0.0.1:5432/build" \
    npx prisma generate --schema=prisma/schema.prisma \
    && npm run build

# Generate the Python Prisma client and install the AI service dependencies.
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS python-builder
WORKDIR /app
ENV UV_COMPILE_BYTECODE=1
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates libatomic1 \
    && rm -rf /var/lib/apt/lists/*
COPY pyproject.toml uv.lock ./
RUN uv sync --no-dev --no-install-project
COPY prisma ./prisma
RUN uv run prisma generate --schema=prisma/schema.prisma

# Run Express as the public API gateway and FastAPI on the container's loopback.
FROM python:3.12-slim AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates libatomic1 \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=python-builder /app/.venv /app/.venv
COPY --from=python-builder /root/.cache/prisma-python /root/.cache/prisma-python
COPY --from=api-builder /usr/local/bin/node /usr/local/bin/node
COPY . /app
COPY --from=api-builder /app/api/node_modules /app/api/node_modules
COPY --from=api-builder /app/api/dist /app/api/dist
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh
ENV PATH="/app/.venv/bin:$PATH"
EXPOSE 10000
CMD ["/app/docker-entrypoint.sh"]
