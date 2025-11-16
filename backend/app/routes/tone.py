"""Endpoints for tone analysis and tone-aware tweet generation (PRDDelta)."""

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from ..db import get_supabase_client
from ..schemas_tone import ToneAnalysisResponse, ToneGenerateRequest, ToneGenerateResponse
from ..services.tone_service import tone_service
from ..utils.auth import get_current_user

router = APIRouter(prefix='/tone', tags=['tone'])


@router.post('/analyze', response_model=ToneAnalysisResponse)
async def analyze_tone(payload: dict, user=Depends(get_current_user), supabase: Client = Depends(get_supabase_client)):
    note_text = payload.get('note_text', '') if payload else ''
    if not note_text or not str(note_text).strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='note_text is required')
    return await tone_service.analyze(str(note_text))


@router.post('/generate', response_model=ToneGenerateResponse)
async def generate_tone(payload: ToneGenerateRequest, user=Depends(get_current_user), supabase: Client = Depends(get_supabase_client)):
    if not payload.note_text.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='note_text is required')
    return await tone_service.generate(payload)
