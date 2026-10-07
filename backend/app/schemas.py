import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class Reason(BaseModel):
    feature: str
    contribution: float
    human_text: str

class RiskScoreRequest(BaseModel):
    account_id: str = "ACC_1042"
    beneficiary_account_id: str = "MULE_L1_01"
    amount: float = 485000.0
    channel: str = "UPI"
    # Call context signals (simulated metadata only, no audio)
    in_call: bool = False
    call_duration_min: float = 0.0
    caller_saved: bool = True
    caller_type: str = "known" # unknown, spoofed_official, known
    remote_access_active: bool = False
    screen_share_active: bool = False
    beneficiary_is_new: bool = True
    beneficiary_account_age_days: Optional[int] = None
    hour_of_day: Optional[int] = None

class RiskScoreResponse(BaseModel):
    risk_score: float # 0 - 100
    band: str # low, medium, high, critical
    action_recommended: str # pass, soft_nudge, cooling_off_hold, hold_and_cosign
    reasons: List[Reason]
    hold_duration_minutes: int = 0
    cosign_required: bool = False

class HoldRequest(BaseModel):
    consent: bool = True
    duration_minutes: Optional[int] = 15

class CosignRequest(BaseModel):
    decision: str # approve | deny
    phrase_attempt: Optional[str] = None

class FreezePlanItem(BaseModel):
    account_id: str
    holder_alias: str
    bank_alias: str
    layer: int
    expected_recoverable_amount: float
    probability_funds_present: float
    urgency: float
    score: float
    reason: str
    recommended_action: str
    estimated_window_sec: int

class FreezePlanResponse(BaseModel):
    case_id: str
    total_at_risk: float
    total_recoverable: float
    nodes_count: int
    items: List[FreezePlanItem]
    generated_at: datetime.datetime

class ExecutePlanResponse(BaseModel):
    case_id: str
    frozen_accounts: List[str]
    frozen_amount: float
    status: str
    with_viraam_recovered: float
    without_viraam_recovered: float

class ScenarioRequest(BaseModel):
    scenario: str # digital_arrest_classic, family_impersonation, false_positive_legit
    speed: str = "1x" # 1x, 5x, 20x

class ModelMetricsResponse(BaseModel):
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    confusion_matrix: Dict[str, int]
    feature_importances: List[Dict[str, Any]]
    dataset_disclaimer: str

class OverviewMetricsResponse(BaseModel):
    transfers_screened: int
    holds_placed: int
    estimated_loss_prevented: float
    median_time_to_hold_sec: float
    false_positive_rate: float
    sparklines: Dict[str, List[float]]

class AuditEventResponse(BaseModel):
    id: str
    ts: datetime.datetime
    actor: str
    action: str
    case_id: Optional[str] = None
    detail: Dict[str, Any]
