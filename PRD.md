# 🧩 Product Requirements Document — Tweetable.app

**Purpose:**  
Define the MVP requirements, architecture, and implementation details for `Tweetable.app` — a desktop-first web application that transforms uploaded notes into tweet-ready content written in the user’s authentic voice.

---

## 1. Overview

- **Product Name:** Tweetable  
- **Domain:** tweetable.app  
- **Tagline:** “Make your thoughts tweetable.”  
- **Goal:** Help creators, builders, and educators turn their notes into concise, high-quality tweets and threads without losing their tone.  
- **Primary Platforms:** Desktop web (Next.js), minimal mobile web view.  
- **MVP Objective:** Enable authenticated users to upload notes, generate tweets/threads in a chosen persona, store and copy drafts, and operate under a freemium model.

---

## 2. Problem Statement

Creators accumulate valuable ideas in note-taking apps but struggle to publish consistently.  
Tweetable removes friction by automatically identifying tweet-worthy insights and formatting them for posting — in the creator’s own voice.

---

## 3. Core User Stories

1. **Upload or Paste Notes**  
   - Users upload `.txt` or `.md` files (≤50 KB) or paste text directly.  
   - System validates and parses content.

2. **Generate Tweets**  
   - Users generate tweet drafts from notes.  
   - Output includes:
     - 5 short tweets (< 100 chars)
     - 5 long tweets (< 280 chars)
     - 2 threads (2–6 tweets each)
   - Results respect user’s persona/tone.

3. **Persona Selection**  
   - Users pick a persona (“builder”, “educator”, “crypto”) or import their X bio.  
   - Persona influences tone and phrasing.

4. **Save & Copy Drafts**  
   - Users save generated drafts in their account.  
   - Copy to clipboard with one click.

5. **View Drafts on Mobile Web**  
   - Simplified list of saved drafts with copy buttons only.

6. **Authentication & Limits**  
   - Users sign up/sign in via Supabase Auth (email).  
   - Free plan limits: 3 uploads / month or ≈ 25 generations.  
   - Pro plan (Stripe): unlimited usage + storage.

---

## 4. Project Structure

tweetable-app/
│
├── frontend/ # Next.js + Tailwind webapp
│ ├── components/
│ ├── pages/
│ ├── styles/
│ └── utils/
│
├── backend/ # FastAPI backend + OpenAI integration
│ ├── app/
│ │ ├── main.py
│ │ ├── routes/
│ │ │ ├── auth.py
│ │ │ ├── generate.py
│ │ │ ├── drafts.py
│ │ │ └── persona.py
│ │ ├── db.py
│ │ ├── models.py
│ │ ├── schemas.py
│ │ ├── services/
│ │ │ └── openai_service.py
│ │ └── utils/
│ │ └── limiter.py
│ ├── tests/
│ ├── requirements.txt
│ └── README.md
│
├── shared/
│ └── types/
│
└── PRD.md

markdown
Copy code

---

## 5. Frontend Specification

### Framework
- Next.js (React 18+)
- TailwindCSS (dark mode enabled)
- TypeScript optional
- Hosted on Vercel

### Key Pages
| Route | Purpose |
|--------|----------|
| `/` | Landing page with hero + CTA (“Make your thoughts tweetable.”) |
| `/app` | Dashboard for uploads, persona select, and generation |
| `/login` | Supabase Auth login/signup |
| `/drafts` | Mobile-friendly draft list |

### Core Components
| Component | Function |
|------------|-----------|
| `UploadZone.tsx` | Drag-and-drop / paste area for `.txt` or `.md` |
| `PersonaSelector.tsx` | Persona dropdown + optional import from X bio |
| `GenerateButton.tsx` | Triggers backend generation |
| `ResultsDisplay.tsx` | Displays grouped tweets (`short`, `long`, `threads`) |
| `DraftCard.tsx` | Shows tweet with Copy + Save buttons |
| `Header.tsx`, `Footer.tsx` | Navigation + branding |
| `AuthModal.tsx` | Supabase auth modal |

### API Integration
Frontend uses Axios or Fetch to call backend endpoints:

POST /api/upload
POST /api/generate
GET /api/drafts
POST /api/drafts
GET/POST /api/persona

bash
Copy code

### Behavior
- Enforce usage limits via backend responses.  
- Persist Supabase session JWT.  
- Use React Query or SWR for data fetching.  
- Handle network errors gracefully with toast alerts.

---

## 6. Backend Specification

### Stack
- FastAPI
- uvicorn
- supabase-py
- httpx (async)
- python-dotenv
- openai
- pydantic
- slowapi (rate-limiting)

### Endpoints

| Endpoint | Method | Description |
|-----------|---------|-------------|
| `/upload` | POST | Accepts file/text, validates ≤ 50 KB, stores in DB |
| `/generate` | POST | Sends text + persona → OpenAI API → returns JSON |
| `/drafts` | GET/POST | Retrieve or save drafts |
| `/persona` | GET/POST | Retrieve or update persona JSON |
| `/auth/*` | Supabase middleware handles JWT |

### AI Prompt Template

```python
PROMPT_TEMPLATE = """
You are an assistant that converts user notes into tweetable insights.

Persona: {persona}
Input Text: {text}

Output JSON:
{
 "short_tweets": ["..."],
 "long_tweets": ["..."],
 "threads": [["...", "..."], ["...", "..."]]
}

Rules:
- Keep persona tone consistent.
- Each tweet stands alone.
- Threads flow logically.
"""
Data Flow
Upload note → /upload → store file_id.

Generate → /generate → OpenAI → JSON response.

Display → user saves drafts → /drafts.

Drafts synced to Supabase → visible on mobile /drafts.