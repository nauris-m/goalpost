# Goalpost

A team goal-tracking tool: create teams, add members, set periods, track goal and OKR progress, and see it
all rolled up in a manager overview.

Built with [Next.js](https://nextjs.org) (App Router), [shadcn/ui](https://ui.shadcn.com) on Tailwind CSS v4, and
[Supabase](https://supabase.com) (Postgres + Auth) with row-level security.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app requires `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` (see `.env.example`) pointing at a Supabase project with this
app's schema (tables, RLS policies, RPCs) already applied - ask the project owner for the migration SQL, kept
out of this repo since it documents the database's internal structure.

## Testing

```bash
npm test
```

Vitest covers the framework-agnostic domain logic in `lib/domain/` (goal/OKR completion and status derivation,
period generation).

## Building

```bash
npm run build
```

## Project structure

- `app/` — Next.js App Router routes: `(auth)` for sign-in/sign-up, `(app)` for the authenticated shell
  (Overview, Teams, OKRs, My Goals, Notifications, Settings).
- `lib/domain/` — pure, framework-agnostic domain logic (goal/OKR completion, status, period generation).
- `lib/supabase/` — browser/server/proxy Supabase clients (`@supabase/ssr`).
- `lib/mappers/` — snake_case ↔ camelCase translation between Supabase rows and the domain model (`lib/types/domain.ts`).
- `lib/queries/` — TanStack Query hooks wrapping Supabase reads/mutations.
- `components/ui/` — shadcn/ui primitives.
- `components/app-shell/` — sidebar/topbar/footer layout chrome.
- `components/charts/` — ApexCharts wrappers (bar/donut/radial).
