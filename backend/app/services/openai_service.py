import json
from typing import Any, Dict, Optional

from openai import AsyncOpenAI, OpenAIError

from ..config import get_settings

PROMPT_TEMPLATE = """
You are an assistant that converts user notes into tweetable insights.

Persona: {persona}
Persona Bio: {persona_bio}
Input Text: {text}

Return valid JSON with the schema:
{{
 "short_tweets": ["..."],
 "long_tweets": ["..."],
 "threads": [["...", "..."], ["...", "..."]]
}}

Rules:
- Keep persona tone consistent.
- Each tweet stands alone.
- Threads flow logically.
- Respect character limits (short < 100 chars, long < 280 chars).
"""


class OpenAIService:
    def __init__(self) -> None:
        settings = get_settings()
        self.model = settings.openai_model
        self._has_api_key = bool(settings.openai_api_key)
        self.client = AsyncOpenAI(api_key=settings.openai_api_key or None)

    def _quota_placeholder(self) -> Dict[str, Any]:
        prefix = 'FYI:'
        return {
            'short_tweets': [
                f"{prefix} Rate limits hit. Apparently my credit card needed coffee too.",
                "Short hot take: running out of tokens is the new forgetting to charge your phone."
            ],
            'long_tweets': [
                "Long tweet: The AI gods said 'insufficient quota' and honestly they were right to roast me.",
                "I tried to manifest infinite tokens, but all I got was this error message and a lesson about billing portals."
            ],
            'threads': [
                [
                    "Thread: How to impress nobody with your rate-limit management skills",
                    "1/ Ignore the usage dashboard.",
                    "2/ Mash the generate button like it's a video game.",
                    "3/ Get roasted by the API.",
                    "4/ Promise to top up credits right after this coffee."
                ]
            ]
        }

    async def generate_tweets(
        self, *, persona: str, text: str, persona_bio: Optional[str] = None
    ) -> Dict[str, Any]:
        if not self._has_api_key:
            # Development fallback when the API key is not configured yet.
            return {
                'short_tweets': ['Configure OPENAI_API_KEY to enable live generations.'],
                'long_tweets': [
                    'This is placeholder copy generated locally. Once the backend is connected to OpenAI the real drafts will appear here.'
                ],
                'threads': [['Thread placeholder.']]
            }

        prompt = PROMPT_TEMPLATE.format(
            persona=persona,
            persona_bio=persona_bio or 'N/A',
            text=text
        )

        try:
            if hasattr(self.client, 'responses'):
                response = await self.client.responses.create(
                    model=self.model,
                    input=prompt,
                    response_format={'type': 'json_object'}
                )
                message = getattr(response, 'output_text', None)
            else:
                completion = await self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {
                            'role': 'system',
                            'content': 'You transform notes into structured tweet batches and reply with JSON only.'
                        },
                        {'role': 'user', 'content': prompt}
                    ]
                )
                choice = completion.choices[0]
                message = choice.message.content if choice and choice.message else None
        except OpenAIError as error:
            if getattr(error, 'code', '') == 'insufficient_quota' or 'insufficient_quota' in str(error):
                return self._quota_placeholder()
            raise RuntimeError('OpenAI generation failed') from error

        if not message:
            raise RuntimeError('OpenAI response did not contain text output')
        try:
            return json.loads(message)
        except json.JSONDecodeError as error:
            raise RuntimeError('OpenAI response was not valid JSON') from error


openai_service = OpenAIService()
