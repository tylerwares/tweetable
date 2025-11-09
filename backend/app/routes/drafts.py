from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from ..db import get_supabase_client
from ..schemas import DraftCreateRequest, DraftResponse
from ..utils.auth import get_current_user, get_user_id

router = APIRouter(prefix='/drafts', tags=['drafts'])


@router.get('', response_model=List[DraftResponse])
async def list_drafts(
    supabase: Client = Depends(get_supabase_client),
    user: Dict[str, Any] = Depends(get_current_user)
) -> List[DraftResponse]:
    user_id = get_user_id(user)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Missing user identifier.')

    response = (
        supabase.table('drafts')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', desc=True)
        .execute()
    )
    return [DraftResponse.model_validate(item) for item in response.data or []]


@router.post('', response_model=DraftResponse, status_code=status.HTTP_201_CREATED)
async def create_draft(
    payload: DraftCreateRequest,
    supabase: Client = Depends(get_supabase_client),
    user: Dict[str, Any] = Depends(get_current_user)
) -> DraftResponse:
    user_id = get_user_id(user)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Missing user identifier.')

    record = {
        'content': payload.content,
        'persona': payload.persona,
        'metadata': payload.metadata,
        'user_id': user_id
    }

    response = supabase.table('drafts').insert(record).execute()
    data = response.data or []
    if not data:
        raise HTTPException(status_code=500, detail='Failed to save draft.')

    return DraftResponse.model_validate(data[0])
