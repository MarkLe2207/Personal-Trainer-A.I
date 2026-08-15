"""
services/vector_service.py

Initializes a persistent ChromaDB instance and exposes query helpers for the
recipe/exercise RAG pipeline. Two collections are maintained:

- `recipes`: ingredient-to-recipe mappings with macro metadata.
- `exercises`: movement database keyed by muscle group / equipment.

Seed data is inserted on first run (idempotent) so the hackathon demo works
out of the box without a separate ingestion script.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions

logger = logging.getLogger(__name__)

CHROMA_PERSIST_DIR = "./chroma_data"
RECIPE_COLLECTION_NAME = "recipes"
EXERCISE_COLLECTION_NAME = "exercises"

# Lightweight local embedding function (all-MiniLM-L6-v2) — no external API
# calls required, keeping the whole stack offline-friendly for a hackathon.
_embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)


class VectorService:
    """Owns the ChromaDB client and collections used for RAG search."""

    def __init__(self, persist_directory: str = CHROMA_PERSIST_DIR) -> None:
        self.client = chromadb.PersistentClient(
            path=persist_directory,
            settings=Settings(anonymized_telemetry=False),
        )
        self.recipe_collection = self.client.get_or_create_collection(
            name=RECIPE_COLLECTION_NAME,
            embedding_function=_embedding_fn,
            metadata={"hnsw:space": "cosine"},
        )
        self.exercise_collection = self.client.get_or_create_collection(
            name=EXERCISE_COLLECTION_NAME,
            embedding_function=_embedding_fn,
            metadata={"hnsw:space": "cosine"},
        )
        self._seed_if_empty()

    # ------------------------------------------------------------------
    # Seeding
    # ------------------------------------------------------------------
    def _seed_if_empty(self) -> None:
        """Populate demo data on first boot so search endpoints return results."""
        if self.recipe_collection.count() == 0:
            self._seed_recipes()
        if self.exercise_collection.count() == 0:
            self._seed_exercises()

    def _seed_recipes(self) -> None:
        sample_recipes = [
            {
                "id": "recipe_001",
                "document": "High-protein chicken and broccoli stir fry with soy sauce and garlic",
                "metadata": {
                    "name": "Chicken & Broccoli Stir Fry",
                    "protein_g": 42,
                    "calories": 410,
                    "ingredients": "chicken breast, broccoli, soy sauce, garlic, rice",
                },
            },
            {
                "id": "recipe_002",
                "document": "Greek yogurt protein bowl with berries, honey, and granola",
                "metadata": {
                    "name": "Greek Yogurt Protein Bowl",
                    "protein_g": 28,
                    "calories": 320,
                    "ingredients": "greek yogurt, mixed berries, honey, granola",
                },
            },
            {
                "id": "recipe_003",
                "document": "Egg white omelette with spinach, mushrooms, and feta cheese",
                "metadata": {
                    "name": "Spinach & Feta Egg White Omelette",
                    "protein_g": 30,
                    "calories": 260,
                    "ingredients": "egg whites, spinach, mushrooms, feta cheese",
                },
            },
            {
                "id": "recipe_004",
                "document": "Lentil and quinoa power bowl with roasted vegetables, high protein vegetarian",
                "metadata": {
                    "name": "Lentil Quinoa Power Bowl",
                    "protein_g": 24,
                    "calories": 380,
                    "ingredients": "lentils, quinoa, bell pepper, zucchini, olive oil",
                },
            },
            {
                "id": "recipe_005",
                "document": "Grilled salmon with asparagus and lemon, omega-3 rich high protein dinner",
                "metadata": {
                    "name": "Grilled Salmon & Asparagus",
                    "protein_g": 38,
                    "calories": 390,
                    "ingredients": "salmon fillet, asparagus, lemon, olive oil",
                },
            },
        ]
        self.recipe_collection.add(
            ids=[r["id"] for r in sample_recipes],
            documents=[r["document"] for r in sample_recipes],
            metadatas=[r["metadata"] for r in sample_recipes],
        )
        logger.info("Seeded %d recipes into ChromaDB", len(sample_recipes))

    def _seed_exercises(self) -> None:
        sample_exercises = [
            {
                "id": "exercise_001",
                "document": "Bodyweight squat targeting quads, glutes, and hamstrings, no equipment",
                "metadata": {"name": "Bodyweight Squat", "muscle_group": "legs", "equipment": "none"},
            },
            {
                "id": "exercise_002",
                "document": "Push-up targeting chest, shoulders, and triceps, no equipment",
                "metadata": {"name": "Push-Up", "muscle_group": "chest", "equipment": "none"},
            },
            {
                "id": "exercise_003",
                "document": "Dumbbell row targeting back and biceps, requires dumbbells",
                "metadata": {"name": "Dumbbell Row", "muscle_group": "back", "equipment": "dumbbells"},
            },
            {
                "id": "exercise_004",
                "document": "Plank hold targeting core and stability, no equipment",
                "metadata": {"name": "Plank", "muscle_group": "core", "equipment": "none"},
            },
        ]
        self.exercise_collection.add(
            ids=[e["id"] for e in sample_exercises],
            documents=[e["document"] for e in sample_exercises],
            metadatas=[e["metadata"] for e in sample_exercises],
        )
        logger.info("Seeded %d exercises into ChromaDB", len(sample_exercises))

    # ------------------------------------------------------------------
    # Query helpers
    # ------------------------------------------------------------------
    def search_recipes(
        self,
        pantry_items: List[str],
        top_k: int = 5,
        min_protein_g: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """
        Query the recipe collection using the user's pantry items as the
        semantic query. Optionally post-filter by minimum protein content.
        """
        if not pantry_items:
            raise ValueError("pantry_items must contain at least one ingredient")

        query_text = ", ".join(pantry_items)
        results = self.recipe_collection.query(
            query_texts=[query_text],
            n_results=top_k,
        )

        matches: List[Dict[str, Any]] = []
        ids = results.get("ids", [[]])[0]
        documents = results.get("documents", [[]])[0]
        metadatas = results.get("metadatas", [[]])[0]
        distances = results.get("distances", [[]])[0]

        for doc_id, document, metadata, distance in zip(ids, documents, metadatas, distances):
            if min_protein_g is not None and metadata.get("protein_g", 0) < min_protein_g:
                continue
            matches.append(
                {
                    "id": doc_id,
                    "description": document,
                    "similarity_score": round(1 - distance, 4),
                    **metadata,
                }
            )
        return matches

    def search_exercises(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Query the exercise collection by free-text movement/muscle-group query."""
        results = self.exercise_collection.query(query_texts=[query], n_results=top_k)

        matches: List[Dict[str, Any]] = []
        ids = results.get("ids", [[]])[0]
        documents = results.get("documents", [[]])[0]
        metadatas = results.get("metadatas", [[]])[0]
        distances = results.get("distances", [[]])[0]

        for doc_id, document, metadata, distance in zip(ids, documents, metadatas, distances):
            matches.append(
                {
                    "id": doc_id,
                    "description": document,
                    "similarity_score": round(1 - distance, 4),
                    **metadata,
                }
            )
        return matches


# Module-level singleton — ChromaDB client/collections are safe to share
# across async requests within a single process.
vector_service = VectorService()
