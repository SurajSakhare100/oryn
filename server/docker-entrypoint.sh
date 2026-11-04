#!/bin/sh
set -eu

PUBLIC_PORT="${PORT:-10000}"
AI_PORT="${AI_INTERNAL_PORT:-8765}"
if [ "$AI_PORT" = "$PUBLIC_PORT" ]; then
  if [ "$PUBLIC_PORT" = "8765" ]; then
    AI_PORT=8000
  else
    AI_PORT=8765
  fi
fi

echo "Starting AI service on internal port $AI_PORT and public API on port $PUBLIC_PORT."

PORT="$AI_PORT" HOST="127.0.0.1" \
  /app/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port "$AI_PORT" &
AI_PID=$!

PORT_API="$PUBLIC_PORT" AI_SERVICE_URL="http://127.0.0.1:$AI_PORT" \
  NODE_ENV="${NODE_ENV:-production}" node /app/api/dist/index.js &
API_PID=$!

stop_services() {
  kill "$API_PID" "$AI_PID" 2>/dev/null || true
  wait "$API_PID" 2>/dev/null || true
  wait "$AI_PID" 2>/dev/null || true
}

trap stop_services INT TERM

while kill -0 "$API_PID" 2>/dev/null && kill -0 "$AI_PID" 2>/dev/null; do
  sleep 2
done

echo "A service process exited; stopping the container."
stop_services
exit 1
