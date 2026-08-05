from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserAuthRequest(BaseModel):
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=6, description="User's password (min 6 characters)")

class TokenResponse(BaseModel):
    accessToken: str = Field(..., alias="accessToken")
    tokenType: str = Field("bearer", alias="tokenType")
    userId: str = Field(..., alias="userId")
    email: str = Field(...)

    class Config:
        populate_by_name = True

class UserResponse(BaseModel):
    id: str
    email: str

    class Config:
        from_attributes = True
