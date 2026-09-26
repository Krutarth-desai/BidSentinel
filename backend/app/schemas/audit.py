"""
backend/app/schemas/audit.py
Pydantic schemas for the immutable audit trail.
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel

class AuditLogResponse(BaseModel):
    id: int
    timestamp: str
    user: str
    action: str
    entity: str
    entity_id: Optional[str] = None
    source: str
    result: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True
