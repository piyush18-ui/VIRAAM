import hashlib
import time
import uuid
import datetime
from typing import Optional, Tuple
from sqlmodel import Session, select
from ..models import Hold, Cosign, Case, Transaction
from .audit_log import record_audit_event

SAFE_WORDS = [
    "lotus", "banyan", "river", "cedar", "amber", "meadow",
    "harbor", "solace", "summit", "beacon", "pebble", "willow",
    "haven", "breeze", "granite", "silver", "valley", "falcon",
    "monarch", "compass", "horizon", "timber", "cascade", "sparrow"
]

def generate_safe_phrase(seed_str: str) -> str:
    window = int(time.time() // 300) # 5-minute rotating window
    raw = f"{seed_str}_{window}".encode()
    digest = hashlib.sha256(raw).hexdigest()
    idx1 = int(digest[0:4], 16) % len(SAFE_WORDS)
    idx2 = int(digest[4:8], 16) % len(SAFE_WORDS)
    if idx1 == idx2:
        idx2 = (idx2 + 1) % len(SAFE_WORDS)
    return f"{SAFE_WORDS[idx1]} {SAFE_WORDS[idx2]}"

def create_hold(
    session: Session,
    case_id: str,
    tx_id: str,
    duration_minutes: int = 15,
    consent_given: bool = True,
    actor: str = "system"
) -> Hold:
    now = datetime.datetime.now(datetime.timezone.utc)
    expires_at = now + datetime.timedelta(minutes=duration_minutes)
    
    hold = Hold(
        id=f"hld_{uuid.uuid4().hex[:12]}",
        case_id=case_id,
        tx_id=tx_id,
        started_at=now,
        expires_at=expires_at,
        consent_given=consent_given,
        state="active"
    )
    session.add(hold)
    
    # Update transaction status
    tx = session.get(Transaction, tx_id)
    if tx:
        tx.status = "held"
        session.add(tx)
        
    # Update case status
    c = session.get(Case, case_id)
    if c:
        c.status = "held"
        session.add(c)
        
    session.commit()
    session.refresh(hold)
    
    record_audit_event(
        session,
        action="HOLD_CREATED",
        actor=actor,
        case_id=case_id,
        detail={
            "hold_id": hold.id,
            "tx_id": tx_id,
            "duration_minutes": duration_minutes,
            "consent_given": consent_given,
            "expires_at": expires_at.isoformat()
        }
    )
    return hold

def release_hold(
    session: Session,
    hold_id: str,
    actor: str = "user",
    reason: str = "User confirmed safe transfer"
) -> Optional[Hold]:
    hold = session.get(Hold, hold_id)
    if not hold:
        return None
    hold.state = "released"
    session.add(hold)
    
    tx = session.get(Transaction, hold.tx_id)
    if tx:
        tx.status = "released"
        session.add(tx)
        
    c = session.get(Case, hold.case_id)
    if c:
        c.status = "resolved"
        session.add(c)
        
    session.commit()
    session.refresh(hold)
    
    record_audit_event(
        session,
        action="HOLD_RELEASED",
        actor=actor,
        case_id=hold.case_id,
        detail={"hold_id": hold.id, "reason": reason}
    )
    return hold

def create_cosign_challenge(
    session: Session,
    case_id: str,
    family_contact_alias: str = "Priya (Daughter)"
) -> Tuple[Cosign, str]:
    phrase = generate_safe_phrase(case_id)
    phrase_hash = hashlib.sha256(phrase.lower().strip().encode()).hexdigest()
    
    cosign = Cosign(
        id=f"csg_{uuid.uuid4().hex[:12]}",
        case_id=case_id,
        family_contact_alias=family_contact_alias,
        challenge_phrase_hash=phrase_hash,
        challenge_phrase_plain=phrase,
        result="pending",
        updated_at=datetime.datetime.now(datetime.timezone.utc)
    )
    session.add(cosign)
    session.commit()
    session.refresh(cosign)
    
    record_audit_event(
        session,
        action="COSIGN_CHALLENGE_CREATED",
        actor="system",
        case_id=case_id,
        detail={
            "cosign_id": cosign.id,
            "family_contact": family_contact_alias,
            "phrase_mask": phrase[:3] + "..."
        }
    )
    return cosign, phrase

def resolve_cosign(
    session: Session,
    cosign_id: str,
    decision: str, # approve | deny
    phrase_attempt: Optional[str] = None,
    actor: str = "family_member"
) -> Tuple[Optional[Cosign], bool, str]:
    cosign = session.get(Cosign, cosign_id)
    if not cosign:
        return None, False, "Cosign challenge not found"
        
    if decision == "deny":
        cosign.result = "denied"
        cosign.updated_at = datetime.datetime.now(datetime.timezone.utc)
        session.add(cosign)
        session.commit()
        session.refresh(cosign)
        
        record_audit_event(
            session,
            action="COSIGN_DENIED",
            actor=actor,
            case_id=cosign.case_id,
            detail={"cosign_id": cosign.id, "reason": "Family denied authorization"}
        )
        return cosign, True, "Transfer blocked and hold maintained by family co-signer"

    # For approval, verify safe phrase if provided
    if phrase_attempt:
        attempt_hash = hashlib.sha256(phrase_attempt.lower().strip().encode()).hexdigest()
        if attempt_hash != cosign.challenge_phrase_hash:
            record_audit_event(
                session,
                action="COSIGN_FAILED_PHRASE",
                actor=actor,
                case_id=cosign.case_id,
                detail={"cosign_id": cosign.id}
            )
            return cosign, False, "Safe-phrase did not match rotating secret"

    cosign.result = "approved"
    cosign.updated_at = datetime.datetime.now(datetime.timezone.utc)
    session.add(cosign)
    
    # Check if there is an active hold on this case to release or modify
    statement = select(Hold).where(Hold.case_id == cosign.case_id, Hold.state == "active")
    active_holds = session.exec(statement).all()
    for h in active_holds:
        h.state = "released"
        session.add(h)
        
    c = session.get(Case, cosign.case_id)
    if c:
        c.status = "resolved"
        session.add(c)
        
    session.commit()
    session.refresh(cosign)
    
    record_audit_event(
        session,
        action="COSIGN_APPROVED",
        actor=actor,
        case_id=cosign.case_id,
        detail={"cosign_id": cosign.id, "result": "approved"}
    )
    return cosign, True, "Transfer approved by family co-sign"
