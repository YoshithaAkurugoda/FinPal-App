# FinPal — Full Technical Specification

> Last updated: 2026-05-13

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Overview](#2-architecture-overview)
3. [Monorepo Structure](#3-monorepo-structure)
4. [Shared Package](#4-shared-package)
5. [Server Application](#5-server-application)
   - 5.1 [Environment & Configuration](#51-environment--configuration)
   - 5.2 [Database Schema (Prisma)](#52-database-schema-prisma)
   - 5.3 [API Modules](#53-api-modules)
   - 5.4 [Middleware](#54-middleware)
   - 5.5 [Shared Services](#55-shared-services)
   - 5.6 [BullMQ Workers](#56-bullmq-workers)
   - 5.7 [AI Provider Abstraction](#57-ai-provider-abstraction)
6. [Mobile Application](#6-mobile-application)
   - 6.1 [Navigation Structure](#61-navigation-structure)
   - 6.2 [Screens](#62-screens)
   - 6.3 [Zustand Stores](#63-zustand-stores)
   - 6.4 [API Client](#64-api-client)
   - 6.5 [Utilities & Libraries](#65-utilities--libraries)
7. [Key Design Decisions](#7-key-design-decisions)
8. [Data Flow Examples](#8-data-flow-examples)
9. [External Integrations](#9-external-integrations)
10. [Security Architecture](#10-security-architecture)
11. [API Endpoint Reference](#11-api-endpoint-reference)
12. [Deployment & Infrastructure](#12-deployment--infrastructure)

---

## 1. Project Overview

**FinPal** is an intelligent personal finance companion mobile application designed for Sri Lankan users where open banking APIs are unavailable. It automates transaction capture via SMS parsing and PDF statement uploads, provides budget tracking and savings goal management, and delivers an AI financial companion that analyzes spending and delivers personalized insights.

| Concern | Technology |
|---|---|
| Mobile client | React Native + Expo SDK 52 (TypeScript) |
| State management | Zustand |
| Navigation | Expo Router v4 (file-based) |
| HTTP client | Axios |
| Backend API | Express.js (Node 20+, TypeScript) |
| ORM | Prisma |
| Database | PostgreSQL via Supabase |
| Job queue / cache | Redis via Upstash + BullMQ |
| AI | Anthropic Claude (primary), Google Gemini, NVIDIA Llama (fallback) |
| Push notifications | Firebase Cloud Messaging |
| File storage | Supabase Storage |

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│  Mobile Client (React Native + Expo)                │
│  Zustand stores → Axios (JWT Bearer)                │
└───────────────────────┬─────────────────────────────┘
                        │ HTTPS / REST
┌───────────────────────▼─────────────────────────────┐
│  Express API Server (port 3000)                     │
│  Auth → Validate → Controller → Service → Prisma    │
└────┬──────────────────────────────────────┬──────────┘
     │ BullMQ enqueue                       │ Prisma
┌────▼──────────────────┐         ┌─────────▼──────────┐
│  Upstash Redis        │         │  Supabase Postgres  │
│  (queues + cache)     │         │  (primary DB)       │
└────┬──────────────────┘         └────────────────────┘
     │ dequeue
┌────▼──────────────────────────────────────────────────┐
│  Worker Process (separate Node.js process)            │
│  • sms-parse          • ai-insight                    │
│  • statement-parse    • pattern-detection             │
│  • notification       • memory-extraction             │
│  • budget-rollover    • reconciliation-reminder       │
└───────────────────────────────────────────────────────┘
```

The API server and the worker process are **two separate Node processes** that share the same database and Redis instance. SMS paste and PDF uploads are processed asynchronously — the mobile client receives a queued acknowledgement immediately and a push notification when processing completes.

---

## 3. Monorepo Structure

The repository is an npm workspaces monorepo.

```
FinPal/
├── package.json               # Root: workspaces ["packages/*", "server", "apps/*"]
├── docker-compose.yml         # Local Postgres (5433) + Redis (6379)
├── .env.example               # Template for server/.env
├── tsconfig.json              # Base TypeScript config
├── .eslintrc.json
├── .nvmrc                     # Node 20.x
├── packages/
│   └── shared/                # Shared types, schemas, constants
├── server/                    # Express API + workers
└── apps/
    └── mobile/                # React Native + Expo
```

**Root scripts (run from repo root):**

| Script | Purpose |
|---|---|
| `npm run dev:server` | Start Express API on port 3000 |
| `npm run dev:workers` | Start BullMQ worker process |
| `npm run dev:mobile` | Start Expo dev server |
| `npm run build:server` | Compile TypeScript to `dist/` |
| `npm run lint` | Lint all workspaces |
| `npm run typecheck` | Type-check all workspaces |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:seed` | Seed database |
| `npm run infra:up` | Start Docker services |
| `npm run infra:down` | Stop Docker services |

---

## 4. Shared Package

**Location:** `packages/shared/src/`

Consumed by both `server` and `apps/mobile` via the `@finpal/shared` workspace alias.

### 4.1 Types (`src/types/index.ts`)

| Interface | Key Fields |
|---|---|
| `User` | `id`, `email`, `name`, `monthlyIncome`, `currency`, `fcmToken`, `notificationPrefs` |
| `Wallet` | `id`, `userId`, `name`, `type` (bank/cash/ewallet), `startingBalance`, `createdAt` |
| `WalletWithBalance` | `Wallet` + `currentBalance` (computed) |
| `Transaction` | `id`, `walletId`, `userId`, `amount`, `signedAmount`, `type`, `merchant`, `category`, `status`, `source`, `aiConfidence`, `metadata`, `transactionDate` |
| `Budget` | `id`, `userId`, `category`, `amountLimit`, `period`, `rollover` |
| `BudgetWithStatus` | `Budget` + `spent`, `remaining`, `percentage` |
| `Goal` | `id`, `userId`, `name`, `targetAmount`, `currentAmount`, `targetDate`, `projectedCompletionDate`, `status` |
| `GoalWithProjection` | `Goal` + `projectedDate`, `weeklyTarget` |
| `CompanionMemory` | `id`, `userId`, `type`, `key`, `value`, `confidence`, `lastSeen` |
| `AiCheckin` | `id`, `userId`, `type`, `content`, `readAt`, `createdAt` |
| `IngestionLog` | `id`, `userId`, `sourceType`, `rawPayload`, `status`, `errorMessage`, `createdAt` |
| `Reconciliation` | `id`, `userId`, `walletId`, `statedBalance`, `computedBalance`, `discrepancy`, `reconciledAt` |
| `ChatMessage` | `role` (user/assistant), `content` |
| Report types | `CategorySpend`, `MonthlyReport`, `MerchantReport`, `MomReport`, `SavingsTrendReport`, `IncomePercentageReport` |

### 4.2 Validation Schemas (`src/validation/index.ts`)

All schemas are Zod-based and used for both server-side validation and mobile form validation.

| Schema | Validates |
|---|---|
| `registerSchema` | `email`, `password` (min 8), `name`, `monthlyIncome?`, `currency` |
| `loginSchema` | `email`, `password` |
| `createWalletSchema` | `name`, `type`, `startingBalance` |
| `createTransactionSchema` | `walletId` (UUID), `amount`, `type`, `merchant?`, `category`, `transactionDate` |
| `createBudgetSchema` | `category`, `amountLimit`, `period`, `rollover?` |
| `createGoalSchema` | `name`, `targetAmount`, `targetDate?` |
| `chatMessageSchema` | Array of `{ role, content }`, min length 1 |
| `submitSmsSchema` | `rawText`, `walletId` |
| `uploadStatementSchema` | `walletId` |
| `submitReconciliationSchema` | `walletId`, `statedBalance`, `note?` |
| `monthReportSchema` | `month` (1–12), `year` (2000+) |
| `merchantReportSchema` | `from`, `to`, `category?` |
| `trendReportSchema` | `months` (1–24, default 6) |

### 4.3 Constants (`src/constants/index.ts`)

| Constant | Value |
|---|---|
| `CATEGORIES` | `['Groceries', 'Dining', 'Transport', 'Health', 'Shopping', 'Entertainment', 'Utilities', 'Savings', 'Transfer', 'Other']` |
| `WALLET_TYPES` | `['bank', 'cash', 'ewallet']` |
| `TRANSACTION_STATUSES` | `['pending', 'approved', 'rejected']` |
| `BUDGET_PERIODS` | `['monthly', 'weekly']` |
| `DEFAULT_CURRENCY` | `'LKR'` |
| `JWT_ACCESS_TTL` | `'15m'` |
| `JWT_REFRESH_TTL` | `'30d'` |
| `BUDGET_CACHE_TTL` | `600` seconds |
| `MAX_STATEMENT_SIZE` | `10` MB |

---

## 5. Server Application

**Location:** `server/src/`

The server follows a strict `routes → controller → service → Prisma` layered architecture. All responses use `{ success: true, data: T }` or `{ success: false, error: string }`. Paginated responses use `{ items, total, page, limit, hasMore }`.

### 5.1 Environment & Configuration

**File:** `server/.env` (not `.env.local`). Copy from `.env.example`.

**Required variables:**

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Supabase transaction pooler (port 6543, `?pgbouncer=true`) |
| `DIRECT_URL` | Supabase session pooler / direct (port 5432) — used by Prisma migrations |
| `REDIS_URL` | Upstash Redis TLS URL (`rediss://...`) |
| `JWT_ACCESS_SECRET` | 32-byte hex — signs access tokens |
| `JWT_REFRESH_SECRET` | 32-byte hex — signs refresh tokens |

**AI provider (at least one required):**

| Variable | Provider |
|---|---|
| `AI_PROVIDER` | `'anthropic'` / `'gemini'` / `'nvidia'` (default: `'nvidia'`) |
| `ANTHROPIC_API_KEY` | Anthropic Claude |
| `GEMINI_API_KEY` | Google Gemini |
| `NVIDIA_API_KEY` | NVIDIA Llama via OpenAI-compatible API |

**Optional variables:**

| Variable | Purpose |
|---|---|
| `PORT` | Server port (default `3000`) |
| `NODE_ENV` | `development` / `production` |
| `ALLOWED_ORIGINS` | Comma-separated CORS whitelist |
| `SUPABASE_URL` | Project URL for file storage |
| `SUPABASE_SERVICE_KEY` | Service role key for Supabase Storage |
| `FIREBASE_PROJECT_ID` | FCM project ID |
| `FIREBASE_PRIVATE_KEY` | FCM private key |
| `FIREBASE_CLIENT_EMAIL` | FCM client email |

### 5.2 Database Schema (Prisma)

**File:** `server/prisma/schema.prisma`

Database: PostgreSQL (Supabase). 9 models, 15+ composite indexes.

#### `User`
```
id              UUID (PK, default cuid)
email           String (unique)
passwordHash    String
name            String
monthlyIncome   Decimal?
currency        String (default 'LKR')
fcmToken        String?
notificationPrefs JSONB?
createdAt       DateTime
updatedAt       DateTime
```

#### `Wallet`
```
id              UUID (PK)
userId          UUID (FK → User, cascade delete)
name            String
type            String  (bank | cash | ewallet)
startingBalance Decimal (default 0)
createdAt       DateTime
```

#### `Transaction`
```
id              UUID (PK)
userId          UUID (FK → User)
walletId        UUID (FK → Wallet)
amount          Decimal  (absolute value)
signedAmount    Decimal  (negative for debits)
type            String   (debit | credit)
merchant        String?
category        String
status          String   (pending | approved | rejected)
source          String   (manual | sms | statement | goal_contribution)
rawInput        String?
aiConfidence    Float?
metadata        JSONB?
notes           String?
transactionDate DateTime
approvedAt      DateTime?
createdAt       DateTime

Indexes:
  [userId, status]
  [userId, transactionDate DESC]
  [userId, category]
  [walletId, status]
  [userId, source]
```

#### `Budget`
```
id              UUID (PK)
userId          UUID (FK → User)
category        String
amountLimit     Decimal
period          String  (monthly | weekly)
rollover        Boolean (default false)
lastResetDate   DateTime?
createdAt       DateTime

Unique: [userId, category, period]
```

#### `Goal`
```
id                      UUID (PK)
userId                  UUID (FK → User)
name                    String
targetAmount            Decimal
currentAmount           Decimal (default 0)
targetDate              DateTime?
projectedCompletionDate DateTime?
status                  String (active | completed | paused | archived)
createdAt               DateTime

Index: [userId, status]
```

#### `CompanionMemory`
```
id          UUID (PK)
userId      UUID (FK → User)
type        String  (behaviour | preference | goal_context | user_stated)
key         String
value       Text
confidence  Float
lastSeen    DateTime
createdAt   DateTime

Unique: [userId, key]
Index:  [userId, type]
```

#### `AiCheckin`
```
id          UUID (PK)
userId      UUID (FK → User)
type        String  (daily | weekly | insight | suggestion)
content     Text
readAt      DateTime?
createdAt   DateTime

Indexes:
  [userId, createdAt DESC]
  [userId, type]
```

#### `IngestionLog`
```
id            UUID (PK)
userId        UUID (FK → User)
sourceType    String  (sms | statement)
rawPayload    Text
status        String  (queued | processing | processed | failed)
errorMessage  String?
createdAt     DateTime

Indexes:
  [userId, status]
  [userId, createdAt DESC]
```

#### `Reconciliation`
```
id               UUID (PK)
userId           UUID (FK → User)
walletId         UUID (FK → Wallet)
statedBalance    Decimal
computedBalance  Decimal
discrepancy      Decimal
reconciledAt     DateTime

Indexes:
  [userId, reconciledAt DESC]
  [walletId]
```

### 5.3 API Modules

Each module lives in `server/src/modules/{name}/` and exposes a `{name}.routes.ts`, `{name}.controller.ts`, and `{name}.service.ts`.

#### Auth (`/auth`)

| Method | Path | Body | Auth | Description |
|---|---|---|---|---|
| POST | `/auth/register` | `{ email, password, name, monthlyIncome?, currency? }` | No | Create account, return token pair |
| POST | `/auth/login` | `{ email, password }` | No | Authenticate, return token pair |
| POST | `/auth/refresh` | `{ refreshToken }` | No | Rotate tokens |
| POST | `/auth/logout` | — | Yes | Invalidate refresh token in Redis |

**Token flow:**
- Access token: `JWT(userId, email)`, signed with `JWT_ACCESS_SECRET`, TTL 15m
- Refresh token: `JWT(userId, tokenId)`, signed with `JWT_REFRESH_SECRET`, TTL 30d
- Refresh token ID stored in Redis at `refresh:{tokenId}` for revocation
- Password hashed with bcrypt (12 rounds)

#### Wallets (`/wallets`)

| Method | Path | Body | Description |
|---|---|---|---|
| GET | `/wallets` | — | List wallets with computed balances |
| POST | `/wallets` | `{ name, type, startingBalance }` | Create wallet |
| PUT | `/wallets/{id}` | `{ name?, type? }` | Update wallet |
| DELETE | `/wallets/{id}` | — | Delete wallet (cascade transactions) |

**Balance rule:** `currentBalance = startingBalance + SUM(signedAmount) WHERE status = 'approved'`. Never stored.

#### Transactions (`/transactions`)

| Method | Path | Body / Query | Description |
|---|---|---|---|
| GET | `/transactions` | `?status=&category=&walletId=&startDate=&endDate=&page=&limit=` | List with filters, paginated |
| POST | `/transactions` | `{ walletId, amount, type, merchant?, category, transactionDate }` | Create manual transaction (auto-approved) |
| PATCH | `/transactions/{id}/approve` | `{ merchant?, category?, amount? }` | Approve pending (with optional edits) |
| PATCH | `/transactions/{id}/reject` | — | Reject pending |
| PATCH | `/transactions/batch-approve` | `{ transactionIds: string[] }` | Approve multiple pending |

**Rules:**
- Manual transactions: created as `approved` immediately
- SMS/statement transactions: created as `pending`, require user review
- On approval: budget cache invalidated, thresholds checked (80%, 90%)
- `signedAmount = type === 'debit' ? -amount : +amount`

#### Budgets (`/budgets`)

| Method | Path | Body | Description |
|---|---|---|---|
| GET | `/budgets` | — | List budgets with computed spend/remaining |
| POST | `/budgets` | `{ category, amountLimit, period, rollover? }` | Create budget |
| PUT | `/budgets/{id}` | `{ amountLimit?, period?, rollover? }` | Update budget |
| DELETE | `/budgets/{id}` | — | Delete budget |

**Rules:**
- Spend computed from approved debits in current period; Redis-cached 10 minutes
- Period start: monthly = 1st of month, weekly = most recent Monday
- Rollover flag controls whether unused budget carries forward
- 80% and 90% thresholds trigger one-time push notifications per period

#### Goals (`/goals`)

| Method | Path | Body | Description |
|---|---|---|---|
| GET | `/goals` | — | List active goals with projections |
| POST | `/goals` | `{ name, targetAmount, targetDate? }` | Create goal |
| PUT | `/goals/{id}` | `{ name?, targetAmount?, targetDate? }` | Update goal |
| PATCH | `/goals/{id}/archive` | — | Archive goal |
| POST | `/goals/{id}/contribute` | `{ amount, walletId }` | Add contribution from wallet |

**Rules:**
- Contributions create an approved `Transaction` (source: `goal_contribution`)
- `projectedCompletionDate` computed from weekly average contribution rate
- Status: `active` → `completed` (when `currentAmount >= targetAmount`) → `paused` / `archived`

#### AI (`/ai`)

| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/ai/chat` | `{ messages: [{ role, content }] }` | Multi-turn conversation |
| GET | `/ai/insights` | — | All AI checkins for user |
| GET | `/ai/checkin` | — | Latest checkin |

**Three-layer system prompt:**
1. **Static profile** — user name, currency, monthly income
2. **Rolling financial state** — last 30 days of approved transactions, wallet balances, budget statuses, active goals (included selectively based on message keywords)
3. **Companion memories** — persisted key/value facts from `CompanionMemory` table

**Context detection:** The service analyses the last user message for keywords (`balance`, `spend`, `budget`, `goal`, `remember`) and only includes relevant data sections. Vague messages include all sections.

#### Ingestion (`/ingestion`)

| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/ingestion/sms` | `{ rawText, walletId }` | Submit raw SMS for parsing |
| POST | `/ingestion/statement` | `multipart: file (PDF), walletId` | Upload PDF for extraction |

**Flow:**
1. Validate wallet ownership
2. Create `IngestionLog` (status: `queued`)
3. Enqueue job to `sms-parse` or `statement-parse` queue
4. Return `202 Accepted` with `ingestionLogId`
5. Worker processes asynchronously, sends push notification on completion

#### Reconciliation (`/reconciliation`)

| Method | Path | Body | Description |
|---|---|---|---|
| GET | `/reconciliation/status` | — | Check if reconciliation is needed for user |
| POST | `/reconciliation/submit` | `{ walletId, statedBalance, note? }` | Submit stated vs computed balance |

**Logic:** `discrepancy = statedBalance - computedBalance`. Logged with timestamp. If discrepancy exceeds threshold, triggers investigation job.

#### Reports (`/reports`)

| Method | Path | Query | Description |
|---|---|---|---|
| GET | `/reports/monthly` | `?month=&year=` | Spend by category for a given month |
| GET | `/reports/merchants` | `?from=&to=&category=` | Top merchants by spend |
| GET | `/reports/month-over-month` | `?months=` | MoM spend comparison snapshots |
| GET | `/reports/savings-trend` | `?months=` | Savings rate trend |
| GET | `/reports/income-percentages` | `?month=&year=` | Spend as % of monthly income |

All use only `approved` transactions scoped to the authenticated user.

#### Users (`/users`)

| Method | Path | Body | Description |
|---|---|---|---|
| GET | `/users/profile` | — | Fetch user profile |
| PUT | `/users/profile` | `{ name?, monthlyIncome?, currency?, notificationPrefs? }` | Update profile |
| PUT | `/users/fcm-token` | `{ fcmToken }` | Register device push token |

### 5.4 Middleware

**`auth.ts` — JWT verification**
- Extracts `Authorization: Bearer <token>` header
- Verifies with `JWT_ACCESS_SECRET`
- Populates `req.user = { userId, email }`
- Returns 401 if missing, expired, or invalid

**`validate.ts` — Zod schema validation**
- `validateBody(schema)` — Validates `req.body`, returns 400 with field errors on failure
- `validateQuery(schema)` — Validates `req.query`, same error format

### 5.5 Shared Services

**`services/ledger.service.ts`**
- `computeNetBalance(userId)` — `SUM(signedAmount)` across all approved transactions for user
- `computeAllWalletBalances(userId)` — Returns `Map<walletId, balance>` (starting balance + approved transactions)
- `computeWalletBalance(walletId, startingBalance)` — Balance for a single wallet

**`services/budget.service.ts`**
- `getBudgetSpend(userId, category, period)` — Current period spend, Redis-cached 10 min
- `invalidateBudgetCache(userId, category)` — Clears monthly + weekly cache keys for category
- `checkBudgetThresholds(userId, category)` — Checks 80%/90%; sends notification at most once per period (Redis flag with TTL = remaining days in period)

**`services/notification.service.ts`**
- `sendNotification(userId, title, body, data?)` — Looks up user's FCM token, enqueues to `notification` queue

### 5.6 BullMQ Workers

**Location:** `server/src/workers/`

Workers run as a separate Node.js process (`dev:workers`). Each queue has its own worker processor.

**Default job options:** 3 retry attempts, exponential backoff starting at 2s, completed jobs auto-removed after 24h, failed jobs retained for 7 days.

**Repeatable jobs (registered on `queue.ts` init):**

| Job | Schedule (UTC) | Description |
|---|---|---|
| `daily_checkin` | 08:00 daily | Morning AI summary for all users |
| `weekly_summary` | 18:00 Sunday | Week-in-review AI summary |
| `pattern-detection` | Every 6 hours | Behavioural anomaly detection |
| `budget-rollover` | 00:05 on 1st of month | Monthly budget reset |
| `reconciliation-reminder` | 09:00 on 1st of month | Prompt users to reconcile |

#### Worker: `smsParse.job.ts`
- Queue: `sms-parse`
- Job name: `parse_sms`
- Data: `{ ingestionLogId, userId, rawText, walletId, hintCategory? }`
- Steps:
  1. Update `IngestionLog.status` → `processing`
  2. Call Claude: extract `{ amount, type, merchant, category, date, confidence }`
  3. Create `Transaction` (status: `pending`, source: `sms`, aiConfidence)
  4. Update `IngestionLog.status` → `processed`
  5. Send push notification: "New pending transaction: {amount} at {merchant}"
- On failure: update `IngestionLog.status` → `failed`, set `errorMessage`

#### Worker: `statementParse.job.ts`
- Queue: `statement-parse`
- Job name: `parse_statement`
- Data: `{ ingestionLogId, userId, walletId, pdfBuffer }`
- Steps:
  1. Extract text from PDF via `pdf-parse`
  2. Call Claude to extract multiple transactions from statement text
  3. Create `Transaction` records (status: `pending`) for each extracted transaction
  4. Update `IngestionLog.status` → `processed`
  5. Send summary push notification: "X pending transactions from statement"

#### Worker: `aiInsight.job.ts`
- Queue: `ai-insight`
- Job names: `daily_checkin`, `weekly_summary`
- Steps:
  1. `buildFinancialContext(userId)` — 30-day snapshot (income, expenses, categories, budgets, goals, wallets)
  2. Generate AI text via configured provider
  3. Create `AiCheckin` record (type: `daily` or `weekly`)
  4. Send push notification with first 100 chars of checkin

#### Worker: `memoryExtraction.job.ts`
- Queue: `memory-extraction`
- Job name: `extract`
- Data: `{ userId, context }`
- Calls Claude to extract behavioural/preference insights from conversation context
- Upserts `CompanionMemory` records (unique on `[userId, key]`)
- Stores model-provided confidence score (0–1)

#### Worker: `patternDetection.job.ts`
- Queue: `pattern-detection`
- Job name: `run`
- Processes all active users every 6 hours
- Detects: unusual category spend, spending frequency spikes
- Creates `AiCheckin` (type: `insight`) for detected anomalies
- Sends push notifications for significant anomalies

#### Worker: `budgetRollover.job.ts`
- Queue: `budget-rollover`
- Job name: `run`
- For each user's `Budget` where rollover period boundary is reached:
  - `rollover = false`: resets spend counter (via `lastResetDate`)
  - `rollover = true`: carries unused amount forward

#### Worker: `reconciliationReminder.job.ts`
- Queue: `reconciliation-reminder`
- Job name: `run`
- Runs on 1st of month
- Sends push notification to all users with wallets

#### Worker: `notification.job.ts`
- Queue: `notification`
- Job name: `notification_dispatch`
- Data: `{ userId, fcmToken, title, body, data? }`
- Calls `sendPushToDevice()` from `lib/fcm.ts`
- Logs gracefully if Firebase is not configured (stub mode for local dev)

### 5.7 AI Provider Abstraction

**File:** `server/src/lib/ai-provider.ts`

Single `generateText(request)` function routes to the configured provider. All callers use the same interface; the provider is selected via `AI_PROVIDER` env var.

| Provider | Model (default tier) | Model (fast tier) |
|---|---|---|
| `anthropic` | `claude-sonnet-4-20250514` | `claude-haiku-4-5-20251001` |
| `gemini` | `gemini-2.0-flash-lite` | `gemini-2.0-flash-lite` |
| `nvidia` | `meta/llama-3.3-70b-instruct` | `meta/llama-3.3-70b-instruct` |

- Automatic retry on HTTP 429 with exponential backoff (provider-specific)
- `tier: 'fast' | 'default'` parameter selects model variant

---

## 6. Mobile Application

**Location:** `apps/mobile/`

React Native with Expo SDK 52. File-based routing via Expo Router v4. Node 20.18 required (Expo SDK 52 breaks on Node 24+).

### 6.1 Navigation Structure

```
app/
├── _layout.tsx              ← Root layout (auth-gated: auth group vs tabs group)
├── index.tsx                ← Redirect based on auth state
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   ├── register.tsx
│   └── onboarding.tsx       ← Post-signup profile setup (name, income, currency)
├── (tabs)/
│   ├── _layout.tsx          ← Tab navigator (7 tabs)
│   ├── home.tsx
│   ├── add.tsx
│   ├── transactions.tsx
│   ├── ai.tsx
│   ├── budgets.tsx
│   ├── goals.tsx
│   ├── wallets.tsx
│   └── settings.tsx
├── ai/
│   ├── chat.tsx
│   └── insights.tsx
├── budgets/
│   ├── index.tsx
│   ├── new.tsx
│   └── [id].tsx
├── goals/
│   ├── new.tsx
│   └── [id].tsx
├── ingest/
│   ├── sms.tsx
│   └── statement.tsx
├── transactions/
│   ├── new.tsx
│   └── pending.tsx
├── wallets/
│   ├── index.tsx
│   └── [id].tsx
├── reconcile.tsx
└── reports.tsx
```

**Auth gate:** `app/_layout.tsx` checks `authStore.isAuthenticated` and conditionally renders `(auth)` or `(tabs)` route group.

### 6.2 Screens

| Screen | Route | Purpose |
|---|---|---|
| Login | `/(auth)/login` | Email + password sign-in |
| Register | `/(auth)/register` | Account creation |
| Onboarding | `/(auth)/onboarding` | Set name, income, currency post-signup |
| Home | `/(tabs)/home` | Dashboard: wallet summary cards, recent transactions, latest AI checkin, quick actions |
| Add | `/(tabs)/add` | Quick entry: manual transaction or ingestion (SMS/statement) |
| Transactions | `/(tabs)/transactions` | Filtered, paginated transaction list |
| Pending | `/transactions/pending` | Pending approval list — inline approve/reject/edit |
| AI | `/(tabs)/ai` | Chat interface + insights list entry point |
| Chat | `/ai/chat` | Full multi-turn conversation with AI companion |
| Insights | `/ai/insights` | Chronological list of all AI checkins |
| Budgets | `/(tabs)/budgets` | Budget list with spend progress bars |
| New Budget | `/budgets/new` | Create budget form |
| Budget Detail | `/budgets/[id]` | Edit or delete budget |
| Goals | `/(tabs)/goals` | Active goals with progress rings |
| New Goal | `/goals/new` | Create goal form |
| Goal Detail | `/goals/[id]` | Update goal, make contribution |
| Wallets | `/(tabs)/wallets` | Wallet list with computed balances |
| Wallet Detail | `/wallets/[id]` | Edit or delete wallet |
| SMS Ingest | `/ingest/sms` | Paste SMS text, select wallet/category, submit |
| Statement Ingest | `/ingest/statement` | Pick PDF, select wallet, submit |
| Reconcile | `/reconcile` | Enter stated balance, view discrepancy |
| Reports | `/reports` | Monthly spend, merchants, MoM, savings trend, income % |
| Settings | `/(tabs)/settings` | Edit profile, logout |

### 6.3 Zustand Stores

**`authStore.ts`**

| State | Type |
|---|---|
| `accessToken` | `string \| null` |
| `refreshToken` | `string \| null` |
| `user` | `User \| null` |
| `isAuthenticated` | `boolean` |
| `isLoading` | `boolean` |
| `error` | `string \| null` |

| Method | Description |
|---|---|
| `login(email, password)` | POST `/auth/login`, set tokens, navigate to home |
| `register(data)` | POST `/auth/register`, set tokens, navigate to onboarding |
| `logout()` | Clear tokens, delete SecureStore entry, navigate to login |
| `refreshTokens()` | POST `/auth/refresh`, update tokens |
| `updateProfile(updates)` | PUT `/users/profile` |
| `initialize()` | Cold start: restore session from SecureStore |
| `setTokens(access, refresh)` | Set tokens + persist refresh token to SecureStore |
| `clearError()` | Clear error state |

Persistence: `user` and `isAuthenticated` persisted to AsyncStorage. Access token is never persisted. Refresh token stored in device SecureStore/Keychain.

---

**`walletStore.ts`**

| State | Type |
|---|---|
| `wallets` | `WalletWithBalance[]` |
| `totalBalance` | `number` |
| `isLoading` | `boolean` |
| `error` | `string \| null` |

| Method | Description |
|---|---|
| `fetchWallets()` | GET `/wallets`, compute `totalBalance` sum |
| `createWallet(data)` | POST `/wallets`, append to local state |
| `updateWallet(id, data)` | PUT `/wallets/{id}`, update in local state |
| `deleteWallet(id)` | DELETE `/wallets/{id}`, remove from local state |
| `invalidateBalance()` | Re-fetch wallets (called after transaction approval) |

---

**`transactionStore.ts`**

| State | Type |
|---|---|
| `transactions` | `Transaction[]` |
| `pending` | `Transaction[]` |
| `filters` | `object` |
| `hasMore` | `boolean` |
| `isLoading` | `boolean` |
| `error` | `string \| null` |

| Method | Description |
|---|---|
| `fetchTransactions(filters?)` | GET `/transactions` with query params, paginated |
| `fetchPending()` | GET `/transactions?status=pending` |
| `approveTransaction(id, edits?)` | PATCH `/transactions/{id}/approve`, remove from pending |
| `rejectTransaction(id)` | PATCH `/transactions/{id}/reject`, remove from pending |
| `batchApprove(ids)` | PATCH `/transactions/batch-approve` |
| `addManual(data)` | POST `/transactions`, prepend to transaction list |
| `setFilters(filters)` | Update internal filter state |

---

**`budgetStore.ts`**

| State | Type |
|---|---|
| `budgets` | `BudgetWithStatus[]` |
| `totalBudget` | `number` |
| `totalSpent` | `number` |
| `isLoading` | `boolean` |

| Method | Description |
|---|---|
| `fetchBudgets()` | GET `/budgets`, compute totals |
| `createBudget(data)` | POST `/budgets` |
| `updateBudget(id, data)` | PUT `/budgets/{id}` |
| `deleteBudget(id)` | DELETE `/budgets/{id}` |

---

**`goalStore.ts`**

| State | Type |
|---|---|
| `goals` | `GoalWithProjection[]` |
| `isLoading` | `boolean` |

| Method | Description |
|---|---|
| `fetchGoals()` | GET `/goals`, filters out archived |
| `createGoal(data)` | POST `/goals` |
| `contribute(goalId, data)` | POST `/goals/{goalId}/contribute` |

---

**`aiStore.ts`**

| State | Type |
|---|---|
| `chatHistory` | `ChatMessage[]` |
| `insights` | `AiCheckin[]` |
| `latestCheckin` | `AiCheckin \| null` |
| `isTyping` | `boolean` |

| Method | Description |
|---|---|
| `loadChatHistory(userId)` | Load from AsyncStorage |
| `sendMessage(content, userId?)` | POST `/ai/chat`, append to history, persist |
| `fetchInsights()` | GET `/ai/insights` |
| `fetchLatestCheckin()` | GET `/ai/checkin` |
| `clearChat(userId?)` | Clear history + AsyncStorage |

Persistence: Chat history stored in AsyncStorage keyed by user ID. Max 50 messages persisted.

### 6.4 API Client

**File:** `apps/mobile/lib/api.ts`

**Axios instance:**
- Base URL: `API_URL` from `constants/index.ts` (env var or `http://localhost:3000`)
- Timeout: 60 seconds

**Request interceptor:** Injects `Authorization: Bearer {accessToken}` from `authStore`.

**Response interceptor:** Unwraps `{ success: true, data: T }` envelope — stores receive `data` directly. Triggers token refresh on 401 (see below).

**Token refresh logic on 401:**
1. Check if request is already a retry (prevent loops)
2. Acquire `pendingRefresh` lock to serialize concurrent refresh attempts
3. Call `POST /auth/refresh` via raw Axios instance (bypasses interceptor)
4. Update tokens in `authStore`
5. Retry original request with new access token
6. On refresh failure: call `authStore.logout()`

**Helper functions:**
- `apiGet<T>(url, params?)` — GET with typed response
- `apiPost<T>(url, body?)` — POST
- `apiPut<T>(url, body?)` — PUT
- `apiPatch<T>(url, body?)` — PATCH
- `apiDelete<T>(url)` — DELETE

### 6.5 Utilities & Libraries

**`lib/secureRefreshToken.ts`**
- `getRefreshToken()` / `setRefreshToken(token)` / `deleteRefreshToken()` — Expo SecureStore (device Keychain / Secure Enclave)

**`lib/pushNotifications.ts`**
- `registerForPushNotifications()` — Requests permission, obtains device push token, calls `PUT /users/fcm-token`
- `setupNotificationListeners()` — Handles foreground/background notification taps, routes to relevant screen

**`lib/format.ts`**
- `useCurrency()` — Hook reading currency from `authStore`
- `formatAmount(num, currency)` — Locale-aware number formatting

**`lib/offlineQueue.ts`**
- Queues transactions to device storage when offline
- Auto-retries on reconnect (stub implementation)

**`constants/theme.ts`**
- Color palette (slate, blue, red, green, orange)
- Spacing scale: 4, 8, 12, 16, 24, 32
- Typography: font sizes, font weights

**Components (`components/`):**

| Component | Purpose |
|---|---|
| `Button` | Primary / secondary / danger variants, size sm/md/lg, loading state |
| `Card` | Container with shadow, padding, border radius |
| `Input` | Text input with label, error display, keyboard type |
| `ProgressBar` | Linear progress for budget spend |
| `SpendingRing` | Circular progress for goal completion |
| `TransactionCard` | Category icon, signed amount, merchant, date, status badge |

---

## 7. Key Design Decisions

### Balances Are Derived, Never Stored
`currentBalance = startingBalance + SUM(signedAmount) WHERE status = 'approved'`. Computed on demand or cached briefly. This eliminates balance drift and ensures the ledger is always the source of truth. The `computeWalletBalance()` function in `ledger.service.ts` is the single authoritative calculation.

### AI Recommends, User Approves
All AI-parsed transactions (SMS, statement) start as `pending`. The user must explicitly approve before a transaction affects any balance, budget, or goal. AI confidence scores are tracked but never used to auto-approve. Users can edit merchant, category, and amount before approval.

### SMS Paste Instead of Direct Messaging Integration
Users copy their bank SMS text and paste it into the app. This avoids dependencies on WhatsApp, Telegram, or other messaging APIs, and gives users full control over what data reaches FinPal.

### JWT Token Architecture
- **Access token** (15m): stateless, includes `userId` + `email`
- **Refresh token** (30d): contains a unique `tokenId`, stored server-side in Redis for revocation on logout
- **Mobile storage**: refresh token in SecureStore (hardware-backed encryption); access token never persisted (refreshed on cold start)

### Multi-Provider AI Abstraction
`generateText(request)` in `ai-provider.ts` routes to Anthropic/Gemini/NVIDIA based on `AI_PROVIDER`. Caller code is provider-agnostic. The `tier` parameter (`fast` / `default`) selects model variant per provider. Auto-retry on rate limiting with provider-specific backoff.

### Three-Layer AI Context
1. **Static profile** — name, currency, monthly income
2. **Rolling 30-day financial state** — transactions, wallet balances, budget statuses, goals (selectively included based on message keywords)
3. **Companion memories** — learned behavioural/preference facts from `CompanionMemory` table (upserted after each conversation)

Context detection prevents loading irrelevant data: a question about goals only loads goal data, not the full transaction history.

---

## 8. Data Flow Examples

### SMS Ingestion → Transaction Approval

```
1. User: paste "You swiped LKR 5,000 at Keells Supermarket" in /ingest/sms
2. Mobile → POST /ingestion/sms { rawText, walletId }
3. Server: create IngestionLog (queued), enqueue sms-parse job → return 202
4. Worker: smsParse.job
   - Update IngestionLog → processing
   - Call Claude: extract { amount: 5000, type: debit, merchant: "Keells", category: "Groceries", confidence: 0.95 }
   - Create Transaction (pending, source: sms, aiConfidence: 0.95)
   - Update IngestionLog → processed
   - Push: "Pending: LKR 5,000 at Keells"
5. User taps notification → /transactions/pending
6. User reviews → taps Approve (optionally edits category)
7. Mobile → PATCH /transactions/{id}/approve { category: "Groceries" }
8. Server: Transaction → approved
   - Invalidate budget cache for "Groceries"
   - Check 80%/90% thresholds → send alert if crossed
9. Mobile: remove from pending, refresh wallet balance
```

### Daily AI Checkin Generation

```
1. BullMQ fires daily_checkin at 08:00 UTC
2. Worker: aiInsight.job
   - buildFinancialContext(userId):
     • 30-day totals: income, expenses, savings rate
     • Category breakdown: Groceries LKR 45k, Dining LKR 35k, ...
     • Budget statuses: Groceries 75%, Dining 87%, ...
     • Active goals: House Fund 25%, Vacation 17%
     • Wallet balances: Bank LKR 100k, E-Wallet LKR 25.4k
   - Call AI provider with system prompt + context
   - Claude returns: "Good morning! Your finances look healthy..."
   - Create AiCheckin (type: daily)
   - Push: "Your Daily Financial Summary"
3. User taps notification → /ai/chat
4. App fetches GET /ai/checkin → renders checkin
```

### Budget Threshold Alert

```
1. User approves LKR 850 Dining transaction
2. Server: Transaction → approved
3. checkBudgetThresholds(userId, "Dining")
   - getBudgetSpend → Redis miss → query DB → LKR 950 spent
   - Budget limit: LKR 1000 → 95%
   - 90% threshold crossed
   - Check Redis flag "budget_alert:{userId}:Dining:monthly:90" → not set
   - Set flag (TTL = days remaining in month)
   - sendNotification: "Budget Alert: Dining — 95% of LKR 1,000 used"
4. Notification worker → FCM → device
5. User taps → /budgets/{dining-budget-id}
```

---

## 9. External Integrations

### Firebase Cloud Messaging
- Device registration: `Expo.getDevicePushTokenAsync()` → `PUT /users/fcm-token`
- Delivery: Server enqueues notification job → `notification.job.ts` → Firebase Admin SDK
- Tap handling: Expo `addNotificationResponseReceivedListener` routes to target screen
- Stub mode: If `FIREBASE_PROJECT_ID` is absent, server logs instead of sending

### Supabase
- **PostgreSQL**: Prisma connects via transaction pooler (`DATABASE_URL`, port 6543) for queries and session pooler (`DIRECT_URL`, port 5432) for `prisma migrate`
- **Storage**: Optional PDF storage via `@supabase/supabase-js` (controlled by `SUPABASE_URL` + `SUPABASE_SERVICE_KEY`)

### Upstash Redis
- Connection: TLS via `rediss://` URL
- Used for: BullMQ job queues, budget spend cache (10 min), budget alert flags, refresh token store (30d)

### AI Providers
- **Anthropic**: `@anthropic-ai/sdk`
- **Google Gemini**: `@google/generative-ai`
- **NVIDIA**: OpenAI-compatible REST API (`api.nvidia.com`) — uses `openai` SDK with custom base URL

---

## 10. Security Architecture

### Authentication & Session
- Passwords: bcrypt 12 rounds — never stored in plaintext
- Access token: JWT, 15m TTL, verified on every authenticated request
- Refresh token: JWT, 30d TTL, `tokenId` stored in Redis for server-side revocation
- Mobile storage: refresh token in SecureStore (hardware-backed), access token in memory only
- Token rotation on every refresh call

### API Security
- Rate limiting: 100 req / 15 min per IP (global); 5 attempts / 15 min per IP (auth endpoints)
- CORS: explicit origin whitelist via `ALLOWED_ORIGINS`; localhost allowed in development
- Input validation: Zod schemas enforced on all request bodies and query parameters
- SQL injection: prevented by Prisma parameterised queries
- XSS prevention: user-controlled strings in AI prompts are stripped of `<`, `>`, `&` characters

### Data Scoping
- All database queries are scoped to `userId` extracted from the verified JWT — no user can access another user's data
- Foreign key constraints with cascade delete prevent orphaned records

### Secrets Management
- All secrets in `server/.env` (gitignored)
- No secrets committed to the repository
- Firebase credentials expected as environment variables, not embedded files

---

## 11. API Endpoint Reference

All authenticated endpoints require `Authorization: Bearer <access_token>` header.

```
AUTH
  POST   /auth/register                 body: { email, password, name, monthlyIncome?, currency? }
  POST   /auth/login                    body: { email, password }
  POST   /auth/refresh                  body: { refreshToken }
  POST   /auth/logout                   (auth required)

WALLETS
  GET    /wallets                       (auth)
  POST   /wallets                       body: { name, type, startingBalance }
  PUT    /wallets/:id                   body: { name?, type? }
  DELETE /wallets/:id                   (auth)

TRANSACTIONS
  GET    /transactions                  query: status, category, walletId, startDate, endDate, page, limit
  POST   /transactions                  body: { walletId, amount, type, merchant?, category, transactionDate }
  PATCH  /transactions/:id/approve      body: { merchant?, category?, amount? }
  PATCH  /transactions/:id/reject       (auth)
  PATCH  /transactions/batch-approve    body: { transactionIds: string[] }

BUDGETS
  GET    /budgets                       (auth)
  POST   /budgets                       body: { category, amountLimit, period, rollover? }
  PUT    /budgets/:id                   body: { amountLimit?, period?, rollover? }
  DELETE /budgets/:id                   (auth)

GOALS
  GET    /goals                         (auth)
  POST   /goals                         body: { name, targetAmount, targetDate? }
  PUT    /goals/:id                     body: { name?, targetAmount?, targetDate? }
  PATCH  /goals/:id/archive             (auth)
  POST   /goals/:id/contribute          body: { amount, walletId }

AI
  POST   /ai/chat                       body: { messages: [{ role, content }] }
  GET    /ai/insights                   (auth)
  GET    /ai/checkin                    (auth)

INGESTION
  POST   /ingestion/sms                 body: { rawText, walletId }
  POST   /ingestion/statement           multipart: file (PDF), walletId

RECONCILIATION
  GET    /reconciliation/status         (auth)
  POST   /reconciliation/submit         body: { walletId, statedBalance, note? }

REPORTS
  GET    /reports/monthly               query: month, year
  GET    /reports/merchants             query: from, to, category?
  GET    /reports/month-over-month      query: months (default 6)
  GET    /reports/savings-trend         query: months (default 6)
  GET    /reports/income-percentages    query: month, year

USERS
  GET    /users/profile                 (auth)
  PUT    /users/profile                 body: { name?, monthlyIncome?, currency?, notificationPrefs? }
  PUT    /users/fcm-token               body: { fcmToken }

HEALTH
  GET    /health                        (no auth)
```

---

## 12. Deployment & Infrastructure

### Local Development

```bash
# 1. Start local Postgres + Redis
npm run infra:up

# 2. Copy env template
cp .env.example server/.env
# Fill in secrets

# 3. Run Prisma migration
cd server && npx prisma migrate dev --name init

# 4. Start API + workers in separate terminals
npm run dev:server
npm run dev:workers

# 5. Start Expo
npm run dev:mobile
```

Android emulators reach the local API at `http://10.0.2.2:3000`.

### Production

| Component | Deployment |
|---|---|
| API server | Node.js process running `node dist/index.js` |
| Worker process | Node.js process running `node dist/workers/index.js` |
| Database | Supabase managed PostgreSQL |
| Redis | Upstash (serverless Redis, TLS) |
| Push notifications | Firebase Cloud Messaging (Firebase Admin SDK server-side) |
| Mobile | EAS Build (Expo) for iOS / Android |

Both server processes connect to the same Supabase DB and Upstash Redis. They are independently scalable; the API can be horizontally scaled while a single worker process handles job processing.

### Mobile Configuration

- `EXPO_PUBLIC_API_URL` — Overrides default API URL for Expo builds
- `app.json` — Bundle identifier: `com.finpal.app` (iOS), package: `com.finpal.app` (Android)
- Expo plugins: `expo-router`, `expo-secure-store`, `expo-notifications`, `expo-document-picker`
- Node version: 20.18.x (pinned — Expo SDK 52 breaks on Node 24+)
