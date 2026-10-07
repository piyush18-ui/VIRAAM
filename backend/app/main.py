from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .db import init_db
from .services.simulator import simulator_service
from .routers import stream, risk, cases, graph, simulator, audit, metrics

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    init_db()
    # Initialize synthetic world data (accounts, mules, cashouts)
    simulator_service.initialize_world()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Viraam: Pause the panic. Protect the payment. Stops digital arrest scams and traces mule money flows.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers under /api
app.include_router(stream.router, prefix="/api")
app.include_router(risk.router, prefix="/api")
app.include_router(cases.router, prefix="/api")
app.include_router(graph.router, prefix="/api")
app.include_router(simulator.router, prefix="/api")
app.include_router(audit.router, prefix="/api")
app.include_router(metrics.router, prefix="/api")

@app.get("/api/health", tags=["health"])
def health_check():
    return {
        "status": "healthy",
        "service": "Viraam Backend Engine",
        "version": "1.0.0",
        "mode": "simulation_synthetic_data"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
