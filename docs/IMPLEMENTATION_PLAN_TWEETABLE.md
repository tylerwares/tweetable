# Tweetable Pipeline Upgrade — Implementation Plan

## 1. Current State Recap
- Frontend: Next.js pages router (`frontend/pages`), components at `frontend/components`, Supabase auth via hooks.
- Backend: FastAPI (`backend/app`), routes: `/upload`, `/generate`, `/drafts`, `/persona`, `/billing`, `/auth`. OpenAI logic in `services/openai_service.py` returning a single prompt result.
- Data: Supabase tables `notes`, `drafts`, `personas`, usage tracking via new `usage` helper. Generations endpoint currently expects persona + prompt; there is no multi-stage storage.

## 2. Target Architecture per PRD
- Five LLM stages executed sequentially: Voice Profile → Ideas → Insight Angles → Tweets → Shitpost.
- Need dedicated service layer handling prompts & JSON parsing, plus orchestration route to run full pipeline or individual stages.
- Persist each stage result for auditing/regeneration.

## 3. Backend Tasks
1. **Schemas & Routes**
   - Extend `schemas.py` with Pydantic models for stage requests/responses (Stage1Response, Stage2Response, ... PipelineRequest, PipelineResponse).
   - Add `/pipeline` router with endpoints:
     - `POST /pipeline/run` — orchestrates Stage1-4 (optionally Stage5 when `include_shitpost=true`).
     - `POST /pipeline/stage/{stage}` — regenerate a specific stage given required payload (validate JSON schemas).
     - `GET /pipeline/session/{session_id}` — fetch stored stage outputs (optional if time).
2. **Services & Prompts**
   - Create `services/pipeline.py` (or similar) containing:
     - Prompt templates exactly as PRD defines for Stage1-5.
     - Functions `run_stage1_voice`, `run_stage2_ideas`, ... returning parsed dicts.
     - Helper `call_openai(prompt, response_schema)` using `openai_service` client with structured prompts + fallback placeholder on quota errors.
   - Orchestration function `run_pipeline(user_id, note_text, options)` chaining the stage functions, handling reuse (e.g., reuse Stage1 outputs when provided).
3. **Persistence**
   - Add Supabase helper functions to read/write stage results to new tables: `voice_profiles`, `idea_extractions`, `insight_angles`, `tweet_generations`, `shitposts`.
   - Document SQL for table creation in README or a migrations file under `docs/`.
4. **Usage Limits Integration**
   - Pipeline run should count as a generation (reuse existing usage helper) and optionally track per-stage counts.
5. **Error Handling**
   - Return structured JSON with `error` field on failures; log OpenAI exceptions.

## 4. Frontend Tasks
1. **API Client**
   - Add helper in `frontend/utils/api.ts` for new endpoints (run pipeline, regenerate stage).
2. **UI Updates**
   - Modify `/app` page to show multi-stage outputs:
     - Section for Voice Profile (text + editable area?).
     - Ideas list (cards with regenerate button).
     - Insight angles.
     - Tweets (short/tweets/threads) and Shitpost area.
   - Provide action buttons:
     - Run full pipeline (existing “Generate drafts” button triggers `/pipeline/run`).
     - Regenerate buttons call `/pipeline/stage/{stage}` with latest upstream data.
   - Store stage results in React state (maybe context) so user can navigate/regenerate without re-running everything.
3. **State Handling**
   - Keep Supabase session gating (already enforced). Use SWR or local state to manage results; default to empty placeholders until pipeline returns.

## 5. Data & Config Requirements
- Environment: reuse existing `OPENAI_API_KEY` / `OPENAI_MODEL` plus new `PIPELINE_MODEL` if required (optional, default to existing).
- Supabase SQL to create new tables (document in README/docs):
  - `voice_profiles(id uuid pk, user_id uuid, note_id uuid, data jsonb, created_at timestamptz)` etc.
- Determine `session_id` concept — can reuse `note_id` or create pipeline run id (UUID4). For now, create `pipeline_sessions` table referencing user + note text summary; stage tables reference `session_id`.

## 6. Testing & Documentation
- Add pipeline unit tests (if feasible) for prompt formatting and JSON parsing using stubbed OpenAI responses.
- Update README/docs with new endpoints, request/response examples, Supabase schema instructions, and manual testing checklist.
- Add `CHANGES_TWEETABLE_PIPELINE.md` summarizing modifications.

## 7. Open Questions / Assumptions
- Assume we receive raw notes text each run (no attachments). `note_id` optional to reference uploads table.
- Stage outputs stored as JSON for audit/regeneration; actual editing UI may update state but not persist edits (future work).
- For MVP, Stage5 is optional toggle `include_shitpost` default true; provide button to regenerate only Stage5.

## 8. Implementation Order
1. Extend schemas + add pipeline services/prompts (backend).
2. Create new Supabase helper + pipeline routes.
3. Wire backend orchestration to update existing `/generate` or provide new `/pipeline/run`.
4. Update frontend to call new endpoints + render multi-stage results with regenerate actions.
5. Document SQL/env/test instructions and produce change log.
