"""On-demand user setup: creates credits and profile rows if missing."""
import asyncio
import logging

from services.supabase_client import get_supabase

logger = logging.getLogger(__name__)


def _ensure_user_rows_sync(user_id: str, email: str = None):
    """Sync version — runs in thread pool."""
    supabase = get_supabase()

    existing = supabase.table("user_credits").select("user_id, credits").eq("user_id", user_id).execute()
    if not existing.data:
        supabase.table("user_credits").insert({"user_id": user_id, "credits": 1}).execute()
        logger.info("Created credits row for user %s", user_id)
    elif existing.data[0]["credits"] == 0:
        demos = supabase.table("demos").select("id", count="exact").eq("user_id", user_id).execute()
        if demos.count == 0:
            supabase.table("user_credits").update({"credits": 1}).eq("user_id", user_id).execute()
            logger.info("Restored free credit for user %s (no demos generated)", user_id)

    if not email:
        try:
            user_resp = supabase.auth.admin.get_user_by_id(user_id)
            if user_resp and user_resp.user:
                email = user_resp.user.email
        except Exception as e:
            logger.warning("Could not fetch user email: %s", e)

    if email:
        existing_profile = supabase.table("profiles").select("id").eq("id", user_id).execute()
        if not existing_profile.data:
            supabase.table("profiles").insert({"id": user_id, "email": email}).execute()
            logger.info("Created profile for user %s (%s)", user_id, email)


async def ensure_user_rows(user_id: str, email: str = None):
    """Non-blocking wrapper for user setup."""
    await asyncio.to_thread(_ensure_user_rows_sync, user_id, email)
