import { create } from 'zustand';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

export type WalletType = 'bank' | 'cash' | 'ewallet';

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  startingBalance: number;
  currentBalance: number;
  createdAt: string;
}

interface CreateWalletData {
  name: string;
  type: WalletType;
  startingBalance?: number;
}

interface WalletState {
  wallets: Wallet[];
  totalBalance: number;
  isLoading: boolean;

  fetchWallets: () => Promise<void>;
  createWallet: (data: CreateWalletData) => Promise<Wallet>;
  updateWallet: (id: string, data: { name?: string; type?: WalletType }) => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;
  invalidateBalance: () => void;
}

export const useWalletStore = create<WalletState>()((set, get) => ({
  wallets: [],
  totalBalance: 0,
  isLoading: false,

  fetchWallets: async () => {
    set({ isLoading: true });
    try {
      const wallets = await apiGet<Wallet[]>('/wallets');
      const totalBalance = wallets.reduce((sum, w) => sum + (w.currentBalance ?? 0), 0);
      set({ wallets, totalBalance, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createWallet: async (data) => {
    const wallet = await apiPost<Wallet>('/wallets', {
      name: data.name,
      type: data.type,
      startingBalance: data.startingBalance ?? 0,
    });
    set((state) => ({
      wallets: [...state.wallets, wallet],
      totalBalance: state.totalBalance + (wallet.currentBalance ?? 0),
    }));
    return wallet;
  },

  updateWallet: async (id, data) => {
    const updated = await apiPut<Wallet>(`/wallets/${id}`, data);
    set((state) => ({
      wallets: state.wallets.map((w) => (w.id === id ? updated : w)),
      totalBalance: state.wallets
        .map((w) => (w.id === id ? updated : w))
        .reduce((s, w) => s + (w.currentBalance ?? 0), 0),
    }));
  },

  deleteWallet: async (id) => {
    await apiDelete(`/wallets/${id}`);
    set((state) => {
      const wallets = state.wallets.filter((w) => w.id !== id);
      return {
        wallets,
        totalBalance: wallets.reduce((s, w) => s + (w.currentBalance ?? 0), 0),
      };
    });
  },

  invalidateBalance: () => {
    get().fetchWallets();
  },
}));
