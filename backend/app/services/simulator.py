import asyncio
import datetime
import random
import uuid
from typing import Dict, Any, List, Optional, Set
from sqlmodel import Session, select
from ..db import engine
from ..models import Account, Transaction, CallContext, Case
from .risk_engine import risk_engine
from .friction import create_hold, create_cosign_challenge
from .audit_log import record_audit_event

BANKS = ["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Punjab National Bank", "Kotak Mahindra"]

FIRST_NAMES = [
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan",
    "Shaurya", "Atharva", "Advik", "Pranav", "Advaith", "Aaryav", "Dhruv", "Kabir", "Rishi", "Dev",
    "Diya", "Saanvi", "Aanya", "Aadhya", "Pari", "Ananya", "Myra", "Riya", "Avani", "Isha"
]

LAST_NAMES = [
    "Sharma", "Verma", "Patel", "Iyer", "Rao", "Reddy", "Nair", "Gupta", "Mehta", "Singh",
    "Chopra", "Deshmukh", "Joshi", "Bose", "Menon", "Mukherjee", "Agarwal", "Bhat", "Kulkarni", "Mishra"
]

CASHOUT_ENTITIES = [
    ("CRYPTO_P2P_DESK_DELHI", "Binance/WazirX OTC Merchant Desk"),
    ("HAWALA_NETWORK_SURAT", "Angadia Courier Hub"),
    ("ATM_DISPERSAL_GRID_KOLKATA", "Automated Cash Dispenser Ring"),
    ("GIFT_VOUCHER_EXCHANGE", "Prepaid Card Clearing Gateway"),
    ("OFFSHORE_REMITTANCE_MUMBAI", "Cross-Border Merchant Route")
]

class EventBroadcaster:
    def __init__(self):
        self.subscribers: Set[asyncio.Queue] = set()

    async def subscribe(self) -> asyncio.Queue:
        q: asyncio.Queue = asyncio.Queue()
        self.subscribers.add(q)
        return q

    def unsubscribe(self, q: asyncio.Queue):
        self.subscribers.discard(q)

    async def broadcast(self, event_type: str, data: Dict[str, Any]):
        msg = {"type": event_type, "data": data, "ts": datetime.datetime.now(datetime.timezone.utc).isoformat()}
        for q in list(self.subscribers):
            try:
                await q.put(msg)
            except Exception:
                self.subscribers.discard(q)

broadcaster = EventBroadcaster()

