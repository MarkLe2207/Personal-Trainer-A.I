"""
main.py

FastAPI application entrypoint for the Guilt-Free Personal Trainer &
AI Pantry Companion backend.

Wires together:
- CORS middleware (Next.js frontend on http://localhost:3000)
- Module 1: Checkerboard adaptive scheduler
- Module 2: AI voice/text coach (LangChain + Ollama)
- Module 3: Vector search for recipes/exercises (ChromaDB RAG)
- Module 4: Receipt OCR scanner
- A root health-check endpoint

Run with:
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""

from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from routers import ai_coach, checkerboard, knowledge, vision

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Guilt-Free Personal Trainer & AI Pantry Companion API",
    description=(
        "Backend infrastructure for an adaptive, guilt-free fitness and "
        "nutrition companion: adaptive scheduling, an AI coach, RAG-powered "
        "recipe/exercise search, and receipt OCR scanning."
    ),
    version="1.0.0",
)

# ---------------------------------------------------------------------------
# CORS — allow the Next.js frontend running locally to call this API.
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Route registration
# ---------------------------------------------------------------------------
app.include_router(checkerboard.router)
app.include_router(ai_coach.router)
app.include_router(knowledge.router)
app.include_router(vision.router)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
class HealthCheckResponse(BaseModel):
    status: str
    service: str
    version: str


@app.get("/", response_model=HealthCheckResponse, tags=["Health"])
async def root_health_check() -> HealthCheckResponse:
    """Simple root health-check endpoint to confirm the API is running."""
    return HealthCheckResponse(
        status="ok",
        service="Guilt-Free Personal Trainer & AI Pantry Companion API",
        version=app.version,
    )
