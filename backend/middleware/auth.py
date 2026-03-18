"""Auth middleware that verifies tokens via Supabase's own API.

Uses asyncio.to_thread to avoid blocking the event loop.
"""
import asyncio
import os
from typing import Optional

from fastapi import Request
from supabase import create_client


_auth_client = None


def _get_auth_client():
    global _auth_client
    if _auth_client is None:
        url = os.environ["SUPABASE_URL"]
        key = os.environ["SUPABASE_SERVICE_KEY"]
        _auth_client = create_client(url, key)
    return _auth_client


def _verify_token_sync(token: str):
    """Sync Supabase call — will be run in a thread."""
    client = _get_auth_client()
    result = client.auth.get_user(token)
    if result and result.user:
        return {"sub": str(result.user.id), "email": result.user.email}
    return None


async def auth_middleware(request: Request, call_next):
    """Verify token via Supabase without blocking the event loop."""
    auth_header: Optional[str] = request.headers.get("Authorization")
    user = None

    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1]
        try:
            user = await asyncio.to_thread(_verify_token_sync, token)
        except Exception:
            user = None

    request.state.user = user
    response = await call_next(request)
    return response
