"""Gemini API integration for demo generation (fallback when Claude fails).

Uses the same DemoForge system prompt and JSON contract as Claude so
output is interchangeable. Called only when Claude raises ClaudeError.
"""
import json
import os
from typing import Any, Dict

import httpx
from dotenv import load_dotenv

from services.claude import SYSTEM_PROMPT

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta"


class GeminiError(Exception):
    """Raised when Gemini API fails or returns invalid output."""

    pass


async def generate_demo_gemini(idea: str, vibe: str | None = None) -> Dict[str, Any]:
    """Generate a demo HTML and brief using Gemini (same contract as Claude).

    Args:
        idea: Startup idea or product concept.
        vibe: Optional mood hint.

    Returns:
        Dict with "demoHtml" and "brief" keys.

    Raises:
        GeminiError: If API key missing, API fails, or response invalid.
    """
    if not GEMINI_API_KEY:
        raise GeminiError("GEMINI_API_KEY is not set")

    prompt = idea
    if vibe:
        prompt = f"Vibe: {vibe}\n\nIdea: {idea}"

    url = f"{GEMINI_BASE}/models/{GEMINI_MODEL}:generateContent"
    params = {"key": GEMINI_API_KEY}
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "generationConfig": {
            "responseMimeType": "application/json",
            "maxOutputTokens": 16384,
            "temperature": 0.7,
            "topP": 0.95,
        },
    }

    async with httpx.AsyncClient(timeout=180) as client:
        resp = await client.post(url, params=params, json=body)
        if resp.status_code != 200:
            raise GeminiError(
                f"Gemini API returned {resp.status_code}: {resp.text[:300]}"
            )
        data = resp.json()

    try:
        parts = data["candidates"][0]["content"]["parts"]
        text = "".join(p["text"] for p in parts if "text" in p)
    except (KeyError, IndexError, TypeError) as e:
        raise GeminiError(f"Unexpected Gemini response format: {e}") from e

    if not text.strip():
        raise GeminiError("Gemini returned empty content")

    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}") + 1
        if start >= 0 and end > start:
            try:
                parsed = json.loads(text[start:end])
            except json.JSONDecodeError as inner:
                raise GeminiError(f"Gemini did not return valid JSON: {inner}") from inner
        else:
            raise GeminiError("Gemini did not return valid JSON")

    if "demoHtml" not in parsed or "brief" not in parsed:
        raise GeminiError("Gemini response missing expected keys (demoHtml, brief)")

    return parsed
