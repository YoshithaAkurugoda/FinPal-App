# FinPal — Intelligent Personal Finance Companion

A mobile-first AI-powered personal finance management application for users in Sri Lanka where open banking APIs are unavailable. FinPal automates transaction capture through SMS text parsing and PDF statement uploads, provides intelligent budget tracking and savings goal management, and delivers an AI financial companion that analyses spending behaviour and delivers personalised insights.

## Architecture

```
Mobile Client (React Native + Expo)
        ↕ HTTPS/REST + JWT
Backend API (Express + Prisma + PostgreSQL)
        ↕
┌───────────────────────────────────┐
│  BullMQ Workers (Redis)           │
│  • SMS Parser → Claude AI         │
│  • Statement Parser → Claude AI   │
│  • AI Insight Generator           │
│  • Pattern Detection              │
│  • Notification Dispatch (FCM)    │
│  • Memory Extraction              │
└───────────────────────────────────┘
```

## Project Structure

```
finpal/
├── apps/mobile/          # React Native + Expo (managed workflow)
│   ├── app/              # Expo Router file-based routes
│   ├── components/       # Reusable UI components
│   ├── stores/           # Zustand state management
│   └── lib/              # API client, offline queue
├── packages/shared/      # Shared types, Zod schemas, constants
├── server/               # Express API + BullMQ workers
│   ├── src/
│   │   ├── modules/      # Auth, Wallets, Transactions, Budgets, Goals, AI, Ingestion, Reconciliation, Reports, Users
│   │   ├── services/     # Ledger engine, Budget engine, Notification service
│   │   ├── workers/      # Background job processors
│   │   ├── middleware/    # JWT auth, Zod validation, rate limiting
│   │   └── config/       # Environment, Redis, BullMQ queues
│   └── prisma/           # Schema + migrations
└── .github/workflows/    # CI/CD
```

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native + Expo SDK 52, Expo Router, Zustand |
| Backend | Node.js 20, Express, TypeScript |
| Database | PostgreSQL (Supabase), Prisma ORM |
| Cache/Queue | Redis (Upstash), BullMQ |
| AI | Anthropic Claude API |
| Notifications | Firebase Cloud Messaging |
| File Storage | Supabase Storage |

## Sprint 3 (statement ingestion) — done

- **PDF upload**: `POST /ingestion/statement` (multipart `file` + `walletId`) extracts text with `pdf-parse`, queues **`statement-parse`** job.
- **Worker**: Claude extracts **multiple** pending transactions (`source: statement`); push notification when complete (or on failure / empty extract).
- **Mobile**: Statement screen uploads PDF via `FormData` + JWT; shows queued confirmation.

## Sprint 2 (core loop) — done

- **API contract**: Mobile client unwraps `{ success, data }` responses; list endpoints return `{ items, total, page, limit, hasMore }`.
- **Auth refresh** returns `user` + nested `tokens` (same shape as login/register).
- **Budget alerts**: At **80%** and **90%** of category spend, `sendNotification` enqueues FCM (or logs if Firebase is not configured).
- **Workers**: `sms-parse` runs Claude extraction and creates **pending** transactions + push; `notification` sends via **Firebase Admin** when env vars are set.
- **Push**: App registers **device push token** (`getDevicePushTokenAsync`), sends it to `PUT /users/fcm-token`, handles notification taps (pending / budgets / SMS screen).
- **Routing**: `app/index.tsx` redirects to login or home from auth state.

Run API and **workers** together so pasted SMS jobs are processed:

```bash
npm run dev:server
npm run dev:workers
```

## Getting Started

### Prerequisites

