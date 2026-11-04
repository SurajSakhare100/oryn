from fastapi import Header, HTTPException, status
from typing import Optional

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
