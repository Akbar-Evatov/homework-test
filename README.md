# Matematika testlari — Math Test Sharing App

A single-teacher app for creating multiple-choice math tests, assigning them to classes,
and sharing one link per test that students open, enter their student ID, and take.

Stack: Next.js 16 (App Router) + Prisma 6 + PostgreSQL (Neon) + Tailwind CSS, deployed on Vercel.

## 1. Local setup

### Install dependencies

```bash
npm install
```

### Create a Neon Postgres database

1. Go to [neon.tech](https://neon.tech) and create a free project.
2. In the Neon dashboard, open **Connection Details** and copy two connection strings:
   - **Pooled connection** (uses PgBouncer, has `-pooler` in the hostname) → this is `DATABASE_URL`.
   - **Direct connection** (no `-pooler`) → this is `DIRECT_URL`. Prisma needs the direct
     connection to run migrations; the app itself uses the pooled one at runtime.

### Configure environment variables

Copy `.env.example` to `.env` and fill in the real values:

```bash
cp .env.example .env
```

- `DATABASE_URL` / `DIRECT_URL` — from Neon, as above.
- `TEACHER_PASSWORD` — the password you'll use to log in to the dashboard.
- `SESSION_SECRET` — a random string used to sign the login session cookie.
  Generate one with `openssl rand -base64 32` (or any random 32+ character string).

### Run the initial migration

```bash
npx prisma migrate dev --name init
```

This creates the tables (`Class`, `Student`, `Test`, `Question`, `Choice`,
`TestAssignment`, `Attempt`) in your Neon database.

### Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/dashboard`, which
redirects to `/login` since you're not signed in yet. Log in with `TEACHER_PASSWORD`.

## 2. Using the app

**Teacher** (`/dashboard`, password-protected):
1. Create a class, then add students by name — each gets an auto-generated ID like `A001`
   that you share with them (this ID is their only credential, no password needed).
2. Create a test: add questions, add choices per question, mark the correct one, reorder
   with the ↑/↓ buttons.
3. On the test's page, check the classes it should be assigned to, and copy the shareable
   link (`/test/<testId>`) to send to students (e.g. via Telegram).
4. View results per test (score table + per-question % correct) or per class (roster with
   tests taken/pending and average score).

**Student** (`/test/<testId>`, no login):
1. Opens the link, enters their student ID.
2. If they already submitted, they see their score and can't retake it.
3. Otherwise they answer the questions and submit; the score is graded server-side and
   shown immediately.

## 3. Deploying to Vercel

1. Push this project to a Git repository and import it in [Vercel](https://vercel.com/new).
2. In the Vercel project's **Environment Variables**, add `DATABASE_URL`, `DIRECT_URL`,
   `TEACHER_PASSWORD`, and `SESSION_SECRET` (same values as your local `.env`, or a
   different `TEACHER_PASSWORD`/`SESSION_SECRET` for production if you prefer).
3. Deploy. `npm install` runs `prisma generate` automatically via the `postinstall` script,
   so the Prisma Client is always in sync with `prisma/schema.prisma`.
4. Migrations are **not** run automatically on deploy. After the first deploy (and after
   any future schema change), run from your machine with the production env vars loaded:
   ```bash
   npx prisma migrate deploy
   ```
   (Point `DATABASE_URL`/`DIRECT_URL` at the same Neon database Vercel uses — for a single
   Neon project this is usually the same `.env` values, or pull them with `vercel env pull`.)

## Project structure notes

- `proxy.ts` — Next.js 16 renamed `middleware.ts` to `proxy.ts`; it protects `/dashboard/**`
  behind the teacher session cookie.
- `lib/i18n/` — all UI text lives in `lib/i18n/uz.ts` behind a `t("namespace.key")` helper.
  Uzbek is the only shipped locale, but adding `en.ts`/`ru.ts` with the same key shape plus
  a locale switch in `lib/i18n/index.ts` is enough to add languages later.
- Grading always happens server-side (`lib/grading.ts`) — correct answers are never sent to
  the browser before a student submits.
- `Test.showScoreImmediately` defaults to `true`. The student result screen already reads
  through this flag's intent (scores shown right after submit); flipping it to a real
  teacher-facing toggle later doesn't require a schema change.
