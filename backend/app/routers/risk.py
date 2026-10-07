from fastapi import APIRouter
from ..schemas import RiskScoreRequest, RiskScoreResponse
from ..services.risk_engine import risk_engine

router = APIRouter(prefix="/risk", tags=["risk"])

@router.post("/score", response_model=RiskScoreResponse)
def score_transfer(payload: RiskScoreRequest):
    # Compute relative amount ratio (baseline assumption 25,000 INR typical monthly transfer)
    ratio = max(0.5, payload.amount / 25000.0)
    
    # Calculate account age days if not explicitly provided
    age_days = float(payload.beneficiary_account_age_days) if payload.beneficiary_account_age_days is not None else (4.0 if payload.beneficiary_is_new else 365.0)

    # Set velocity proxy
    velocity = 12.0 if (payload.beneficiary_is_new and age_days < 15) else 0.5
    fanout = 5.0 if (payload.beneficiary_is_new and age_days < 15) else 0.2

    # Call signals
    in_call = payload.in_call
    call_dur = float(payload.call_duration_min)
    caller_unsaved = not payload.caller_saved
    remote_access = payload.remote_access_active
    screen_share = payload.screen_share_active
    
    # Hour unusual proxy
    hour_unusual = False
    if payload.hour_of_day is not None and (payload.hour_of_day < 6 or payload.hour_of_day > 23):
        hour_unusual = True

    # Round amount proxy (multiples of 10,000 or 50,000)
    round_amount = (payload.amount % 10000 == 0) and payload.amount >= 20000

    return risk_engine.score_transfer(
        amount_vs_typical_ratio=ratio,
        beneficiary_is_new=payload.beneficiary_is_new,
        beneficiary_account_age_days=age_days,
        beneficiary_inbound_velocity=velocity,
        beneficiary_fanout=fanout,
        in_call=in_call,
        call_duration_min=call_dur,
        caller_unsaved=caller_unsaved,
        remote_access_active=remote_access,
        screen_share_active=screen_share,
        hour_of_day_unusual=hour_unusual,
        round_amount=round_amount
    )
