"""Auth middleware that verifies tokens via Supabase's own API.

No JWT secret needed — delegates verification to Supabase directly.
"""
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


async def auth_middleware(request: Request, call_next):
    """Verify token via Supabase and attach user info to request.state."""
    auth_header: Optional[str] = request.headers.get("Authorization")
    user = None

    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1]
        try:
            client = _get_auth_client()
            result = client.auth.get_user(token)
            if result and result.user:
                user = {
                    "sub": str(result.user.id),
                    "email": result.user.email,
                }
        except Exception:
            user = None

    request.state.user = user
    response = await call_next(request)
    return response
