from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, Request, status
from supabase import Client

from ..config import get_settings
from ..db import get_supabase_client
from ..schemas import GenerateRequest, GenerateResponse
from ..services.openai_service import openai_service
from ..utils.auth import get_current_user, get_user_id
from ..utils.limiter import limiter

router = APIRouter(prefix='/generate', tags=['generate'])


@router.post('', response_model=GenerateResponse)
@limiter.limit(get_settings().rate_limit_generate)
async def generate_drafts(
    request: Request,
    payload: GenerateRequest,
    supabase: Client = Depends(get_supabase_client),
    user: Dict[str, Any] = Depends(get_current_user)
) -> GenerateResponse:
    request.state.user = {'id': get_user_id(user)}

    note_text = payload.prompt
    if payload.note_id:
        note_response = (
            supabase.table('notes')
            .select('content')
            .eq('id', payload.note_id)
            .limit(1)
            .execute()
        )
        note_records = note_response.data or []
        if note_records:
            note_text = note_records[0].get('content')

    if not note_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Provide note text via prompt or note_id.'
        )

    result = await openai_service.generate_tweets(
        persona=payload.persona,
        persona_bio=payload.persona_bio,
        text=note_text
    )

    short = result.get('short_tweets', [])
    long = result.get('long_tweets', [])
    threads = result.get('threads', [])

    return GenerateResponse(short_tweets=short, long_tweets=long, threads=threads)
