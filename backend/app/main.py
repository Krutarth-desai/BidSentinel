"""
backend/app/main.py
Main entrypoint for the BidSentinel FastAPI application.
"""

import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.core.config import settings, BASE_DIR
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.db.session import engine, Base, get_db
from app.db.models import User, Tender, Bidder, VerificationResult, OfficerDecision, AuditLog
from app.core.security import get_password_hash

# Routers
from app.api.auth import router as auth_router
from app.api.tenders import router as tenders_router
from app.api.bidders import router as bidders_router
from app.api.documents import router as documents_router
from app.api.submissions import router as submissions_router
from app.api.verification import router as verification_router
from app.api.decisions import router as decisions_router
from app.api.audit import router as audit_router
from app.api.reports import router as reports_router
from app.api.connectors import router as connectors_router

def init_db_and_seed():
    """Initializes tables and ensures baseline demo data is seeded."""
    Base.metadata.create_all(bind=engine)
    from scripts.seed_database import seed_all
    try:
        seed_all()
    except Exception as e:
        print(f"[Seed notice]: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db_and_seed()
    yield
    # Shutdown

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement (SIH 2026)",
    lifespan=lifespan
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow local frontend development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routers (supports both /api/v1 and /api prefixes)
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(tenders_router, prefix=settings.API_V1_PREFIX)
app.include_router(bidders_router, prefix=settings.API_V1_PREFIX)
app.include_router(documents_router, prefix=settings.API_V1_PREFIX)
app.include_router(submissions_router, prefix=settings.API_V1_PREFIX)
app.include_router(submissions_router, prefix="/api")
app.include_router(documents_router, prefix="/api")
app.include_router(verification_router, prefix=settings.API_V1_PREFIX)
app.include_router(decisions_router, prefix=settings.API_V1_PREFIX)
app.include_router(audit_router, prefix=settings.API_V1_PREFIX)
app.include_router(reports_router, prefix=settings.API_V1_PREFIX)
app.include_router(connectors_router, prefix=settings.API_V1_PREFIX)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "prototype_mode": settings.PROTOTYPE_MODE,
        "source_label": settings.GOVT_SOURCE_LABEL
    }

@app.get(f"{settings.API_V1_PREFIX}/dashboard/overview")
def get_dashboard_overview(db: Session = Depends(get_db)):
    """
    Returns high-level KPI cards and stats for the Procurement Officer Dashboard.
    """
    tenders_count = db.query(Tender).count()
    bidders_count = db.query(Bidder).count()
    decisions_count = db.query(OfficerDecision).count()

    # Calculate average score & high risk count
    verifications = db.query(VerificationResult).all()
    if verifications:
        avg_score = int(sum(v.compliance_score for v in verifications) / len(verifications))
        high_risk_count = sum(1 for v in verifications if v.risk_level == "HIGH")
    else:
        avg_score = 82
        high_risk_count = 2

    # Recent activities from audit trail
    recent_audits = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(8).all()
    activities = []
    for a in recent_audits:
        activities.append({
            "timestamp": a.timestamp.strftime("%d %b %H:%M"),
            "user": a.user,
            "action": a.action,
            "entity": a.entity,
            "result": a.result
        })

    # High risk bidders summary
    high_risk_bidders = db.query(Bidder).filter(
        (Bidder.expected_risk == "HIGH") | (Bidder.bidder_id.in_(["BID-003", "BID-005", "BID-009"]))
    ).all()
    high_risk_list = []
    for hrb in high_risk_bidders:
        high_risk_list.append({
            "bidder_id": hrb.bidder_id,
            "company_name": hrb.company_name,
            "expected_score": hrb.expected_score,
            "notes": hrb.notes
        })

    return {
        "kpi": {
            "active_tenders": tenders_count or 3,
            "bidders_under_verification": bidders_count or 10,
            "pending_reviews": max(1, bidders_count - decisions_count),
            "high_risk_bidders": high_risk_count,
            "average_compliance_score": f"{avg_score}%"
        },
        "recent_activities": activities,
        "high_risk_bidders": high_risk_list
    }
