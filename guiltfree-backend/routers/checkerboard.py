"""
routers/checkerboard.py

Module 1: Guilt-Free "Checkerboard" Adaptive Scheduler.

When a user misses a workout or has a fast-food/cheat day, this endpoint
recalculates the upcoming 7-day schedule WITHOUT ever surfacing failure
language, streak breaks, or red-flag indicators. Missed volume is folded
into "Active Recovery" and redistributed as micro-circuits across the next
2-3 sessions.
"""

from __future__ import annotations

from datetime import date, timedelta
from enum import Enum
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

router = APIRouter(prefix="/api/checkerboard", tags=["Checkerboard Scheduler"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class DayStatus(str, Enum):
    """Non-punitive status set. Notably absent: any 'missed'/'failed' state."""

    PLANNED = "planned"
    COMPLETED = "completed"
    ACTIVE_RECOVERY = "active_recovery"
    MICRO_CIRCUIT = "micro_circuit"
    REST = "rest"


class ScheduleDay(BaseModel):
    """A single day in the rolling 7-day schedule."""

    day_date: date = Field(..., description="Calendar date for this schedule entry")
    activity: str = Field(..., description="Planned activity, e.g. 'Leg Day', 'Cardio', 'Rest'")
    status: DayStatus = Field(default=DayStatus.PLANNED)
    volume_units: int = Field(
        default=0, ge=0, description="Abstract workout volume (e.g. total working sets)"
    )


class RecalibrateRequest(BaseModel):
    """Input payload for a recalibration event."""

    user_id: str = Field(..., min_length=1, description="Unique identifier for the user")
    missed_day: date = Field(..., description="The date that was missed or became a cheat day")
    missed_activity: str = Field(..., description="What was originally scheduled that day")
    reason: Optional[str] = Field(
        default=None, description="Optional free-text context, e.g. 'fast food day', 'too tired'"
    )
    current_schedule: List[ScheduleDay] = Field(
        ..., min_length=1, description="The current rolling 7-day schedule array"
    )

    @field_validator("current_schedule")
    @classmethod
    def _schedule_must_have_days(cls, value: List[ScheduleDay]) -> List[ScheduleDay]:
        if not value:
            raise ValueError("current_schedule cannot be empty")
        return value


class RecalibrateResponse(BaseModel):
    """Output payload: the adjusted schedule plus a guilt-free summary message."""

    user_id: str
    updated_schedule: List[ScheduleDay]
    message: str
    redistributed_volume_units: int


# ---------------------------------------------------------------------------
# Core recalibration logic
# ---------------------------------------------------------------------------
def _recalibrate_schedule(payload: RecalibrateRequest) -> RecalibrateResponse:
    """
    Recalculate the schedule after a missed day.

    Strategy:
    1. Locate the missed day in the schedule (or synthesize an Active Recovery
       entry for it if it isn't present).
    2. Mark that day as ACTIVE_RECOVERY — never a failure state.
    3. Pull its planned volume and blend it, in small increments, into the
       next 2-3 upcoming days as MICRO_CIRCUIT additions rather than a single
       makeup session (avoids overload and burnout).
    """
    schedule = [day.model_copy() for day in payload.current_schedule]

    # Find the missed day, or append a synthetic entry if it wasn't in range.
    missed_index: Optional[int] = None
    for idx, day in enumerate(schedule):
        if day.day_date == payload.missed_day:
            missed_index = idx
            break

    if missed_index is None:
        schedule.append(
            ScheduleDay(
                day_date=payload.missed_day,
                activity=payload.missed_activity,
                status=DayStatus.PLANNED,
                volume_units=0,
            )
        )
        missed_index = len(schedule) - 1

    missed_day = schedule[missed_index]
    recovered_volume = max(missed_day.volume_units, 4)  # baseline volume if none recorded

    # Step 1: convert the missed day into Active Recovery — always positive framing.
    schedule[missed_index] = missed_day.model_copy(
        update={
            "status": DayStatus.ACTIVE_RECOVERY,
            "activity": "Active Recovery (mobility + light movement)",
        }
    )

    # Step 2: find up to 3 upcoming days (after the missed day) to receive
    # blended micro-circuits.
    upcoming_indices = [
        idx
        for idx, day in enumerate(schedule)
        if day.day_date > payload.missed_day and day.status in (DayStatus.PLANNED, DayStatus.REST)
    ][:3]

    if not upcoming_indices:
        raise HTTPException(
            status_code=422,
            detail="No upcoming days available in the schedule to redistribute volume into.",
        )

    per_day_bonus = max(recovered_volume // len(upcoming_indices), 1)
    remainder = recovered_volume - (per_day_bonus * len(upcoming_indices))

    for i, idx in enumerate(upcoming_indices):
        day = schedule[idx]
        bonus = per_day_bonus + (remainder if i == len(upcoming_indices) - 1 else 0)
        schedule[idx] = day.model_copy(
            update={
                "status": DayStatus.MICRO_CIRCUIT,
                "activity": f"{day.activity} + Micro-Circuit Boost",
                "volume_units": day.volume_units + bonus,
            }
        )

    message = (
        "Nothing broken, nothing lost. We turned "
        f"{payload.missed_day.isoformat()} into an Active Recovery day and quietly "
        f"folded that volume into your next {len(upcoming_indices)} sessions as short "
        "micro-circuits. Same progress, smarter path."
    )

    return RecalibrateResponse(
        user_id=payload.user_id,
        updated_schedule=schedule,
        message=message,
        redistributed_volume_units=recovered_volume,
    )


# ---------------------------------------------------------------------------
# Route
# ---------------------------------------------------------------------------
@router.post("/recalibrate", response_model=RecalibrateResponse)
async def recalibrate_schedule(payload: RecalibrateRequest) -> RecalibrateResponse:
    """
    Recalculate the user's upcoming 7-day schedule after a missed workout or
    cheat day, converting the miss into Active Recovery and blending its
    volume into upcoming micro-circuits. Never returns failure flags.
    """
    try:
        return _recalibrate_schedule(payload)
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Recalibration failed: {exc}") from exc
