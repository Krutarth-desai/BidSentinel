"""
backend/app/api/auth.py
Authentication endpoints for GeM Procurement Officers.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User
from app.schemas.auth import LoginRequest, TokenResponse
from app.core.security import verify_password, create_access_token, get_current_user_email
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.username).first()
    # Support login with default demo officer credentials if not seeded yet
    if not user and request.username == settings.DEMO_OFFICER_EMAIL:
        if request.password == settings.DEMO_OFFICER_PASSWORD:
            token = create_access_token({"sub": settings.DEMO_OFFICER_EMAIL, "role": "PROCUREMENT_OFFICER"})
            return {
                "access_token": token,
                "token_type": "bearer",
                "user": {
                    "email": settings.DEMO_OFFICER_EMAIL,
                    "full_name": settings.DEMO_OFFICER_NAME,
                    "designation": settings.DEMO_OFFICER_DESIGNATION,
                    "role": "PROCUREMENT_OFFICER",
                    "department": "Public Sector Engineering Division"
                }
            }

    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Use officer@gem-demo.gov.in / demo123"
        )

    token = create_access_token({"sub": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "email": user.email,
            "full_name": user.full_name,
            "designation": user.designation,
            "role": user.role,
            "department": user.department
        }
    }

@router.get("/me")
def get_current_user_profile(
    email: str = Depends(get_current_user_email),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == email).first()
    if user:
        return {
            "email": user.email,
            "full_name": user.full_name,
            "designation": user.designation,
            "role": user.role,
            "department": user.department
        }
    return {
        "email": settings.DEMO_OFFICER_EMAIL,
        "full_name": settings.DEMO_OFFICER_NAME,
        "designation": settings.DEMO_OFFICER_DESIGNATION,
        "role": "PROCUREMENT_OFFICER",
        "department": "Public Sector Engineering Division"
    }
