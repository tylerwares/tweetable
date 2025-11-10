from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .routes import auth, billing, drafts, generate, persona, upload
from .utils.limiter import register_limiter

settings = get_settings()

app = FastAPI(title='Tweetable API', version='0.1.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

register_limiter(app)

app.include_router(upload.router)
app.include_router(generate.router)
app.include_router(drafts.router)
app.include_router(persona.router)
app.include_router(auth.router)
app.include_router(billing.router)


@app.get('/health')
async def health_check():
    return {'status': 'ok'}