class SimulatorService:
    def __init__(self):
        self.is_initialized = False
        self.active_scenario: Optional[str] = None
        self.active_case_id: Optional[str] = None
        self.simulation_speed: str = "1x"
        self._scenario_task: Optional[asyncio.Task] = None

    def initialize_world(self):
        with Session(engine) as session:
            count = session.exec(select(Account)).first()
            if count:
                self.is_initialized = True
                return

            random.seed(42)
            # 1. Create ~300 Customer Accounts
            for i in range(300):
                fn = random.choice(FIRST_NAMES)
                ln = random.choice(LAST_NAMES)
                acc = Account(
                    id=f"ACC_{1000 + i}",
                    holder_alias=f"{fn} {ln}",
                    bank_alias=random.choice(BANKS),
                    age_days=random.randint(45, 1800),
                    kind="customer",
                    balance=float(random.randint(25000, 850000)),
                    device_hash=f"dev_{uuid.uuid4().hex[:8]}",
                    ip_hash=f"ip_{uuid.uuid4().hex[:8]}"
                )
                session.add(acc)

            # 2. Create Layered Mule Accounts (~25 mules)
            # Layer 1: First-hop intake mules (very young, freshly recruited)
            for i in range(8):
                acc = Account(
                    id=f"MULE_L1_{i+1:02d}",
                    holder_alias=f"Rohan {random.choice(LAST_NAMES)} (M1)",
                    bank_alias=random.choice(BANKS),
                    age_days=random.randint(2, 14),
                    kind="mule",
                    balance=0.0,
                    device_hash=f"mule_dev_ring_A",
                    ip_hash=f"mule_ip_vpn_1"
                )
                session.add(acc)

            # Layer 2: Aggregator mules
            for i in range(12):
                acc = Account(
                    id=f"MULE_L2_{i+1:02d}",
                    holder_alias=f"Vikram {random.choice(LAST_NAMES)} (M2)",
                    bank_alias=random.choice(BANKS),
                    age_days=random.randint(10, 45),
                    kind="mule",
                    balance=0.0,
                    device_hash=f"mule_dev_ring_B",
                    ip_hash=f"mule_ip_vpn_2"
                )
                session.add(acc)

            # Layer 3: Dispersal mules
            for i in range(5):
                acc = Account(
                    id=f"MULE_L3_{i+1:02d}",
                    holder_alias=f"Kunal {random.choice(LAST_NAMES)} (M3)",
                    bank_alias=random.choice(BANKS),
                    age_days=random.randint(15, 60),
                    kind="mule",
                    balance=0.0,
                    device_hash=f"mule_dev_ring_C",
                    ip_hash=f"mule_ip_vpn_3"
                )
                session.add(acc)

            # 3. Create Cash-out Endpoints
            for code, name in CASHOUT_ENTITIES:
                acc = Account(
                    id=code,
                    holder_alias=name,
                    bank_alias="Dispersal Terminal",
                    age_days=180,
                    kind="cashout",
                    balance=0.0,
                    device_hash="terminal_exit",
                    ip_hash="terminal_exit_ip"
                )
                session.add(acc)

            session.commit()
            self.is_initialized = True

    async def start_scenario(self, scenario_name: str, speed: str = "1x") -> Dict[str, Any]:
        if self._scenario_task and not self._scenario_task.done():
            self._scenario_task.cancel()

        self.active_scenario = scenario_name
        self.simulation_speed = speed

        # Multiplier
        mult = 1.0
        if speed == "5x":
            mult = 5.0
        elif speed == "20x":
            mult = 20.0

        if scenario_name == "digital_arrest_classic":
            self._scenario_task = asyncio.create_task(self._run_digital_arrest_scenario(mult))
        elif scenario_name == "family_impersonation":
            self._scenario_task = asyncio.create_task(self._run_family_impersonation_scenario(mult))
        elif scenario_name == "false_positive_legit":
            self._scenario_task = asyncio.create_task(self._run_false_positive_scenario(mult))
        else:
            raise ValueError(f"Unknown scenario {scenario_name}")

        return {
            "status": "started",
            "scenario": scenario_name,
            "speed": speed,
            "message": f"Scenario {scenario_name} initiated at {speed} speed"
        }

    async def _run_digital_arrest_scenario(self, speed_mult: float):
        delay = lambda sec: asyncio.sleep(sec / speed_mult)
        victim_id = "ACC_1042" # Ramesh Verma (Elderly citizen)
        mule_l1 = "MULE_L1_01"

        with Session(engine) as session:
            # 1. Call context starts
            call = CallContext(
                id=f"call_{uuid.uuid4().hex[:8]}",
                account_id=victim_id,
                in_call=True,
                duration_sec=2280, # 38 mins
                caller_saved_contact=False,
                caller_type="spoofed_official",
                remote_access_active=True,
                screen_share_active=True
            )
            session.add(call)
            session.commit()

        await broadcaster.broadcast("call_alert", {
            "account_id": victim_id,
            "caller": "+91 98110 09823 (Spoofed: CBI Directorate)",
            "duration_sec": 2280,
            "remote_access": True,
            "screen_share": True
        })

        await delay(2.0)

        # 2. Extortion transfer initiated
        amount = 485000.0
        score_res = risk_engine.score_transfer(
            amount_vs_typical_ratio=18.5,
            beneficiary_is_new=True,
            beneficiary_account_age_days=4.0,
            beneficiary_inbound_velocity=14.0,
            beneficiary_fanout=5.0,
            in_call=True,
            call_duration_min=38.0,
            caller_unsaved=True,
            remote_access_active=True,
            screen_share_active=True,
            hour_of_day_unusual=False,
            round_amount=True
        )

        case_id = f"case_da_{uuid.uuid4().hex[:8]}"
        self.active_case_id = case_id
        tx_id = f"tx_{uuid.uuid4().hex[:8]}"

        with Session(engine) as session:
            tx = Transaction(
                id=tx_id,
                from_account=victim_id,
                to_account=mule_l1,
                amount=amount,
                channel="UPI-Instant",
                beneficiary_is_new=True,
                case_id=case_id,
                status="held"
            )
            session.add(tx)

            case = Case(
                id=case_id,
                victim_account=victim_id,
                status="held",
                risk_score=score_res.risk_score,
                summary=f"Digital Arrest Coercion: Spoofed CBI caller forced Rs {amount:,.0f} transfer under remote access",
                initial_tx_id=tx_id
            )
            session.add(case)
            session.commit()

            # Create Friction: Cooling-off hold
            hold = create_hold(
                session=session,
                case_id=case_id,
                tx_id=tx_id,
                duration_minutes=score_res.hold_duration_minutes,
                consent_given=True,
                actor="Viraam Engine"
            )

            # Create Family Co-sign Challenge
            cosign, phrase = create_cosign_challenge(
                session=session,
                case_id=case_id,
                family_contact_alias="Priya Verma (Daughter)"
            )

            hold_id = hold.id
            hold_expires_at = hold.expires_at.isoformat()
            cosign_id = cosign.id

        # Broadcast live events
        await broadcaster.broadcast("transaction", {
            "id": tx_id,
            "case_id": case_id,
            "from_account": victim_id,
            "to_account": mule_l1,
            "amount": amount,
            "status": "held",
            "risk_score": score_res.risk_score,
            "band": score_res.band
        })

        await broadcaster.broadcast("risk_alert", {
            "case_id": case_id,
            "tx_id": tx_id,
            "risk_score": score_res.risk_score,
            "band": score_res.band,
            "action": score_res.action_recommended,
            "reasons": [r.model_dump() for r in score_res.reasons]
        })

        await broadcaster.broadcast("hold_started", {
            "case_id": case_id,
            "hold_id": hold_id,
            "duration_minutes": score_res.hold_duration_minutes,
            "expires_at": hold_expires_at
        })

        await broadcaster.broadcast("cosign_requested", {
            "case_id": case_id,
            "cosign_id": cosign_id,
            "family_contact": "Priya Verma (Daughter)",
            "safe_phrase": phrase
        })

        await delay(3.0)

        # 3. Simulate multi-hop mule trail activity for graph visualization
        await broadcaster.broadcast("graph_update", {
            "case_id": case_id,
            "nodes_active": [victim_id, mule_l1, "MULE_L2_01", "MULE_L2_02", "MULE_L3_01", "CRYPTO_P2P_DESK_DELHI"],
            "layer_1_amount": amount,
            "layer_2_fanout": [240000.0, 245000.0],
            "status": "tracing"
        })

    async def _run_family_impersonation_scenario(self, speed_mult: float):
        delay = lambda sec: asyncio.sleep(sec / speed_mult)
        victim_id = "ACC_1055"
        mule_l1 = "MULE_L1_03"

        score_res = risk_engine.score_transfer(
            amount_vs_typical_ratio=9.0,
            beneficiary_is_new=True,
            beneficiary_account_age_days=6.0,
            beneficiary_inbound_velocity=8.0,
            beneficiary_fanout=3.0,
            in_call=True,
            call_duration_min=18.0,
            caller_unsaved=True,
            remote_access_active=False,
            screen_share_active=False,
            hour_of_day_unusual=False,
            round_amount=True
        )

        amount = 95000.0
        case_id = f"case_fi_{uuid.uuid4().hex[:8]}"
        self.active_case_id = case_id
        tx_id = f"tx_{uuid.uuid4().hex[:8]}"

        with Session(engine) as session:
            tx = Transaction(
                id=tx_id,
                from_account=victim_id,
                to_account=mule_l1,
                amount=amount,
                channel="IMPS",
                beneficiary_is_new=True,
                case_id=case_id,
                status="held"
            )
            session.add(tx)
            case = Case(
                id=case_id,
                victim_account=victim_id,
                status="held",
                risk_score=score_res.risk_score,
                summary=f"Family Impersonation: Urgent bail extortion call claiming nephew arrested",
                initial_tx_id=tx_id
            )
            session.add(case)
            session.commit()

            hold = create_hold(session, case_id, tx_id, duration_minutes=15, consent_given=True)
            cosign, phrase = create_cosign_challenge(session, case_id, family_contact_alias="Arun Verma (Brother)")
            cosign_id = cosign.id

        await broadcaster.broadcast("transaction", {
            "id": tx_id, "case_id": case_id, "from_account": victim_id,
            "to_account": mule_l1, "amount": amount, "status": "held",
            "risk_score": score_res.risk_score, "band": score_res.band
        })

        await broadcaster.broadcast("risk_alert", {
            "case_id": case_id, "tx_id": tx_id, "risk_score": score_res.risk_score,
            "band": score_res.band, "action": score_res.action_recommended,
            "reasons": [r.model_dump() for r in score_res.reasons]
        })

        await broadcaster.broadcast("cosign_requested", {
            "case_id": case_id, "cosign_id": cosign_id,
            "family_contact": "Arun Verma (Brother)", "safe_phrase": phrase
        })

    async def _run_false_positive_scenario(self, speed_mult: float):
        delay = lambda sec: asyncio.sleep(sec / speed_mult)
        victim_id = "ACC_1088"
        legit_beneficiary = "ACC_1120" # Established real-estate lawyer / seller
        amount = 250000.0

        # Legitimate large transfer: call with saved contact, no remote access, established account
        score_res = risk_engine.score_transfer(
            amount_vs_typical_ratio=3.2,
            beneficiary_is_new=False,
            beneficiary_account_age_days=680.0,
            beneficiary_inbound_velocity=0.4,
            beneficiary_fanout=0.2,
            in_call=True,
            call_duration_min=8.0,
            caller_unsaved=False, # SAVED CONTACT
            remote_access_active=False,
            screen_share_active=False,
            hour_of_day_unusual=False,
            round_amount=True
        )

        tx_id = f"tx_legit_{uuid.uuid4().hex[:8]}"

        with Session(engine) as session:
            tx = Transaction(
                id=tx_id,
                from_account=victim_id,
                to_account=legit_beneficiary,
                amount=amount,
                channel="NEFT",
                beneficiary_is_new=False,
                case_id=None,
                status="completed" # DIRECT PASS
            )
            session.add(tx)
            session.commit()

            record_audit_event(
                session,
                action="TX_PASSED_LEGIT",
                actor="Viraam Engine",
                case_id=None,
                detail={"tx_id": tx_id, "score": score_res.risk_score, "band": score_res.band}
            )

        # Broadcast completed transaction with low/medium risk
        await broadcaster.broadcast("transaction", {
            "id": tx_id,
            "case_id": None,
            "from_account": victim_id,
            "to_account": legit_beneficiary,
            "amount": amount,
            "status": "completed",
            "risk_score": score_res.risk_score,
            "band": score_res.band
        })

        await delay(1.0)

simulator_service = SimulatorService()
