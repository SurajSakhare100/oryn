from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserAuthRequest(BaseModel):
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=6, description="User's password (min 6 characters)")

class UserRegisterRequest(BaseModel):
    email: EmailStr = Field(..., description="User's email address")
    username: str = Field(..., min_length=3, max_length=30, description="Unique username")
    password: str = Field(..., min_length=6, description="User's password (min 6 characters)")

class TokenResponse(BaseModel):
    accessToken: str = Field(..., alias="accessToken")
    tokenType: str = Field("bearer", alias="tokenType")
    userId: str = Field(..., alias="userId")
    email: str = Field(...)
    username: str = Field(...)

    class Config:
        populate_by_name = True

class UserResponse(BaseModel):
    id: str
    email: str
    username: str

    class Config:
        from_attributes = True

