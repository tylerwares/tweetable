from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, Field, RootModel


class UploadRequest(BaseModel):
    note_text: Optional[str] = Field(
        default=None, description='Raw note content submitted by the user.'
    )
    file_name: Optional[str] = Field(default=None, description='Original file name, if provided.')


class UploadResponse(BaseModel):
    note_id: str = Field(description='Supabase identifier for the uploaded note.')
    size: int = Field(description='Payload size in bytes.')


class GenerateRequest(BaseModel):
    note_id: Optional[str] = Field(default=None, description='Existing note identifier.')
    prompt: Optional[str] = Field(default=None, description='Inline note content to transform.')
    persona: str = Field(description='Persona key selected by the user.')
    persona_bio: Optional[str] = Field(default=None, description='Optional bio to steer output.')


class ThreadResponse(RootModel[List[str]]):
    pass


class GenerateResponse(BaseModel):
    short_tweets: List[str]
    long_tweets: List[str]
    threads: List[List[str]]


class DraftCreateRequest(BaseModel):
    content: str
    persona: str
    metadata: Optional[dict] = None


class DraftResponse(BaseModel):
    id: str
    content: str
    persona: str
    metadata: Optional[dict] = None
    created_at: Optional[datetime] = None


class PersonaProfile(BaseModel):
    persona: str
    bio: Optional[str] = None
    preferences: Optional[dict] = None


# ----- Multi-stage pipeline schemas -----


class VoiceProfileResponse(BaseModel):
    voice_profile: str
    stylistic_quirks: List[str]
    persona: str


class IdeaItem(BaseModel):
    title: str
    summary: str
    virality: int
    relatability: int
    emotional_punch: int


class IdeasResponse(BaseModel):
    ideas: List[IdeaItem]


class InsightAngle(BaseModel):
    idea_title: str
    angle: str


class InsightAnglesResponse(BaseModel):
    angles: List[InsightAngle]


class TweetOutput(BaseModel):
    short_tweet: str
    tweets: List[str]
    threads: List[List[str]]


class ShitpostResponse(BaseModel):
    shitpost: str


class PipelineRunRequest(BaseModel):
    note_text: str
    include_shitpost: bool = True
    session_id: Optional[str] = None


class PipelineRunResponse(BaseModel):
    session_id: str
    voice_profile: VoiceProfileResponse
    ideas: IdeasResponse
    angles: InsightAnglesResponse
    tweets: TweetOutput
    shitpost: Optional[ShitpostResponse] = None


StageLiteral = Literal['voice', 'ideas', 'angles', 'tweets', 'shitpost']


class PipelineStageRequest(BaseModel):
    note_text: Optional[str] = None
    voice_profile: Optional[VoiceProfileResponse] = None
    ideas: Optional[IdeasResponse] = None
    angles: Optional[InsightAnglesResponse] = None
    include_shitpost: bool = True
    session_id: Optional[str] = None


class PipelineStageResponse(BaseModel):
    stage: StageLiteral
    session_id: str
    voice_profile: Optional[VoiceProfileResponse] = None
    ideas: Optional[IdeasResponse] = None
    angles: Optional[InsightAnglesResponse] = None
    tweets: Optional[TweetOutput] = None
    shitpost: Optional[ShitpostResponse] = None
