import { create } from 'zustand';
import { apiGet, apiPost, apiPut } from '@/lib/api';

export interface BudgetWithStatus {
  id: string;
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  currency: string;
  period: 'monthly' | 'weekly';
  progress: number;
  createdAt: string;
}

interface RawBudget {
  id: string;
  category: string;
  amountLimit: number;
  spent: number;
  remaining: number;
  percentage: number;
  period: string;
  createdAt: string;
}

function mapBudget(b: RawBudget): BudgetWithStatus {
  const limit = Number(b.amountLimit);
  const spent = Number(b.spent ?? 0);
  return {
    id: b.id,
    category: b.category,
    limit,
    spent,
    remaining: Number(b.remaining ?? Math.max(0, limit - spent)),
    currency: 'LKR',
    period: b.period as 'monthly' | 'weekly',
    progress: limit > 0 ? spent / limit : 0,
    createdAt:
      typeof b.createdAt === 'string' ? b.createdAt : new Date(b.createdAt).toISOString(),
  };
}

interface CreateBudgetData {
  category: string;
  limit: number;
  period?: 'monthly' | 'weekly';
}

interface BudgetState {
  budgets: BudgetWithStatus[];
  isLoading: boolean;
  totalBudget: number;
  totalSpent: number;

  fetchBudgets: () => Promise<void>;
  createBudget: (data: CreateBudgetData) => Promise<void>;
  updateBudget: (id: string, data: Partial<CreateBudgetData>) => Promise<void>;
}

export const useBudgetStore = create<BudgetState>()((set) => ({
  budgets: [],
  isLoading: false,
  totalBudget: 0,
  totalSpent: 0,

  fetchBudgets: async () => {
    set({ isLoading: true });
    try {
      const raw = await apiGet<RawBudget[]>('/budgets');
      const budgets = raw.map(mapBudget);
      const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
      const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
      set({ budgets, totalBudget, totalSpent, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createBudget: async (data) => {
    const created = await apiPost<RawBudget>('/budgets', {
      category: data.category,
      amountLimit: data.limit,
      period: data.period ?? 'monthly',
    });
    const budget = mapBudget(created);
    set((state) => ({
      budgets: [...state.budgets, budget],
      totalBudget: state.totalBudget + budget.limit,
      totalSpent: state.totalSpent + budget.spent,
    }));
  },

  updateBudget: async (id, data) => {
    const body: Record<string, unknown> = {};
    if (data.limit !== undefined) body.amountLimit = data.limit;
    if (data.period !== undefined) body.period = data.period;
    const updated = await apiPut<RawBudget>(`/budgets/${id}`, body);
    const budget = mapBudget(updated);
    set((state) => ({
      budgets: state.budgets.map((b) => (b.id === id ? budget : b)),
    }));
  },
}));
