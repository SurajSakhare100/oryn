from fastapi import Header, HTTPException, status
from app.services.auth_service import decode_access_token
from app.db import db_helper
from typing import Optional

async def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    """
    Dependency to validate JWT and return the current user's ID.
    Raises 401 if token is missing or invalid.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header is missing"
        )
        
    try:
        # Bearer <token>
        if not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authorization schema (must be Bearer)"
            )
            
        token = authorization.split(" ")[1]
        payload = decode_access_token(token)
        if not payload or "sub" not in payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token is invalid or expired"
            )
            
        user_id = payload["sub"]
        return user_id
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token validation failed"
        )

async def get_optional_user_id(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """
    Dependency that optionally extracts the user ID if the header is provided.
    Does not raise errors if header is missing, but raises 401 if header is present but invalid.
    """
    if not authorization:
        return None
        
    try:
        if not authorization.startswith("Bearer "):
            return None
        token = authorization.split(" ")[1]
        payload = decode_access_token(token)
        if payload and "sub" in payload:
            return payload["sub"]
    except Exception:
        pass
    return None
