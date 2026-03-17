"""Payment routes for Paystack integration (MoMo + card)."""
import hashlib
import hmac
import logging
import os
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel

from services.supabase_client import get_supabase
from services.user_setup import ensure_user_rows

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/payments", tags=["payments"])

PAYSTACK_SECRET_KEY = os.getenv("PAYSTACK_SECRET_KEY", "")
PAYSTACK_BASE = "https://api.paystack.co"
PRICE_PESEWAS = 5000  # GHS 50 = 5000 pesewas
CREDITS_PER_PURCHASE = 3


class InitPaymentRequest(BaseModel):
    email: str
    callback_url: Optional[str] = None


class InitPaymentResponse(BaseModel):
    authorization_url: str
    access_code: str
    reference: str


async def get_user_id(request: Request) -> Optional[str]:
    user = getattr(request.state, "user", None)
    if user and isinstance(user, dict):
        return user.get("sub") or user.get("id")
    return None


async def get_user_email(request: Request) -> Optional[str]:
    user = getattr(request.state, "user", None)
    if user and isinstance(user, dict):
        return user.get("email")
    return None


@router.get("/credits")
async def get_credits(
    user_id: str = Depends(get_user_id),
    user_email: str = Depends(get_user_email),
):
    """Return the authenticated user's current credit balance."""
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Auth required")

    ensure_user_rows(user_id, user_email)

    supabase = get_supabase()
    res = supabase.table("user_credits").select("credits").eq("user_id", user_id).single().execute()
    credits = res.data["credits"] if res.data else 0
    return {"credits": credits}


@router.post("/initialize", response_model=InitPaymentResponse)
async def initialize_payment(
    payload: InitPaymentRequest,
    request: Request,
    user_id: str = Depends(get_user_id),
):
    """Start a Paystack transaction for 1 demo credit (GHS 50)."""
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Auth required")
    if not PAYSTACK_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Payment not configured")

    supabase = get_supabase()

    body = {
        "email": payload.email,
        "amount": PRICE_PESEWAS,
        "currency": "GHS",
        "channels": ["mobile_money", "card"],
        "metadata": {
            "user_id": user_id,
            "credits": CREDITS_PER_PURCHASE,
        },
    }
    if payload.callback_url:
        body["callback_url"] = payload.callback_url

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{PAYSTACK_BASE}/transaction/initialize",
            json=body,
            headers={"Authorization": f"Bearer {PAYSTACK_SECRET_KEY}"},
        )
        if resp.status_code != 200:
            logger.error("Paystack init failed: %s", resp.text[:300])
            raise HTTPException(status_code=502, detail="Payment provider error")
        data = resp.json()

    if not data.get("status"):
        raise HTTPException(status_code=502, detail="Payment initialization failed")

    tx = data["data"]

    supabase.table("payments").insert({
        "user_id": user_id,
        "paystack_reference": tx["reference"],
        "amount_pesewas": PRICE_PESEWAS,
        "credits_purchased": CREDITS_PER_PURCHASE,
        "status": "pending",
    }).execute()

    return InitPaymentResponse(
        authorization_url=tx["authorization_url"],
        access_code=tx["access_code"],
        reference=tx["reference"],
    )


@router.post("/webhook")
async def paystack_webhook(request: Request):
    """Paystack webhook: verify signature, credit user on success."""
    if not PAYSTACK_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Not configured")

    body = await request.body()
    signature = request.headers.get("x-paystack-signature", "")
    expected = hmac.new(
        PAYSTACK_SECRET_KEY.encode(), body, hashlib.sha512
    ).hexdigest()

    if not hmac.compare_digest(signature, expected):
        raise HTTPException(status_code=400, detail="Invalid signature")

    import json
    event = json.loads(body)
    if event.get("event") != "charge.success":
        return {"status": "ignored"}

    data = event.get("data", {})
    reference = data.get("reference")
    if not reference:
        return {"status": "no_reference"}

    supabase = get_supabase()

    payment_res = supabase.table("payments").select("*").eq("paystack_reference", reference).single().execute()
    if not payment_res.data:
        logger.warning("Webhook for unknown reference: %s", reference)
        return {"status": "unknown_reference"}

    payment = payment_res.data
    if payment["status"] == "success":
        return {"status": "already_processed"}

    supabase.table("payments").update({"status": "success"}).eq("paystack_reference", reference).execute()

    user_id = payment["user_id"]
    credits_to_add = payment["credits_purchased"]

    ensure_user_rows(user_id)
    credit_res = supabase.table("user_credits").select("credits").eq("user_id", user_id).single().execute()
    current = credit_res.data["credits"] if credit_res.data else 0

    supabase.table("user_credits").update({
        "credits": current + credits_to_add,
        "updated_at": "now()",
    }).eq("user_id", user_id).execute()

    logger.info("Credited %d demos to user %s (ref: %s)", credits_to_add, user_id, reference)
    return {"status": "credited"}


@router.get("/verify/{reference}")
async def verify_payment(reference: str, user_id: str = Depends(get_user_id)):
    """Client-side verification after Paystack redirect."""
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Auth required")
    if not PAYSTACK_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Not configured")

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{PAYSTACK_BASE}/transaction/verify/{reference}",
            headers={"Authorization": f"Bearer {PAYSTACK_SECRET_KEY}"},
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail="Verification failed")
        data = resp.json()

    if not data.get("status") or data["data"].get("status") != "success":
        return {"credited": False, "message": "Payment not successful"}

    supabase = get_supabase()
    payment_res = supabase.table("payments").select("*").eq("paystack_reference", reference).single().execute()
    if not payment_res.data:
        return {"credited": False, "message": "Unknown reference"}

    payment = payment_res.data
    if payment["status"] == "success":
        credit_res = supabase.table("user_credits").select("credits").eq("user_id", user_id).single().execute()
        return {"credited": True, "credits": credit_res.data["credits"] if credit_res.data else 0}

    supabase.table("payments").update({"status": "success"}).eq("paystack_reference", reference).execute()

    ensure_user_rows(user_id)
    credit_res = supabase.table("user_credits").select("credits").eq("user_id", user_id).single().execute()
    current = credit_res.data["credits"] if credit_res.data else 0
    new_credits = current + payment["credits_purchased"]

    supabase.table("user_credits").update({"credits": new_credits}).eq("user_id", user_id).execute()

    return {"credited": True, "credits": new_credits}
