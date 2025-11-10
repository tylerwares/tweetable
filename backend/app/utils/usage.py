from datetime import datetime
from typing import Tuple

from supabase import Client


def current_month_key() -> str:
    return datetime.utcnow().strftime('%Y-%m')


def get_plan_and_usage(supabase: Client, user_id: str) -> Tuple[str, int, int]:
    month = current_month_key()
    plan_resp = (
        supabase.table('users').select('plan').eq('id', user_id).limit(1).execute()
    )
    plan = 'free'
    rows = plan_resp.data or []
    if rows:
        plan = rows[0].get('plan') or 'free'

    usage_resp = (
        supabase.table('usage').select('uploads,generations').eq('user_id', user_id).eq('month', month).limit(1).execute()
    )
    uploads = generations = 0
    rows = usage_resp.data or []
    if rows:
        uploads = rows[0].get('uploads') or 0
        generations = rows[0].get('generations') or 0

    return plan, uploads, generations


def increment_upload(supabase: Client, user_id: str) -> None:
    month = current_month_key()
    supabase.table('usage').upsert({
        'user_id': user_id,
        'month': month,
        'uploads': 1,
        'generations': 0,
    }, on_conflict='user_id,month', ignore_duplicates=False).execute()
    supabase.rpc('increment_usage', {'p_user_id': user_id, 'p_month': month, 'p_field': 'uploads'}).execute()


def increment_generation(supabase: Client, user_id: str) -> None:
    month = current_month_key()
    supabase.table('usage').upsert({
        'user_id': user_id,
        'month': month,
        'uploads': 0,
        'generations': 1,
    }, on_conflict='user_id,month', ignore_duplicates=False).execute()
    supabase.rpc('increment_usage', {'p_user_id': user_id, 'p_month': month, 'p_field': 'generations'}).execute()

