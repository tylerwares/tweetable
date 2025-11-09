from functools import lru_cache
from typing import Optional

from fastapi import Depends, HTTPException, status
from supabase import Client, create_client

from .config import get_settings, Settings


@lru_cache
def _init_supabase_client() -> Optional[Client]:
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_service_key:
        return None

    return create_client(settings.supabase_url, settings.supabase_service_key)


def get_supabase_client() -> Client:
    client = _init_supabase_client()
    if client is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail='Supabase client is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
        )
    return client


def get_settings_dependency() -> Settings:
    return get_settings()
