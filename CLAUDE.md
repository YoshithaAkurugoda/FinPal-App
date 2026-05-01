# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Root (run from repo root)
```bash
npm run dev:server        # Start Express API (port 3000)
npm run dev:workers       # Start BullMQ workers (required for SMS/statement parsing and notifications)
npm run dev:mobile        # Start Expo dev server

npm run build:server      # Compile TypeScript server to dist/
npm run lint              # Lint all workspaces
npm run typecheck         # Type-check all workspaces

npm run db:migrate        # Run Prisma migrations (cd server first for interactive)
npm run db:generate       # Regenerate Prisma client after schema changes
npm run db:seed           # Seed database

npm run infra:up          # Start local Postgres + Redis via Docker Compose
npm run infra:down        # Stop Docker services
```

### Server-only (from `server/`)
```bash
npx prisma migrate dev --name <name>    # Create + apply a new migration
npx prisma db push                      # Push schema without migration history
npx prisma studio                       # Open Prisma Studio
```

### Mobile-only
```bash
npm run android -w apps/mobile          # Launch on Android
npm run ios -w apps/mobile              # Launch on iOS
```

**Note:** The mobile dev script pins Node 20.18 via `npx -p node@20.18.0` because Expo SDK 52 breaks on Node 24+.

## Architecture

This is an npm workspaces monorepo with three packages:

- **`apps/mobile/`** — React Native + Expo SDK 52, Expo Router v4 (file-based routing under `app/`), Zustand for state, `axios` for HTTP
- **`packages/shared/`** — Shared TypeScript types, Zod schemas, and constants consumed by both mobile and server
- **`server/`** — Express API + BullMQ background workers, Prisma ORM, PostgreSQL (Supabase)

### Server request flow

All routes follow: `*.routes.ts` → `*.controller.ts` → `*.service.ts`

`authMiddleware` (in `src/middleware/auth.ts`) validates the JWT Bearer token and attaches `req.user = { userId, email }` for downstream use. The helper `getUserId(req)` extracts the userId or throws.

All API responses use `{ success: true, data: ... }` or `{ success: false, error: "..." }`. The mobile Axios client unwraps `{ success, data }` automatically in its response interceptor, so stores receive `data` directly.

Paginated list endpoints return `{ items, total, page, limit, hasMore }`.

### BullMQ workers

The API server and workers are **separate processes**. SMS paste and PDF uploads will appear stuck unless `dev:workers` is also running.

Active queues/workers (in `server/src/workers/`):
- **`sms-parse`** — Claude extracts transaction(s) from raw SMS text; creates `pending` transactions + sends push notification
- **`statement-parse`** — Claude extracts transactions from PDF text; creates `pending` transactions + push notification
- **`notification`** — Dispatches FCM push notifications via Firebase Admin

Stub workers (registered but no-op): `ai-insight`, `pattern-detection`, `memory-extraction`

### AI / Claude integration

The AI companion builds a three-layer system prompt in `server/src/modules/ai/ai.service.ts`:
1. **Static profile** — user name, currency, monthly income
2. **Rolling financial state** — last 30 days of approved transactions, wallet balances, budget statuses, active goals
3. **Companion memories** — persisted key/value facts from `companion_memory` table

Claude model used for chat: `claude-sonnet-4-20250514`

### Key design decisions

- **Balances are derived, never stored** — `computeWalletBalance()` in `ledger.service.ts` calculates `starting_balance + SUM(signed_amount) WHERE status = 'approved'`. Never update a stored balance column.
- **AI recommends, user approves** — All AI-parsed transactions start with `status: 'pending'` and require explicit user approval before affecting any balance or budget.
- **Transaction `signedAmount`** — Debits are stored as negative, credits as positive. `amount` stores the absolute value; `signedAmount` carries the sign.

### Environment

Server env vars live in **`server/.env`** (not `.env.local`). Copy from `.env.example` at the repo root:

```bash
cp .env.example server/.env
```

Required: `DATABASE_URL`, `DIRECT_URL` (both from Supabase Connect), `REDIS_URL` (Upstash `rediss://` URL), `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `ANTHROPIC_API_KEY`

Optional: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (for file storage), Firebase vars (FCM will log instead of send if absent)

Mobile API URL is set via `EXPO_PUBLIC_API_URL`. Android emulators typically reach the local API at `http://10.0.2.2:3000`.

### Database

Prisma schema is at `server/prisma/schema.prisma`. Key models: `User`, `Wallet`, `Transaction`, `Budget`, `Goal`, `CompanionMemory`, `AiCheckin`, `IngestionLog`, `Reconciliation`.

Supabase requires two connection strings:
- `DATABASE_URL` → Transaction pooler (port 6543, add `?pgbouncer=true`)
- `DIRECT_URL` → Session pooler or direct (port 5432) — used by `prisma migrate`
