# Rajshree — Coal Trading Dashboard

Internal desktop dashboard. Data via **Prisma**; login via **Supabase Auth**.

## Stack

- Next.js App Router + TypeScript + Server Actions
- Prisma → Supabase Postgres
- Supabase Auth only (shared team login)
- Tailwind CSS

## Setup

### 1. Env

Copy `.env.example` → `.env` and fill in:

1. `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Auth)
2. `DATABASE_URL` — Supabase → **Project Settings → Database → Connection string (URI)**

If you previously ran the old SQL migrations/triggers in this project, drop those tables first (Table Editor or SQL) so Prisma can create a clean schema. Prisma owns the schema now — **no SQL triggers**.

### 2. Database

```bash
npm install
npx prisma db push
npm run db:seed
```

### 3. Shared login

Supabase → Authentication → Users → Add user (one email/password for the team).

### 4. Run

```bash
npm run dev
```

## Where balances update

All multi-table logic lives in `src/lib/actions/dispatch.ts` inside `prisma.$transaction(...)`:

- `createDispatch` / `createOpenOrderDispatch`
- `updateDispatch` / `deleteDispatch`
- `completeOpenOrder`
- `confirmReceipt`

Each dispatch links a **sale order** (`poNumber`) to a **purchase order** (`purchasePoNumber`). Vessel and importer are taken from the purchase order. Balances update on the sale order, purchase order, and vessel.

Derived values (`balanceOrder`, `balanceQuantity`, `gst`, `diffInQuantity`) are computed in TypeScript (`src/lib/domain/computations.ts`), not stored as columns.

## Tests

```bash
npm test
```

Covers order status, balances, GST, and over-dispatch checks.
