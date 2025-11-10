"""Billing routes for Stripe Checkout and webhook handling.

Requires environment variables:
- STRIPE_SECRET_KEY
- STRIPE_PRICE_ID
- STRIPE_WEBHOOK_SECRET
- FRONTEND_URL (e.g., https://tweetable.app)
"""

from typing import Any, Dict

import stripe
from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from supabase import Client

from ..config import get_settings
from ..db import get_supabase_client
from ..utils.auth import get_current_user, get_user_id

router = APIRouter(prefix="/billing", tags=["billing"])


@router.post("/create-checkout-session")
async def create_checkout_session(
    payload: Dict[str, Any],
    request: Request,
    supabase: Client = Depends(get_supabase_client),
    user: Dict[str, Any] = Depends(get_current_user)
):
    settings = get_settings()
    if not settings:
        raise HTTPException(status_code=500, detail="Missing settings")

    if not (stripe_key := getattr(settings, "stripe_secret_key", None)):
        raise HTTPException(status_code=500, detail="Stripe is not configured.")

    stripe.api_key = stripe_key
    user_id = get_user_id(user)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    email = payload.get("email")
    price_id = getattr(settings, "stripe_price_id", None)
    if not price_id:
        raise HTTPException(status_code=500, detail="Missing STRIPE_PRICE_ID")

    frontend_url = getattr(settings, "frontend_url", None) or getattr(settings, "frontend_origin", None)
    if not frontend_url:
        raise HTTPException(status_code=500, detail="Missing FRONTEND_URL/FRONTEND_ORIGIN")

    try:
        session = stripe.checkout.Session.create(
            mode="subscription",
            payment_method_types=["card"],
            customer_email=email,
            success_url=f"{frontend_url}/app?upgrade=success",
            cancel_url=f"{frontend_url}/app?upgrade=cancel",
            line_items=[{"price": price_id, "quantity": 1}],
            metadata={"user_id": user_id},
        )
    except Exception as exc:  # pylint: disable=broad-except
        raise HTTPException(status_code=500, detail=f"Stripe error: {exc}") from exc

    return {"url": session.url}


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    supabase: Client = Depends(get_supabase_client),
    stripe_signature: str = Header(None, alias="Stripe-Signature"),
):
    settings = get_settings()
    webhook_secret = getattr(settings, "stripe_webhook_secret", None)
    if not webhook_secret:
        raise HTTPException(status_code=500, detail="Webhook secret not configured")

    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(payload=payload, sig_header=stripe_signature, secret=webhook_secret)
    except Exception as exc:  # pylint: disable=broad-except
        raise HTTPException(status_code=400, detail=f"Invalid webhook: {exc}") from exc

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        metadata = session.get("metadata", {}) or {}
        user_id = metadata.get("user_id")
        if user_id:
            # Update the user's plan to 'pro' in Supabase (assuming a 'users' table with 'id' and 'plan').
            supabase.table("users").upsert({"id": user_id, "plan": "pro"}, on_conflict="id").execute()

    return {"received": True}

