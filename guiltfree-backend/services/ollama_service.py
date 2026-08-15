"""
services/ollama_service.py

Encapsulates all LangChain + Ollama execution logic for the AI Voice/Text Coach.
Keeps prompt construction, model invocation, and persona logic isolated from the
FastAPI route layer so the LLM backend (model name, host, temperature) can be
swapped without touching router code.
"""

from __future__ import annotations

import logging
from typing import Dict, Optional

from langchain_community.llms import Ollama
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
DEFAULT_MODEL = "llama3"
DEFAULT_BASE_URL = "http://localhost:11434"
DEFAULT_TEMPERATURE = 0.7

# ---------------------------------------------------------------------------
# Persona prompt
# ---------------------------------------------------------------------------
# "Golden Retriever energy" for wins, "sarcastic best-friend energy" for
# setbacks. The model decides which tone fits based on the supplied context,
# but is explicitly instructed to NEVER shame, guilt-trip, or use failure
# language (streaks, red flags, "you failed", etc.) — this app is guilt-free
# by design.
COACH_PROMPT_TEMPLATE = """You are "Coach", the AI voice inside a guilt-free personal trainer and \
pantry companion app. Your personality has two modes and you pick whichever \
fits the user's situation:

1. GOLDEN RETRIEVER ENERGY (wins, progress, good choices): wildly enthusiastic, \
   warm, silly, proud-of-you energy. Lots of encouragement, zero smugness.
2. SARCASTIC BEST-FRIEND ENERGY (setbacks, missed workouts, cheat meals): dry, \
   funny, affectionate roasting — like a best friend who refuses to let you \
   spiral, not a drill sergeant. Reframe the setback as data, not failure.

HARD RULES:
- NEVER use guilt, shame, streak-breaking language, or words like "failed," \
  "cheat day," "off track," or "you should have."
- NEVER assign a failure flag, red X, or broken streak.
- Always end with ONE concrete, low-friction next action.
- Keep responses conversational and under 120 words unless asked for detail.

User's current context:
- Pantry items: {pantry_items}
- Fatigue level (1-10): {fatigue_level}
- Workout goal: {workout_goal}

User's message: {user_query}

Respond in character as Coach:"""


class OllamaCoachService:
    """Thin wrapper around a LangChain `Ollama` LLM configured for the coach persona."""

    def __init__(
        self,
        model: str = DEFAULT_MODEL,
        base_url: str = DEFAULT_BASE_URL,
        temperature: float = DEFAULT_TEMPERATURE,
    ) -> None:
        self.model_name = model
        self.base_url = base_url
        self.temperature = temperature

        self._llm = Ollama(model=self.model_name, base_url=self.base_url, temperature=self.temperature)
        self._prompt = PromptTemplate(
            input_variables=["pantry_items", "fatigue_level", "workout_goal", "user_query"],
            template=COACH_PROMPT_TEMPLATE,
        )
        # LCEL pipeline: prompt -> llm -> string output parser
        self._chain = self._prompt | self._llm | StrOutputParser()

    async def generate_response(
        self,
        user_query: str,
        pantry_items: Optional[list[str]] = None,
        fatigue_level: Optional[int] = None,
        workout_goal: Optional[str] = None,
    ) -> str:
        """
        Run the LangChain pipeline against the local Ollama model and return
        the coach's reply.

        Raises:
            RuntimeError: if the Ollama backend is unreachable or generation fails.
        """
        payload: Dict[str, str] = {
            "user_query": user_query,
            "pantry_items": ", ".join(pantry_items) if pantry_items else "none provided",
            "fatigue_level": str(fatigue_level) if fatigue_level is not None else "unknown",
            "workout_goal": workout_goal or "general fitness",
        }

        try:
            # LangChain's Ollama LLM wrapper is sync; run it in a worker thread
            # so the FastAPI event loop is never blocked.
            import asyncio

            result: str = await asyncio.to_thread(self._chain.invoke, payload)
            return result.strip()
        except Exception as exc:  # noqa: BLE001 - surface as a clean service error
            logger.exception("Ollama generation failed")
            raise RuntimeError(f"AI coach generation failed: {exc}") from exc


# Module-level singleton so the model connection is reused across requests.
coach_service = OllamaCoachService()
