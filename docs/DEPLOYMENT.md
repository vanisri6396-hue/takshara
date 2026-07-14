# Takshara — Deployment Guide

## Environment

- Frontend: Vite + React + TypeScript
- Hosting: Vercel / Netlify / any static host
- Backend: Supabase

## Prerequisites

- Supabase project created
- Database migrations applied
- `.env` configured with real values

## Supabase Setup

1. Open **Supabase Dashboard → Project Settings → API**
2. Copy:
   - **Project URL**
   - **anon** public key
3. Paste both values into `frontend/.env`

## Database Migrations

Run the migrations in **Supabase Dashboard → SQL Editor** (New query → paste → Run), in order.
A single consolidated file is provided for convenience:

- **`database/apply_all_migrations.sql`** — applies all migrations 001→006 in one run (idempotent, safe to re-run).

Or run them individually, in this exact order:

- `database/migrations/001_schema.sql` (profiles, subjects, schedules, notes, assignments, attendance, study_goals, user_settings + RLS + triggers)
- `database/migrations/002_storage.sql` (avatars storage bucket + policies)
- `database/migrations/003_features.sql` (exams, projects, notifications, activity_log)
- `database/migrations/004_timetable_extended.sql` (schedules: faculty_name, class_type, notes, subject_color)
- `database/migrations/005_assignments_extended.sql` (assignments: priority, estimated_study_time, attachment_link)
- `database/migrations/006_notifications_extended.sql` (notifications: priority + updated type categories)

> **IMPORTANT:** All six migrations must be applied. If any table is missing, the frontend
> receives `404` errors from `/rest/v1/<table>` (PostgREST "relation does not exist").
> Running `database/apply_all_migrations.sql` once resolves this.

## Auth Configuration

In **Supabase Dashboard → Authentication → Settings**:

1. **Site URL**: set to your production domain
2. **Redirect URLs**: add permitted callback URLs
3. If testing locally: allow `http://localhost:5173`

If 400 auth errors persist, check:
- Email confirmation toggle
- Password minimum length
- Allowed email domains

## Build

```bash
cd frontend
npm install
npm run build
```

## Deploy

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=frontend/dist
```

## Post-Deploy

- Verify auth flows with real Supabase credentials
- Verify CRUD flows for all modules
- Enable custom domain + SSL
- Enable notifications/analytics as needed