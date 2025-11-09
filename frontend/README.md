# Tweetable Frontend

Next.js + TailwindCSS application for Tweetable.app. Ships a dark-mode default UI for uploading notes, selecting personas, and viewing generated drafts.

## Requirements

- Node.js 18+
- npm 9+ (or pnpm/yarn if you prefer)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the example environment and fill in secrets:
   ```bash
   cp .env.example .env.local
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) to view the app.

## Notes

- Supabase client configuration lives in `utils/useSupabase.ts`.
- Email auth is handled through Supabase magic links – use the "Sign in" button in the header and open the emailed link on the same device to create a session.
- Example persona + generation flow is mocked when the backend/OpenAI key isn't configured; once the backend is running, the app will call `/upload`, `/generate`, and `/drafts` directly.
- TailwindCSS is configured with `darkMode: 'class'` and the default theme colors in `tailwind.config.js`.
