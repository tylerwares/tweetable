from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from ..db import get_supabase_client
from ..schemas import PersonaProfile
from ..utils.auth import get_current_user, get_user_id

router = APIRouter(prefix='/persona', tags=['persona'])


@router.get('', response_model=PersonaProfile)
async def get_persona(
    supabase: Client = Depends(get_supabase_client),
    user: Dict[str, Any] = Depends(get_current_user)
) -> PersonaProfile:
    user_id = get_user_id(user)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Missing user identifier.')

    response = (
        supabase.table('personas')
        .select('*')
        .eq('user_id', user_id)
        .limit(1)
        .execute()
    )
    records = response.data or []
    if not records:
        return PersonaProfile(persona='builder')

    return PersonaProfile.model_validate(records[0])


@router.post('', response_model=PersonaProfile)
async def upsert_persona(
    payload: PersonaProfile,
    supabase: Client = Depends(get_supabase_client),
    user: Dict[str, Any] = Depends(get_current_user)
) -> PersonaProfile:
    user_id = get_user_id(user)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Missing user identifier.')

    record = {
        'persona': payload.persona,
        'bio': payload.bio,
        'preferences': payload.preferences,
        'user_id': user_id
    }

    response = supabase.table('personas').upsert(record, on_conflict='user_id').execute()
    data = response.data or []
    if not data:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='Failed to upsert persona.')

    return PersonaProfile.model_validate(data[0])
