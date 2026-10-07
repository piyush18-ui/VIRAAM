import datetime
from typing import Optional
from sqlmodel import Field, SQLModel

def get_utc_now() -> datetime.datetime:
    return datetime.datetime.now(datetime.timezone.utc)

class Account(SQLModel, table=True):
    id: str = Field(primary_key=True)
    holder_alias: str
    bank_alias: str
    age_days: int
    kind: str = Field(default="customer", description="customer | mule | cashout")
    balance: float = Field(default=0.0)
    device_hash: str = Field(default="")
    ip_hash: str = Field(default="")
    created_at: datetime.datetime = Field(default_factory=get_utc_now)

class Transaction(SQLModel, table=True):
    id: str = Field(primary_key=True)
    ts: datetime.datetime = Field(default_factory=get_utc_now)
    from_account: str = Field(index=True)
    to_account: str = Field(index=True)
    amount: float
    channel: str = Field(default="UPI")
    beneficiary_is_new: bool = Field(default=False)
    case_id: Optional[str] = Field(default=None, index=True)
    status: str = Field(default="completed", description="completed | held | released | blocked")

class CallContext(SQLModel, table=True):
    id: str = Field(primary_key=True)
    ts: datetime.datetime = Field(default_factory=get_utc_now)
    account_id: str = Field(index=True)
    in_call: bool = Field(default=False)
    duration_sec: int = Field(default=0)
    caller_saved_contact: bool = Field(default=True)
    caller_type: str = Field(default="known", description="unknown | spoofed_official | known")
    remote_access_active: bool = Field(default=False)
    screen_share_active: bool = Field(default=False)

class Case(SQLModel, table=True):
    id: str = Field(primary_key=True)
    victim_account: str = Field(index=True)
    status: str = Field(default="open", description="open | held | resolved | frozen")
    risk_score: float = Field(default=0.0)
    created_at: datetime.datetime = Field(default_factory=get_utc_now)
    summary: str = Field(default="")
    initial_tx_id: Optional[str] = Field(default=None)

class Hold(SQLModel, table=True):
    id: str = Field(primary_key=True)
    case_id: str = Field(index=True)
    tx_id: str = Field(index=True)
    started_at: datetime.datetime = Field(default_factory=get_utc_now)
    expires_at: datetime.datetime
    consent_given: bool = Field(default=True)
    state: str = Field(default="active", description="active | released | expired")

class Cosign(SQLModel, table=True):
    id: str = Field(primary_key=True)
    case_id: str = Field(index=True)
    family_contact_alias: str
    challenge_phrase_hash: str
    challenge_phrase_plain: Optional[str] = None
    result: str = Field(default="pending", description="pending | approved | denied")
    updated_at: datetime.datetime = Field(default_factory=get_utc_now)

class AuditEvent(SQLModel, table=True):
    id: str = Field(primary_key=True)
    ts: datetime.datetime = Field(default_factory=get_utc_now)
    actor: str = Field(default="system")
    action: str
    case_id: Optional[str] = Field(default=None, index=True)
    detail_json: str = Field(default="{}")
