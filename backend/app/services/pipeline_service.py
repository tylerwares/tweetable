"""LLM prompts and helpers for the multi-stage Tweetable pipeline.

Each function maps to a stage in the PRD:
1. Voice extraction
2. Idea mining
3. Insight angle derivation
4. Tweet/Thread generation
5. Shitpost distillation
"""

import json
from typing import Any, Dict

from fastapi import HTTPException, status
from openai import AsyncOpenAI, OpenAIError

from ..config import get_settings
from ..schemas import (
    IdeasResponse,
    InsightAnglesResponse,
    ShitpostResponse,
    ToneScores,
    TweetOutput,
    VoiceProfileResponse
)


DEFAULT_TONE = {
    'professional_casual': 50,
    'polished_chaotic': 50,
    'calm_enraged': 50,
    'optimistic_cynical': 50,
    'insightful_entertaining': 50,
    'clean_profane': 50,
}


STAGE1_PROMPT = """You are Tweetable Stage 1: Voice & Persona Extractor.
Analyze the user's raw input text and extract:
1. VOICE_PROFILE — describe their tone (snarky, blunt, hopeful, sarcastic, introspective, degen, etc.)
2. STYLISTIC_QUIRKS — list 5–10 patterns such as favorite phrases, structure, cadence, or pet peeves.
3. PERSONA — a short label that captures who the user is.
4. TONE_SCORES — numeric sliders (0-100) estimating the user's natural tone for:
   - professional_casual
   - polished_chaotic
   - calm_enraged
   - optimistic_cynical
   - insightful_entertaining
   - clean_profane

Rules:
- Be precise and evocative.
- Never invent traits not implied by the text.
- Return JSON with keys voice_profile, stylistic_quirks, persona, tone_scores.

Raw Text:
{raw_text}
"""


STAGE2_PROMPT = """You are Tweetable Stage 2: Idea Miner.
You already know the user's voice:
Voice Profile: {voice_profile}
Stylistic Quirks: {quirks}
Persona: {persona}

Analyze the raw notes again and extract 5-8 tweet-worthy ideas.
For each idea, provide:
- title (short hook)
- summary (1 sentence)
- virality (1-5)
- relatability (1-5)
- emotional_punch (1-5)

Return JSON:
{{
  "ideas": [
    {{
      "title": "",
      "summary": "",
      "virality": 1,
      "relatability": 1,
      "emotional_punch": 1
    }}
  ]
}}

Raw Text:
{raw_text}
"""


STAGE3_PROMPT = """You are Tweetable Stage 3: Insight Angle Creator.
Use the user's ideas and voice to create sharper angles.

Voice Profile: {voice_profile}
Stylistic Quirks: {quirks}
Persona: {persona}
Ideas:
{ideas}

For each idea, return at least 1-2 angles that push the thinking further.
Return JSON:
{{
  "angles": [
    {{
      "idea_title": "",
      "angle": ""
    }}
  ]
}}
"""


STAGE4_PROMPT = """You are Tweetable Stage 4: Tweet Generator.
Voice Profile: {voice_profile}
Stylistic Quirks: {quirks}
Persona: {persona}
Insight Angles:
{angles}

Tone controls (0-100 scale):
- Professional ↔ Casual: {professional_casual}
- Polished ↔ Chaotic: {polished_chaotic}
- Calm ↔ Enraged: {calm_enraged}
- Optimistic ↔ Cynical: {optimistic_cynical}
- Insightful ↔ Entertaining: {insightful_entertaining}
- Clean ↔ Profane: {clean_profane}

Generate:
1. Four short tweets (<100 chars).
2. Four long tweets (100–280 chars).
3. Two threads, each 3–5 tweets and grounded in the angles.

Rules:
- Must sound human and match the user's quirks and tone sliders.
- No corporate tone or fluffy self-help.
- Build each tweet/thread around the provided angles.

Return JSON:
{{
  "short_tweets": ["", "", "", ""],
  "long_tweets": ["", "", "", ""],
  "threads": [
    ["", "", ""],
    ["", "", "", ""]
  ]
}}
"""


STAGE5_PROMPT = """You are Tweetable Stage 5: Shitpost Distiller.
Voice Profile: {voice_profile}
Stylistic Quirks: {quirks}
Persona: {persona}
Insight Angles:
{angles}

Find the rawest, funniest, pettiest part of the user's writing and produce one tweet (<160 chars).
It should be chaotic yet authentic, matching their voice.
Return JSON:
{{
  "shitpost": ""
}}
"""


