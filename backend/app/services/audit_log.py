import json
import uuid
import datetime
from typing import Optional, Dict, Any, List
from sqlmodel import Session, select
from ..models import AuditEvent

def record_audit_event(
    session: Session,
    action: str,
    actor: str = "system",
    case_id: Optional[str] = None,
    detail: Optional[Dict[str, Any]] = None
) -> AuditEvent:
    event = AuditEvent(
        id=f"aud_{uuid.uuid4().hex[:12]}",
        ts=datetime.datetime.now(datetime.timezone.utc),
        actor=actor,
        action=action,
        case_id=case_id,
        detail_json=json.dumps(detail or {})
    )
    session.add(event)
    session.commit()
    session.refresh(event)
    return event

def get_audit_events(
    session: Session,
    case_id: Optional[str] = None,
    action: Optional[str] = None,
    limit: int = 100
) -> List[AuditEvent]:
    query = select(AuditEvent).order_by(AuditEvent.ts.desc()).limit(limit)
    if case_id:
        query = query.where(AuditEvent.case_id == case_id)
    if action:
        query = query.where(AuditEvent.action == action)
    return list(session.exec(query).all())
