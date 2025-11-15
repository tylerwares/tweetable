📄 PRODUCT REQUIREMENTS DOCUMENT (PRD)
Project: Tweetable — Multi-Stage Voice-Aware Tweet Generation Pipeline

Version: 1.0
Owner: Tyler (Tweetable)
Purpose: Provide Codex with all requirements needed to upgrade Tweetable to a multi-call pipeline that extracts user voice, mines insights from raw notes, and generates high-quality tweets that preserve the user’s personality.

1. PRODUCT OVERVIEW
1.1 Summary

Tweetable is an AI-powered content engine that transforms a user’s raw notes into viral, authentic tweets. To improve quality, consistency, and personalization, Tweetable will transition from a single large prompt → to a multi-stage LLM pipeline.

This PRD defines the required pipeline, the prompts, the input/output schemas, and integration details.

2. GOALS & SUCCESS CRITERIA
2.1 Primary Goals

Deeply understand the user’s authentic writing voice.

Extract tweet-worthy ideas from messy notes.

Mine the “hidden angles” and deeper insights the user didn’t explicitly write.

Generate tweets and threads that sound 100% like the user.

Provide modularity: regenerate voice, ideas, insights, or tweets independently.

Create predictable, deterministic structure for Codex to implement.

2.2 Success Criteria

Tweet outputs consistently match the user’s tone, style, and emotional cadence.

Users report that “Tweetable sounds more like me than I do.”

Regeneration at any stage produces stable, high-quality results.

Clear JSON structures allow seamless UI/UX integration.

3. SYSTEM ARCHITECTURE
3.1 Pipeline Flow (5 Core LLM Calls)
[ CALL 1 ]
Raw User Text → Stage 1 Prompt → VoiceProfile JSON

[ CALL 2 ]
Raw Text + VoiceProfile → Stage 2 Prompt → IdeaList JSON

[ CALL 3 ]
Ideas + VoiceProfile → Stage 3 Prompt → InsightAngles JSON

[ CALL 4 ]
InsightAngles + VoiceProfile → Stage 4 Prompt → TweetOutput JSON

[ CALL 5 ]
InsightAngles + VoiceProfile → Stage 5 Prompt → Shitpost JSON (optional)

3.2 Optional Additional Calls

Variant generation (funny/mean/viral rewrite)

Thread-only generation

Polishing user-selected drafts

4. DATA STRUCTURES (JSON SCHEMAS)
4.1 Stage 1 Output — Voice Profile
{
  "voice_profile": "string",
  "stylistic_quirks": ["string"],
  "persona": "string"
}

4.2 Stage 2 Output — Ideas List
{
  "ideas": [
    {
      "title": "string",
      "summary": "string",
      "virality": 1,
      "relatability": 1,
      "emotional_punch": 1
    }
  ]
}

4.3 Stage 3 Output — Insight Angles
{
  "angles": [
    {
      "idea_title": "string",
      "angle": "string"
    }
  ]
}

4.4 Stage 4 Output — Tweets + Threads
{
  "short_tweet": "string",
  "tweets": [
    "string",
    "string"
  ],
  "threads": [
    ["string", "string", "string"],
    ["string", "string", "string"]
  ]
}

4.5 Stage 5 Output — Shitpost
{
  "shitpost": "string"
}

5. LLM PROMPTS FOR EACH STAGE

Codex should embed these into the backend as system prompts or templates.

5.1 CALL 1 — STAGE 1: Voice Extraction Prompt

Purpose: Analyze raw text → produce the user’s writing voice.

You are Tweetable Stage 1: Voice & Persona Extractor.

Analyze the user's raw input text and extract:

1. VOICE_PROFILE — describe their tone (snarky, blunt, hopeful, sarcastic, introspective, degen, etc.)
2. STYLISTIC_QUIRKS — list 5–10 patterns such as:
   - favorite phrases
   - humor style
   - intensity of emotion
   - sentence rhythm
   - level of swearing
3. PERSONA — a 1–2 sentence snapshot describing who this person sounds like and how they present themselves.

