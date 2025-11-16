from pydantic import BaseModel, Field


class ToneAnalysisResponse(BaseModel):
    professional_casual: int = Field(ge=0, le=100)
    polished_chaotic: int = Field(ge=0, le=100)
    calm_enraged: int = Field(ge=0, le=100)
    optimistic_cynical: int = Field(ge=0, le=100)
    insightful_entertaining: int = Field(ge=0, le=100)
    clean_profane: int = Field(ge=0, le=100)


class ToneGenerateRequest(BaseModel):
    note_text: str
    tone: ToneAnalysisResponse


class ToneGenerateResponse(BaseModel):
    short_tweets: list[str]
    long_tweets: list[str]
    threads: list[list[str]]
