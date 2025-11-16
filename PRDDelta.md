PRDDelta.md
Delta Specification — Modifications & Additions to Existing Tweetable MVP

This document describes ONLY the updates, modifications, and additions requested.
All functionality not explicitly modified here should remain unchanged.

1. Scope of Changes

Tweetable’s core flow remains the same.
This delta introduces:

A new Tone Slider System (6 sliders)

Updated tweet output format

Inline editing + regenerate features

Voice analysis → slider baselines

Progress indicators / micro-animations

A separate “Playground” page

Prompt updates for analysis + generation

Privacy messaging update (no storage)

No other architecture should be modified.

2. Add: Tone Slider System
Add six sliders to the UI, displayed after file upload and voice analysis.

Sliders (range 0–100):

Professional ↔ Casual

Polished ↔ Chaotic

Calm ↔ Enraged

Optimistic ↔ Cynical

Insightful ↔ Entertaining

Clean ↔ Profane

Requirements:

Each slider displays two labels (left/right pole).

Each slider gets a baseline value from the voice analysis result.

User can adjust sliders at any time.

Changing slider values does not automatically regenerate content.
Add button: “Regenerate with new tone”.

No other UI elements removed unless specified below.

3. Modify: Generation Output Format

Replace the existing pipeline-style generation UI with the following output structure:

Replace with:

4 Short Tweets (<100 characters)

4 Long Tweets (100–280 characters)

2 Threads (each 3–5 tweets)

Layout:

Short tweets in a 2×2 grid

Long tweets in a 2×2 grid

Threads stacked vertically

No other output formats should be changed.

4. Add: Inline Editing
Add inline editing functionality to each generated tweet.

Each tweet (short/long/thread tweet) must support:

Inline text editing

Live character counter

Character warning at 270+

Copy button

Regenerate this tweet button

Threads must support:

Add tweet

Delete tweet

Reorder tweets (optional for MVP)

5. Add: Voice Analysis → Slider Baselines

After uploading a .txt or .md file:

Add a new backend step:

Generate a tone profile (0–100 values for each slider).

Populate sliders with these baseline values.

No other analysis behavior is removed.

6. Add: Progress Indicators
Add loading states during:

File analysis

Voice extraction

Tweet generation

Regeneration

Include fun micro-messages (examples):

“Analyzing your voice…”

“Finding your best ideas…”

“Drafting your tweets…”

“Packing extra riz…” (optional humor)

This does not replace any existing loaders unless they conflict visually.

7. Add: Separate Playground Page

Add a new route:

/playground

Containing:

Shitpost generator

Ragebait generator

Meme hooks

This page must NOT affect the main generation flow.

No logic should be moved from /app to this page.

8. Modify: LLM Prompts

Replace ONLY the prompts used for:

Voice Analysis

Tweet Generation

Replace them with the following:

8.1 Replace → Voice Analysis Prompt
Analyze the following user text for writing style. For each dimension, return a score from 0–100.

Dimensions:
1. Professional ↔ Casual
2. Polished ↔ Chaotic
3. Calm ↔ Enraged
4. Optimistic ↔ Cynical
5. Insightful ↔ Entertaining
6. Clean ↔ Profane

Return ONLY JSON with numeric values for each dimension:

{
  "professional_casual": NUMBER,
  "polished_chaotic": NUMBER,
  "calm_enraged": NUMBER,
  "optimistic_cynical": NUMBER,
  "insightful_entertaining": NUMBER,
  "clean_profane": NUMBER
}

8.2 Replace → Tweet Generation Prompt
You are Tweetable, a tool that converts long-form notes into tweet-ready content in the user's voice.

You will receive:
1. Original user text
2. 6 slider values (0–100)
3. Output requirements:
   - 4 short tweets (<100 chars)
   - 4 long tweets (100–280 chars)
   - 2 threads (3–5 tweets each)

Using the slider values, adjust:
- vocabulary professionalism or casualness
- sentence polish vs chaos
- calmness vs intensity
- optimism vs cynicism
- insight density vs entertainment
- profanity level

Output JSON:

{
 "short_tweets": [...],
 "long_tweets": [...],
 "threads": [
   ["tweet1","tweet2","tweet3"],
   ["tweet1","tweet2","tweet3","tweet4"]
 ]
}


No other prompts should be modified.

9. Add: Privacy Badge

Add a small text badge at bottom of /app:

“We never store your notes. Files are processed in-memory and immediately discarded.”

This updates visual trust messaging only; does not affect backend storage logic unless necessary to enforce non-retention.

10. Non-Changes (Important for Codex)

Codex must leave the following AS-IS:

Auth flow

File upload logic (except new analysis step)

Existing branding

Existing homepage (until replaced in separate PRD)

Dark mode implementation

Database schema

Folder structure unless new pages are added

Any components not explicitly overridden

11. Acceptance Criteria (Delta Only)
Sliders

Six sliders appear after file upload

Values match voice analysis baseline

Sliders adjust regeneration prompt

Output Format

Exactly 4 short tweets

Exactly 4 long tweets

Exactly 2 threads

All constraints obeyed

Inline Editing

Each tweet editable

Copy + regenerate buttons functional

Prompt Changes

Old prompts no longer used

New prompts integrated

Playground

Accessible at /playground

Does NOT affect /app

12. End of Delta PRD

Everything not listed remains unchanged.
This delta is safe to apply incrementally without breaking core functionality.