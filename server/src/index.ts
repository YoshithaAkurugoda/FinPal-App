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
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later' },
});
app.use(limiter);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);
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

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error]', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(env.PORT, () => {
  console.log(`FinPal API running on port ${env.PORT}`);
});

export default app;
