from fastapi import APIRouter, HTTPException
from sqlmodel import Session, delete
from ..db import engine
from ..models import Case, Transaction, Hold, Cosign, CallContext, AuditEvent
from ..schemas import ScenarioRequest
from ..services.simulator import simulator_service, broadcaster

router = APIRouter(prefix="/simulate", tags=["simulator"])

@router.post("/scenario")
async def trigger_scenario(payload: ScenarioRequest):
    try:
        res = await simulator_service.start_scenario(payload.scenario, payload.speed)
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/reset")
async def reset_simulation():
    with Session(engine) as session:
        # Clear dynamic case data
        session.exec(delete(Hold))
        session.exec(delete(Cosign))
        session.exec(delete(Transaction))
        session.exec(delete(CallContext))
        session.exec(delete(Case))
        session.exec(delete(AuditEvent))
        session.commit()

    simulator_service.active_scenario = None
    simulator_service.active_case_id = None
    
    await broadcaster.broadcast("simulation_reset", {"status": "reset_completed"})
    return {"status": "success", "message": "Simulation environment reset successfully"}
