import { create } from 'zustand';
import { apiGet, apiPost } from '@/lib/api';

export interface GoalWithProjection {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  deadline?: string;
  progress: number;
  projectedDate?: string | null;
  createdAt: string;
}

interface RawGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string | null;
  progress?: number;
  projectedDate?: string | Date | null;
  weeklyTarget?: number;
  status: string;
  createdAt: string;
}

function mapGoal(g: RawGoal): GoalWithProjection {
  const target = Number(g.targetAmount);
  const current = Number(g.currentAmount);
  const progress = g.progress ?? (target > 0 ? current / target : 0);
  let projected: string | undefined;
  if (g.projectedDate) {
    projected =
      typeof g.projectedDate === 'string'
        ? g.projectedDate
        : new Date(g.projectedDate).toISOString();
  }
  let deadline: string | undefined;
  if (g.targetDate) {
    deadline =
      typeof g.targetDate === 'string' ? g.targetDate : new Date(g.targetDate).toISOString();
  }
  return {
    id: g.id,
    name: g.name,
    targetAmount: target,
    currentAmount: current,
    currency: 'LKR',
    deadline,
    progress,
    projectedDate: projected,
    createdAt:
      typeof g.createdAt === 'string' ? g.createdAt : new Date(g.createdAt).toISOString(),
  };
}

interface CreateGoalData {
  name: string;
  targetAmount: number;
  deadline?: string;
}

interface ContributeData {
  amount: number;
  walletId: string;
}

interface GoalState {
  goals: GoalWithProjection[];
  isLoading: boolean;

  fetchGoals: () => Promise<void>;
  createGoal: (data: CreateGoalData) => Promise<GoalWithProjection>;
  contribute: (goalId: string, data: ContributeData) => Promise<void>;
}

export const useGoalStore = create<GoalState>()((set) => ({
  goals: [],
  isLoading: false,

  fetchGoals: async () => {
    set({ isLoading: true });
    try {
      const raw = await apiGet<RawGoal[]>('/goals');
      const goals = raw.filter((g) => g.status !== 'archived').map(mapGoal);
      set({ goals, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createGoal: async (data) => {
    const raw = await apiPost<RawGoal>('/goals', {
      name: data.name,
      targetAmount: data.targetAmount,
      targetDate: data.deadline ? new Date(data.deadline).toISOString() : undefined,
    });
    const goal = mapGoal(raw);
    set((state) => ({ goals: [...state.goals, goal] }));
    return goal;
  },

  contribute: async (goalId, data) => {
    const res = await apiPost<{ goal: RawGoal }>(`/goals/${goalId}/contribute`, data);
    const goal = mapGoal(res.goal);
    set((state) => ({
      goals: state.goals.map((g) => (g.id === goalId ? goal : g)),
    }));
  },
}));
