# Takshara — Frontend ↔ Supabase Synchronization Checklist

## Step 1: Inventory & schema inspection
- [x] Inspect all `frontend/src/**` Supabase hooks (initial sample + most feature hooks read) to list used tables and referenced columns.
- [x] Inspect **all** `database/migrations/*.sql` (001..006) to collect the final schema for core tables.
- [ ] Produce a column-level diff report (frontend vs DB).


## Step 2: Fix schema mismatches (frontend + migrations)

- [ ] For each missing column in DB referenced by frontend: add a **proper Supabase migration**.
- [ ] For each camelCase/snake_case mismatch: update frontend mapping using correct column names or SQL aliases.
- [ ] Remove all unsafe casts like `as any`.
- [ ] Ensure inserts/updates/selects/deletes use identical column names.

## Step 3: Runtime safety + date handling
- [ ] Rewrite `frontend/src/lib/utils.ts` to remove forbidden `toLocaleDateString/toLocaleTimeString` usage.
- [ ] Add date validation and safe fallbacks (e.g. show "No due date").
- [ ] Audit all formatting call sites and ensure invalid/undefined/null values never crash.
- [ ] Remove forbidden string/array calls on possibly-undefined/null values.

## Step 4: React Error boundaries + premium error screen
- [ ] Implement a global React Error Boundary.
- [ ] Add React Router `errorElement` per route.
- [ ] Provide Retry + Go Home buttons.

## Step 5: Verification
- [ ] Run TypeScript checks (tsc).
- [ ] Run ESLint if configured.
- [ ] Run `vite build` and fix all remaining errors.
- [ ] Confirm zero schema mismatches and no runtime crashes.

