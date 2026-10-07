from fastapi import APIRouter
from ..services.graph_engine import graph_engine
from ..services.simulator import broadcaster
from ..schemas import FreezePlanResponse, ExecutePlanResponse

router = APIRouter(prefix="/graph", tags=["graph"])

@router.get("/{case_id}")
def get_case_graph(case_id: str):
    return graph_engine.build_case_graph(case_id)

@router.post("/{case_id}/freeze-plan", response_model=FreezePlanResponse)
def get_freeze_plan(case_id: str):
    return graph_engine.generate_freeze_plan(case_id)

@router.post("/{case_id}/execute-plan", response_model=ExecutePlanResponse)
async def execute_freeze_plan(case_id: str):
    res = graph_engine.execute_freeze_plan(case_id)
    await broadcaster.broadcast("freeze_executed", {
        "case_id": case_id,
        "frozen_accounts": res.frozen_accounts,
        "frozen_amount": res.frozen_amount,
        "with_viraam_recovered": res.with_viraam_recovered,
        "without_viraam_recovered": res.without_viraam_recovered
    })
    return res
