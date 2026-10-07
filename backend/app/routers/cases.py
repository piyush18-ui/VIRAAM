from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from ..db import get_session
from ..models import Case, Transaction, Hold, Cosign, CallContext, AuditEvent
from ..schemas import HoldRequest, CosignRequest
from ..services.friction import create_hold, release_hold, resolve_cosign
from ..services.simulator import broadcaster

router = APIRouter(prefix="/cases", tags=["cases"])

@router.get("")
def list_cases(session: Session = Depends(get_session)):
    cases = session.exec(select(Case).order_by(Case.created_at.desc())).all()
    res = []
    for c in cases:
        tx = session.exec(select(Transaction).where(Transaction.case_id == c.id)).first()
        hold = session.exec(select(Hold).where(Hold.case_id == c.id).order_by(Hold.started_at.desc())).first()
        res.append({
            "id": c.id,
            "victim_account": c.victim_account,
            "status": c.status,
            "risk_score": c.risk_score,
            "created_at": c.created_at,
            "summary": c.summary,
            "amount": tx.amount if tx else 0.0,
            "channel": tx.channel if tx else "UPI",
            "to_account": tx.to_account if tx else "Unknown",
            "hold_active": hold.state == "active" if hold else False
        })
    return res

@router.get("/{case_id}")
def get_case(case_id: str, session: Session = Depends(get_session)):
    case = session.get(Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    tx = session.exec(select(Transaction).where(Transaction.case_id == case_id)).first()
    holds = session.exec(select(Hold).where(Hold.case_id == case_id).order_by(Hold.started_at.desc())).all()
    cosigns = session.exec(select(Cosign).where(Cosign.case_id == case_id).order_by(Cosign.updated_at.desc())).all()
    call = session.exec(select(CallContext).where(CallContext.account_id == case.victim_account).order_by(CallContext.ts.desc())).first()
    audits = session.exec(select(AuditEvent).where(AuditEvent.case_id == case_id).order_by(AuditEvent.ts.desc())).all()

    return {
        "case": case,
        "transaction": tx,
        "holds": holds,
        "cosign": cosigns[0] if cosigns else None,
        "call_context": call,
        "audit_timeline": audits
    }

@router.post("/{case_id}/hold")
async def place_hold(case_id: str, payload: HoldRequest, session: Session = Depends(get_session)):
    case = session.get(Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    tx = session.exec(select(Transaction).where(Transaction.case_id == case_id)).first()
    if not tx:
        raise HTTPException(status_code=400, detail="No transaction linked to case")

    hold = create_hold(
        session=session,
        case_id=case_id,
        tx_id=tx.id,
        duration_minutes=payload.duration_minutes or 15,
        consent_given=payload.consent,
        actor="Investigator/User"
    )

    await broadcaster.broadcast("hold_started", {
        "case_id": case_id,
        "hold_id": hold.id,
        "duration_minutes": payload.duration_minutes or 15,
        "expires_at": hold.expires_at.isoformat()
    })

    return {"status": "success", "hold": hold}

@router.post("/{case_id}/release")
async def release_case_hold(case_id: str, session: Session = Depends(get_session)):
    hold = session.exec(select(Hold).where(Hold.case_id == case_id, Hold.state == "active")).first()
    if not hold:
        raise HTTPException(status_code=400, detail="No active hold found for case")

    released = release_hold(session, hold.id, actor="User Authorization")
    
    await broadcaster.broadcast("hold_released", {
        "case_id": case_id,
        "hold_id": hold.id
    })

    return {"status": "released", "hold": released}

@router.post("/{case_id}/cosign")
async def submit_cosign_decision(case_id: str, payload: CosignRequest, session: Session = Depends(get_session)):
    cosign = session.exec(select(Cosign).where(Cosign.case_id == case_id, Cosign.result == "pending")).first()
    if not cosign:
        raise HTTPException(status_code=400, detail="No pending co-sign challenge for this case")

    updated, ok, msg = resolve_cosign(
        session=session,
        cosign_id=cosign.id,
        decision=payload.decision,
        phrase_attempt=payload.phrase_attempt,
        actor="Family Contact"
    )

    await broadcaster.broadcast("cosign_resolved", {
        "case_id": case_id,
        "decision": payload.decision,
        "success": ok,
        "message": msg
    })

    return {"status": "ok" if ok else "rejected", "message": msg, "cosign": updated}
