import bcrypt
import jwt
import datetime
import os
from typing import Optional, Dict, Any
from app.config import settings

import secrets

# Authentication settings
JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    # Safe dynamic fallback for development if not explicitly configured in environment
    JWT_SECRET = secrets.token_hex(32)

JWT_ALGORITHM = "HS256"
TOKEN_EXPIRY_DAYS = 7

def hash_password(password: str) -> str:
    """
    Hashes a password using bcrypt.
    """
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(password: str, hashed_password: str) -> bool:
    """
    Verifies a password against its bcrypt hash.
    """
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def create_access_token(user_id: str, email: str) -> str:
    """
    Creates a JWT token for the user.
    """
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=TOKEN_EXPIRY_DAYS),
        "iat": datetime.datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decodes and validates a JWT access token.
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
