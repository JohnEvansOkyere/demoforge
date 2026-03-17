"""Supabase client singleton for database access.

Uses service role key for server-side operations (bypasses RLS). Client
is lazily initialized on first use to avoid startup failures when env
vars are loaded asynchronously.
"""
import os
from typing import Optional

from supabase import Client, create_client

_client: Optional[Client] = None


def get_supabase() -> Client:
    """Return the shared Supabase client, creating it on first call.

    Requires SUPABASE_URL and SUPABASE_SERVICE_KEY in environment.
    Service key is used so the backend can perform admin operations
    (e.g. insert demos for guests) without RLS restrictions.

    Returns:
        Supabase Client instance.
    """
    global _client
    if _client is None:
        url = os.environ["SUPABASE_URL"]
        key = os.environ["SUPABASE_SERVICE_KEY"]
        _client = create_client(url, key)
    return _client
