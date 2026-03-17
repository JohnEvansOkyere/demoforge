"""Claude API integration for demo generation.

Calls Anthropic's Messages API with a structured system prompt to produce
self-contained HTML demos and briefs. Handles JSON extraction and recovery
when Claude wraps output in markdown or extra text.
"""
import json
import logging
import os
from typing import Any, Dict

import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
MODEL = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-20250514")

SYSTEM_PROMPT = """\
You are DemoForge, a world-class UI/UX designer and frontend engineer \
who specializes in bringing startup visions to life through emotionally \
resonant interactive demos.

Given any startup idea, you generate a complete, custom, interactive HTML \
demo that feels like a real product — not a generic template.

You must:
1. Understand the DOMAIN (fintech, health, social, logistics, education, etc.)
2. Understand the USERS (who they are, what they feel, what they need)
3. Understand the EMOTION the product should evoke
4. Design a UI that serves all three

Your output is ONLY a raw JSON object — no markdown, no backticks, no explanation:

{
  "demoHtml": "...complete self-contained HTML page...",
  "brief": {
    "communicates": "what this UI communicates to a user",
    "whoItsFor": "user persona description",
    "validate": ["assumption 1", "assumption 2", "assumption 3"],
    "emotionalSignals": ["feeling 1", "feeling 2"],
    "redFlags": ["red flag 1", "red flag 2"]
  }
}

Rules for demoHtml:
- Complete <!DOCTYPE html> page, fully self-contained
- Load Tailwind via CDN: https://cdn.tailwindcss.com
- Load Chart.js if the idea involves data/metrics: \
https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js
- Load Google Fonts that match the emotional tone of the idea
- Choose a color palette that fits the product's emotional register:
    Health/wellness -> soft greens, warm whites, gentle blues
    Fintech/banking -> deep navy, sharp whites, gold accents
    Social/creative -> vibrant, expressive, high contrast
    Agriculture/local -> earthy tones, warm ambers, natural greens
    Education/kids -> bright primaries, rounded shapes, playful
    Logistics/ops -> clean grays, strong structure, efficiency
    Luxury/premium -> deep blacks, gold, generous whitespace
- Populate with deeply realistic fake data matching the idea's context
- Africa/Ghana context: use GHS currency, local names (Kwame, Ama, Kofi, \
Abena), MoMo payments, local place names (Accra, Kumasi, Takoradi)
- Build a multi-screen experience where reasonable: \
show 2-3 distinct views (e.g. home + detail + profile, or \
dashboard + list + form)
- All interactions must work: tabs switch, modals open, \
cart updates, charts render, nav highlights active state
- Every UI must feel like it was designed by a real product team — \
not generated. Thoughtful spacing, hierarchy, micro-details.
- For images use: https://picsum.photos/seed/{descriptive-word}/400/300
- Mobile-first responsive design
- The demo must make someone feel: "Yes. This is exactly what I imagined."
"""


class ClaudeError(Exception):
    """Raised when Claude API fails or returns invalid/unexpected output."""

    pass


async def _generate_demo_claude(idea: str, vibe: str | None = None) -> Dict[str, Any]:
    """Call Claude API to produce demo HTML and brief. Raises ClaudeError on failure."""
    if not ANTHROPIC_API_KEY:
        raise ClaudeError("ANTHROPIC_API_KEY is not set")

    prompt = idea
    if vibe:
        prompt = f"Vibe: {vibe}\n\nIdea: {idea}"

    headers = {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }

    body = {
        "model": MODEL,
        "system": SYSTEM_PROMPT,
        "max_tokens": 16000,
        "messages": [
            {
                "role": "user",
                "content": prompt,
            }
        ],
    }

    async with httpx.AsyncClient(timeout=180) as client:
        resp = await client.post(ANTHROPIC_API_URL, headers=headers, json=body)
        if resp.status_code != 200:
            raise ClaudeError(
                f"Claude API returned {resp.status_code}: {resp.text[:300]}"
            )
        data = resp.json()

    try:
        text = "".join(
            block["text"] for block in data["content"] if block["type"] == "text"
        )
    except Exception as e:
        raise ClaudeError(f"Unexpected Claude response format: {e}") from e

    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}") + 1
        if start >= 0 and end > start:
            try:
                parsed = json.loads(text[start:end])
            except json.JSONDecodeError as inner:
                raise ClaudeError(
                    f"Claude returned truncated/invalid JSON: {inner}"
                ) from inner
        else:
            raise ClaudeError("Claude did not return valid JSON")

    if "demoHtml" not in parsed or "brief" not in parsed:
        raise ClaudeError("Claude response missing expected keys (demoHtml, brief)")

    return parsed


async def generate_demo(idea: str, vibe: str | None = None) -> Dict[str, Any]:
    """Generate a demo HTML and brief from an idea. Uses Claude first, Gemini as fallback.

    Args:
        idea: Startup idea or product concept to materialize.
        vibe: Optional mood/aesthetic hint (e.g. "minimal", "playful").

    Returns:
        Dict with "demoHtml" and "brief" keys. Brief contains communicates,
        whoItsFor, validate, emotionalSignals, redFlags.

    Raises:
        ClaudeError: If both Claude and Gemini fail (message includes both errors).
    """
    try:
        result = await _generate_demo_claude(idea, vibe)
        logger.info("Demo generated successfully via Claude")
        return result
    except ClaudeError as claude_err:
        logger.warning("Claude failed (%s), falling back to Gemini", claude_err)
        try:
            from services import gemini

            result = await gemini.generate_demo_gemini(idea, vibe)
            logger.info("Demo generated successfully via Gemini (fallback)")
            return result
        except Exception as gemini_err:
            err_msg = str(gemini_err)
            if getattr(gemini_err, "__module__", "").endswith("gemini"):
                err_msg = f"Gemini fallback failed: {err_msg}"
            raise ClaudeError(
                f"Claude failed: {claude_err}. {err_msg}"
            ) from gemini_err
