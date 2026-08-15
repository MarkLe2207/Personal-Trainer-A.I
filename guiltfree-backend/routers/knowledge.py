"""
routers/knowledge.py

Module 3: Vector Search for Recipes & Exercises (ChromaDB RAG).

Exposes recipe search constrained strictly to what the user has in their
pantry, plus a companion exercise search endpoint over the same vector store
infrastructure.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.vector_service import vector_service

router = APIRouter(prefix="/api/knowledge", tags=["Knowledge Search (RAG)"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class RecipeSearchRequest(BaseModel):
    """Input payload for a pantry-constrained recipe search."""

    pantry_items: List[str] = Field(
        ..., min_length=1, description="Ingredients currently available to the user"
    )
    top_k: int = Field(default=5, ge=1, le=20, description="Number of results to return")
    min_protein_g: Optional[int] = Field(
        default=None, ge=0, description="Optional minimum protein (grams) filter"
    )


class RecipeResult(BaseModel):
    """A single matched recipe with macro metadata."""

    id: str
    name: str
    description: str
    similarity_score: float
    protein_g: int
    calories: int
    ingredients: str


class RecipeSearchResponse(BaseModel):
    results: List[RecipeResult]
    count: int


class ExerciseSearchRequest(BaseModel):
    """Input payload for an exercise/movement search."""

    query: str = Field(..., min_length=1, description="Free-text query, e.g. 'no equipment leg day'")
    top_k: int = Field(default=5, ge=1, le=20)


class ExerciseResult(BaseModel):
    id: str
    name: str
    description: str
    similarity_score: float
    muscle_group: str
    equipment: str


class ExerciseSearchResponse(BaseModel):
    results: List[ExerciseResult]
    count: int


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@router.post("/search-recipes", response_model=RecipeSearchResponse)
async def search_recipes(payload: RecipeSearchRequest) -> RecipeSearchResponse:
    """
    Search the ChromaDB `recipes` collection for high-protein recipes that
    best match the user's available pantry items.
    """
    try:
        raw_matches: List[Dict[str, Any]] = vector_service.search_recipes(
            pantry_items=payload.pantry_items,
            top_k=payload.top_k,
            min_protein_g=payload.min_protein_g,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Recipe search failed: {exc}") from exc

    results = [
        RecipeResult(
            id=match["id"],
            name=match.get("name", "Unnamed Recipe"),
            description=match["description"],
            similarity_score=match["similarity_score"],
            protein_g=match.get("protein_g", 0),
            calories=match.get("calories", 0),
            ingredients=match.get("ingredients", ""),
        )
        for match in raw_matches
    ]
    return RecipeSearchResponse(results=results, count=len(results))


@router.post("/search-exercises", response_model=ExerciseSearchResponse)
async def search_exercises(payload: ExerciseSearchRequest) -> ExerciseSearchResponse:
    """Search the ChromaDB `exercises` collection for matching movements."""
    try:
        raw_matches: List[Dict[str, Any]] = vector_service.search_exercises(
            query=payload.query, top_k=payload.top_k
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Exercise search failed: {exc}") from exc

    results = [
        ExerciseResult(
            id=match["id"],
            name=match.get("name", "Unnamed Exercise"),
            description=match["description"],
            similarity_score=match["similarity_score"],
            muscle_group=match.get("muscle_group", "unknown"),
            equipment=match.get("equipment", "unknown"),
        )
        for match in raw_matches
    ]
    return ExerciseSearchResponse(results=results, count=len(results))
