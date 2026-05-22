import './loadEnv.js';

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import type { Request, Response, NextFunction } from 'express';

import { env } from './config/env.js';

import authRoutes from './modules/auth/auth.routes.js';
import walletsRoutes from './modules/wallets/wallets.routes.js';
import transactionsRoutes from './modules/transactions/transactions.routes.js';
import budgetsRoutes from './modules/budgets/budgets.routes.js';
import goalsRoutes from './modules/goals/goals.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';
import ingestionRoutes from './modules/ingestion/ingestion.routes.js';
import reconciliationRoutes from './modules/reconciliation/reconciliation.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';
import usersRoutes from './modules/users/users.routes.js';

const app = express();

app.use(helmet());

const allowedOrigins = env.ALLOWED_ORIGINS;
const corsOptions =
  env.NODE_ENV === 'production'
    ? {
        origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(null, false);
          }
        },
        credentials: true,
      }
    : {
        origin: true,
        credentials: true,
      };

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later' },
});
app.use(limiter);

// Stricter limiter for credential endpoints: 5 attempts / 15min / IP.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { success: false, error: 'Too many auth attempts, please try again later' },
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authLimiter, authRoutes);
app.use('/wallets', walletsRoutes);

app.use('/transactions', transactionsRoutes);
app.use('/budgets', budgetsRoutes);
app.use('/goals', goalsRoutes);
app.use('/ai', aiRoutes);
app.use('/ingestion', ingestionRoutes);
app.use('/reconciliation', reconciliationRoutes);
app.use('/reports', reportsRoutes);
app.use('/users', usersRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  // Skip logging for CORS errors on OPTIONS requests (expected behavior)
  if (req.method === 'OPTIONS') {
    return res.status(403).json({ success: false, error: 'CORS error' });
  }

  // Log only structured, non-sensitive fields. Avoid dumping the full error
  // object (which can include user payload, SQL fragments, or stack frames).
  const errAny = err as Error & { code?: string; statusCode?: number };
  console.error(
    JSON.stringify({
      level: 'error',
      msg: 'request_error',
      method: req.method,
      path: req.path,
      name: err.name,
      code: errAny.code,
      status: errAny.statusCode ?? 500,
    }),
  );
  res.status(errAny.statusCode ?? 500).json({ success: false, error: 'Internal server error' });
});

app.listen(env.PORT, () => {
  console.log(`FinPal API running on port ${env.PORT}`);
});

export default app;