class PipelineLLMService:
    """Wraps OpenAI client usage for the PRD-defined pipeline stages."""

    def __init__(self) -> None:
        settings = get_settings()
        self._model = settings.openai_model
        self._has_api_key = bool(settings.openai_api_key)
        self._client = AsyncOpenAI(api_key=settings.openai_api_key or None)

    async def _call(self, prompt: str) -> Dict[str, Any]:
        if not self._has_api_key:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail='OPENAI_API_KEY is not configured.')

        try:
            if hasattr(self._client, 'responses'):
                response = await self._client.responses.create(
                    model=self._model,
                    input=prompt,
                    response_format={'type': 'json_object'}
                )
                payload = getattr(response, 'output_text', None)
            else:
                completion = await self._client.chat.completions.create(
                    model=self._model,
                    messages=[
                        {'role': 'system', 'content': 'Reply with valid JSON only.'},
                        {'role': 'user', 'content': prompt}
                    ]
                )
                payload = completion.choices[0].message.content if completion.choices else None
        except OpenAIError as exc:  # pragma: no cover - network errors
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f'OpenAI error: {exc}') from exc

        if not payload:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail='OpenAI returned empty response')

        try:
            return json.loads(payload)
        except json.JSONDecodeError as exc:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail='OpenAI response was not valid JSON') from exc

    async def run_stage1(self, note_text: str) -> VoiceProfileResponse:
        data = await self._call(STAGE1_PROMPT.format(raw_text=note_text))
        data['tone_scores'] = self._sanitize_tone(data.get('tone_scores'))
        return VoiceProfileResponse.model_validate(data)

    async def run_stage2(self, note_text: str, voice: VoiceProfileResponse) -> IdeasResponse:
        data = await self._call(
            STAGE2_PROMPT.format(
                voice_profile=voice.voice_profile,
                quirks='; '.join(voice.stylistic_quirks),
                persona=voice.persona,
                raw_text=note_text
            )
        )
        return IdeasResponse.model_validate(data)

    async def run_stage3(self, voice: VoiceProfileResponse, ideas: IdeasResponse) -> InsightAnglesResponse:
        data = await self._call(
            STAGE3_PROMPT.format(
                voice_profile=voice.voice_profile,
                quirks='; '.join(voice.stylistic_quirks),
                persona=voice.persona,
                ideas=json.dumps(ideas.model_dump()['ideas'], indent=2)
            )
        )
        return InsightAnglesResponse.model_validate(data)

    async def run_stage4(self, voice: VoiceProfileResponse, angles: InsightAnglesResponse, tone: ToneScores) -> TweetOutput:
        tone_dict = self._sanitize_tone(tone.model_dump())
        data = await self._call(
            STAGE4_PROMPT.format(
                voice_profile=voice.voice_profile,
                quirks='; '.join(voice.stylistic_quirks),
                persona=voice.persona,
                angles=json.dumps(angles.model_dump()['angles'], indent=2),
                **tone_dict
            )
        )

        def _pad_list(items: Any, target: int) -> list[str]:
            arr = list(items) if isinstance(items, list) else []
            while len(arr) < target:
                arr.append('')
            return arr[:target]

        short = _pad_list(data.get('short_tweets'), 4)
        long = _pad_list(data.get('long_tweets'), 4)
        raw_threads = data.get('threads') if isinstance(data.get('threads'), list) else []
        threads = []
        for idx in range(2):
            base = list(raw_threads[idx]) if idx < len(raw_threads) and isinstance(raw_threads[idx], list) else []
            while len(base) < 3:
                base.append('')
            threads.append(base[:5])

        cleaned = {
            'short_tweets': short,
            'long_tweets': long,
            'threads': threads
        }
        return TweetOutput.model_validate(cleaned)

    async def run_stage5(self, voice: VoiceProfileResponse, angles: InsightAnglesResponse) -> ShitpostResponse:
        data = await self._call(
            STAGE5_PROMPT.format(
                voice_profile=voice.voice_profile,
                quirks='; '.join(voice.stylistic_quirks),
                persona=voice.persona,
                angles=json.dumps(angles.model_dump()['angles'], indent=2)
            )
        )
        return ShitpostResponse.model_validate(data)

    def _sanitize_tone(self, payload: Any) -> ToneScores:
        base = DEFAULT_TONE.copy()
        if isinstance(payload, dict):
            for key in base:
                value = payload.get(key)
                try:
                    base[key] = max(0, min(100, int(value)))
                except (TypeError, ValueError):
                    continue
        return ToneScores.model_validate(base)


pipeline_llm_service = PipelineLLMService()
