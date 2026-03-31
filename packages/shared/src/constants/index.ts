export const CATEGORIES = [
  'Groceries',
  'Dining',
  'Transport',
  'Health',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Savings',
  'Transfer',
  'Other',
] as const;

export const WALLET_TYPES = ['bank', 'cash', 'ewallet'] as const;

export const TRANSACTION_TYPES = ['debit', 'credit'] as const;

export const TRANSACTION_STATUSES = ['pending', 'approved', 'rejected'] as const;

export const TRANSACTION_SOURCES = [
  'manual',
  'sms',
  'statement',
  'goal_contribution',
  'reconciliation',
] as const;

export const BUDGET_PERIODS = ['monthly', 'weekly'] as const;

export const GOAL_STATUSES = ['active', 'completed', 'paused', 'archived'] as const;

export const CHECKIN_TYPES = ['daily', 'weekly', 'insight', 'suggestion'] as const;

export const MEMORY_TYPES = [
  'behaviour',
  'preference',
  'goal_context',
  'user_stated',
] as const;

export const BUDGET_WARNING_THRESHOLDS = [80, 90] as const;

export const GOAL_MILESTONES = [25, 50, 75, 100] as const;

export const DEFAULT_CURRENCY = 'LKR';

export const JWT_ACCESS_TTL = '15m';

export const JWT_REFRESH_TTL = '30d';

/** Seconds */
export const BUDGET_CACHE_TTL = 600;

/** Bytes */
export const MAX_STATEMENT_SIZE = 10 * 1024 * 1024;
