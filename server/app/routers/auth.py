from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.auth import UserAuthRequest, TokenResponse, UserResponse
from app.db import db_helper
from app.services.auth_service import hash_password, verify_password, create_access_token
from app.dependencies import get_current_user_id
import logging

logger = logging.getLogger("uvicorn")
router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/signup", response_model=TokenResponse)
async def signup(request: UserAuthRequest):
    """
    Register a new user and return a JWT access token.
    """
    email = request.email.lower().strip()
    password = request.password
    
    if not db_helper.prisma or not db_helper.prisma.is_connected():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection is not active"
        )
        
    try:
        # Check if email already exists
        existing_user = await db_helper.prisma.user.find_unique(
            where={"email": email}
        )
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
            
        # Hash password and create user
        password_hash = hash_password(password)
        user = await db_helper.prisma.user.create(
            data={
                "email": email,
                "passwordHash": password_hash
            }
        )
        
        # Create token
        token = create_access_token(user.id, user.email)
        return TokenResponse(
            accessToken=token,
            tokenType="bearer",
            userId=user.id,
            email=user.email
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in signup: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while creating user: {str(e)}"
        )

@router.post("/login", response_model=TokenResponse)
async def login(request: UserAuthRequest):
    """
    Authenticate user and return a JWT access token.
    """
    email = request.email.lower().strip()
    password = request.password
    
    if not db_helper.prisma or not db_helper.prisma.is_connected():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection is not active"
        )
        
    try:
        user = await db_helper.prisma.user.find_unique(
            where={"email": email}
        )
        if not user or not verify_password(password, user.passwordHash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
            
        token = create_access_token(user.id, user.email)
        return TokenResponse(
            accessToken=token,
            tokenType="bearer",
            userId=user.id,
            email=user.email
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during authentication"
        )

@router.get("/me", response_model=UserResponse)
async def get_me(user_id: str = Depends(get_current_user_id)):
    """
    Get the authenticated user's details.
    """
    if not db_helper.prisma or not db_helper.prisma.is_connected():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection is not active"
        )
        
    try:
        user = await db_helper.prisma.user.find_unique(
            where={"id": user_id}
        )
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return UserResponse(id=user.id, email=user.email)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_me: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while fetching user details"
        )
