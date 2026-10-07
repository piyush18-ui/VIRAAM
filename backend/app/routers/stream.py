import json
import asyncio
from fastapi import APIRouter, Request
from sse_starlette.sse import EventSourceResponse
from ..services.simulator import broadcaster

router = APIRouter(tags=["stream"])

@router.get("/stream")
async def event_stream(request: Request):
    async def event_generator():
        queue = await broadcaster.subscribe()
        try:
            # Send initial keepalive
            yield {
                "event": "connected",
                "data": json.dumps({"status": "connected", "channel": "viraam_live_feed"})
            }
            while True:
                if await request.is_disconnected():
                    break
                try:
                    # Wait for next event with a periodic heartbeat
                    event = await asyncio.wait_for(queue.get(), timeout=20.0)
                    yield {
                        "event": event.get("type", "message"),
                        "data": json.dumps(event)
                    }
                except asyncio.TimeoutError:
                    # Heartbeat
                    yield {
                        "event": "ping",
                        "data": json.dumps({"ping": True})
                    }
        finally:
            broadcaster.unsubscribe(queue)

    return EventSourceResponse(event_generator())
