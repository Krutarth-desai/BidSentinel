"""
backend/app/core/config.py
Configuration settings for BidSentinel.
"""

from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
DATA_DIR = BASE_DIR / "data"
UPLOAD_DIR = BASE_DIR / "documents" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseModel):
    PROJECT_NAME: str = "BidSentinel — AI-Powered GeM Bid Compliance Verification"
    VERSION: str = "1.0.0-SIH2026"
    API_V1_PREFIX: str = "/api/v1"
    SECRET_KEY: str = "bidsentinel-sih-secret-key-2026-supersecure-prototype"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # Database
    DATABASE_URL: str = f"sqlite:///{BASE_DIR / 'backend' / 'bidsentinel.db'}"
    
    # Document Ingestion Security Settings
    MAX_DOCUMENT_SIZE_MB: int = 25
    DOCUMENT_STORAGE_PATH: Path = UPLOAD_DIR
    ALLOWED_DOCUMENT_EXTENSIONS: list[str] = [".pdf", ".png", ".jpg", ".jpeg", ".webp"]
    ALLOWED_DOCUMENT_MIME_TYPES: list[str] = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/webp"
    ]

    # Demo credentials
    DEMO_OFFICER_EMAIL: str = "officer@gem-demo.gov.in"
    DEMO_OFFICER_PASSWORD: str = "demo123"
    DEMO_OFFICER_NAME: str = "Dr. Rajeshwar Sharma, IAS"
    DEMO_OFFICER_DESIGNATION: str = "Senior Procurement Officer (GeM Directorate)"
    
    # Mock Government Mode
    PROTOTYPE_MODE: bool = True
    GOVT_SOURCE_LABEL: str = "Prototype / Mock Government Connector"

settings = Settings()
