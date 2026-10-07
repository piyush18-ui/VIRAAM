import json
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from ..db import get_session
from ..services.audit_log import get_audit_events
from ..schemas import AuditEventResponse

router = APIRouter(prefix="/audit", tags=["audit"])

@router.get("", response_model=List[AuditEventResponse])
def list_audit_events(
    case_id: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    limit: int = Query(100),
    session: Session = Depends(get_session)
):
    events = get_audit_events(session, case_id=case_id, action=action, limit=limit)
    res = []
    for e in events:
        try:
            detail = json.loads(e.detail_json)
        except Exception:
            detail = {}
        res.append(AuditEventResponse(
            id=e.id,
            ts=e.ts,
            actor=e.actor,
            action=e.action,
            case_id=e.case_id,
            detail=detail
        ))
    return res
