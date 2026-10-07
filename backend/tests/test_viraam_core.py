import pytest
from sqlmodel import Session, SQLModel, create_engine
from app.services.risk_engine import risk_engine
from app.services.friction import create_hold, release_hold, create_cosign_challenge, resolve_cosign
from app.services.graph_engine import graph_engine
from app.services.audit_log import get_audit_events
from app.models import Case, Transaction, Account

# In-memory SQLite for testing
test_engine = create_engine("sqlite:///:memory:")

@pytest.fixture(autouse=True)
def setup_db(monkeypatch):
    SQLModel.metadata.create_all(test_engine)
    monkeypatch.setattr("app.db.engine", test_engine)
    monkeypatch.setattr("app.services.graph_engine.engine", test_engine)
    yield
    SQLModel.metadata.drop_all(test_engine)

def test_risk_scoring_critical_scam():
    res = risk_engine.score_transfer(
        amount_vs_typical_ratio=18.0,
        beneficiary_is_new=True,
        beneficiary_account_age_days=3.0,
        beneficiary_inbound_velocity=14.0,
        beneficiary_fanout=5.0,
        in_call=True,
        call_duration_min=35.0,
        caller_unsaved=True,
        remote_access_active=True,
        screen_share_active=True,
        hour_of_day_unusual=False,
        round_amount=True
    )
    assert res.risk_score >= 82.0
    assert res.band == "critical"
    assert res.action_recommended == "hold_and_cosign"
    assert res.cosign_required is True
    assert res.hold_duration_minutes == 30
    assert len(res.reasons) > 0
    # Ensure human readable explanation exists
    assert any("call" in r.human_text.lower() for r in res.reasons)

def test_false_positive_legit_stays_below_high():
    res = risk_engine.score_transfer(
        amount_vs_typical_ratio=3.0,
        beneficiary_is_new=False,
        beneficiary_account_age_days=400.0,
        beneficiary_inbound_velocity=0.3,
        beneficiary_fanout=0.1,
        in_call=True,
        call_duration_min=6.0,
        caller_unsaved=False, # SAVED CONTACT
        remote_access_active=False,
        screen_share_active=False,
        hour_of_day_unusual=False,
        round_amount=True
    )
    assert res.risk_score < 65.0
    assert res.band in ["low", "medium"]
    assert res.action_recommended in ["pass", "soft_nudge"]
    assert res.cosign_required is False
    assert res.hold_duration_minutes == 0

def test_hold_lifecycle():
    with Session(test_engine) as session:
        tx = Transaction(id="tx_test_1", from_account="ACC_1", to_account="ACC_2", amount=100000.0, status="completed")
        c = Case(id="case_test_1", victim_account="ACC_1", status="open", risk_score=88.0)
        session.add(tx)
        session.add(c)
        session.commit()

        # Place hold
        hold = create_hold(session, case_id="case_test_1", tx_id="tx_test_1", duration_minutes=15)
        assert hold.state == "active"
        
        session.refresh(tx)
        session.refresh(c)
        assert tx.status == "held"
        assert c.status == "held"

        # Release hold
        released = release_hold(session, hold_id=hold.id, actor="User")
        assert released is not None
        assert released.state == "released"
        
        session.refresh(tx)
        session.refresh(c)
        assert tx.status == "released"
        assert c.status == "resolved"

def test_cosign_workflow():
    with Session(test_engine) as session:
        c = Case(id="case_cosign_1", victim_account="ACC_1", status="held", risk_score=90.0)
        session.add(c)
        session.commit()

        cosign, phrase = create_cosign_challenge(session, case_id="case_cosign_1", family_contact_alias="Priya")
        assert cosign.result == "pending"
        assert len(phrase.split()) == 2 # 2 memorable words

        # Deny test
        res_cosign, ok, msg = resolve_cosign(session, cosign_id=cosign.id, decision="deny")
        assert ok is True
        assert res_cosign.result == "denied"

def test_freeze_plan_ordering():
    with Session(test_engine) as session:
        c = Case(id="case_fp_1", victim_account="ACC_1042", status="held", risk_score=95.0)
        tx = Transaction(id="tx_fp_1", from_account="ACC_1042", to_account="MULE_L1_01", amount=500000.0, case_id="case_fp_1")
        session.add(c)
        session.add(tx)
        session.commit()

        plan = graph_engine.generate_freeze_plan("case_fp_1")
        assert len(plan.items) >= 3
        # Check strict descending sort by score
        scores = [item.score for item in plan.items]
        assert scores == sorted(scores, reverse=True)
        # Priority 1 must be Layer 1 mule
        assert plan.items[0].layer == 1
        assert "MULE_L1" in plan.items[0].account_id

def test_audit_trail_recorded():
    with Session(test_engine) as session:
        tx = Transaction(id="tx_audit_1", from_account="ACC_1", to_account="ACC_2", amount=100000.0, status="completed")
        c = Case(id="case_audit_1", victim_account="ACC_1", status="open", risk_score=88.0)
        session.add(tx)
        session.add(c)
        session.commit()

        create_hold(session, case_id="case_audit_1", tx_id="tx_audit_1", duration_minutes=15)
        events = get_audit_events(session)
        assert len(events) > 0
        actions = [e.action for e in events]
        assert "HOLD_CREATED" in actions
