"""Demo CRUD and generation API routes."""
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel

from middleware.rate_limit import limiter
from services.supabase_client import get_supabase
from services.user_setup import ensure_user_rows
from services.claude import generate_demo, ClaudeError

router = APIRouter(prefix="/demos", tags=["demos"])


class GenerateRequest(BaseModel):
    idea: str
    vibe: Optional[str] = None


class Brief(BaseModel):
    communicates: str
    whoItsFor: str
    validate: List[str]
    emotionalSignals: List[str]
    redFlags: List[str]


class GenerateResponse(BaseModel):
    id: str
    idea: str
    vibe: Optional[str] = None
    demo_html: str
    brief: Brief
    share_url: str
    created_at: Optional[str] = None


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


@router.post("/generate", response_model=GenerateResponse)
@limiter.limit("5/minute")
async def generate_demo_route(
    payload: GenerateRequest,
    request: Request,
    user_id: Optional[str] = Depends(get_user_id),
    user_email: Optional[str] = Depends(get_user_email),
):
    """Generate a demo. Requires auth, credits, and respects rate limits."""
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sign in to generate demos")

    supabase = get_supabase()
    ensure_user_rows(user_id, user_email)

    # Atomic deduction: prevents race condition from concurrent requests
    deduct_result = supabase.rpc("deduct_credit", {"uid": user_id}).execute()

    if not deduct_result.data or deduct_result.data is False:
        credit_res = supabase.table("user_credits").select("credits").eq("user_id", user_id).single().execute()
        credits = credit_res.data["credits"] if credit_res.data else 0
        if credits < 1:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="No credits remaining. Purchase more to continue.",
            )

    try:
        result: Dict[str, Any] = await generate_demo(payload.idea, payload.vibe)
    except ClaudeError as e:
        supabase.rpc("refund_credit", {"uid": user_id}).execute()
        raise HTTPException(status_code=500, detail=str(e))

    brief = result.get("brief", {})
    demo_html = result.get("demoHtml") or result.get("demo_html")
    if not demo_html:
        supabase.rpc("refund_credit", {"uid": user_id}).execute()
        raise HTTPException(status_code=500, detail="AI did not return demoHtml")

    data = {
        "user_id": user_id,
        "idea": payload.idea,
        "vibe": payload.vibe,
        "demo_html": demo_html,
        "brief": brief,
        "is_public": True,
    }

    inserted = supabase.table("demos").insert(data).execute()
    if not inserted.data:
        raise HTTPException(status_code=500, detail="Failed to save demo")

    row = inserted.data[0]
    demo_id = row["id"]

    return GenerateResponse(
        id=str(demo_id),
        idea=payload.idea,
        vibe=payload.vibe,
        demo_html=demo_html,
        brief=Brief(**brief),
        share_url=f"/demo/{demo_id}",
        created_at=row.get("created_at"),
    )


@router.get("", response_model=List[GenerateResponse])
async def list_demos(user_id: str = Depends(get_user_id)):
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    supabase = get_supabase()
    res = (
        supabase.table("demos")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    demos: List[GenerateResponse] = []
    for row in res.data or []:
        demos.append(
            GenerateResponse(
                id=str(row["id"]),
                idea=row["idea"],
                vibe=row.get("vibe"),
                demo_html=row["demo_html"],
                brief=Brief(**row["brief"]),
                share_url=f"/demo/{row['id']}",
                created_at=row.get("created_at"),
            )
        )
    return demos


@router.get("/{demo_id}")
async def get_demo(demo_id: str):
    supabase = get_supabase()
    res = (
        supabase.table("demos")
        .select("*")
        .eq("id", demo_id)
        .single()
        .execute()
    )
    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Demo not found"
        )
    row = res.data
    return {
        "id": str(row["id"]),
        "idea": row["idea"],
        "vibe": row.get("vibe"),
        "demo_html": row["demo_html"],
        "brief": row["brief"],
        "share_url": f"/demo/{row['id']}",
        "created_at": row.get("created_at"),
    }


@router.delete("/{demo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_demo(demo_id: str, user_id: str = Depends(get_user_id)):
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    supabase = get_supabase()
    res = (
        supabase.table("demos")
        .delete()
        .eq("id", demo_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demo not found or not owned by user",
        )
    return
