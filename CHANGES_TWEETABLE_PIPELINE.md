# Tweetable Pipeline Upgrade — Change Summary

## Backend
- Added multi-stage pipeline service with PRD prompts for voice, ideas, angles, tweets, and shitpost (`backend/app/services/pipeline_service.py`).
- Added pipeline routes: `/pipeline/run` (full pipeline) and `/pipeline/stage/{stage}` (regeneration) with Supabase persistence (`backend/app/routes/pipeline.py`).
- Extended Pydantic schemas for pipeline stage inputs/outputs (`backend/app/schemas.py`).
- Registered pipeline router in FastAPI app.

## Frontend
- Added pipeline typings (`frontend/types/pipeline.ts`).
- API helpers now support `NEXT_PUBLIC_API_URL` plus new pipeline endpoints (`frontend/utils/api.ts`).
- Rebuilt `/app` page to run the pipeline, view stage outputs, regenerate stages, and save drafts.

## Docs/Schema
- Added implementation plan (`docs/IMPLEMENTATION_PLAN_TWEETABLE.md`).
- Added Supabase schema SQL for stage tables and usage function (`docs/pipeline_schema.sql`).

## Notes
- Requires new Supabase tables per `docs/pipeline_schema.sql`.
- Ensure env vars are configured: OpenAI keys, API URL on frontend, CORS origins on backend.
