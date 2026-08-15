"""
routers/ai_coach.py

Module 2: AI Voice/Text Coach powered by LangChain + Ollama.

Accepts a user query plus lightweight context (pantry items, fatigue level,
workout goal) and returns an empathetic, high-energy or sarcastic-but-loving
coaching response depending on whether the context signals a win or a setback.
"""

from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.ollama_service import coach_service

router = APIRouter(prefix="/api/coach", tags=["AI Coach"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class CoachContext(BaseModel):
    """Optional situational context that shapes the coach's tone and advice."""

    pantry_items: Optional[List[str]] = Field(
        default=None, description="Items currently available in the user's pantry"
    )
    fatigue_level: Optional[int] = Field(
        default=None, ge=1, le=10, description="Self-reported fatigue on a 1-10 scale"
    )
    workout_goal: Optional[str] = Field(
        default=None, description="Current training goal, e.g. 'strength', 'fat loss'"
    )


class CoachQueryRequest(BaseModel):
    """Input payload for a coaching query."""

    user_query: str = Field(..., min_length=1, description="The user's question or statement")
    context: Optional[CoachContext] = Field(default=None, description="Situational context")


class CoachQueryResponse(BaseModel):
    """Output payload containing the coach's generated response."""

    response: str
    model_used: str


# ---------------------------------------------------------------------------
# Route
# ---------------------------------------------------------------------------
@router.post("/query", response_model=CoachQueryResponse)
async def query_coach(payload: CoachQueryRequest) -> CoachQueryResponse:
    """
    Generate a coaching response via the local Ollama LLM through LangChain.

    Raises:
        HTTPException(503): if the Ollama backend is unreachable or generation fails.
    """
    context = payload.context or CoachContext()

    try:
        reply = await coach_service.generate_response(
            user_query=payload.user_query,
            pantry_items=context.pantry_items,
            fatigue_level=context.fatigue_level,
            workout_goal=context.workout_goal,
        )
    except RuntimeError as exc:
        raise HTTPException(
            status_code=503,
            detail=(
                "AI coach is temporarily unavailable. Make sure Ollama is running "
                f"locally and the model is pulled. Details: {exc}"
            ),
        ) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Unexpected coach error: {exc}") from exc

    return CoachQueryResponse(response=reply, model_used=coach_service.model_name)
