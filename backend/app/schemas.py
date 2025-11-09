from datetime import datetime
from typing import List, Optional

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
