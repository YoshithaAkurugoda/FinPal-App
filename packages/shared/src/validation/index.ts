import { z } from 'zod';

import { BUDGET_PERIODS, CATEGORIES, DEFAULT_CURRENCY } from '../constants';

const categoryEnum = z.enum(CATEGORIES);

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  monthlyIncome: z.number().positive().optional(),
  currency: z.string().default(DEFAULT_CURRENCY),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createWalletSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['bank', 'cash', 'ewallet']),
  startingBalance: z.number().min(0),
});

export const createTransactionSchema = z.object({
  walletId: z.string().uuid(),
  amount: z.number().positive(),
  type: z.enum(['debit', 'credit']),
  merchant: z.string().optional(),
  category: categoryEnum,
  transactionDate: z.string().min(1),
});

export const approveTransactionSchema = z.object({
  merchant: z.string().optional(),
  category: categoryEnum.optional(),
  amount: z.number().positive().optional(),
});

export const batchApproveSchema = z.object({
  transactionIds: z.array(z.string().uuid()).min(1),
});

export const createBudgetSchema = z.object({
  category: z.string().min(1),
  amountLimit: z.number().positive(),
  period: z.enum(BUDGET_PERIODS),
  rollover: z.boolean().optional(),
});

export const updateBudgetSchema = z.object({
  amountLimit: z.number().positive().optional(),
  period: z.enum(BUDGET_PERIODS).optional(),
  rollover: z.boolean().optional(),
});

export const createGoalSchema = z.object({
  name: z.string().min(1),
  targetAmount: z.number().positive(),
  targetDate: z.string().min(1).optional(),
});

export const contributeGoalSchema = z.object({
  amount: z.number().positive(),
  walletId: z.string().uuid(),
});

export const submitReconciliationSchema = z.object({
  walletId: z.string().uuid(),
  statedBalance: z.number(),
  note: z.string().optional(),
});

export const chatMessageSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1),
      }),
    )
    .min(1),
});

export const submitSmsSchema = z.object({
  rawText: z.string().min(1),
  walletId: z.string().uuid(),
});

export const uploadStatementSchema = z.object({
  walletId: z.string().uuid(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  monthlyIncome: z.number().positive().optional(),
  currency: z.string().min(1).optional(),
  notificationPrefs: z.record(z.string(), z.unknown()).optional(),
});

export const updateFcmTokenSchema = z.object({
  fcmToken: z.string().min(1),
});

export const updateGoalSchema = z.object({
  name: z.string().min(1).optional(),
  targetAmount: z.number().positive().optional(),
  targetDate: z.string().min(1).nullable().optional(),
});

export const updateWalletSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['bank', 'cash', 'ewallet']).optional(),
});

export const monthReportSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000),
});

export const merchantReportSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  category: z.string().optional(),
});

export const trendReportSchema = z.object({
  months: z.coerce.number().int().min(1).max(24).default(6),
});
