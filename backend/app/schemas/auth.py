"""
backend/app/schemas/auth.py
Pydantic models for authentication and user profiles.
"""

from typing import Optional
from pydantic import BaseModel

class LoginRequest(BaseModel):
    username: str # email or username
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class UserProfile(BaseModel):
    email: str
    full_name: str
    role: str
    designation: Optional[str] = None
    department: Optional[str] = None
