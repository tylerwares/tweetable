"""Tone analysis and tone-aware generation prompts per PRDDelta."""

import json
from typing import Any, Dict

from fastapi import HTTPException, status
from openai import AsyncOpenAI, OpenAIError

from ..config import get_settings
from ..schemas_tone import ToneAnalysisResponse, ToneGenerateRequest, ToneGenerateResponse


VOICE_ANALYSIS_PROMPT = """Analyze the following user text for writing style. For each dimension, return a score from 0–100.

Dimensions:
1. Professional ↔ Casual
2. Polished ↔ Chaotic
3. Calm ↔ Enraged
4. Optimistic ↔ Cynical
5. Insightful ↔ Entertaining
6. Clean ↔ Profane

Return ONLY JSON with numeric values for each dimension:
{
  "professional_casual": NUMBER,
  "polished_chaotic": NUMBER,
  "calm_enraged": NUMBER,
  "optimistic_cynical": NUMBER,
  "insightful_entertaining": NUMBER,
  "clean_profane": NUMBER
}

User text:
{user_text}
"""


GENERATION_PROMPT = """You are Tweetable, a tool that converts long-form notes into tweet-ready content in the user's voice.

You will receive:
1. Original user text
2. 6 slider values (0–100)
3. Output requirements:
   - 4 short tweets (<100 chars)
   - 4 long tweets (100–280 chars)
   - 2 threads (3–5 tweets each)

Using the slider values, adjust:
- vocabulary professionalism or casualness
- sentence polish vs chaos
- calmness vs intensity
- optimism vs cynicism
- insight density vs entertainment
- profanity level

Original text:
{user_text}

Tone sliders (0-100):
- professional_casual: {professional_casual}
- polished_chaotic: {polished_chaotic}
- calm_enraged: {calm_enraged}
- optimistic_cynical: {optimistic_cynical}
- insightful_entertaining: {insightful_entertaining}
- clean_profane: {clean_profane}

Return JSON:
{{
 "short_tweets": [...],
 "long_tweets": [...],
 "threads": [
   ["tweet1","tweet2","tweet3"],
   ["tweet1","tweet2","tweet3","tweet4"]
 ]
}}
"""


class ToneService:
    def __init__(self) -> None:
        settings = get_settings()
        self._client = AsyncOpenAI(api_key=settings.openai_api_key or None)
        self._model = settings.openai_model
        self._has_key = bool(settings.openai_api_key)

    async def _call_json(self, prompt: str) -> Dict[str, Any]:
        if not self._has_key:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail='OPENAI_API_KEY is not configured.')
        try:
            if hasattr(self._client, 'responses'):
                resp = await self._client.responses.create(
                    model=self._model,
                    input=prompt,
                    response_format={'type': 'json_object'}
                )
                payload = getattr(resp, 'output_text', None)
            else:
                completion = await self._client.chat.completions.create(
                    model=self._model,
                    messages=[
                        {'role': 'system', 'content': 'Reply with valid JSON only.'},
                        {'role': 'user', 'content': prompt}
                    ]
                )
                payload = completion.choices[0].message.content if completion.choices else None
        except OpenAIError as exc:  # pragma: no cover
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f'OpenAI error: {exc}') from exc

        if not payload:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail='OpenAI returned empty response')
        try:
            return json.loads(payload)
        except json.JSONDecodeError as exc:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail='OpenAI response was not valid JSON') from exc

    async def analyze(self, text: str) -> ToneAnalysisResponse:
        data = await self._call_json(VOICE_ANALYSIS_PROMPT.format(user_text=text))
        return ToneAnalysisResponse.model_validate(data)

    async def generate(self, payload: ToneGenerateRequest) -> ToneGenerateResponse:
        tone = payload.tone
        prompt = GENERATION_PROMPT.format(
            user_text=payload.note_text,
            professional_casual=tone.professional_casual,
            polished_chaotic=tone.polished_chaotic,
            calm_enraged=tone.calm_enraged,
            optimistic_cynical=tone.optimistic_cynical,
            insightful_entertaining=tone.insightful_entertaining,
            clean_profane=tone.clean_profane
        )
        data = await self._call_json(prompt)
        return ToneGenerateResponse.model_validate(data)


tone_service = ToneService()
