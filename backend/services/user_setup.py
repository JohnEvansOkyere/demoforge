"""On-demand user setup: creates credits and profile rows if missing."""
import logging

from services.supabase_client import get_supabase

logger = logging.getLogger(__name__)


def ensure_user_rows(user_id: str, email: str = None):
    """Create credits and profile rows for a user if they don't exist."""
    supabase = get_supabase()

    # Credits row (1 free demo for new users)
    existing = supabase.table("user_credits").select("user_id").eq("user_id", user_id).execute()
    if not existing.data:
        supabase.table("user_credits").insert({"user_id": user_id, "credits": 1}).execute()
        logger.info("Created credits row for user %s", user_id)

    # Profile row — fetch email from Supabase if not provided
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
