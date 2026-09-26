"""
backend/app/api/audit.py
Audit Trail API for transparency, compliance tracing, and accountability.
"""

import json
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import AuditLog

router = APIRouter(prefix="/audit", tags=["Audit Trail"])

@router.get("/")
def list_audit_logs(
    limit: int = Query(50, ge=1, le=500),
    entity: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    if entity:
        query = query.filter(AuditLog.entity == entity.upper())
    if action:
        query = query.filter(AuditLog.action == action.upper())

    logs = query.order_by(AuditLog.timestamp.desc()).limit(limit).all()

    results = []
    for l in logs:
        details = None
        if l.details_json:
            try:
                details = json.loads(l.details_json)
            except Exception:
                details = {"raw": l.details_json}

        results.append({
            "id": l.id,
            "timestamp": l.timestamp.strftime("%d %b %Y %H:%M:%S UTC"),
            "user": l.user,
            "action": l.action,
            "entity": l.entity,
            "entity_id": l.entity_id,
            "source": l.source,
            "result": l.result,
            "details": details
        })

    return results
