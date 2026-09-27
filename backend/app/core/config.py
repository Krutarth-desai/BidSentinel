"""
backend/app/core/config.py
Configuration settings for BidSentinel.
"""

import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
DATA_DIR = BASE_DIR / "data"
UPLOAD_DIR = BASE_DIR / "documents" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Auto-load .env from root or backend directory if present
for env_file in [BASE_DIR / ".env", BASE_DIR / "backend" / ".env"]:
    if env_file.exists():
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip().strip("'\"")
                    if k not in os.environ:
                        os.environ[k] = v

raw_db_url = os.getenv("DATABASE_URL")
if raw_db_url:
    # Supabase / Cloud providers frequently use 'postgres://' which SQLAlchemy 2.0 requires as 'postgresql://'
    if raw_db_url.startswith("postgres://"):
        raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)
    DB_URL = raw_db_url
else:
    DB_URL = f"sqlite:///{BASE_DIR / 'backend' / 'bidsentinel.db'}"

class Settings(BaseModel):
    PROJECT_NAME: str = "BidSentinel — AI-Powered GeM Bid Compliance Verification"
    VERSION: str = "1.0.0-SIH2026"
    API_V1_PREFIX: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "bidsentinel-sih-secret-key-2026-supersecure-prototype")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # Database (SQLite default, or Supabase / PostgreSQL via DATABASE_URL)
    DATABASE_URL: str = DB_URL
    
    # Demo credentials
    DEMO_OFFICER_EMAIL: str = os.getenv("DEMO_OFFICER_EMAIL", "officer@gem-demo.gov.in")
    DEMO_OFFICER_PASSWORD: str = os.getenv("DEMO_OFFICER_PASSWORD", "demo123")
    DEMO_OFFICER_NAME: str = "Dr. Rajeshwar Sharma, IAS"
    DEMO_OFFICER_DESIGNATION: str = "Senior Procurement Officer (GeM Directorate)"
    
    # Mock Government Mode
    PROTOTYPE_MODE: bool = True
    GOVT_SOURCE_LABEL: str = "Prototype / Mock Government Connector"

settings = Settings()
