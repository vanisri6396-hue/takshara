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

Run these migrations in **Supabase Dashboard → SQL Editor**:

- `database/migrations/001_schema.sql`
- `database/migrations/002_storage.sql`

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