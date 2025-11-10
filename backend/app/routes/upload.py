from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from ..db import get_supabase_client
from ..schemas import UploadRequest, UploadResponse
from ..utils.auth import get_current_user, get_user_id
from ..utils.usage import get_plan_and_usage, increment_upload

router = APIRouter(prefix='/upload', tags=['upload'])


@router.post('', response_model=UploadResponse)
async def upload_note(
    payload: UploadRequest,
    supabase: Client = Depends(get_supabase_client),
    user: Dict[str, Any] = Depends(get_current_user)
) -> UploadResponse:
    if not payload.note_text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail='Payload must include note_text.'
        )

    encoded = payload.note_text.encode('utf-8')
    if len(encoded) > 50 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail='Notes must be 50 KB or smaller.'
        )

    user_id = get_user_id(user)

    # Usage enforcement for free plan
    plan, uploads, _gens = get_plan_and_usage(supabase, user_id)
    if plan == 'free' and uploads >= 3:
        raise HTTPException(status_code=402, detail='Free plan allows up to 3 uploads per month.')

    insert_payload = {
        'content': payload.note_text,
        'filename': payload.file_name,
        'user_id': user_id,
        'size_bytes': len(encoded)
    }

    response = supabase.table('notes').insert(insert_payload).execute()
    data = response.data or []

    note_id = data[0].get('id') if data else None
    if note_id is None:
        raise HTTPException(status_code=500, detail='Failed to persist note.')

    # Update usage counter
    increment_upload(supabase, user_id)
    return UploadResponse(note_id=str(note_id), size=len(encoded))
