"""
backend/app/services/audit_service.py
Service for recording immutable audit logs for all procurement and verification actions.
"""

import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.db.models import AuditLog

def log_action(
    db: Session,
    user: str,
    action: str,
    entity: str,
    entity_id: str = None,
    source: str = "SYSTEM",
    result: str = "SUCCESS",
    details: dict = None
) -> AuditLog:
    """Creates a persistent audit record."""
    log_entry = AuditLog(
        timestamp=datetime.now(timezone.utc),
        user=user,
        action=action,
        entity=entity,
        entity_id=entity_id,
        source=source,
        result=result,
        details_json=json.dumps(details, default=str) if details else None
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry
