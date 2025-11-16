"""Playground endpoint for shitpost/ragebait separate from main flow."""

from fastapi import APIRouter, Depends, HTTPException, status
from openai import AsyncOpenAI, OpenAIError

from ..config import get_settings
from ..utils.auth import get_current_user

router = APIRouter(prefix='/playground', tags=['playground'])

PLAYGROUND_PROMPT = """You are a chaotic tweet writer. Mode: {mode}.
Take the user's text and return one tweet under 200 characters that fits the mode (shitpost or ragebait) while staying human and witty.
Return JSON: {{"text": "..."}}
User text:
{user_text}
"""


@router.post('/generate')
async def playground_generate(payload: dict, user=Depends(get_current_user)):
    settings = get_settings()
    client = AsyncOpenAI(api_key=settings.openai_api_key or None)
    if not settings.openai_api_key:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail='OPENAI_API_KEY is required')
    mode = payload.get('mode', 'shitpost')
    text = payload.get('text', '')
    if not text:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='text is required')
    prompt = PLAYGROUND_PROMPT.format(mode=mode, user_text=text)
    try:
        resp = await client.chat.completions.create(
            model=settings.openai_model,
            messages=[{'role': 'system', 'content': 'Reply with JSON only.'}, {'role': 'user', 'content': prompt}]
        )
        content = resp.choices[0].message.content if resp.choices else None
    except OpenAIError as exc:  # pragma: no cover
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    if not content:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail='Empty response')
    try:
        import json
        data = json.loads(content)
        return {'text': data.get('text', '')}
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail='Invalid JSON from model') from exc
