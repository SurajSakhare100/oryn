import logging
from fastapi import Request, Response, status
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("uvicorn")

class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except Exception as e:
            logger.error(f"Unhandled exception occurred during request: {request.method} {request.url.path} - Error: {e}", exc_info=True)
            return Response(
                content='{"detail": "Oryn could not complete this request. Please try again shortly."}',
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                media_type="application/json"
            )
