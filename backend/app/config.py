from functools import lru_cache
from os import getenv

from dotenv import load_dotenv
from pydantic import BaseModel, Field

load_dotenv()


class Settings(BaseModel):
    supabase_url: str = Field(default_factory=lambda: getenv('SUPABASE_URL', ''))
    supabase_service_key: str = Field(default_factory=lambda: getenv('SUPABASE_SERVICE_ROLE_KEY', ''))
    supabase_anon_key: str = Field(default_factory=lambda: getenv('SUPABASE_ANON_KEY', ''))
    supabase_jwt_secret: str = Field(default_factory=lambda: getenv('SUPABASE_JWT_SECRET', ''))
    supabase_schema: str = Field(default_factory=lambda: getenv('SUPABASE_DB_SCHEMA', 'public'))
    openai_api_key: str = Field(default_factory=lambda: getenv('OPENAI_API_KEY', ''))
    openai_model: str = Field(default_factory=lambda: getenv('OPENAI_MODEL', 'gpt-4o-mini'))
    frontend_origin: str = Field(default_factory=lambda: getenv('FRONTEND_ORIGIN', 'http://localhost:3000'))
    rate_limit_generate: str = Field(default_factory=lambda: getenv('RATE_LIMIT_GENERATE', '25/minute'))
    # Stripe
    stripe_secret_key: str = Field(default_factory=lambda: getenv('STRIPE_SECRET_KEY', ''))
    stripe_price_id: str = Field(default_factory=lambda: getenv('STRIPE_PRICE_ID', ''))
    stripe_webhook_secret: str = Field(default_factory=lambda: getenv('STRIPE_WEBHOOK_SECRET', ''))
    frontend_url: str = Field(default_factory=lambda: getenv('FRONTEND_URL', ''))


@lru_cache
def get_settings() -> Settings:
    return Settings()