Return a JSON object matching this schema:
{
  "voice_profile": "string",
  "stylistic_quirks": ["string"],
  "persona": "string"
}

5.2 CALL 2 — STAGE 2: Idea Extraction Prompt

Purpose: Extract tweet-worthy ideas.

You are Tweetable Stage 2: Idea Extractor.

Input includes:
- Raw user text
- Voice profile JSON from Stage 1

Generate 3–7 tweetable ideas.

For each idea:
- Create a short title
- Summarize in 1 tweet-ready sentence
- Score on a scale of 1–10:
  - virality
  - relatability
  - emotional_punch

Return JSON:
{
  "ideas": [
    {
      "title": "string",
      "summary": "string",
      "virality": 1,
      "relatability": 1,
      "emotional_punch": 1
    }
  ]
}

5.3 CALL 3 — STAGE 3: Insight & Angle Mining Prompt

Purpose: Transform raw ideas → deeper meaning.

You are Tweetable Stage 3: Insight Miner.

Most users write about their day without realizing the deeper lessons or relatable angles. Your job is to uncover the hidden insights.

Input:
- ideas (JSON)
- voice profile

For each idea, answer:
- What is the deeper lesson?
- What tension or contradiction is revealed?
- What is the relatable angle?
- What story or emotion is implied?

Output 3–5 high-leverage angles.

Return JSON:
{
  "angles": [
    {
      "idea_title": "string",
      "angle": "string"
    }
  ]
}

5.4 CALL 4 — STAGE 4: Tweet Generation Prompt

Purpose: Produce the final tweets and threads.

You are Tweetable Stage 4: Tweet Generator.

Input:
- voice_profile
- stylistic_quirks
- persona
- insight angles

Using the user's authentic voice, generate:

1. short_tweet (<100 chars)
2. Two tweets (<280 chars)
3. Two threads (each 3–5 tweets)

Rules:
- Must sound human
- Must sound like the user
- No corporate language
- No generic self-help
- No fluff
- Use their quirks and voice patterns
- Build each tweet around one of the insight angles

Return JSON:
{
  "short_tweet": "string",
  "tweets": ["string","string"],
  "threads": [
    ["string","string","string"],
    ["string","string","string"]
  ]
}

5.5 CALL 5 — STAGE 5: Shitpost Distillation Prompt

Purpose: Create one unhinged, raw, funny, petty tweet.

You are Tweetable Stage 5: Shitpost Distiller.

Find the rawest, pettiest, funniest, or most annoyed part of the user’s original writing or angles.

Produce one tweet (<160 chars) that is:
- mean but relatable
- chaotic but authentic
- emotional but human
- clearly in their voice

Return JSON:
{
  "shitpost": "string"
}

6. ENGINEERING REQUIREMENTS
6.1 Backend

Each stage is its own endpoint or function.

Stage outputs should be stored per-session in Supabase:

voice_profiles

idea_extractions

insight_angles

tweet_generations

shitposts

Add retry logic for LLM calls.

Add caching for voice profile (can reuse across runs).

6.2 Frontend

User pastes raw notes.

System runs Stage 1–5 automatically OR manually step-by-step (user choice).

Allow user to edit:

Voice profile

Ideas list

Insight angles

Final tweets

Buttons:

“Regenerate Ideas”

“Regenerate Angles”

“Regenerate Tweets”

“Generate Shitpost”

6.3 Optional Enhancements

Toggle for “spicy mode”

“Make it meaner / funnier / more viral”

Pre-built voice presets (e.g., Naval, MrBeast, Alex Hormozi, a degen trader)

7. EDGE CASES & HANDLING
7.1 User submits extremely short text

→ Generate minimal voice profile + fewer ideas.

7.2 User has no clear style

→ Identify “neutral but leaning toward X” voice.

7.3 User wants a different voice

→ Allow manual override of Stage 1.

7.4 User only wants a certain output

→ Skip unused stages.

7.5 Profanity & intensity

→ Match user intensity; never escalate beyond what they imply.