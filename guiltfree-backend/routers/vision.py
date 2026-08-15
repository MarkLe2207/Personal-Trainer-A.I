"""
routers/vision.py

Module 4: Receipt Scanner (OCR Engine).

Accepts an uploaded grocery receipt image, runs it through Tesseract OCR via
pytesseract, and parses the raw text into a clean list of grocery item names
suitable for populating the pantry state. Prices, taxes, totals, and store
boilerplate are filtered out via regex heuristics.
"""

from __future__ import annotations

import io
import logging
import re
from typing import List

import pytesseract
from fastapi import APIRouter, File, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel

router = APIRouter(prefix="/api/vision", tags=["Receipt Scanner (OCR)"])
logger = logging.getLogger(__name__)

ALLOWED_CONTENT_TYPES = {"image/png", "image/jpeg", "image/jpg", "image/webp"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

# ---------------------------------------------------------------------------
# Regex heuristics for filtering OCR'd receipt lines
# ---------------------------------------------------------------------------
# Lines that are purely numeric/price/tax/total/date noise get dropped.
_PRICE_LINE_RE = re.compile(r"^\s*\$?\d+[.,]\d{2}\s*$")
_TRAILING_PRICE_RE = re.compile(r"\s+\$?\d+[.,]\d{2}\s*$")
_NOISE_KEYWORDS_RE = re.compile(
    r"\b(subtotal|total|tax|change|cash|credit|debit|visa|mastercard|amex|"
    r"balance|tender|card|approved|auth|receipt|thank you|cashier|store|"
    r"date|time|qty|quantity|discount|coupon|savings|barcode|# items)\b",
    re.IGNORECASE,
)
_ONLY_SYMBOLS_OR_DIGITS_RE = re.compile(r"^[\W\d_]+$")


class ScannedReceiptResponse(BaseModel):
    """Output payload containing the cleaned list of grocery items."""

    items: List[str]
    item_count: int
    raw_text_preview: str


def _extract_text_from_image(image_bytes: bytes) -> str:
    """Load image bytes with PIL and run Tesseract OCR to extract raw text."""
    try:
        image = Image.open(io.BytesIO(image_bytes))
        image = image.convert("L")  # grayscale improves OCR accuracy on receipts
    except UnidentifiedImageError as exc:
        raise ValueError("Uploaded file is not a valid image") from exc

    raw_text = pytesseract.image_to_string(image)
    return raw_text


def _parse_grocery_items(raw_text: str) -> List[str]:
    """
    Apply line-by-line regex filtering to isolate probable grocery item names
    from a raw OCR receipt dump, discarding prices, taxes, and metadata.
    """
    items: List[str] = []

    for line in raw_text.splitlines():
        line = line.strip()

        if not line:
            continue
        if _PRICE_LINE_RE.match(line):
            continue
        if _NOISE_KEYWORDS_RE.search(line):
            continue
        if _ONLY_SYMBOLS_OR_DIGITS_RE.match(line):
            continue

        # Strip a trailing price if the item name and price are on the same line
        # e.g. "ORGANIC BANANAS    2.99" -> "ORGANIC BANANAS"
        cleaned = _TRAILING_PRICE_RE.sub("", line).strip()

        # Drop leftover leading quantity markers like "2 x" or "3x"
        cleaned = re.sub(r"^\d+\s*[xX]\s*", "", cleaned).strip()

        if len(cleaned) < 2:
            continue

        # Title-case for a consistent, presentable pantry item name.
        items.append(cleaned.title())

    # Deduplicate while preserving order.
    seen = set()
    deduped: List[str] = []
    for item in items:
        key = item.lower()
        if key not in seen:
            seen.add(key)
            deduped.append(item)

    return deduped


@router.post("/scan-receipt", response_model=ScannedReceiptResponse)
async def scan_receipt(file: UploadFile = File(...)) -> ScannedReceiptResponse:
    """
    Accept a grocery receipt image upload, run OCR, and return a clean array
    of parsed item names to populate the user's pantry state.

    Raises:
        HTTPException(400): invalid file type, empty upload, or unreadable image.
        HTTPException(413): file exceeds the maximum allowed size.
        HTTPException(500): OCR engine failure.
    """
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file.content_type}'. Allowed: {sorted(ALLOWED_CONTENT_TYPES)}",
        )

    image_bytes = await file.read()

    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    if len(image_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds the 10MB size limit")

    try:
        raw_text = _extract_text_from_image(image_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except pytesseract.TesseractNotFoundError as exc:
        logger.exception("Tesseract binary not found")
        raise HTTPException(
            status_code=500,
            detail="OCR engine not available on this server (Tesseract binary not found).",
        ) from exc
    except Exception as exc:  # noqa: BLE001
        logger.exception("OCR extraction failed")
        raise HTTPException(status_code=500, detail=f"OCR extraction failed: {exc}") from exc

    items = _parse_grocery_items(raw_text)

    return ScannedReceiptResponse(
        items=items,
        item_count=len(items),
        raw_text_preview=raw_text[:500],
    )
