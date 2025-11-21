# Tweetable Pipeline Overview

## Stage Summary
1. **Voice extraction** (`run_stage1`)
   - Prompt extracts `voice_profile`, `stylistic_quirks`, `persona`, and `tone_scores` (six 0–100 sliders).
2. **Idea mining** (`run_stage2`)
   - Returns 5–8 `ideas` with title, summary, and virality/relatability/emotional scores.
3. **Insight angles** (`run_stage3`)
   - Returns `angles` tying each idea to sharper takes.
4. **Tweet generation** (`run_stage4`)
   - Uses voice + angles + tone sliders to produce 4 short tweets, 4 long tweets, and 2 threads.
5. **Shitpost** (`run_stage5`, optional)
   - Distills one spicy tweet based on angles.

## Backend Endpoints
- `POST /pipeline/run`
  - Input: { note_text, include_shitpost?, tone_overrides? }
  - Output: session_id, voice_profile (with tone_scores), ideas, angles, tweets (short/long/threads), optional shitpost.
- `POST /pipeline/stage/{stage}`
  - Supports `voice | ideas | angles | tweets | shitpost`.
  - Accepts previously returned stage payloads plus optional `tone_overrides` for tweet regeneration.
- Legacy endpoints (`/tone/*`, `/generate`) remain for compatibility but `/pipeline/*` powers the app.

## Frontend Flow (/app)
1. Upload notes → calls `/pipeline/run`.
2. Sliders initialize from `voice_profile.tone_scores`; tweets populate immediately from `tweets` payload.
3. Clicking “Apply tone & generate” sends `tone_overrides` plus cached voice/ideas/angles to `/pipeline/stage/tweets`.
4. Per-tweet regenerate buttons reuse the stage endpoint and replace the targeted slot.

All responses are padded to guarantee 4 short tweets, 4 long tweets, and 2 threads so the UI sections are always populated.
