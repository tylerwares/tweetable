"""Routes implementing the multi-stage Tweetable pipeline defined in the PRD."""

import logging
import uuid
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from ..db import get_supabase_client
from ..schemas import (
    IdeasResponse,
    InsightAnglesResponse,
    PipelineRunRequest,
    PipelineRunResponse,
    PipelineStageRequest,
    PipelineStageResponse,
    ShitpostResponse,
    StageLiteral,
    TweetOutput,
    VoiceProfileResponse
)
from ..services.pipeline_service import pipeline_llm_service
from ..utils.auth import get_current_user, get_user_id
from ..utils.usage import increment_generation

logger = logging.getLogger(__name__)

router = APIRouter(prefix='/pipeline', tags=['pipeline'])

STAGE_TABLES = {
    'voice': 'voice_profiles',
    'ideas': 'idea_extractions',
    'angles': 'insight_angles',
    'tweets': 'tweet_generations',
    'shitpost': 'shitposts'
}


def _persist_stage(supabase: Client, stage: StageLiteral, session_id: str, user_id: str, data: Dict[str, Any]) -> None:
    table = STAGE_TABLES.get(stage)
    if not table:
        return
    try:
        supabase.table(table).upsert({
            'session_id': session_id,
            'user_id': user_id,
            'data': data
        }, on_conflict='session_id').execute()
    except Exception as exc:  # pragma: no cover - Supabase errors should not crash request
        logger.warning('Failed to persist %s for session %s: %s', stage, session_id, exc)


@router.post('/run', response_model=PipelineRunResponse)
async def run_pipeline(
    payload: PipelineRunRequest,
    supabase: Client = Depends(get_supabase_client),
    user=Depends(get_current_user)
) -> PipelineRunResponse:
    note_text = payload.note_text.strip()
    if not note_text:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='note_text is required')

    session_id = payload.session_id or str(uuid.uuid4())
    user_id = get_user_id(user)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Missing user id')

    voice = await pipeline_llm_service.run_stage1(note_text)
    _persist_stage(supabase, 'voice', session_id, user_id, voice.model_dump())

    ideas = await pipeline_llm_service.run_stage2(note_text, voice)
    _persist_stage(supabase, 'ideas', session_id, user_id, ideas.model_dump())

    angles = await pipeline_llm_service.run_stage3(voice, ideas)
    _persist_stage(supabase, 'angles', session_id, user_id, angles.model_dump())

    tone_for_generation = payload.tone_overrides or voice.tone_scores
    tweets = await pipeline_llm_service.run_stage4(voice, angles, tone_for_generation)
    _persist_stage(supabase, 'tweets', session_id, user_id, tweets.model_dump())

    shitpost = None
    if payload.include_shitpost:
        shitpost = await pipeline_llm_service.run_stage5(voice, angles)
        _persist_stage(supabase, 'shitpost', session_id, user_id, shitpost.model_dump())

    increment_generation(supabase, user_id)

    return PipelineRunResponse(
        session_id=session_id,
        voice_profile=voice,
        ideas=ideas,
        angles=angles,
        tweets=tweets,
        shitpost=shitpost
    )


def _require(condition: bool, message: str) -> None:
    if not condition:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)


@router.post('/stage/{stage}', response_model=PipelineStageResponse)
async def regenerate_stage(
    stage: StageLiteral,
    payload: PipelineStageRequest,
    supabase: Client = Depends(get_supabase_client),
    user=Depends(get_current_user)
) -> PipelineStageResponse:
    session_id = payload.session_id or str(uuid.uuid4())
    user_id = get_user_id(user)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Missing user id')

    voice: VoiceProfileResponse | None = payload.voice_profile
    ideas: IdeasResponse | None = payload.ideas
    angles: InsightAnglesResponse | None = payload.angles
    tweets: TweetOutput | None = None
    shitpost: ShitpostResponse | None = None

    if stage == 'voice':
        _require(payload.note_text is not None and payload.note_text.strip(), 'note_text is required for voice stage')
        voice = await pipeline_llm_service.run_stage1(payload.note_text)
    elif stage == 'ideas':
        _require(payload.note_text is not None and payload.note_text.strip(), 'note_text is required for ideas stage')
        _require(voice is not None, 'voice_profile is required for ideas stage')
        ideas = await pipeline_llm_service.run_stage2(payload.note_text, voice)
    elif stage == 'angles':
        _require(voice is not None, 'voice_profile is required for angles stage')
        _require(ideas is not None, 'ideas are required for angles stage')
        angles = await pipeline_llm_service.run_stage3(voice, ideas)
    elif stage == 'tweets':
        _require(voice is not None, 'voice_profile is required for tweets stage')
        _require(angles is not None, 'angles are required for tweets stage')
        tone_for_generation = payload.tone_overrides or (voice.tone_scores if voice else None)
        _require(tone_for_generation is not None, 'tone scores required for tweet stage')
        tweets = await pipeline_llm_service.run_stage4(voice, angles, tone_for_generation)
    elif stage == 'shitpost':
        _require(voice is not None, 'voice_profile is required for shitpost stage')
        _require(angles is not None, 'angles are required for shitpost stage')
        shitpost = await pipeline_llm_service.run_stage5(voice, angles)
    else:  # pragma: no cover - stage literal restricts values
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Unknown stage')

    result_map: Dict[str, Any] = {
        'voice': voice,
        'ideas': ideas,
        'angles': angles,
        'tweets': tweets,
        'shitpost': shitpost
    }

    model = result_map.get(stage)
    if model is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='Stage returned empty result')

    _persist_stage(supabase, stage, session_id, user_id, model.model_dump())

    if stage == 'tweets':
        increment_generation(supabase, user_id)

    return PipelineStageResponse(
        stage=stage,
        session_id=session_id,
        voice_profile=voice,
        ideas=ideas,
        angles=angles,
        tweets=tweets,
        shitpost=shitpost
    )
