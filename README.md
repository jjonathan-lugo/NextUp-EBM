# NextUp

NextUp is a productivity web app for students that fights decision fatigue.
A normal to-do list makes you re-decide "what should I work on right now"
every single time you open it — NextUp does that deciding for you, scoring
and ranking tasks so you always know exactly what to start next.

## Features

- **Focus Timer + Task Weighting** (`/focus`) — score a task by effort and
  priority when you add it (combined into a single weight), then work
  through it with a classic Pomodoro rhythm or Adaptive mode, which tracks
  how long you've been on a task and nudges you once you hit diminishing
  returns. The timer is shown as a circular clock face with a sweeping
  progress ring.
- **Smart Start** (`/smart-start`) — looks at what's due, overdue, and
  weighted heaviest, and tells you the one task that needs your attention
  first, plus a second list for anything with no deadline. Includes a
  scrollable Productivity Tips card (click the card for another tip) and a
  full scrollable list of all your tasks.
- **Phone Tracker** (`/phone-tracker`) — log how much time you spend on your
  phone each day and see it plotted against how many tasks you actually
  finished that day, so you can see the correlation between phone usage and
  productivity build up as you log more entries.
- **Focus Queue** (homepage) — the top few tasks NextUp has already picked
  for you, ranked by urgency and weight, paged with left/right arrows
  instead of one long list.

All data is scoped per signed-in user — sign in with Google to use any of
the above.

## Tech stack

- **Next.js** (Pages Router) — frontend pages in `pages/`, API routes in
  `pages/api/`
- **Supabase** — Postgres database, Google OAuth, and Row Level Security
  (every table is scoped to `auth.uid()`, enforced by Postgres itself, not
  just app code)
- **Jest** — unit tests across `data/`, `data/models/`, and component/API
  logic

## Getting started

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Environment variables

Create a `.env.local` with your Supabase project's values:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

If you're deploying (Vercel, Render, etc.), set these in that platform's own
project settings too — `.env.local` only covers local dev, it isn't shared
across platforms. You'll also need to add your deployed URL(s) to
Supabase's Authentication → URL Configuration → Redirect URLs, or Google
sign-in will fail once you deploy.

### Database setup

Run the SQL in `migrations/` (via the Supabase SQL Editor, in order) to set
up the `tasks` and `phone_time_entries` tables with the `user_id` + Row
Level Security policies the app expects.

To seed sample data locally once your `.env.local` is set up:

```bash
node scripts/seedRandomTasks.mjs
node scripts/seedPhoneTimeEntries.mjs
```

## Testing

```bash
npm test
```

## Project structure

```
pages/            routes + API endpoints (pages/api/)
components/       feature UI, grouped by feature folder
hooks/            shared React hooks (auth, timers, task management, etc.)
data/             Supabase clients, models, and pure business logic
styles/           CSS Modules, one per page/feature
scripts/          one-off Node scripts (env loading, data seeding)
migrations/       SQL run manually in the Supabase SQL Editor
```

## Team

Built by a 3-person team, split by feature:

- **Focus Timer + Task Weighting** — Jonathan
- **Smart Start + Productivity Tips** — Grace
- **Phone Tracker** — Malika
