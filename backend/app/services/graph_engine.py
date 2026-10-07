import datetime
import math
from typing import Dict, Any, List, Optional
import networkx as nx
from sqlmodel import Session, select
from ..db import engine
from ..models import Account, Transaction, Case
from ..schemas import FreezePlanResponse, FreezePlanItem, ExecutePlanResponse
from .audit_log import record_audit_event

class GraphEngine:
    def __init__(self):
        pass

    def build_case_graph(self, case_id: str) -> Dict[str, Any]:
        with Session(engine) as session:
            case = session.get(Case, case_id)
            if not case:
                # Provide a synthetic default case graph if case_id is fresh
                victim_id = "ACC_1042"
                amount = 485000.0
            else:
                victim_id = case.victim_account
                tx = session.exec(select(Transaction).where(Transaction.case_id == case_id)).first()
                amount = tx.amount if tx else 485000.0

            G = nx.DiGraph()

            # Layer 0: Victim
            G.add_node(victim_id, label="Ramesh Verma (Victim)", kind="victim", layer=0, bank="State Bank of India", age_days=1420, velocity=0.2, frozen=False, balance=amount)

            # Layer 1: First Hop Mule
            l1_id = "MULE_L1_01"
            G.add_node(l1_id, label="Rohan Gupta (Mule L1)", kind="mule", layer=1, bank="HDFC Bank", age_days=4, velocity=14.0, frozen=False, balance=amount)
            G.add_edge(victim_id, l1_id, amount=amount, lag_sec=120, status="held")

            # Layer 2: Aggregator Mules
            l2_a = "MULE_L2_01"
            l2_b = "MULE_L2_02"
            amt_l2_a = round(amount * 0.495, 2)
            amt_l2_b = round(amount - amt_l2_a, 2)
            G.add_node(l2_a, label="Vikram Joshi (Mule L2-A)", kind="mule", layer=2, bank="ICICI Bank", age_days=18, velocity=9.0, frozen=False, balance=amt_l2_a)
            G.add_node(l2_b, label="Vikram Rao (Mule L2-B)", kind="mule", layer=2, bank="Axis Bank", age_days=22, velocity=11.0, frozen=False, balance=amt_l2_b)
            G.add_edge(l1_id, l2_a, amount=amt_l2_a, lag_sec=320, status="in_transit")
            G.add_edge(l1_id, l2_b, amount=amt_l2_b, lag_sec=360, status="in_transit")

            # Layer 3: Dispersal Mules
            l3_a = "MULE_L3_01"
            l3_b = "MULE_L3_02"
            amt_l3_a = round(amt_l2_a * 0.85, 2)
            amt_l3_b = round(amt_l2_b * 0.85, 2)
            G.add_node(l3_a, label="Kunal Bhat (Mule L3-A)", kind="mule", layer=3, bank="Kotak Mahindra", age_days=35, velocity=16.0, frozen=False, balance=amt_l3_a)
            G.add_node(l3_b, label="Kunal Deshmukh (Mule L3-B)", kind="mule", layer=3, bank="Punjab National Bank", age_days=40, velocity=18.0, frozen=False, balance=amt_l3_b)
            G.add_edge(l2_a, l3_a, amount=amt_l3_a, lag_sec=280, status="in_transit")
            G.add_edge(l2_b, l3_b, amount=amt_l3_b, lag_sec=310, status="in_transit")

            # Layer 4: Cash-Out Terminal Exits
            co_1 = "CRYPTO_P2P_DESK_DELHI"
            co_2 = "ATM_DISPERSAL_GRID_KOLKATA"
            G.add_node(co_1, label="OTC P2P Crypto Desk", kind="cashout", layer=4, bank="Binance OTC", age_days=240, velocity=45.0, frozen=False, balance=amt_l3_a)
            G.add_node(co_2, label="ATM Cash Dispenser Grid", kind="cashout", layer=4, bank="Multi-ATM Ring", age_days=310, velocity=38.0, frozen=False, balance=amt_l3_b)
            G.add_edge(l3_a, co_1, amount=amt_l3_a, lag_sec=450, status="blocked")
            G.add_edge(l3_b, co_2, amount=amt_l3_b, lag_sec=420, status="blocked")

            # Format for React Flow
            nodes = []
            for n, d in G.nodes(data=True):
                nodes.append({
                    "id": n,
                    "data": {
                        "label": d.get("label", n),
                        "kind": d.get("kind", "mule"),
                        "layer": d.get("layer", 1),
                        "bank": d.get("bank", ""),
                        "age_days": d.get("age_days", 30),
                        "velocity": d.get("velocity", 0.0),
                        "frozen": d.get("frozen", False),
                        "balance": d.get("balance", 0.0)
                    }
                })

            edges = []
            for u, v, d in G.edges(data=True):
                edges.append({
                    "id": f"e_{u}_{v}",
                    "source": u,
                    "target": v,
                    "data": {
                        "amount": d.get("amount", 0.0),
                        "lag_sec": d.get("lag_sec", 0),
                        "status": d.get("status", "transferred")
                    }
                })

            return {
                "case_id": case_id,
                "nodes": nodes,
                "edges": edges,
                "summary": {
                    "total_flow": amount,
                    "layers_detected": 4,
                    "mules_identified": 5,
                    "cashout_points": 2
                }
            }

    def generate_freeze_plan(self, case_id: str) -> FreezePlanResponse:
        with Session(engine) as session:
            case = session.get(Case, case_id)
            tx = session.exec(select(Transaction).where(Transaction.case_id == case_id)).first()
            total_amount = tx.amount if tx else 485000.0

        # Mule candidates with dynamic recoverable estimation
        items: List[FreezePlanItem] = [
            FreezePlanItem(
                account_id="MULE_L1_01",
                holder_alias="Rohan Gupta (Mule L1)",
                bank_alias="HDFC Bank",
                layer=1,
                expected_recoverable_amount=round(total_amount * 0.98, 2),
                probability_funds_present=0.96,
                urgency=0.95,
                score=round(total_amount * 0.98 * 0.96 * 0.95 / 1000.0, 2),
                reason="Primary intake mule account created 4 days ago. Highest recovery yield if frozen before L2 dispersal.",
                recommended_action="Urgent Bank-to-Bank Golden Hour Freeze",
                estimated_window_sec=240
            ),
            FreezePlanItem(
                account_id="MULE_L2_01",
                holder_alias="Vikram Joshi (Mule L2-A)",
                bank_alias="ICICI Bank",
                layer=2,
                expected_recoverable_amount=round(total_amount * 0.49, 2),
                probability_funds_present=0.82,
                urgency=0.80,
                score=round(total_amount * 0.49 * 0.82 * 0.80 / 1000.0, 2),
                reason="Secondary aggregator mule. Historical fanout shows 85% forward rate to crypto desks within 15 minutes.",
                recommended_action="Pre-emptive Inbound Hold",
                estimated_window_sec=480
            ),
            FreezePlanItem(
                account_id="MULE_L2_02",
                holder_alias="Vikram Rao (Mule L2-B)",
                bank_alias="Axis Bank",
                layer=2,
                expected_recoverable_amount=round(total_amount * 0.48, 2),
                probability_funds_present=0.79,
                urgency=0.78,
                score=round(total_amount * 0.48 * 0.79 * 0.78 / 1000.0, 2),
                reason="Secondary aggregator mule sharing device fingerprint with syndicate cluster A.",
                recommended_action="Pre-emptive Inbound Hold",
                estimated_window_sec=510
            ),
            FreezePlanItem(
                account_id="MULE_L3_01",
                holder_alias="Kunal Bhat (Mule L3-A)",
                bank_alias="Kotak Mahindra",
                layer=3,
                expected_recoverable_amount=round(total_amount * 0.40, 2),
                probability_funds_present=0.55,
                urgency=0.65,
                score=round(total_amount * 0.40 * 0.55 * 0.65 / 1000.0, 2),
                reason="Dispersal mule directly connected to crypto OTC off-ramp.",
                recommended_action="Secondary Lien Tag",
                estimated_window_sec=750
            ),
            FreezePlanItem(
                account_id="MULE_L3_02",
                holder_alias="Kunal Deshmukh (Mule L3-B)",
                bank_alias="Punjab National Bank",
                layer=3,
                expected_recoverable_amount=round(total_amount * 0.39, 2),
                probability_funds_present=0.52,
                urgency=0.62,
                score=round(total_amount * 0.39 * 0.52 * 0.62 / 1000.0, 2),
                reason="Dispersal mule feeding ATM withdrawal network.",
                recommended_action="Secondary Lien Tag",
                estimated_window_sec=800
            )
        ]

        # Rank strictly by expected recoverable amount * probability * urgency (score)
        items.sort(key=lambda x: x.score, reverse=True)
        total_recoverable = sum(i.expected_recoverable_amount * i.probability_funds_present for i in items[:2])

        return FreezePlanResponse(
            case_id=case_id,
            total_at_risk=total_amount,
            total_recoverable=round(min(total_amount, total_recoverable), 2),
            nodes_count=len(items),
            items=items,
            generated_at=datetime.datetime.now(datetime.timezone.utc)
        )

    def execute_freeze_plan(self, case_id: str) -> ExecutePlanResponse:
        with Session(engine) as session:
            case = session.get(Case, case_id)
            tx = session.exec(select(Transaction).where(Transaction.case_id == case_id)).first()
            amount = tx.amount if tx else 485000.0

            if case:
                case.status = "frozen"
                session.add(case)

            record_audit_event(
                session,
                action="FREEZE_PLAN_EXECUTED",
                actor="Lead Investigator / Automated System",
                case_id=case_id,
                detail={
                    "case_id": case_id,
                    "target_nodes": ["MULE_L1_01", "MULE_L2_01", "MULE_L2_02"],
                    "recovered_amount": round(amount * 0.94, 2)
                }
            )

        with_viraam = round(amount * 0.94, 2)
        without_viraam = round(amount * 0.06, 2) # Typical delayed report yields <6%

        return ExecutePlanResponse(
            case_id=case_id,
            frozen_accounts=["MULE_L1_01", "MULE_L2_01", "MULE_L2_02"],
            frozen_amount=with_viraam,
            status="frozen",
            with_viraam_recovered=with_viraam,
            without_viraam_recovered=without_viraam
        )

graph_engine = GraphEngine()
