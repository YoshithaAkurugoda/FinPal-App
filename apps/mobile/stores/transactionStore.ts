import { create } from 'zustand';
import { apiGet, apiPost, apiPatch } from '@/lib/api';

export interface Transaction {
  id: string;
  walletId: string;
  type: 'debit' | 'credit';
  amount: number;
  currency: string;
  merchant: string;
  category: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  source: string;
  confidence?: number;
  createdAt: string;
}

interface RawTx {
  id: string;
  walletId: string;
  type: string;
  amount: unknown;
  merchant: string | null;
  category: string;
  status: string;
  source: string;
  aiConfidence?: unknown;
  transactionDate: string;
  createdAt: string;
}

function mapTransaction(tx: RawTx): Transaction {
  return {
    id: tx.id,
    walletId: tx.walletId,
    type: tx.type as 'debit' | 'credit',
    amount: Number(tx.amount),
    currency: 'LKR',
    merchant: tx.merchant ?? '',
    category: tx.category,
    date: tx.transactionDate,
    status: tx.status as Transaction['status'],
    source: tx.source,
    confidence: tx.aiConfidence != null ? Number(tx.aiConfidence) : undefined,
    createdAt:
      typeof tx.createdAt === 'string' ? tx.createdAt : new Date(tx.createdAt).toISOString(),
  };
}

interface TransactionFilters {
  status?: 'pending' | 'approved' | 'rejected';
  walletId?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

interface AddManualData {
  walletId: string;
  type: 'debit' | 'credit';
  amount: number;
  merchant: string;
  category: string;
  date: string;
}

interface ListResponse {
  items: RawTx[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

interface TransactionState {
  transactions: Transaction[];
  pending: Transaction[];
  isLoading: boolean;
  filters: TransactionFilters;
  hasMore: boolean;

  fetchTransactions: (filters?: TransactionFilters) => Promise<void>;
  fetchPending: () => Promise<void>;
  approveTransaction: (id: string, edits?: Partial<Transaction>) => Promise<void>;
  rejectTransaction: (id: string) => Promise<void>;
  batchApprove: (ids: string[]) => Promise<void>;
  addManual: (data: AddManualData) => Promise<void>;
  setFilters: (filters: TransactionFilters) => void;
}

export const useTransactionStore = create<TransactionState>()((set, get) => ({
  transactions: [],
  pending: [],
  isLoading: false,
  filters: {},
  hasMore: true,

  fetchTransactions: async (filters) => {
    const mergedFilters = { ...get().filters, ...filters };
    set({ isLoading: true, filters: mergedFilters });
    try {
      const data = await apiGet<ListResponse>('/transactions', mergedFilters as Record<string, unknown>);
      const items = (data.items ?? []).map((t) => mapTransaction(t as RawTx));
      set((state) => ({
        transactions:
          mergedFilters.page && mergedFilters.page > 1
            ? [...state.transactions, ...items]
            : items,
        hasMore: data.hasMore ?? false,
        isLoading: false,
      }));
    } catch {
      set({ isLoading: false });
    }
  },

  fetchPending: async () => {
    set({ isLoading: true });
    try {
      const data = await apiGet<ListResponse>('/transactions', {
        status: 'pending',
        limit: 100,
      });
      const items = (data.items ?? []).map((t) => mapTransaction(t as RawTx));
      set({ pending: items, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  approveTransaction: async (id, edits) => {
    try {
      await apiPatch(`/transactions/${id}/approve`, {
        merchant: edits?.merchant,
        category: edits?.category,
        amount: edits?.amount,
      });
      set((state) => ({
        pending: state.pending.filter((t) => t.id !== id),
        transactions: state.transactions.map((t) =>
          t.id === id ? { ...t, ...edits, status: 'approved' as const } : t,
        ),
      }));
    } catch {
      // UI can retry
    }
  },

  rejectTransaction: async (id) => {
    try {
      await apiPatch(`/transactions/${id}/reject`);
      set((state) => ({
        pending: state.pending.filter((t) => t.id !== id),
        transactions: state.transactions.map((t) =>
          t.id === id ? { ...t, status: 'rejected' as const } : t,
        ),
      }));
    } catch {
      // ignore
    }
  },

  batchApprove: async (ids) => {
    try {
      await apiPatch('/transactions/batch-approve', { transactionIds: ids });
      set((state) => ({
        pending: state.pending.filter((t) => !ids.includes(t.id)),
        transactions: state.transactions.map((t) =>
          ids.includes(t.id) ? { ...t, status: 'approved' as const } : t,
        ),
      }));
    } catch {
      // ignore
    }
  },

  addManual: async (data) => {
    set({ isLoading: true });
    try {
      const raw = await apiPost<RawTx>('/transactions', {
        walletId: data.walletId,
        type: data.type,
        amount: data.amount,
        merchant: data.merchant,
        category: data.category,
        transactionDate: data.date,
      });
      const tx = mapTransaction(raw);
      set((state) => ({
        transactions: [tx, ...state.transactions],
        isLoading: false,
      }));
    } catch {
      set({ isLoading: false });
      throw new Error('Failed to add transaction');
    }
  },

  setFilters: (filters) => set({ filters }),
}));
