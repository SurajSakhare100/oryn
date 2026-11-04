import hmac
from fastapi import Header, HTTPException, status
from typing import Optional
from app.config import settings


async def require_api_gateway(x_oryn_api_key: Optional[str] = Header(None, alias="X-Oryn-API-Key")) -> None:
    """Accept AI-service requests only when the shared gateway key is valid."""
    expected = settings.AI_SERVICE_TOKEN
    if not expected:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service gateway authentication is not configured.",
        )

    if not x_oryn_api_key or not hmac.compare_digest(x_oryn_api_key, expected):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This endpoint accepts requests from the Oryn API only.",
        )

async def get_current_user_id(x_user_id: Optional[str] = Header(None)) -> str:
    """
    Dependency to extract the user ID forwarded from the Express API gateway.
    The Express API validates the JWT and injects X-User-Id into the request.
    Raises 401 if header is missing.
    """
    if not x_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="X-User-Id header is missing. Authenticate via the API gateway."
        )
    return x_user_id

async def get_optional_user_id(x_user_id: Optional[str] = Header(None)) -> Optional[str]:
    """
    Dependency that optionally extracts the user ID if the X-User-Id header is present.
    Does not raise errors if header is missing.
    """
    return x_user_id
