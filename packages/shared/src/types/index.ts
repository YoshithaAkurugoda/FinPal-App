export type WalletType = 'bank' | 'cash' | 'ewallet';

export type TransactionType = 'debit' | 'credit';

export type TransactionStatus = 'pending' | 'approved' | 'rejected';

export type TransactionSource =
  | 'manual'
  | 'sms'
  | 'statement'
  | 'goal_contribution'
  | 'reconciliation';

export type BudgetPeriod = 'monthly' | 'weekly';

export type GoalStatus = 'active' | 'completed' | 'paused' | 'archived';

export type CheckinType = 'daily' | 'weekly' | 'insight' | 'suggestion';

export type MemoryType =
  | 'behaviour'
  | 'preference'
  | 'goal_context'
  | 'user_stated';

export type IngestionSourceType = 'sms' | 'statement';

export type IngestionStatus = 'queued' | 'processing' | 'processed' | 'failed';

export interface NotificationPrefs {
  [key: string]: unknown;
}

export interface User {
  id: string;
  email: string;
  name: string;
  monthlyIncome: number | null;
  currency: string;
  fcmToken: string | null;
  notificationPrefs: NotificationPrefs | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Wallet {
  id: string;
  userId: string;
  name: string;
  type: WalletType;
  startingBalance: number;
  createdAt: Date;
}

export interface WalletWithBalance extends Wallet {
  currentBalance: number;
}

export interface Transaction {
  id: string;
  userId: string;
  walletId: string;
  amount: number;
  signedAmount: number;
  type: TransactionType;
  merchant: string | null;
  category: string;
  status: TransactionStatus;
  source: TransactionSource;
  rawInput: string | null;
  aiConfidence: number | null;
  metadata: Record<string, unknown> | null;
  transactionDate: Date;
  createdAt: Date;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  amountLimit: number;
  period: BudgetPeriod;
  rollover: boolean;
  createdAt: Date;
}

export interface BudgetWithStatus extends Budget {
  spent: number;
  remaining: number;
  percentage: number;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date | null;
  status: GoalStatus;
  createdAt: Date;
}

export interface GoalWithProjection extends Goal {
  projectedDate: Date | null;
  weeklyTarget: number;
}

export interface CompanionMemory {
  id: string;
  userId: string;
  type: MemoryType;
  key: string;
  value: unknown;
  confidence: number;
  lastSeen: Date;
  createdAt: Date;
}

export interface AiCheckin {
  id: string;
  userId: string;
  type: CheckinType;
  content: string;
  readAt: Date | null;
  createdAt: Date;
}

export interface IngestionLog {
  id: string;
  userId: string;
  sourceType: IngestionSourceType;
  rawPayload: string;
  status: IngestionStatus;
  errorMessage: string | null;
  createdAt: Date;
}

export interface Reconciliation {
  id: string;
  userId: string;
  walletId: string;
  statedBalance: number;
  computedBalance: number;
  discrepancy: number;
  reconciledAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T> {
  total: number;
  page: number;
  limit: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