- Node.js 20+
- [Supabase](https://supabase.com) project (PostgreSQL)
- [Upstash](https://upstash.com) Redis (TLS URL for `REDIS_URL`)
- Expo Go (or simulator) for the mobile app

### Setup (intended: Supabase + Upstash)

**Prisma** is already installed under `server/` (`prisma` + `@prisma/client`); `server/prisma/schema.prisma` is configured with `DATABASE_URL` and `DIRECT_URL`. Do **not** run `npx prisma init` again. Put env vars in **`server/.env`** (not `.env.local` — that name is for other frameworks; Prisma reads `server/.env` when you run commands from `server/`).

1. **Supabase** — In the dashboard, open **Connect** and copy:
   - **Transaction pooler** (port `6543`) → `DATABASE_URL`. Ensure the query string includes `pgbouncer=true` if the dashboard does not add it.
   - **Session pooler** or direct connection (port `5432`) → `DIRECT_URL`.

   Prisma needs both URLs; see the [Supabase Prisma guide](https://supabase.com/docs/guides/database/prisma) (recommended: create a dedicated `prisma` database user via the SQL in that doc, or use the default `postgres` user from the dashboard for early development).

2. **Upstash** — Create a Redis database and copy the **`rediss://`** URL into `REDIS_URL`.

3. **Env file**

```bash
npm install --workspaces
cp .env.example server/.env
# Edit server/.env: DATABASE_URL, DIRECT_URL, REDIS_URL, JWT_*, ANTHROPIC_API_KEY, optional Supabase Storage + Firebase
```

4. **Database schema**

```bash
cd server && npx prisma generate && npx prisma db push
# or: npx prisma migrate dev --name init
```

5. **Run (from repo root)**

```bash
npm run dev:server    # Terminal 1: API
npm run dev:workers   # Terminal 2: BullMQ workers (required for SMS jobs, notifications)
npm run dev:mobile    # Terminal 3: Expo
```

Point the mobile app at your API (e.g. `EXPO_PUBLIC_API_URL` / LAN IP; Android emulator often uses `http://10.0.2.2:3000`).

**Node version:** The API runs on Node 20+. Expo’s dev server (`npm run dev:mobile`) invokes **Node 20.18** via `npx` so it works when your system Node is **24+** (which breaks Expo otherwise). For a global fix, install Node 20 LTS and use `.nvmrc`.

### Optional: local Postgres + Redis (Docker)

If you prefer not to use cloud databases for a machine-local sandbox, use Docker Desktop and `docker-compose.yml`, then set `DATABASE_URL` / `DIRECT_URL` to `localhost:5433` and `REDIS_URL` to `redis://localhost:6379` (see comments in `docker-compose.yml`). Scripts: `npm run infra:up` / `infra:down`.

### Optional: Supabase Agent Skills (Cursor / other agents)

```bash
npx skills add supabase/agent-skills -y
```

Installs Postgres best-practices skills under `.agents/skills` (gitignored).

### Troubleshooting

- **Prisma `P1000` (authentication failed)** — The database password in `DATABASE_URL` / `DIRECT_URL` does not match Supabase. Open **Project Settings → Database**, use **Reset database password** if needed, then paste fresh **Transaction** and **Session** pooler URIs from **Connect** into `server/.env`. If your password contains `@`, `#`, or `%`, [URL-encode](https://developer.mozilla.org/en-US/docs/Glossary/Percent-encoding) it in both strings.
- **Prisma other connection errors** — Double-check `DATABASE_URL` and `DIRECT_URL` against the Supabase Connect panel; pooler host (`aws-0-*` vs `aws-1-*`) must match your project.
- **Redis** — Workers require a reachable `REDIS_URL` (Upstash `rediss://` or local Redis).

## Key Design Decisions

- **Balances are derived, never stored** — Wallet balance = `starting_balance + SUM(signed_amount) WHERE status = 'approved'`
- **AI recommends, user approves** — Every AI-parsed transaction requires explicit user approval before affecting any balance
- **SMS paste instead of WhatsApp** — Users copy bank SMS and paste directly in the app, eliminating third-party messaging dependencies
- **Three context layers for AI** — Static profile + rolling financial state + companion memory = personalised, grounded responses

## Team

- Akindu Abeysekara — AI Integration Developer
- Elisha De Saram — Frontend Developer
- Sethul Perera — Backend Developer
- Abdul Salam — Database Engineer
- Yoshitha Akurugoda — Project Coordinator

## Status

Under development — CSG3101 Applied Project, BSc Computer Science.
