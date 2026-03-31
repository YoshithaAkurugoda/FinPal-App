import { create } from 'zustand';
import { apiGet, apiPost } from '@/lib/api';

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

  invalidateBalance: () => {
    get().fetchWallets();
  },
}));
